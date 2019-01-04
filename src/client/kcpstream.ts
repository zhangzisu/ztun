import { createSocket, Socket } from "dgram";
import { KCP } from "jskcp";
import { Duplex, DuplexOptions } from "stream";
import { log } from "./log";

const interval = 50;

export interface IConnectionInfo {
    host: string;
    port: number;
}

export class KCPStream extends Duplex {
    private client: Socket;
    private kcp: KCP;
    private updateIntervalID: NodeJS.Timeout;
    constructor(serverContext: any, options?: DuplexOptions) {
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
