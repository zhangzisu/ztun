import { IncomingHttpHeaders, ServerHttp2Stream } from "http2";

export const requestHandler = (stream: ServerHttp2Stream, headers: IncomingHttpHeaders) => {
    stream.respond({
        "content-type": "text/html",
        ":status": 200,
    });
    stream.end("<h1>Hello World</h1>");
};
