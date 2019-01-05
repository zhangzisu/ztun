import debug = require("debug");
import { createServer } from "net";
import { config } from "./config";
import { encodeConnectionInfo } from "./protocol";
import { createRemoteSession, createSession, generateSessionID } from "./sessionmanager";

const log = debug("ztun:reserveproxy");

interface IProxyInfo {
    remoteHost: string;
    remotePort: number;
    forwardHost: string;
    forwardPort: number;
}

const proxyMap = new Map<string, IProxyInfo>();

export const handleReverseProxy = (listenHost: string, listenPort: number, remoteHost: string, remotePort: number, forwardHost: string, forwardPort: number) => {
    const pid = `${listenHost}:${listenPort}`;
    log("register", pid, forwardHost, forwardPort);
    if (!proxyMap.has(pid)) {
        createServer((socket) => {
            const proxy = proxyMap.get(pid);
            createRemoteSession({ host: proxy.forwardHost, port: proxy.forwardPort }, { host: proxy.remoteHost, port: proxy.remotePort }, socket);
        }).listen(listenPort, listenHost);
    }
    proxyMap.set(pid, { remoteHost, remotePort, forwardHost, forwardPort });
};

export const registerReserveProxy = () => {
    for (const rule of config.reverseProxy) {
        const { session, kcp } = createSession({ host: config.connect.host, port: config.connect.port }, generateSessionID());
        kcp.send(Buffer.concat([
            encodeConnectionInfo({ host: rule.remoteHost, port: rule.remotePort, command: 1 }),
            encodeConnectionInfo({ host: rule.localHost, port: rule.localPort }),
        ]));
    }
};
