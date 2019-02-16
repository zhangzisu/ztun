import { scryptSync } from "crypto";
import { constants } from "http2";
import { config } from "./config";

export const FUCK_STR = "FUCKFUL ERROR";

export const HEADER_INFO = constants.HTTP2_HEADER_COOKIE;
export const HEADER_IV = constants.HTTP2_HEADER_AUTHORIZATION;
export const HEADER_HASH = constants.HTTP2_HEADER_ETAG;

export interface ISocks5ConnectInfo {
    srcAddr: string;
    srcPort: number;
    dstAddr: string;
    dstPort: number;
}

export const encodeInfo = (info: ISocks5ConnectInfo) => {
    const json = JSON.stringify(info);
    const buffer = Buffer.from(json);
    const base64 = buffer.toString("base64");
    return `SID=${base64}`;
};

export const decodeInfo = (str: string) => {
    if (str.length < 4) { throw new Error(FUCK_STR); }
    const base64 = str.substr(4);
    const buffer = Buffer.from(base64, "base64");
    const json = buffer.toString();
    return JSON.parse(json);
};

export const encodeIv = (iv: Buffer) => {
    const base64 = iv.toString("base64");
    return `Bear ${base64}`;
};

export const decodeIv = (str: string) => {
    if (str.length < 5) { throw new Error(FUCK_STR); }
    const base64 = str.substr(5);
    return Buffer.from(base64, "base64");
};

export const calcHash = (iv: Buffer) => {
    return scryptSync(iv, config.password, 32).toString("base64");
};
