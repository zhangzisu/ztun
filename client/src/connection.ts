import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "crypto";
import debug = require("debug");
import { ClientHttp2Session, connect, constants } from "http2";
import { random } from "lodash";
import { Socket } from "net";
import { calcHash, config, encodeInfo, encodeIv, HEADER_HASH, HEADER_INFO, HEADER_IV, ISocks5ConnectInfo } from "../../common";
import { StreamCounter } from "./streamcounter";

const IV_LENGTH = 16;
const PASSWORD = scryptSync(config.password, "salt", 32);
const MAX_DURATION = 15 * 60;
const MAX_IDLE = 10;

export class Connection {
    public inbound = 0;
    public inboundLastSec = 0;
    public outbound = 0;
    public outboundLastSec = 0;
    public duration = 0;
    public idle = 0;
    public count = 0;
    public id: string;
    public address: string;

    private session: ClientHttp2Session;
    private log: debug.Debugger;
    private checkInterval: NodeJS.Timeout;
    private lastInbound = 0;
    private lastOutbound = 0;

    constructor(address: string) {
        const uuidv4 = require("uuid/v4");
        this.id = uuidv4();
        this.log = debug("ztun:client:session:" + this.id);
        this.address = address;
        this.checkInterval = setInterval(() => this.check(), 1000);
    }
    public pause() {
        if (this.session && !this.session.closed) {
            this.log("closing session");
            this.session.close();
        }
    }
    public resume() {
        if (this.isIdle()) {
            this.log("resuming session");
            this.connect();
        }
    }
    public connect() {
        this.duration = 0;
        this.session = connect(this.address);
        this.session.on("error", (e) => {
            this.log(e.message);
            this.refreshSession();
        });
    }
    public refreshSession() {
        this.log("refreshing session");
        this.pause();
        this.connect();
    }
    public handle(socket: Socket, info: ISocks5ConnectInfo) {
        this.resume();
        this.log(`Handle ${info.dstAddr}:${info.dstPort}`);
        this.count++;

        const iv = randomBytes(IV_LENGTH);

        const stream = this.session.request({
            [constants.HTTP2_HEADER_METHOD]: constants.HTTP2_METHOD_POST,
            [HEADER_INFO]: encodeInfo(info),
            [HEADER_IV]: encodeIv(iv),
            [HEADER_HASH]: calcHash(iv),
        });
        const cipher = createCipheriv("aes-256-cfb", PASSWORD, iv);
        const decipher = createDecipheriv("aes-256-cfb", PASSWORD, iv);

        let closed = false;
        const tryEnd = () => {
            if (!closed) {
                closed = true;
                this.count--;
            }
        };

        socket.pipe(cipher).pipe(new StreamCounter((x) => this.outbound += x)).pipe(stream);
        stream.pipe(new StreamCounter((x) => this.inbound += x)).pipe(decipher).pipe(socket);
        socket.on("error", (e) => {
            this.log(e.message);
            stream.end();
            tryEnd();
        });
        stream.on("error", (e) => {
            this.log(e.message);
            socket.end();
            tryEnd();
        });
        socket.on("end", () => tryEnd());
        stream.on("end", () => tryEnd());
    }
    public isIdle() {
        return !this.session || this.session.closed;
    }
    private check() {
        this.inboundLastSec = this.inbound - this.lastInbound;
        this.outboundLastSec = this.outbound - this.lastOutbound;
        this.lastInbound = this.inbound;
        this.lastOutbound = this.outbound;
        if (!this.isIdle()) {
            if (this.count) {
                this.idle = 0;
            } else {
                this.idle++;
            }
            if (this.idle >= MAX_IDLE) {
                this.pause();
                return;
            }
            this.duration++;
            if (random(0, (MAX_DURATION - this.duration) * (MAX_DURATION - this.duration)) === 0) {
                this.refreshSession();
            }
        }
    }
}
