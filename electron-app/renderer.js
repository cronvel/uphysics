/*
	3D Kit

	Copyright (c) 2020 Cédric Ronvel

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

/* global BABYLON */



const electron = require( 'electron' ) ;
const remote = require( '@electron/remote' ) ;

const path = require( 'path' ) ;

const Babylon = require( 'babylonjs' ) ;
require( 'babylonjs-loaders' ) ;
require( 'earcut' ) ;



// standard global variables
var scene , camera ;
var canvas = document.getElementById( "renderCanvas" ) ;	// Get the canvas element
var engine = new BABYLON.Engine( canvas , true ) ;	// Generate the Babylon 3D engine
var demo , world , entityMap = new Map() , dynamicMap = new Map() ;
var $fps ;



async function createScene() {
	scene = new BABYLON.Scene( engine ) ;
	camera = new BABYLON.FreeCamera( "Camera" , new BABYLON.Vector3( 0 , 1 , -5 ) , scene ) ;
	camera.attachControl( canvas , true ) ;
	camera.wheelPrecision = 50 ;
	camera.speed = 0.1 ;
	camera.minZ = 0.001 ;
	// Without that, roll rotation causes much trouble
	camera.updateUpVectorFromRotation = true ;


	//var light = new BABYLON.PointLight( "Point" , new BABYLON.Vector3( 5 , 10 , 5 ) , scene ) ;
	/*/
	var light = new BABYLON.DirectionalLight( "DirectionalLight" , new BABYLON.Vector3( 2 , -5 , 3 ) , scene ) ;
	light.intensity = 0.95 ;
	//*/
	//*/
	var light = new BABYLON.HemisphericLight( "HemisphericLight" , new BABYLON.Vector3( 0 , 1 , 0 ) , scene ) ;
	light.diffuse = new BABYLON.Color3( 1 , 1 , 1 ) ;
	light.specular = new BABYLON.Color3( 0.4 , 0.4 , 0.4 ) ;
	light.ground = new BABYLON.Color3( 0.2 , 0.2 , 0.2 ) ;
	light.intensity = 0.68 ;
	//*/

	/*
	var skybox = BABYLON.MeshBuilder.CreateBox( "skyBox" , { size: 1000 } , scene ) ;
	var skyboxMaterial = new BABYLON.StandardMaterial( "skyBox" , scene ) ;
	skyboxMaterial.backFaceCulling = false ;
	skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture( "../media/textures/skybox" , scene ) ;
	skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE ;
	skyboxMaterial.diffuseColor = new BABYLON.Color3( 0 , 0 , 0 ) ;
	skyboxMaterial.specularColor = new BABYLON.Color3( 0 , 0 , 0 ) ;
	skybox.material = skyboxMaterial ;
	skybox.position = camera.position ;
	*/
	
	$fps = document.getElementById( 'fpsCount' ) ;
}



function createEntity( entity ) {
	var meshMaterial , mesh ;

	meshMaterial = new BABYLON.StandardMaterial( 'meshmaterial' , scene ) ;
	//meshMaterial.emissiveColor = new BABYLON.Color3( 1 , 1 , 0 ) ;

	console.log( "Add: " , entity.shape.visualizer ) ;
	switch ( entity.shape.visualizer ) {
		case 'infinitePlane' :
			mesh = BABYLON.MeshBuilder.CreatePlane( 'infinitePlane' , { size: 10 } , scene ) ;
			
			// /!\ For instance the real orientation of the plane is not used, we will have to used the shape's surface normal
			
			mesh.rotation.x = Math.PI / 2 ;
			mesh.bakeCurrentTransformIntoVertices() ;
			meshMaterial.diffuseColor = new BABYLON.Color3( 0.5 , 0.5 , 0.5 ) ;
			break ;
		case 'microCube' :
		default :
			mesh = BABYLON.MeshBuilder.CreateBox( 'microCube' , { size: 0.1 } , scene ) ;
			meshMaterial.diffuseColor = new BABYLON.Color3( 1 , 1 , 0 ) ;
			break ;
	}

	mesh.position = new BABYLON.Vector3( entity.position.x , entity.position.y , entity.position.z ) ;
	mesh.material = meshMaterial ;
	
	entityMap.set( entity , mesh ) ;
	return mesh ;
}



