"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = require("lodash");
const connection_1 = require("./connection");
exports.connections = [];
exports.createHandler = (parallel, serverAddr) => {
    exports.connections.length = 0;
    for (let i = 0; i < parallel; i++) {
        exports.connections.push(new connection_1.Connection(serverAddr));
    }
    return (info, socket) => {
        try {
            const connection = exports.connections[lodash_1.random(exports.connections.length - 1)];
            connection.handle(socket, info);
        }
        catch (e) {
            console.log(e);
        }
    };
};
//# sourceMappingURL=handler.js.map