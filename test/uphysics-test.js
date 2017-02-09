/*
	Coding Soccer
	
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

/* jshint unused:false */
/* global describe, it, before, after */



var physic = require( '../lib/physic.js' ) ;
var expect = require( 'expect.js' ) ;



			/* Tests */



describe( "Shape continuous collisions" , function() {
	
	it( "dot against box" , function() {
		var r ;
		var dotShape = physic.Shape.Dot.create() ;
		var dotPos = physic.Vector3D( 0 , 0 , 0 ) ;
		var dotOldPos = physic.Vector3D( 5 , 0 , 0 ) ;
		var boxShape = physic.Shape.Box.create( 3 , 4 , 5 ) ;
		var boxPos = physic.Vector3D( 0 , 0 , 0 ) ;
		var boxOldPos = physic.Vector3D( 0 , 0 , 0 ) ;
		
		r = dotShape.getContinuousCollision( dotOldPos , dotPos , boxShape , boxOldPos , boxPos ) ;
		console.log( r ) ;
		expect( r.t ).to.be( 0.7 ) ;
		expect( r.displacement ).to.eql( { x: 1.5, y: 0, z: 0 } ) ;
		expect( r.normal ).to.eql( { x: 1, y: 0, z: 0 } ) ;
		
		r = boxShape.getContinuousCollision( boxOldPos , boxPos , dotShape , dotOldPos , dotPos ) ;
		console.log( r ) ;
		expect( r.t ).to.be( 0.7 ) ;
		expect( r.displacement ).to.eql( { x: -1.5, y: 0, z: 0 } ) ;
		expect( r.normal ).to.eql( { x: -1, y: 0, z: 0 } ) ;
	} ) ;
} ) ;

