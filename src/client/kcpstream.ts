import { createSocket, Socket } from "dgram";
import { KCP } from "jskcp";
import { Duplex, DuplexOptions } from "stream";
import { log } from "./log";

const interval = 10;

export interface IConnectionInfo {
    host: string;
    port: number;
}

const encodeConnectionInfo = (info: IConnectionInfo) => {
    log("encodeConnectionInfo", info);
    // tslint:disable:no-bitwise
    const buffer = Buffer.alloc(256);
    buffer.write(info.host, 0, 254);
    buffer[254] = info.port & 255;
    buffer[255] = info.port >> 8;
    return buffer;
};

export class KCPStream extends Duplex {
    private client: Socket;
    private kcp: KCP;
    private updateIntervalID: NodeJS.Timeout;
    constructor(connectionInfo: IConnectionInfo, serverContext: any, options?: DuplexOptions) {
        super(options);
        this.client = createSocket("udp4");
        this.kcp = new KCP(666, serverContext);
        this.kcp.nodelay(1, interval, 2, 1);
        this.kcp.output((data, size, context) => this.client.send(data, 0, size, context.port, context.address));
        this.updateIntervalID = setInterval(() => {
            this.kcp.update(Date.now());
        }, interval);
        this.client.on("message", (msg) => this.feed(msg));
        this.client.on("error", (err) => {
            log(err.stack);
            this.emit("error");
            this.end();
        });
        this.kcp.send(encodeConnectionInfo(connectionInfo));
        log("New KCPClient created");
    }
    public _write(chunk: any, encoding: string, callback: (error?: Error | null) => void) {
        log("KCPClient write data length = " + chunk.length);
        this.kcp.send(chunk);
        callback();
    }
    public _final(callback: (error?: Error | null) => void) {
        clearInterval(this.updateIntervalID);
        this.kcp.release();
        this.client.close();
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
