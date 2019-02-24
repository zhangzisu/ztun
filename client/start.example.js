const { createHandler, app } = require(".")

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"

const handler = createHandler(4, "https://localhost:1081")
const socks = require("sock5")
const srv = socks.createServer((info, accept) => {
    const socket = accept(true)
    handler(info, socket)
})
srv.listen(1079, "localhost", () => {
    console.log(`SOCKS server listening on port 1079`)
})
srv.useAuth(socks.auth.None())

app.listen(65056, () => {
    console.log("Web UI Located at http://localhost:65056")
})