function createLine( dynamic ) {
	var points = dynamic.entities.map( entity => new BABYLON.Vector3(
		entity.position.x ,
		entity.position.y ,
		entity.position.z
	) ) ;

	var colors = dynamic.entities.map( ( entity , index ) => new BABYLON.Color4(
		( index % 3 ) * 0.5 ,
		( ( index + 1 ) % 3 ) * 0.5 ,
		( ( index + 2 ) % 3 ) * 0.5 ,
		1
	) ) ;

	var options = { points , colors , updatable: true } ;
	
	var line = BABYLON.MeshBuilder.CreateLines( 'line' , options ) ;
	options.instance = line ;
	line.options = options ;	// save it on the object, to avoid storing it on a separated Map
	
	dynamicMap.set( dynamic , line ) ;
	return line ;
}



function updateScene() {
	var i , iMax , j , jMax , entity , dynamic , mesh , line , point ;

	for ( i = 0 , iMax = world.entities.length ; i < iMax ; i ++ ) {
		entity = world.entities[ i ] ;
		mesh = entityMap.get( entity ) ;
		if ( ! mesh ) { mesh = createEntity( entity ) ; }

		mesh.position.x = entity.position.x ;
		mesh.position.y = entity.position.y ;
		mesh.position.z = entity.position.z ;
		//console.log( mesh.position.y ) ;
	}

	for ( i = 0 , iMax = world.dynamics.length ; i < iMax ; i ++ ) {
		dynamic = world.dynamics[ i ] ;
		if ( dynamic.fixedEntityCount !== 2 ) { continue ; }
		line = dynamicMap.get( dynamic ) ;
		if ( ! line ) { line = createLine( dynamic ) ; }

		for ( j = 0 , jMax = dynamic.entities.length ; j < jMax ; j ++ ) {
			entity = dynamic.entities[ j ] ;
			point = line.options.points[ j ] ;
			point.x = entity.position.x ;
			point.y = entity.position.y ;
			point.z = entity.position.z ;
		}
		
		BABYLON.MeshBuilder.CreateLines( 'line' , line.options ) ;
		line.refreshBoundingInfo();
	}
}



async function run() {
	var demoFilePath = remote.getCurrentWindow().demoFilePath ;
	console.log( "demoFilePath:" , demoFilePath ) ;
	demo = require( demoFilePath ) ;
	world = demo.world ;

	await createScene() ;

	var start = Date.now() ;
	var log = false ;
	var timer = null ;
	var pause = true ;
	
	demo.init() ;
	updateScene() ;

	// Register a render loop to repeatedly render the scene
	engine.runRenderLoop( () => {
		$fps.innerHTML = engine.getFps().toFixed() ;
		scene.render() ;
	} ) ;
	
	var update = () => {
		demo.update() ;
		updateScene() ;
	} ;

	var switchPause = () => {
		pause = ! pause ;
		if ( pause ) {
			if ( timer ) {
				clearInterval( timer ) ;
				timer = null ;
			}
		}
		else if ( ! timer ) {
			timer = setInterval( update , world.timeStep * 1000 ) ;
		}
	} ;

	// Watch keys
	window.addEventListener( "keydown" , event => {
		switch ( event.key ) {
			case ' ' :
				switchPause() ;
				break ;
			case 's' :
				if ( pause ) { update() ; }
				else { switchPause() ; }
				break ;
		}
	} ) ;

	// Watch for browser/canvas resize events
	window.addEventListener( "resize" , () => {
		engine.resize() ;
	} ) ;
}

run() ;

