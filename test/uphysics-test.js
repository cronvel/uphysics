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

/* global describe, it, before, after */



const physic = require( '../lib/physic.js' ) ;





/* Helper */



function expectCirca( value , circa ) {
	var precision = 0.000000000001 ;
	expect( value ).to.be.within( circa - precision , circa + precision ) ;
}



/* Tests */



describe( "Shape discrete collisions" , () => {

	it( "dot against box" , () => {
		var collision ;
		var dotShape = physic.Shape.createDot() ;
		var dotPos = new physic.Vector3D( 0.5 , 0 , 0 ) ;
		var boxShape = physic.Shape.createBox( 3 , 4 , 5 ) ;
		var boxPos = new physic.Vector3D( 0 , 0 , 0 ) ;

		collision = dotShape.getCollision( dotPos , boxShape , boxPos ) ;
		//console.log( collision ) ;
		expect( collision.t ).to.be( 1 ) ;
		expect( collision.displacement ).to.be.like( { x: 1 , y: 0 , z: 0 } ) ;
		expect( collision.normal ).to.be.like( { x: 1 , y: 0 , z: 0 } ) ;

		dotPos = new physic.Vector3D( 0 , 1 , 0 ) ;
		collision = dotShape.getCollision( dotPos , boxShape , boxPos ) ;
		//console.log( collision ) ;
		expect( collision.t ).to.be( 1 ) ;
		expect( collision.displacement ).to.be.like( { x: 0 , y: 1 , z: 0 } ) ;
		expect( collision.normal ).to.be.like( { x: 0 , y: 1 , z: 0 } ) ;
	} ) ;

	it( "dot against sphere" , () => {
		var collision ;
		var dotShape = physic.Shape.createDot() ;
		var dotPos = new physic.Vector3D( 0.5 , 0 , 0 ) ;
		var sphereShape = physic.Shape.createSphere( 2 ) ;
		var spherePos = new physic.Vector3D( 0 , 0 , 0 ) ;

		collision = dotShape.getCollision( dotPos , sphereShape , spherePos ) ;
		//console.log( collision ) ;
		expect( collision.t ).to.be( 1 ) ;
		expect( collision.displacement ).to.be.like( { x: 1.5 , y: 0 , z: 0 } ) ;
		expect( collision.normal ).to.be.like( { x: 1 , y: 0 , z: 0 } ) ;

		dotPos = new physic.Vector3D( 0 , 1 , 0 ) ;
		collision = dotShape.getCollision( dotPos , sphereShape , spherePos ) ;
		//console.log( collision ) ;
		expect( collision.t ).to.be( 1 ) ;
		expect( collision.displacement ).to.be.like( { x: 0 , y: 1 , z: 0 } ) ;
		expect( collision.normal ).to.be.like( { x: 0 , y: 1 , z: 0 } ) ;

		dotPos = new physic.Vector3D( 1 , 1 , 0 ) ;
		collision = dotShape.getCollision( dotPos , sphereShape , spherePos ) ;
		//console.log( collision ) ;
		expect( collision.t ).to.be( 1 ) ;
		expectCirca( collision.displacement.x , Math.SQRT2 - 1 ) ;
		expectCirca( collision.displacement.y , Math.SQRT2 - 1 ) ;
		expectCirca( collision.displacement.z , 0 ) ;
		expectCirca( collision.normal.x , Math.SQRT1_2 ) ;
		expectCirca( collision.normal.y , Math.SQRT1_2 ) ;
		expectCirca( collision.normal.z , 0 ) ;

		dotPos = new physic.Vector3D( 1 , 1 , 1 ) ;
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

	it( "dot against infinite cylinder" , () => {
		var collision ;
		var dotShape = physic.Shape.createDot() ;
		var dotPos = new physic.Vector3D( 0.5 , 0 , 0 ) ;
		var iCylinderShape = physic.Shape.createInfiniteCylinder( { x: 0 , y: 0 , z: 1 } , 2 ) ;
		var iCylinderPos = new physic.Vector3D( 0 , 0 , 0 ) ;

		collision = dotShape.getCollision( dotPos , iCylinderShape , iCylinderPos ) ;
		//console.log( collision ) ;
		expect( collision.t ).to.be( 1 ) ;
		expect( collision.displacement ).to.be.like( { x: 1.5 , y: 0 , z: 0 } ) ;
		expect( collision.normal ).to.be.like( { x: 1 , y: 0 , z: 0 } ) ;

		dotPos = new physic.Vector3D( 0 , 1 , 0 ) ;
		collision = dotShape.getCollision( dotPos , iCylinderShape , iCylinderPos ) ;
		//console.log( collision ) ;
		expect( collision.t ).to.be( 1 ) ;
		expect( collision.displacement ).to.be.like( { x: 0 , y: 1 , z: 0 } ) ;
		expect( collision.normal ).to.be.like( { x: 0 , y: 1 , z: 0 } ) ;

		dotPos = new physic.Vector3D( 1 , 1 , 0 ) ;
		collision = dotShape.getCollision( dotPos , iCylinderShape , iCylinderPos ) ;
		//console.log( collision ) ;
		expect( collision.t ).to.be( 1 ) ;
		expectCirca( collision.displacement.x , Math.SQRT2 - 1 ) ;
		expectCirca( collision.displacement.y , Math.SQRT2 - 1 ) ;
		expectCirca( collision.displacement.z , 0 ) ;
		expectCirca( collision.normal.x , Math.SQRT1_2 ) ;
		expectCirca( collision.normal.y , Math.SQRT1_2 ) ;
		expectCirca( collision.normal.z , 0 ) ;

		dotPos = new physic.Vector3D( 1 , 1 , 1 ) ;
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

	it( "dot against cylinder" , () => {
		var collision ;
		var dotShape = physic.Shape.createDot() ;
		var dotPos = new physic.Vector3D( 0.5 , 0 , 0 ) ;
		var cylinderShape = physic.Shape.createCylinder( { x: 0 , y: 0 , z: 1 } , 2 , 4 ) ;
		var cylinderPos = new physic.Vector3D( 0 , 0 , 0 ) ;

		collision = dotShape.getCollision( dotPos , cylinderShape , cylinderPos ) ;
		//console.log( collision ) ;
		expect( collision.t ).to.be( 1 ) ;
		expect( collision.displacement ).to.be.like( { x: 1.5 , y: 0 , z: 0 } ) ;
		expect( collision.normal ).to.be.like( { x: 1 , y: 0 , z: 0 } ) ;

		dotPos = new physic.Vector3D( 0 , 1 , 0 ) ;
		collision = dotShape.getCollision( dotPos , cylinderShape , cylinderPos ) ;
		//console.log( collision ) ;
		expect( collision.t ).to.be( 1 ) ;
		expect( collision.displacement ).to.be.like( { x: 0 , y: 1 , z: 0 } ) ;
		expect( collision.normal ).to.be.like( { x: 0 , y: 1 , z: 0 } ) ;

		dotPos = new physic.Vector3D( 1 , 1 , 0 ) ;
		collision = dotShape.getCollision( dotPos , cylinderShape , cylinderPos ) ;
		//console.log( collision ) ;
		expect( collision.t ).to.be( 1 ) ;
		expectCirca( collision.displacement.x , Math.SQRT2 - 1 ) ;
		expectCirca( collision.displacement.y , Math.SQRT2 - 1 ) ;
		expectCirca( collision.displacement.z , 0 ) ;
		expectCirca( collision.normal.x , Math.SQRT1_2 ) ;
		expectCirca( collision.normal.y , Math.SQRT1_2 ) ;
		expectCirca( collision.normal.z , 0 ) ;

		dotPos = new physic.Vector3D( 1 , 1 , 1 ) ;
		collision = dotShape.getCollision( dotPos , cylinderShape , cylinderPos ) ;
		//console.log( collision ) ;
		expect( collision.t ).to.be( 1 ) ;
		expectCirca( collision.displacement.x , Math.SQRT2 - 1 ) ;
		expectCirca( collision.displacement.y , Math.SQRT2 - 1 ) ;
		expectCirca( collision.displacement.z , 0 ) ;
		expectCirca( collision.normal.x , Math.SQRT1_2 ) ;
		expectCirca( collision.normal.y , Math.SQRT1_2 ) ;
		expectCirca( collision.normal.z , 0 ) ;

		dotPos = new physic.Vector3D( 1 , 1 , 2.01 ) ;
		collision = dotShape.getCollision( dotPos , cylinderShape , cylinderPos ) ;
		//console.log( collision ) ;
		expect( collision ).to.be( null ) ;
	} ) ;

	it( "dot against octahedron" ) ;

	it.next( "sphere against box -- bug: each dynamic vertex should only be tested against the relevant surface" , () => {
		var collision ;
		var sphereShape = physic.Shape.createSphere( 1 ) ;
		var spherePos = new physic.Vector3D( 1 , 0 , 0 ) ;
		var boxShape = physic.Shape.createBox( 3 , 4 , 5 ) ;
		var boxPos = new physic.Vector3D( 0 , 0 , 0 ) ;

		/*
		collision = sphereShape.getCollision( spherePos , boxShape , boxPos ) ;
		//console.log( collision ) ;
		expect( collision.t ).to.be( 1 ) ;
		expect( collision.displacement ).to.be.like( { x: 1.5, y: 0, z: 0 } ) ;
		expect( collision.normal ).to.be.like( { x: 1, y: 0, z: 0 } ) ;
		//*/

		spherePos = new physic.Vector3D( 0.1 , 0 , 0 ) ;
		collision = sphereShape.getCollision( spherePos , boxShape , boxPos ) ;
		console.log( collision ) ;
		expect( collision.t ).to.be( 1 ) ;
		expect( collision.displacement ).to.be.like( { x: 0 , y: 2.6 , z: 0 } ) ;
		expect( collision.normal ).to.be.like( { x: 0 , y: 1 , z: 0 } ) ;

		/*
		spherePos = new physic.Vector3D( 1 , 1 , 1 ) ;
		collision = sphereShape.getCollision( spherePos , boxShape , boxPos ) ;
		//console.log( collision ) ;
		expect( collision.t ).to.be( 1 ) ;
		expect( collision.displacement ).to.be.like( { x: 2.5, y: 0, z: 0 } ) ;
		expect( collision.normal ).to.be.like( { x: 1, y: 0, z: 0 } ) ;
		//*/
	} ) ;

	it.next( "sphere against box: edge collision" , () => {
		var collision ;
		var sphereShape = physic.Shape.createSphere( 1 ) ;
		var spherePos = new physic.Vector3D( 0 , 0 , 0 ) ;
		var boxShape = physic.Shape.createBox( 3 , 4 , 5 ) ;
		var boxPos = new physic.Vector3D( 0 , 0 , 0 ) ;

		spherePos = new physic.Vector3D( 0 , 1 , 3 ) ;
		collision = sphereShape.getCollision( spherePos , boxShape , boxPos ) ;
		//console.log( collision ) ;
		//expect( collision.t ).to.be( 0.7 ) ;
		//expect( collision.displacement ).to.be.like( { x: 1.5, y: 0, z: 0 } ) ;
		expect( collision.normal ).to.be.like( { x: Math.SQRT1_2 , y: 0 , z: Math.SQRT1_2 } ) ;
	} ) ;

	it( "sphere against sphere" , () => {
		var collision ;
		var movingSphereShape = physic.Shape.createSphere( 1 ) ;
		var movingSpherePos = new physic.Vector3D( 1 , 0 , 0 ) ;
		var sphereShape = physic.Shape.createSphere( 2 ) ;
		var spherePos = new physic.Vector3D( 0 , 0 , 0 ) ;

		collision = movingSphereShape.getCollision( movingSpherePos , sphereShape , spherePos ) ;
		//console.log( collision ) ;
		expect( collision.t ).to.be( 1 ) ;
		expect( collision.displacement ).to.be.like( { x: 2 , y: 0 , z: 0 } ) ;
		expect( collision.normal ).to.be.like( { x: 1 , y: 0 , z: 0 } ) ;

		movingSpherePos = new physic.Vector3D( 1 , 1 , 0 ) ;
		collision = movingSphereShape.getCollision( movingSpherePos , sphereShape , spherePos ) ;
		//console.log( collision ) ;
		expect( collision.t ).to.be( 1 ) ;
		expectCirca( collision.displacement.x , 1.1213203435596424 ) ;
		expectCirca( collision.displacement.y , 1.1213203435596424 ) ;
		expectCirca( collision.displacement.z , 0 ) ;
		expectCirca( collision.normal.x , Math.SQRT1_2 ) ;
		expectCirca( collision.normal.y , Math.SQRT1_2 ) ;
		expectCirca( collision.normal.z , 0 ) ;

		movingSpherePos = new physic.Vector3D( 1 , 1 , 1 ) ;
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



describe( "Shape continuous collisions" , () => {

	it( "dot against plane" , () => {
		var collision ;
		var dotShape = physic.Shape.createDot() ;
		var dotOldPos = new physic.Vector3D( 0 , 0 , 4 ) ;
		var dotPos = new physic.Vector3D( 0 , 0 , -1 ) ;
		var planeShape = physic.Shape.createPlane( new physic.Vector3D( 0 , 0 , 1 ) ) ;
		var planeOldPos = new physic.Vector3D( 0 , 0 , 0 ) ;
		var planePos = new physic.Vector3D( 0 , 0 , 0 ) ;

		collision = dotShape.getContinuousCollision( dotOldPos , dotPos , planeShape , planeOldPos , planePos ) ;
		//console.log( collision ) ;
		expect( collision.t ).to.be( 0.8 ) ;
		expect( collision.displacement ).to.be.like( { x: 0 , y: 0 , z: 1 } ) ;
		expect( collision.normal ).to.be.like( { x: 0 , y: 0 , z: 1 } ) ;
	} ) ;

	it( "dot against plane: tangential move" , () => {
		var collision ;
		var dotShape = physic.Shape.createDot() ;
		var dotOldPos = new physic.Vector3D( 5 , 0 , 0 ) ;
		var dotPos = new physic.Vector3D( 0 , 0 , 0 ) ;
		var planeShape = physic.Shape.createPlane( new physic.Vector3D( 0 , 0 , 1 ) ) ;
		var planeOldPos = new physic.Vector3D( 0 , 0 , 0 ) ;
		var planePos = new physic.Vector3D( 0 , 0 , 0 ) ;

		collision = dotShape.getContinuousCollision( dotOldPos , dotPos , planeShape , planeOldPos , planePos ) ;
		expect( collision ).to.be( null ) ;
	} ) ;

	it( "dot against box" , () => {
		var collision ;
		var dotShape = physic.Shape.createDot() ;
		var dotOldPos = new physic.Vector3D( 5 , 0 , 0 ) ;
		var dotPos = new physic.Vector3D( 0 , 0 , 0 ) ;
		var boxShape = physic.Shape.createBox( 3 , 4 , 5 ) ;
		var boxOldPos = new physic.Vector3D( 0 , 0 , 0 ) ;
		var boxPos = new physic.Vector3D( 0 , 0 , 0 ) ;

		//*
		collision = dotShape.getContinuousCollision( dotOldPos , dotPos , boxShape , boxOldPos , boxPos ) ;
		//console.log( collision ) ;
		expect( collision.t ).to.be( 0.7 ) ;
		expect( collision.displacement ).to.be.like( { x: 1.5 , y: 0 , z: 0 } ) ;
		expect( collision.normal ).to.be.like( { x: 1 , y: 0 , z: 0 } ) ;

		collision = boxShape.getContinuousCollision( boxOldPos , boxPos , dotShape , dotOldPos , dotPos ) ;
		//console.log( collision ) ;
		expect( collision.t ).to.be( 0.7 ) ;
		expect( collision.displacement ).to.be.like( { x: -1.5 , y: 0 , z: 0 } ) ;
		expect( collision.normal ).to.be.like( { x: -1 , y: 0 , z: 0 } ) ;
		//*/

		dotOldPos = new physic.Vector3D( 5 , -4 , 0 ) ;
		dotPos = new physic.Vector3D( 0 , 1 , 0 ) ;
		collision = dotShape.getContinuousCollision( dotOldPos , dotPos , boxShape , boxOldPos , boxPos ) ;
		//console.log( collision ) ;
		expect( collision.t ).to.be( 0.7 ) ;
		// displacement y:-1.5 because, so contact is made at y:-0.5
		expect( collision.displacement ).to.be.like( { x: 1.5 , y: -1.5 , z: 0 } ) ;
		expect( collision.normal ).to.be.like( { x: 1 , y: 0 , z: 0 } ) ;
	} ) ;

	it( "dot against sphere" , () => {
		var collision ;
		var dotShape = physic.Shape.createDot() ;
		var dotOldPos = new physic.Vector3D( 5 , 0 , 0 ) ;
		var dotPos = new physic.Vector3D( 0 , 0 , 0 ) ;
		var sphereShape = physic.Shape.createSphere( 2 ) ;
		var sphereOldPos = new physic.Vector3D( 0 , 0 , 0 ) ;
		var spherePos = new physic.Vector3D( 0 , 0 , 0 ) ;

		collision = dotShape.getContinuousCollision( dotOldPos , dotPos , sphereShape , sphereOldPos , spherePos ) ;
		//console.log( collision ) ;
		expect( collision.t ).to.be( 0.6 ) ;
		expect( collision.displacement ).to.be.like( { x: 2 , y: 0 , z: 0 } ) ;
		expect( collision.normal ).to.be.like( { x: 1 , y: 0 , z: 0 } ) ;

		collision = sphereShape.getContinuousCollision( sphereOldPos , spherePos , dotShape , dotOldPos , dotPos ) ;
		//console.log( collision ) ;
		expect( collision.t ).to.be( 0.6 ) ;
		expect( collision.displacement ).to.be.like( { x: -2 , y: 0 , z: 0 } ) ;
		expect( collision.normal ).to.be.like( { x: -1 , y: 0 , z: 0 } ) ;

		dotOldPos = new physic.Vector3D( 5 , 1 , 0 ) ;
		dotPos = new physic.Vector3D( 0 , 1 , 0 ) ;
		collision = dotShape.getContinuousCollision( dotOldPos , dotPos , sphereShape , sphereOldPos , spherePos ) ;
		//console.log( collision ) ;
		expect( collision.t ).to.be( 0.6535898384862244 ) ;
		expectCirca( collision.displacement.x , Math.sqrt( 3 ) ) ;
		expectCirca( collision.displacement.y , 0 ) ;
		expectCirca( collision.displacement.z , 0 ) ;
		expectCirca( collision.normal.x , Math.sqrt( 3 ) / 2 ) ;
		expectCirca( collision.normal.y , 0.5 ) ;
		expectCirca( collision.normal.z , 0 ) ;

		dotOldPos = new physic.Vector3D( 5 , 1 , 1 ) ;
		dotPos = new physic.Vector3D( 0 , 1 , 1 ) ;
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

	it( "dot against infinite cylinder" , () => {
		var collision ;
		var dotShape = physic.Shape.createDot() ;
		var dotOldPos = new physic.Vector3D( 5 , 0 , 0 ) ;
		var dotPos = new physic.Vector3D( 0 , 0 , 0 ) ;
		var iCylinderShape = physic.Shape.createInfiniteCylinder( { x: 0 , y: 0 , z: 1 } , 2 ) ;
		var iCylinderOldPos = new physic.Vector3D( 0 , 0 , 0 ) ;
		var iCylinderPos = new physic.Vector3D( 0 , 0 , 0 ) ;

		collision = dotShape.getContinuousCollision( dotOldPos , dotPos , iCylinderShape , iCylinderOldPos , iCylinderPos ) ;
		//console.log( collision ) ;
		expect( collision.t ).to.be( 0.6 ) ;
		expect( collision.displacement ).to.be.like( { x: 2 , y: 0 , z: 0 } ) ;
		expect( collision.normal ).to.be.like( { x: 1 , y: 0 , z: 0 } ) ;

		collision = iCylinderShape.getContinuousCollision( iCylinderOldPos , iCylinderPos , dotShape , dotOldPos , dotPos ) ;
		//console.log( collision ) ;
		expect( collision.t ).to.be( 0.6 ) ;
		expect( collision.displacement ).to.be.like( { x: -2 , y: 0 , z: 0 } ) ;
		expect( collision.normal ).to.be.like( { x: -1 , y: 0 , z: 0 } ) ;

		dotOldPos = new physic.Vector3D( 5 , 1 , 0 ) ;
		dotPos = new physic.Vector3D( 0 , 1 , 0 ) ;
		collision = dotShape.getContinuousCollision( dotOldPos , dotPos , iCylinderShape , iCylinderOldPos , iCylinderPos ) ;
		//console.log( collision ) ;
		expect( collision.t ).to.be( 0.6535898384862244 ) ;
		expectCirca( collision.displacement.x , Math.sqrt( 3 ) ) ;
		expectCirca( collision.displacement.y , 0 ) ;
		expectCirca( collision.displacement.z , 0 ) ;
		expectCirca( collision.normal.x , Math.sqrt( 3 ) / 2 ) ;
		expectCirca( collision.normal.y , 0.5 ) ;
		expectCirca( collision.normal.z , 0 ) ;

		dotOldPos = new physic.Vector3D( 5 , 1 , 1 ) ;
		dotPos = new physic.Vector3D( 0 , 1 , 1 ) ;
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

	it( "dot against cylinder" , () => {
		var collision ;
		var dotShape = physic.Shape.createDot() ;
		var dotOldPos = new physic.Vector3D( 5 , 0 , 0 ) ;
		var dotPos = new physic.Vector3D( 0 , 0 , 0 ) ;
		var cylinderShape = physic.Shape.createCylinder( { x: 0 , y: 0 , z: 1 } , 2 , 4 ) ;
		var cylinderOldPos = new physic.Vector3D( 0 , 0 , 0 ) ;
		var cylinderPos = new physic.Vector3D( 0 , 0 , 0 ) ;

		collision = dotShape.getContinuousCollision( dotOldPos , dotPos , cylinderShape , cylinderOldPos , cylinderPos ) ;
		//console.log( collision ) ;
		expect( collision.t ).to.be( 0.6 ) ;
		expect( collision.displacement ).to.be.like( { x: 2 , y: 0 , z: 0 } ) ;
		expect( collision.normal ).to.be.like( { x: 1 , y: 0 , z: 0 } ) ;

		collision = cylinderShape.getContinuousCollision( cylinderOldPos , cylinderPos , dotShape , dotOldPos , dotPos ) ;
		//console.log( collision ) ;
		expect( collision.t ).to.be( 0.6 ) ;
		expect( collision.displacement ).to.be.like( { x: -2 , y: 0 , z: 0 } ) ;
		expect( collision.normal ).to.be.like( { x: -1 , y: 0 , z: 0 } ) ;

		dotOldPos = new physic.Vector3D( 5 , 1 , 0 ) ;
		dotPos = new physic.Vector3D( 0 , 1 , 0 ) ;
		collision = dotShape.getContinuousCollision( dotOldPos , dotPos , cylinderShape , cylinderOldPos , cylinderPos ) ;
		//console.log( collision ) ;
		expect( collision.t ).to.be( 0.6535898384862244 ) ;
		expectCirca( collision.displacement.x , Math.sqrt( 3 ) ) ;
		expectCirca( collision.displacement.y , 0 ) ;
		expectCirca( collision.displacement.z , 0 ) ;
		expectCirca( collision.normal.x , Math.sqrt( 3 ) / 2 ) ;
		expectCirca( collision.normal.y , 0.5 ) ;
		expectCirca( collision.normal.z , 0 ) ;

		dotOldPos = new physic.Vector3D( 5 , 1 , 1 ) ;
		dotPos = new physic.Vector3D( 0 , 1 , 1 ) ;
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
		dotOldPos = new physic.Vector3D( 5 , 1 , 3 ) ;
		dotPos = new physic.Vector3D( 0 , 1 , 3 ) ;
		collision = dotShape.getContinuousCollision( dotOldPos , dotPos , cylinderShape , cylinderOldPos , cylinderPos ) ;
		//console.log( collision ) ;
		expect( collision ).to.be( null ) ;

		dotOldPos = new physic.Vector3D( 0 , 0 , 5 ) ;
		dotPos = new physic.Vector3D( 0 , 0 , 0 ) ;
		collision = dotShape.getContinuousCollision( dotOldPos , dotPos , cylinderShape , cylinderOldPos , cylinderPos ) ;
		//console.log( collision ) ;
		expect( collision.t ).to.be( 0.6 ) ;
		expect( collision.displacement ).to.be.like( { x: 0 , y: 0 , z: 2 } ) ;
		expect( collision.normal ).to.be.like( { x: 0 , y: 0 , z: 1 } ) ;
	} ) ;

	it( "dot against octahedron" ) ;

	it( "sphere against box" , () => {
		var collision ;
		var sphereShape = physic.Shape.createSphere( 1 ) ;
		var sphereOldPos = new physic.Vector3D( 5 , 0 , 0 ) ;
		var spherePos = new physic.Vector3D( 0 , 0 , 0 ) ;
		var boxShape = physic.Shape.createBox( 3 , 4 , 5 ) ;
		var boxOldPos = new physic.Vector3D( 0 , 0 , 0 ) ;
		var boxPos = new physic.Vector3D( 0 , 0 , 0 ) ;

		collision = sphereShape.getContinuousCollision( sphereOldPos , spherePos , boxShape , boxOldPos , boxPos ) ;
		//console.log( collision ) ;
		expect( collision.t ).to.be( 0.5 ) ;
		expect( collision.displacement ).to.be.like( { x: 2.5 , y: 0 , z: 0 } ) ;
		expect( collision.normal ).to.be.like( { x: 1 , y: 0 , z: 0 } ) ;

		sphereOldPos = new physic.Vector3D( 5 , 1 , 0 ) ;
		spherePos = new physic.Vector3D( 0 , 1 , 0 ) ;
		collision = sphereShape.getContinuousCollision( sphereOldPos , spherePos , boxShape , boxOldPos , boxPos ) ;
		//console.log( collision ) ;
		expect( collision.t ).to.be( 0.5 ) ;
		expect( collision.displacement ).to.be.like( { x: 2.5 , y: 0 , z: 0 } ) ;
		expect( collision.normal ).to.be.like( { x: 1 , y: 0 , z: 0 } ) ;

		sphereOldPos = new physic.Vector3D( 5 , 1 , 1 ) ;
		spherePos = new physic.Vector3D( 0 , 1 , 1 ) ;
		collision = sphereShape.getContinuousCollision( sphereOldPos , spherePos , boxShape , boxOldPos , boxPos ) ;
		//console.log( collision ) ;
		expect( collision.t ).to.be( 0.5 ) ;
		expect( collision.displacement ).to.be.like( { x: 2.5 , y: 0 , z: 0 } ) ;
		expect( collision.normal ).to.be.like( { x: 1 , y: 0 , z: 0 } ) ;
	} ) ;

	it.next( "sphere against box: edge collision" , () => {
		var collision ;
		var sphereShape = physic.Shape.createSphere( 1 ) ;
		var sphereOldPos = new physic.Vector3D( 5 , 0 , 0 ) ;
		var spherePos = new physic.Vector3D( 0 , 0 , 0 ) ;
		var boxShape = physic.Shape.createBox( 3 , 4 , 5 ) ;
		var boxOldPos = new physic.Vector3D( 0 , 0 , 0 ) ;
		var boxPos = new physic.Vector3D( 0 , 0 , 0 ) ;

		sphereOldPos = new physic.Vector3D( 5 , 1 , 3 ) ;
		spherePos = new physic.Vector3D( 0 , 1 , 3 ) ;
		collision = sphereShape.getContinuousCollision( sphereOldPos , spherePos , boxShape , boxOldPos , boxPos ) ;
		//console.log( collision ) ;
		//expect( collision.t ).to.be( 0.7 ) ;
		//expect( collision.displacement ).to.be.like( { x: 1.5, y: 0, z: 0 } ) ;
		expect( collision.normal ).to.be.like( { x: Math.SQRT1_2 , y: 0 , z: Math.SQRT1_2 } ) ;
	} ) ;

	it( "sphere against sphere" , () => {
		var collision ;
		var movingSphereShape = physic.Shape.createSphere( 1 ) ;
		var movingSphereOldPos = new physic.Vector3D( 5 , 0 , 0 ) ;
		var movingSpherePos = new physic.Vector3D( 0 , 0 , 0 ) ;
		var sphereShape = physic.Shape.createSphere( 2 ) ;
		var sphereOldPos = new physic.Vector3D( 0 , 0 , 0 ) ;
		var spherePos = new physic.Vector3D( 0 , 0 , 0 ) ;

		collision = movingSphereShape.getContinuousCollision( movingSphereOldPos , movingSpherePos , sphereShape , sphereOldPos , spherePos ) ;
		//console.log( collision ) ;
		expect( collision.t ).to.be( 0.4 ) ;
		expect( collision.displacement ).to.be.like( { x: 3 , y: 0 , z: 0 } ) ;
		expect( collision.normal ).to.be.like( { x: 1 , y: 0 , z: 0 } ) ;

		movingSphereOldPos = new physic.Vector3D( 5 , 1 , 0 ) ;
		movingSpherePos = new physic.Vector3D( 0 , 1 , 0 ) ;
		collision = movingSphereShape.getContinuousCollision( movingSphereOldPos , movingSpherePos , sphereShape , sphereOldPos , spherePos ) ;
		//console.log( collision ) ;
		expect( collision.t ).to.be( 0.4343145750507619 ) ;
		expectCirca( collision.displacement.x , 2.8284271247461907 ) ;
		expectCirca( collision.displacement.y , 0 ) ;
		expectCirca( collision.displacement.z , 0 ) ;
		expectCirca( collision.normal.x , 0.9428090415820634 ) ;
		expectCirca( collision.normal.y , 1 / 3 ) ;
		expectCirca( collision.normal.z , 0 ) ;

		movingSphereOldPos = new physic.Vector3D( 5 , 1 , 1 ) ;
		movingSpherePos = new physic.Vector3D( 0 , 1 , 1 ) ;
		collision = movingSphereShape.getContinuousCollision( movingSphereOldPos , movingSpherePos , sphereShape , sphereOldPos , spherePos ) ;
		//console.log( collision ) ;
		expect( collision.t ).to.be( 0.4708497377870816 ) ;
		expectCirca( collision.displacement.x , 2.645751311064592 ) ;
		expectCirca( collision.displacement.y , 0 ) ;
		expectCirca( collision.displacement.z , 0 ) ;
		expectCirca( collision.normal.x , 0.881917103688197 ) ;
		expectCirca( collision.normal.y , 1 / 3 ) ;
		expectCirca( collision.normal.z , 1 / 3 ) ;
	} ) ;

	it( "sphere against cylinder" , () => {
		var collision ;
		var sphereShape = physic.Shape.createSphere( 1 ) ;
		var sphereOldPos = new physic.Vector3D( 5 , 0 , 0 ) ;
		var spherePos = new physic.Vector3D( 0 , 0 , 0 ) ;
		var cylinderShape = physic.Shape.createCylinder( { x: 0 , y: 0 , z: 1 } , 2 , 4 ) ;
		var cylinderOldPos = new physic.Vector3D( 0 , 0 , 0 ) ;
		var cylinderPos = new physic.Vector3D( 0 , 0 , 0 ) ;

		collision = sphereShape.getContinuousCollision( sphereOldPos , spherePos , cylinderShape , cylinderOldPos , cylinderPos ) ;
		//console.log( collision ) ;
		expect( collision.t ).to.be( 0.4 ) ;
		expect( collision.displacement ).to.be.like( { x: 3 , y: 0 , z: 0 } ) ;
		expect( collision.normal ).to.be.like( { x: 1 , y: 0 , z: 0 } ) ;

		sphereOldPos = new physic.Vector3D( 5 , 1 , 0 ) ;
		spherePos = new physic.Vector3D( 0 , 1 , 0 ) ;
		collision = sphereShape.getContinuousCollision( sphereOldPos , spherePos , cylinderShape , cylinderOldPos , cylinderPos ) ;
		//console.log( collision ) ;
		expectCirca( collision.t , 0.4343145750507619 ) ;
		expectCirca( collision.displacement.x , 2.8284271247461907 ) ;
		expectCirca( collision.displacement.y , 0 ) ;
		expectCirca( collision.displacement.z , 0 ) ;
		expectCirca( collision.normal.x , 0.9428090415820634 ) ;
		expectCirca( collision.normal.y , 1 / 3 ) ;
		expectCirca( collision.normal.z , 0 ) ;

		sphereOldPos = new physic.Vector3D( 5 , 1 , 1 ) ;
		spherePos = new physic.Vector3D( 0 , 1 , 1 ) ;
		collision = sphereShape.getContinuousCollision( sphereOldPos , spherePos , cylinderShape , cylinderOldPos , cylinderPos ) ;
		//console.log( collision ) ;
		expectCirca( collision.t , 0.4343145750507619 ) ;
		expectCirca( collision.displacement.x , 2.8284271247461903 ) ;
		expectCirca( collision.displacement.y , 0 ) ;
		expectCirca( collision.displacement.z , 0 ) ;
		expectCirca( collision.normal.x , 0.9428090415820635 ) ;
		expectCirca( collision.normal.y , 1 / 3 ) ;
		expectCirca( collision.normal.z , 0 ) ;
	} ) ;

	it( "cylinder against cylinder" , () => {
		var collision ;
		var movingCylinderShape = physic.Shape.createCylinder( { x: 0 , y: 0 , z: 1 } , 1 , 4 ) ;
		var movingCylinderOldPos = new physic.Vector3D( 5 , 0 , 0 ) ;
		var movingCylinderPos = new physic.Vector3D( 0 , 0 , 0 ) ;
		var cylinderShape = physic.Shape.createCylinder( { x: 0 , y: 0 , z: 1 } , 2 , 4 ) ;
		var cylinderOldPos = new physic.Vector3D( 0 , 0 , 0 ) ;
		var cylinderPos = new physic.Vector3D( 0 , 0 , 0 ) ;

		collision = movingCylinderShape.getContinuousCollision( movingCylinderOldPos , movingCylinderPos , cylinderShape , cylinderOldPos , cylinderPos ) ;
		//console.log( collision ) ;
		expect( collision.t ).to.be( 0.4 ) ;
		expect( collision.displacement ).to.be.like( { x: 3 , y: 0 , z: 0 } ) ;
		expect( collision.normal ).to.be.like( { x: 1 , y: 0 , z: 0 } ) ;

		movingCylinderOldPos = new physic.Vector3D( 5 , 1 , 0 ) ;
		movingCylinderPos = new physic.Vector3D( 0 , 1 , 0 ) ;
		collision = movingCylinderShape.getContinuousCollision( movingCylinderOldPos , movingCylinderPos , cylinderShape , cylinderOldPos , cylinderPos ) ;
		//console.log( collision ) ;
		expectCirca( collision.t , 0.4343145750507619 ) ;
		expectCirca( collision.displacement.x , 2.8284271247461907 ) ;
		expectCirca( collision.displacement.y , 0 ) ;
		expectCirca( collision.displacement.z , 0 ) ;
		expectCirca( collision.normal.x , 0.9428090415820634 ) ;
		expectCirca( collision.normal.y , 1 / 3 ) ;
		expectCirca( collision.normal.z , 0 ) ;

		movingCylinderOldPos = new physic.Vector3D( 5 , 1 , 1 ) ;
		movingCylinderPos = new physic.Vector3D( 0 , 1 , 1 ) ;
		collision = movingCylinderShape.getContinuousCollision( movingCylinderOldPos , movingCylinderPos , cylinderShape , cylinderOldPos , cylinderPos ) ;
		//console.log( collision ) ;
		expectCirca( collision.t , 0.4343145750507619 ) ;
		expectCirca( collision.displacement.x , 2.8284271247461903 ) ;
		expectCirca( collision.displacement.y , 0 ) ;
		expectCirca( collision.displacement.z , 0 ) ;
		expectCirca( collision.normal.x , 0.9428090415820635 ) ;
		expectCirca( collision.normal.y , 1 / 3 ) ;
		expectCirca( collision.normal.z , 0 ) ;

		movingCylinderOldPos = new physic.Vector3D( 5 , 1 , 4.01 ) ;
		movingCylinderPos = new physic.Vector3D( 0 , 1 , 4.01 ) ;
		collision = movingCylinderShape.getContinuousCollision( movingCylinderOldPos , movingCylinderPos , cylinderShape , cylinderOldPos , cylinderPos ) ;
		//console.log( collision ) ;
		expect( collision ).to.be( null ) ;
	} ) ;
} ) ;



describe( "Controllers" , () => {

	it( "TopSpeedLimit controller" , () => {
		var topSpeedLimiter = new physic.dynamics.TopSpeedLimitController( {
			topSpeedViolationBrake: 10
		} ) ;

		var entity = new physic.Entity( {
			material: new physic.Material() , // Mandatory
			shape: physic.Shape.createDot() , // Mandatory
			data: {
				topSpeed: 8 ,
				baseAcceleration: 6
			} ,
			dynamics: [ topSpeedLimiter ]
		} ) ;

		// Accel at 0 speed should be 6
		entity.input.speedVector = new physic.Vector3D( 8 , 0 , 0 ) ;
		entity.forces.setNull() ;
		entity.brakingForces = 0 ;
		topSpeedLimiter.apply( entity , 0.1 ) ;
		//console.log( entity ) ;
		expectCirca( entity.forces.x , 6 ) ;

		// Accel at half of top-speed should be 3
		entity.boundVector.vector.x = 4 ;
		entity.forces.setNull() ;
		entity.brakingForces = 0 ;
		topSpeedLimiter.apply( entity , 0.1 ) ;
		//console.log( entity ) ;
		expectCirca( entity.forces.x , 3 ) ;

		// Accel at 3/4 of top-speed should be 1.5
		entity.boundVector.vector.x = 6 ;
		entity.forces.setNull() ;
		entity.brakingForces = 0 ;
		topSpeedLimiter.apply( entity , 0.1 ) ;
		//console.log( entity ) ;
		expectCirca( entity.forces.x , 1.5 ) ;

		// Accel at top-speed should be 0
		entity.boundVector.vector.x = 8 ;
		entity.forces.setNull() ;
		entity.brakingForces = 0 ;
		topSpeedLimiter.apply( entity , 0.1 ) ;
		//console.log( entity ) ;
		expectCirca( entity.forces.x , 0 ) ;

		// Accel at top-speed violation should be negative: -10
		entity.boundVector.vector.x = 16 ;
		entity.forces.setNull() ;
		entity.brakingForces = 0 ;
		topSpeedLimiter.apply( entity , 0.1 ) ;
		//console.log( entity ) ;
		expectCirca( entity.forces.x , 0 ) ;
		expectCirca( entity.brakingForces , 10 ) ;

		// Accel when breaking from half of top-speed should be negative: 9
		entity.boundVector.vector.x = -4 ;
		entity.forces.setNull() ;
		entity.brakingForces = 0 ;
		topSpeedLimiter.apply( entity , 0.1 ) ;
		//console.log( entity ) ;
		expectCirca( entity.forces.x , 9 ) ;

		// Accel when breaking from top-speed should be negative: 12
		entity.boundVector.vector.x = -8 ;
		entity.forces.setNull() ;
		entity.brakingForces = 0 ;
		topSpeedLimiter.apply( entity , 0.1 ) ;
		//console.log( entity ) ;
		expectCirca( entity.forces.x , 12 ) ;
	} ) ;

	it( "Motor controller (wip)" , () => {

		var torqueFn = new physic.Fn( [
			{ x: 0 , fx: 30 } ,
			{ x: 1000 , fx: 100 } ,
			{ x: 4000 , fx: 200 } ,
			{ x: 6000 , fx: 300 } ,
			{ x: 6500 , fx: 350 } ,
			{ x: 7000 , fx: 300 } ,
			{ x: 8000 , fx: 250 }
		] , {
			preserveExtrema: true ,
			atanMeanSlope: true
		} ) ;

		torqueFn = torqueFn.fx.bind( torqueFn ) ;

		var motor = new physic.dynamics.MotorController( {
			torqueFn: torqueFn ,
			motorInertia: 1
		} ) ;

		var entity = new physic.Entity( {
			material: new physic.Material() , // Mandatory
			shape: physic.Shape.createDot() , // Mandatory
			dynamics: [ motor ]
		} ) ;

		entity.input.throttle = 1 ;
		entity.data.rpm = 6000 ;
		motor.apply( entity , 0.1 ) ;
		//console.log( entity ) ;
		expectCirca( entity.data.rpm , 6000 + 30 * 30 / Math.PI ) ;

		entity.input.throttle = 0.5 ;
		entity.data.rpm = 6000 ;
		motor.apply( entity , 0.1 ) ;
		//console.log( entity ) ;
		expectCirca( entity.data.rpm , 6000 + 15 * 30 / Math.PI ) ;

		entity.input.throttle = 1 ;
		entity.data.rpm = 4000 ;
		motor.apply( entity , 0.1 ) ;
		//console.log( entity ) ;
		expectCirca( entity.data.rpm , 4000 + 20 * 30 / Math.PI ) ;

		entity.input.throttle = -1 ;
		entity.data.rpm = 4000 ;
		motor.apply( entity , 0.1 ) ;
		//console.log( entity ) ;
		expectCirca( entity.data.rpm , 4000 - 40 * 30 / Math.PI ) ;
	} ) ;
} ) ;


