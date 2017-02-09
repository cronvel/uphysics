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

/* jshint -W072, -W073 */

"use strict" ;



var arrayKit = require( 'array-kit' ) ;
var Logfella = require( 'logfella' ) ;
var log = Logfella.global.use( 'physic' ) ;



/*
	TODO:
	- continuous collision should be able to retrieve data from dynamic vertices creation, since it already raytrace things
	- dynamic vertices should be tested against all surfaces, and moved inbounds when necessary
	- each edge should shoot a trace (from one vertex to the other) against all foreign surfaces, because in 3D,
	  checking vertices is not enough even for volumes made of planes
	- edge backface culling
	- manage dynamic vertices for edges
	- vertices/edges reduction for volumes that has vertices connected to more than 3 faces
*/

/*
	Minkowski GJK algorithm resources, for the day I would want to make the switch:
	* http://www.dyn4j.org/2010/04/gjk-gilbert-johnson-keerthi/
*/

/*
	Shapes are like “Brushes”: they are convex CSG intersection of basic primitives:
	* plane: separate the space in two side: the positive side (outside) and the negative side (inside)
	* cylinder: infinite tube, separate into the inner (inside) and the outer (outside)
	* sphere: separate into the inner (inside) and the outer (outside) of the sphere
*/



function Shape( primitives , boundingBox , omni ) { return Shape.create( primitives , boundingBox , omni ) ; }
module.exports = Shape ;

var physic = require( './physic.js' ) ;



/*
	* primitives: array of object, where:
		* type: the type of the primitive
		* ... parameters for this type
	* boundingBox: object having properties: xMin, xMax, yMin, yMax, zMin, zMax
	* omni: omni-present, non-solid and static
	
	For intance only 'sphere' and 'plane' primitives exists.
*/
Shape.create = function create( surfaces , boundingBox , omni , noBackFaceCulling )
{
	var self = Object.create( Shape.prototype , {
		omni: { value: !! omni , writable: true , enumerable: true } ,
		surfaces: { value: surfaces , writable: true , enumerable: true } ,
		vertices: { value: [] , writable: true , enumerable: true } ,
		// edges are segments, a list of BoundVectors
		edges: { value: [] , writable: true , enumerable: true } ,
		noBackFaceCulling: { value: !! noBackFaceCulling , writable: true , enumerable: true } ,
		boundingBox: { value: boundingBox , writable: true , enumerable: true } ,
		surfaceFlags: { value: 0 , writable: true , enumerable: true } ,
		// surfaces that have dynamic vertices
		dynamicSurfaces: { value: [] , writable: true , enumerable: true } ,
	} ) ;
	
	self.init() ;
	
	return self ;
} ;



/*
	* create vertices from faces
	* create edges from faces
*/
Shape.prototype.init = function init()
{
	var i , j , k ,
		slen = this.surfaces.length ,
		edgeVertices ,
		sharedEdgeVertices = new Array( slen ) ,
		outSurfaces = [] ,
		s1 , s2 , s3 , vertex ;
	
	// Reset vertices
	this.vertices.length = 0 ;
	
	for ( i = 0 ; i < slen ; i ++ )
	{
		s1 = this.surfaces[ i ] ;
		
		this.surfaceFlags &= s1.type ;
		
		if ( s1.type === physic.DOT )
		{
			// Filter them out of surfaces, move them to vertices
			this.vertices.push( s1.surface.dup() ) ;
			continue ;
		}
		
		outSurfaces.push( s1 ) ;
		
		if ( s1.type !== physic.PLANE )
		{
			// For instance, we do not create special edges
			this.dynamicSurfaces.push( s1 ) ;
			continue ;
		}
		
		if ( ! sharedEdgeVertices[ i ] ) { sharedEdgeVertices[ i ] = [] ; }
		
		for ( j = i + 1 ; j < slen ; j ++ )
		{
			s2 = this.surfaces[ j ] ;
			
			// For instance, nothing to for non-plane
			if ( s2.type !== physic.PLANE ) { continue ; }
			
			// Parallel planes? skip them!
			if ( s1.surface.isParallelToPlane( s2.surface ) ) { continue ; }
			
			// Reset the edgeVertices
			edgeVertices = sharedEdgeVertices[ i ][ j ] ? sharedEdgeVertices[ i ][ j ].slice() : [] ;
			log.info( "%d %d edgeVertices count: %d" , i , j , edgeVertices.length ) ;
			
			if ( ! sharedEdgeVertices[ j ] ) { sharedEdgeVertices[ j ] = [] ; }
			
			for ( k = j + 1 ; k < slen ; k ++ )
			{
				s3 = this.surfaces[ k ] ;
				
				// At this stage, we do not care about non-plane
				if ( s3.type !== physic.PLANE ) { continue ; }
				
				vertex = s1.surface.threePlanesIntersection( s2.surface , s3.surface ) ;
				
				if ( vertex && Shape.isVertexTouchingVolume( vertex , this.surfaces ) )
				{
					
					if ( ! Shape.hasVertex( this.vertices , vertex ) ) { this.vertices.push( vertex ) ; }
					
					if ( ! Shape.hasVertex( edgeVertices , vertex ) ) { edgeVertices.push( vertex ) ; }
					
					if ( ! sharedEdgeVertices[ i ][ k ] ) { sharedEdgeVertices[ i ][ k ] = [ vertex ] ; }
					else if ( ! Shape.hasVertex( sharedEdgeVertices[ i ][ k ] , vertex ) ) { sharedEdgeVertices[ i ][ k ].push( vertex ) ; }
					
					if ( ! sharedEdgeVertices[ j ][ k ] ) { sharedEdgeVertices[ j ][ k ] = [ vertex ] ; }
					else if ( ! Shape.hasVertex( sharedEdgeVertices[ j ][ k ] , vertex ) ) { sharedEdgeVertices[ j ][ k ].push( vertex ) ; }
				}
			}
			
			switch ( edgeVertices.length )
			{
				case 0 :
					// infinite edge (line)
					console.log( "Infinite edge (line) or edge out of volume" ) ;
					break ;
				case 1 :
					// infinite edge (ray)
					console.log( "Infinite edge (ray) or edge out of volume" ) ;
					break ;
				case 2 :
					// regular finite edges (line segment)
					console.log( "Regular finite edges (line segment)" ) ;
					this.edges.push( physic.BoundVector3D.fromTo( edgeVertices[ 0 ] , edgeVertices[ 1 ] ) ) ;
					break ;
				default :
					console.log( "Error: edge with more than 2 vertices (" + edgeVertices.length + ")" ) ;
					break ;
			}
		}
	}
	
	s1 = this.surfaces = outSurfaces ;
	
	log.error( "Created a shape with %d surfaces, %d edges and %d vertices" , this.surfaces.length , this.edges.length , this.vertices.length ) ;
} ;



