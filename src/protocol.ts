import debug = require("debug");
import { IConnectionInfo } from "./client/kcpstream";
const log = debug("ztun:protocol");

export const encodeConnectionInfo = (info: IConnectionInfo) => {
    log("encodeConnectionInfo", info);
    // tslint:disable:no-bitwise
    const buffer = Buffer.alloc(256);
    buffer.write(info.host, 0, 254);
    buffer[254] = info.port & 255;
    buffer[255] = info.port >> 8;
    return buffer;
};

export const decodeConnectionInfo = (info: Buffer) => {
    // tslint:disable:no-bitwise
    const host = info.slice(0, 254).toString();
    const port = info[254] | info[255] << 8;
    log(`decodeConnectionInfo: ${host}:${port}`);
    return { host, port };
};
