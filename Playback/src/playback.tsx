import React from "react";
import * as THREE from "three";
import { DoubleSide } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import Stats from "three/examples/jsm/libs/stats.module";
import './playback.css'

type Props = {
    motionURL: string;
    motionType: string;
    videoURL: string;
}

class PlayBack extends React.Component<Props> {

    constructor (props: Props) {
        super(props);
    }

    async componentDidMount() {

        //Scene//
        const scene = new THREE.Scene()

        const camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        )
        camera.position.set(0, 2, 7)
        //Render 
        const renderer = new THREE.WebGLRenderer({ antialias: true })
        renderer.setSize(window.innerWidth, window.innerHeight)
        document.body.appendChild(renderer.domElement)

        //Light
        var light = new THREE.AmbientLight(0xffffff);
        light.intensity = 1;
        scene.add(light)

        var SLight = new THREE.SpotLight(0xffffff)
        SLight.intensity = 2;
        SLight.position.set(5, 5, 5)
        scene.add(SLight)

        // Video Component
        const video = document.createElement("video")
        video.src = this.props.videoURL;
        video.crossOrigin = 'anonymous';
        video.setAttribute('playsinline', '');
        video.muted = true;
        video.loop = false;
        video.preload = "auto";

        //ProgressBar
        const progressBar: HTMLProgressElement = document.getElementById("progress-bar") as HTMLProgressElement;
        video.ontimeupdate = function () {
            progressBar.value = Math.floor(video.currentTime)
            progressBar.max = Math.floor(video.duration)
        }

        // Video Texture
        video.onloadedmetadata = async () => {
            var vidTex = new THREE.VideoTexture(video);
            vidTex.minFilter = THREE.LinearFilter;
            vidTex.magFilter = THREE.LinearFilter;
            const vidGeo = new THREE.PlaneGeometry(10, 5, 10);
            const vidMat = new THREE.MeshBasicMaterial({
                map: vidTex,
                side: DoubleSide
            })
            const vidCube = new THREE.Mesh(vidGeo, vidMat);
            vidCube.position.set(0, 2.5, -3)
            scene.add(vidCube)
        }


        // Floor
        // const geometry = new THREE.PlaneGeometry(100, 100, 100);
        // const material = new THREE.MeshBasicMaterial({ color: 0xffffff })
        // const plane = new THREE.Mesh(geometry, material);
        // plane.rotation.x = -Math.PI / 2
        // scene.add(plane);

        // Grid

        const grid: any = new THREE.GridHelper(2000, 20, 0xffffff, 0xffffff);
        grid.material.opacity = 0.2;
        grid.material.transparent = true;
        scene.add(grid);

        //GLTF/GLB & FBX Upload
        let mixer: THREE.AnimationMixer

        const loaderfbx = new FBXLoader()
        if (this.props.motionType === 'fbx') {
            loaderfbx.load(
                this.props.motionURL,
                function (object) {
                    console.log(object)

                    mixer = new THREE.AnimationMixer(object);
                    const action = mixer.clipAction(object.animations[0]);
                    action.clampWhenFinished = true;
                    action.setLoop(THREE.LoopOnce, 1);

                    object.scale.set(.01, .01, .01)

                    function togglePlay() {

                        if (video.ended) {
                            video.muted = true;
                            video.currentTime = 0;
                            video.play();
                            action.reset();
                            action.setEffectiveWeight(1.0)
                            action.play();


                        }
                        else if (video.paused) {
                            video.muted = true;
                            video.play();
                            action.setEffectiveWeight(1.0)
                            action.paused = false;
                            action.play();

                        }

                    }

                    function toggleStop() {
                        if (video.played) {
                            video.pause();
                            video.currentTime = 0
                            action.reset();
                            action.stop();
                        }
                    }

                    const playbtn = document.getElementById("play") as HTMLButtonElement;
                    playbtn.addEventListener("click", togglePlay

                    )
                    const stopbtn = document.getElementById("stop") as HTMLButtonElement;
                    stopbtn.addEventListener("click", toggleStop

                    )

                    const pause = document.getElementById("pause") as HTMLButtonElement;
                    pause.addEventListener("click", function (e) {
                        if (video.played) {
                            video.pause();
                            action.paused = true;
                        }
                    })

                    scene.add(object)
                }

            )
        }


        const loader = new GLTFLoader()
        if (this.props.motionType === 'glb') {
            loader.load(
                this.props.motionURL,
                function (gltf) {
                    mixer = new THREE.AnimationMixer(gltf.scene)
                    var action = mixer.clipAction(gltf.animations[0]);
                    action.clampWhenFinished = true;
                    action.setLoop(THREE.LoopOnce, 1)

                    gltf.scene.scale.set(1, 1, 1)
                    scene.add(gltf.scene)

                    function togglePlay() {

                        if (video.ended) {
                            video.muted = true;
                            video.currentTime = 0;
                            video.play();
                            action.reset();
                            action.setEffectiveWeight(1.0)
                            action.play();


                        }
                        else if (video.paused) {
                            video.muted = true;
                            video.play();
                            action.setEffectiveWeight(1.0)
                            action.paused = false;
                            action.play();

                        }

                    }

                    function toggleStop() {
                        if (video.played) {
                            video.pause();
                            video.currentTime = 0
                            action.reset();
                            action.stop();
                        }
                    }

                    function togglePause() {
                        if (video.played) {
                            video.pause();
                            action.paused = true;
                        }
                    }

                    const playbtn = document.getElementById("play") as HTMLButtonElement;
                    playbtn.addEventListener("click", togglePlay)

                    const stopbtn = document.getElementById("stop") as HTMLButtonElement;
                    stopbtn.addEventListener("click", toggleStop)

                    const pause = document.getElementById("pause") as HTMLButtonElement;
                    pause.addEventListener("click", togglePause)

                }

            )
        }

            const controls = new OrbitControls(camera, renderer.domElement)
            controls.addEventListener('change', render)

            window.addEventListener('resize', onWindowResize, false)
            function onWindowResize() {
                camera.aspect = window.innerWidth / window.innerHeight
                camera.updateProjectionMatrix()
                renderer.setSize(window.innerWidth, window.innerHeight)
                render()
            }

            const stats = Stats()
            document.body.appendChild(stats.dom)

            const clock = new THREE.Clock()
            function animate() {

                requestAnimationFrame(animate)
                if (mixer) mixer.update(clock.getDelta())
                render()

                stats.update();
            }

            function render() {
                renderer.render(scene, camera)

            }

            animate()

        }

        render() {
            return <></>;
        }
    }
export default PlayBack;
