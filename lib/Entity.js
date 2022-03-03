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

const Logfella = require( 'logfella' ) ;
const log = Logfella.global.use( 'physic' ) ;



var autoId = 0 ;

function Entity( params = {} ) {
	var i , iMax ;

	// Check params
	if ( ! ( params.shape instanceof physic.Shape ) ) { throw new Error( "new Entity(): params.shape must be an instance of Shape" ) ; }
	if ( ! ( params.material instanceof physic.Material ) ) { throw new Error( "new Entity(): params.material must be an instance of Material" ) ; }

	this.id = params.id || 'entity#' + autoId ++ ;
	this.world = params.world ;
	this.isStatic = !! params.isStatic ;
	this.is2D = !! params.is2D ;
	this.material = params.material ;
	this.shape = params.shape ;
	//this.dynamics = params.dynamics || [] ;

	this.mass = params.mass || 1 ;
	this.position = new physic.Vector3D( params.x || 0 , params.y || 0 , params.z || 0 ) ;
	this.velocity = new physic.Vector3D( params.vx || 0 , params.vy || 0 , params.vz || 0 ) ;
	this.acceleration = new physic.Vector3D( params.ax || 0 , params.ay || 0 , params.az || 0 ) ;
	this.forces = new physic.Vector3D( params.fx || 0 , params.fy || 0 , params.fz || 0 ) ;	// Forces applied to the entity

	// Building the next frame
	this.nextPosition = this.position.dup() ;
	this.nextVelocity = this.velocity.dup() ;
	this.nextAcceleration = this.acceleration.dup() ;
	this.nextForces = this.forces.dup() ;
	
	// Predictor integrator algo
	this.stable = true ;
	this.stiffness = 0 ;
	this.predictedAcceleration = new physic.Vector3D( 0 , 0 , 0 ) ;
	this.predictedVelocity = new physic.Vector3D( 0 , 0 , 0 ) ;
	this.predictedPosition = new physic.Vector3D( 0 , 0 , 0 ) ;
	
	this.frameContacts = [] ;
	this.nextFrameContacts = [] ;

	// Userland data used to controle the entity
	this.input = {} ;

	// Link entity to its dynamics
	if ( Array.isArray( params.dynamics ) ) {
		for ( i = 0 , iMax = params.dynamics.length ; i < iMax ; i ++ ) {
			params.dynamics[ i ].linkEntity( this ) ;
		}
	}

	// Deprecated?
	this.data = params.data || {} ;	// Internal extra data
}

module.exports = Entity ;



Entity.prototype.finalize = function() {
	var swap ;
	
	swap = this.position ; this.position = this.nextPosition ; this.nextPosition = swap ;
	swap = this.velocity ; this.velocity = this.nextVelocity ; this.nextVelocity = swap ;
	swap = this.acceleration ; this.acceleration = this.nextAcceleration ; this.nextAcceleration = swap ;
	swap = this.forces ; this.forces = this.nextForces ; this.nextForces = swap ;

	swap = this.frameContacts ; this.frameContacts = this.nextFrameContacts ; this.nextFrameContacts = swap ;
	this.nextFrameContacts.length = 0 ;
} ;



Entity.prototype.manageInteractionWith = function( withEntity , dt ) {
	var matInteraction , invMatInteraction , collision , solid ;

	matInteraction = this.material.interactions.get( withEntity.material ) ;

	// Do nothing if no interactions are possible between those objects
	if ( matInteraction === undefined ) { return false ; }

	invMatInteraction = withEntity.material.interactions.get( this.material ) ;

	//log.info( "Checking %s vs %s" , this.material.id , withEntity.material.id ) ;

	solid = this.material.isSolid && withEntity.material.isSolid ;

	if ( solid ) {
		if ( ( matInteraction && matInteraction.hq ) || ( invMatInteraction && invMatInteraction.hq ) ) {
			collision =
				this.shape.isSweepingBboxOverlapping( this.position , this.nextPosition , withEntity.shape , withEntity.position , withEntity.nextPosition )
				&& this.shape.getContinuousCollision( this.position , this.nextPosition , withEntity.shape , withEntity.position , withEntity.nextPosition ) ;
		}
		else {
			collision =
				this.shape.isBboxOverlapping( this.nextPosition , withEntity.shape , withEntity.nextPosition )
				&& this.shape.getCollision( this.nextPosition , withEntity.shape , withEntity.nextPosition ) ;
		}

		if ( ! collision ) { return ; }

		console.log( "Collision: "  , collision ) ;
		if ( collision.displacement.isNull() ) {
			this.applyMutualInfluence( withEntity , matInteraction , invMatInteraction , dt ) ;
		}
		else {
			console.log( "OK Collision" ) ;
			this.applyMutualCollision( withEntity , collision , matInteraction , invMatInteraction , dt ) ;
		}
	}
	else {
		if (
			! this.shape.isBboxOverlapping( this.nextPosition , withEntity.shape , withEntity.nextPosition )
			|| ! this.shape.isOverlapping( this.nextPosition , withEntity.shape , withEntity.nextPosition )
		) {
			return ;
		}

		this.applyMutualInfluence( withEntity , matInteraction , invMatInteraction , dt ) ;
	}
} ;



