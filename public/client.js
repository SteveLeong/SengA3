let myNick;

// shorthand for $(document).ready(...)
$(function() {
    var socket = io();

    $('form').submit(function(){
        socket.emit('chat', $('#m').val());
        $('#m').val('');
        return false;
    });

    socket.on('chat', function(msg){

        if(msg.startsWith('Your username is ')){
            myNick = msg.replace('Your username is ', '');
        }

        // https://stackoverflow.com/questions/18614301/keep-overflow-div-scrolled-to-bottom-unless-user-scrolls-up
        var messages = document.getElementById('messages')
        var isScrolledToBottom = messages.scrollHeight - messages.clientHeight <= messages.scrollTop + 1;
        //console.log(messages.scrollHeight - messages.clientHeight,  messages.scrollTop + 1);
        $('#messages').append($('<li>' + msg));

        
        if(isScrolledToBottom)
            messages.scrollTop = messages.scrollHeight - messages.clientHeight;

    });

    socket.on('username', function(name){
        $('#messages').append($('<li>').text(name));
    });

    socket.on('userList', function(list){
        $('#names > li').remove();
        for (let i=0; i<list.length; i++){
            $('#names').append($('<li>').text(list[i]))
        }
    });
});


    
