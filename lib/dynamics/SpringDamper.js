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



const DualDynamic = require( './DualDynamic.js' ) ;
const physic = require( '../physic.js' ) ;



function SpringDamper( params = {} ) {
	DualDynamic.call( this , params ) ;
	this.springK = params.springK ?? 0 ;
	this.dampingFactor = params.dampingFactor ?? 0 ;
	this.restLength = params.restLength ?? 0 ;
}

SpringDamper.prototype = Object.create( DualDynamic.prototype ) ;
SpringDamper.prototype.constructor = SpringDamper ;

module.exports = SpringDamper ;



const RELATIVE_POSITION = new physic.Vector3D( 0 , 0 , 0 ) ;
const RELATIVE_VELOCITY = new physic.Vector3D( 0 , 0 , 0 ) ;

SpringDamper.prototype.apply = function() {
	if ( this.entities.length !== 2 ) { return ; }

	var distance , relativeVelocity , force ,
		entityA = this.entities[ 0 ] ,
		entityB = this.entities[ 1 ] ;

	// A->B
	RELATIVE_POSITION.setSub( entityB.nextPosition , entityA.nextPosition ) ;
	distance = RELATIVE_POSITION.getLength() ;

	// B's velocity in the A referential (relative to A)
	RELATIVE_VELOCITY.setSub( entityB.nextVelocity , entityA.nextVelocity ) ;

	if ( distance ) {
		RELATIVE_POSITION.div( distance ) ;	// normalize, but since we already computed the length, we avoid doing it twice
	}
	else {
		RELATIVE_POSITION.set( 0 , 1 , 0 ) ;	// default direction for null vector
	}

	relativeVelocity = RELATIVE_POSITION.dot( RELATIVE_VELOCITY ) ;	// since it is already normalized, this gives us the projection vector

	force = ( this.restLength - distance ) * this.springK - relativeVelocity * this.dampingFactor ;
	//console.log( "SpringDamper -- distance:" , distance , "  relativeVelocity:" , relativeVelocity , "  force:" , force ) ;
	entityB.nextForces.apply( RELATIVE_POSITION , force ) ;
	entityA.nextForces.apply( RELATIVE_POSITION , -force ) ;
} ;

