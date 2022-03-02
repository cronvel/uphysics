
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



var timeStep = 0.1 ,
	maxTime = 4 ,
	//integrator = 'euler' ,
	integrator = 'verlet' ,
	//integrator = 'predictor' ,
	//integrator = 'predictorUnstiffed' ,
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
var planeShape = physic.Shape.createPlane( new physic.Vector3D( 0 , 1 , 0 ) ) ;
var basicMaterial = new physic.Material( { isSolid: true } ) ;
basicMaterial.setSelfInteraction( new physic.MaterialInteraction( { hq: true } ) ) ;

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

var plane = new physic.Entity( {
	shape: planeShape ,
	material: basicMaterial ,
	isStatic: true ,
} ) ;
world.addEntity( plane ) ;



var graphPositionYData = [] ;
var graphVelocityYData = [] ;
var graphAccelerationYData = [] ;



function init() { world.computeInitialForces() ; }
function update() { world.update() ; }



async function runTerminal() {
	init() ;

	graphPositionYData.push( { x: world.time , fx: entity.position.y } ) ;
	graphVelocityYData.push( { x: world.time , fx: entity.velocity.y } ) ;
	graphAccelerationYData.push( { x: world.time , fx: entity.acceleration.y } ) ;

	frameTextReport() ;

	while ( world.time < maxTime ) {
		update() ;

		graphPositionYData.push( { x: world.time , fx: entity.position.y } ) ;
		graphVelocityYData.push( { x: world.time , fx: entity.velocity.y } ) ;
		graphAccelerationYData.push( { x: world.time , fx: entity.acceleration.y } ) ;

		frameTextReport() ;
	}
	
	await tracerReport() ;
}



function frameTextReport() {
	term.yellow( "T: %[.3]fs => y: %km vy: %km/s ay: %km/s²\n" , world.time , entity.position.y , entity.velocity.y , entity.acceleration.y ) ;
}



function tracerReport() {
	const GmTracer = require( 'math-kit/lib/tracer/GmTracer.js' ) ;

	var tracer = new GmTracer( {
		width: 1000 ,
		height: 800 ,
		bgColor: '#000' ,
		xmin: 0 ,
		xmax: maxTime ,
		ymin: -8 ,
		ymax: 8 ,
		xUnit: 's' ,
		everyX: 0.5 ,
		yUnit: 'm' ,
		everyY: 0.5 ,
	} ) ;
	
	var options = { preserveExtrema: false , atanMeanDfx: false , order: 1 } ;

	var positionFn = new math.fn.InterpolatedFn( graphPositionYData , options ) ;
	var velocityFn = new math.fn.InterpolatedFn( graphVelocityYData , options ) ;
	var accelerationFn = new math.fn.InterpolatedFn( graphAccelerationYData , options ) ;

	var analyticFn = math.fn.Const2ndOrdDifferentialEquationFn.createSpringDamperMass(
		springK , dampingFactor , mass , initialY , initialVY , 0 //externalForce
	) ;

	tracer.createImage() ;
	tracer.drawGrid( '#7777' ) ;
	tracer.drawAxis() ;
	tracer.drawUnits() ;
	tracer.setWindow( { yUnit: 'm/s' } ) ;
	tracer.drawYUnits( undefined , undefined , 1 ) ;
	tracer.traceD2Fn( analyticFn , '#955' ) ;
	tracer.traceDFn( analyticFn , '#595' ) ;
	tracer.traceFn( analyticFn , '#559' ) ;
	tracer.traceFn( accelerationFn , '#f00' ) ;
	tracer.traceFn( velocityFn , '#0f0' ) ;
	tracer.traceFn( positionFn , '#00f' ) ;
	tracer.saveImage( __dirname + "/spring-damper.png" ) ;
}



exports.world = world ;
exports.init = init ;
exports.update = update ;

if ( ! isElectron ) { runTerminal() ; }

