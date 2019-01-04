import { createSocket, Socket } from "dgram";
import { KCP } from "jskcp";
import { Duplex, DuplexOptions } from "stream";
import { config } from "../config";
import { log, verbose } from "./log";

export class KCPStream extends Duplex {
    private client: Socket;
    private kcp: KCP;
    private updateIntervalID: NodeJS.Timeout;
    constructor(serverContext: any, options?: DuplexOptions) {
        super(options);
        this.client = createSocket("udp4");
        this.kcp = new KCP(config.common.conv, serverContext);
        this.kcp.nodelay(config.common.nodelay, config.common.interval, config.common.resend, config.common.nc);
        this.kcp.output((data, size, context) => this.client.send(data, 0, size, context.port, context.address));
        this.updateIntervalID = setInterval(() => {
            this.kcp.update(Date.now());
        }, config.common.interval);
        this.client.on("message", (msg) => this.feed(msg));
        this.client.on("error", (err) => {
            log(err.stack);
            this.emit("error");
            this.end();
        });
        verbose("New KCPClient created");
    }
    public _write(chunk: any, encoding: string, callback: (error?: Error | null) => void) {
        verbose("KCPClient write data length = " + chunk.length);
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
        verbose("KCPClient feed data length = " + data.length);
        this.kcp.input(data);
        const buffer = this.kcp.recv();
        if (buffer) {
            this.push(buffer);
        }
    }
}
