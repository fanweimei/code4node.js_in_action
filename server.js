var http = require('http');
var fs = require('fs');
var path = require('path');
var mime = require('mime');
var cache = {};

//发送文件数据及错误相应
function send404(res){
  res.writeHead(404,{'Content-Type':'text/plain'});
  res.write('Error 404: resource not found.');
  res.end();
}
function sendFile(res,fillPath,fileContents){
  res.writeHead(200,{'Content-Type': mime.lookup(path.basename(fillPath))});
  res.end(fileContents);
}
//提供静态文件服务
function serveStatic(res,cache,absPath){
  if(cache[absPath]){
    sendFile(res,absPath,cache[absPath]);
  }else {
    fs.exists(absPath,function(exists){
      if(exists){
        fs.readFile(absPath,function(err,data){
          if(err){
            send404(res);
          }else{
            cache[absPath] = data;
            sendFile(res,absPath,data);
          }
        });
      }else {
        send404(res);
      }
    });
  }
}

//创建HTTP服务器的逻辑
var server = http.createServer(function(req,res){
  var filePath = false;
  if(req.url == '/'){
    filePath = 'public/index.html';
  }else {
    filePath = 'public'+req.url;
  }
  var absPath = './'+filePath;
  serveStatic(res,cache,absPath);
});
server.listen(3000,function(){
  console.log('sever listening on port 3000.');
});

//设置Socket.IO服务器
var chatServer = require('./lib/chat_server');
chatServer.listen(server);
