"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
exports.config = {
    password: "123456",
    key: path_1.join(__dirname, "..", "..", "cert", "dev-key.pem"),
    cert: path_1.join(__dirname, "..", "..", "cert", "dev-cert.pem"),
};
//# sourceMappingURL=config.js.map