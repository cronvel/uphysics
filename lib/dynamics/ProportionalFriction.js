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



// Proportional friction value, it depends on the speed vector

function ProportionalFriction( axis , acceleration ) { return ProportionalFriction.create( vector ) ; }
module.exports = ProportionalFriction ;



ProportionalFriction.create = function create( frictionRate )
{
	var self = Object.create( ProportionalFriction.prototype ) ;
	self.frictionRate = + frictionRate ;
	return self ;
} ;



ProportionalFriction.prototype.apply = function apply( entity , period )
{
	entity.boundVector.vector.mul( 1 - ( this.frictionRate * period ) ) ;
} ;

