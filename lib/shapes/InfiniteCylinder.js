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

function InfiniteCylinder( radius ) { return InfiniteCylinder.create( radius ) ; }
InfiniteCylinder.prototype = Object.create( Shape.prototype ) ;
InfiniteCylinder.prototype.constructor = InfiniteCylinder ;

module.exports = InfiniteCylinder ;



InfiniteCylinder.create = function create( axis , radius )
{
	var bbox = physic.BoundingBox3D() ;
	
	axis = axis || { x: 0 , y: 0 , z: 1 } ;
	
	if ( axis.x ) { bbox.min.x = - Infinity ; bbox.max.x = Infinity ; }
	else { bbox.min.x = 0 ; bbox.max.x = 0 ; }
	
	if ( axis.y ) { bbox.min.y = - Infinity ; bbox.max.y = Infinity ; }
	else { bbox.min.y = 0 ; bbox.max.y = 0 ; }
	
	if ( axis.z ) { bbox.min.z = - Infinity ; bbox.max.z = Infinity ; }
	else { bbox.min.z = 0 ; bbox.max.z = 0 ; }
	
	return Shape.create(
		[ { type: physic.CYLINDER , surface: physic.InfiniteCylinder3D( 0 , 0 , 0 , axis.x , axis.y , axis.z , radius ) } ] ,
		bbox
	) ;
} ;


