#!/usr/bin/env node

const physic = require( '../lib/physic.js' ) ;
const term = require( 'terminal-kit' ).terminal ;
const math = require( 'math-kit' ) ;



// Parameters/starting conditions
var timeStep = 0.05 ,
	maxTime = 20 ,
	mass = 10 ,
	springElasticity = 200 ,
	springRestLength = 1 ,
	dampingFactor = 200 ,
	displacement = -0.75 ,
	velocity = 0 ,
	externalForce = -98 ,
	useBrakeAlgo = false ;

/*
	Brake algo is fine for 1D, but does not works in 3D except if each individual braking forces are stored and applied
	one after the other, and use dot product for each indiviual “braking-acceleration”.
	It doesn't works if all brakes are summed.
	E.g.: Consider a ball at the very bouncing moment, it has F air drag in the -velocity direction and a F ground drag
	on the ground plane. When closed to right angle, the F ground drag may well revert the xy velocity (z-up), because
	when summed with the F air drag the dot product is positive.
*/

var springK = springElasticity / springRestLength ,
	time = 0 ,
	acceleration = 0 ,
	brakingAcceleration = 0 ,
	force = 0 ,
	brakingForce = 0 ;



function computeForces() {
	if ( useBrakeAlgo ) {
		force = externalForce - displacement * springK ;
		acceleration = force / mass ;
		brakingForce = - dampingFactor * velocity ;
		brakingAcceleration = brakingForce / mass ;
	}
	else {
		force = externalForce - displacement * springK - dampingFactor * velocity ;
		acceleration = force / mass ;
	}
}



function updateVerletBrakeAlgo( dt ) {
	displacement += velocity * dt + 0.5 * ( acceleration + brakingAcceleration ) * dt *dt ;
	var lastAcceleration = acceleration ;
	var lastBrakingAcceleration = brakingAcceleration ;
	computeForces() ;
	velocity += 0.5 * ( lastAcceleration + acceleration ) * dt ;
	brake = 0.5 * ( lastBrakingAcceleration + brakingAcceleration ) * dt ;

	// Check if the braking force would create a reverse velocity artifact, if so, nullify the velocity now
	if ( velocity && brake ) {
		// Check if the sign changes after the brake
		if ( velocity * ( velocity + brake ) > 0 ) {
			velocity += brake ;
		}
		else {
			velocity = 0 ;
		}
	}

	time += dt ;
}



function updateVerlet( dt ) {
	displacement += velocity * dt + 0.5 * acceleration * dt *dt ;
	var lastAcceleration = acceleration ;
	computeForces() ;
	velocity += 0.5 * ( lastAcceleration + acceleration ) * dt ;
	time += dt ;
}



var graphData = [] ;

function tracerReport() {
	const GmTracer = require( 'math-kit/lib/tracer/GmTracer.js' ) ;

	var tracer = new GmTracer( {
		width: 1000 ,
		height: 800 ,
		bgColor: '#000' ,
		xmin: -1 ,
		xmax: maxTime ,
		ymin: -1.5 ,
		ymax: 1.5 ,
		xUnit: 's' ,
		everyX: 1 ,
		yUnit: 'm' ,
		everyY: 0.5 ,
	} ) ;

	let fn = new math.fn.InterpolatedFn( graphData ) ;

	tracer.createImage() ;
	tracer.drawAxis() ;
	tracer.traceFn( fn , '#f0f' ) ;
	tracer.saveImage( __dirname + "/spring-damper.png" ) ;
}



function frameTextReport() {
	if ( useBrakeAlgo ) {
		term.yellow( "T: %[.3]fs => d:%km v:%km/s a:%km/s² brkA:%km/s²\n" , time , displacement , velocity , acceleration , brakingAcceleration ) ;
	}
	else {
		term.yellow( "T: %[.3]fs => d:%km v:%km/s a:%km/s²\n" , time , displacement , velocity , acceleration ) ;
	}
}



async function run() {
	computeForces() ;
	graphData.push( { x: time , fx: displacement } ) ;
	frameTextReport() ;

	while ( time <= maxTime ) {
		if ( useBrakeAlgo ) {
			updateVerletBrakeAlgo( timeStep ) ;
		}
		else {
			updateVerlet( timeStep ) ;
		}

		graphData.push( { x: time , fx: displacement } ) ;
		frameTextReport() ;
	}
	
	await tracerReport() ;
}

run() ;

