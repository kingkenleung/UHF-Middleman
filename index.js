require('dotenv').config()
const net = require('net');
const axios = require('axios').default;

const { createClient } = require('@supabase/supabase-js')
const supabaseUrl = 'https://xhhwmotcpaszmlpkicuy.supabase.co'
const supabaseKey = process.env.SR_KEY
const supabase = createClient(supabaseUrl, supabaseKey)


const port = 20058;
const host = '10.118.208.162'; 
// const host = '10.118.208.175'

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


async function postTags_to_supabase(data) {

  /*  Structure of data
      {
        tags: [
          'E28011002000534C83940199',
          'E28011002000548683AB0199',
          'E28011002000575E83A40199',
          'E28068942000402016C5503D',
          'E28011002000535983930199'
        ],
        timestamp: 1677994796000
      }
  */

  // This time is considered more accurate
  const timestamp = Date.now()
  const timeStr = new Date(timestamp);
  const hktimeStr = timeStr.toLocaleString('en-HK', { timeZone: 'Asia/Hong_Kong' });

  /*  Table Structure
      device_id	session_id	tag_id	tag_number	time
  */
  let values = [];
  for (let tag_id of data.tags) {
    values.push(
      {
        "device_id": "uhf1",
        "session_id": "20230308_1",
        "tag_id": tag_id,
        "timestamp": timestamp
      }
    )
  }

  const { response, error } = await supabase
    .from('uhf_logger')
    .insert(values)
  if (error) {
    console.log(error)
  }
  else {
    console.log("Data is sent just fine!")
  }
}


/* Deprecated
async function postTags(data) {
  // tags[] is an array that contain all tag ids.
  try {
    const res = await axios.post(
      'https://iot.spyc.hk/uhflog',
      data
    )
    console.log(res.data)
  } catch (e) {
    console.log(e)
  }
}
*/

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

        // for (let tag of rfidLog.tags) {
        //   if (allTag.indexOf(tag) != -1)
        //     console.log(`RFID Tag ${allTag.indexOf(tag) + 1} - ${tag} - just walked by!`)
        //   else
        //     console.log(`An unknown tag - ${tag} - just walked by!`)
        // }

        // Time on UHF sensor may not be accurate, so only the tags are posted to PYCnet as array
        postTags_to_supabase(rfidLog)
        // io.emit('data', data.toString());
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

