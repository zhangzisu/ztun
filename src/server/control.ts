import express = require("express");
import { createServer } from "http";
import { config } from "../config";
import { log } from "./log";

export const createControlServer = () => {
    log("controlserver created");

    const app = express();

    app.get("/", (req, res) => {
        res.end("666");
    });

    createServer(app).listen(config.server.controlPort);
};