// Return true if the vertex is already stored, using epsilon comparison
Shape.hasVertex = function hasVertex( arrayOfVertices , vertex )
{
	var i , vlen = arrayOfVertices.length ;
	
	for ( i = 0 ; i < vlen ; i ++ )
	{
		if ( vertex.isEqualTo( arrayOfVertices[ i ] ) ) { return true ; }
	}
	
	return false ;
} ;



// Check if a position is inside
Shape.isVertexInsideVolume = function isVertexInsideVolume( vertex , surfaces )
{
	var i , slen = surfaces.length ;
	
	for ( i = 0 ; i < slen ; i ++ )
	{
		if ( ! physic.epsilonLt( surfaces[ i ].surface.testVector( vertex ) , 0 ) )
		{
			return false ;
		}
	}
	
	return !! slen ;
} ;



// Check if a position is inside or touching (on the surface)
Shape.isVertexInsideOrTouchingVolume = function isVertexInsideOrTouchingVolume( vertex , surfaces )
{
	var i , slen = surfaces.length ;
	
	for ( i = 0 ; i < slen ; i ++ )
	{
		if ( ! physic.epsilonLte( surfaces[ i ].surface.testVector( vertex ) , 0 ) )
		{
			return false ;
		}
	}
	
	return !! slen ;
} ;



// Check if a position is touching (on the surface)
Shape.isVertexTouchingVolume = function isVertexTouchingVolume( vertex , surfaces )
{
	var i , slen = surfaces.length , test , touching = false ;
	
	// A position is touching the shape if it has at least one test that is
	// epsilon-equal to zero and no test that is epsilon-greater than zero.
	
	for ( i = 0 ; i < slen ; i ++ )
	{
		test = physic.epsilonZero( surfaces[ i ].surface.testVector( vertex ) ) ;
		if ( test > 0 ) { return false ; }
		if ( test === 0 ) { touching = true ; }
	}
	
	return !! slen ;
} ;



// Prepare interaction between 2 shapes
Shape.prototype.prepareInteraction = function prepareInteraction( position , foreignShape , foreignPosition , trace )
{
	// Shorthand to the static object
	var interaction = prepareInteraction.interaction ;
	
	interaction.diffPosition.setFromTo( position , foreignPosition ) ;
	
	// This is problematic when the diff is null: many time we wouldnt' know in which direction to push things.
	// Make it slightly non-null.
	if ( interaction.diffPosition.isNull() ) { interaction.diffPosition.x += physic.getEpsilon() ; }
	
	// Inverse diff is used a lot, so better cache it now!
	interaction.invDiffPosition.setInvVector( interaction.diffPosition ) ;
	
	if ( ! this.noBackFaceCulling || this.dynamicSurfaces.length )
	{
		// Reset arrays
		interaction.surfaces = interaction.cachedSurfaces ;
		interaction.vertices = interaction.cachedVertices ;
		interaction.cachedSurfaces.length = 0 ;
		interaction.cachedVertices.length = 0 ;
	}
	else
	{
		interaction.surfaces = this.surfaces ;
		interaction.vertices = this.vertices ;
	}
	
	if ( ! foreignShape.noBackFaceCulling || foreignShape.dynamicSurfaces.length )
	{
		// Reset arrays
		interaction.foreignSurfaces = interaction.cachedForeignSurfaces ;
		interaction.foreignVertices = interaction.cachedForeignVertices ;
		interaction.cachedForeignSurfaces.length = 0 ;
		interaction.cachedForeignVertices.length = 0 ;
	}
	else
	{
		interaction.foreignSurfaces = foreignShape.surfaces ;
		interaction.foreignVertices = foreignShape.vertices ;
	}
	
	
	if ( ! this.noBackFaceCulling )
	{
		this.addFrontFaces( interaction.surfaces , interaction.vertices , interaction.diffPosition ) ;
	}
	
	if ( ! foreignShape.noBackFaceCulling )
	{
		foreignShape.addFrontFaces( interaction.foreignSurfaces , interaction.foreignVertices , interaction.invDiffPosition ) ;
	}
	
	if ( this.dynamicSurfaces.length )
	{
		this.addDynamicVertices( interaction.vertices , interaction.foreignSurfaces , interaction.diffPosition , trace ) ;
	}
	
	if ( foreignShape.dynamicSurfaces.length )
	{
		trace.vector.inv() ;
		foreignShape.addDynamicVertices( interaction.foreignVertices , interaction.surfaces , interaction.invDiffPosition , trace ) ;
		trace.vector.inv() ;
	}
	
	return prepareInteraction.interaction ;
} ;



