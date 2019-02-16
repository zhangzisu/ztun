import { createCipheriv, createDecipheriv, createHash, randomBytes, scryptSync } from "crypto";
import http2 = require("http2");
import { calcHash, config, encodeInfo, encodeIv, HEADER_HASH, HEADER_INFO, HEADER_IV } from "../../common";
import { createSock5 } from "./socks5";

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const server = config.client.serverAddr;
let client: http2.ClientHttp2Session;

const refreshSession = () => {
    console.log("Refreshing session...");
    client = http2.connect(server);
    client.on("error", (err) => {
        console.error(err);
        refreshSession();
    });
};

refreshSession();

const PASSWORD = scryptSync(config.password, "salt", 32);
const IV_LENGTH = 16;

createSock5(config.client.port, config.client.hostname, (info, socket) => {
    try {
        const iv = randomBytes(IV_LENGTH);

        const stream = client.request({
            [http2.constants.HTTP2_HEADER_METHOD]: http2.constants.HTTP2_METHOD_POST,
            [HEADER_INFO]: encodeInfo(info),
            [HEADER_IV]: encodeIv(iv),
            [HEADER_HASH]: calcHash(iv),
        });
        const cipher = createCipheriv("aes-256-cfb", PASSWORD, iv);
        const decipher = createDecipheriv("aes-256-cfb", PASSWORD, iv);
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
