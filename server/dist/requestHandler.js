"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const connect = require("connect");
exports.requestHandler = connect();
exports.requestHandler.use((req, res, next) => {
    res.setHeader("X-Powered-By", "ztun-connect");
    res.setHeader("Server", "ztun-node-http");
    return next();
});
//# sourceMappingURL=requestHandler.js.map