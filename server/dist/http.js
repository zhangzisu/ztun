"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const http2 = require("http2");
const common_1 = require("../../common");
const proxyHandler_1 = require("./proxyHandler");
const requestHandler_1 = require("./requestHandler");
const { HTTP2_HEADER_METHOD } = http2.constants;
exports.server = http2.createSecureServer({
    key: fs_1.readFileSync(common_1.config.key),
    cert: fs_1.readFileSync(common_1.config.cert),
    allowHTTP1: true,
}, (req, res) => {
    if (req.httpVersion === "2.0") {
        if (req.headers[HTTP2_HEADER_METHOD] !== "POST") {
            return requestHandler_1.requestHandler(req, res);
        }
        try {
            const iv = common_1.decodeIv(req.headers[common_1.HEADER_IV]);
            if (common_1.calcHash(iv) !== req.headers[common_1.HEADER_HASH]) {
                return requestHandler_1.requestHandler(req, res);
            }
            const info = common_1.decodeInfo(req.headers[common_1.HEADER_INFO]);
            return proxyHandler_1.proxyHandler(req.stream, iv, info);
        }
        catch (e) {
            return requestHandler_1.requestHandler(req, res);
        }
    }
    else {
        return requestHandler_1.requestHandler(req, res);
    }
});
exports.server.on("error", (err) => console.error(err));
//# sourceMappingURL=http.js.map