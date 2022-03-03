
"use strict" ;

const physic = require( '..' ) ;
const math = require( 'math-kit' ) ;

var isElectron , term ;

if ( process.type === 'renderer' ) {
	isElectron = true ;
}
else {
	isElectron = false ;
	term = require( 'terminal-kit' ).terminal ;
}



var timeStep = 0.01 ,
	maxTime = 1 ,
	//integrator = 'euler' ,
	integrator = 'verlet' ,
	//integrator = 'predictor' ,
	//integrator = 'predictorUnstiffed' ,
	springK = 1000 ,
	dampingFactor = 50 ,
	restLength = 1 ,
	mass = 10 ,
	initialVY = 10 ;



var world = new physic.World( {
	timeStep: timeStep ,
	integrator: integrator
} ) ;



var dotShape = physic.Shape.createDot() ;
var planeShape = physic.Shape.createPlane( new physic.Vector3D( 0 , 1 , 0 ) ) ;
var basicMaterial = new physic.Material( { isSolid: true } ) ;
basicMaterial.setSelfInteraction( new physic.MaterialInteraction( { hq: true } ) ) ;

var gravity = world.createDynamic( physic.dynamics.ConstantAcceleration , { acceleration: new physic.Vector3D( 0 , -9.8 , 0 ) } ) ,
	sdd12 = world.createDynamic( physic.dynamics.SpringDamper , { springK , dampingFactor , restLength } ) ,
	sdd13 = world.createDynamic( physic.dynamics.SpringDamper , { springK , dampingFactor , restLength } ) ,
	sdd14 = world.createDynamic( physic.dynamics.SpringDamper , { springK , dampingFactor , restLength } ) ,
	sdd23 = world.createDynamic( physic.dynamics.SpringDamper , { springK , dampingFactor , restLength } ) ,
	sdd24 = world.createDynamic( physic.dynamics.SpringDamper , { springK , dampingFactor , restLength } ) ,
	sdd34 = world.createDynamic( physic.dynamics.SpringDamper , { springK , dampingFactor , restLength } ) ;

var ent1 = world.createEntity( {
	shape: dotShape ,
	material: basicMaterial ,
	x: 0 , y: 0 , z: 0 ,
	vx: 0 , vy: initialVY , vz: 0 ,
	mass: mass
} ) ;

var ent2 = world.createEntity( {
	shape: dotShape ,
	material: basicMaterial ,
	x: 1 , y: 0 , z: 0 ,
	vx: 0 , vy: initialVY , vz: 0 ,
	mass: mass
} ) ;

var ent3 = world.createEntity( {
	shape: dotShape ,
	material: basicMaterial ,
	x: 0.5 , y: 0 , z: 0.5 ,
	vx: 0 , vy: initialVY , vz: 0 ,
	mass: mass
} ) ;

var ent4 = world.createEntity( {
	shape: dotShape ,
	material: basicMaterial ,
	x: 0.5 , y: 1 , z: 0.25 ,
	vx: 0 , vy: initialVY , vz: 0 ,
	mass: mass
} ) ;

//*
sdd12.linkEntities( ent1 , ent2 ) ;
sdd13.linkEntities( ent1 , ent3 ) ;
sdd14.linkEntities( ent1 , ent4 ) ;
sdd23.linkEntities( ent2 , ent3 ) ;
sdd24.linkEntities( ent2 , ent4 ) ;
sdd34.linkEntities( ent3 , ent4 ) ;
//*/
gravity.linkEntities( ent1 , ent2 , ent3 , ent4 ) ;

var plane = world.createEntity( {
	shape: planeShape ,
	material: basicMaterial ,
	isStatic: true
} ) ;



function init() { world.computeInitialForces() ; }
function update() { world.update() ; }



async function runTerminal() {
	init() ;
	frameTextReport() ;

	while ( world.time < maxTime ) {
		update() ;
		frameTextReport() ;
	}
}



function frameTextReport() {
	term.yellow( "T: %[.3]fs => y: %km vy: %km/s ay: %km/s²\n" , world.time , ent4.position.y , ent4.velocity.y , ent4.acceleration.y ) ;
}



exports.world = world ;
exports.init = init ;
exports.update = update ;

if ( ! isElectron ) { runTerminal() ; }