// Static cached object.
// Avoid massive object creation that would cause GC to kick in often
Shape.prototype.prepareInteraction.interaction = {
	diffPosition: physic.Vector3D( 0 , 0 , 0 ) ,
	invDiffPosition: physic.Vector3D( 0 , 0 , 0 ) ,
	surfaces: null ,
	vertices: null ,
	cachedSurfaces: [] ,
	cachedVertices: [] ,
	foreignSurfaces: null ,
	foreignVertices: null ,
	cachedForeignSurfaces: [] ,
	cachedForeignVertices: []
} ;



// Add to interaction surfaces all surfaces that are not back-face culled
Shape.prototype.addFrontFaces = function addFrontFaces( surfaces , vertices , vector )
{
	var i , len ;
	
	// Add vertices
	for ( i = 0 , len = this.vertices.length ; i < len ; i ++ )
	{
		if ( physic.epsilonGte( this.vertices[ i ].dot( vector ) , 0 ) )
		{
			vertices.push( this.vertices[ i ] ) ;
		}
	}
	
	// Add surfaces
	for ( i = 0 , len = this.surfaces.length ; i < len ; i ++ )
	{
		// Non-plane are always added
		if ( this.surfaces[ i ].type !== physic.PLANE || physic.epsilonGte( this.surfaces[ i ].surface.normal.dot( vector ) , 0 ) )
		{
			surfaces.push( this.surfaces[ i ] ) ;
		}
	}
} ;



Shape.prototype.addDynamicVertices = function addDynamicVertices( vertices , foreignSurfaces , diffPosition , trace )
{
	var i , j ,
		dlen = this.dynamicSurfaces.length ,
		flen = foreignSurfaces.length ;
	
	for ( i = 0 ; i < dlen ; i ++ )
	{
		if ( this.dynamicSurfaces[ i ].type === physic.SPHERE )
		{
			for ( j = 0 ; j < flen ; j ++ )
			{
				if ( foreignSurfaces[ j ].type === physic.PLANE )
				{
					this.spherePlaneVertices( vertices , this.dynamicSurfaces[ i ] , foreignSurfaces[ j ] , diffPosition , trace ) ;
				}
				else if ( foreignSurfaces[ j ].type === physic.SPHERE )
				{
					this.sphereSphereVertices( vertices , this.dynamicSurfaces[ i ] , foreignSurfaces[ j ] , diffPosition , trace ) ;
				}
				else if ( foreignSurfaces[ j ].type === physic.CYLINDER )
				{
					this.sphereCylinderVertices( vertices , this.dynamicSurfaces[ i ] , foreignSurfaces[ j ] , diffPosition , trace ) ;
				}
			}
		}
		else if ( this.dynamicSurfaces[ i ].type === physic.CYLINDER )
		{
			for ( j = 0 ; j < flen ; j ++ )
			{
				if ( foreignSurfaces[ j ].type === physic.PLANE )
				{
					this.cylinderPlaneVertices( vertices , this.dynamicSurfaces[ i ] , foreignSurfaces[ j ] , diffPosition , trace ) ;
				}
				else if ( foreignSurfaces[ j ].type === physic.SPHERE )
				{
					this.cylinderSphereVertices( vertices , this.dynamicSurfaces[ i ] , foreignSurfaces[ j ] , diffPosition , trace ) ;
				}
				else if ( foreignSurfaces[ j ].type === physic.CYLINDER )
				{
					this.cylinderCylinderVertices( vertices , this.dynamicSurfaces[ i ] , foreignSurfaces[ j ] , diffPosition , trace ) ;
				}
			}
		}
	}
} ;



Shape.prototype.spherePlaneVertices = function spherePlaneVertices( vertices , dsurf , fsurf , diffPosition , trace )
{
	var vertex = dsurf.surface.center.dup().moveAlong( fsurf.surface.normal , - dsurf.surface.r ) ;
	
	vertex = this.fixVertexAlongSphere( vertex , dsurf.surface ) ;
	
	if ( vertex )
	{
		console.log( "+Dynamic Vertex:" , vertex ) ;
		vertices.push( vertex ) ;
	}
} ;



Shape.prototype.sphereSphereVertices = function sphereSphereVertices( vertices , dsurf , fsurf , diffPosition , trace )
{
	var vertex , intersection ;
	
	// Cached objects
	var localPosition = sphereSphereVertices.localPosition ;
	
	// Only one vertex per sphere pair.
	// If a small sphere is entirely inside a big one, the big one wouldn't have any
	// of its vertex inside the small.
		// /!\ Except if the sphere is not the only one surface of the shape /!\
	//if ( dsurf.surface.r > fsurf.surface.r ) { continue ; }
	
	if ( trace )
	{
		// Use to foreign space
		//log.error( trace ) ;
		trace.position.setVector( dsurf.surface.center ).sub( diffPosition ) ;
		intersection = fsurf.surface.traceIntersection( trace , dsurf.surface.r ) ;
		
		// There will not be any collision, skip it
		if ( ! intersection ) { return ; }
		
		// Diff vector
		vertex = physic.Vector3D.fromTo( intersection , fsurf.surface.center ).setLength( dsurf.surface.r ) ;
		
		// Real vertex position
		vertex.add( dsurf.surface.center ) ;
	}
	else
	{
		vertex = dsurf.surface.center.dup() ;
		localPosition.setVector( fsurf.surface.center ).add( diffPosition ) ;
		
		// If both position are equal, we use the center of the sphere, if not,
		// we project on the sphere surface, toward the foreign sphere center
		if ( ! vertex.isEqualTo( localPosition ) ) { vertex.moveToward( localPosition , dsurf.surface.r ) ; }
	}
	
	vertex = this.fixVertexAlongSphere( vertex , dsurf.surface ) ;
	
	if ( vertex )
	{
		console.log( "+Dynamic Vertex:" , vertex ) ;
		vertices.push( vertex ) ;
	}
} ;

