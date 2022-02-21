
var physic = require( '../lib/physic.js' ) ;


var cubePos = physic.Vector3D( 0 , 0 , 0 ) ;
var boxPos = physic.Vector3D( 0 , 0 , 0 ) ;
var dotPos = physic.Vector3D( 0 , 0 , 0 ) ;
var spherePos = physic.Vector3D( 0 , 0 , 0 ) ;
var sphere2Pos = physic.Vector3D( 0 , 0 , 0 ) ;
var iCylinderPos = physic.Vector3D( 0 , 0 , 0 ) ;
var iCylinder2Pos = physic.Vector3D( 0 , 0 , 0 ) ;
var cylinderPos = physic.Vector3D( 0 , 0 , 0 ) ;
var cylinder2Pos = physic.Vector3D( 0 , 0 , 0 ) ;
var octahedronPos = physic.Vector3D( 0 , 0 , 0 ) ;

var cubeOldPos = physic.Vector3D( 5 , 0 , 0 ) ;
var boxOldPos = physic.Vector3D( 5 , 0 , 0 ) ;
var dotOldPos = physic.Vector3D( 5 , 0 , 0 ) ;
var sphereOldPos = physic.Vector3D( 5 , 0 , 0 ) ;
var sphere2OldPos = physic.Vector3D( 5 , 0 , 0 ) ;
var cylinderOldPos = physic.Vector3D( 5 , 0 , 0 ) ;
var cylinder2OldPos = physic.Vector3D( 5 , 0 , 0 ) ;
var iCylinderOldPos = physic.Vector3D( 5 , 0 , 0 ) ;
var iCylinder2OldPos = physic.Vector3D( 5 , 0 , 0 ) ;
var octahedronOldPos = physic.Vector3D( 5 , 0 , 0 ) ;

var cubeShape = physic.Shape.Box.create( 2 , 2 , 2 ) ;
var boxShape = physic.Shape.Box.create( 3 , 4 , 5 ) ;
var dotShape = physic.Shape.Dot.create() ;
var sphereShape = physic.Shape.Sphere.create( 2 ) ;
var sphere2Shape = physic.Shape.Sphere.create( 1 ) ;
var cylinderShape = physic.Shape.Cylinder.create( { x: 0, y: 0, z: 1 } , 1 , 2 ) ;
var cylinder2Shape = physic.Shape.Cylinder.create( { x: 0, y: 0, z: 1 } , 1 , 2 ) ;
var iCylinderShape = physic.Shape.InfiniteCylinder.create( { x: 0, y: 0, z: 1 } , 1.5 ) ;
var iCylinder2Shape = physic.Shape.InfiniteCylinder.create( { x: 0, y: 0, z: 1 } , 1.5 ) ;
var octahedronShape = physic.Shape.Octahedron.create( 2 ) ;


//*
sphereOldPos.set( 2 , 1 , 0 ) ;
console.log() ;
console.log( sphereShape.getContinuousCollision( sphereOldPos , spherePos , sphere2Shape , sphere2OldPos , sphere2Pos ) ) ;
console.log() ;
console.log( sphere2Shape.getContinuousCollision( sphere2OldPos , sphere2Pos , sphereShape , sphereOldPos , spherePos ) ) ;
//*/


/*
sphereOldPos.set( 8 , 8 , 0 ) ;
//sphereOldPos.set( 6 , 0 , 0 ) ;
spherePos.set( 0 , 0 , 0 ) ;
cubeOldPos.set( 0 , 0 , 0 ) ;
cubePos.set( 0 , 0 , 0 ) ;
console.log() ;
console.log( sphereShape.getContinuousCollision( sphereOldPos , spherePos , cubeShape , cubeOldPos , cubePos ) ) ;
console.log() ;
console.log( cubeShape.getContinuousCollision( cubeOldPos , cubePos , sphereShape , sphereOldPos , spherePos ) ) ;
//*/


