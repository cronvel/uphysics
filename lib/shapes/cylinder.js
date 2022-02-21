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



const Shape = require( '../Shape.js' ) ;
const physic = require( '../physic.js' ) ;



module.exports = function( axis , radius , length ) {
	axis = physic.Vector3D.fromObject( axis ).normalize() ;

	var xLength = Math.abs( length * axis.x ) + 2 * radius * physic.hypot2( axis.y , axis.z ) ;
	var yLength = Math.abs( length * axis.y ) + 2 * radius * physic.hypot2( axis.x , axis.z ) ;
	var zLength = Math.abs( length * axis.z ) + 2 * radius * physic.hypot2( axis.x , axis.y ) ;

	var bbox = new physic.BoundingBox3D(
		-xLength / 2 , xLength / 2 ,
		-yLength / 2 , yLength / 2 ,
		-zLength / 2 , zLength / 2
	) ;

	var upPlaneOrigin = new physic.Vector3D( 0 , 0 , 0 ).moveAlong( axis , length / 2 ) ;
	var downPlaneOrigin = new physic.Vector3D( 0 , 0 , 0 ).moveAlong( axis , -length / 2 ) ;

	return new Shape(
		[
			{ type: physic.CYLINDER ,
				surface: physic.InfiniteCylinder3D.fromVectorsRadius( new physic.Vector3D( 0 , 0 , 0 ) , axis , radius ) } ,
			{ type: physic.PLANE ,
				surface: physic.Plane3D.fromVectors( upPlaneOrigin , axis ) } ,
			{ type: physic.PLANE ,
				surface: physic.Plane3D.fromVectors( downPlaneOrigin , axis.dup().inv() ) }
		] ,
		bbox
	) ;
} ;

