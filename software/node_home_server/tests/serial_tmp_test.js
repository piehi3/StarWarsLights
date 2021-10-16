var app = require('express')();
var http = require('http').createServer(app); //require http server, and create server with function handler()
var fs = require('fs'); //require filesystem module
var io = require('socket.io')(http) // require socket.io module and pass the http object

const SerialPort = require('serialport') // required for serial port reading!
const Readline = require('@serialport/parser-readline')

const port = new SerialPort('/dev/ttyACM0' , { 
	baudRate: 9600
} );

const parser = port.pipe(new Readline( { delimiter: '\n' }))

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

io.on('connection', (socket) => {
  console.log('a user connected');
  
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });

});

http.listen(3000, () => {
  console.log('listening on *:3000');
});

// Read the port data
port.on("open", () => {
  console.log('serial port open');
  parser.on('data', (data) => {
    //console.log(data);
    if(data[0]=='T'){
      //console.log(data.slice(3))
      io.emit('measurement', { id : data.slice(0,2) , tmp : data.slice(3) });
    }
  });
});
