"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = require("crypto");
const http2_1 = require("http2");
const config_1 = require("./config");
exports.FUCK_STR = "FUCKFUL ERROR";
exports.HEADER_INFO = http2_1.constants.HTTP2_HEADER_COOKIE;
exports.HEADER_IV = http2_1.constants.HTTP2_HEADER_AUTHORIZATION;
exports.HEADER_HASH = http2_1.constants.HTTP2_HEADER_ETAG;
exports.encodeInfo = (info) => {
    const json = JSON.stringify(info);
    const buffer = Buffer.from(json);
    const base64 = buffer.toString("base64");
    return `SID=${base64}`;
};
exports.decodeInfo = (str) => {
    if (str.length < 4) {
        throw new Error(exports.FUCK_STR);
    }
    const base64 = str.substr(4);
    const buffer = Buffer.from(base64, "base64");
    const json = buffer.toString();
    return JSON.parse(json);
};
exports.encodeIv = (iv) => {
    const base64 = iv.toString("base64");
    return `Bear ${base64}`;
};
exports.decodeIv = (str) => {
    if (str.length < 5) {
        throw new Error(exports.FUCK_STR);
    }
    const base64 = str.substr(5);
    return Buffer.from(base64, "base64");
};
exports.calcHash = (iv) => {
    return crypto_1.scryptSync(iv, config_1.config.password, 32).toString("base64");
};
//# sourceMappingURL=helper.js.map