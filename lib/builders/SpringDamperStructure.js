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



const physic = require( '../physic.js' ) ;
var dotShape = physic.Shape.createDot() ;



function SpringDamperStructure( params = {} ) {
	this.id = params.id || 'springDamperStructure' ;
	this.idCounter = 0 ;

	this.size = params.size || new physic.Vector3D( 1 , 1 , 1 ) ;
	this.subdivide = params.subdivide || 1 ;
	this.dynamics = params.dynamics || [] ;

	if ( ! params.material ) { throw new Error( "SpringDamperStructure() requires parameter material" ) ; }
	this.material = params.material ;
	
	this.mass = params.mass || 1 ;
	this.springK = params.springK || 1 ;
	this.dampingFactor = params.dampingFactor || 1 ;
}

module.exports = SpringDamperStructure ;



SpringDamperStructure.prototype.build = function( world , position ) {
	var i , j , k , x , y , z , entity ,
		jMul = ( this.subdivide + 1 ) ,
		iMul = jMul * jMul ,
		entities = [] ,
		dynamics = [] ;
	
	var link = ( i1 , j1 , k1  , i2 , j2 , k2 ) => {
		let dynamic = world.createDynamic( physic.dynamics.SpringDamper , {
			springK: this.springK ,
			dampingFactor: this.dampingFactor ,
			restLength: Math.hypot(
				( i1 - i2 ) * this.size.x / this.subdivide ,
				( j1 - j2 ) * this.size.y / this.subdivide ,
				( k1 - k2 ) * this.size.z / this.subdivide
			)
		} ) ;
		
		dynamic.linkEntities( entities[ i1 * iMul + j1 * jMul + k1 ] , entities[ i2 * iMul + j2 * jMul + k2 ] ) ;
		dynamics.push( dynamic ) ;
	} ;

	for ( i = 0 ; i <= this.subdivide ; i ++ ) {
		for ( j = 0 ; j <= this.subdivide ; j ++ ) {
			for ( k = 0 ; k <= this.subdivide ; k ++ ) {
				x = position.x - this.size.x / 2 + i * this.size.x / this.subdivide ;
				y = position.y - this.size.y / 2 + j * this.size.y / this.subdivide ;
				z = position.z - this.size.z / 2 + k * this.size.z / this.subdivide ;
				
				entity = world.createEntity( {
					id: this.id + ( this.idCounter ++ ) ,
					shape: dotShape ,
					material: this.material ,
					x , y , z ,
					mass: this.mass
				} ) ;
				
				entities.push( entity ) ;
			}
		}
	}

	for ( i = 0 ; i <= this.subdivide ; i ++ ) {
		for ( j = 0 ; j <= this.subdivide ; j ++ ) {
			for ( k = 0 ; k <= this.subdivide ; k ++ ) {
				if ( i ) { link( i , j , k , i - 1 , j , k ) ; }
				if ( j ) { link( i , j , k , i , j - 1 , k ) ; }
				if ( k ) { link( i , j , k , i , j , k - 1 ) ; }
				if ( i && j ) { link( i , j , k , i - 1 , j - 1 , k ) ; }
				if ( j && k ) { link( i , j , k , i , j - 1 , k - 1 ) ; }
				if ( k && i ) { link( i , j , k , i - 1 , j , k - 1 ) ; }
				if ( i && j < this.subdivide ) { link( i , j , k , i - 1 , j + 1 , k ) ; }
				if ( j && k < this.subdivide ) { link( i , j , k , i , j - 1 , k + 1 ) ; }
				if ( k && i < this.subdivide ) { link( i , j , k , i + 1 , j , k - 1 ) ; }
			}
		}
	}
	
	for ( let dynamic of this.dynamics ) {
		dynamic.linkEntities( ... entities ) ;
	}
	
	return { entities , dynamics } ;
} ;

