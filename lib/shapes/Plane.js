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

function Plane( normal ) { return Plane.create( normal ) ; }
Plane.prototype = Object.create( Shape.prototype ) ;
Plane.prototype.constructor = Plane ;

module.exports = Plane ;



Plane.create = function create( normal )
{
	var bbox = physic.BoundingBox3D() ;
	
	if ( normal.y || normal.z ) { bbox.min.x = - Infinity ; bbox.max.x = Infinity ; }
	else if ( normal.x > 0 ) { bbox.min.x = - Infinity ; bbox.max.x = 0 ; }
	else { bbox.min.x = 0 ; bbox.max.x = Infinity ; }
	
	if ( normal.x || normal.z ) { bbox.min.y = - Infinity ; bbox.max.y = Infinity ; }
	else if ( normal.y > 0 ) { bbox.min.y = - Infinity ; bbox.max.y = 0 ; }
	else { bbox.min.y = 0 ; bbox.max.y = Infinity ; }
	
	if ( normal.x || normal.y ) { bbox.min.z = - Infinity ; bbox.max.z = Infinity ; }
	else if ( normal.z > 0 ) { bbox.min.z = - Infinity ; bbox.max.z = 0 ; }
	else { bbox.min.z = 0 ; bbox.max.z = Infinity ; }
	
	return Shape.create(
		[ {
			type: physic.PLANE ,
			surface: physic.Plane3D.fromNormal( 0 , 0 , 0 , normal.x , normal.y , normal.z )
		} ] ,
		bbox ,
		false ,
		true
	) ;
} ;


