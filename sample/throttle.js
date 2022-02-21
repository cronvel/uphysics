
var physic = require( '../lib/physic.js' ) ;
var term = require( 'terminal-kit' ).terminal ;



// Initialize the gamepad library

var gamepad = require( 'gamepad' ) ;
term.magenta( "\nThis works using a gamepad\n\n" ) ;

gamepad.init() ;

// Create a game loop and poll for events
setInterval( gamepad.processEvents , 16 ) ;

// Scan for new gamepads as a slower rate
setInterval( gamepad.detectDevices , 500 ) ;

gamepad.on( 'attach' , function( id , state ) {
	term.blue( 'attach %Y\n' , state ) ;
} ) ;



// Init the motor

var torqueFn = physic.Fn.create( [
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

var motor = physic.dynamics.MotorController.create( {
	torqueFn: torqueFn ,
	motorInertia: 0.4 ,
	engineBrakingTorquePerRpm: 0.08 ,
} ) ;

var entity = physic.Entity.create( {
	dynamics: [ motor ]
} ) ;



// Listen for move events on all gamepads
gamepad.on( 'move' , function( id , axis , value ) {
	entity.input.throttle = value ;
} ) ;



function update()
{
	motor.apply( entity , 0.1 ) ;
	term.column( 1 ).eraseLineAfter() ;
	term.bold.yellow( "%i RPM" , entity.extra.rpm ) ;
}

setInterval( update , 100 ) ;

