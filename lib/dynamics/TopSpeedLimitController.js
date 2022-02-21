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



const physic = require( '../physic.js' ) ;



/*
	Limit the top speed of entities.
	When the entity moves, its max acceleration is lowered in the move direction, and raised in the counter-direction.
	At top-speed, no more acceleration is possible in the move direction.
	When top-speed violation occurs, the entity simply brake until it move slower than the top-speed.

	Use entity.controllerData.speedVector as input.
*/


/*
	Params:
	* topSpeedViolationBrake: used when the entity move faster than its top-speed
*/
function TopSpeedLimitController( params ) {
	this.topSpeedViolationBrake: params.topSpeedViolationBrake || 1 ;
	this.speedVector: new physic.Vector3D() ;
	
	// Cached vectors
	this.force: new physic.Vector3D() ;
	this.forceDir: new physic.Vector3D() ;
	this.penalty: new physic.Vector3D() ;
} ;

module.exports = TopSpeedLimitController ;



TopSpeedLimitController.prototype.init = function( entity ) {
	if ( ! entity.input.speedVector ) { entity.input.speedVector = new physic.Vector3D( 0 , 0 , 0 ) ; }
} ;



TopSpeedLimitController.prototype.apply = function( entity , period ) {
	var speed = entity.boundVector.vector.getLength() ;

	if ( speed > entity.data.topSpeed ) {
		// Top-Speed violation, just brake!
		//this.force.setVector( entity.boundVector.vector ).inv().setLength( this.topSpeedViolationBrake ) ;
		//entity.boundVector.vector.apply( this.force , period ) ;
		entity.brakingForces += this.topSpeedViolationBrake ;
		return ;
	}

	this.speedVector.setVector( entity.input.speedVector ).capLength( entity.data.topSpeed ) ;
	this.force.setVector( this.speedVector ).sub( entity.boundVector.vector ) ;

	// Nothing to do: force is null
	if ( this.force.isNull() ) { return ; }

	this.forceDir.setVector( this.force ).normalize() ;
	this.penalty.setVector( entity.boundVector.vector ).div( entity.data.topSpeed ) ;

	var rate = 1 - this.penalty.dot( this.forceDir ) ;
	var maxAcceleration = rate * entity.data.baseAcceleration ;

	this.force.capLength( maxAcceleration ) ;

	// Finally multiply by the entity's mass, so the accel is becoming a real force
	this.force.mul( entity.mass ) ;

	entity.forces.add( this.force , period ) ;
} ;

