
"use strict" ;

const physic = require( '..' ) ;
const math = require( 'math-kit' ) ;



var timeStep = 0.5 ,
	maxTime = 8 ,
	//integrator = 'euler' ,
	//integrator = 'verlet' ,
	//integrator = 'predictor' ,
	integrator = 'predictorUnstiffed' ,
	springK = 100 ,
	dampingFactor = 20 ,
	mass = 10 ,
	initialY = 1.5 ,
	initialVY = 0 ;



var world = new physic.World( {
	timeStep: timeStep ,
	integrator: integrator
} ) ;


var dotShape = physic.Shape.createDot() ;
var basicMaterial = new physic.Material() ;
var entity = new physic.Entity( {
	shape: dotShape ,
	material: basicMaterial ,
	dynamics: [
		new physic.dynamics.SpringDamper( springK , dampingFactor )
	] ,
	x: 0 , y: initialY , z: 0 ,
	vx: 0 , vy: initialVY , vz: 0 ,
	mass: mass
} ) ;
world.addEntity( entity ) ;



function init() {
	world.computeInitialForces() ;
}

function update() {
	world.update() ;
}



module.exports = { world , init , update } ;

