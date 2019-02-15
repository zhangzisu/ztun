import http2 = require("http2");
import { ISocks5ConnectionInfo } from "./sock5";

export const HEADER_INFO = http2.constants.HTTP2_HEADER_COOKIE;
export const HEADER_IV = http2.constants.HTTP2_HEADER_AUTHORIZATION;

export const encodeInfo = (info: ISocks5ConnectionInfo) => {
    const json = JSON.stringify(info);
    const buffer = Buffer.from(json);
    const base64 = buffer.toString("base64");
    return `SID=${base64}`;
};

export const decodeInfo = (str: string) => {
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
    const base64 = str.substr(5);
    return Buffer.from(base64, "base64");
};
