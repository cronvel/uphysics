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

/* jshint -W014 */

"use strict" ;



var physic = require( './physic.js' ) ;

var Logfella = require( 'logfella' ) ;
var log = Logfella.global.use( 'physic' ) ;



function Entity( params ) { return Entity.create( params ) ; }
module.exports = Entity ;



Entity.create = function create( params )
{
	var i , iMax ;
	
	params = params || {} ;
	
	var self = Object.create( Entity.prototype , {
		world: { value: params.world , writable: true , enumerable: true } ,
		isStatic: { value: !! params.isStatic , enumerable: true } ,
		is2D: { value: !! params.is2D , enumerable: true } ,
		mass: { value: params.mass || 1 , writable: true , enumerable: true } ,
		material: { value: params.material , writable: true , enumerable: true } ,
		shape: { value: params.shape || null , writable: true , enumerable: true } ,
		dynamics: { value: params.dynamics || [] , enumerable: true } ,
		boundVector: {
			writable: true , enumerable: true ,
			value: physic.BoundVector3D( params.x || 0 , params.y || 0 , params.z || 0 , 0 , 0 , 0 )
		} ,
		oldBoundVector: {
			writable: true , enumerable: true ,
			value: physic.BoundVector3D( params.x || 0 , params.y || 0 , params.z || 0 , 0 , 0 , 0 )
		} ,
		//accelVector: { value: new physic.Vector3D( 0 , 0 , 0 ) , writable: true , enumerable: true } ,
		frameInteractions: { value: [] , writable: true , enumerable: true } ,
		
		// Userland data used to controle the entity
		input: { value: {} , enumerable: true } ,
		
		// Internal extra data
		extra: { value: {} , enumerable: true } ,
	} ) ;
	
	// Init the entity for each dynamic
	for ( i = 0 , iMax = self.dynamics.length ; i < iMax ; i ++ )
	{
		if ( self.dynamics[ i ].init ) { self.dynamics[ i ].init( self ) ; }
	}
	
	return self ;
} ;



Entity.prototype.prepareFrame = function prepareFrame()
{
	this.frameInteractions.length = 0 ;
	this.oldBoundVector.setBoundVector( this.boundVector ) ;
} ;



Entity.prototype.update = function update( period )
{
	var i , dynLen = this.dynamics.length ;
	
	// First, apply all dynamic rules to the entity
	for ( i = 0 ; i < dynLen ; i ++ )
	{
		this.dynamics[ i ].apply( this , period ) ;
	}
	
	// Finally, apply the bound vector: move its position by its speed vector
	this.boundVector.apply( period ) ;
} ;



Entity.prototype.interaction = function interaction( withEntity , period )
{
	var matInteraction , invMatInteraction , collision , solid ;
	
	matInteraction = this.material.interactions.get( withEntity.material ) ;
	
	// Do nothing if no interactions are possible between those objects
	if ( matInteraction === undefined ) { return false ; }
	
	invMatInteraction = withEntity.material.interactions.get( this.material ) ;
	
	//log.info( "Checking %s vs %s" , this.material.id , withEntity.material.id ) ;
	
	solid = this.material.isSolid && withEntity.material.isSolid ;
	
	if ( solid )
	{
		if ( ( matInteraction && matInteraction.hq ) || ( invMatInteraction && invMatInteraction.hq ) )
		{
			collision =
				this.shape.isSweepingBboxOverlapping(
					this.oldBoundVector.position , this.boundVector.position ,
					withEntity.shape , withEntity.oldBoundVector.position , withEntity.boundVector.position )
				&& this.shape.getContinuousCollision(
					this.oldBoundVector.position , this.boundVector.position ,
					withEntity.shape , withEntity.oldBoundVector.position , withEntity.boundVector.position ) ;
		}
		else
		{
			collision =
				this.shape.isBboxOverlapping( this.boundVector.position , withEntity.shape , withEntity.boundVector.position )
				&& this.shape.getCollision( this.boundVector.position , withEntity.shape , withEntity.boundVector.position ) ;
		}
		
		if ( ! collision ) { return ; }
		
		if ( collision.displacement.isNull() )
		{
			this.influence( withEntity , matInteraction , invMatInteraction , period ) ;
		}
		else
		{
			this.collision( withEntity , collision , matInteraction , invMatInteraction , period ) ;
		}
	}
	else
	{
		if (
			! this.shape.isBboxOverlapping( this.boundVector.position , withEntity.shape , withEntity.boundVector.position )
			|| ! this.shape.isOverlapping( this.boundVector.position , withEntity.shape , withEntity.boundVector.position )
		)
		{
			return ;
		}
		
		this.influence( withEntity , matInteraction , invMatInteraction , period ) ;
	}
} ;



Entity.prototype.collision = function collision( withEntity , collision , matInteraction , invMatInteraction , period )
{
	log.warning( "Do something with dat collision! %s - %s: %Y" , this.material.id , withEntity.material.id , collision ) ;
	
	if ( ! this.isStatic && matInteraction )
	{
		this.applyCollision( collision , matInteraction , period ) ;
	}
	
	// Inverse displacement and normal
	collision.displacement.inv() ;
	collision.normal.inv() ;
	
	if ( ! withEntity.isStatic && invMatInteraction )
	{
		withEntity.applyCollision( collision , invMatInteraction , period ) ;
	}
} ;



Entity.prototype.applyCollision = function applyCollision( collision , matInteraction , period )
{
	// Maybe use .fastDecompose() instead?
	var decomposed = this.boundVector.vector.decompose( collision.normal ) ;
	
	this.boundVector.position.apply( collision.displacement , 1 ) ;
	
	// Apply debounce first
	if ( matInteraction.debounce )
	{
		decomposed[ 0 ].reduceLength( matInteraction.debounce ) ;
	}
	
	// If the normal is null, then this is not a collision/bounce anymore
	if ( decomposed[ 0 ].isNull() )
	{
		// Recompose the vector
		this.boundVector.vector.setVector( decomposed[ 0 ].add( decomposed[ 1 ] ) ) ;
		
		// use applyInfluence() now...
		this.applyInfluence( matInteraction , period ) ;
		return ;
	}
	
	// For the entity to not move against the normal
	if ( decomposed[ 0 ].dot( collision.normal ) < 0 )
	{
		decomposed[ 0 ].inv() ;
	}
	
	// Apply normal and tangential bounce rates on the decomposed vectors
	decomposed[ 0 ].mul( matInteraction.normalBounceRate ) ;
	decomposed[ 1 ].mul( matInteraction.tangentBounceRate ) ;
	
	// Recompose the vector
	this.boundVector.vector.setVector( decomposed[ 0 ].add( decomposed[ 1 ] ) ) ;
} ;



Entity.prototype.influence = function influence( withEntity , matInteraction , invMatInteraction , period )
{
	if ( ! this.isStatic && matInteraction )
	{
		this.applyInfluence( matInteraction , period ) ;
	}
	
	if ( ! withEntity.isStatic && invMatInteraction )
	{
		withEntity.applyInfluence( invMatInteraction , period ) ;
	}
} ;



Entity.prototype.applyInfluence = function applyInfluence( matInteraction , period )
{
	var i , dynLen = matInteraction.dynamics.length ;
	
	// Apply all influences to the entity
	for ( i = 0 ; i < dynLen ; i ++ )
	{
		matInteraction.dynamics[ i ].apply( this , period ) ;
	}
} ;


