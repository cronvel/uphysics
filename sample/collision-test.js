#!/usr/bin/env node

const physic = require( '../lib/physic.js' ) ;


var cubePos = new physic.Vector3D( 0 , 0 , 0 ) ;
var boxPos = new physic.Vector3D( 0 , 0 , 0 ) ;
var dotPos = new physic.Vector3D( 0 , 0 , 0 ) ;
var spherePos = new physic.Vector3D( 0 , 0 , 0 ) ;
var sphere2Pos = new physic.Vector3D( 0 , 0 , 0 ) ;
var cylinderPos = new physic.Vector3D( 0 , 0 , 0 ) ;

var cubeShape = physic.Shape.createBox( 2 , 2 , 2 ) ;
var boxShape = physic.Shape.createBox( 3 , 4 , 5 ) ;
var dotShape = physic.Shape.createDot() ;
var sphereShape = physic.Shape.createSphere( 2 ) ;
var sphere2Shape = physic.Shape.createSphere( 1 ) ;
var cylinderShape = physic.Shape.createCylinder( { x: 0, y: 0, z: 1 } , 1.5 , 4 ) ;


/*
spherePos.set( 2 , 1 , 0 ) ;
//sphere2Pos.set( 0 , 0 , 0 ) ;
console.log() ;
console.log( sphereShape.getCollision( spherePos , sphere2Shape , sphere2Pos ) ) ;
console.log() ;
console.log( sphere2Shape.getCollision( sphere2Pos , sphereShape , spherePos ) ) ;
//*/


/*
spherePos.set( 3 , 0 , 0 ) ;
console.log() ;
console.log( cubeShape.getCollision( cubePos , sphereShape , spherePos ) ) ;
console.log() ;
console.log( sphereShape.getCollision( spherePos , cubeShape , cubePos ) ) ;
//*/


//*
spherePos.set( 2 , 2 , 0 ) ;
console.log() ;
console.log( cylinderShape.getCollision( cylinderPos , sphereShape , spherePos ) ) ;
console.log() ;
console.log( sphereShape.getCollision( spherePos , cylinderShape , cylinderPos ) ) ;
//*/


/*
dotPos.set( 0.8 , 0.3 , 0 ) ;
console.log( cubeShape.getCollision( cubePos , dotShape , dotPos ) ) ;
console.log( dotShape.getCollision( dotPos , cubeShape , cubePos ) ) ;
//*/


/*
boxShape = physic.Shape.createBox( 0.5 , 0.5 , 0.5 ) ;
boxPos.set( 0.5 , 0.5 , 0.51 ) ;
console.log() ;
console.log( cubeShape.getCollision( cubePos , boxShape , boxPos ) ) ;
console.log() ;
console.log( boxShape.getCollision( boxPos , cubeShape , cubePos ) ) ;
//*/

