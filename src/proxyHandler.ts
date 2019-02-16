import { createCipheriv, createDecipheriv, scryptSync } from "crypto";
import { ServerHttp2Stream } from "http2";
import { connect } from "net";
import { config } from "./config";
import { ISocks5ConnectionInfo } from "./sock5";

const PASSWORD = scryptSync(config.password, "salt", 32);

export const proxyHandler = (stream: ServerHttp2Stream, iv: Buffer, info: ISocks5ConnectionInfo) => {
    const cipher = createCipheriv("aes-256-cfb", PASSWORD, iv);
    const decipher = createDecipheriv("aes-256-cfb", PASSWORD, iv);

    const socket = connect(info.dstPort, info.dstAddr);
    socket.pipe(cipher).pipe(stream);
    stream.pipe(decipher).pipe(socket);
    socket.on("error", (e) => {
        console.log(e.message);
        stream.end();
    });
    stream.on("error", (e) => {
        console.log(e.message);
        socket.end();
    });
};
