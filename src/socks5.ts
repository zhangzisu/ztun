import { Socket } from "net";
import { log } from "./client/log";

export interface ISocks5ConnectionInfo {
    srcAddr: string;
    srcPort: number;
    dstAddr: string;
    dstPort: number;
}

export const createSocks5 = (port: number, host: string, cb: (info: ISocks5ConnectionInfo, socket: Socket) => void) => {
    const socks = require("socksv5");
    const srv = socks.createServer((info: any, accept: any) => {
        const socket = accept(true);
        cb(info, socket);
    });
    srv.listen(port, host, () => {
        log(`SOCKS server listening on port ${port}`);
    });
    srv.useAuth(socks.auth.None());
};
