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



const RPM_TO_RAD_PER_SEC = Math.PI / 30 ;
const RAD_PER_SEC_TO_RPM = 30 / Math.PI ;

function Motor( params ) {
	this.torqueData = params.torqueData ;
	this.brakeTorquePerAngularSpeed = params.brakeTorquePerAngularSpeed ?? ( params.brakeTorquePerRpm || 0.1 ) / RPM_TO_RAD_PER_SEC ;
	this.brakeTorqueMinAngularSpeed = params.brakeTorqueMinAngularSpeed ?? ( params.brakeTorqueMinRpm || 1000 ) * RPM_TO_RAD_PER_SEC ;
	this.motorInertia = params.motorInertia || 1 ;

	this.throttle = 0 ;
	this.angularSpeed = params.angularSpeed ?? ( params.rpm * RPM_TO_RAD_PER_SEC || this.brakeTorqueMinAngularSpeed ) ;
	this.torque = 0 ;

	this.torqueFn = null ;
	this.torqueControlPoints = null ;
	this.buildTorqueFn() ;
}

module.exports = Motor ;



function ControlPoint( motor , angularSpeed , fullThrottleTorque ) {
	this.motor = motor ;
	this.x = this.angularSpeed = angularSpeed ;
	this.fx = this.torque = this.fullThrottleTorque = fullThrottleTorque ;
	this.update() ;
}



ControlPoint.prototype.update = function() {
	this.dfx = null ;	// If we don't erase it, InterpolatedFn will use it as it is
	var brakeTorque = this.motor.getBrakeTorque( this.angularSpeed ) ;
	this.fx = this.torque = brakeTorque + ( this.fullThrottleTorque - brakeTorque ) * this.motor.throttle ;
} ;



Motor.prototype.buildTorqueFn = function() {
	this.torqueControlPoints = this.torqueData.map( cp => new ControlPoint(
		this ,
		cp.angularSpeed ?? cp.rpm * RPM_TO_RAD_PER_SEC ,
		cp.torque
	) ) ;
	
	this.torqueFn = new physic.fn.InterpolatedFn( this.torqueControlPoints , { preserveExtrema: true , atanMeanDfx: false } ) ;
} ;



Motor.prototype.updateTorqueFn = function() {
	this.torqueControlPoints.forEach( cp => cp.update() ) ;
	this.torqueFn.updateFromControlPoints() ;
	//console.log( this.torqueControlPoints.map( cp => ( { x: cp.x, fx: cp.fx } ) ) ) ;
	//console.log( this.torqueFn.bands.map( b => ( { min: b.min, max: b.max, coef: b.fn.coefficients } ) ) ) ;
} ;



Motor.prototype.setThrottle = function( throttle ) {
	this.throttle = Math.min( Math.max( 0 , throttle ) , 1 ) ;
	this.updateTorqueFn() ;
} ;



Motor.prototype.getBrakeTorque = function( angularSpeed = this.angularSpeed ) {
	return Math.min( 0 , - this.brakeTorquePerAngularSpeed * ( angularSpeed - this.brakeTorqueMinAngularSpeed ) ) ;
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

Object.defineProperties( Motor.prototype , {
	rpm: { get: function() { return this.angularSpeed * RAD_PER_SEC_TO_RPM ; } } ,
	power: { get: function() { return this.torque * this.angularSpeed ; } } ,
	horsePower: { get: function() { return this.torque * this.angularSpeed / 746 ; } }
} ) ;



Motor.prototype.apply = function( period ) {
	this.torque = this.torqueFn.fx( this.angularSpeed ) ;

	var angularAccel = this.torque / this.motorInertia ;
	this.angularSpeed += angularAccel * period ;

	if ( this.angularSpeed < 0 ) { this.angularSpeed = 0 ; }
} ;

