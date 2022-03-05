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

	this.size =
		params.size instanceof physic.Vector3D ? params.size :
		typeof params.size === 'number' ? new physic.Vector3D( params.size , params.size , params.size ) :
		new physic.Vector3D( 1 , 1 , 1 ) ;

	this.subdivide =
		params.subdivide instanceof physic.Vector3D ? params.subdivide :
		typeof params.subdivide === 'number' ? new physic.Vector3D( params.subdivide , params.subdivide , params.subdivide ) :
		new physic.Vector3D( 1 , 1 , 1 ) ;

	this.dynamics = params.dynamics || [] ;

	if ( ! params.material ) { throw new Error( "SpringDamperStructure() requires parameter material" ) ; }
	this.material = params.material ;
	
	this.mass = params.mass || 1 ;
	this.springK = params.springK || 1 ;
	this.dampingFactor = params.dampingFactor || 1 ;
	
	this.centerOfMass = params.centerOfMass instanceof physic.Vector3D ? params.centerOfMass : null ;

	this.randomDisplacement = params.randomDisplacement || 0 ;
}

module.exports = SpringDamperStructure ;



function random( l ) {
	return -l + 2 * l * Math.random() ;
}



SpringDamperStructure.prototype.build = function( world , position ) {
	var i , j , k , x , y , z , entity ,
		iMul = ( this.subdivide.z + 1 ) * ( this.subdivide.y + 1 ) ,
		jMul = ( this.subdivide.z + 1 ) ,
		entities = [] ,
		dynamics = [] ;
	
	var link = ( i1 , j1 , k1  , i2 , j2 , k2 ) => {
		let e1 = entities[ i1 * iMul + j1 * jMul + k1 ] ,
			e2 = entities[ i2 * iMul + j2 * jMul + k2 ] ;
		
		let dynamic = world.createDynamic( physic.dynamics.SpringDamper , {
			springK: this.springK ,
			dampingFactor: this.dampingFactor ,
			restLength: e1.position.pointDistance( e2.position )
		} ) ;
		
		dynamic.linkEntities( e1 , e2 ) ;
		dynamics.push( dynamic ) ;
	} ;


	var linkClosest = ( toEntity , exclusion , xside , yside , zside ) => {
		let closestDist = Infinity ,
			closest = null ,
			position = toEntity.position ;
		
		for ( let otherEntity of entities ) {
			let otherPosition = otherEntity.position ;
			
			if (
				exclusion.has( otherEntity )
				|| ( xside > 0 ? otherPosition.x <= position.x : xside < 0 ? otherPosition.x >= position.x : false )
				|| ( yside > 0 ? otherPosition.y <= position.y : yside < 0 ? otherPosition.y >= position.y : false )
				|| ( zside > 0 ? otherPosition.z <= position.z : zside < 0 ? otherPosition.z >= position.z : false )
			) {
				continue ;
			}
			
			let dist = otherPosition.pointDistance( position ) ;
			if ( dist < closestDist ) {
				closestDist = dist ;
				closest = otherEntity ;
			}
		}
		
		if ( closest ) {
			let dynamic = world.createDynamic( physic.dynamics.SpringDamper , {
				springK: this.springK ,
				dampingFactor: this.dampingFactor ,
				restLength: closestDist
			} ) ;

			dynamic.linkEntities( toEntity , closest ) ;
			dynamics.push( dynamic ) ;
			exclusion.add( closest ) ;
		}
	} ;


	for ( i = 0 ; i <= this.subdivide.x ; i ++ ) {
		for ( j = 0 ; j <= this.subdivide.y ; j ++ ) {
			for ( k = 0 ; k <= this.subdivide.z ; k ++ ) {
				x = position.x - this.size.x / 2 + i * this.size.x / this.subdivide.x ;
				y = position.y - this.size.y / 2 + j * this.size.y / this.subdivide.y ;
				z = position.z - this.size.z / 2 + k * this.size.z / this.subdivide.z ;
				
				entity = world.createEntity( {
					id: this.id + '#' + ( this.idCounter ++ ) ,
					shape: dotShape ,
					material: this.material ,
					x , y , z ,
					mass: this.mass
				} ) ;
				
				entities.push( entity ) ;
			}
		}
	}

	for ( i = 0 ; i <= this.subdivide.x ; i ++ ) {
		for ( j = 0 ; j <= this.subdivide.y ; j ++ ) {
			for ( k = 0 ; k <= this.subdivide.z ; k ++ ) {
				if ( i ) { link( i , j , k , i - 1 , j , k ) ; }
				if ( j ) { link( i , j , k , i , j - 1 , k ) ; }
				if ( k ) { link( i , j , k , i , j , k - 1 ) ; }
				if ( k && i ) { link( i , j , k , i - 1 , j , k - 1 ) ; }
				if ( i && j ) { link( i , j , k , i - 1 , j - 1 , k ) ; }
				if ( j && k ) { link( i , j , k , i , j - 1 , k - 1 ) ; }
				if ( k && i < this.subdivide.x ) { link( i , j , k , i + 1 , j , k - 1 ) ; }
				if ( i && j < this.subdivide.y ) { link( i , j , k , i - 1 , j + 1 , k ) ; }
				if ( j && k < this.subdivide.z ) { link( i , j , k , i , j - 1 , k + 1 ) ; }
			}
		}
	}
	
	if ( this.centerOfMass ) {
		entity = world.createEntity( {
			id: this.id + '#' + ( this.idCounter ++ ) ,
			shape: dotShape ,
			material: this.material ,
			position: position.dup().add( this.centerOfMass ) ,
			mass: this.mass
		} ) ;
		
		let exclusion = new Set() ;
		
		linkClosest( entity , exclusion , 1 , 1 , 1 ) ;
		linkClosest( entity , exclusion , 1 , 1 , -1 ) ;
		linkClosest( entity , exclusion , 1 , -1 , 1 ) ;
		linkClosest( entity , exclusion , 1 , -1 , -1 ) ;
		linkClosest( entity , exclusion , -1 , 1 , 1 ) ;
		linkClosest( entity , exclusion , -1 , 1 , -1 ) ;
		linkClosest( entity , exclusion , -1 , -1 , 1 ) ;
		linkClosest( entity , exclusion , -1 , -1 , -1 ) ;

		linkClosest( entity , exclusion , 1 , 0 , 0 ) ;
		linkClosest( entity , exclusion , -1 , 0 , 0 ) ;
		linkClosest( entity , exclusion , 0 , 1 , 0 ) ;
		linkClosest( entity , exclusion , 0 , -1 , 0 ) ;
		linkClosest( entity , exclusion , 0 , 0 , 1 ) ;
		linkClosest( entity , exclusion , 0 , 0 , -1 ) ;

		entities.push( entity ) ;
	}

	for ( let dynamic of this.dynamics ) {
		dynamic.linkEntities( ... entities ) ;
	}
	
	if ( this.randomDisplacement ) {
		for ( entity of entities ) {
			entity.position.x += random( this.randomDisplacement ) ;
			entity.position.y += random( this.randomDisplacement ) ;
			entity.position.z += random( this.randomDisplacement ) ;
		}
	}
	return { entities , dynamics } ;
} ;

