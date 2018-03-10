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
    socket.color = "#86c232"    // default color
    userList.push(socket.username);
    updateCurrUsers(userList);

    /** CHAT LOG HISTORY 
     *  History only remembers regular messages and nickname changes
    */
    for (let i=0; i<msgHistory.length; i++){
        socket.emit('chat', msgHistory[i]);
    }

    // Welcome message for all new users
    socket.emit('chat', ("<b> <span style=\"font-size: 20px;\"> Welcome To The Seng513 Chatroom! </span> </b>"))
    socket.emit('username', "Your username is " + socket.username)

    socket.on('chat', function(msg){
        let time = getTime();
        let msgFormat = "<div>" + time + " <span style=\"color: " + socket.color + ";\">" + socket.username + "</span>" + ": " + msg + "</div>"

        /** CHANGE NICKNAME */
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
                let nickChangeMsg = time + " " + oldNick + " has changed their nickname to " + "<span style=\"color: " + socket.color + ";\">" + socket.username + "</span>" + "."
                socket.broadcast.emit('chat', nickChangeMsg);
                // Update the list of online users
                updateCurrUsers(userList);
                // Save to message history
                updateHistory(nickChangeMsg);
            }
        /** CHANGE NICKNAME COLOR */
        }else if(msg.startsWith("/nickcolor ")){ // If color does not exist it returns to default
            let newColor = msg.replace('/nickcolor ', '');
            socket.color = "#" + newColor;
            socket.emit('chat',("<b>" + time + " You have successfully changed your nickname color to " + "<span style=\"color: " + socket.color + ";\">" + socket.username + "</span>" + "." + "</b>"));
        }else{  // Regular message
            /** BOLD MESSAGES */
            socket.emit('chat', ("<b>" + msgFormat + "</b>"));
            socket.broadcast.emit('chat', msgFormat);
            updateHistory(msgFormat);
        }
    });

    // When a user disconnects their username is removed from the list of online users
    socket.on('disconnect', function(){
        let index = userList.indexOf(socket.username);
            if (index > -1) {
                userList.splice(index, 1);
            }
    });
});

/** TIME STAMPS */
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

/** Format for time stamps */
function addZero(n){
    if (n < 10){
        n = "0" + n
    }
    return n;
}

/** UNIQUE USERNAMES */
function setUser(){
    do{
    let usernumber = Math.floor((Math.random() * 100) + 1);
    name = 'User' + usernumber
    }while(userList.includes(name))
    return name;
}

/** Send updated list of online users to all users */
function updateCurrUsers(list){
    io.emit('userList', list);
}

/** Updates the Chat Log History
 *  remembers at most the last 250 messages
 */
function updateHistory(msg){
    if (msgHistory.length < 250){
        msgHistory.push(msg);
    }else{
        msgHistory.shift();
        msgHistory.push(msg);
    }
}