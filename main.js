const http = require('http')
const WebSocketServer = require("ws").Server
const express = require('express')
const ecstatic = require('ecstatic')

const app = express();
app.use(ecstatic({
    root: __dirname,
    cache: 0,
    gzip: true,
    showDotFiles: false,
}))

const httpServer = http.createServer(app).listen(80)
const wsServer = new WebSocketServer({server: httpServer})

wsServer.on('connection', (ws) => {
    ws.on('message', function(msg) {
        console.log("msg", msg)
    })
})

console.log("pibot server started")
