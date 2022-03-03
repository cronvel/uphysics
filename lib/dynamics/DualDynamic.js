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



const Dynamic = require( './Dynamic.js' ) ;
const physic = require( '../physic.js' ) ;



// It's like Dynamic, but it's a special case where there is always 2 linked entities (e.g.: spring-damper)

function DualDynamic( params = {} ) {
	this.entities = [ ... params.entities ] ;
	if ( this.entities.length > 2 ) { this.entities.length = 2 ; }

	// When set, auto-remove the dynamic when there is no more entity linked to it
	this.autoRemove = !! params.autoRemove ;
}

DualDynamic.prototype = Object.create( Dynamic ) ;
DualDynamic.prototype.constructor = DualDynamic ;

module.exports = DualDynamic ;



DualDynamic.prototype.linkEntity = function( entity ) {
	if ( this.entities.length >= 2 ) { return ; }
	this.entities.push( entity ) ;
} ;



// To be subclassed
DualDynamic.prototype.apply = function() {
	if ( this.entities.length !== 2 ) { return ; }
} ;

