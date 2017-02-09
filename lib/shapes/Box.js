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

function Box( xLength , yLength , zLength ) { return Box.create( xLength , yLength , zLength ) ; }
Box.prototype = Object.create( Shape.prototype ) ;
Box.prototype.constructor = Box ;

module.exports = Box ;



Box.create = function create( xLength , yLength , zLength )
{
	var bbox = physic.BoundingBox3D(
		- xLength / 2 , xLength / 2 ,
		- yLength / 2 , yLength / 2 ,
		- zLength / 2 , zLength / 2
	) ;
	
	return Shape.create(
		[
			{ type: physic.PLANE , surface: physic.Plane3D.fromNormal( - xLength / 2 , 0 , 0 , -1 , 0 , 0 ) } ,
			{ type: physic.PLANE , surface: physic.Plane3D.fromNormal( xLength / 2 , 0 , 0 , 1 , 0 , 0 ) } ,
			{ type: physic.PLANE , surface: physic.Plane3D.fromNormal( 0 , - yLength / 2 , 0 , 0 , -1 , 0 ) } ,
			{ type: physic.PLANE , surface: physic.Plane3D.fromNormal( 0 , yLength / 2 , 0 , 0 , 1 , 0 ) } ,
			{ type: physic.PLANE , surface: physic.Plane3D.fromNormal( 0 , 0 , - zLength / 2 , 0 , 0 , -1 ) } ,
			{ type: physic.PLANE , surface: physic.Plane3D.fromNormal( 0 , 0 , zLength / 2 , 0 , 0 , 1 ) }
		] ,
		bbox
	) ;
} ;


