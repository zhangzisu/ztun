const generateID = () => {
    return 0;
};

import { createSocket } from "dgram";
import { KCP, KCPOutputCallback } from "jskcp";
import { Duplex, DuplexOptions } from "stream";
import { config } from "../config";
import { parseMsg } from "../protocol";
import { verbose } from "./log";

export const server = createSocket("udp4");

interface IConnectionContext {
    session: number;
    host: string;
    port: number;
    updateInterval: number;
}

const map = new Map<number, KCP>();

server.on("message", (msg, rinfo) => {
    const result = parseMsg(msg);
    if (result) {
        if (result.session) {
            //
        } else {
            //
        }
    }
});
