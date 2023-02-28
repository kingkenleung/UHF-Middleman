const net = require('net');
const port = 20058;
const host = '10.118.210.10';
const server = net.createServer();
const allTag = ['E28068942000501F8568A937', 'E28068942000401F8568A137', 'E28068942000401F85689D37', 'E28068942000501F85689937', 'E280689420004024C8120DFD']


server.listen(port, host, () => {
    console.log('TCP Server is running on port ' + port + '.');
});

let sockets = [];

const packetHead = 'PacketCount';


server.on('connection', (sock) => {
    console.log('CONNECTED: ' + sock.remoteAddress + ':' + sock.remotePort);
    sockets.push(sock);

    let tmp = '{"PacketCount": "0"}';
    let started = false;
    sock.on('data', (data) => {
        if (data.includes('{"PacketCount":')) {
            started = true
            try {
                const rawTCPObj = JSON.parse(`${tmp}`);
                const rfidLog = {
                    tags: rawTCPObj.tag.split(','),
                    timestamp: Date.parse(rawTCPObj.createTime)
                }
                // console.log(rfidLog)
                console.log("\n" + rawTCPObj.createTime)
                for (let tag of rfidLog.tags) {
                    if (allTag.indexOf(tag) != -1)
                        console.log(`RFID Tag ${allTag.indexOf(tag) + 1} just walked by!`)
                    else
                        console.log(`An unknown tag - ${tag} - just walked by!`)
                }

            }
            catch (e) {
                console.log(e)
            }

            tmp = "";
        }
        if (started) {
            tmp = tmp + data;
        }

        // console.log('DATA ' + sock.remoteAddress + ': ' + data);
        // Write the data back to all the connected, the client will receive it as data from the server
        /*
        sockets.forEach((sock, index, array) => {
            sock.write(sock.remoteAddress + ':' + sock.remotePort + " said " + data + '\n');
        });
        */
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