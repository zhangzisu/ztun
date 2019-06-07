"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const stream_1 = require("stream");
class StreamCounter extends stream_1.Transform {
    constructor(update, opts) {
        super(opts);
        this.update = update;
    }
    _transform(chunk, encoding, callback) {
        this.update(chunk.length);
        this.push(chunk, encoding);
        callback();
    }
}
exports.StreamCounter = StreamCounter;
//# sourceMappingURL=streamcounter.js.map