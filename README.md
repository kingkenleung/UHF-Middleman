# module/
## ws-server.js
This provides a websocket server that allows the frontend to communicate with the backend.

# test-clients/
## ws-client-test.js
This is a test client that can be used to test the websocket server and log the tags received.

## rfid-client-test.js
This is a test client that can be used to simulate the RFID reader and send tags to the websocket server.

# root/
## rfid.js 
This is the main backend script that receives tags from the RFID reader and sends them to the websocket server.

# test-frontend/
This directory contains a simple frontend that can be used to test the websocket server.