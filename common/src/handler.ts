import { IncomingHttpHeaders, ServerHttp2Stream } from "http2";

export type Condition = {
    [key in keyof IncomingHttpHeaders]: RegExp
};

export interface IHandler {
    conditions: Condition[];
    handle(stream: ServerHttp2Stream, headers: IncomingHttpHeaders): any;
}
