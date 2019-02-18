import express = require("express");
import { join } from "path";
import { api } from "./api";

export const app = express();

app.use("/api", api);

const UIRoot = join(__dirname, "..", "web", "dist");
app.use(express.static(UIRoot));
app.get("*", (req, res) => {
    res.sendFile(join(UIRoot, "index.html"));
});
