// Websocket server

const WebSocket = require("ws");

class LapCounterWsServer {
  constructor() {
    this.wss = new WebSocket.Server({ port: 8081 });

    this.wss.on("connection", function connection(ws) {
      ws.on("message", function incoming(message) {
        console.log("received: %s", message);
      });

      ws.send("something");
    });
  }

  sendTags(tags) {
    this.wss.clients.forEach(function each(client) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(tags);
      }
    });
  }
}


module.exports = {LapCounterWsServer}
// export default
