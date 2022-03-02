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

var demo ;



// standard global variables
var scene , camera ;
var canvas = document.getElementById( "renderCanvas" ) ;	// Get the canvas element
var engine = new Babylon.Engine( canvas , true ) ;	// Generate the Babylon 3D engine
var track ;
var $fps ;



async function createScene() {
	scene = new Babylon.Scene( engine ) ;
	camera = new Babylon.FreeCamera( "Camera" , new Babylon.Vector3( 0 , 1 , 0 ) , scene ) ;
	camera.attachControl( canvas , true ) ;
	camera.wheelPrecision = 50 ;
	camera.minZ = 0.001 ;
	// Without that, roll rotation causes muche trouble
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
	var skybox = Babylon.MeshBuilder.CreateBox( "skyBox" , { size: 1000 } , scene ) ;
	var skyboxMaterial = new Babylon.StandardMaterial( "skyBox" , scene ) ;
	skyboxMaterial.backFaceCulling = false ;
	skyboxMaterial.reflectionTexture = new Babylon.CubeTexture( "../media/textures/skybox" , scene ) ;
	skyboxMaterial.reflectionTexture.coordinatesMode = Babylon.Texture.SKYBOX_MODE ;
	skyboxMaterial.diffuseColor = new Babylon.Color3( 0 , 0 , 0 ) ;
	skyboxMaterial.specularColor = new Babylon.Color3( 0 , 0 , 0 ) ;
	skybox.material = skyboxMaterial ;
	skybox.position = camera.position ;
	*/
	
	$fps = document.getElementById( 'fpsCount' ) ;
}



async function run() {
	var demoFilePath = remote.getCurrentWindow().demoFilePath ;

	if ( demoFilePath ) {
		if ( ! path.isAbsolute( demoFilePath ) ) {
			demoFilePath = path.join( remote.process.cwd() , demoFilePath ) ;
		}

		console.log( "demoFilePath:" , demoFilePath ) ;
		demo = require( demoFilePath ) ;
	}

	await createScene() ;

	var start = Date.now() ;
	var log = false ;

	// Register a render loop to repeatedly render the scene
	engine.runRenderLoop( () => {
		$fps.innerHTML = engine.getFps().toFixed() ;
		if ( demo ) { demo.update() ; }
		scene.render() ;
	} ) ;

	// Watch for browser/canvas resize events
	window.addEventListener( "resize" , () => {
		engine.resize() ;
	} ) ;
}

run() ;
