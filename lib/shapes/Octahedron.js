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

"use strict" ;



var Shape = require( '../Shape.js' ) ;
var physic = require( '../physic.js' ) ;

function Octahedron( xLength , yLength , zLength ) { return Octahedron.create( xLength , yLength , zLength ) ; }
Octahedron.prototype = Object.create( Shape.prototype ) ;
Octahedron.prototype.constructor = Octahedron ;

module.exports = Octahedron ;



// Create an octahedron where each vertex is in a cardinal direction
Octahedron.create = function create( length )
{
	// It's easier to compute using the "radius"
	length /= 2 ;
	
	var up = physic.Vector3D( 0 , 0 , length ) ;
	var down = physic.Vector3D( 0 , 0 , - length ) ;
	var left = physic.Vector3D( - length  , 0 , 0 ) ;
	var right = physic.Vector3D( length  , 0 , 0 ) ;
	var forward = physic.Vector3D( 0 , length  , 0 ) ;
	var backward = physic.Vector3D( 0 , - length  , 0 ) ;
	
	var bbox = physic.BoundingBox3D(
		- length  , length  ,
		- length  , length  ,
		- length  , length 
	) ;
	
	return Shape.create(
		[
			{ type: physic.PLANE , surface: physic.Plane3D.fromThreePoints( up , left , backward ) } ,
			{ type: physic.PLANE , surface: physic.Plane3D.fromThreePoints( up , backward , right ) } ,
			{ type: physic.PLANE , surface: physic.Plane3D.fromThreePoints( up , right , forward ) } ,
			{ type: physic.PLANE , surface: physic.Plane3D.fromThreePoints( up , forward , left ) } ,
			{ type: physic.PLANE , surface: physic.Plane3D.fromThreePoints( down , left , forward ) } ,
			{ type: physic.PLANE , surface: physic.Plane3D.fromThreePoints( down , forward , right ) } ,
			{ type: physic.PLANE , surface: physic.Plane3D.fromThreePoints( down , right , backward ) } ,
			{ type: physic.PLANE , surface: physic.Plane3D.fromThreePoints( down , backward , left ) }
		] ,
		bbox
	) ;
} ;


