import { KCP, KCPOutputCallback } from "jskcp";
import { Duplex, DuplexOptions } from "stream";
import { config } from "../config";
import { verbose } from "./log";

export class KCPStream extends Duplex {
    private kcp: KCP;
    private updateIntervalID: NodeJS.Timeout;
    constructor(firstBuffer: Buffer, clientContext: any, output: KCPOutputCallback, options?: DuplexOptions) {
        super(options);
        this.kcp = new KCP(config.common.conv, clientContext);
        this.kcp.nodelay(config.common.nodelay, config.common.interval, config.common.resend, config.common.nc);
        this.kcp.output(output);
        this.updateIntervalID = setInterval(() => {
            this.kcp.update(Date.now());
        }, config.common.interval);
        this.feed(firstBuffer);
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
        callback();
    }
    // tslint:disable-next-line:no-empty
    public _read(size: number) { }
    public feed(data: Buffer) {
        verbose("KCPClient feed data length = " + data.length);
        this.kcp.input(data);
        const buffer = this.kcp.recv();
        if (buffer) {
            this.push(buffer);
        }
    }
}
