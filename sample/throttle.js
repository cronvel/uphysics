#!/usr/bin/env node

const physic = require( '../lib/physic.js' ) ;
const term = require( 'terminal-kit' ).terminal ;



var motor = new physic.dynamics.Motor( {
	torqueData: [
		{ rpm: 0 , torque: 30 } ,
		{ rpm: 1000 , torque: 100 } ,
		{ rpm: 2000 , torque: 120 } ,
		{ rpm: 3500 , torque: 200 } ,
		{ rpm: 5000 , torque: 300 } ,
		{ rpm: 5500 , torque: 350 } ,
		{ rpm: 6000 , torque: 300 } ,
		{ rpm: 7500 , torque: 250 } ,
		{ rpm: 8500 , torque: 150 } ,
		{ rpm: 9000 , torque: 100 } ,
		{ rpm: 10000 , torque: 0 } ,
		{ rpm: 20000 , torque: -200 }
	] ,
	brakeTorquePerRpm: 0.08 ,
	brakeMinRpm: 1000 ,
	motorInertia: 4 ,
} ) ;

// Listen for move events on all gamepads
term.grabInput( { mouse: 'motion' } ) ;

term.on( 'key' , key => {
	if ( key === 'CTRL_C' ) {
		term( "\n" ) ;
		process.exit() ;
	}
} ) ;

term.on( 'mouse' , ( type , data ) => {
	motor.setThrottle( 1 - ( ( data.y - 1 ) / ( term.height - 1 ) ) ) ;
} ) ;

term.bold.green( "Move the mouse upward or downward to change the motor throttle\n" ) ;

function update() {
	motor.apply( 0.1 ) ;
	term.column( 1 ).eraseLineAfter() ;
	term.bold.yellow( "%[L5]i RPM => %[L4]P | %[L6]kN.m | %[L6]kW / %[L4]ihp | %[4L6]f rad/s" , motor.rpm , motor.throttle , motor.torque , motor.power , motor.horsePower , motor.angularSpeed ) ;
}

setInterval( update , 100 ) ;

