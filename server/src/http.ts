import { readFileSync } from "fs";
import http2 = require("http2");
import { calcHash, config, decodeInfo, decodeIv, HEADER_HASH, HEADER_INFO, HEADER_IV } from "../../common";
import { proxyHandler } from "./proxyHandler";
import { requestHandler } from "./requestHandler";

const { HTTP2_HEADER_METHOD } = http2.constants;

export const server = http2.createSecureServer({
    key: readFileSync(config.key),
    cert: readFileSync(config.cert),
    allowHTTP1: true,
}, (req: any, res: any) => {
    if (req.httpVersion === "2.0") {
        if (req.headers[HTTP2_HEADER_METHOD] !== "POST") {
            return requestHandler(req, res);
        }
        try {
            const iv = decodeIv(req.headers[HEADER_IV] as string);
            if (calcHash(iv) !== req.headers[HEADER_HASH] as string) {
                return requestHandler(req, res);
            }
            const info = decodeInfo(req.headers[HEADER_INFO] as string);
            return proxyHandler(req.stream, iv, info);
        } catch (e) {
            return requestHandler(req, res);
        }
    } else {
        return requestHandler(req, res);
    }
});

server.on("error", (err) => console.error(err));
