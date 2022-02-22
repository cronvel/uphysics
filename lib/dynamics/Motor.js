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



function Motor( params ) {
	this.torquePerRpm = params.torquePerRpm ;
	this.brakeTorquePerRpm = params.brakeTorquePerRpm || 0.1 ;
	this.brakeTorqueMinRpm = params.brakeTorqueMinRpm || 1000 ;
	this.motorInertia = params.motorInertia || 1 ;

	this.throttle = 0 ;
	this.rpm = params.rpm || this.brakeTorqueMinRpm ;
	this.torque = 0 ;

	this.torqueFn = null ;
	this.torqueControlPoints = null ;
	this.buildTorqueFn() ;
}

module.exports = Motor ;



Motor.prototype.init = function( entity ) {
	entity.data.rpm = entity.data.rpm || 0 ;
	entity.input.throttle = entity.input.throttle || 0 ;
} ;



function ControlPoint( motor , rpm , fullThrottleTorque ) {
	this.motor = motor ;
	this.x = this.rpm = rpm ;
	this.fx = this.torque = this.fullThrottleTorque = fullThrottleTorque ;

	Object.defineProperty( this , 'fx_' , {
		get: () => {
			var brakeTorque = this.motor.getBrakeTorque( this.motor.throttle , this.rpm ) ;
			this.torque = brakeTorque + ( this.fullThrottleTorque - brakeTorque ) * this.motor.throttle ;
			return this.torque ;
		}
	} ) ;
}

ControlPoint.prototype.update = function() {
	var brakeTorque = this.motor.getBrakeTorque( this.rpm ) ;
	this.fx = this.torque = brakeTorque + ( this.fullThrottleTorque - brakeTorque ) * this.motor.throttle ;
} ;



Motor.prototype.buildTorqueFn = function() {
	this.torqueControlPoints = this.torquePerRpm.map( cp => new ControlPoint( this , cp.rpm , cp.torque ) ) ;
	//console.log( this.torqueControlPoints ) ; process.exit() ;
	this.torqueFn = new physic.fn.InterpolatedFn( this.torqueControlPoints , { preserveExtrema: true , atanMeanSlope: true } ) ;
} ;



Motor.prototype.updateTorqueFn = function() {
	this.torqueControlPoints.forEach( cp => cp.update() ) ;
	this.torqueFn.updateFromControlPoints() ;
	//console.log( this.torqueControlPoints.map( cp => ( { x: cp.x, fx: cp.fx } ) ) ) ;
} ;



Motor.prototype.setThrottle = function( throttle ) {
	this.throttle = Math.min( Math.max( 0 , throttle ) , 1 ) ;
	this.updateTorqueFn() ;
} ;



Motor.prototype.getBrakeTorque = function( rpm = this.rpm ) {
	return Math.min( 0 , - this.brakeTorquePerRpm * ( rpm - this.brakeTorqueMinRpm ) ) ;
} ;



/*
	Torque unit: N.m (newton.meter or kg.m.s-2), also: 1 lbf.ft = 1.355818 N.m
	Power (W) = Torque (N.m) * Angular speed (radian per second)
	HorsePower: 1 hp = 746 W
	Rpm: 1 rpm = π/30 radian.s-1
	So, Power (hp) = Torque (kg.m.s-2) * Rpm (rpm) * π / 22380

	Inertia: here it is the sum of mass and moment of inertia of the whole engine.
	Moment of inertia formula at a point is: I = mr² (m: mass, r: radius).
*/



const RPM_TO_RAD_PER_SEC = Math.PI / 30 ;
const RAD_PER_SEC_TO_RPM = 30 / Math.PI ;



Motor.prototype.apply = function( period ) {
	this.torque = this.torqueFn.fx( this.rpm ) ;

	var angularAccel = this.torque / this.motorInertia ;
	this.rpm += angularAccel * RAD_PER_SEC_TO_RPM * period ;

	if ( this.rpm < 0 ) { this.rpm = 0 ; }
} ;

