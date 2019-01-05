import * as axios from "axios";
import { Socket } from "net";
import { log } from "./client/log";
import { config } from "./config";

export interface ISocks5ConnectionInfo {
    srcAddr: string;
    srcPort: number;
    dstAddr: string;
    dstPort: number;
}

export const createServer = async (port: number, host: string, cb: (info: ISocks5ConnectionInfo, socket: Socket) => void) => {
    return new Promise<void>((resolve) => {
        const socks = require("sock5");
        const srv = socks.createServer((info: any, accept: any) => {
            const socket = accept(true);
            cb(info, socket);
        });
        srv.listen(port, host, () => {
            log(`SOCKS server listening on port ${port}`);
            resolve();
        });
        srv.useAuth(socks.auth.None());
    });
};

export const createConnection = (port: number, host: string, cb: (socket: Socket) => void) => {
    const socks = require("sock5");
    socks.connect({ host, port, proxyHost: config.client.socks5.bindHost, proxyPort: config.client.socks5.bindPort, auths: [socks.auth.None()] }, cb);
};

export const createRequest = () => {
    const socks = require("sock5");
    return axios.default.create({
        baseURL: "http://localhost:" + config.client.serverControlPort,
        httpAgent: new socks.HttpAgent({
            proxyHost: config.client.socks5.bindHost,
            proxyPort: config.client.socks5.bindPort,
            auths: [socks.auth.None()],
        }),
        // httpsAgent: new socks.HttpsAgent({
        //     proxyHost: config.client.socks5.bindHost,
        //     proxyPort: config.client.socks5.bindPort,
        //     auths: [socks.auth.None()],
        // }),
    });
};
