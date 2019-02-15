import { Socket } from "net";

export interface ISocks5ConnectionInfo {
    srcAddr: string;
    srcPort: number;
    dstAddr: string;
    dstPort: number;
}

export const createSock5 = (port: number, host: string, cb: (info: ISocks5ConnectionInfo, socket: Socket) => void) => {
    const socks = require("sock5");
    const srv = socks.createServer((info: any, accept: any) => {
        const socket = accept(true);
        cb(info, socket);
    });
    srv.listen(port, host, () => {
        console.log(`SOCKS server listening on port ${port}`);
    });
    srv.useAuth(socks.auth.None());
};
