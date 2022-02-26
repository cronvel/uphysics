#!/usr/bin/env node

"use strict" ;

const physic = require( '../lib/physic.js' ) ;
const term = require( 'terminal-kit' ).terminal ;
const math = require( 'math-kit' ) ;



// Parameters/starting conditions
var timeStep = 0.5 ,
	maxTime = 10 ,
	mass = 10 ,
	springElasticity = 200 ,
	springRestLength = 1 ,
	dampingFactor = 200 ,
	displacement = -0.75 ,
	velocity = 0 ,
	externalForce = -98 ,
	//update = updateVerletBrakeAlgo ;
	//update = updateVerlet ;
	update = updatePredictorV3 ;

/*
	Brake algo is fine for 1D, but does not works in 3D except if each individual braking forces are stored and applied
	one after the other, and use dot product for each indiviual “braking-acceleration”.
	It doesn't works if all brakes are summed.
	E.g.: Consider a ball at the very bouncing moment, it has F air drag in the -velocity direction and a F ground drag
	on the ground plane. When velocity is closed to right angle (+z, z is up), the F ground drag may well revert the xy velocity,
	because when summed with the F air drag the dot product is positive.
*/

var springK = springElasticity / springRestLength ,
	time = 0 ,
	acceleration = 0 ,
	brakingAcceleration = 0 ,
	force = 0 ,
	brakingForce = 0 ;



async function updatePredictorV3( dt ) {
	var accelerationOfAcceleration , unstiffedAcceleration , stiffness , stiffnessFactor ;
	var correctedDisplacement , correctedVelocity , correctedAcceleration ;
	var predictedDisplacement , predictedVelocity , predictedAcceleration ;

	var initialDisplacement = displacement ;
	var initialVelocity = velocity ;
	var initialAcceleration = acceleration ;
	term( "Initial -- d0: %[.3]f  v0: %[.3]f  a0: %[.3]f\n" , initialDisplacement , initialVelocity , initialAcceleration ) ;
	
	// First, try with constant acceleration
	velocity = predictedVelocity = velocity + initialAcceleration * dt ;
	displacement = predictedDisplacement = displacement + initialVelocity * dt + 0.5 * initialAcceleration * dt * dt ;
	computeForces() ;
	predictedAcceleration = acceleration ;

	term( "Prediction -- d1: %[.3]f  v1: %[.3]f  a1: %[.3]f\n" , displacement , velocity , acceleration ) ;

	if ( predictedAcceleration !== initialAcceleration ) {
		// Gosh! Acceleration was not constant!
		stiffness = 0 ;
		
		// Act as if acceleration changed linearly
		accelerationOfAcceleration = ( predictedAcceleration - initialAcceleration ) * dt ;
		velocity = correctedVelocity = predictedVelocity + 0.5 * accelerationOfAcceleration * dt * dt ;
		displacement = correctedDisplacement = predictedAcceleration + accelerationOfAcceleration * dt * dt * dt / 6 ;
		computeForces() ;
		correctedAcceleration = acceleration ;
		term( "Correction -- d1: %[.3]f  v1: %[.3]f  a1: %[.3]f\n" , correctedDisplacement , correctedVelocity , correctedAcceleration ) ;

		if ( predictedAcceleration * correctedAcceleration < 0 ) {
			// Gosh! Acceleration switched sign between prediction and correction!
			// We are probably in a stiff situation!
			// Time for the special anti-divergence/explosion code!
			
			// Velocity and correctedVelocity must have the same sign, if not, velocity give the correct impulse,
			// and correctedVelocity give an estimation of how stiff the system is.
			stiffness = 1 - correctedAcceleration / predictedAcceleration ;	// >1
			stiffnessFactor = 1 / ( 1 + stiffness * stiffness ) ;
			
			// Unstiff the acceleration
			correctedAcceleration = predictedAcceleration * stiffnessFactor ;
			velocity = correctedVelocity = velocity + 0.5 * accelerationOfAcceleration * dt * dt ;
			displacement = correctedDisplacement = displacement + accelerationOfAcceleration * dt * dt * dt / 6 ;
			
			
			term.red( "Possible divergence detected =>  stiffness: %[.3]f  stiffness-factor: %[.3]f  unstiffed-v: %[.3]f  unstiffed-a: %[.3]f\n" , stiffness , stiffnessFactor , correctedVelocity , unstiffedAcceleration ) ;
			// Apply that constant acceleration
			correctedDisplacement = initialDisplacement + initialVelocity * dt + 0.5 * unstiffedAcceleration * dt * dt ;
		}
		
		displacement = correctedDisplacement ;
		velocity = correctedVelocity ;
		acceleration = correctedAcceleration ;
		term( "Final correction -- d1: %[.3]f  v1: %[.3]f  a1: %[.3]f\n" , displacement , velocity , acceleration ) ;
	}
	
	time += dt ;
}



