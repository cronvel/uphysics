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



// Absolute/constant friction value, independent of the speed vector of the entity

function ConstantFriction( axis , acceleration ) { return ConstantFriction.create( vector ) ; }
module.exports = ConstantFriction ;



ConstantFriction.create = function create( friction )
{
	var self = Object.create( ConstantFriction.prototype ) ;
	self.friction = + friction ;
	return self ;
} ;



ConstantFriction.prototype.apply = function apply( entity , period )
{
	entity.boundVector.vector.reduceLength( this.friction * period ) ;
} ;
