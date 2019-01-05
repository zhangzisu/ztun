import { createCipheriv, createDecipheriv, scryptSync } from "crypto";
import { config } from "../config";
import { createRemoteSession } from "../sessionmanager";
import { createServer } from "../socks5";
import { log, verbose } from "./log";

export const createSocks5Server = async () => {
    const serverContext = {
        address: config.client.serverHost,
        port: config.client.serverPort,
    };

    await createServer(config.client.socks5.bindPort, config.client.socks5.bindHost, (info, socket) => {
        verbose(`Connect to ${info.dstAddr}:${info.dstPort}`);
        createRemoteSession({ host: info.dstAddr, port: info.dstPort }, { host: config.server.bindHost, port: config.server.bindPort }, socket);
    });

    log("Socks5Server created");
};
