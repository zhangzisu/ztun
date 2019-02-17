import { Transform, TransformCallback, TransformOptions } from "stream";

export class StreamCounter extends Transform {
    public update: (length: number) => void;
    constructor(update: (length: number) => void, opts?: TransformOptions) {
        super(opts);
        this.update = update;
    }
    public _transform(chunk: any, encoding: string, callback: TransformCallback) {
        this.update(chunk.length);
        this.push(chunk, encoding);
        callback();
    }
}
