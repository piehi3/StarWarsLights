fs = require('fs');

class Sensor{

}

class TemperatureHumidity{
    constructor(id,temp,hum,time,socket,save_intervel = 3600000){
        this.id = id;
        this.curr_temp = temp;
        this.curr_hum = hum;

        this.socket = socket;
        this.conneted = true;
        this.server_time = (new Date()).getTime();

        this.temps = [];
        this.hums = [];
        this.times = [];

        this.path = "/home/pi/node_home_server_sensors/data";
        this.save_intervel = save_intervel;
        this.filename = "TempSensor" + this.id;
    }

    onDisconnect(){
        this.conneted = false;
        console.log('user disconnected');
    }

    push_data(new_time){
        this.temps.push(this.curr_temp);
        this.hums.push(this.curr_hum);
        this.times.push(new_time);
        if( new_time - this.server_time > this.save_intervel ){
            console.log(`${this.path}/${this.filename}_${new_time}`);
            this.server_time = new_time;
            var file = fs.createWriteStream(`${this.path}/${this.filename}_${new_time}`);
            file.on('error', function(err) { if (err) return console.log(err); });
            var i;
            for(i = 0; i < this.temps.length; i++){
                file.write( this.times[i] + " " + this.temps[i] + " " + this.hums[i] + '\n');
            }
            file.end();

            this.temps = [];
            this.hums = [];
            this.times = [];
        }
    }

    reciveUpdate(msg){
        if(msg.id == this.id){
            this.curr_temp = msg.temp;
            this.curr_hum = msg.hum;
            console.log(msg);
            return true;
        }
        return false;
    }
}

module.exports = {
    TemperatureHumidity
};