Shape.prototype.sphereSphereVertices.localPosition = physic.Vector3D() ;



Shape.prototype.sphereCylinderVertices = function sphereCylinderVertices( vertices , dsurf , fsurf , diffPosition , trace )
{
	var vertex , intersection ;
	
	// Cached objects
	var localAxis = sphereCylinderVertices.localAxis ;
	
	if ( trace )
	{
		// Use to foreign space
		//log.error( trace ) ;
		trace.position.setVector( dsurf.surface.center ).sub( diffPosition ) ;
		intersection = fsurf.surface.traceIntersection( trace , dsurf.surface.r ) ;
		
		// There will not be any collision, skip it
		if ( ! intersection ) { return ; }
		
		// Diff vector
		vertex = fsurf.surface.axis.vector.pointProjection( intersection )
			.sub( intersection )
			.setLength( dsurf.surface.r ) ;
		
		// Real vertex position
		vertex.add( dsurf.surface.center ) ;
	}
	else
	{
		// Create the cylinder axis boundVector
		localAxis.setBoundVector( fsurf.surface.axis ).position.add( diffPosition ) ;
		
		// Get the closest point of the axis to the sphere center
		vertex = localAxis.pointProjection( dsurf.surface.center ) ;
		
		// Move away from the axis, toward to the sphere center, stop at the sphere surface
		vertex.moveAtDistanceOf( dsurf.surface.center , dsurf.surface.r ) ;
	}
	
	vertex = this.fixVertexAlongSphere( vertex , dsurf.surface ) ;
	
	if ( vertex )
	{
		console.log( "+Dynamic Vertex:" , vertex ) ;
		vertices.push( vertex ) ;
	}
} ;

Shape.prototype.sphereCylinderVertices.localAxis = physic.BoundVector3D() ;



Shape.prototype.cylinderPlaneVertices = function cylinderPlaneVertices( vertices , dsurf , fsurf , diffPosition , trace )
{
	var vertex , dot ;
	
	// Cached objects
	var localTrace = cylinderPlaneVertices.localTrace ;
	
	dot = physic.epsilonZero( dsurf.surface.axis.vector.dot( fsurf.surface.normal ) ) ;
	
	localTrace.setVectors(
		dsurf.surface.axis.position ,
		physic.epsilonNotEq( Math.abs( dot ) , 1 ) ?
			fsurf.surface.normal : dsurf.surface.axis.vector.getAnyOrthogonal()
	) ;
	
	vertex = dsurf.surface.traceIntersection( localTrace , undefined , Infinity ) ;
	
	// Cylinder are infinite, so move its dynamic vertex far far away,
	// it will be clipped back by other surfaces if it is needed.
	if ( dot > 0 )
	{
		vertex.moveAlong( dsurf.surface.axis.vector , - physic.FAR_AWAY ) ;
	}
	else if ( dot < 0 )
	{
		vertex.moveAlong( dsurf.surface.axis.vector , physic.FAR_AWAY ) ;
	}
	
	vertex = this.fixVertexAlongAxis( vertex , dsurf.surface.axis.vector ) ;
	
	if ( vertex )
	{
		console.log( "+Dynamic Vertex:" , vertex ) ;
		vertices.push( vertex ) ;
	}
} ;

Shape.prototype.cylinderPlaneVertices.localTrace = physic.BoundVector3D() ;



Shape.prototype.cylinderSphereVertices = function cylinderSphereVertices( vertices , dsurf , fsurf , diffPosition , trace )
{
	var vertex ;
	
	// Cached objects
	var localPosition = cylinderSphereVertices.localPosition ;
	
	if ( trace )
	{
		// Local space
		//log.error( trace ) ;
		trace.position.setVector( fsurf.surface.center ).add( diffPosition ) ;
		vertex = dsurf.surface.traceIntersection( trace , fsurf.surface.r ) ;
		
		// There will not be any collision, skip it
		if ( ! vertex ) { return ; }
	}
	else
	{
		// Foreign surface position
		localPosition.setVector( fsurf.surface.center ).add( diffPosition ) ;
		
		// Get the closest point of the axis to the sphere center
		vertex = dsurf.surface.axis.pointProjection( localPosition ) ;
		
		// Move away from the axis, toward to the sphere center, by the cylinder radius
		vertex.moveToward( localPosition , dsurf.surface.r ) ;
	}
	
	vertex = this.fixVertexAlongAxis( vertex , dsurf.surface.axis.vector ) ;
	
	if ( vertex )
	{
		console.log( "+Dynamic Vertex:" , vertex ) ;
		vertices.push( vertex ) ;
	}
} ;

Shape.prototype.cylinderSphereVertices.localPosition = physic.Vector3D() ;



