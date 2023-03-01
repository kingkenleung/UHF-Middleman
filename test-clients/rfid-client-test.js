var net = require("net");

var client = new net.Socket();
client.connect(8080, "192.168.128.85", function () {
  console.log("Connected");
  client.write('{"PacketCount": "0"}')
});

client.on("data", function (data) {
  console.log("Received: " + data);
  client.destroy(); // kill client after server's response
});

client.on("close", function () {
  console.log("Connection closed");
});

// send data whenever user presses Enter key
process.stdin.resume();
process.stdin.setEncoding("utf8");

process.stdin.on("data", function () {
  console.log("sending.");
  client.write(`{"PacketCount": "665", "deviceMac": "218600307212","uuid": "00000000000000000000","deviceVersion": "V8.01CSKY_M27_P628V5_HBZ02","tag": "E280689400004024C8120DFD,E280689400004024C8120DFD","dataType": "0","createTime": "2023-02-27 18:05:08"}`);
});
