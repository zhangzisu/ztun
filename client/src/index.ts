import { random } from "lodash";
import { config } from "../../common";
import { Connection } from "./connection";
import { createSock5 } from "./socks5";
import { app } from "./web";

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

export const connections = [...Array(config.client.parallel)].map(() => new Connection(config.client.serverAddr));

createSock5(config.client.port, config.client.hostname, (info, socket) => {
    try {
        const connection = connections[random(connections.length - 1)];
        connection.handle(socket, info);
    } catch (e) {
        console.log(e);
    }
});

app.listen(65056, () => {
    console.log("Web UI Located at http://localhost:65056");
});
