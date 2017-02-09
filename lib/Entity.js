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

var Logfella = require( 'logfella' ) ;
var log = Logfella.global.use( 'physic' ) ;



function Entity( params ) { return Entity.create( params ) ; }
module.exports = Entity ;



Entity.create = function create( params )
{
	params = params || {} ;
	
	var self = Object.create( Entity.prototype , {
		world: { value: params.world , writable: true , enumerable: true } ,
		omni: { value: !! params.omni , enumerable: true } ,
		isStatic: { value: !! params.isStatic || params.omni , enumerable: true } ,
		is2D: { value: !! params.is2D , enumerable: true } ,
		mass: { value: params.mass || 1 , writable: true , enumerable: true } ,
		material: { value: params.material , writable: true , enumerable: true } ,
		shape: { value: params.shape || null , writable: true , enumerable: true } ,
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
	} ) ;
	
	return self ;
} ;



Entity.prototype.prepareFrame = function prepareFrame()
{
	this.frameInteractions.length = 0 ;
	this.oldBoundVector.setBoundVector( this.boundVector ) ;
} ;



Entity.prototype.move = function move( period )
{
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
	
	solid = this.material.isSolid && withEntity.material.isSolid && ! this.shape.omni && ! withEntity.shape.omni ;
	
	if ( this.omni || withEntity.omni )
	{
		// If one entity is omni-present, they always interact, using influence
		// (omni are assumed to be static and non-solid)
		this.influence( withEntity , matInteraction , invMatInteraction , period ) ;
	}
	else if ( solid )
	{
		if ( ( matInteraction && matInteraction.hq ) || ( invMatInteraction && invMatInteraction.hq ) )
		{
			collision = this.shape.getContinuousCollision(
				this.oldBoundVector.position , this.boundVector.position ,
				withEntity.shape , withEntity.oldBoundVector.position , withEntity.boundVector.position
			) ;
		}
		else
		{
			collision = this.shape.getCollision( this.boundVector.position , withEntity.shape , withEntity.boundVector.position ) ;
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
		if ( ! this.shape.isOverlapping( this.boundVector.position , withEntity.shape , withEntity.boundVector.position ) )
		{
			return ;
		}
		
		this.influence( withEntity , matInteraction , invMatInteraction , period ) ;
	}
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
	// Apply absolute friction first
	if ( matInteraction.friction )
	{
		//console.log( '\n>>>> yo friction\n>>>>' , matInteraction.friction , period , matInteraction.friction * period , this.boundVector.vector ) ;
		this.boundVector.vector.reduceLength( matInteraction.friction * period ) ;
		//console.log( '<<<<' , this.boundVector.vector ) ;
	}
	
	// Then apply proportional friction (before forces, because they would modify the speed vector)
	if ( matInteraction.frictionRate )
	{
		this.boundVector.vector.mul( 1 - ( matInteraction.frictionRate * period ) ) ;
	}
	
	// Apply force (gravity, wind, etc)
	if ( matInteraction.force )
	{
		this.boundVector.vector.apply( matInteraction.force , period ) ;
	}
	
	//console.log( '<<<<////' , this.boundVector.vector ) ;
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















Entity.prototype.interaction_ = function interaction( withEntity , period )
{
	var matInteraction , invMatInteraction , displacement , solid , method ;
	
	matInteraction = this.material.interactions.get( withEntity.material ) ;
	
	// Do nothing if no interactions are possible between those objects
	if ( matInteraction === undefined ) { return false ; }
	
	invMatInteraction = withEntity.material.interactions.get( this.material ) ;
	
	method = ( matInteraction && matInteraction.hq ) || ( invMatInteraction && invMatInteraction.hq ) ?
		'isHqIntersectingWith' : 'isIntersectingWith' ;
	
	//log.info( "Checking %s vs %s" , this.material.id , withEntity.material.id ) ;
	
	// Interactions are possible, check if there is a displacement
	if (
		//( ! this.isStatic || ! withEntity.isStatic ) &&	// already filtered out by World
		( displacement = this.shape[ method ](
			this.boundVector ,
			this.oldBoundVector ,
			withEntity.shape ,
			withEntity.boundVector ,
			withEntity.oldBoundVector ,
			( solid = this.material.isSolid && withEntity.material.isSolid && ! this.shape.omni && ! withEntity.shape.omni )
		) )
	)
	{
		//log.warning( "Do something with dat displacement! %s - %s: %Y" , this.material.id , withEntity.material.id , displacement ) ;
		if ( ! this.isStatic && matInteraction )
		{
			if ( solid && intersection !== true ) { this.applyCollision( intersection[ 0 ] , matInteraction , period ) ; }
			else { this.applyInfluence( matInteraction , period ) ; }
		}
		
		if ( ! withEntity.isStatic && invMatInteraction )
		{
			if ( solid && intersection !== true ) { withEntity.applyCollision( intersection[ 1 ] , invMatInteraction , period ) ; }
			else { withEntity.applyInfluence( invMatInteraction , period ) ; }
		}
	}
} ;



Entity.prototype.applyCollision_ = function applyCollision( intersection , matInteraction , period )
{
	this.boundVector.position.setVector( intersection.at ) ;
	
	// Apply debounce first
	if ( matInteraction.debounce )
	{
		intersection.decomposed[ 0 ].reduceLength( matInteraction.debounce ) ;
	}
	
	// If the normal is null, then this is not a collision/bounce anymore
	if ( intersection.decomposed[ 0 ].isNull() )
	{
		// Recompose the vector
		this.boundVector.vector.setVector( intersection.decomposed[ 0 ].add( intersection.decomposed[ 1 ] ) ) ;
		
		// use applyInfluence() now...
		this.applyInfluence( matInteraction , period ) ;
		return ;
	}
	
	// For the entity to not move against the normal
	if ( intersection.decomposed[ 0 ].dot( intersection.normal ) < 0 )
	{
		intersection.decomposed[ 0 ].inv() ;
	}
	
	// Apply normal and tangential bounce rates on the decomposed vectors
	intersection.decomposed[ 0 ].mul( matInteraction.normalBounceRate ) ;
	intersection.decomposed[ 1 ].mul( matInteraction.tangentBounceRate ) ;
	
	// Recompose the vector
	this.boundVector.vector.setVector( intersection.decomposed[ 0 ].add( intersection.decomposed[ 1 ] ) ) ;
} ;





