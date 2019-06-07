/// <reference types="node" />
import { Socket } from "net";
import { ISocks5ConnectInfo } from "../../common";
import { Connection } from "./connection";
export declare let connections: Connection[];
export declare const createHandler: (parallel: number, serverAddr: string) => (info: ISocks5ConnectInfo, socket: Socket) => void;
