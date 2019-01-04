import { createSocket } from "dgram";
import { createConnection } from "net";
import { createInterface } from "readline";
import { config } from "../config";
import { Cipher, ConnectionType, Decipher, decodeConnectionInfo } from "../protocol";
import { KCPStream } from "./kcpstream";
import { log, verbose } from "./log";

log("server started");

export const server = createSocket("udp4");

const generateID = (context: any) => `${context.address}:${context.port}`;
const StreamMap = new Map<string, KCPStream>();

const handleControlMessage = (cid: string, message: string) => {
    log(`[${cid}]: ${message}`);
};

const handleControlClose = (cid: string) => {
    log(`[${cid}] closed`);
};

server.on("message", (msg, rinfo) => {
    verbose("UDPServer recv", msg.length);
    const context = { address: rinfo.address, port: rinfo.port };
    const cid = generateID(context);
    if (StreamMap.has(cid)) {
        StreamMap.get(cid).feed(msg);
    } else {
        const stream = new KCPStream(msg, context, (data, size, con) => server.send(data, 0, size, con.port, con.address));
        const decipher = Decipher();
        stream.pipe(decipher);
        decipher.once("data", (chunk: Buffer) => {
            if (chunk.length < 256) {
                stream.end();
                return;
            }
            const info = decodeConnectionInfo(chunk.slice(0, 256));
            if (info.type === ConnectionType.common) {
                const data = chunk.slice(256);
                const socket = createConnection(info);
                socket.write(data);
                socket.pipe(Cipher()).pipe(stream);
                decipher.pipe(socket);
                socket.on("error", (err) => {
                    log(err.message);
                    stream.end();
                });
                stream.on("error", (err) => {
                    log(err.message);
                    socket.end();
                });
            } else if (info.type === ConnectionType.control) {
                const readline = createInterface(decipher);
                const cipher = Cipher();
                cipher.pipe(stream);
                readline.on("line", (input) => handleControlMessage(cid, input));
                readline.on("close", () => handleControlClose(cid));
                stream.on("error", (err) => {
                    log(err.message);
                    handleControlClose(cid);
                });
            } else if (info.type === ConnectionType.reserve) {
                //
            }
        });
    }
});

server.bind(config.server.bindPort, config.server.bindHost);
