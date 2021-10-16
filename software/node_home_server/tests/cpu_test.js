const si = require('systeminformation');

var rpidns_cpu_data;
var rpidns_cpu_speed_data; 
var rpidns_cpu_mem;
var rpidns_cpu_temp; 

const delay = 4000;

rpidns_cpu_data = si.cpu();
rpidns_cpu_speed_data = si.cpuCurrentspeed();
rpidns_cpu_temp = si.cpuTemperature();
rpidns_cpu_mem = si.mem();
//si.graphics();
//console.log(rpidns_cpu_data);

setInterval( () => {
	si.cpuTemperature().then( (data) => { rpidns_cpu_temp = data; console.log(rpidns_cpu_temp); } );
}, delay );
