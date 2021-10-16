var bodyParser = require("body-parser");
const express = require('express');//web stuff
const app = require('express')();
const server = require('http').createServer(app);
const path = require('path');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


var Sensor = require('./sensor');
var sensors = []

function containes(list,id){
  for (i = 0; i < list.length; i++) {
    if(list[i].id == id){
      return i;
    }
  }
  return -1;
}

function containes_socket(list,socket){
  for (i = 0; i < list.length; i++) {
    if(list[i].socket == socket){
      return i;
    }
  }
  return -1;
}

const io = require('socket.io')(server);
//const WebSocket = require('ws');
//const io = new WebSocket.Server({ server });

app.use(express.static(path.join(__dirname, 'public')));

io.on('error', () => console.log('errored'));

var last_time = (new Date()).getTime();
const delta_T = 100;

io.on('connection', (socket) => {
    socket.on('error', () => console.log('errored'));
    var address = socket.handshake.address;
    /******* when server receives messsage from client trigger function with argument message *****/
    socket.on('message',(msg) =>{
      console.log(msg);
      var new_id = msg["ESP8266DTH11"];
      if(new_id != 0){
        var s_index = containes(sensors,new_id);//conatied index
        if(s_index == -1){
          var sen = new Sensor.TemperatureHumidity(new_id,-273,-273,0,socket);
          sensors.push(sen);
        }else{
          socket.emit("connected",new_id);
        }
      }
    });

    socket.on('disconnect', function(){
        console.log("lost one client");
        var s_index = containes_socket(sensors,socket);
        if(s_index != -1){
          sensors.splice(s_index, 1);
        }
        
    });

    socket.on('data', (msg) =>{
      var new_time = (new Date()).getTime();
      if(new_time - last_time < delta_T)
        return;
      last_time = new_time;
      var i = containes_socket(sensors, socket);
      if(i != -1){
        if(sensors[i].reciveUpdate(msg)){
          sensors[i].push_data(new_time);//saves the data to the data buffer
        }
      }
    });

    console.log("new client connected:"+address);
});

server.listen(3001);

//-----------------------------------------
//cleanup

process.on('exit', function () {
	console.log("Exiting Gacefully");
});
