import { Socket } from "net";
import { config } from "./config";
import { log, verbose } from "./log";
import { createRemoteSession } from "./sessionmanager";

export interface ISocks5ConnectionInfo {
    srcAddr: string;
    srcPort: number;
    dstAddr: string;
    dstPort: number;
}

export const createServer = (port: number, host: string, cb: (info: ISocks5ConnectionInfo, socket: Socket) => void) => {
    const socks = require("sock5");
    const srv = socks.createServer((info: any, accept: any) => {
        const socket = accept(true);
        cb(info, socket);
    });
    srv.listen(port, host, () => {
        log(`SOCKS server listening on port ${port}`);
    });
    srv.useAuth(socks.auth.None());
};

export const createSocks5Server = async () => {
    await createServer(config.socks5.bindPort, config.socks5.bindHost, (info, socket) => {
        verbose(`Connect to ${info.dstAddr}:${info.dstPort}`);
        createRemoteSession({ host: info.dstAddr, port: info.dstPort }, { host: config.connect.host, port: config.connect.port }, socket);
    });

    log("Socks5Server created");
};
