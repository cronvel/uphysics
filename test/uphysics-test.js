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

/* jshint unused:false */
/* global describe, it, before, after */



var physic = require( '../lib/physic.js' ) ;
var expect = require( 'expect.js' ) ;





			/* Helper */



function expectCirca( value , circa )
{
    var precision = 0.000000000001 ;
    expect( value ).to.be.within( circa - precision , circa + precision ) ;
}



			/* Tests */



describe( "Shape discrete collisions" , function() {
	
	it( "dot against box" , function() {
		var collision ;
		var dotShape = physic.Shape.createDot() ;
		var dotPos = physic.Vector3D( 0.5 , 0 , 0 ) ;
		var boxShape = physic.Shape.createBox( 3 , 4 , 5 ) ;
		var boxPos = physic.Vector3D( 0 , 0 , 0 ) ;
		
		collision = dotShape.getCollision( dotPos , boxShape , boxPos ) ;
		//console.log( collision ) ;
		expect( collision.t ).to.be( 1 ) ;
		expect( collision.displacement ).to.eql( { x: 1, y: 0, z: 0 } ) ;
		expect( collision.normal ).to.eql( { x: 1, y: 0, z: 0 } ) ;
		
		dotPos = physic.Vector3D( 0 , 1 , 0 ) ;
		collision = dotShape.getCollision( dotPos , boxShape , boxPos ) ;
		//console.log( collision ) ;
		expect( collision.t ).to.be( 1 ) ;
		expect( collision.displacement ).to.eql( { x: 0, y: 1, z: 0 } ) ;
		expect( collision.normal ).to.eql( { x: 0, y: 1, z: 0 } ) ;
	} ) ;
	
	it( "dot against sphere" , function() {
		var collision ;
		var dotShape = physic.Shape.createDot() ;
		var dotPos = physic.Vector3D( 0.5 , 0 , 0 ) ;
		var sphereShape = physic.Shape.createSphere( 2 ) ;
		var spherePos = physic.Vector3D( 0 , 0 , 0 ) ;
		
		collision = dotShape.getCollision( dotPos , sphereShape , spherePos ) ;
		//console.log( collision ) ;
		expect( collision.t ).to.be( 1 ) ;
		expect( collision.displacement ).to.eql( { x: 1.5, y: 0, z: 0 } ) ;
		expect( collision.normal ).to.eql( { x: 1, y: 0, z: 0 } ) ;
		
		dotPos = physic.Vector3D( 0 , 1 , 0 ) ;
		collision = dotShape.getCollision( dotPos , sphereShape , spherePos ) ;
		//console.log( collision ) ;
		expect( collision.t ).to.be( 1 ) ;
		expect( collision.displacement ).to.eql( { x: 0, y: 1, z: 0 } ) ;
		expect( collision.normal ).to.eql( { x: 0, y: 1, z: 0 } ) ;
		
		dotPos = physic.Vector3D( 1 , 1 , 0 ) ;
		collision = dotShape.getCollision( dotPos , sphereShape , spherePos ) ;
		//console.log( collision ) ;
		expect( collision.t ).to.be( 1 ) ;
		expectCirca( collision.displacement.x , Math.SQRT2 - 1 ) ;
		expectCirca( collision.displacement.y , Math.SQRT2 - 1 ) ;
		expectCirca( collision.displacement.z , 0 ) ;
		expectCirca( collision.normal.x , Math.SQRT1_2 ) ;
		expectCirca( collision.normal.y , Math.SQRT1_2 ) ;
		expectCirca( collision.normal.z , 0 ) ;
		
		dotPos = physic.Vector3D( 1 , 1 , 1 ) ;
		collision = dotShape.getCollision( dotPos , sphereShape , spherePos ) ;
		//console.log( collision ) ;
		expect( collision.t ).to.be( 1 ) ;
		expectCirca( collision.displacement.x , 2 / Math.sqrt( 3 ) - 1 ) ;
		expectCirca( collision.displacement.y , 2 / Math.sqrt( 3 ) - 1 ) ;
		expectCirca( collision.displacement.z , 2 / Math.sqrt( 3 ) - 1 ) ;
		expectCirca( collision.normal.x , 1 / Math.sqrt( 3 ) ) ;
		expectCirca( collision.normal.y , 1 / Math.sqrt( 3 ) ) ;
		expectCirca( collision.normal.z , 1 / Math.sqrt( 3 ) ) ;
	} ) ;
	
	it( "dot against infinite cylinder" , function() {
		var collision ;
		var dotShape = physic.Shape.createDot() ;
		var dotPos = physic.Vector3D( 0.5 , 0 , 0 ) ;
		var iCylinderShape = physic.Shape.createInfiniteCylinder( { x: 0, y: 0, z: 1 } , 2 ) ;
		var iCylinderPos = physic.Vector3D( 0 , 0 , 0 ) ;
		
		collision = dotShape.getCollision( dotPos , iCylinderShape , iCylinderPos ) ;
		//console.log( collision ) ;
		expect( collision.t ).to.be( 1 ) ;
		expect( collision.displacement ).to.eql( { x: 1.5, y: 0, z: 0 } ) ;
		expect( collision.normal ).to.eql( { x: 1, y: 0, z: 0 } ) ;
		
		dotPos = physic.Vector3D( 0 , 1 , 0 ) ;
		collision = dotShape.getCollision( dotPos , iCylinderShape , iCylinderPos ) ;
		//console.log( collision ) ;
		expect( collision.t ).to.be( 1 ) ;
		expect( collision.displacement ).to.eql( { x: 0, y: 1, z: 0 } ) ;
		expect( collision.normal ).to.eql( { x: 0, y: 1, z: 0 } ) ;
		
		dotPos = physic.Vector3D( 1 , 1 , 0 ) ;
		collision = dotShape.getCollision( dotPos , iCylinderShape , iCylinderPos ) ;
		//console.log( collision ) ;
		expect( collision.t ).to.be( 1 ) ;
		expectCirca( collision.displacement.x , Math.SQRT2 - 1 ) ;
		expectCirca( collision.displacement.y , Math.SQRT2 - 1 ) ;
		expectCirca( collision.displacement.z , 0 ) ;
		expectCirca( collision.normal.x , Math.SQRT1_2 ) ;
		expectCirca( collision.normal.y , Math.SQRT1_2 ) ;
		expectCirca( collision.normal.z , 0 ) ;
		
		dotPos = physic.Vector3D( 1 , 1 , 1 ) ;
		collision = dotShape.getCollision( dotPos , iCylinderShape , iCylinderPos ) ;
		//console.log( collision ) ;
		expect( collision.t ).to.be( 1 ) ;
		expectCirca( collision.displacement.x , Math.SQRT2 - 1 ) ;
		expectCirca( collision.displacement.y , Math.SQRT2 - 1 ) ;
		expectCirca( collision.displacement.z , 0 ) ;
		expectCirca( collision.normal.x , Math.SQRT1_2 ) ;
		expectCirca( collision.normal.y , Math.SQRT1_2 ) ;
		expectCirca( collision.normal.z , 0 ) ;
	} ) ;
	
	it( "dot against cylinder" , function() {
		var collision ;
		var dotShape = physic.Shape.createDot() ;
		var dotPos = physic.Vector3D( 0.5 , 0 , 0 ) ;
		var cylinderShape = physic.Shape.createCylinder( { x: 0, y: 0, z: 1 } , 2 , 4 ) ;
		var cylinderPos = physic.Vector3D( 0 , 0 , 0 ) ;
		
		collision = dotShape.getCollision( dotPos , cylinderShape , cylinderPos ) ;
		//console.log( collision ) ;
		expect( collision.t ).to.be( 1 ) ;
		expect( collision.displacement ).to.eql( { x: 1.5, y: 0, z: 0 } ) ;
		expect( collision.normal ).to.eql( { x: 1, y: 0, z: 0 } ) ;
		
		dotPos = physic.Vector3D( 0 , 1 , 0 ) ;
		collision = dotShape.getCollision( dotPos , cylinderShape , cylinderPos ) ;
		//console.log( collision ) ;
		expect( collision.t ).to.be( 1 ) ;
		expect( collision.displacement ).to.eql( { x: 0, y: 1, z: 0 } ) ;
		expect( collision.normal ).to.eql( { x: 0, y: 1, z: 0 } ) ;
		
		dotPos = physic.Vector3D( 1 , 1 , 0 ) ;
		collision = dotShape.getCollision( dotPos , cylinderShape , cylinderPos ) ;
		//console.log( collision ) ;
		expect( collision.t ).to.be( 1 ) ;
		expectCirca( collision.displacement.x , Math.SQRT2 - 1 ) ;
		expectCirca( collision.displacement.y , Math.SQRT2 - 1 ) ;
		expectCirca( collision.displacement.z , 0 ) ;
		expectCirca( collision.normal.x , Math.SQRT1_2 ) ;
		expectCirca( collision.normal.y , Math.SQRT1_2 ) ;
		expectCirca( collision.normal.z , 0 ) ;
		
		dotPos = physic.Vector3D( 1 , 1 , 1 ) ;
		collision = dotShape.getCollision( dotPos , cylinderShape , cylinderPos ) ;
		//console.log( collision ) ;
		expect( collision.t ).to.be( 1 ) ;
		expectCirca( collision.displacement.x , Math.SQRT2 - 1 ) ;
		expectCirca( collision.displacement.y , Math.SQRT2 - 1 ) ;
		expectCirca( collision.displacement.z , 0 ) ;
		expectCirca( collision.normal.x , Math.SQRT1_2 ) ;
		expectCirca( collision.normal.y , Math.SQRT1_2 ) ;
		expectCirca( collision.normal.z , 0 ) ;
		
		dotPos = physic.Vector3D( 1 , 1 , 2.01 ) ;
		collision = dotShape.getCollision( dotPos , cylinderShape , cylinderPos ) ;
		//console.log( collision ) ;
		expect( collision ).to.be( null ) ;
	} ) ;
	
	it( "dot against octahedron" ) ;
	
	it.next( "sphere against box -- bug: each dynamic vertex should only be tested against the relevant surface" , function() {
		var collision ;
		var sphereShape = physic.Shape.createSphere( 1 ) ;
		var spherePos = physic.Vector3D( 1 , 0 , 0 ) ;
		var boxShape = physic.Shape.createBox( 3 , 4 , 5 ) ;
		var boxPos = physic.Vector3D( 0 , 0 , 0 ) ;
		
		/*
		collision = sphereShape.getCollision( spherePos , boxShape , boxPos ) ;
		//console.log( collision ) ;
		expect( collision.t ).to.be( 1 ) ;
		expect( collision.displacement ).to.eql( { x: 1.5, y: 0, z: 0 } ) ;
		expect( collision.normal ).to.eql( { x: 1, y: 0, z: 0 } ) ;
		//*/
		
		spherePos = physic.Vector3D( 0.1 , 0 , 0 ) ;
		collision = sphereShape.getCollision( spherePos , boxShape , boxPos ) ;
		console.log( collision ) ;
		expect( collision.t ).to.be( 1 ) ;
		expect( collision.displacement ).to.eql( { x: 0, y: 2.6, z: 0 } ) ;
		expect( collision.normal ).to.eql( { x: 0, y: 1, z: 0 } ) ;
		
		/*
		spherePos = physic.Vector3D( 1 , 1 , 1 ) ;
		collision = sphereShape.getCollision( spherePos , boxShape , boxPos ) ;
		//console.log( collision ) ;
		expect( collision.t ).to.be( 1 ) ;
		expect( collision.displacement ).to.eql( { x: 2.5, y: 0, z: 0 } ) ;
		expect( collision.normal ).to.eql( { x: 1, y: 0, z: 0 } ) ;
		//*/
	} ) ;
	
	it.next( "sphere against box: edge collision" , function() {
		var collision ;
		var sphereShape = physic.Shape.createSphere( 1 ) ;
		var spherePos = physic.Vector3D( 0 , 0 , 0 ) ;
		var boxShape = physic.Shape.createBox( 3 , 4 , 5 ) ;
		var boxPos = physic.Vector3D( 0 , 0 , 0 ) ;
		
		spherePos = physic.Vector3D( 0 , 1 , 3 ) ;
		collision = sphereShape.getCollision( spherePos , boxShape , boxPos ) ;
		//console.log( collision ) ;
		//expect( collision.t ).to.be( 0.7 ) ;
		//expect( collision.displacement ).to.eql( { x: 1.5, y: 0, z: 0 } ) ;
		expect( collision.normal ).to.eql( { x: Math.SQRT1_2, y: 0, z: Math.SQRT1_2 } ) ;
	} ) ;
	
	it( "sphere against sphere" , function() {
		var collision ;
		var movingSphereShape = physic.Shape.createSphere( 1 ) ;
		var movingSpherePos = physic.Vector3D( 1 , 0 , 0 ) ;
		var sphereShape = physic.Shape.createSphere( 2 ) ;
		var spherePos = physic.Vector3D( 0 , 0 , 0 ) ;
		
		collision = movingSphereShape.getCollision( movingSpherePos , sphereShape , spherePos ) ;
		//console.log( collision ) ;
		expect( collision.t ).to.be( 1 ) ;
		expect( collision.displacement ).to.eql( { x: 2, y: 0, z: 0 } ) ;
		expect( collision.normal ).to.eql( { x: 1, y: 0, z: 0 } ) ;
		
		movingSpherePos = physic.Vector3D( 1 , 1 , 0 ) ;
		collision = movingSphereShape.getCollision( movingSpherePos , sphereShape , spherePos ) ;
		//console.log( collision ) ;
		expect( collision.t ).to.be( 1 ) ;
		expectCirca( collision.displacement.x , 1.1213203435596424 ) ;
		expectCirca( collision.displacement.y , 1.1213203435596424 ) ;
		expectCirca( collision.displacement.z , 0 ) ;
		expectCirca( collision.normal.x , Math.SQRT1_2 ) ;
		expectCirca( collision.normal.y , Math.SQRT1_2 ) ;
		expectCirca( collision.normal.z , 0 ) ;
		
		movingSpherePos = physic.Vector3D( 1 , 1 , 1 ) ;
		collision = movingSphereShape.getCollision( movingSpherePos , sphereShape , spherePos ) ;
		//console.log( collision ) ;
		expect( collision.t ).to.be( 1 ) ;
		expectCirca( collision.displacement.x , 0.7320508075688774 ) ;
		expectCirca( collision.displacement.y , 0.7320508075688774 ) ;
		expectCirca( collision.displacement.z , 0.7320508075688774 ) ;
		expectCirca( collision.normal.x , 0.5773502691896258 ) ;
		expectCirca( collision.normal.y , 0.5773502691896258 ) ;
		expectCirca( collision.normal.z , 0.5773502691896258 ) ;
	} ) ;
	
	it( "sphere against cylinder" ) ;
	it( "cylinder against cylinder" ) ;
} ) ;



