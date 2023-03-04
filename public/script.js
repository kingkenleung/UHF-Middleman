const socket = io.connect();

socket.on('greet', (data) => {
    console.log("Web socket has been established.")
});

socket.on('data', (data) => {
    console.log(data)
})