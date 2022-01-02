import common from "./Common";
import MainScene from "./MainScene";

import assets from "./Assets";
import EventBus from "../utils/EventBus";
import * as THREE from "three"

import bokeh_vert from "./glsl/bokeh.vert";
import bokeh_frag from "./glsl/bokeh.frag";
import Stats from 'three/examples/jsm/libs/stats.module.js';
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';

export default class Artwork{
    constructor(props){
        this.props = props;
        this.init();
    }

    init(){
        const bgColor = 0xffc7d1; // 0xf00c9e0
        common.init({
            $wrapper: this.props.$wrapper,
            bgColor 
        });

        // common.renderer.outputEncoding = THREE.sRGBEncoding;

        this.mainScene = new MainScene({bgColor});

        this.scene = new THREE.Scene();
        // 基本的にポストプロセスはcameraの情報は使わないから空でいい。
        this.camera = new THREE.Camera();
        

        this.fbos = [
            new THREE.WebGLRenderTarget(common.fbo_dimensions.x, common.fbo_dimensions.y),
            new THREE.WebGLRenderTarget(common.fbo_dimensions.x, common.fbo_dimensions.y),
            new THREE.WebGLRenderTarget(common.fbo_dimensions.x, common.fbo_dimensions.y),
            new THREE.WebGLRenderTarget(common.fbo_dimensions.x, common.fbo_dimensions.y),
            new THREE.WebGLRenderTarget(common.fbo_dimensions.x, common.fbo_dimensions.y),
            new THREE.WebGLRenderTarget(common.fbo_dimensions.x, common.fbo_dimensions.y),
            new THREE.WebGLRenderTarget(common.fbo_dimensions.x, common.fbo_dimensions.y),
        ];

        this.plane = new THREE.Mesh(
            new THREE.PlaneBufferGeometry(2, 2),
            new THREE.ShaderMaterial({
                vertexShader: bokeh_vert,
                fragmentShader: bokeh_frag,
                uniforms: {
                    uDiffuse: {
                        value: this.mainScene.fbo.texture
                    },
                    uResolution: {
                        value: common.fbo_dimensions
                    },
                    uOutput: {
                        value: false
                    },
                    uDirection: {
                        value: 1
                    },
                    uBlur: {
                        value: true
                    }
                },
                flatShading: true
            })
        );

        this.scene.add(this.plane);

        EventBus.on("FINISH_LOADING", () => {
            this.mainScene.init();
        });

        assets.load();

        this.guiParams = {
            blur_iteration: 1,
            isBlur: true
        }

        this.gui = new GUI();
        document.body.appendChild(this.gui.domElement);

        this.gui.add(this.guiParams, "blur_iteration", 1, 8, 1);
        this.gui.add(this.guiParams, "isBlur")

        this.stats = new Stats();
        document.body.appendChild(this.stats.domElement);

        this.loop();
    }

    resize(){
        common.resize();

        this.mainScene.resize();

        for(let i = 0; i < this.fbos.length; i++){
            this.fbos[i].setSize(
                common.fbo_dimensions.x,
                common.fbo_dimensions.y
            );
        }
    }

    update(){
        this.stats.begin();
        common.update();
        this.mainScene.update();

        const uniforms = this.plane.material.uniforms

        if(this.guiParams.isBlur){
            uniforms.uOutput.value = false;
            uniforms.uBlur.value = true;
        
            for(let i = 0; i <= this.guiParams.blur_iteration - 1; i++){
    
                if(i == 0){
                    uniforms.uDiffuse.value = this.mainScene.fbo.texture
                } else {
                    uniforms.uDiffuse.value = this.fbos[i - 1].texture
                }
    
                uniforms.uDirection.value = i % 2 == 0 ? 1 : -1;
    
                if(i < this.guiParams.blur_iteration - 1){
                    common.renderer.setRenderTarget(this.fbos[i]);
                    common.renderer.render(this.scene, this.camera);
                } else {
                    uniforms.uOutput.value = true;
    
                    common.renderer.setRenderTarget(null);
                    common.renderer.render(this.scene, this.camera);
                }
                
            }
        } else {

            uniforms.uDiffuse.value = this.mainScene.fbo.texture
            uniforms.uOutput.value = true;
            uniforms.uBlur.value = false;

            common.renderer.setRenderTarget(null);
            common.renderer.render(this.scene, this.camera);
        }

        

        this.stats.end();


    }

    loop(){
        this.update();

        window.requestAnimationFrame(this.loop.bind(this));
    }
}