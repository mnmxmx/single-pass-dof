import common from "./Common";
import * as THREE from "three"

import vertexShader from "./glsl/sphere.vert"
import fragmentShader from "./glsl/sphere.frag"

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

import assets from "./Assets"

export default class MainScene{
    constructor({bgColor}){

        this.bgColor = new THREE.Color( bgColor );

        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(45, common.dimensions.x / common.dimensions.y, 1, 10000);
        this.camera.position.set(0, 0, 100);
        this.camera.lookAt(this.scene.position);
        this.fbo = new THREE.WebGLRenderTarget(common.fbo_dimensions.x, common.fbo_dimensions.y);

        this.controls = new OrbitControls(this.camera, common.renderer.domElement);
    }

    init(){
        const colors = [
            new THREE.Color(0xff8a9f),
            new THREE.Color(0xff9ce8),
            new THREE.Color(0xffe357)
        ]

        const geometry = new THREE.SphereGeometry(10, 32, 32)


        for(let i = 0; i < 300; i++){

            let color = new THREE.Color().copy(colors[0]);
            color.lerp(colors[1], Math.random());
            color.lerp(colors[2], Math.random())

            const uniforms = {
                uLightPos: {
                    value: new THREE.Vector3(100, 100, 100)
                },
                uColor: {
                    value: color
                },
                uShadowColor: {
                    value: colors[0]
                },
                uMatcap: {
                    value: assets.textures.matcap.value
                },
                uEnvMap: {
                    value: assets.envs.main.value
                },
                uCameraPos: {
                    value: this.camera.position
                },
                uFocus: {
                    value: 200
                },
                uFocusRange: {
                    value: 200
                },
                uFogNear: {
                    value: 100
                },
                uFogFar: {
                    value: 300
                },
                uBgColor: {
                    value: this.bgColor
                },
            }
    
            const material = new THREE.ShaderMaterial({
                vertexShader,
                fragmentShader,
                uniforms
            })
            
            const mesh = new THREE.Mesh(geometry, material);
            mesh.position.set(
                (Math.random() - 0.5) * 700, 
                (Math.random() - 0.5) * 500,
                -Math.random() * 400,
            );

            const scale = Math.random() * 0.8 + 0.2;

            mesh.scale.set(
                scale, scale, scale
            );
            this.scene.add(mesh);
        }

        
    }

    resize(){
        this.camera.aspect = common.dimensions.x / common.dimensions.y
        this.camera.updateProjectionMatrix();

        this.fbo.setSize(
            common.fbo_dimensions.x,
            common.fbo_dimensions.y
        );
    }

    update(){
        common.renderer.setRenderTarget(this.fbo);
        common.renderer.render(this.scene, this.camera);
    }
}