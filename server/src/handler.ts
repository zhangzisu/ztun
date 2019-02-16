import { existsSync, pathExistsSync, statSync } from "fs-extra";
import { IncomingHttpHeaders, ServerHttp2Stream } from "http2";
import { join } from "path";
import { IHandler } from "../../common";

export class StaticFileHandler implements IHandler {
    public conditions = [
        {
            ":method": /GET/i,
        },
    ];
    private path: string;
    constructor(path: string) {
        if (!pathExistsSync(path)) { throw new Error("Path not found"); }
        this.path = path;
    }
    public handle(stream: ServerHttp2Stream, headers: IncomingHttpHeaders) {
        const path = join(this.path, headers[":path"]);
        if (!existsSync(path)) {
            stream.respond({
                "content-type": "text/html",
                ":status": 404,
            });
            stream.end("<h1>Not found</h1><hr/><pre>powered by ZTUN</pre>");
            return;
        }
        const stat = statSync(path);
        if (stat.isFile()) {
            return stream.respondWithFile(path);
        }
        if (stat.isDirectory()) {
            stream.respond({
                "content-type": "text/html",
                ":status": 200,
            });
            stream.end("<h1>Directory is not listed.</h1><hr/><pre>powered by ZTUN</pre>");
        }
    }
}
