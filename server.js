const express = require('express');
const path = require('path');
const http = require('http');
const socketIO = require('socket.io');
require("dotenv").config()

const port = process.env.PORT || 3000
const app = express();
const server = http.createServer(app);
const io = socketIO(server)

server.listen(port);

app.use(express.static(path.join(__dirname, 'public')));

let connectedUsers = [];

io.on('connection', (socket) => {
    console.log("Conexão detectada...");
    socket.broadcast.emit('list-update', {
        joined: username,
        list: connectedUsers
    })
    socket.on('join-request', (username) => {
        socket.username = username;
        connectedUsers.push(username);
        console.log(connectedUsers);
        socket.emit('userOk', connectedUsers);
        socket.broadcast.emit('list-update', {
            joined: username,
            list: connectedUsers
        })
    });

    socket.on('disconnect', () => {
        connectedUsers = connectedUsers.filter(u => u != socket.username);
        console.log(connectedUsers);

        socket.broadcast.emit('list-update', {
            left: socket.username,
            list: connectedUsers
        })
    })

    socket.on('message-req', (data) => {
        console.log(data)
        let obj = {
            type: data.type,
            user: data.user,
            msg: data.msg
        }
        
        socket.broadcast.emit('message', obj)
    })

});