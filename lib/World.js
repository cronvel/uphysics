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



var physic = require( './physic.js' ) ;



function World( options ) { return World.create( options ) ; }
module.exports = World ;



World.create = function create( options )
{
	options = options || {} ;
	
	var self = Object.create( World.prototype , {
		period: { value: options.delay || ( options.fps && 1 / options.fps ) || 1 / 30 , writable: true , enumerable: true } ,
		entities: { value: [] , enumerable: true } ,
		dynamicEntities: { value: [] , enumerable: true } ,
		staticEntities: { value: [] , enumerable: true } ,
	} ) ;
	
	return self ;
} ;



World.prototype.addEntity = function addEntity( entity )
{
	entity.world = this ;
	
	if ( entity.isStatic ) { this.staticEntities.push( entity ) ; }
	else { this.dynamicEntities.push( entity ) ; }
	
	this.entities.push( entity ) ;
} ;



World.prototype.update = function update( period )
{
	var i , j , entity , altEntity ,
		allLen = this.entities.length ,
		dynamicLen = this.dynamicEntities.length ,
		staticLen = this.staticEntities.length ;
	
	period = period || this.period ;
	
	// Prepare the frame calculation
	for ( i = 0 ; i < allLen ; i ++ )
	{
		this.entities[ i ].prepareFrame() ;
	}
	
	// Move entities using their own speed vector
	for ( i = 0 ; i < dynamicLen ; i ++ )
	{
		this.dynamicEntities[ i ].move( period ) ;
	}
	
	// Solve interaction between dynamic and static entities first
	for ( i = 0 ; i < dynamicLen ; i ++ )
	{
		for ( j = 0 ; j < staticLen ; j ++ )
		{
			this.dynamicEntities[ i ].interaction( this.staticEntities[ j ] , period ) ;
		}
	}
	
	// Then solve interaction between dynamic entities
	for ( i = 0 ; i < dynamicLen ; i ++ )
	{
		for ( j = i + 1 ; j < dynamicLen ; j ++ )
		{
			this.dynamicEntities[ i ].interaction( this.dynamicEntities[ j ] , period ) ;
		}
	}
} ;


