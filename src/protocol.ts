import { createCipheriv, createDecipheriv, scryptSync } from "crypto";
import debug = require("debug");
import { config } from "./config";
const log = debug("ztun:protocol");

export enum ConnectionType {
    common = 0x0,
    reserve = 0x1,
    control = 0x2,
}

export interface IConnectionInfo {
    host: string;
    port: number;
    type: ConnectionType;
}

export const encodeConnectionInfo = (info: IConnectionInfo) => {
    log("encode", info);
    // tslint:disable:no-bitwise
    const buffer = Buffer.alloc(256);
    buffer.write(info.host, 0, 253);
    buffer[253] = info.type;
    buffer[254] = info.port & 255;
    buffer[255] = info.port >> 8;
    return buffer;
};

export const decodeConnectionInfo = (info: Buffer) => {
    // tslint:disable:no-bitwise
    const host = info.slice(0, 253).toString().replace(/\0/g, "");
    const type = info[253];
    const port = info[254] | info[255] << 8;
    log("decode", host, port, type);
    return { host, port, type };
};

const key = scryptSync(config.password, "salt", 32);
const iv = Buffer.alloc(16, 0);
export const Cipher = () => createCipheriv("aes-256-gcm", key, iv);
export const Decipher = () => createDecipheriv("aes-256-gcm", key, iv);