describe( "Shape continuous collisions" , function() {
	
	it( "dot against box" , function() {
		var collision ;
		var dotShape = physic.Shape.createDot() ;
		var dotOldPos = physic.Vector3D( 5 , 0 , 0 ) ;
		var dotPos = physic.Vector3D( 0 , 0 , 0 ) ;
		var boxShape = physic.Shape.createBox( 3 , 4 , 5 ) ;
		var boxOldPos = physic.Vector3D( 0 , 0 , 0 ) ;
		var boxPos = physic.Vector3D( 0 , 0 , 0 ) ;
		
		//*
		collision = dotShape.getContinuousCollision( dotOldPos , dotPos , boxShape , boxOldPos , boxPos ) ;
		//console.log( collision ) ;
		expect( collision.t ).to.be( 0.7 ) ;
		expect( collision.displacement ).to.eql( { x: 1.5, y: 0, z: 0 } ) ;
		expect( collision.normal ).to.eql( { x: 1, y: 0, z: 0 } ) ;
		
		collision = boxShape.getContinuousCollision( boxOldPos , boxPos , dotShape , dotOldPos , dotPos ) ;
		//console.log( collision ) ;
		expect( collision.t ).to.be( 0.7 ) ;
		expect( collision.displacement ).to.eql( { x: -1.5, y: 0, z: 0 } ) ;
		expect( collision.normal ).to.eql( { x: -1, y: 0, z: 0 } ) ;
		//*/
		
		dotOldPos = physic.Vector3D( 5 , -4 , 0 ) ;
		dotPos = physic.Vector3D( 0 , 1 , 0 ) ;
		collision = dotShape.getContinuousCollision( dotOldPos , dotPos , boxShape , boxOldPos , boxPos ) ;
		//console.log( collision ) ;
		expect( collision.t ).to.be( 0.7 ) ;
		// displacement y:-1.5 because, so contact is made at y:-0.5
		expect( collision.displacement ).to.eql( { x: 1.5, y: -1.5, z: 0 } ) ;
		expect( collision.normal ).to.eql( { x: 1, y: 0, z: 0 } ) ;
	} ) ;
	
	it( "dot against sphere" , function() {
		var collision ;
		var dotShape = physic.Shape.createDot() ;
		var dotOldPos = physic.Vector3D( 5 , 0 , 0 ) ;
		var dotPos = physic.Vector3D( 0 , 0 , 0 ) ;
		var sphereShape = physic.Shape.createSphere( 2 ) ;
		var sphereOldPos = physic.Vector3D( 0 , 0 , 0 ) ;
		var spherePos = physic.Vector3D( 0 , 0 , 0 ) ;
		
		collision = dotShape.getContinuousCollision( dotOldPos , dotPos , sphereShape , sphereOldPos , spherePos ) ;
		//console.log( collision ) ;
		expect( collision.t ).to.be( 0.6 ) ;
		expect( collision.displacement ).to.eql( { x: 2, y: 0, z: 0 } ) ;
		expect( collision.normal ).to.eql( { x: 1, y: 0, z: 0 } ) ;
		
		collision = sphereShape.getContinuousCollision( sphereOldPos , spherePos , dotShape , dotOldPos , dotPos ) ;
		//console.log( collision ) ;
		expect( collision.t ).to.be( 0.6 ) ;
		expect( collision.displacement ).to.eql( { x: -2, y: 0, z: 0 } ) ;
		expect( collision.normal ).to.eql( { x: -1, y: 0, z: 0 } ) ;
		
		dotOldPos = physic.Vector3D( 5 , 1 , 0 ) ;
		dotPos = physic.Vector3D( 0 , 1 , 0 ) ;
		collision = dotShape.getContinuousCollision( dotOldPos , dotPos , sphereShape , sphereOldPos , spherePos ) ;
		//console.log( collision ) ;
		expect( collision.t ).to.be( 0.6535898384862244 ) ;
		expectCirca( collision.displacement.x , Math.sqrt( 3 ) ) ;
		expectCirca( collision.displacement.y , 0 ) ;
		expectCirca( collision.displacement.z , 0 ) ;
		expectCirca( collision.normal.x , Math.sqrt( 3 ) / 2 ) ;
		expectCirca( collision.normal.y , 0.5 ) ;
		expectCirca( collision.normal.z , 0 ) ;
		
		dotOldPos = physic.Vector3D( 5 , 1 , 1 ) ;
		dotPos = physic.Vector3D( 0 , 1 , 1 ) ;
		collision = dotShape.getContinuousCollision( dotOldPos , dotPos , sphereShape , sphereOldPos , spherePos ) ;
		//console.log( collision ) ;
		expect( collision.t ).to.be( 0.717157287525381 ) ;
		expectCirca( collision.displacement.x , Math.SQRT2 ) ;
		expectCirca( collision.displacement.y , 0 ) ;
		expectCirca( collision.displacement.z , 0 ) ;
		expectCirca( collision.normal.x , Math.SQRT1_2 ) ;
		expectCirca( collision.normal.y , 0.5 ) ;
		expectCirca( collision.normal.z , 0.5 ) ;
	} ) ;
	
	it( "dot against infinite cylinder" , function() {
		var collision ;
		var dotShape = physic.Shape.createDot() ;
		var dotOldPos = physic.Vector3D( 5 , 0 , 0 ) ;
		var dotPos = physic.Vector3D( 0 , 0 , 0 ) ;
		var iCylinderShape = physic.Shape.createInfiniteCylinder( { x: 0, y: 0, z: 1 } , 2 ) ;
		var iCylinderOldPos = physic.Vector3D( 0 , 0 , 0 ) ;
		var iCylinderPos = physic.Vector3D( 0 , 0 , 0 ) ;
		
		collision = dotShape.getContinuousCollision( dotOldPos , dotPos , iCylinderShape , iCylinderOldPos , iCylinderPos ) ;
		//console.log( collision ) ;
		expect( collision.t ).to.be( 0.6 ) ;
		expect( collision.displacement ).to.eql( { x: 2, y: 0, z: 0 } ) ;
		expect( collision.normal ).to.eql( { x: 1, y: 0, z: 0 } ) ;
		
		collision = iCylinderShape.getContinuousCollision( iCylinderOldPos , iCylinderPos , dotShape , dotOldPos , dotPos ) ;
		//console.log( collision ) ;
		expect( collision.t ).to.be( 0.6 ) ;
		expect( collision.displacement ).to.eql( { x: -2, y: 0, z: 0 } ) ;
		expect( collision.normal ).to.eql( { x: -1, y: 0, z: 0 } ) ;
		
		dotOldPos = physic.Vector3D( 5 , 1 , 0 ) ;
		dotPos = physic.Vector3D( 0 , 1 , 0 ) ;
		collision = dotShape.getContinuousCollision( dotOldPos , dotPos , iCylinderShape , iCylinderOldPos , iCylinderPos ) ;
		//console.log( collision ) ;
		expect( collision.t ).to.be( 0.6535898384862244 ) ;
		expectCirca( collision.displacement.x , Math.sqrt( 3 ) ) ;
		expectCirca( collision.displacement.y , 0 ) ;
		expectCirca( collision.displacement.z , 0 ) ;
		expectCirca( collision.normal.x , Math.sqrt( 3 ) / 2 ) ;
		expectCirca( collision.normal.y , 0.5 ) ;
		expectCirca( collision.normal.z , 0 ) ;
		
		dotOldPos = physic.Vector3D( 5 , 1 , 1 ) ;
		dotPos = physic.Vector3D( 0 , 1 , 1 ) ;
		collision = dotShape.getContinuousCollision( dotOldPos , dotPos , iCylinderShape , iCylinderOldPos , iCylinderPos ) ;
		//console.log( collision ) ;
		expect( collision.t ).to.be( 0.6535898384862244 ) ;
		expectCirca( collision.displacement.x , Math.sqrt( 3 ) ) ;
		expectCirca( collision.displacement.y , 0 ) ;
		expectCirca( collision.displacement.z , 0 ) ;
		expectCirca( collision.normal.x , Math.sqrt( 3 ) / 2 ) ;
		expectCirca( collision.normal.y , 0.5 ) ;
		expectCirca( collision.normal.z , 0 ) ;
	} ) ;
	
	it( "dot against cylinder" , function() {
		var collision ;
		var dotShape = physic.Shape.createDot() ;
		var dotOldPos = physic.Vector3D( 5 , 0 , 0 ) ;
		var dotPos = physic.Vector3D( 0 , 0 , 0 ) ;
		var cylinderShape = physic.Shape.createCylinder( { x: 0, y: 0, z: 1 } , 2 , 4 ) ;
		var cylinderOldPos = physic.Vector3D( 0 , 0 , 0 ) ;
		var cylinderPos = physic.Vector3D( 0 , 0 , 0 ) ;
		
		collision = dotShape.getContinuousCollision( dotOldPos , dotPos , cylinderShape , cylinderOldPos , cylinderPos ) ;
		//console.log( collision ) ;
		expect( collision.t ).to.be( 0.6 ) ;
		expect( collision.displacement ).to.eql( { x: 2, y: 0, z: 0 } ) ;
		expect( collision.normal ).to.eql( { x: 1, y: 0, z: 0 } ) ;
		
		collision = cylinderShape.getContinuousCollision( cylinderOldPos , cylinderPos , dotShape , dotOldPos , dotPos ) ;
		//console.log( collision ) ;
		expect( collision.t ).to.be( 0.6 ) ;
		expect( collision.displacement ).to.eql( { x: -2, y: 0, z: 0 } ) ;
		expect( collision.normal ).to.eql( { x: -1, y: 0, z: 0 } ) ;
		
		dotOldPos = physic.Vector3D( 5 , 1 , 0 ) ;
		dotPos = physic.Vector3D( 0 , 1 , 0 ) ;
		collision = dotShape.getContinuousCollision( dotOldPos , dotPos , cylinderShape , cylinderOldPos , cylinderPos ) ;
		//console.log( collision ) ;
		expect( collision.t ).to.be( 0.6535898384862244 ) ;
		expectCirca( collision.displacement.x , Math.sqrt( 3 ) ) ;
		expectCirca( collision.displacement.y , 0 ) ;
		expectCirca( collision.displacement.z , 0 ) ;
		expectCirca( collision.normal.x , Math.sqrt( 3 ) / 2 ) ;
		expectCirca( collision.normal.y , 0.5 ) ;
		expectCirca( collision.normal.z , 0 ) ;
		
		dotOldPos = physic.Vector3D( 5 , 1 , 1 ) ;
		dotPos = physic.Vector3D( 0 , 1 , 1 ) ;
		collision = dotShape.getContinuousCollision( dotOldPos , dotPos , cylinderShape , cylinderOldPos , cylinderPos ) ;
		//console.log( collision ) ;
		expect( collision.t ).to.be( 0.6535898384862244 ) ;
		expectCirca( collision.displacement.x , Math.sqrt( 3 ) ) ;
		expectCirca( collision.displacement.y , 0 ) ;
		expectCirca( collision.displacement.z , 0 ) ;
		expectCirca( collision.normal.x , Math.sqrt( 3 ) / 2 ) ;
		expectCirca( collision.normal.y , 0.5 ) ;
		expectCirca( collision.normal.z , 0 ) ;
		
		// over the cylinder, no collision
		dotOldPos = physic.Vector3D( 5 , 1 , 3 ) ;
		dotPos = physic.Vector3D( 0 , 1 , 3 ) ;
		collision = dotShape.getContinuousCollision( dotOldPos , dotPos , cylinderShape , cylinderOldPos , cylinderPos ) ;
		//console.log( collision ) ;
		expect( collision ).to.be( null ) ;
		
		dotOldPos = physic.Vector3D( 0 , 0 , 5 ) ;
		dotPos = physic.Vector3D( 0 , 0 , 0 ) ;
		collision = dotShape.getContinuousCollision( dotOldPos , dotPos , cylinderShape , cylinderOldPos , cylinderPos ) ;
		//console.log( collision ) ;
		expect( collision.t ).to.be( 0.6 ) ;
		expect( collision.displacement ).to.eql( { x: 0, y: 0, z: 2 } ) ;
		expect( collision.normal ).to.eql( { x: 0, y: 0, z: 1 } ) ;
	} ) ;
	
	it( "dot against octahedron" ) ;
	
	it( "sphere against box" , function() {
		var collision ;
		var sphereShape = physic.Shape.createSphere( 1 ) ;
		var sphereOldPos = physic.Vector3D( 5 , 0 , 0 ) ;
		var spherePos = physic.Vector3D( 0 , 0 , 0 ) ;
		var boxShape = physic.Shape.createBox( 3 , 4 , 5 ) ;
		var boxOldPos = physic.Vector3D( 0 , 0 , 0 ) ;
		var boxPos = physic.Vector3D( 0 , 0 , 0 ) ;
		
		collision = sphereShape.getContinuousCollision( sphereOldPos , spherePos , boxShape , boxOldPos , boxPos ) ;
		//console.log( collision ) ;
		expect( collision.t ).to.be( 0.5 ) ;
		expect( collision.displacement ).to.eql( { x: 2.5, y: 0, z: 0 } ) ;
		expect( collision.normal ).to.eql( { x: 1, y: 0, z: 0 } ) ;
		
		sphereOldPos = physic.Vector3D( 5 , 1 , 0 ) ;
		spherePos = physic.Vector3D( 0 , 1 , 0 ) ;
		collision = sphereShape.getContinuousCollision( sphereOldPos , spherePos , boxShape , boxOldPos , boxPos ) ;
		//console.log( collision ) ;
		expect( collision.t ).to.be( 0.5 ) ;
		expect( collision.displacement ).to.eql( { x: 2.5, y: 0, z: 0 } ) ;
		expect( collision.normal ).to.eql( { x: 1, y: 0, z: 0 } ) ;
		
		sphereOldPos = physic.Vector3D( 5 , 1 , 1 ) ;
		spherePos = physic.Vector3D( 0 , 1 , 1 ) ;
		collision = sphereShape.getContinuousCollision( sphereOldPos , spherePos , boxShape , boxOldPos , boxPos ) ;
		//console.log( collision ) ;
		expect( collision.t ).to.be( 0.5 ) ;
		expect( collision.displacement ).to.eql( { x: 2.5, y: 0, z: 0 } ) ;
		expect( collision.normal ).to.eql( { x: 1, y: 0, z: 0 } ) ;
	} ) ;
	
	it.next( "sphere against box: edge collision" , function() {
		var collision ;
		var sphereShape = physic.Shape.createSphere( 1 ) ;
		var sphereOldPos = physic.Vector3D( 5 , 0 , 0 ) ;
		var spherePos = physic.Vector3D( 0 , 0 , 0 ) ;
		var boxShape = physic.Shape.createBox( 3 , 4 , 5 ) ;
		var boxOldPos = physic.Vector3D( 0 , 0 , 0 ) ;
		var boxPos = physic.Vector3D( 0 , 0 , 0 ) ;
		
		sphereOldPos = physic.Vector3D( 5 , 1 , 3 ) ;
		spherePos = physic.Vector3D( 0 , 1 , 3 ) ;
		collision = sphereShape.getContinuousCollision( sphereOldPos , spherePos , boxShape , boxOldPos , boxPos ) ;
		//console.log( collision ) ;
		//expect( collision.t ).to.be( 0.7 ) ;
		//expect( collision.displacement ).to.eql( { x: 1.5, y: 0, z: 0 } ) ;
		expect( collision.normal ).to.eql( { x: Math.SQRT1_2, y: 0, z: Math.SQRT1_2 } ) ;
	} ) ;
	
	it( "sphere against sphere" , function() {
		var collision ;
		var movingSphereShape = physic.Shape.createSphere( 1 ) ;
		var movingSphereOldPos = physic.Vector3D( 5 , 0 , 0 ) ;
		var movingSpherePos = physic.Vector3D( 0 , 0 , 0 ) ;
		var sphereShape = physic.Shape.createSphere( 2 ) ;
		var sphereOldPos = physic.Vector3D( 0 , 0 , 0 ) ;
		var spherePos = physic.Vector3D( 0 , 0 , 0 ) ;
		
		collision = movingSphereShape.getContinuousCollision( movingSphereOldPos , movingSpherePos , sphereShape , sphereOldPos , spherePos ) ;
		//console.log( collision ) ;
		expect( collision.t ).to.be( 0.4 ) ;
		expect( collision.displacement ).to.eql( { x: 3, y: 0, z: 0 } ) ;
		expect( collision.normal ).to.eql( { x: 1, y: 0, z: 0 } ) ;
		
		movingSphereOldPos = physic.Vector3D( 5 , 1 , 0 ) ;
		movingSpherePos = physic.Vector3D( 0 , 1 , 0 ) ;
		collision = movingSphereShape.getContinuousCollision( movingSphereOldPos , movingSpherePos , sphereShape , sphereOldPos , spherePos ) ;
		//console.log( collision ) ;
		expect( collision.t ).to.be( 0.4343145750507619 ) ;
		expectCirca( collision.displacement.x , 2.8284271247461907 ) ;
		expectCirca( collision.displacement.y , 0 ) ;
		expectCirca( collision.displacement.z , 0 ) ;
		expectCirca( collision.normal.x , 0.9428090415820634 ) ;
		expectCirca( collision.normal.y , 1/3 ) ;
		expectCirca( collision.normal.z , 0 ) ;
		
		movingSphereOldPos = physic.Vector3D( 5 , 1 , 1 ) ;
		movingSpherePos = physic.Vector3D( 0 , 1 , 1 ) ;
		collision = movingSphereShape.getContinuousCollision( movingSphereOldPos , movingSpherePos , sphereShape , sphereOldPos , spherePos ) ;
		//console.log( collision ) ;
		expect( collision.t ).to.be( 0.4708497377870816 ) ;
		expectCirca( collision.displacement.x , 2.645751311064592 ) ;
		expectCirca( collision.displacement.y , 0 ) ;
		expectCirca( collision.displacement.z , 0 ) ;
		expectCirca( collision.normal.x , 0.881917103688197 ) ;
		expectCirca( collision.normal.y , 1/3 ) ;
		expectCirca( collision.normal.z , 1/3 ) ;
	} ) ;
	
	it( "sphere against cylinder" , function() {
		var collision ;
		var sphereShape = physic.Shape.createSphere( 1 ) ;
		var sphereOldPos = physic.Vector3D( 5 , 0 , 0 ) ;
		var spherePos = physic.Vector3D( 0 , 0 , 0 ) ;
		var cylinderShape = physic.Shape.createCylinder( { x: 0, y: 0, z: 1 } , 2 , 4 ) ;
		var cylinderOldPos = physic.Vector3D( 0 , 0 , 0 ) ;
		var cylinderPos = physic.Vector3D( 0 , 0 , 0 ) ;
		
		collision = sphereShape.getContinuousCollision( sphereOldPos , spherePos , cylinderShape , cylinderOldPos , cylinderPos ) ;
		//console.log( collision ) ;
		expect( collision.t ).to.be( 0.4 ) ;
		expect( collision.displacement ).to.eql( { x: 3, y: 0, z: 0 } ) ;
		expect( collision.normal ).to.eql( { x: 1, y: 0, z: 0 } ) ;
		
		sphereOldPos = physic.Vector3D( 5 , 1 , 0 ) ;
		spherePos = physic.Vector3D( 0 , 1 , 0 ) ;
		collision = sphereShape.getContinuousCollision( sphereOldPos , spherePos , cylinderShape , cylinderOldPos , cylinderPos ) ;
		//console.log( collision ) ;
		expectCirca( collision.t , 0.4343145750507619 ) ;
		expectCirca( collision.displacement.x , 2.8284271247461907 ) ;
		expectCirca( collision.displacement.y , 0 ) ;
		expectCirca( collision.displacement.z , 0 ) ;
		expectCirca( collision.normal.x , 0.9428090415820634 ) ;
		expectCirca( collision.normal.y , 1/3 ) ;
		expectCirca( collision.normal.z , 0 ) ;
		
		sphereOldPos = physic.Vector3D( 5 , 1 , 1 ) ;
		spherePos = physic.Vector3D( 0 , 1 , 1 ) ;
		collision = sphereShape.getContinuousCollision( sphereOldPos , spherePos , cylinderShape , cylinderOldPos , cylinderPos ) ;
		//console.log( collision ) ;
		expectCirca( collision.t , 0.4343145750507619 ) ;
		expectCirca( collision.displacement.x , 2.8284271247461903 ) ;
		expectCirca( collision.displacement.y , 0 ) ;
		expectCirca( collision.displacement.z , 0 ) ;
		expectCirca( collision.normal.x , 0.9428090415820635 ) ;
		expectCirca( collision.normal.y , 1/3 ) ;
		expectCirca( collision.normal.z , 0 ) ;
	} ) ;
	
	it( "cylinder against cylinder" , function() {
		var collision ;
		var movingCylinderShape = physic.Shape.createCylinder( { x: 0, y: 0, z: 1 } , 1 , 4 ) ;
		var movingCylinderOldPos = physic.Vector3D( 5 , 0 , 0 ) ;
		var movingCylinderPos = physic.Vector3D( 0 , 0 , 0 ) ;
		var cylinderShape = physic.Shape.createCylinder( { x: 0, y: 0, z: 1 } , 2 , 4 ) ;
		var cylinderOldPos = physic.Vector3D( 0 , 0 , 0 ) ;
		var cylinderPos = physic.Vector3D( 0 , 0 , 0 ) ;
		
		collision = movingCylinderShape.getContinuousCollision( movingCylinderOldPos , movingCylinderPos , cylinderShape , cylinderOldPos , cylinderPos ) ;
		//console.log( collision ) ;
		expect( collision.t ).to.be( 0.4 ) ;
		expect( collision.displacement ).to.eql( { x: 3, y: 0, z: 0 } ) ;
		expect( collision.normal ).to.eql( { x: 1, y: 0, z: 0 } ) ;
		
		movingCylinderOldPos = physic.Vector3D( 5 , 1 , 0 ) ;
		movingCylinderPos = physic.Vector3D( 0 , 1 , 0 ) ;
		collision = movingCylinderShape.getContinuousCollision( movingCylinderOldPos , movingCylinderPos , cylinderShape , cylinderOldPos , cylinderPos ) ;
		//console.log( collision ) ;
		expectCirca( collision.t , 0.4343145750507619 ) ;
		expectCirca( collision.displacement.x , 2.8284271247461907 ) ;
		expectCirca( collision.displacement.y , 0 ) ;
		expectCirca( collision.displacement.z , 0 ) ;
		expectCirca( collision.normal.x , 0.9428090415820634 ) ;
		expectCirca( collision.normal.y , 1/3 ) ;
		expectCirca( collision.normal.z , 0 ) ;
		
		movingCylinderOldPos = physic.Vector3D( 5 , 1 , 1 ) ;
		movingCylinderPos = physic.Vector3D( 0 , 1 , 1 ) ;
		collision = movingCylinderShape.getContinuousCollision( movingCylinderOldPos , movingCylinderPos , cylinderShape , cylinderOldPos , cylinderPos ) ;
		//console.log( collision ) ;
		expectCirca( collision.t , 0.4343145750507619 ) ;
		expectCirca( collision.displacement.x , 2.8284271247461903 ) ;
		expectCirca( collision.displacement.y , 0 ) ;
		expectCirca( collision.displacement.z , 0 ) ;
		expectCirca( collision.normal.x , 0.9428090415820635 ) ;
		expectCirca( collision.normal.y , 1/3 ) ;
		expectCirca( collision.normal.z , 0 ) ;
		
		movingCylinderOldPos = physic.Vector3D( 5 , 1 , 4.01 ) ;
		movingCylinderPos = physic.Vector3D( 0 , 1 , 4.01 ) ;
		collision = movingCylinderShape.getContinuousCollision( movingCylinderOldPos , movingCylinderPos , cylinderShape , cylinderOldPos , cylinderPos ) ;
		//console.log( collision ) ;
		expect( collision ).to.be( null ) ;
	} ) ;
} ) ;
	


