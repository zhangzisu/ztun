/// <reference types="node" />
import { ServerHttp2Stream } from "http2";
import { ISocks5ConnectInfo } from "../../common";
export declare const proxyHandler: (stream: ServerHttp2Stream, iv: Buffer, info: ISocks5ConnectInfo) => void;
