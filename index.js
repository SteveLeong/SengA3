var express = require('express');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;

let userList = [];
let msgHistory = [];

http.listen( port, function () {
    console.log('listening on port', port);
});

app.use(express.static(__dirname + '/public'));

// listen to 'chat' messages
io.on('connection', function(socket){
    socket.username = setUser();
    socket.color = "#86c232"
    userList.push(socket.username);
    updateCurrUsers(userList);
    socket.emit('username', "Your username is " + socket.username)
    socket.on('chat', function(msg){
        let time = getTime();

        let msgFormat = "<div>" + time + " <span style=\"color: " + socket.color + ";\">" + socket.username + "</span>" + ": " + msg + "</div>"

        if (msg.startsWith("/nick ")){
            let oldNick = socket.username;
            let newNick = msg.replace('/nick ', '');

            if(userList.includes(newNick)){
                socket.emit('username','This nickname is already be taken.');
            }else{
                // Remove the old username from the list of online users
                let index = userList.indexOf(socket.username);
                if (index > -1) {
                    userList.splice(index, 1, newNick);
                }
                socket.username = newNick;
                // Send message to sender
                socket.emit('chat',("<b>" + time + " You have successfully changed your nickname to " + "<span style=\"color: " + socket.color + ";\">" + socket.username + "</span>" + "." + "</b>"));
                // Send message to everyone else
                socket.broadcast.emit('chat',("<b>" + time + " " + oldNick + " has changed their nickname to " + "<span style=\"color: " + socket.color + ";\">" + socket.username + "</span>" + "." + "</b>"));
                // Update the list of online users
                updateCurrUsers(userList);
            }
            
        }else if(msg.startsWith("/nickcolor ")){
            let newColor = msg.replace('/nickcolor ', '');
            socket.color = "#" + newColor;
            socket.emit('chat',("<b>" + time + " You have successfully changed your nickname color to " + "<span style=\"color: " + socket.color + ";\">" + socket.username + "</span>" + "." + "</b>"));
        }else {

            socket.emit('chat', ("<b>" + msgFormat + "</b>"));
            socket.broadcast.emit('chat', msgFormat);
            
            //if (msgHistory.length <= 200){

            //}
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