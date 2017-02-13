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
	* topSpeed: the maximum top speed (entity.boundVector.vector norm)
	* maxAcceleration: the maximum acceleration at zero speed
	* topSpeedViolationBrake: used when the entity move faster than its top-speed
*/
TopSpeedLimitController.create = function create( params )
{
	var self = Object.create( TopSpeedLimitController.prototype , {
		maxAcceleration: { value: params.maxAcceleration || 1 , writable: true , enumerable: true } ,
		topSpeed: { value: params.topSpeed || 1 , writable: true , enumerable: true } ,
		topSpeedViolationBrake: { value: params.topSpeedViolationBrake || 1 , writable: true , enumerable: true } ,
		
		speedVector: { value: physic.Vector3D() , enumerable: true } ,
		
		accel: { value: physic.Vector3D() , enumerable: true } ,
		accelDir: { value: physic.Vector3D() , enumerable: true } ,
		penalty: { value: physic.Vector3D() , enumerable: true } ,
	} ) ;
	
	return self ;
} ;



TopSpeedLimitController.prototype.apply = function apply( entity , period )
{
	var speed = entity.boundVector.vector.getLength() ;
	
	if ( speed > this.topSpeed )
	{
		// Top-Speed violation, just brake!
		this.accel.setVector( entity.boundVector.vector ).inv().setLength( this.topSpeedViolationBrake ) ;
		entity.boundVector.vector.apply( this.accel , period ) ;
		return ;
	}
	
	this.speedVector.setVector( entity.controllerData.speedVector ).capLength( this.topSpeed ) ;
	this.accel.setVector( this.speedVector ).sub( entity.boundVector.vector ) ;
	this.accelDir.setVector( this.accel ).normalize() ;
	this.penalty.setVector( entity.boundVector.vector ).div( this.topSpeed )
	
	var rate = 1 - this.penalty.dot( this.accelDir ) ;
	var maxAcceleration = rate * this.maxAcceleration ;
	
	this.accel.capLength( maxAcceleration ) ;
	
	entity.boundVector.vector.apply( this.accel , period ) ;
} ;

