"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = require("crypto");
const debug = require("debug");
const http2_1 = require("http2");
const lodash_1 = require("lodash");
const common_1 = require("../../common");
const common_2 = require("../../common");
const IV_LENGTH = 16;
const PASSWORD = crypto_1.scryptSync(common_1.config.password, "salt", 32);
const MAX_DURATION = 15 * 60;
const MAX_IDLE = 10;
class Connection {
    constructor(address) {
        this.inbound = 0;
        this.inboundLastSec = 0;
        this.outbound = 0;
        this.outboundLastSec = 0;
        this.duration = 0;
        this.idle = 0;
        this.count = 0;
        this.lastInbound = 0;
        this.lastOutbound = 0;
        this.id = require("uuid/v4")();
        this.log = debug("ztun:client:session:" + this.id);
        this.address = address;
        this.checkInterval = setInterval(() => this.check(), 1000);
    }
    pause() {
        if (this.session && !this.session.closed) {
            this.log("closing session");
            this.session.close();
        }
    }
    resume() {
        if (this.isIdle()) {
            this.log("resuming session");
            this.connect();
        }
    }
    connect() {
        this.duration = 0;
        this.session = http2_1.connect(this.address);
        this.session.on("error", (e) => {
            this.log(e.message);
            this.refreshSession();
        });
    }
    refreshSession() {
        this.log("refreshing session");
        this.pause();
        this.connect();
    }
    handle(socket, info) {
        this.resume();
        this.log(`Handle ${info.dstAddr}:${info.dstPort}`);
        this.count++;
        const iv = crypto_1.randomBytes(IV_LENGTH);
        const stream = this.session.request({
            [http2_1.constants.HTTP2_HEADER_METHOD]: http2_1.constants.HTTP2_METHOD_POST,
            [common_1.HEADER_INFO]: common_1.encodeInfo(info),
            [common_1.HEADER_IV]: common_1.encodeIv(iv),
            [common_1.HEADER_HASH]: common_1.calcHash(iv),
        });
        const cipher = crypto_1.createCipheriv("aes-256-cfb", PASSWORD, iv);
        const decipher = crypto_1.createDecipheriv("aes-256-cfb", PASSWORD, iv);
        let closed = false;
        const tryEnd = () => {
            if (!closed) {
                closed = true;
                this.count--;
            }
        };
        socket.pipe(cipher).pipe(new common_2.StreamCounter((x) => this.outbound += x)).pipe(stream);
        stream.pipe(new common_2.StreamCounter((x) => this.inbound += x)).pipe(decipher).pipe(socket);
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
    isIdle() {
        return !this.session || this.session.closed;
    }
    check() {
        this.inboundLastSec = this.inbound - this.lastInbound;
        this.outboundLastSec = this.outbound - this.lastOutbound;
        this.lastInbound = this.inbound;
        this.lastOutbound = this.outbound;
        if (!this.isIdle()) {
            if (this.count) {
                this.idle = 0;
            }
            else {
                this.idle++;
            }
            if (this.idle >= MAX_IDLE) {
                this.pause();
                return;
            }
            this.duration++;
            if (lodash_1.random(0, (MAX_DURATION - this.duration) * (MAX_DURATION - this.duration)) === 0) {
                this.refreshSession();
            }
        }
    }
}
exports.Connection = Connection;
//# sourceMappingURL=connection.js.map