Shape.prototype.cylinderCylinderVertices = function cylinderCylinderVertices( vertices , dsurf , fsurf , diffPosition , trace )
{
	var vertex , intersection , normal , segment ;
	
	// Cached objects
	var localAxis = cylinderCylinderVertices.localAxis ;
	
	if ( trace )
	{
		// Foreign space
		
		if ( dsurf.surface.axis.isCollinearTo( fsurf.surface.axis ) )
		{
			// Both axis are parallel, so the Minkowski shape is the original cylinder
			// with its radius being the sum of both cylinder
			trace.position.setVector( dsurf.surface.axis.position ).sub( diffPosition ) ;
			intersection = fsurf.surface.traceIntersection( trace , dsurf.surface.r ) ;
			
			// There will not be any collision, skip it
			if ( ! intersection ) { return ; }
			
			// Diff vector
			vertex = physic.Vector3D.fromTo( intersection , fsurf.surface.axis.position )
				.diffProjectOn( fsurf.surface.axis.vector )
				.setLength( dsurf.surface.r ) ;
			
			// Real vertex position
			vertex.add( dsurf.surface.axis.position ) ;
			
			// /!\ Should add a vertex on both end of the Cylinder (cutted by clipping plane) /!\
		}
		else
		{
			// Axis are not parallel, so the Minkowski shape is a plane
			// whose normal is the cross-product of both axis, or its inverse
			trace.position.setVector( dsurf.surface.axis.position ).sub( diffPosition ) ;
			normal = dsurf.surface.axis.vector.crossProduct( fsurf.surface.axis.vector ) ;
			
			if ( normal.dot( physic.Vector3D.fromTo( fsurf.surface.axis.position , trace.position ) ) < 0 )
			{
				normal.inv() ;
			}
			
			intersection = physic.Plane3D.fromVectors( fsurf.surface.axis.position , normal )
				.traceIntersection( trace , dsurf.surface.r + fsurf.surface.r ) ;
			
			// There will not be any collision, skip it
			if ( ! intersection ) { return ; }
			
			// Diff vector
			normal.setLength( dsurf.surface.r ) ;
			localAxis.setVectors( intersection , dsurf.surface.axis.vector ) ;
			vertex = localAxis.shortestSegmentToLine( fsurf.surface.axis ).position.sub( intersection ).sub( normal ) ;
			
			// Real vertex position
			vertex.add( dsurf.surface.axis.position ) ;
		}
	}
	else
	{
		// Create the cylinder local axis
		localAxis.setBoundVector( fsurf.surface.axis ).position.add( diffPosition ) ;
		
		segment = dsurf.surface.axis.shortestSegmentToLine( localAxis ) ;
		vertex = segment.position.moveAlong( segment.vector , dsurf.surface.r ) ;
	}
	
	vertex = this.fixVertexAlongAxis( vertex , dsurf.surface.axis.vector ) ;
	
	if ( vertex )
	{
		console.log( "+Dynamic Vertex:" , vertex ) ;
		vertices.push( vertex ) ;
	}
} ;

Shape.prototype.cylinderCylinderVertices.localAxis = physic.BoundVector3D() ;



// Move a dynamic vertex back on the volume's surface
Shape.prototype.fixVertexAlongAxis = function fixVertexAlongAxis( vertex , axis )
{
	var i , slen = this.surfaces.length ;
	
	var line = fixVertexAlongAxis.line.setVectors( vertex , axis ) ;
	
	for ( i = 0 ; i < slen ; i ++ )
	{
		if ( ! physic.epsilonLte( this.surfaces[ i ].surface.testVector( vertex ) , 0 ) )
		{
			// Drop this vertex if it is moved by a non-plane primitive
			if ( this.surfaces[ i ].type !== physic.PLANE )
			{
				log.warning( "Dropping a dynamic vertex: out of a non-plane primitive" ) ;
				return null ;
			}
			
			//console.log( "moving a vertex from" , vertex ) ;
			vertex = this.surfaces[ i ].surface.lineIntersection( line ) ;
			//console.log( "to" , vertex ) ;
		}
	}
	
	return vertex ;
} ;

Shape.prototype.fixVertexAlongAxis.line = physic.BoundVector3D() ;



// Move a dynamic vertex back on the volume's surface
Shape.prototype.fixVertexAlongSphere = function fixVertexAlongSphere( vertex , sphere )
{
	log.warning( ".fixVertexAlongSphere() was not tested" ) ;
	var i , slen = this.surfaces.length ;
	
	var circle ;
	
	for ( i = 0 ; i < slen ; i ++ )
	{
		if ( ! physic.epsilonLte( this.surfaces[ i ].surface.testVector( vertex ) , 0 ) )
		{
			// Drop this vertex if it is moved by a non-plane primitive
			if ( this.surfaces[ i ].type !== physic.PLANE )
			{
				log.warning( "Dropping a dynamic vertex: out of a non-plane primitive" ) ;
				return null ;
			}
			
			console.log( "moving a vertex from" , vertex ) ;
			circle = sphere.planeIntersection( this.surfaces[ i ].surface ) ;
			vertex = circle.pointProjection( vertex ) ;
			console.log( "to" , vertex ) ;
		}
	}
	
	return vertex ;
} ;



// Check if a shape is overlapping another
Shape.prototype.isOverlapping = function isOverlapping( position , foreignShape , foreignPosition )
{
	var i , vlen ,
		vertex = Object.create( physic.Vector3D.prototype ) ;
	
	var interaction = this.prepareInteraction( position , foreignShape , foreignPosition ) ;
	
	// Check the foreign vertices against the shape
	for ( i = 0 , vlen = interaction.surfaces.length && interaction.foreignVertices.length ; i < vlen ; i ++ )
	{
		vertex.set3Vectors( interaction.foreignVertices[ i ] , foreignPosition , position ) ;
		
		console.log( '#' + i + 'a:' , interaction.foreignVertices[ i ] , '->' , vertex ) ;
		
		if ( Shape.isVertexInsideVolume( vertex , interaction.surfaces ) ) { return true ; }
	}
	
	// Check the vertices against the foreign shape
	for ( i = 0 , vlen = interaction.foreignSurfaces.length && interaction.vertices.length ; i < vlen ; i ++ )
	{
		vertex.set3Vectors( interaction.vertices[ i ] , position , foreignPosition ) ;
		
		console.log( '#' + i + 'b:' , interaction.vertices[ i ] , '->' , vertex ) ;
		
		if ( Shape.isVertexInsideVolume( vertex , interaction.foreignSurfaces ) ) { return true ; }
	}
	
	return false ;
} ;



