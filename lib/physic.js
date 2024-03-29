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



const math = require( 'math-kit' ) ;
const geo = math.geometry ;



const physic = {} ;
module.exports = physic ;

Object.assign( physic , geo ) ;
physic.fn = math.fn ;

// Useful when Infinity is not an option
physic.FAR_AWAY = 1000000000000 ;	// 10^12
physic.nullVector = new physic.Vector3D( 0 , 0 , 0 ) ;

// Primitives types
physic.DOT = 1 ;
physic.PLANE = 2 ;
physic.SPHERE = 4 ;
physic.CYLINDER = 8 ;

// Constraint types
physic.FLAT_CONSTRAINT = 1 ;

physic.World = require( './World.js' ) ;
physic.Entity = require( './Entity.js' ) ;
physic.Material = require( './Material.js' ) ;
physic.MaterialInteraction = require( './MaterialInteraction.js' ) ;
physic.Shape = require( './Shape.js' ) ;

physic.dynamics = require( './dynamics/dynamics.js' ) ;
physic.builders = require( './builders/builders.js' ) ;

