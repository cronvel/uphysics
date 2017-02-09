
var physic = require( '../lib/physic.js' ) ;


var cubePos = physic.Vector3D( 0 , 0 , 0 ) ;
var boxPos = physic.Vector3D( 0 , 0 , 0 ) ;
var dotPos = physic.Vector3D( 0 , 0 , 0 ) ;
var spherePos = physic.Vector3D( 0 , 0 , 0 ) ;
var sphere2Pos = physic.Vector3D( 0 , 0 , 0 ) ;

var cubeShape = physic.Shape.Box.create( 2 , 2 , 2 ) ;
var boxShape = physic.Shape.Box.create( 3 , 4 , 5 ) ;
var dotShape = physic.Shape.Dot.create() ;
var sphereShape = physic.Shape.Sphere.create( 2 ) ;
var sphere2Shape = physic.Shape.Sphere.create( 1 ) ;


/*
spherePos.set( 3 , 1 , 0 ) ;
console.log() ;
console.log( sphereShape.isOverlapping( spherePos , sphere2Shape , sphere2Pos ) ) ;
console.log() ;
console.log( sphere2Shape.isOverlapping( sphere2Pos , sphereShape , spherePos ) ) ;
//*/


/*
spherePos.set( -2 , -1 , -1 ) ;
console.log() ;
console.log( cubeShape.isOverlapping( cubePos , sphereShape , spherePos ) ) ;
console.log() ;
console.log( sphereShape.isOverlapping( spherePos , cubeShape , cubePos ) ) ;
//*/


/*
dotPos.set( -3 , 0 , 0 ) ;
console.log( cubeShape.isOverlapping( cubePos , dotShape , dotPos ) ) ;
console.log( dotShape.isOverlapping( dotPos , cubeShape , cubePos ) ) ;
//*/


//*
boxShape = physic.Shape.Box.create( 1 , 5 , 5 ) ;
boxPos.set( 1 , 0 , 0 ) ;
console.log() ;
console.log( cubeShape.isOverlapping( cubePos , boxShape , boxPos ) ) ;
console.log() ;
console.log( boxShape.isOverlapping( boxPos , cubeShape , cubePos ) ) ;
//*/



