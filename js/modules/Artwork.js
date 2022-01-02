import common from "./Common";
import MainScene from "./MainScene";

import assets from "./Assets";
import EventBus from "../utils/EventBus";
import * as THREE from "three"

import bokeh_vert from "./glsl/bokeh.vert";
import bokeh_frag from "./glsl/bokeh.frag";

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
        this.camera = new THREE.Camera();

        this.fbos = [
            new THREE.WebGLRenderTarget(common.fbo_dimensions.x, common.fbo_dimensions.y),
            // new THREE.WebGLRenderTarget(common.fbo_dimensions.x, common.fbo_dimensions.y),
            // new THREE.WebGLRenderTarget(common.fbo_dimensions.x, common.fbo_dimensions.y),
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
                    }
                }
            })
        );

        this.scene.add(this.plane);

        EventBus.on("FINISH_LOADING", () => {
            this.mainScene.init();
        });

        assets.load();

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
        common.update();
        this.mainScene.update();

        const uniforms = this.plane.material.uniforms

        uniforms.uOutput.value = false;

        for(let i = 0; i <= this.fbos.length; i++){

            if(i == 0){
                uniforms.uDiffuse.value = this.mainScene.fbo.texture
            } else {
                uniforms.uDiffuse.value = this.fbos[i - 1].texture

            }

            uniforms.uDirection.value = i % 2 == 0 ? 1 : -1;

            if(i < this.fbos.length){
                common.renderer.setRenderTarget(this.fbos[i]);
                common.renderer.render(this.scene, this.camera);
            } else {
                uniforms.uOutput.value = true;

                common.renderer.setRenderTarget(null);
                common.renderer.render(this.scene, this.camera);
            }
            
        }

    }

    loop(){
        this.update();

        window.requestAnimationFrame(this.loop.bind(this));
    }
}