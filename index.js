var express = require('express');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;

let userList = [];



http.listen( port, function () {
    console.log('listening on port', port);
});

app.use(express.static(__dirname + '/public'));

// listen to 'chat' messages
io.on('connection', function(socket){
    socket.username = setUser();
    userList.push(socket.username);
    updateCurrUsers(userList);
    socket.emit('chat', 'Your username is ' + socket.username)
    socket.on('chat', function(msg){
        let time = getTime();
        io.emit('chat', time + ' ' + socket.username + ': ' + msg);

        if (msg.startsWith("/nick ")){
            newNick = msg.replace('/nick ', '')

            if(userList.includes(newNick)){
                socket.emit('chat','This nickname is already be taken.');
            }else{
                let index = userList.indexOf(socket.username);
                if (index > -1) {
                    userList.splice(index, 1, newNick);
                }
                socket.username = newNick;
            }
            updateCurrUsers(userList)
        }
    });

    socket.on('disconnect', function(){
        let index = userList.indexOf(socket.username);
            if (index > -1) {
                userList.splice(index, 1);
            }
    });

});



function getTime(){
    let now = new Date();
    let timeFormat = [
    addZero(now.getHours()),
    ':',
    addZero(now.getMinutes()),
    ':',
    addZero(now.getSeconds())
    ].join('');
    return timeFormat;
}

function addZero(n){
    if (n < 10){
        n = "0" + n
    }
    return n;
}

function setUser(){
    do{
    let usernumber = Math.floor((Math.random() * 100) + 1);
    name = 'User' + usernumber
    }while(userList.includes(name))
    return name;
}

function checkUsername(){

}

function updateCurrUsers(list){
    io.emit('userList', list);
}