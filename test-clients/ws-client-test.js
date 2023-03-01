// ws client
const WebSocket = require("ws");
class LapCounterTestClient {
  constructor() {
    this.ws = new WebSocket("ws://localhost:8081");
  }

  init(tagsCallback) {
    this.ws.on("open", function open() {
      ws.send("something");
    });

    this.ws.on("message", function incoming(data) {
      // buffer to text
      const text = new TextDecoder("utf-8").decode(data);
      console.log(text);
      tagsCallback(text)
    });

    this.ws.on("close", function close() {
      console.log("disconnected");
    });

    this.ws.on("error", function error() {
      console.log("error");
    });
  }
}

if (require.main === module) {
  new LapCounterTestClient();
}

module.exports = { LapCounterTestClient };
