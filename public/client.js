// shorthand for $(document).ready(...)
$(function() {
    var socket = io();
    $('form').submit(function(){
	socket.emit('chat', $('#m').val());
	$('#m').val('');
	return false;
    });
    socket.on('chat', function(msg){
	$('#messages').append($('<li>').text(msg));
    });
    socket.on('userList', function(list){
        $('#names > li').remove();
        for (let i=0; i<list.length; i++){
            $('#names').append($('<li>').text(list[i]))
        }
    });
});
