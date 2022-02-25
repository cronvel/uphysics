#!/usr/bin/env node

const physic = require( '../lib/physic.js' ) ;
const term = require( 'terminal-kit' ).terminal ;
const math = require( 'math-kit' ) ;


// Parameters/starting conditions
var timeStep = 0.1 ,
	maxTime = 20 ,
	mass = 10 ,
	springElasticity = 200 ,
	springRestLength = 1 ,
	dampingFactor = 200 ,
	displacement = -0.75 ,
	velocity = 0 ,
	externalForce = -98 ;

var springK = springElasticity / springRestLength ,
	time = 0 ,
	acceleration = 0 ,
	brakingAcceleration = 0 ,
	force = 0 ,
	brakingForce = 0 ;



function computeForces() {
	force = externalForce ;
	//force = externalForce - displacement * springK - dampingFactor * velocity ;
	brakingForce = - displacement * springK - dampingFactor * velocity ;
	acceleration = force / mass ;
	brakingAcceleration = brakingForce / mass ;
}



function updateVerlet( dt ) {
	displacement += velocity * dt + 0.5 * acceleration * dt *dt ;
	var lastAcceleration = acceleration ;
	var lastBrakingAcceleration = brakingAcceleration ;
	computeForces() ;
	velocity += 0.5 * ( lastAcceleration + acceleration ) * dt ;
	brake = 0.5 * ( lastBrakingAcceleration + brakingAcceleration ) * dt ;

	velocity += brake ;

	/*
	// Check if the braking force would create a reverse velocity artifact, if so, nullify the velocity now
	if ( velocity && brake ) {
		// Check if the sign changes after the brake
		if ( velocity * ( velocity + brake ) > 0 ) {
			velocity += brake ;
		}
		else {
			velocity = 0 ;
		}
	}*/

	time += dt ;
}



var graphData = [] ;

function tracerReport() {
	const GmTracer = require( 'math-kit/lib/tracer/GmTracer.js' ) ;

	var tracer = new GmTracer( {
		width: 1000 ,
		height: 800 ,
		bgColor: '#000' ,
		xmin: -0.5 ,
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
	term.yellow( "T: %[.3]fs => d:%[.3]fm v:%[.3]fm/s a:%[.3]fm/s²\n" , time , displacement , velocity , acceleration ) ;
}



async function run() {
	computeForces() ;
	graphData.push( { x: time , fx: displacement } ) ;
	frameTextReport() ;

	while ( time <= maxTime ) {
		updateVerlet( timeStep ) ;
		graphData.push( { x: time , fx: displacement } ) ;
		frameTextReport() ;
	}
	
	await tracerReport() ;
}

run() ;

