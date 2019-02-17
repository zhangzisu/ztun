import express = require("express");
import { api } from "./api";

export const app = express();

app.use("/api", api);
