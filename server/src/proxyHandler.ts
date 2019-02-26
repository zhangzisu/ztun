import { createCipheriv, createDecipheriv, scryptSync } from "crypto";
import debug = require("debug");
import { ServerHttp2Stream } from "http2";
import { connect } from "net";
import { config, ISocks5ConnectInfo } from "../../common";

const PASSWORD = scryptSync(config.password, "salt", 32);

export const proxyHandler = (stream: ServerHttp2Stream, iv: Buffer, info: ISocks5ConnectInfo) => {
    const cipher = createCipheriv("aes-256-cfb", PASSWORD, iv);
    const decipher = createDecipheriv("aes-256-cfb", PASSWORD, iv);

    const socket = connect(info.dstPort, info.dstAddr);
    const id = require("uuid/v4")();
    const log = debug("ztun:server:session:" + id);

    const destory = (e: Error) => {
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
