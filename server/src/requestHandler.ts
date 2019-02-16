import { IncomingHttpHeaders, ServerHttp2Stream } from "http2";
import { config } from "../../common/dist";

export const requestHandler = (stream: ServerHttp2Stream, headers: IncomingHttpHeaders) => {
    for (const handler of config.server.handlers) {
        let can = false;
        for (const conditon of handler.conditions) {
            const keys = Object.keys(conditon);
            for (const key of keys) {
                const reg = conditon[key];
                const str = headers[key];
                if (typeof str === "string") {
                    if (reg.test(str)) { can = true; break; }
                } else {
                    for (const s of str) {
                        if (reg.test(s)) { can = true; break; }
                    }
                    if (can) { break; }
                }
            }
            if (can) { break; }
        }
        if (can) { return handler.handle(stream, headers); }
    }
    stream.respond({
        "content-type": "text/html",
        ":status": 500,
    });
    stream.end("<h1>Internal server error</h1><hr/><pre>powered by ZTUN</pre>");
};