// /!\ Where the bounding box test should be done? here? upstream? /!\

// Check if a shape is overlapping another
Shape.prototype.getCollision = function getCollision( position , foreignShape , foreignPosition )
{
	var i , vlen , collision , offset ,
		maxOffset = 0 ,
		vertex = Object.create( physic.Vector3D.prototype ) ;
	
	var interaction = this.prepareInteraction( position , foreignShape , foreignPosition ) ;
	
	var collisions = getCollision.collisions ;
	collisions.length = 0 ;
	
	// Check the vertices against the foreign shape
	for ( i = 0 , vlen = interaction.foreignSurfaces.length && interaction.vertices.length ; i < vlen ; i ++ )
	{
		vertex.set3Vectors( interaction.vertices[ i ] , position , foreignPosition ) ;
		
		console.log( '#' + i + 'a:' , interaction.vertices[ i ] , '->' , vertex ) ;
		
		collision = Shape.getAllVertexCollisions( vertex , interaction.foreignSurfaces , interaction.invDiffPosition , false ) ;
		//console.log( '??' , collision ) ;
		
		if ( collision )
		{
			if ( ( offset = collision[ collision.minIndex ].offset ) > maxOffset )
			{
				maxOffset = offset ;
				collisions.maxIndex = collisions.length ;
			}
			
			collisions.push( collision ) ;
		}
	}
	
	// Check the foreign vertices against the shape
	for ( i = 0 , vlen = interaction.surfaces.length && interaction.foreignVertices.length ; i < vlen ; i ++ )
	{
		vertex.set3Vectors( interaction.foreignVertices[ i ] , foreignPosition , position ) ;
		
		console.log( '#' + i + 'b:' , interaction.foreignVertices[ i ] , '->' , vertex ) ;
		
		collision = Shape.getAllVertexCollisions( vertex , interaction.surfaces , interaction.diffPosition , true ) ;
		//console.log( '??' , collision ) ;
		
		if ( collision )
		{
			if ( ( offset = collision[ collision.minIndex ].offset ) > maxOffset )
			{
				maxOffset = offset ;
				collisions.maxIndex = collisions.length ;
			}
			
			collisions.push( collision ) ;
		}
	}
	
	if ( ! collisions.length )
	{
		// No collision!
		return null ;
	}
	else if ( ! maxOffset )
	{
		// Just touching
		return { t: 1 , displacement: physic.nullVector , normal: physic.nullVector } ;
	}
	
	return this.solveVerticesCollisions( collisions ) ;
} ;

Shape.prototype.getCollision.collisions = [] ;



/*
	vertex: relative coordinate to the surface space
	diffPosition: diff position between the surface and the foreign surface of the vertex
*/
Shape.getAllVertexCollisions = function getAllVertexCollisions( vertex , surfaces , diffPosition , foreign )
{
	var i , slen = surfaces.length , normal , offset , contact , intersection , point , minOffset = Infinity ;
	
	if ( ! slen ) { return null ; }
	
	var tests = getAllVertexCollisions.tests ;
	tests.length = 0 ;
	var localTrace = getAllVertexCollisions.localTrace ;
	
	// First run all tests, early out if one does not pass
	for ( i = 0 ; i < slen ; i ++ )
	{
		tests[ i ] = physic.epsilonZero( surfaces[ i ].surface.testVector( vertex ) ) ;
		if ( tests[ i ] > 0 ) { return null ; }
	}
	
	var collisions = [] ;
	
	for ( i = 0 ; i < slen ; i ++ )
	{
		switch ( surfaces[ i ].type )
		{
			case physic.PLANE :
				// The normal is the surface normal
				normal = surfaces[ i ].surface.normal.dup() ;
				
				// For plane, the 'test' value IS the distance from the surface
				offset = - tests[ i ] ;
				contact = offset === 0 ? vertex : vertex.dup().apply( normal , offset ) ;
				break ;
			
			
			case physic.SPHERE :
				
				normal = physic.Vector3D.fromTo( surfaces[ i ].surface.center , vertex ) ;
				
				if ( normal.dot( diffPosition ) > 0 )
				{
					normal.normalize() ;  // MUST BE normalized
					offset = - surfaces[ i ].surface.normalizeTest( tests[ i ] ) ;
					contact = offset === 0 ? vertex : vertex.dup().apply( normal , offset ) ;
				}
				else
				{
					// The object has penetrated too much inside the surface, we can't reject by the vertex,
					// but we should use diffPosition to reject it.
					localTrace.setVectors( vertex , diffPosition ) ;
					intersection = surfaces[ i ].surface.traceIntersection( localTrace , undefined , Infinity ) ;
					
					if ( ! intersection )
					{
						// Fallback: this should not happen, however if we are really unlucky,
						// the vertex may be just touching and may not intersect due to epsilon.
						log.error( ".getAllVertexCollisions() -- SPHERE: Fallback!" ) ;
						normal.inv().normalize() ;
						offset = 0 ;
						contact = vertex ;
					}
					else
					{
						normal = physic.Vector3D.fromTo( vertex , intersection ).normalize() ;	// MUST BE normalized
						offset = vertex.pointDistance( intersection ) ;
						contact = intersection ;
					}
				}
				
				console.log( "offset:" , offset , "normal:" , normal ) ;
				break ;
			
			
			case physic.CYLINDER :
				// Get the closest point of the axis to the vertex
				point = surfaces[ i ].surface.axis.pointProjection( vertex ) ;
				
				normal = physic.Vector3D.fromTo( point , vertex ) ;
				
				if ( normal.dot( diffPosition ) > 0 )
				{
					normal.normalize() ;  // MUST BE normalized
					offset = - surfaces[ i ].surface.normalizeTest( tests[ i ] ) ;
					contact = offset === 0 ? vertex : vertex.dup().apply( normal , offset ) ;
				}
				else
				{
					// The object has penetrated too much inside the surface, we can't reject by the vertex,
					// but we should use diffPosition to reject it.
					localTrace.setVectors( vertex , diffPosition ) ;
					intersection = surfaces[ i ].surface.traceIntersection( localTrace , undefined , Infinity ) ;
					
					if ( ! intersection )
					{
						// Fallback: this should not happen, however if we are really unlucky,
						// the vertex may be just touching and may not intersect due to epsilon.
						log.error( ".getAllVertexCollisions() -- CYLINDER: Fallback!" ) ;
						normal.inv().normalize() ;
						offset = 0 ;
						contact = vertex ;
					}
					else
					{
						normal = physic.Vector3D.fromTo( vertex , intersection ).normalize() ;	// MUST BE normalized
						offset = vertex.pointDistance( intersection ) ;
						contact = intersection ;
					}
				}
				
				console.log( "offset:" , offset , "normal:" , normal ) ;
				break ;
		}
		
		// If foreign, reverse the normal: act as if it's the self shape that is moving, not the foreign shape
		if ( foreign ) { normal.inv() ; }
		
		if ( offset < minOffset ) { minOffset = offset ; collisions.minIndex = i ; }
		
		collisions[ i ] = {
			//vertex: vertex.dup() ,
			normal: normal ,
			offset: offset ,
			currentOffset: offset ,
			contact: contact ,
			foreign: foreign
		} ;
	}
	
	//collisions.sort( ( a , b ) => a.offset - b.offset ) ;
	
	return collisions ;
} ;