async function updatePredictorV2( dt ) {
	var accelerationOfAcceleration , correctedDisplacement , correctedVelocity , unstiffedAcceleration , stiffness , stiffnessFactor ;

	var initialDisplacement = displacement ;
	var initialVelocity = velocity ;
	var initialAcceleration = acceleration ;
	term( "Initial -- d0: %[.3]f  v0: %[.3]f  a0: %[.3]f\n" , initialDisplacement , initialVelocity , initialAcceleration ) ;
	
	// First, try with constant acceleration
	velocity += initialAcceleration * dt ;
	displacement += initialVelocity * dt + 0.5 * initialAcceleration * dt * dt ;
	computeForces() ;

	term( "Prediction -- d1: %[.3]f  v1: %[.3]f  a1: %[.3]f\n" , displacement , velocity , acceleration ) ;

	if ( acceleration !== initialAcceleration ) {
		// Gosh! Acceleration was not constant!
		stiffness = 0 ;
		
		// Act as if acceleration changed linearly
		accelerationOfAcceleration = ( acceleration - initialAcceleration ) * dt ;
		correctedDisplacement = displacement + accelerationOfAcceleration * dt * dt * dt / 6 ;
		correctedVelocity = velocity + 0.5 * accelerationOfAcceleration * dt * dt ;
		term( "Correction -- d1: %[.3]f  v1: %[.3]f\n" , correctedDisplacement , correctedVelocity ) ;

		if ( velocity * correctedVelocity < 0 ) {
			// Gosh! Velocity switched sign between prediction and correction!
			// We are probably in a stiff situation!
			// Time for the special anti-divergence/explosion code!
			
			// Velocity and correctedVelocity must have the same sign, if not, velocity give the correct impulse,
			// and correctedVelocity give an estimation of how stiff the system is.
			stiffness = 1 - correctedVelocity / velocity ;	// >1
			stiffnessFactor = 1 / ( 1 + stiffness * stiffness ) ;
			
			// Unstiff the velocity
			correctedVelocity = velocity * stiffnessFactor ;
			// Deduce acceleration from corrected velocity, here we use again a constant acceleration
			unstiffedAcceleration = ( correctedVelocity - initialVelocity ) / dt ;
			term.red( "Possible divergence detected =>  stiffness: %[.3]f  stiffness-factor: %[.3]f  unstiffed-v: %[.3]f  unstiffed-a: %[.3]f\n" , stiffness , stiffnessFactor , correctedVelocity , unstiffedAcceleration ) ;
			// Apply that constant acceleration
			correctedDisplacement = initialDisplacement + initialVelocity * dt + 0.5 * unstiffedAcceleration * dt * dt ;
		}

		displacement = correctedDisplacement ;
		velocity = correctedVelocity ;
		
		computeForces() 
		
		term( "Final correction -- d1: %[.3]f  v1: %[.3]f  a1: %[.3]f\n" , displacement , velocity , acceleration ) ;
	}
	
	time += dt ;
}



async function updatePredictorV1( dt ) {
	var accelerationOfAcceleration , partialDt ;
	var initialDisplacement = displacement ;
	var initialVelocity = velocity ;
	var initialAcceleration = acceleration ;
	term( "Initial -- d0: %[.3]f  v0: %[.3]f  a0: %[.3]f\n" , initialDisplacement , initialVelocity , initialAcceleration ) ;
	
	// First, try with constant acceleration
	displacement += velocity * dt + 0.5 * acceleration * dt * dt ;
	velocity += acceleration * dt ;
	computeForces() ;

	term( "Prediction -- d1: %[.3]f  v1: %[.3]f  a1: %[.3]f\n" , displacement , velocity , acceleration ) ;

	if ( acceleration !== initialAcceleration ) {
		// Gosh! Acceleration was not constant!
		
		//*/
		// Act as if acceleration changed linearly
		accelerationOfAcceleration = ( acceleration - initialAcceleration ) * dt ;

		//*
		// /!\ This condition should be improved
		if ( velocity * initialVelocity < 0 && acceleration * initialAcceleration < 0 ) {
			// Gosh! Both velocity and acceleration switched sign!
			// Time for the special anti-divergence/explosion code!
			
			//*
			// Find at which partialDt it switched
			let a = 0.5 * accelerationOfAcceleration ,
				b = initialAcceleration ,
				c = initialVelocity ,
				extremum = -b / ( 2 * a ) ,
				vExtremum = false ;

			let roots = math.fn.PolynomialFn.solveQuadratic( a , b , c ) ;
			term( "    roots: %J\n" , roots ) ;
			term( "    coeffs:  a: %[.3]f  b: %[.3]f  c: %[.3]f\n" , a , b , c ) ;
			term( "    extremum -b/2a: %[.3]f\n" , extremum ) ;
			
			//*
			if ( false && ! roots ) {
				const GmTracer = require( 'math-kit/lib/tracer/GmTracer.js' ) ;
				var tracer = new GmTracer( {
					width: 1000 ,
					height: 800 ,
					bgColor: '#000' ,
					xmin: -0.2 ,
					xmax: 1 ,
					ymin: -1.5 ,
					ymax: 1.5 ,
					xUnit: 's' ,
					everyX: 0.25 ,
					yUnit: 'm' ,
					everyY: 0.5 ,
				} ) ;

				var velFn = new math.fn.PolynomialFn( initialVelocity , initialAcceleration , 0.5 * accelerationOfAcceleration ) ;

				tracer.createImage() ;
				tracer.drawAxis() ;
				tracer.traceFn( velFn , '#0f0' ) ;
				await tracer.saveImage( __dirname + "/velFn.png" ) ;
				process.exit() ;
			}
			//*/
			
			partialDt = null ;

			if ( roots ) {
				if ( roots.length === 2 ) {
					if ( roots[ 0 ] >= 0 && roots[ 0 ] <= dt ) {
						if ( roots[ 1 ] >= 0 && roots[ 1 ] < roots[ 0 ] ) {
							partialDt = roots[ 1 ] ;
						}
						else {
							partialDt = roots[ 0 ] ;
						}
					}
					else if ( roots[ 1 ] >= 0 && roots[ 1 ] <= dt ) {
						partialDt = roots[ 1 ] ;
					}
				}
				else if ( roots.length === 1 && roots[ 0 ] >= 0 && roots[ 0 ] <= dt ) {
					partialDt = roots[ 0 ] ;
				}
			}
			else if ( extremum >= 0 && extremum <= dt ) {
				partialDt = extremum ;
				vExtremum = true ;
			}

			if ( partialDt !== null ) {
				let oldD = displacement ;
				displacement = initialDisplacement + initialVelocity * partialDt + 0.5 * initialAcceleration * partialDt * partialDt ;
				term( "    partialDt: %[.3]f  old d: %[.3]f  new d: %[.3]f\n" , partialDt , oldD , displacement ) ;
			}
			//*/

			if ( vExtremum ) {
				velocity = a * partialDt * partialDt + b * partialDt + c ;
			}
			else {
				velocity = 0 ;
			}

			acceleration = 0 ;
		}
		else {
			displacement += accelerationOfAcceleration * dt * dt * dt / 6 ;
			velocity += 0.5 * accelerationOfAcceleration * dt * dt ;
			computeForces() ;
		}
		//*/
		
		/*
		acceleration = 0.5 * ( initialAcceleration + acceleration ) ;

		displacement = initialDisplacement + initialVelocity * dt + 0.5 * acceleration * dt * dt ;
		velocity = initialVelocity + acceleration * dt ;
		computeForces() ;
		//*/

		term( "Correction -- d1: %[.3]f  v1: %[.3]f  a1: %[.3]f\n" , displacement , velocity , acceleration ) ;
	}
	
	time += dt ;
}



