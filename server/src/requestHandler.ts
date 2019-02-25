import connect = require("connect");

export const requestHandler = connect();

requestHandler.use((req: any, res: any, next: any) => {
    res.setHeader("X-Powered-By", "ztun-connect");
    res.setHeader("Server", "ztun-node-http");
    return next();
});
