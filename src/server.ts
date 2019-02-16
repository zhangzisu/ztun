import { readFileSync } from "fs";
import http2 = require("http2");
import { config } from "./config";
import { calcHash, decodeInfo, decodeIv, HEADER_HASH, HEADER_INFO, HEADER_IV } from "./helper";
import { proxyHandler } from "./proxyHandler";
import { requestHandler } from "./requestHandler";

const server = http2.createSecureServer({
    key: readFileSync(config.server.key),
    cert: readFileSync(config.server.cert),
});

server.on("error", (err) => console.error(err));

server.on("stream", (stream, headers) => {
    if (headers[http2.constants.HTTP2_HEADER_METHOD] !== "POST") {
        return requestHandler(stream, headers);
    }
    try {
        const iv = decodeIv(headers[HEADER_IV] as string);
        if (calcHash(iv) !== headers[HEADER_HASH] as string) {
            return requestHandler(stream, headers);
        }
        const info = decodeInfo(headers[HEADER_INFO] as string);
        return proxyHandler(stream, iv, info);
    } catch (e) {
        return requestHandler(stream, headers);
    }
});

server.listen(config.server.port, config.server.hostname);
