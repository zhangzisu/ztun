"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const path_1 = require("path");
const api_1 = require("./api");
exports.app = express();
exports.app.use("/api", api_1.api);
const UIRoot = path_1.join(__dirname, "..", "web", "dist");
exports.app.use(express.static(UIRoot));
exports.app.get("*", (req, res) => {
    res.sendFile(path_1.join(UIRoot, "index.html"));
});
//# sourceMappingURL=web.js.map