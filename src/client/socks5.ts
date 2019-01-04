import { createCipheriv, createDecipheriv, scryptSync } from "crypto";
import { config } from "../config";
import { Cipher, ConnectionType, Decipher, encodeConnectionInfo } from "../protocol";
import { createSocks5 } from "../socks5";
import { KCPStream } from "./kcpstream";
import { log } from "./log";

export const createSocks5Server = () => {
    const serverContext = {
        address: config.client.serverHost,
        port: config.client.serverPort,
    };

    createSocks5(config.client.socks5.bindPort, config.client.socks5.bindHost, (info, socket) => {
        log(`Connect to ${info.dstAddr}:${info.dstPort}`);
        const stream = new KCPStream(serverContext);
        const cipher = Cipher();
        cipher.pipe(stream);
        cipher.write(encodeConnectionInfo({ host: info.dstAddr, port: info.dstPort, type: ConnectionType.common }));
        socket.pipe(cipher);
        stream.pipe(Decipher()).pipe(socket);
        socket.on("error", (err) => {
            log(err.message);
            stream.end();
        });
        stream.on("error", (err) => {
            log(err.message);
            socket.end();
        });
    });

    log("Socks5Server created");
};
