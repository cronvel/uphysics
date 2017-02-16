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



function MotorController( params ) { return MotorController.create( params ) ; }
module.exports = MotorController ;



/*
	Params:
*/
MotorController.create = function create( params )
{
	var self = Object.create( MotorController.prototype , {
		torqueFn: { value: params.torqueFn , writable: true , enumerable: true } ,
		motorInertia: { value: params.motorInertia || 1 , writable: true , enumerable: true } ,
		engineBrakingTorquePerRpm: { value: params.engineBrakingTorquePerRpm || 0.1 , writable: true , enumerable: true } ,
	} ) ;
	
	return self ;
} ;



MotorController.prototype.init = function init( entity )
{
	entity.data.rpm = entity.data.rpm || 0 ;
	
	entity.input.throttle = entity.input.throttle || 0 ;
} ;



/*
	Torque unit: N.m (newton.meter or kg.m.s-2), also: 1 lbf.ft = 1.355818 N.m
	Power (W) = Torque (N.m) * Angular speed (radian per second)
	HorsePower: 1 hp = 746 W
	Rpm: 1 rpm = π/30 radian.s-1
	So, Power (hp) = Torque (kg.m.s-2) * Rpm (rpm) * π / 22380
	
	Inertia: here it is the sum of mass and moment of inertia of the whole engine.
	Moment of inertia formula for at a point is: I = mr² (m: mass, r: radius).
*/



const RPM_TO_RAD_PER_SEC = Math.PI / 30 ;
const RAD_PER_SEC_TO_RPM = 30 / Math.PI ;



MotorController.prototype.apply = function apply( entity , period )
{
	var torque , angularAccel ;
	
	if ( entity.input.throttle < 0 )
	{
		// engine braking
		torque = this.engineBrakingTorquePerRpm * entity.data.rpm * Math.max( entity.input.throttle , -1 ) ;
	}
	else
	{
		torque = this.torqueFn( entity.data.rpm ) * Math.min( entity.input.throttle , 1 ) ;
	}
	
	angularAccel = torque / this.motorInertia ;
	entity.data.rpm += angularAccel * RAD_PER_SEC_TO_RPM * period ;
	
	if ( entity.data.rpm < 0 ) { entity.data.rpm = 0 ; }
} ;


