const net = require('net');
const axios = require('axios').default;
const io = require('socket.io')(3000);



const pycnetAPIKey = "f59l28c0mKU8BBHFVL2UZ3SMf23J3U7oFkYooOn5CdPSaq4NQZmdZPcrEFh6zJFVGVYKye0Y9fb1ebt9hS4XgmmIdFUh9xyrRs6HlJdHh4yQIY88XVBAzSi3yg9X1lWLdR0GWu2cNSNx2KYWxdIv7FKVViUuhtgN62OxfrJL4SNfL7h4zrN361NCeJ1IequuTA9N25MiMZlLCviMQ6t4bUfX5U4VLFcPny2nfcvziEGnem3PZZUbLspEjpRPYEz2"

const port = 20058;
const host = '10.118.208.175';

// Create a TCP server to receive packets
const server = net.createServer();

// This will be fetched from PYCnet API
const allTag = [
  'E28068942000501F8568A937', 'E28068942000401F8568A137', 'E28068942000401F85689D37', 'E28068942000501F85689937', 'E280689420004024C8120DFD'
]

server.listen(port, host, () => {
  console.log('TCP Server is running on port ' + port + '.');
});

let sockets = [];

async function postTags(tags) {
  // tags[] is an array that contain all tag ids.
  try {
    const res = await axios.post('https://iot.spyc.hk/fordebug', { message: tags.join(), remarks: "UHF Middle Man Test" })
    console.log(res.data)
  } catch (e) {
    console.log(e)
  }
}

server.on('connection', (sock) => {
  console.log('CONNECTED: ' + sock.remoteAddress + ':' + sock.remotePort);
  sockets.push(sock);

  // A buffer for assembling packets together into a valid JSON
  let packet_buffer = "";

  // A flag to indicate whether the server has cleared the congested packets and entered the normal stage
  let started = false;

  sock.on('data', async (data) => {
    // '{"PacketCount":' marks the start of a JSON string
    if (data.includes('{"PacketCount":')) {

      try {
        started = true
        const rawTCPObj = JSON.parse(`${packet_buffer}`);
        const rfidLog = {
          tags: rawTCPObj.tag.split(','),
          timestamp: Date.parse(rawTCPObj.createTime)
        }
        console.log(rfidLog)
        // console.log("\n" + rawTCPObj.createTime)

        for (let tag of rfidLog.tags) {
          if (allTag.indexOf(tag) != -1)
            console.log(`RFID Tag ${allTag.indexOf(tag) + 1} - ${tag} - just walked by!`)
          else
            console.log(`An unknown tag - ${tag} - just walked by!`)
        }

        // Time on UHF sensor may not be accurate, so only the tags are posted to PYCnet as array
        postTags(rfidLog.tags)
        io.emit('data', data.toString());
      }
      catch (e) {
        console.log(`${data}`)
        // console.log("Clearing congested packets...", e)
      }

      // clear packet buffer
      packet_buffer = "";
    }
    if (started) {
      packet_buffer = packet_buffer + data;
    }
  });


  // Add a 'close' event handler to this instance of socket
  sock.on('close', function (data) {
    let index = sockets.findIndex(function (o) {
      return o.remoteAddress === sock.remoteAddress && o.remotePort === sock.remotePort;
    })
    if (index !== -1) sockets.splice(index, 1);
    console.log('CLOSED: ' + sock.remoteAddress + ' ' + sock.remotePort);
  });
});


// Handle socket.io connections
io.on('connection', (socket) => {
  console.log('Socket.io client connected');

  // Handle incoming data from socket.io client
  socket.on('data', (data) => {
    console.log('Received data:', data);

    // Do something with the data
  });

  // Handle client disconnection
  socket.on('disconnect', () => {
    console.log('Socket.io client disconnected');
  });
});