/// <reference types="node" />
export declare const FUCK_STR = "FUCKFUL ERROR";
export declare const HEADER_INFO: string;
export declare const HEADER_IV: string;
export declare const HEADER_HASH: string;
export interface ISocks5ConnectInfo {
    srcAddr: string;
    srcPort: number;
    dstAddr: string;
    dstPort: number;
}
export declare const encodeInfo: (info: ISocks5ConnectInfo) => string;
export declare const decodeInfo: (str: string) => any;
export declare const encodeIv: (iv: Buffer) => string;
export declare const decodeIv: (str: string) => Buffer;
export declare const calcHash: (iv: Buffer) => string;
