import { createCipheriv, createDecipheriv, scryptSync } from "crypto";
import http2 = require("http2");
import { connect } from "net";
import { config } from "./config";
import { decodeInfo, decodeIv, HEADER_INFO, HEADER_IV } from "./helper";

const server = http2.createServer();

server.on("error", (err) => console.error(err));

// tslint:disable-next-line: no-var-requires
const PASSWORD = scryptSync(config.password, "salt", 32);

server.on("stream", (stream, headers) => {
    try {
        const info = decodeInfo(headers[HEADER_INFO] as string);
        const iv = decodeIv(headers[HEADER_IV] as string);

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
    } catch (e) {
        console.log(e.message);
    }
});

server.listen(config.server.port, config.server.hostname);
