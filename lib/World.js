/*
	Uphysics

	Copyright (c) 2017 Cédric Ronvel

	The MIT License (MIT)

	Permission is hereby granted, free of charge, to any person obtaining a copy
	of this software and associated documentation files (the "Software"), to deal
	in the Software without restriction, including without limitation the rights
	to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	copies of the Software, and to permit persons to whom the Software is
	furnished to do so, subject to the following conditions:

	The above copyright notice and this permission notice shall be included in all
	copies or substantial portions of the Software.

	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
	SOFTWARE.
*/

"use strict" ;



const physic = require( './physic.js' ) ;

const Logfella = require( 'logfella' ) ;
const log = Logfella.global.use( 'physic' ) ;



function World( params = {} ) {
	this.time = params.time || 0 ;
	this.timeStep =
		params.timeStep ? + params.timeStep :
		params.dt ? + params.dt :
		params.fps ? 1 / params.fps :
		0.05 ;

	this.entities = [] ;
	this.dynamicEntities = [] ;
	this.staticEntities = [] ;
	
	this.integratorOptions = {} ;
	this.update = this.oldUpdate ;
	if ( params.integrator ) { this.setIntegrator( params.integrator ) ; }
}

module.exports = World ;



const INTEGRATOR = {
	euler: [ 'updateEuler' , {} ] ,
	verlet: [ 'updateVerlet' , {} ] ,
	predictor: [ 'updatePredictor' , { unstiff: false } ] ,
	predictorUnstiffed: [ 'updatePredictor' , { unstiff: true } ]
} ;



World.prototype.setIntegrator = function( name ) {
	var array = INTEGRATOR[ name ] ;
	if ( ! array ) { return ; }
	this.update = this[ array[ 0 ] ] ;
	this.integratorOptions = array[ 1 ] ;
} ;



World.prototype.addEntity = function( entity ) {
	entity.world = this ;

	if ( entity.isStatic ) { this.staticEntities.push( entity ) ; }
	else { this.dynamicEntities.push( entity ) ; }

	this.entities.push( entity ) ;
} ;



// Computing force is automatically done when updating, however it can be convenient to call that method
// on the initial frame #0 to avoid having a freezed frame #1.
World.prototype.computeInitialForces = function() {
	var i , entity , swap ,
		dynamicLen = this.dynamicEntities.length ;

	for ( i = 0 ; i < dynamicLen ; i ++ ) {
		entity = this.dynamicEntities[ i ] ;
		entity.computeForces() ;
		swap = entity.forces ; entity.forces = entity.nextForces ; entity.nextForces = swap ;
		swap = entity.acceleration ; entity.acceleration = entity.nextAcceleration ; entity.nextAcceleration = swap ;
	}
} ;



World.prototype.updateEuler = function( dt = this.timeStep ) {
	var i , j , entity , altEntity ,
		allLen = this.entities.length ,
		dynamicLen = this.dynamicEntities.length ,
		staticLen = this.staticEntities.length ;

	for ( i = 0 ; i < dynamicLen ; i ++ ) {
		entity = this.dynamicEntities[ i ] ;

		entity.nextPosition.x = entity.position.x + entity.velocity.x * dt ;
		entity.nextPosition.y = entity.position.y + entity.velocity.y * dt ;
		entity.nextPosition.z = entity.position.z + entity.velocity.z * dt ;

		entity.nextVelocity.x = entity.velocity.x + entity.acceleration.x * dt ;
		entity.nextVelocity.y = entity.velocity.y + entity.acceleration.y * dt ;
		entity.nextVelocity.z = entity.velocity.z + entity.acceleration.z * dt ;
	}

	// Computing forces must have its own loop, because it should be computed when all new positions are ready
	for ( i = 0 ; i < dynamicLen ; i ++ ) {
		entity = this.dynamicEntities[ i ] ;
		entity.computeForces() ;
		entity.swap() ;
	}

	this.time += dt ;

	/*
	// Solve interaction between dynamic and static entities first
	for ( i = 0 ; i < dynamicLen ; i ++ ) {
		for ( j = 0 ; j < staticLen ; j ++ ) {
			this.dynamicEntities[ i ].interaction( this.staticEntities[ j ] , dt ) ;
		}
	}

	// Then solve interaction between dynamic entities
	for ( i = 0 ; i < dynamicLen ; i ++ ) {
		for ( j = i + 1 ; j < dynamicLen ; j ++ ) {
			this.dynamicEntities[ i ].interaction( this.dynamicEntities[ j ] , dt ) ;
		}
	}
	*/
} ;



