/// <reference types="node" />
import { Transform, TransformCallback, TransformOptions } from "stream";
export declare class StreamCounter extends Transform {
    update: (length: number) => void;
    constructor(update: (length: number) => void, opts?: TransformOptions);
    _transform(chunk: any, encoding: string, callback: TransformCallback): void;
}
