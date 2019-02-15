import { createCipheriv, createDecipheriv, scryptSync } from "crypto";
import { readFileSync } from "fs";
import http2 = require("http2");
import { connect } from "net";
import { config } from "./config";
import { decodeInfo, decodeIv, FUCK_STR, HEADER_INFO, HEADER_IV } from "./helper";

// tslint:disable-next-line: no-var-requires
const PASSWORD = scryptSync(config.password, "salt", 32);

const server = http2.createSecureServer({
    key: readFileSync(config.server.key),
    cert: readFileSync(config.server.cert),
});

server.on("error", (err) => console.error(err));

server.on("stream", (stream, headers) => {
    try {
        if (headers[http2.constants.HTTP2_HEADER_METHOD] !== "POST") { throw new Error(FUCK_STR); }

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
        if (e.message === FUCK_STR) {
            stream.respond({
                "content-type": "text/html",
                ":status": 200,
            });
            stream.end("<h1>Hello World</h1>");
        }
    }
});

server.listen(config.server.port, config.server.hostname);
