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



const physic = require( './physic.js' ) ;

const Logfella = require( 'logfella' ) ;
const log = Logfella.global.use( 'physic' ) ;



function Entity( params ) {
	var i , iMax ;

	// Check params
	if ( ! params || typeof params !== 'object' ) { throw new Error( "new Entity(): params argument is mandatory" ) ; }
	if ( ! ( params.shape instanceof physic.Shape ) ) { throw new Error( "new Entity(): params.shape must be an instance of Shape" ) ; }
	if ( ! ( params.material instanceof physic.Material ) ) { throw new Error( "new Entity(): params.material must be an instance of Material" ) ; }

	this.world = params.world ;
	this.isStatic = !! params.isStatic ;
	this.is2D = !! params.is2D ;
	this.mass = params.mass || 1 ;
	this.material = params.material ;
	this.shape = params.shape ;
	this.dynamics = params.dynamics || [] ;
	this.boundVector = new physic.BoundVector3D( params.x || 0 , params.y || 0 , params.z || 0 , 0 , 0 , 0 ) ;
	this.oldBoundVector = new physic.BoundVector3D( params.x || 0 , params.y || 0 , params.z || 0 , 0 , 0 , 0 ) ;
	// Forces applied to the entity
	this.forces = new physic.Vector3D( 0 , 0 , 0 ) ;
	// Forces applied in the inverse direction of the movement
	this.brakingForces = 0 ;
	this.frameInteractions = [] ;
	this.frameContacts = [] ;
	this.nextFrameContacts = [] ;
	// Userland data used to controle the entity
	this.input = {} ;
	// Internal extra data
	this.data = params.data || {} ;

	// Init the entity for each dynamic
	for ( i = 0 , iMax = self.dynamics.length ; i < iMax ; i ++ ) {
		if ( this.dynamics[ i ].init ) { this.dynamics[ i ].init( this ) ; }
	}

	return self ;
} ;

module.exports = Entity ;



Entity.prototype.prepareFrame = function() {
	var swap ;

	this.frameInteractions.length = 0 ;

	swap = this.frameContacts ;
	this.frameContacts = this.nextFrameContacts ;
	this.nextFrameContacts = swap ;
	this.nextFrameContacts.length = 0 ;

	this.oldBoundVector.setBoundVector( this.boundVector ) ;
} ;



Entity.prototype.update = function( period ) {
	var i , dynLen = this.dynamics.length ;

	// First, apply all dynamic rules to the entity
	for ( i = 0 ; i < dynLen ; i ++ ) {
		this.dynamics[ i ].apply( this , period ) ;
	}

	// Apply forces
	this.enforceConstraintsOnVector( this.forces , this.frameContacts ) ;
	this.boundVector.vector.apply( this.forces , period / this.mass ) ;

	// Apply braking forces, they are always applied in the inverse direction
	// of the speed vector but they never revert it.
	if ( this.brakingForces ) {
		this.boundVector.vector.reduceLength( this.brakingForces * period / this.mass ) ;
	}

	// Finally, apply the bound vector: move its position by its speed vector
	this.boundVector.apply( period ) ;

	// Reset forces already applied
	this.forces.setNull() ;
	this.brakingForces = 0 ;
} ;



Entity.prototype.interaction = function( withEntity , period ) {
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
				this.shape.isSweepingBboxOverlapping(
					this.oldBoundVector.position , this.boundVector.position ,
					withEntity.shape , withEntity.oldBoundVector.position , withEntity.boundVector.position )
				&& this.shape.getContinuousCollision(
					this.oldBoundVector.position , this.boundVector.position ,
					withEntity.shape , withEntity.oldBoundVector.position , withEntity.boundVector.position ) ;
		}
		else {
			collision =
				this.shape.isBboxOverlapping( this.boundVector.position , withEntity.shape , withEntity.boundVector.position )
				&& this.shape.getCollision( this.boundVector.position , withEntity.shape , withEntity.boundVector.position ) ;
		}

		if ( ! collision ) { return ; }

		//console.log( "Collision: "  , collision ) ;
		if ( collision.displacement.isNull() ) {
			this.influence( withEntity , matInteraction , invMatInteraction , period ) ;
		}
		else {
			//console.log( "OK Collision" ) ;
			this.collision( withEntity , collision , matInteraction , invMatInteraction , period ) ;
		}
	}
	else {
		if (
			! this.shape.isBboxOverlapping( this.boundVector.position , withEntity.shape , withEntity.boundVector.position )
			|| ! this.shape.isOverlapping( this.boundVector.position , withEntity.shape , withEntity.boundVector.position )
		) {
			return ;
		}

		this.influence( withEntity , matInteraction , invMatInteraction , period ) ;
	}
} ;



Entity.prototype.collision = function( withEntity , collision , matInteraction , invMatInteraction , period ) {
	/*
	if ( this.material.id === 'player' ) {
		log.warning( "Do something with dat collision! %s - %s: %Y" , this.material.id , withEntity.material.id , collision ) ;
		log.warning( "matInteraction: %Y -- invMatInteraction: %Y" , matInteraction , invMatInteraction ) ;
	}
	//*/

	if ( ! this.isStatic && matInteraction ) {
		this.applyCollision( withEntity , collision , matInteraction , period ) ;
	}

	if ( ! withEntity.isStatic && invMatInteraction ) {
		// Inverse displacement and normal
		collision.displacement.inv() ;
		collision.normal.inv() ;

		withEntity.applyCollision( this , collision , invMatInteraction , period ) ;
	}
} ;



Entity.prototype.applyCollision = function( withEntity , collision , matInteraction , period ) {
	// Maybe use .fastDecompose() instead?
	var decomposed = this.boundVector.vector.decompose( collision.normal ) ;

	//console.log( "before:" , this.boundVector.position ) ;
	this.boundVector.position.apply( collision.displacement , 1 ) ;
	//console.log( "after:" , this.boundVector.position ) ;

	// Apply debounce first
	if ( matInteraction.debounce ) {
		decomposed[ 0 ].reduceLength( matInteraction.debounce ) ;
	}

	// Add to the contacts list
	this.nextFrameContacts.push( {
		with: withEntity ,
		normal: collision.normal.dup() ,
		type: physic.FLAT_CONSTRAINT
	} ) ;

	// If the normal is null, then this is not a collision/bounce anymore
	if ( decomposed[ 0 ].isNull() ) {
		// Recompose the vector
		this.boundVector.vector.setVector( decomposed[ 0 ].add( decomposed[ 1 ] ) ) ;

		// use applyInfluence() now...
		this.applyInfluence( matInteraction , period ) ;
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
	this.boundVector.vector.setVector( decomposed[ 0 ].add( decomposed[ 1 ] ) ) ;
} ;



Entity.prototype.influence = function( withEntity , matInteraction , invMatInteraction , period ) {
	if ( ! this.isStatic && matInteraction ) {
		this.applyInfluence( matInteraction , period ) ;
	}

	if ( ! withEntity.isStatic && invMatInteraction ) {
		withEntity.applyInfluence( invMatInteraction , period ) ;
	}
} ;



Entity.prototype.applyInfluence = function( matInteraction , period ) {
	var i , dynLen = matInteraction.dynamics.length ;

	// Apply all influences to the entity
	for ( i = 0 ; i < dynLen ; i ++ ) {
		matInteraction.dynamics[ i ].apply( this , period ) ;
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
				vector.applyDirectionalConstraint( constraint.normal ) ;
				//console.log( "flat constraint, after:" , vector ) ;
				break ;
		}
	}
} ;

