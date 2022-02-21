#!/usr/bin/env node

const physic = require( '../lib/physic.js' ) ;
const term = require( 'terminal-kit' ).terminal ;



var torqueFn = new physic.Fn( [
	{ x: 0 , fx: 30 } ,
	{ x: 1000 , fx: 100 } ,
	{ x: 4000 , fx: 200 } ,
	{ x: 6000 , fx: 300 } ,
	{ x: 6500 , fx: 350 } ,
	{ x: 7000 , fx: 300 } ,
	{ x: 8000 , fx: 250 } ,
	{ x: 9000 , fx: 200 } ,
	{ x: 10000 , fx: 100 } ,
	{ x: 100000 , fx: 0 } ,
] , {
	preserveExtrema: true ,
	atanMeanSlope: true
} ) ;

torqueFn = torqueFn.fx.bind( torqueFn ) ;

var motor = new physic.dynamics.MotorController( {
	torqueFn: torqueFn ,
	motorInertia: 0.4 ,
	engineBrakingTorquePerRpm: 0.08 ,
} ) ;

var entity = new physic.Entity( {
	material: new physic.Material() , // Mandatory
	shape: physic.Shape.createDot() , // Mandatory
	dynamics: [ motor ]
} ) ;



// Listen for move events on all gamepads
/*
gamepad.on( 'move' , function( id , axis , value ) {
	entity.input.throttle = value ;
} ) ;
*/
term.grabInput( { mouse: 'motion' } ) ;

term.on( 'key' , key => {
	if ( key === 'CTRL_C' ) {
		term( "\n" ) ;
		process.exit() ;
	}
} ) ;

term.on( 'mouse' , ( type , data ) => {
	entity.input.throttle = 1 - ( ( data.y - 1 ) / ( term.height - 1 ) ) ;
} ) ;

term.bold.green( "Move the mouse upward or downward to change the motor throttle\n" ) ;

function update() {
	motor.apply( entity , 0.1 ) ;
	term.column( 1 ).eraseLineAfter() ;
	term.bold.yellow( "%i RPM (throttle: %P)" , entity.data.rpm , entity.input.throttle ) ;
}

setInterval( update , 100 ) ;

