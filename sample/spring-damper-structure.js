
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



var timeStep = 0.005 ,
	maxTime = 4 ,
	//integrator = 'euler' ,
	integrator = 'verlet' ,
	//integrator = 'predictor' ,
	//integrator = 'predictorUnstiffed' ,
	//springK = 3000 , dampingFactor = 100 ,
	springK = 10000 , dampingFactor = 200 ,
	restLength = 1 ,
	mass = 10 ,
	subdivide = 2 ,
	randomDisplacement = 0.1 ;



var world = new physic.World( {
	timeStep: timeStep ,
	integrator: integrator
} ) ;



var planeShape = physic.Shape.createPlane( new physic.Vector3D( 0 , 1 , 0 ) ) ;
var basicMaterial = new physic.Material( { isSolid: true } ) ;
basicMaterial.setSelfInteraction( new physic.MaterialInteraction( { hq: true } ) ) ;

var gravity = world.createDynamic( physic.dynamics.ConstantAcceleration , { acceleration: new physic.Vector3D( 0 , -9.8 , 0 ) } ) ;

var structureTemplate = new physic.builders.SpringDamperStructure( {
	dynamics: [ gravity ] ,
	size: new physic.Vector3D( 1 , 1 , 2 ) ,
	//size: new physic.Vector3D( 2 , 2 , 4 ) ,
	material: basicMaterial ,
	subdivide , springK , dampingFactor , mass , randomDisplacement
} ) ;

var structure = structureTemplate.build( world , new physic.Vector3D( 0 , 2.5 , 0 ) ) ;

console.log( "Entity count: %i\nDynamic count: %i\n" , structure.entities.length , structure.dynamics.length ) ;

var plane = world.createEntity( {
	id: 'static-plane' ,
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
	term.yellow( "--- T: %[.3]fs --\n" , world.time ) ;
	frameTextReportEnt( structure.entities[ 0 ] ) ;
}



function frameTextReportEnt( ent ) {
	if ( ent.position.y < -0.0001 ) {
		term.red( "\t%s pos:(%[.3]f,%f,%[.3]f) vel:(%[.3]f,%[.3]f,%[.3]f) accel:(%[.3]f,%[.3]f,%[.3]f)\n" ,
			ent.id ,
			ent.position.x , ent.position.y , ent.position.z , 
			ent.velocity.x , ent.velocity.y , ent.velocity.z , 
			ent.acceleration.x , ent.acceleration.y , ent.acceleration.z
		) ;
		process.exit() ;
		return ;
	}

	if ( ent.position.y <= 0 ) {
		term.brightYellow( "\t%s pos:(%[.3]f,%f,%[.3]f) vel:(%[.3]f,%[.3]f,%[.3]f) accel:(%[.3]f,%[.3]f,%[.3]f)\n" ,
			ent.id ,
			ent.position.x , ent.position.y , ent.position.z , 
			ent.velocity.x , ent.velocity.y , ent.velocity.z , 
			ent.acceleration.x , ent.acceleration.y , ent.acceleration.z
		) ;
		return ;
	}
	

	term.yellow( "\t%s pos:(%[.3]f,%[.3]f,%[.3]f) vel:(%[.3]f,%[.3]f,%[.3]f) accel:(%[.3]f,%[.3]f,%[.3]f)\n" ,
		ent.id ,
		ent.position.x , ent.position.y , ent.position.z , 
		ent.velocity.x , ent.velocity.y , ent.velocity.z , 
		ent.acceleration.x , ent.acceleration.y , ent.acceleration.z
	) ;
}



exports.world = world ;
exports.init = init ;
exports.update = update ;

if ( ! isElectron ) { runTerminal() ; }

