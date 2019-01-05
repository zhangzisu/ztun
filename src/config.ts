import { join } from "path";
import { log } from "./log";

const configPath = process.env.CONFIG || join(__dirname, "..", "config");
log("load config", configPath);
// tslint:disable-next-line:no-var-requires
export const config = require(configPath);
