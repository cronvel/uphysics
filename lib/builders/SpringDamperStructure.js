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



const physic = require( './physic.js' ) ;



function SpringDamperStructure( params = {} ) {
	this.size = params.size || new physic.Vector3D( 1 , 1 , 1 ) ;
	this.subdivide = params.subdivide || 1 ;
}

module.expors = SpringDamperStructure ;



SpringDamperStructure.prototype.build = function( world ) {
	var i , j , k ,
		entities = [] ,
		dynamics = [] ;
	
	for ( i = 0 ; i <= this.subdivide ; i ++ ) {
		for ( j = 0 ; j <= this.subdivide ; j ++ ) {
			for ( k = 0 ; k <= this.subdivide ; k ++ ) {
				
			}
		}
	}
	
	return { entities , dynamics } ;
} ;

