import debug = require("debug");
import { createSocket } from "dgram";
import { KCP, KCPOutputCallback } from "jskcp";
import { AddressInfo, createConnection, Socket } from "net";
import { config } from "./config";
import { beatMsg, decodeConnectionInfo, decodeMsg, decrypt, encodeConnectionInfo, encodeMsg, encrypt, IConnectionInfo } from "./protocol";

export const socket = createSocket("udp4");

const log = debug("ztun:session");
const verbose = debug("ztun:session:verbose");

interface ISession {
    session: number;
    remoteHost: string;
    remotePort: number;
    upstream: Socket;
    timeoutTimeout: NodeJS.Timeout;
    beatInterval: NodeJS.Timeout;
}

const sessionMap = new Map<number, KCP>();

const send = (buffer: Buffer, port: number, host: string) => {
    socket.send(encrypt(buffer), port, host);
};

const remove = (sid: number, reason: string) => {
    if (sessionMap.has(sid)) {
        const kcp = sessionMap.get(sid);
        const session = kcp.context() as ISession;
        if (session.upstream) {
            session.upstream.end();
        }
        if (session.timeoutTimeout) {
            clearTimeout(session.timeoutTimeout);
        }
        if (session.beatInterval) {
            clearInterval(session.beatInterval);
        }
        kcp.release();
        sessionMap.delete(session.session);
        log("remove", reason, "current", sessionMap.size);
    }
};

const output: KCPOutputCallback = (data, size, context: ISession) => {
    verbose("UDP Output len=" + size);
    clearTimeout(context.timeoutTimeout);
    context.timeoutTimeout = setTimeout(() => remove(context.session, "Timeout"), config.common.timeout);
    send(encodeMsg(context.session, data), context.remotePort, context.remoteHost);
};

const bind = (kcp: KCP, upstream: Socket, chunk?: Buffer) => {
    const session = kcp.context() as ISession;
    log("bind", session.session);
    session.upstream = upstream;
    if (chunk) {
        session.upstream.write(chunk);
    }
    session.upstream.on("data", (data) => {
        verbose("upstream", session.session, "recv data length=" + data.length);
        kcp.send(data);
    });
    session.upstream.on("end", () => {
        if (session.beatInterval) {
            clearInterval(session.beatInterval);
        }
        session.upstream = undefined;
    });
    session.upstream.on("error", (e) => {
        session.upstream.end();
    });
};

const feedConnection = (data: { session: number, chunk: Buffer }) => {
    const kcp = sessionMap.get(data.session);
    const session = kcp.context() as ISession;
    verbose("feed", session.session);
    clearTimeout(session.timeoutTimeout);
    session.timeoutTimeout = setTimeout(() => remove(session.session, "timeout"), config.common.timeout);

    if (data.chunk.length) {
        // Feed kcp
        kcp.input(data.chunk);
        const buffer = kcp.recv();
        if (buffer) {
            if (session.upstream) {
                verbose("upstream send length=" + buffer.length);
                session.upstream.write(buffer);
            } else {
                const connect = decodeConnectionInfo(buffer);
                if (connect) {
                    bind(kcp, createConnection({ host: connect.host, port: connect.port }), connect.chunk);
                } else {
                    return remove(session.session, "invalid_connection");
                }
            }
        }
    }
};

const createSession = (remote: IConnectionInfo, sid: number) => {
    log("createSession", sid);
    const session: ISession = {
        remoteHost: remote.host,
        remotePort: remote.port,
        upstream: undefined,
        session: sid,
        // ended: false,
        timeoutTimeout: undefined,
        beatInterval: undefined,
    };
    const kcp = new KCP(config.common.conv, session);
    kcp.nodelay(config.common.nodelay, config.common.interval, config.common.resend, config.common.nc);
    kcp.setmtu(config.common.mtu);
    kcp.output(output);
    session.timeoutTimeout = setTimeout(() => remove(session.session, "timeout"), config.common.timeout);
    session.beatInterval = setInterval(() => send(beatMsg(session.session), session.remotePort, session.remoteHost), config.common.beat);
    return { session, kcp };
};

let counter = 0;

export const createRemoteSession = (info: IConnectionInfo, remote: IConnectionInfo, upstream: Socket) => {
    ++counter;
    const { session, kcp } = createSession(remote, counter);
    sessionMap.set(session.session, kcp);
    kcp.send(encodeConnectionInfo(info));
    bind(kcp, upstream);
};

export const handleData = (data: { session: number, chunk: Buffer }, rinfo: AddressInfo) => {
    if (!sessionMap.has(data.session)) {
        const { session, kcp } = createSession({ host: rinfo.address, port: rinfo.port }, data.session);
        sessionMap.set(session.session, kcp);
        // leave the session unbinded
    }
    feedConnection(data);
};

socket.on("message", (msg, rinfo) => {
    verbose("UDP Input len=" + msg.length);
    const data = decodeMsg(decrypt(msg));
    if (data) { handleData(data, rinfo); }
});

setInterval(() => {
    sessionMap.forEach((x) => x.update(Date.now()));
}, config.common.interval);
