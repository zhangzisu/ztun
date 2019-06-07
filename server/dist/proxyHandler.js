"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = require("crypto");
const debug = require("debug");
const net_1 = require("net");
const common_1 = require("../../common");
const PASSWORD = crypto_1.scryptSync(common_1.config.password, "salt", 32);
exports.proxyHandler = (stream, iv, info) => {
    const cipher = crypto_1.createCipheriv("aes-256-cfb", PASSWORD, iv);
    const decipher = crypto_1.createDecipheriv("aes-256-cfb", PASSWORD, iv);
    const socket = net_1.connect(info.dstPort, info.dstAddr);
    const id = require("uuid/v4")();
    const log = debug("ztun:server:session:" + id);
    const destory = (e) => {
        log(e.message);
        stream.destroy();
        socket.destroy();
    };
    let closed = false;
    const close = () => {
        if (socket.destroyed && stream.destroyed && !closed) {
            closed = true;
            log("ended");
        }
    };
    log("created");
    socket
        .once("close", close)
        .once("error", destory)
        .pipe(cipher)
        .once("error", destory)
        .pipe(stream);
    stream
        .once("close", close)
        .once("error", destory)
        .pipe(decipher)
        .once("error", destory)
        .pipe(socket);
};
//# sourceMappingURL=proxyHandler.js.map