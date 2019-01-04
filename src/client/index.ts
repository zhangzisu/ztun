import { createCipheriv, createDecipheriv, scryptSync } from "crypto";
import { encodeConnectionInfo } from "../protocol";
import { createSocks5 } from "../socks5";
import { KCPStream } from "./kcpstream";
import { log } from "./log";

const serverContext = {
    address: "127.0.0.1",
    port: 12345,
};

const password = "666233";
const key = scryptSync(password, "salt", 32);
const iv = Buffer.alloc(16, 0);

createSocks5(6666, "localhost", (info, socket) => {
    log(`Connect to ${info.dstAddr}:${info.dstPort}`);
    const stream = new KCPStream(serverContext);
    const cipher = createCipheriv("aes-256-gcm", key, iv);
    cipher.pipe(stream);
    cipher.write(encodeConnectionInfo({ host: info.dstAddr, port: info.dstPort }));
    socket.pipe(cipher);
    stream.pipe(createDecipheriv("aes-256-gcm", key, iv)).pipe(socket);
    socket.on("error", (err) => {
        log(err.message);
        stream.end();
    });
    stream.on("error", (err) => {
        log(err.message);
        socket.end();
    });
});
