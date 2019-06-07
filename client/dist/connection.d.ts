/// <reference types="node" />
import { Socket } from "net";
import { ISocks5ConnectInfo } from "../../common";
export declare class Connection {
    inbound: number;
    inboundLastSec: number;
    outbound: number;
    outboundLastSec: number;
    duration: number;
    idle: number;
    count: number;
    id: string;
    address: string;
    private session;
    private log;
    private checkInterval;
    private lastInbound;
    private lastOutbound;
    constructor(address: string);
    pause(): void;
    resume(): void;
    connect(): void;
    refreshSession(): void;
    handle(socket: Socket, info: ISocks5ConnectInfo): void;
    isIdle(): boolean;
    private check;
}
