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
		angularMass: { value: params.angularMass || 1 , writable: true , enumerable: true } ,
	} ) ;
	
	return self ;
} ;



MotorController.prototype.init = function init( entity )
{
	entity.extra.rpm = entity.extra.rpm || 0 ;
	
	entity.input.gas = entity.input.gas || 0 ;
} ;



/*
	Torque: unit in N.m (newton.meter or kg.m.s-2)
	Power: Torque (N.m) * Angular speed (radian per second) = Power (Watt)
	HorsePower: 1 hp = 746 W
	Rpm: 1 rpm = Pi/30 radian.s-1
	So, Power (hp) = Torque (kg.m.s-2) * Rpm (rpm) * Pi / 22380
*/



const RPM_TO_RAD_PER_SEC = Math.PI / 30 ;
const RAD_PER_SEC_TO_RPM = 30 / Math.PI ;



MotorController.prototype.apply = function apply( entity , period )
{
	var torque = this.torqueFn( entity.extra.rpm ) * entity.input.gas ;
	var angularAccel = torque / this.angularMass ;
	entity.extra.rpm += angularAccel * RAD_PER_SEC_TO_RPM / period ;
} ;