describe( "Controllers" , function() {
	
	it( "TopSpeedLimit controller" , function() {
		var topSpeedLimiter = physic.dynamics.TopSpeedLimitController.create( {
			maxAcceleration: 6 ,
			topSpeed: 8 ,
			topSpeedViolationBrake: 10 ,
		} ) ;
		
		var entity = physic.Entity.create( {
			dynamics: [ topSpeedLimiter ]
		} ) ;
		
		// Accel at 0 speed should be 6
		entity.input.speedVector = physic.Vector3D( 8 , 0 , 0 ) ;
		topSpeedLimiter.apply( entity , 0.1 ) ;
		//console.log( entity ) ;
		expectCirca( entity.boundVector.vector.x , 0.6 ) ;
		
		// Accel at half of top-speed should be 3
		entity.boundVector.vector.x = 4 ;
		topSpeedLimiter.apply( entity , 0.1 ) ;
		//console.log( entity ) ;
		expectCirca( entity.boundVector.vector.x , 4.3 ) ;
		
		// Accel at 3/4 of top-speed should be 1.5
		entity.boundVector.vector.x = 6 ;
		topSpeedLimiter.apply( entity , 0.1 ) ;
		//console.log( entity ) ;
		expectCirca( entity.boundVector.vector.x , 6.15 ) ;
		
		// Accel at top-speed should be 0
		entity.boundVector.vector.x = 8 ;
		topSpeedLimiter.apply( entity , 0.1 ) ;
		//console.log( entity ) ;
		expectCirca( entity.boundVector.vector.x , 8 ) ;
		
		// Accel at top-speed violation should be negative: -10
		entity.boundVector.vector.x = 16 ;
		topSpeedLimiter.apply( entity , 0.1 ) ;
		//console.log( entity ) ;
		expectCirca( entity.boundVector.vector.x , 15 ) ;
		
		// Accel when breaking from half of top-speed should be negative: 9
		entity.boundVector.vector.x = -4 ;
		topSpeedLimiter.apply( entity , 0.1 ) ;
		//console.log( entity ) ;
		expectCirca( entity.boundVector.vector.x , -3.1 ) ;
		
		// Accel when breaking from top-speed should be negative: 12
		entity.boundVector.vector.x = -8 ;
		topSpeedLimiter.apply( entity , 0.1 ) ;
		//console.log( entity ) ;
		expectCirca( entity.boundVector.vector.x , -6.8 ) ;
	} ) ;
	
	it( "Motor controller" , function() {
		
		var torqueFn = physic.Fn.create( [
			{ x: 0 , fx: 30 } ,
			{ x: 1000 , fx: 100 } ,
			{ x: 4000 , fx: 200 } ,
			{ x: 6000 , fx: 300 } ,
			{ x: 6500 , fx: 350 } ,
			{ x: 7000 , fx: 300 } ,
			{ x: 9000 , fx: 250 } ,
		] , {
			preserveExtrema: true ,
			atanMeanSlope: true
		} ) ;
		
		torqueFn = torqueFn.fx.bind( torqueFn ) ;
		
		var motor = physic.dynamics.TopSpeedLimitController.create( {
			torqueFn: torqueFn
		} ) ;
		
		var entity = physic.Entity.create( {
			dynamics: [ topSpeedLimiter ]
		} ) ;
		
		// Accel at 0 speed should be 6
		entity.input.speedVector = physic.Vector3D( 8 , 0 , 0 ) ;
		topSpeedLimiter.apply( entity , 0.1 ) ;
		//console.log( entity ) ;
		expectCirca( entity.boundVector.vector.x , 0.6 ) ;
	} ) ;
} ) ;