Shape.getAllVertexCollisions.tests = [] ;
Shape.getAllVertexCollisions.localTrace = physic.BoundVector3D() ;



// Produce a displacement vector from the array of array of collisions
Shape.prototype.solveVerticesCollisions = function solveVerticesCollisions( collisions )
{
	var i , iMax , j , jMax , adjustement ,
		vertCollisions , vertSurfCollision ,
		maxVertOffset , minVertSurfOffset ,
		maxVertCollisions , minVertSurfCollision ;
	
	/*
		1\ apply the new global maximum of minimum and remove it
		2\ for each remaining vertex, find if one collision is solved by the displacement
		3\ if so, remove the whole vertex collisions
		4\ if not, compute the remaining offset for each vertex collision and the new minimum
		5\ find the new global maximum of minimum
		6\ repeat until no vertex remains
		
		This works for plane, but it's not so great for sphere, because unlike plane,
		the normal depends on the vertex position.
		Anyway, this will be “good enough” for instance.
	*/
	
	var displacement = solveVerticesCollisions.displacement.set( 0 , 0 , 0 ) ;
	
	while ( collisions.length )
	{
		// Apply
		maxVertCollisions = collisions[ collisions.maxIndex ] ;
		minVertSurfCollision = maxVertCollisions[ maxVertCollisions.minIndex ] ;
		
		displacement.apply( minVertSurfCollision.normal , minVertSurfCollision.currentOffset ) ;
		console.log( "New displacement:" , minVertSurfCollision.currentOffset , "->" , displacement ) ;
		
		// Remove the collision
		//collisions.splice( collisions.maxIndex , 1 ) ;
		arrayKit.delete( collisions , collisions.maxIndex ) ;
		
		// Now find the next vertex needing to move
		maxVertOffset = 0 ;
		
		for ( i = 0 , iMax = collisions.length ; i < iMax ; i ++ )
		{
			vertCollisions = collisions[ i ] ;
			
			minVertSurfOffset = Infinity ;
			
			for ( j = 0 , jMax = vertCollisions.length ; j < jMax ; j ++ )
			{
				vertSurfCollision = vertCollisions[ j ] ;
				adjustement = physic.epsilonZero( vertSurfCollision.normal.dot( displacement ) ) ;
				
				if ( adjustement < 0 )
				{
					// Too bad, the displacement is wrong for this vertex collision!
					// There isn't much to do, just hope that things would go better for another surface
					console.log( '>>> Bad adjustement' ) ;
					continue ;
				}
				
				vertSurfCollision.currentOffset = vertSurfCollision.offset - adjustement ;
				
				if ( vertSurfCollision.currentOffset < minVertSurfOffset )
				{
					minVertSurfOffset = vertSurfCollision.currentOffset ;
					
					// If the previous displacement totally solved our constraint, we should break immediately
					if ( minVertSurfOffset <= 0 ) { break ; }
					
					vertCollisions.minIndex = j ;
				}
			}
			
			if ( minVertSurfOffset === Infinity || minVertSurfOffset <= 0 )
			{
				// This vertex has no adjustement possible OR has already been adjusted by another displacement,
				// remove it and update 'i' for the next iteration.
				//collisions.splice( i , 1 ) ;
				arrayKit.delete( collisions , i ) ;
				i -- ;
				iMax -- ;
			}
			else if ( minVertSurfOffset > maxVertOffset )
			{
				maxVertOffset = minVertSurfOffset ;
				collisions.maxIndex = i ;
			}
		}
	}
	
	return {
		t: 1 ,	// t is always 1 for discrete collisions
		displacement: displacement ,
		normal: displacement.dup().normalize() ,
	} ;
} ;

Shape.prototype.solveVerticesCollisions.displacement = physic.Vector3D( 0 , 0 , 0 ) ;