/*
dotOldPos.set( 4 , 0 , 0.5 ) ;
//dotOldPos.set( 6 , 0 , 0 ) ;
dotPos.set( 0 , 0.4 , 0.5 ) ;
octahedronOldPos.set( 0 , 0 , 0 ) ;
octahedronPos.set( 0 , 0 , 0 ) ;
console.log() ;
console.log( dotShape.getContinuousCollision( dotOldPos , dotPos , octahedronShape , octahedronOldPos , octahedronPos ) ) ;
console.log() ;
console.log( octahedronShape.getContinuousCollision( octahedronOldPos , octahedronPos , dotShape , dotOldPos , dotPos ) ) ;
//*/


/*
dotOldPos.set( 6 , 0.5 , 0 ) ;
dotPos.set( 0 , 0.5 , 0 ) ;
iCylinderOldPos.set( 0 , 0 , 0 ) ;
iCylinderPos.set( 0 , 0 , 0 ) ;
console.log() ;
console.log( dotShape.getContinuousCollision( dotOldPos , dotPos , iCylinderShape , iCylinderOldPos , iCylinderPos ) ) ;
console.log() ;
console.log( iCylinderShape.getContinuousCollision( iCylinderOldPos , iCylinderPos , dotShape , dotOldPos , dotPos ) ) ;
//*/


/*
cylinder2OldPos.set( 6 , 1 , 0 ) ;
cylinder2Pos.set( 0 , 1 , 0 ) ;
cylinderOldPos.set( 0 , 0 , 0 ) ;
cylinderPos.set( 0 , 0 , 0 ) ;
//cylinder2Shape = physic.Shape.Cylinder.create( { x: 1, y: 1, z: 0 } , 1.5 ) ;
console.log() ;
console.log( cylinder2Shape.getContinuousCollision( cylinder2OldPos , cylinder2Pos , cylinderShape , cylinderOldPos , cylinderPos ) ) ;
console.log() ;
//console.log( cylinderShape.getContinuousCollision( cylinderOldPos , cylinderPos , cylinder2Shape , cylinder2OldPos , cylinder2Pos ) ) ;
//*/


/*
iCylinder2OldPos.set( 6 , 0 , 0 ) ;
iCylinder2Pos.set( 0 , 0 , 0 ) ;
iCylinderOldPos.set( 0 , 0 , 0 ) ;
iCylinderPos.set( 0 , 0 , 0 ) ;
//iCylinder2Shape = physic.Shape.Cylinder.create( { x: 1, y: 1, z: 0 } , 1.5 ) ;
console.log() ;
console.log( iCylinder2Shape.getContinuousCollision( iCylinder2OldPos , iCylinder2Pos , iCylinderShape , iCylinderOldPos , iCylinderPos ) ) ;
console.log() ;
console.log( iCylinderShape.getContinuousCollision( iCylinderOldPos , iCylinderPos , iCylinder2Shape , iCylinder2OldPos , iCylinder2Pos ) ) ;
//*/


/*
dotOldPos.set( 8 , 8 , 8 ) ;
dotPos.set( 0 , 0 , 0 ) ;
cubeOldPos.set( 0 , 0 , 0 ) ;
cubePos.set( 0 , 0 , 0 ) ;
console.log( dotShape.getContinuousCollision( dotOldPos , dotPos , cubeShape , cubeOldPos , cubePos ) ) ;
console.log( cubeShape.getContinuousCollision( cubeOldPos , cubePos , dotShape , dotOldPos , dotPos ) ) ;
//*/


/*
boxShape = physic.Shape.Box.create( 0.5 , 0.5 , 0.5 ) ;
boxPos.set( 0.5 , 0.5 , 0.51 ) ;
console.log() ;
console.log( cubeShape.getContinuousCollision( cubePos , boxShape , boxPos ) ) ;
console.log() ;
console.log( boxShape.getContinuousCollision( boxPos , cubeShape , cubePos ) ) ;
//*/



