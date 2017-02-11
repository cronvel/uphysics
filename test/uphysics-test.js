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



describe( "Shape continuous collisions" , function() {
	
	it( "dot against box" , function() {
		var collision ;
		var dotShape = physic.Shape.Dot.create() ;
		var dotOldPos = physic.Vector3D( 5 , 0 , 0 ) ;
		var dotPos = physic.Vector3D( 0 , 0 , 0 ) ;
		var boxShape = physic.Shape.Box.create( 3 , 4 , 5 ) ;
		var boxOldPos = physic.Vector3D( 0 , 0 , 0 ) ;
		var boxPos = physic.Vector3D( 0 , 0 , 0 ) ;
		
		/*
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
		var dotShape = physic.Shape.Dot.create() ;
		var dotOldPos = physic.Vector3D( 5 , 0 , 0 ) ;
		var dotPos = physic.Vector3D( 0 , 0 , 0 ) ;
		var sphereShape = physic.Shape.Sphere.create( 2 ) ;
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
		var dotShape = physic.Shape.Dot.create() ;
		var dotOldPos = physic.Vector3D( 5 , 0 , 0 ) ;
		var dotPos = physic.Vector3D( 0 , 0 , 0 ) ;
		var iCylinderShape = physic.Shape.InfiniteCylinder.create( { x: 0, y: 0, z: 1 } , 2 ) ;
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
	
	it( "dot against cylinder" ) ;
	it( "dot against octahedron" ) ;
	it( "sphere against box" ) ;
	it( "sphere against sphere" ) ;
	it( "sphere against cylinder" ) ;
	it( "cylinder against cylinder" ) ;
} ) ;
	


describe( "Shape discrete collisions" , function() {
	it( "dot against box" ) ;
	it( "dot against sphere" ) ;
	it( "dot against infinite cylinder" ) ;
	it( "dot against cylinder" ) ;
	it( "dot against octahedron" ) ;
	it( "sphere against box" ) ;
	it( "sphere against sphere" ) ;
	it( "sphere against cylinder" ) ;
	it( "cylinder against cylinder" ) ;
} ) ;

