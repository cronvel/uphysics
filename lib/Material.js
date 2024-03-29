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



var autoId = 0 ;

function Material( params = {} ) {
	this.id = params.id || 'material#' + autoId ++ ;
	this.isSolid = !! params.isSolid ;
	this.interactions = new Map() ;
}

module.exports = Material ;



/*
	Passing null for an interaction means that collision will be computed anyway.
	If an interaction exists in the instance map, a reverseInteraction MUST exist or be null in the target map.
*/
Material.prototype.setInteractionWith = function( material , interaction , reverseInteraction ) {
	this.interactions.set( material , interaction || null ) ;

	// If the material interacts with a distinct material, try to add the reverseInteraction too...
	if ( this !== material ) {
		material.interactions.set( this , reverseInteraction || null ) ;
	}
} ;



Material.prototype.setSelfInteraction = function( interaction ) {
	return this.setInteractionWith( this , interaction ) ;
} ;

