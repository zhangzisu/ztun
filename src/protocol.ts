import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "crypto";
import debug = require("debug");
import { config } from "./config";
const log = debug("ztun:protocol");

export const decodeMsg = (msg: Buffer) => {
    if (!msg || msg.length < 4) {
        return undefined;
    } else {
        const session = msg.slice(0, 4).readUInt32LE(0);
        const chunk = msg.slice(4);
        return { session, chunk };
    }
};

export const encodeMsg = (session: number, data: Buffer) => {
    const header = Buffer.allocUnsafe(4);
    header.writeUInt32LE(session, 0);
    return Buffer.concat([header, data]);
};

export const beatMsg = (session: number) => {
    const header = Buffer.allocUnsafe(4);
    header.writeUInt32LE(session, 0);
    return header;
};

export interface IConnectionInfo {
    host: string;
    port: number;
    command?: number;
}

export const encodeConnectionInfo = (info: IConnectionInfo) => {
    log("encode", info);
    // tslint:disable:no-bitwise
    const buffer = Buffer.alloc(256);
    buffer.write(info.host, 0, 250);
    if (info.command) {
        buffer.writeUInt32LE(info.command, 250);
    }
    buffer.writeUInt16LE(info.port, 254);
    return buffer;
};

export const decodeConnectionInfo = (info: Buffer) => {
    // tslint:disable:no-bitwise
    if (info.length < 256) { return undefined; }
    const host = info.slice(0, 250).toString().replace(/\0/g, "");
    const command = info.readUInt32LE(250);
    const port = info.readUInt16LE(254);
    log("decode", host, port);
    return { host, port, command, chunk: info.slice(256) };
};

const key = scryptSync(config.password, "salt", 32);
export const encrypt = (buffer: Buffer) => {
    const iv = randomBytes(16);
    const cipher = createCipheriv("aes-256-cfb", key, iv);
    const result = Buffer.concat([iv, cipher.update(buffer), cipher.final()]);
    return result;
};
export const decrypt = (buffer: Buffer) => {
    const iv = buffer.slice(0, 16);
    const decipher = createDecipheriv("aes-256-cfb", key, iv);
    const result = Buffer.concat([decipher.update(buffer.slice(16)), decipher.final()]);
    return result;
};
