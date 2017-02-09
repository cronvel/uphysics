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



function MaterialInteraction( params ) { return MaterialInteraction.create( params ) ; }
module.exports = MaterialInteraction ;



//var physic = require( './physic.js' ) ;



MaterialInteraction.create = function create( params )
{
	params = params || {} ;
	
	var self = Object.create( MaterialInteraction.prototype , {
		//priority: { value: params.priority || 0 , writable: true , enumerable: true } ,
		
		// High quality interaction
		hq: { value: !! params.hq , writable: true , enumerable: true } ,
		
		// Collision/bounce interactions
		
		// A fixed absolute value substracted to the speed vector, that make an entity sticks to another,
		// rather than micro-bouncing forever
		debounce: { value: params.debounce || 0 , writable: true , enumerable: true } ,
		// The normal speed rate of the entity after the bounce
		normalBounceRate: { value: params.normalBounceRate || 1 , writable: true , enumerable: true } ,
		// The tangential speed rate of the entity after the bounce
		tangentBounceRate: { value: params.tangentBounceRate || 1 , writable: true , enumerable: true } ,
		
		
		// Contact/inside interactions
		
		// For gravity, wind, etc... a Vector3D
		force: { value: params.force || null , writable: true , enumerable: true } ,
		// A fixed force that slow down
		friction: { value: params.friction || 0 , writable: true , enumerable: true } ,
		// A proportional force that slow down
		frictionRate: { value: params.frictionRate || 0 , writable: true , enumerable: true } ,
	} ) ;
	
	return self ;
} ;


