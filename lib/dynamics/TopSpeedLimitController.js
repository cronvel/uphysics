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



var physic = require( '../physic.js' ) ;



/*
	Limit the top speed of entities.
	When the entity moves, its max acceleration is lowered in the move direction, and raised in the counter-direction.
	At top-speed, no more acceleration is possible in the move direction.
	When top-speed violation occurs, the entity simply brake until it move slower than the top-speed.
	
	Use entity.controllerData.speedVector as input.
*/

function TopSpeedLimitController( params ) { return TopSpeedLimitController.create( params ) ; }
module.exports = TopSpeedLimitController ;



/*
	Params:
	* topSpeedViolationBrake: used when the entity move faster than its top-speed
*/
TopSpeedLimitController.create = function create( params )
{
	var self = Object.create( TopSpeedLimitController.prototype , {
		topSpeedViolationBrake: { value: params.topSpeedViolationBrake || 1 , writable: true , enumerable: true } ,
		
		speedVector: { value: physic.Vector3D() , enumerable: true } ,
		
		// Cached vectors
		accel: { value: physic.Vector3D() , enumerable: true } ,
		accelDir: { value: physic.Vector3D() , enumerable: true } ,
		penalty: { value: physic.Vector3D() , enumerable: true } ,
	} ) ;
	
	return self ;
} ;



TopSpeedLimitController.prototype.init = function init( entity )
{
	if ( ! entity.input.speedVector ) { entity.input.speedVector = physic.Vector3D( 0 , 0 , 0 ) ; }
} ;



TopSpeedLimitController.prototype.apply = function apply( entity , period )
{
	var speed = entity.boundVector.vector.getLength() ;
	
	if ( speed > entity.data.topSpeed )
	{
		// Top-Speed violation, just brake!
		this.accel.setVector( entity.boundVector.vector ).inv().setLength( this.topSpeedViolationBrake ) ;
		entity.boundVector.vector.apply( this.accel , period ) ;
		return ;
	}
	
	this.speedVector.setVector( entity.input.speedVector ).capLength( entity.data.topSpeed ) ;
	this.accel.setVector( this.speedVector ).sub( entity.boundVector.vector ) ;
	
	// Nothing to do: accel is null
	if ( this.accel.isNull() ) { return ; }
	
	this.accelDir.setVector( this.accel ).normalize() ;
	this.penalty.setVector( entity.boundVector.vector ).div( entity.data.topSpeed )
	
	var rate = 1 - this.penalty.dot( this.accelDir ) ;
	var maxAcceleration = rate * entity.data.baseAcceleration ;
	
	this.accel.capLength( maxAcceleration ) ;
	
	entity.boundVector.vector.apply( this.accel , period ) ;
} ;


