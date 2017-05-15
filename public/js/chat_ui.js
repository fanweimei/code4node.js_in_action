
//在用户界面中显示消息及可用房间
function disEscapedContentElement(message){
  return $('<div></div>').text(message);
}

function disSystemContentElement(message){
  return $('<div></div>').html('<i>'+message+'</i>');
}

//处理原始的用户输入
function processUserInput(chatApp,socket){
  var message = $('#send-message').val();
  var systemMessage;
  if(message.charAt(0) == '/'){
    systemMessage = chatApp.processCommand(message);
    if(systemMessage){
      $('#messages').append(disSystemContentElement(systemMessage));
    }
  }else {
    chatApp.sendMessage($('#room').text(),message);
    $('#messages').append(disEscapedContentElement(message));
    $('#messages').scrollTop($('#messages').prop('scrollHeight'));
  }
  $('#send-message').val('');
}

//客户端程序初始化逻辑
var socket = io.connect();
$(document).ready(function(){
  var chatApp = new Chat(socket);
  socket.on('nameResult',function(result){
    var message;
    if(result.success){
      message = 'You are now known as '+result.name+'.';
    }else {
      message = result.message;
    }
    $('#messages').append(disSystemContentElement(message));
  });
  socket.on('joinResult',function(result){
    $('#room').text(result.room);
    $('#messages').append(disSystemContentElement('Room changes'));
  });
  socket.on('message',function(message){
    var newElement = $('<div></div>').text(message.text);
    $('#messages').append(newElement);
  });
  socket.on('rooms',function(rooms){
    $('#room-list').empty();
    for(var i=0; i<rooms.length; i++){
      $('#room-list').append(disEscapedContentElement(rooms[i]));
    }
    $('#room-list div').click(function(){
      chatApp.processCommand('/join '+$(this).text());
    //  $('#send-message').focus();
    });
  });
  setInterval(function(){
    socket.emit('rooms');
  },1000);
  $('#send-message').focus();
  $('#send-bottom').click(function(){
    processUserInput(chatApp,socket);
    return false;
  });
});