// Verlet integrator, it's the “Velocity Vertlet” variant
World.prototype.updateVerlet = function( dt = this.timeStep ) {
	var i , j , entity , altEntity ,
		dt2 = dt * dt ,
		allLen = this.entities.length ,
		dynamicLen = this.dynamicEntities.length ,
		staticLen = this.staticEntities.length ;

	for ( i = 0 ; i < dynamicLen ; i ++ ) {
		entity = this.dynamicEntities[ i ] ;

		entity.nextPosition.x = entity.position.x + entity.velocity.x * dt + 0.5 * entity.acceleration.x * dt2 ;
		entity.nextPosition.y = entity.position.y + entity.velocity.y * dt + 0.5 * entity.acceleration.y * dt2 ;
		entity.nextPosition.z = entity.position.z + entity.velocity.z * dt + 0.5 * entity.acceleration.z * dt2 ;
	}

	for ( i = 0 ; i < dynamicLen ; i ++ ) {
		entity = this.dynamicEntities[ i ] ;
		
		entity.computeForces() ;
		
		entity.nextVelocity.x = entity.velocity.x + 0.5 * ( entity.acceleration.x + entity.nextAcceleration.x ) * dt ;
		entity.nextVelocity.y = entity.velocity.y + 0.5 * ( entity.acceleration.y + entity.nextAcceleration.y ) * dt ;
		entity.nextVelocity.z = entity.velocity.z + 0.5 * ( entity.acceleration.z + entity.nextAcceleration.z ) * dt ;

		entity.swap() ;
	}

	this.time += dt ;

	/*
	// Solve interaction between dynamic and static entities first
	for ( i = 0 ; i < dynamicLen ; i ++ ) {
		for ( j = 0 ; j < staticLen ; j ++ ) {
			this.dynamicEntities[ i ].interaction( this.staticEntities[ j ] , dt ) ;
		}
	}

	// Then solve interaction between dynamic entities
	for ( i = 0 ; i < dynamicLen ; i ++ ) {
		for ( j = i + 1 ; j < dynamicLen ; j ++ ) {
			this.dynamicEntities[ i ].interaction( this.dynamicEntities[ j ] , dt ) ;
		}
	}
	*/
} ;



const PREDICTOR_STIFFNESS_DELTA = 0.01 ;
const PREDICTOR_STIFFNESS_DELTA_SQUARED = PREDICTOR_STIFFNESS_DELTA * PREDICTOR_STIFFNESS_DELTA ;
const PREDICTOR_STIFFNESS_FACTOR = 3 ;	// A totally empirical value
const D_ACCELERATION = new physic.Vector3D() ;
const REWRITTEN_ACCELERATION = new physic.Vector3D() ;

