const N_LEDS = 50;
const LED_CHUNK_SIZE = 1;

function in_bounds(value,min,max){
	return Math.max(Math.min(Math.round(value),max),min);
}

function in_bounds_f(value,min,max){
	return Math.max(Math.min(value,max),min);
}

class WebLights{
    constructor(id,R,G,B,A,start,stop,socket){
        this.id = id;
        this.R = R;
        this.G = G;
        this.B = B;
        this.A = A;
        this.start = start;

        if(stop == -1){
            this.stop = N_LEDS;
        }else{
            this.stop = stop;
        }

        this.socket = socket;
        this.conneted = true;
    }

    onDisconnect(){
        this.conneted = false;
        console.log('user disconnected');
    }

    sendUpdate(){
        this.socket.send( {red : this.R , green : this.G , blue : this.B , brighness : this.A, start_pos : this.start, stop_pos : this.stop} );
    }

    reciveUpdate(msg){
        if(msg.id == this.id){
            var redValue = in_bounds(msg.red,0,255);
            var greenValue = in_bounds(msg.green,0,255);
            var blueValue = in_bounds(msg.blue,0,255);
            var brighnessValue = in_bounds_f(msg.brighness,0,1.0);

            var strip_start = in_bounds(msg.start, 0, N_LEDS);
            var strip_stop = in_bounds(msg.stop, 0, N_LEDS);
            this.setLimits(redValue,greenValue,blueValue,brighnessValue,strip_start,strip_stop);
            return true;
        }
        return false;
    }

    ledUpdate(R,G,B,A=1.0){
        this.R = R;
        this.B = B;
        this.G = G;
        this.A = A;
    }

    setLimits(R,G,B,A,start,stop){
        this.start = start;
        this.stop = stop;
        this.ledUpdate(R,G,B,A);
    }
}

module.exports = {
    WebLights
};