Entity.prototype.applyMutualCollision = function( withEntity , collision , matInteraction , invMatInteraction , dt ) {
	if ( ! this.isStatic && matInteraction ) {
		this.applyCollision( withEntity , collision , matInteraction , dt ) ;
	}

	if ( ! withEntity.isStatic && invMatInteraction ) {
		// Inverse displacement and normal
		collision.displacement.inv() ;
		collision.normal.inv() ;

		withEntity.applyCollision( this , collision , invMatInteraction , dt ) ;
	}
} ;



Entity.prototype.applyCollision = function( withEntity , collision , matInteraction , dt ) {
	// Maybe use .fastDecompose() instead?
	var decomposed = this.nextVelocity.decompose( collision.normal ) ;

	console.log( "before:" , this.nextPosition ) ;
	this.nextPosition.apply( collision.displacement , 1 ) ;
	console.log( "after:" , this.nextPosition ) ;

	// Apply debounce first
	if ( matInteraction.debounce ) {
		decomposed[ 0 ].reduceLength( matInteraction.debounce ) ;
	}

	// Add to the contact list
	this.nextFrameContacts.push( {
		with: withEntity ,
		normal: collision.normal.dup() ,
		type: physic.FLAT_CONSTRAINT
	} ) ;

	// If the normal is null, then this is not a collision/bounce anymore
	if ( decomposed[ 0 ].isNull() ) {
		// Recompose the vector
		this.nextVelocity.setVector( decomposed[ 0 ].add( decomposed[ 1 ] ) ) ;

		// use applyInfluence() now...
		this.applyInfluence( matInteraction , dt ) ;
		return ;
	}

	// For the entity to not move against the normal
	if ( decomposed[ 0 ].dot( collision.normal ) < 0 ) {
		decomposed[ 0 ].inv() ;
	}

	// Apply normal and tangential bounce rates on the decomposed vectors
	decomposed[ 0 ].mul( matInteraction.normalBounceRate ) ;
	decomposed[ 1 ].mul( matInteraction.tangentBounceRate ) ;

	// Recompose the vector
	this.nextVelocity.setVector( decomposed[ 0 ].add( decomposed[ 1 ] ) ) ;
} ;



Entity.prototype.applyMutualInfluence = function( withEntity , matInteraction , invMatInteraction , dt ) {
	if ( ! this.isStatic && matInteraction ) {
		this.applyInfluence( matInteraction , dt ) ;
	}

	if ( ! withEntity.isStatic && invMatInteraction ) {
		withEntity.applyInfluence( invMatInteraction , dt ) ;
	}
} ;



Entity.prototype.applyInfluence = function( matInteraction , dt ) {
	var i , dynLen = matInteraction.dynamics.length ;

	// Apply all influences to the entity
	for ( i = 0 ; i < dynLen ; i ++ ) {
		matInteraction.dynamics[ i ].apply( this , dt ) ;
	}
} ;



Entity.prototype.enforceConstraintsOnVector = function( vector , constraints ) {
	var i , len = constraints.length , constraint ;

	// Apply all influences to the entity
	for ( i = 0 ; i < len ; i ++ ) {
		constraint = constraints[ i ] ;

		switch ( constraint.type ) {
			case physic.FLAT_CONSTRAINT :
				//console.log( "flat constraint, before:" , vector , constraint.normal ) ;
				//vector.applyDirectionalConstraint( constraint.normal ) ;
				vector.applyDirectionalNormalizedConstraint( constraint.normal ) ;
				//console.log( "flat constraint, after:" , vector ) ;
				break ;
		}
	}
} ;

