import debug = require("debug");
import { createSocket } from "dgram";
import { KCP, KCPOutputCallback } from "jskcp";
import MersenneTwister = require("mersenne-twister");
import { AddressInfo, createConnection, Socket } from "net";
import { config } from "./config";
import { beatMsg, decodeConnectionInfo, decodeMsg, decrypt, encodeConnectionInfo, encodeMsg, encrypt, IConnectionInfo } from "./protocol";
import { handleReverseProxy } from "./reverseproxy";

export const socket = createSocket("udp4");

const log = debug("ztun:session");
const verbose = debug("ztun:session:verbose");

interface ISession {
    session: number;
    remoteHost: string;
    remotePort: number;
    upstream: Socket;
    timeoutInterval: NodeJS.Timeout;
    beatInterval: NodeJS.Timeout;
    updateInterval: NodeJS.Timeout;
    inboundCount: number;
    outboundCount: number;
    lastInboundCount: number;
    lastOutboundCount: number;
}

const sessionMap = new Map<number, KCP>();
const sessionGenerator = new MersenneTwister();

export const generateSessionID = () => {
    let x = sessionGenerator.random_int();
    while (sessionMap.has(x)) { x = sessionGenerator.random_int(); }
    return x;
};

const send = (buffer: Buffer, port: number, host: string) => {
    socket.send(encrypt(buffer), port, host);
};

const remove = (sid: number, reason: string) => {
    if (sessionMap.has(sid)) {
        const kcp = sessionMap.get(sid);
        const session = kcp.context() as ISession;
        if (session.upstream) {
            session.upstream.end();
            session.upstream = undefined;
        }
        if (session.timeoutInterval) {
            clearInterval(session.timeoutInterval);
            session.timeoutInterval = undefined;
        }
        if (session.beatInterval) {
            clearInterval(session.beatInterval);
            session.beatInterval = undefined;
        }
        if (session.updateInterval) {
            clearInterval(session.updateInterval);
            session.updateInterval = undefined;
        }
        kcp.release();
        sessionMap.delete(session.session);
        log("remove", reason, "current", sessionMap.size);
        log("inbound", session.inboundCount, "outbound", session.outboundCount);
    }
};

const output: KCPOutputCallback = (data, size, context: ISession) => {
    send(encodeMsg(context.session, data), context.remotePort, context.remoteHost);
};

const bind = (kcp: KCP, upstream: Socket, chunk?: Buffer) => {
    const session = kcp.context() as ISession;
    log("bind", session.session);
    // upstream.__session = session.session;
    session.upstream = upstream;
    if (chunk) {
        session.outboundCount += chunk.length;
        session.upstream.write(chunk);
    }
    session.beatInterval = setInterval(() => send(beatMsg(session.session), session.remotePort, session.remoteHost), config.common.beat);
    session.upstream.on("data", (data) => {
        // verbose("upstream", session.session, "recv data length=" + data.length);
        kcp.send(data);
        session.inboundCount += data.length;
        if (kcp.waitsnd() > 2 * config.common.sndwnd) {
            verbose("upstream paused");
            session.upstream.pause();
        }
    });
    session.upstream.on("end", () => {
        if (session.beatInterval) {
            clearInterval(session.beatInterval);
            session.beatInterval = undefined;
        }
        session.upstream = undefined;
    });
    session.upstream.on("error", (e) => {
        if (session.upstream) {
            session.upstream.end();
        }
    });
};

const feedConnection = (data: { session: number, chunk: Buffer }) => {
    const kcp = sessionMap.get(data.session);
    const session = kcp.context() as ISession;
    // verbose("feed", session.session);

    if (data.chunk.length) {
        // Feed kcp
        kcp.input(data.chunk);
        const buffer = kcp.recv();
        if (buffer) {
            if (session.upstream) {
                // verbose("upstream send length=" + buffer.length);
                session.upstream.write(buffer);
                session.outboundCount += buffer.length;
            } else {
                const connect = decodeConnectionInfo(buffer);
                if (connect) {
                    if (connect.command === 0) {
                        return bind(kcp, createConnection({ host: connect.host, port: connect.port }), connect.chunk);
                    } else if (connect.command === 1) {
                        const forward = decodeConnectionInfo(connect.chunk);
                        if (forward) {
                            return handleReverseProxy(connect.host, connect.port, session.remoteHost, session.remotePort, forward.host, forward.port);
                        }
                    }
                }
                return remove(session.session, "invalid_connection");
            }
        }
    }
};

export const createSession = (remote: IConnectionInfo, sid: number) => {
    log("createSession", sid);
    const session: ISession = {
        remoteHost: remote.host,
        remotePort: remote.port,
        upstream: undefined,
        session: sid,
        // ended: false,
        timeoutInterval: undefined,
        beatInterval: undefined,
        updateInterval: undefined,
        inboundCount: 0,
        outboundCount: 0,
        lastInboundCount: 0,
        lastOutboundCount: 0,
    };
    const kcp = new KCP(config.common.conv, session);
    kcp.nodelay(config.common.nodelay, config.common.interval, config.common.resend, config.common.nc);
    kcp.setmtu(config.common.mtu);
    kcp.wndsize(config.common.sndwnd, config.common.rcvwnd);
    kcp.output(output);
    session.timeoutInterval = setInterval(() => {
        const deltaInbound = session.inboundCount - session.lastInboundCount - kcp.waitsnd();
        const deltaOutbound = session.outboundCount - session.lastOutboundCount;
        verbose("timeoutCheck", deltaInbound, deltaOutbound);
        if (!deltaInbound && !deltaOutbound) {
            remove(session.session, "timeout");
        } else {
            session.lastInboundCount = session.inboundCount - kcp.waitsnd();
            session.lastOutboundCount = session.outboundCount;
        }
    }, config.common.timeout);
    session.updateInterval = setInterval(() => {
        kcp.update(Date.now());
        if (session.upstream && session.upstream.isPaused() && kcp.waitsnd() <= 2 * config.common.sndwnd) {
            session.upstream.resume();
        }
    }, config.common.interval);
    sessionMap.set(session.session, kcp);
    return { session, kcp };
};

export const createRemoteSession = (info: IConnectionInfo, remote: IConnectionInfo, upstream: Socket) => {
    const { session, kcp } = createSession(remote, generateSessionID());
    kcp.send(encodeConnectionInfo(info));
    bind(kcp, upstream);
};

export const handleData = (data: { session: number, chunk: Buffer }, rinfo: AddressInfo) => {
    if (!sessionMap.has(data.session)) {
        createSession({ host: rinfo.address, port: rinfo.port }, data.session);
    }
    feedConnection(data);
};

socket.on("message", (msg, rinfo) => {
    // verbose("UDP Input len=" + msg.length);
    const data = decodeMsg(decrypt(msg));
    if (data) { handleData(data, rinfo); }
});