// Predictor is my own integrator
World.prototype.updatePredictor = function( dt = this.timeStep ) {
	var i , j , entity , altEntity , dotProduct , stiffnessFactor ,
		dt2 = dt * dt ,
		dt3_6 = dt * dt * dt / 6 ,
		dAcceleration = D_ACCELERATION ,
		rewrittenAcceleration = REWRITTEN_ACCELERATION ,
		hasUnstable = false ,
		allLen = this.entities.length ,
		dynamicLen = this.dynamicEntities.length ,
		staticLen = this.staticEntities.length ;

	// First we start by predicting using a constant acceleration
	for ( i = 0 ; i < dynamicLen ; i ++ ) {
		entity = this.dynamicEntities[ i ] ;
		log.info( "Initial -- y0: %[.3]f  vy0: %[.3]f  ay0: %[.3]f" , entity.position.y , entity.velocity.y , entity.acceleration.y ) ;

		entity.nextPosition.x = entity.position.x + entity.velocity.x * dt + 0.5 * entity.acceleration.x * dt2 ;
		entity.nextPosition.y = entity.position.y + entity.velocity.y * dt + 0.5 * entity.acceleration.y * dt2 ;
		entity.nextPosition.z = entity.position.z + entity.velocity.z * dt + 0.5 * entity.acceleration.z * dt2 ;

		entity.nextVelocity.x = entity.velocity.x + entity.acceleration.x * dt ;
		entity.nextVelocity.y = entity.velocity.y + entity.acceleration.y * dt ;
		entity.nextVelocity.z = entity.velocity.z + entity.acceleration.z * dt ;
	}


	for ( i = 0 ; i < dynamicLen ; i ++ ) {
		entity = this.dynamicEntities[ i ] ;
		
		entity.computeForces() ;
		log.hdebug( "Prediction -- y1: %[.3]f  vy1: %[.3]f  ay1: %[.3]f" , entity.nextPosition.y , entity.nextVelocity.y , entity.nextAcceleration.y ) ;

		if ( entity.nextAcceleration.isEqualTo( entity.acceleration ) ) {
			entity.stable = true ;
			entity.swap() ;
			continue ;
		}

		hasUnstable = true ;
		entity.stable = false ;
		
		entity.predictedPosition.setVector( entity.nextPosition ) ;
		entity.predictedVelocity.setVector( entity.nextVelocity ) ;
		entity.predictedAcceleration.setVector( entity.nextAcceleration ) ;
		
		dAcceleration.x = ( entity.predictedAcceleration.x - entity.acceleration.x ) / dt ;
		dAcceleration.y = ( entity.predictedAcceleration.y - entity.acceleration.y ) / dt ;
		dAcceleration.z = ( entity.predictedAcceleration.z - entity.acceleration.z ) / dt ;
		
		entity.nextVelocity.x = entity.predictedVelocity.x + 0.5 * dAcceleration.x * dt2 ;
		entity.nextVelocity.y = entity.predictedVelocity.y + 0.5 * dAcceleration.y * dt2 ;
		entity.nextVelocity.z = entity.predictedVelocity.z + 0.5 * dAcceleration.z * dt2 ;

		entity.nextPosition.x = entity.predictedPosition.x + dAcceleration.x * dt3_6 ;
		entity.nextPosition.y = entity.predictedPosition.y + dAcceleration.y * dt3_6 ;
		entity.nextPosition.z = entity.predictedPosition.z + dAcceleration.z * dt3_6 ;
	}

	if ( hasUnstable ) {
		hasUnstable = false ;

		for ( i = 0 ; i < dynamicLen ; i ++ ) {
			entity = this.dynamicEntities[ i ] ;
			if ( entity.stable ) { continue ; }

			entity.computeForces() ;
			log.hdebug( "Correction -- y1: %[.3]f  vy1: %[.3]f  ay1: %[.3]f" , entity.nextPosition.y , entity.nextVelocity.y , entity.nextAcceleration.y ) ;
			//log.hdebug( "opt: %Y" , this.integratorOptions ) ;
			
			if (
				! this.integratorOptions.unstiff
				|| ( dotProduct = entity.predictedAcceleration.dot( entity.nextAcceleration ) ) >= 0
				|| entity.predictedAcceleration.pointSquaredDistance( entity.nextAcceleration ) <= PREDICTOR_STIFFNESS_DELTA_SQUARED
			) {
				entity.stable = true ;
				entity.swap() ;
				continue ;
			}

			hasUnstable = true ;
			entity.stable = false ;

			/*
				Gosh! Acceleration switched sign between prediction and correction! We are probably in a stiff situation!
				We are more in the heuristic realm than in the accuracy realm here, but we just want to preserve stability and avoid explosions.

				We will compute the “stiffness”.

				In the original 1D algo,   stiffness = 1 - nextAcceleration / predictedAcceleration   (>1).
				Here   dotProduct = |nextAcceleration| * |predictedAcceleration| * cos(alpha)   (<0)
				So:   dotProduct / |predictedAcceleration|² = ( |nextAcceleration| / |predictedAcceleration| ) * cos(alpha)   (<0)
				This produce the same algo for 3D.
			*/
			
			entity.stiffness = - dotProduct / entity.predictedAcceleration.squaredLength ; // >0
			stiffnessFactor = 1 / ( 1 + PREDICTOR_STIFFNESS_FACTOR * entity.stiffness * entity.stiffness ) ;	// PREDICTOR_STIFFNESS_FACTOR is totally empirical and “magic”
			log.hdebug( "^rPossible divergence detected =>^  stiffness: %[.3]f  stiffness-factor: %[.3]f  (dot: %[.3]f  |predA|: %[.3]f)" , entity.stiffness , stiffnessFactor , dotProduct , entity.predictedAcceleration.squaredLength ) ;

			// It's seems that it's a very bad idea to patch the acceleration output, since error are carried over to the next stage.
			// Instead, we will patch the initial acceleration to make it less brutal.
			rewrittenAcceleration.x = entity.acceleration.x * stiffnessFactor ;
			rewrittenAcceleration.y = entity.acceleration.y * stiffnessFactor ;
			rewrittenAcceleration.z = entity.acceleration.z * stiffnessFactor ;

			entity.nextVelocity.x = entity.velocity.x + rewrittenAcceleration.x * dt ;
			entity.nextVelocity.y = entity.velocity.y + rewrittenAcceleration.y * dt ;
			entity.nextVelocity.z = entity.velocity.z + rewrittenAcceleration.z * dt ;

			entity.nextPosition.x = entity.position.x + entity.velocity.x * dt + 0.5 * rewrittenAcceleration.x * dt2 ;
			entity.nextPosition.y = entity.position.y + entity.velocity.y * dt + 0.5 * rewrittenAcceleration.y * dt2 ;
			entity.nextPosition.z = entity.position.z + entity.velocity.z * dt + 0.5 * rewrittenAcceleration.z * dt2 ;
			log.hdebug( "Retro correction -- y1: %[.3]f  vy1: %[.3]f  ay0: %[.3]f" , entity.nextPosition.y , entity.nextVelocity.y , rewrittenAcceleration.y , entity.nextAcceleration.y ) ;
		}
	}


	if ( hasUnstable ) {
		for ( i = 0 ; i < dynamicLen ; i ++ ) {
			entity = this.dynamicEntities[ i ] ;
			if ( entity.stable ) { continue ; }

			entity.computeForces() ;
			log.hdebug( "Final -- y1: %[.3]f  vy1: %[.3]f  ay1: %[.3]f" , entity.nextPosition.y , entity.nextVelocity.y , entity.nextAcceleration.y ) ;
			entity.swap() ;
		}
	}

	this.time += dt ;

	/*
	// Solve interaction between dynamic and static entities first
	for ( i = 0 ; i < dynamicLen ; i ++ ) {
		for ( j = 0 ; j < staticLen ; j ++ ) {
			this.dynamicEntities[ i ].interaction( this.staticEntities[ j ] , dt ) ;
		}
	}

	// Then solve interaction between dynamic entities
	for ( i = 0 ; i < dynamicLen ; i ++ ) {
		for ( j = i + 1 ; j < dynamicLen ; j ++ ) {
			this.dynamicEntities[ i ].interaction( this.dynamicEntities[ j ] , dt ) ;
		}
	}
	*/
} ;



World.prototype.oldUpdate = function( dt = this.timeStep ) {
	var i , j , entity , altEntity ,
		allLen = this.entities.length ,
		dynamicLen = this.dynamicEntities.length ,
		staticLen = this.staticEntities.length ;

	// Prepare the frame calculation
	for ( i = 0 ; i < allLen ; i ++ ) {
		this.entities[ i ].prepareFrame() ;
	}

	// Move entities using their own internal mechanic
	for ( i = 0 ; i < dynamicLen ; i ++ ) {
		this.dynamicEntities[ i ].update( dt ) ;
	}

	// Solve interaction between dynamic and static entities first
	for ( i = 0 ; i < dynamicLen ; i ++ ) {
		for ( j = 0 ; j < staticLen ; j ++ ) {
			this.dynamicEntities[ i ].interaction( this.staticEntities[ j ] , dt ) ;
		}
	}

	// Then solve interaction between dynamic entities
	for ( i = 0 ; i < dynamicLen ; i ++ ) {
		for ( j = i + 1 ; j < dynamicLen ; j ++ ) {
			this.dynamicEntities[ i ].interaction( this.dynamicEntities[ j ] , dt ) ;
		}
	}
} ;

