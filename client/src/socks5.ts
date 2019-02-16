import { Socket } from "net";
import { ISocks5ConnectInfo } from "../../common";

export const createSock5 = (port: number, host: string, cb: (info: ISocks5ConnectInfo, socket: Socket) => void) => {
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
