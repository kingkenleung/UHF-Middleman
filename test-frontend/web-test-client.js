// ws client with web websocket api

var socket = new WebSocket("ws://localhost:8081");

socket.onopen = function (event) {
  console.log("Connected");
};

socket.onmessage = function (event) {
  console.log("Received: " + event.data);
  document.getElementById("tags").innerHTML += `<br>${event.data}`;
};
