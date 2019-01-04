import { createSocket, Socket } from "dgram";
import { KCP } from "jskcp";
import { createConnection } from "net";
import { Duplex, DuplexOptions } from "stream";
import { log } from "./log";

const interval = 10;
export const server = createSocket("udp4");

const generateKey = (context: any) => `${context.address}:${context.port}`;
const callbackMap = new Map<string, (data: Buffer) => void>();

const decodeConnectionInfo = (info: Buffer) => {
    // tslint:disable:no-bitwise
    const host = info.slice(0, 254).toString();
    const port = info[254] | info[255] << 8;
    log(`decodeConnectionInfo: ${host}:${port}`);
    return { host, port };
};

server.on("message", (msg, rinfo) => {
    const context = { address: rinfo.address, port: rinfo.port };
    const key = generateKey(context);
    if (callbackMap.has(key)) {
        callbackMap.get(key)(msg);
    } else {
        const stream = new KCPStream(msg, context);
        stream.once("data", (chunk: Buffer) => {
            if (chunk.length < 256) { return; }
            const info = decodeConnectionInfo(chunk.slice(0, 256));
            const data = chunk.slice(256);
            const socket = createConnection(info);
            socket.write(data);
            socket.pipe(stream);
            stream.pipe(socket);
            socket.on("error", (err) => {
                log(err.message);
                stream.end();
            });
            stream.on("error", (err) => {
                log(err.message);
                socket.end();
            });
        });
    }
});

export class KCPStream extends Duplex {
    private kcp: KCP;
    private updateIntervalID: NodeJS.Timeout;
    constructor(firstBuffer: Buffer, clientContext: any, options?: DuplexOptions) {
        super(options);
        const key = generateKey(clientContext);
        if (callbackMap.has(key)) { throw new Error("Context already exists"); }
        this.kcp = new KCP(666, clientContext);
        this.kcp.nodelay(1, interval, 2, 1);
        this.kcp.output((data, size, context) => server.send(data, 0, size, context.port, context.address));
        this.updateIntervalID = setInterval(() => {
            this.kcp.update(Date.now());
        }, interval);
        callbackMap.set(key, (data) => this.feed(data));
        this.feed(firstBuffer);
        log("New KCPClient created");
    }
    public _write(chunk: any, encoding: string, callback: (error?: Error | null) => void) {
        log("KCPClient write data length = " + chunk.length);
        this.kcp.send(chunk);
        callback();
    }
    public _final(callback: (error?: Error | null) => void) {
        const context = this.kcp.context();
        const key = generateKey(context);
        callbackMap.delete(key);
        clearInterval(this.updateIntervalID);
        this.kcp.release();
        callback();
    }
    // tslint:disable-next-line:no-empty
    public _read(size: number) { }
    private feed(data: Buffer) {
        log("KCPClient feed data length = " + data.length);
        this.kcp.input(data);
        const buffer = this.kcp.recv();
        if (buffer) {
            this.push(buffer);
        }
    }
}