function computeForces() {
	force = externalForce - displacement * springK - dampingFactor * velocity ;
	acceleration = force / mass ;
}



function updateVerlet( dt ) {
	displacement += velocity * dt + 0.5 * acceleration * dt * dt ;
	var lastAcceleration = acceleration ;
	computeForces() ;
	velocity += 0.5 * ( lastAcceleration + acceleration ) * dt ;
	time += dt ;
}



function computeForcesBrakeAlgo() {
	force = externalForce - displacement * springK ;
	acceleration = force / mass ;
	brakingForce = - dampingFactor * velocity ;
	brakingAcceleration = brakingForce / mass ;
}



function updateVerletBrakeAlgo( dt ) {
	displacement += velocity * dt + 0.5 * ( acceleration + brakingAcceleration ) * dt * dt ;
	var lastAcceleration = acceleration ;
	var lastBrakingAcceleration = brakingAcceleration ;
	computeForcesBrakeAlgo() ;
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



var graphDisplacementData = [] ;
var graphVelocityData = [] ;
var graphAccelerationData = [] ;

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
	
	var options = { preserveExtrema: true } ;

	var displacementFn = new math.fn.InterpolatedFn( graphDisplacementData , options ) ;
	var velocityFn = new math.fn.InterpolatedFn( graphVelocityData , options ) ;
	var accelerationFn = new math.fn.InterpolatedFn( graphAccelerationData , options ) ;

	tracer.createImage() ;
	tracer.drawAxis() ;
	tracer.traceFn( accelerationFn , '#f00' ) ;
	tracer.traceFn( velocityFn , '#0f0' ) ;
	tracer.traceFn( displacementFn , '#00f' ) ;
	tracer.saveImage( __dirname + "/spring-damper.png" ) ;
}



function frameTextReport() {
	if ( brakingAcceleration ) {
		term.yellow( "T: %[.3]fs => d: %km v: %km/s a: %km/s² brkA: %km/s²\n" , time , displacement , velocity , acceleration , brakingAcceleration ) ;
	}
	else {
		term.yellow( "T: %[.3]fs => d: %km v: %km/s a: %km/s²\n" , time , displacement , velocity , acceleration ) ;
	}
}



async function run() {
	computeForces() ;
	graphDisplacementData.push( { x: time , fx: displacement } ) ;
	frameTextReport() ;

	while ( time <= maxTime ) {
		await update( timeStep ) ;

		graphDisplacementData.push( { x: time , fx: displacement } ) ;
		graphVelocityData.push( { x: time , fx: velocity } ) ;
		graphAccelerationData.push( { x: time , fx: acceleration } ) ;
		frameTextReport() ;
	}
	
	await tracerReport() ;
}

run() ;