// Check if a shape is overlapping another
Shape.prototype.getContinuousCollision = function getContinuousCollision(
	oldPosition , position ,
	foreignShape , foreignOldPosition , foreignPosition )
{
	var i , vlen , collision , bestCollision ,
		minT = 2 ;	// minT should be anything greater than 1
	
	// Relative movement
	var trace = physic.BoundVector3D( 0 , 0 , 0 , 0 , 0 , 0 ) ;
	trace.vector.setVector( position ).sub( oldPosition ).add( foreignOldPosition ).sub( foreignPosition ) ;
	
	// Maybe we should fallback too if old positions are already overlapping?
	if ( trace.vector.isNull() )
	{
		console.log( "\n!!! No movement! fallback to the discrete collision! !!!\n" ) ;
		return this.getCollision( position , foreignShape , foreignPosition ) ;
	}
	
	var interaction = this.prepareInteraction( oldPosition , foreignShape , foreignOldPosition , trace ) ;
	
	var collisions = getContinuousCollision.collisions ;
	collisions.length = 0 ;
	
	// Check the vertices against the foreign shape
	for ( i = 0 , vlen = interaction.foreignSurfaces.length && interaction.vertices.length ; i < vlen ; i ++ )
	{
		trace.position.set3Vectors( interaction.vertices[ i ] , oldPosition , foreignOldPosition ) ;
		
		console.log( '#' + i + 'a:' , interaction.vertices[ i ] , '->' , trace ) ;
		
		collision = Shape.getTraceCollision( trace , interaction.foreignSurfaces , false ) ;
		//console.log( '??' , collision ) ;
		
		if ( collision && collision.t < minT )
		{
			minT = collision.t ;
			bestCollision = collision ;
		}
	}
	
	// Inverse the movement
	trace.vector.inv() ;
	
	// Check the foreign vertices against the shape
	for ( i = 0 , vlen = interaction.surfaces.length && interaction.foreignVertices.length ; i < vlen ; i ++ )
	{
		trace.position.set3Vectors( interaction.foreignVertices[ i ] , foreignOldPosition , oldPosition ) ;
		
		console.log( '#' + i + 'b:' , interaction.foreignVertices[ i ] , '->' , trace ) ;
		
		collision = Shape.getTraceCollision( trace , interaction.surfaces , true ) ;
		//console.log( '??' , collision ) ;
		
		if ( collision && collision.t < minT )
		{
			minT = collision.t ;
			bestCollision = collision ;
		}
	}
	
	return bestCollision ;
} ;

Shape.prototype.getContinuousCollision.collisions = [] ;



/*
	vertex: relative coordinate to the surface space
*/
Shape.getTraceCollision = function getTraceCollision( trace , surfaces , foreign )
{
	var i , slen = surfaces.length , contact , intersection ,
		minT = 2 ,	// anything greater than 1
		normal ;
	
	if ( ! slen ) { return null ; }
	
	for ( i = 0 ; i < slen ; i ++ )
	{
		// Get the contact point
		intersection = surfaces[ i ].surface.traceIntersection( trace ) ;
		
		// Quit now if no intersection for this trace, or if the intersection would happen after
		// the current best candidate, or if is not inside/touching the volume
		if (
			! intersection ||
			intersection.t >= minT ||
			! Shape.isVertexInsideOrTouchingVolume( intersection , surfaces )
		)
		{
			continue ;
		}
		
		// We've got a new best candidate!
		
		switch ( surfaces[ i ].type )
		{
			case physic.PLANE :
				// The normal is *ALWAYS* the surface normal, wherever the contact happend
				normal = surfaces[ i ].surface.normal.dup() ;
				break ;
			
			case physic.SPHERE :
				// The normal is the vector from the sphere center toward the contact
				normal = physic.Vector3D.fromTo( surfaces[ i ].surface.center , intersection ).normalize() ;	// MUST BE normalized
				break ;
			
			case physic.CYLINDER :
				// The normal is the vector from the axis of the cylinder toward the contact
				normal = surfaces[ i ].surface.axis.lineToPointVector( intersection ).normalize() ;
				break ;
		}
		
		if ( physic.epsilonLte( intersection.t , 0 ) && normal.dotProduct( trace.vector ) > 0 )
		{
			// The movement is already directed outward and happens immediately.
			// We are facing epsilon issue, most probably after a collision in the previous frame.
			// Forget about this collision.
			continue ;
		}
		
		// Replace the former candidate
		contact = intersection ;
		minT = contact.t ;
	}
	
	if ( ! contact ) { return null ; }
	
	var displacement = contact.dup().sub( trace.position ).sub( trace.vector ) ;
	//displacement = contact.dup().sub( trace.getEndPoint() ) ;
	
	// If foreign, reverse the normal and the displacement: act as if
	// it's the self shape that is moving, not the foreign shape
	if ( foreign )
	{
		normal.inv() ;
		displacement.inv() ;
	}
	
	return {
		t: contact.t ,
		displacement: displacement ,
		normal: normal ,
		
		// Useful???
		//vertex: vertex.dup() ,
		//currentT: contactT ,
		contact: contact ,
		foreign: foreign
	} ;
} ;



Shape.Dot = require( './shapes/Dot.js' ) ;
Shape.Plane = require( './shapes/Plane.js' ) ;
Shape.Sphere = require( './shapes/Sphere.js' ) ;
Shape.InfiniteCylinder = require( './shapes/InfiniteCylinder.js' ) ;

Shape.Box = require( './shapes/Box.js' ) ;
Shape.Cylinder = require( './shapes/Cylinder.js' ) ;
Shape.Octahedron = require( './shapes/Octahedron.js' ) ;

