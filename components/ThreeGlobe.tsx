import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { WeatherCondition } from '../types';

interface ThreeGlobeProps {
  condition: WeatherCondition;
  lat: number;
  lng: number;
  isDay?: boolean;
  onLoad?: () => void;
}

const ThreeGlobe: React.FC<ThreeGlobeProps> = ({ condition, lat, lng, isDay = true, onLoad }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const reqIdRef = useRef<number | null>(null);


  const earthGroupRef = useRef<THREE.Group | null>(null);
  const cloudsRef = useRef<THREE.Group | null>(null);
  const sunLightRef = useRef<THREE.DirectionalLight | null>(null);
  const sunMeshRef = useRef<THREE.Mesh | null>(null);
  const pinRef = useRef<THREE.Group | null>(null);


  const cleanScene = (scene: THREE.Scene) => {
    scene.traverse((object) => {
      if (!(object as THREE.Mesh).isMesh) return;

      const mesh = object as THREE.Mesh;


      if (mesh.geometry) mesh.geometry.dispose();


      if (mesh.material) {
        if (Array.isArray(mesh.material)) {
          mesh.material.forEach((mat) => {
            if (mat.map) mat.map.dispose();
            if (mat.envMap) mat.envMap.dispose();
            mat.dispose();
          });
        } else {
          const mat = mesh.material as THREE.Material & { map?: THREE.Texture, envMap?: THREE.Texture, bumpMap?: THREE.Texture, alphaMap?: THREE.Texture, emissiveMap?: THREE.Texture, metalnessMap?: THREE.Texture };
          if (mat.map) mat.map.dispose();
          if (mat.bumpMap) mat.bumpMap.dispose();
          if (mat.alphaMap) mat.alphaMap.dispose();
          if (mat.emissiveMap) mat.emissiveMap.dispose();
          if (mat.metalnessMap) mat.metalnessMap.dispose();
          mat.dispose();
        }
      }
    });
  };


  useEffect(() => {
    if (!mountRef.current) return;


    while (mountRef.current.firstChild) {
      mountRef.current.removeChild(mountRef.current.firstChild);
    }

    const width = mountRef.current.clientWidth || window.innerWidth;
    const height = mountRef.current.clientHeight || window.innerHeight;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 8);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
      stencil: false,
      depth: true,
      failIfMajorPerformanceCaveat: true
    });

    renderer.setSize(width, height);

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const manager = new THREE.LoadingManager();
    manager.onLoad = () => {
      if (onLoad) onLoad();
    };

    const textureLoader = new THREE.TextureLoader(manager);


    const ambientLight = new THREE.AmbientLight(0x4040bb, isDay ? 0.4 : 0.8);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, isDay ? 3.5 : 2.0);
    sunLight.position.set(5, 3, 5);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    sunLight.shadow.bias = -0.0001;
    scene.add(sunLight);
    sunLightRef.current = sunLight;

    const rimLight = new THREE.SpotLight(0x6688ff, isDay ? 1.0 : 10.0);
    rimLight.position.set(-5, 5, -8);
    rimLight.lookAt(0, 0, 0);
    scene.add(rimLight);


    const sunGeo = new THREE.SphereGeometry(0.5, 32, 32);
    const sunMat = new THREE.MeshBasicMaterial({
      color: 0xffddaa,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const sunMesh = new THREE.Mesh(sunGeo, sunMat);
    const glowGeo = new THREE.SphereGeometry(1.5, 32, 32);
    const glowMat = new THREE.MeshBasicMaterial({
      color: 0xffaa00,
      transparent: true,
      opacity: 0.15,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const sunGlow = new THREE.Mesh(glowGeo, glowMat);
    sunMesh.add(sunGlow);
    scene.add(sunMesh);
    sunMeshRef.current = sunMesh;



    const earthGroup = new THREE.Group();
    earthGroup.rotation.z = 23.5 * (Math.PI / 180);
    scene.add(earthGroup);
    earthGroupRef.current = earthGroup;

    const earthGeo = new THREE.SphereGeometry(1, 64, 64);
    const waterMap = textureLoader.load('https://unpkg.com/three-globe/example/img/earth-water.png');

    const earthMat = new THREE.MeshStandardMaterial({
      map: textureLoader.load('https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg'),
      bumpMap: textureLoader.load('https://unpkg.com/three-globe/example/img/earth-topology.png'),
      bumpScale: 0.04,
      metalnessMap: waterMap,
      metalness: 1.0,
      roughness: 0.35,
      emissiveMap: textureLoader.load('https://unpkg.com/three-globe/example/img/earth-night-lights.png'),
      emissive: new THREE.Color(0xffd700),
      emissiveIntensity: isDay ? 0 : 4.0,
    });

    const earth = new THREE.Mesh(earthGeo, earthMat);
    earthGroup.add(earth);


    const atmoGeo = new THREE.SphereGeometry(1.2, 64, 64);
    const atmoMat = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        void main() {
          float intensity = pow(0.65 - dot(vNormal, vec3(0, 0, 1.0)), 4.0);
          vec3 atmoColor = vec3(0.3, 0.6, 1.0); 
          gl_FragColor = vec4(atmoColor, 1.0) * intensity * 1.5;
        }
      `,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true,
      depthWrite: false
    });
    const atmosphere = new THREE.Mesh(atmoGeo, atmoMat);
    scene.add(atmosphere);


    const cloudGroup = new THREE.Group();
    earthGroup.add(cloudGroup);
    cloudsRef.current = cloudGroup;

    const cloudTex = textureLoader.load('https://unpkg.com/three-globe/example/img/earth-clouds.png');

    const cloudShadowGeo = new THREE.SphereGeometry(1.01, 64, 64);
    const cloudShadowMat = new THREE.MeshBasicMaterial({
      map: cloudTex,
      transparent: true,
      opacity: 0.3,
      color: 0x000000,
      blending: THREE.NormalBlending,
      side: THREE.DoubleSide,
      depthWrite: false
    });
    const cloudShadow = new THREE.Mesh(cloudShadowGeo, cloudShadowMat);
    if (isDay) cloudGroup.add(cloudShadow);

    const cloudBaseGeo = new THREE.SphereGeometry(1.02, 64, 64);
    const cloudBaseMat = new THREE.MeshStandardMaterial({
      map: cloudTex,
      transparent: true,
      opacity: 0.9,
      blending: THREE.NormalBlending,
      side: THREE.DoubleSide,
      depthWrite: false,
      roughness: 0.9,
      metalness: 0
    });
    const cloudBase = new THREE.Mesh(cloudBaseGeo, cloudBaseMat);
    cloudGroup.add(cloudBase);


    const starsGeo = new THREE.BufferGeometry();
    const starCount = 3000;
    const starPos = new Float32Array(starCount * 3);
    const starSizes = new Float32Array(starCount);
    for (let i = 0; i < starCount; i++) {
      const r = 120 + Math.random() * 300;
      const theta = 2 * Math.PI * Math.random();
      const phi = Math.acos(2 * Math.random() - 1);
      starPos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      starPos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      starPos[i * 3 + 2] = r * Math.cos(phi);
      starSizes[i] = Math.random() * 2.5;
    }
    starsGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    starsGeo.setAttribute('size', new THREE.BufferAttribute(starSizes, 1));
    const starsMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.3,
      transparent: true,
      opacity: 0.9,
      sizeAttenuation: true,
      blending: THREE.AdditiveBlending
    });
    const stars = new THREE.Points(starsGeo, starsMat);
    scene.add(stars);


    const markerGroup = new THREE.Group();
    earthGroup.add(markerGroup);
    (earthGroup as any).markerGroup = markerGroup;

    const pinGroup = new THREE.Group();
    markerGroup.add(pinGroup);
    pinRef.current = pinGroup;

    const headGeo = new THREE.IcosahedronGeometry(0.04, 0);
    const headMat = new THREE.MeshStandardMaterial({
      color: 0x22d3ee,
      roughness: 0.2,
      metalness: 0.9,
      emissive: 0x004455,
      emissiveIntensity: 0.8,
      flatShading: true
    });
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.y = 0.14;
    pinGroup.add(head);
    (pinGroup as any).head = head;

    const stemGeo = new THREE.CylinderGeometry(0.006, 0.003, 0.14, 8);
    const stemMat = new THREE.MeshStandardMaterial({
      color: 0x88ccff,
      roughness: 0.1,
      metalness: 1.0
    });
    const stem = new THREE.Mesh(stemGeo, stemMat);
    stem.position.y = 0.07;
    pinGroup.add(stem);

    const baseGeo = new THREE.TorusGeometry(0.035, 0.005, 16, 32);
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x22d3ee,
      roughness: 0.3,
      metalness: 0.8
    });
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.rotation.x = Math.PI / 2;
    base.position.y = 0.005;
    pinGroup.add(base);

    const pulseGeo = new THREE.RingGeometry(0.045, 0.055, 32);
    const pulseMat = new THREE.MeshBasicMaterial({
      color: 0x22d3ee,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.4,
      blending: THREE.AdditiveBlending
    });
    const pulse = new THREE.Mesh(pulseGeo, pulseMat);
    pulse.rotation.x = -Math.PI / 2;
    pulse.position.y = 0.002;
    pinGroup.add(pulse);
    (pinGroup as any).pulse = pulse;



    let active = true;

    const animate = () => {
      if (!active) return;


      if (earthGroup) earthGroup.rotation.y += 0.0005;


      if (cloudsRef.current) cloudsRef.current.rotation.y += 0.0003;


      if (pinRef.current) {
        const time = Date.now() * 0.002;
        const head = (pinRef.current as any).head;
        if (head) {
          head.rotation.y += 0.02;
          head.rotation.z = Math.sin(time) * 0.2;
        }
        const pulse = (pinRef.current as any).pulse;
        if (pulse) {
          const s = 1 + (time % 1.5) * 1.5;
          pulse.scale.set(s, s, 1);
          pulse.material.opacity = Math.max(0, 0.8 - (s - 1));
        }
        const weatherGroup = pinRef.current.getObjectByName('weatherGroup');
        if (weatherGroup && weatherGroup.userData.update) {
          weatherGroup.userData.update(time);
        }
      }

      if (sunMeshRef.current && cameraRef.current) {
        sunMeshRef.current.lookAt(cameraRef.current.position);
      }

      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }

      reqIdRef.current = requestAnimationFrame(animate);
    };


    const handleVisibilityChange = () => {
      if (document.hidden) {
        active = false;
        if (reqIdRef.current) cancelAnimationFrame(reqIdRef.current);
      } else {
        active = true;
        animate();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    animate();

    const handleResize = () => {
      if (!mountRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = mountRef.current.clientWidth || window.innerWidth;
      const h = mountRef.current.clientHeight || window.innerHeight;

      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);


    handleResize();


    return () => {
      active = false;
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener('resize', handleResize);
      if (reqIdRef.current) cancelAnimationFrame(reqIdRef.current);

      if (mountRef.current && rendererRef.current) {
        try {
          mountRef.current.removeChild(rendererRef.current.domElement);
        } catch (e) {

        }
      }

      if (sceneRef.current) {
        cleanScene(sceneRef.current);
      }

      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
    };
  }, [isDay]);



  useEffect(() => {
    if (!pinRef.current) return;
    const oldWeather = pinRef.current.getObjectByName('weatherGroup');
    if (oldWeather) pinRef.current.remove(oldWeather);

    const weatherGroup = new THREE.Group();
    weatherGroup.name = 'weatherGroup';
    pinRef.current.add(weatherGroup);

    const createCloudCluster = (color: number, yOffset: number) => {
      const g = new THREE.Group();
      const geo = new THREE.IcosahedronGeometry(0.012, 0);
      const mat = new THREE.MeshStandardMaterial({
        color: color,
        transparent: true,
        opacity: 0.6,
        roughness: 0.4,
        flatShading: true
      });
      for (let i = 0; i < 3; i++) {
        const m = new THREE.Mesh(geo, mat);
        const angle = (i / 3) * Math.PI * 2;
        m.position.set(Math.cos(angle) * 0.035, 0, Math.sin(angle) * 0.035);
        m.rotation.y = Math.random() * Math.PI;
        g.add(m);
      }
      g.position.y = yOffset;
      return g;
    }

    switch (condition) {
      case WeatherCondition.Cloudy:
      case WeatherCondition.Fog: {
        const clouds = createCloudCluster(0xdddddd, 0.18);
        weatherGroup.add(clouds);
        weatherGroup.userData.update = (t: number) => {
          clouds.rotation.y = t * 0.3;
          clouds.children.forEach((c, i) => { c.position.y = Math.sin(t + i) * 0.005; });
        };
        break;
      }
      case WeatherCondition.Rain:
      case WeatherCondition.Drizzle: {
        const clouds = createCloudCluster(0x88aabb, 0.18);
        weatherGroup.add(clouds);
        const rainGeo = new THREE.BufferGeometry();
        const rainCount = 40;
        const rainPos = new Float32Array(rainCount * 3);
        for (let i = 0; i < rainCount; i++) {
          rainPos[i * 3] = (Math.random() - 0.5) * 0.06;
          rainPos[i * 3 + 1] = Math.random() * 0.15 + 0.05;
          rainPos[i * 3 + 2] = (Math.random() - 0.5) * 0.06;
        }
        rainGeo.setAttribute('position', new THREE.BufferAttribute(rainPos, 3));
        const rainMat = new THREE.PointsMaterial({ color: 0x44aaff, size: 0.003, transparent: true, opacity: 0.8 });
        const rainSystem = new THREE.Points(rainGeo, rainMat);
        weatherGroup.add(rainSystem);
        weatherGroup.userData.update = (t: number) => {
          clouds.rotation.y = t * 0.3;
          const positions = rainSystem.geometry.attributes.position.array as Float32Array;
          for (let i = 0; i < rainCount; i++) {
            positions[i * 3 + 1] -= 0.003;
            if (positions[i * 3 + 1] < 0.05) positions[i * 3 + 1] = 0.20;
          }
          rainSystem.geometry.attributes.position.needsUpdate = true;
        };
        break;
      }
      case WeatherCondition.Thunderstorm: {
        const clouds = createCloudCluster(0x444444, 0.18);
        weatherGroup.add(clouds);
        const rainGeo = new THREE.BufferGeometry();
        const rainCount = 50;
        const rainPos = new Float32Array(rainCount * 3);
        for (let i = 0; i < rainCount; i++) {
          rainPos[i * 3] = (Math.random() - 0.5) * 0.07;
          rainPos[i * 3 + 1] = Math.random() * 0.15 + 0.05;
          rainPos[i * 3 + 2] = (Math.random() - 0.5) * 0.07;
        }
        rainGeo.setAttribute('position', new THREE.BufferAttribute(rainPos, 3));
        const rainMat = new THREE.PointsMaterial({ color: 0xaaaaff, size: 0.003, transparent: true, opacity: 0.8 });
        const rainSystem = new THREE.Points(rainGeo, rainMat);
        weatherGroup.add(rainSystem);
        const flash = new THREE.PointLight(0xaaddff, 0, 0.5);
        flash.position.y = 0.16;
        weatherGroup.add(flash);
        weatherGroup.userData.update = (t: number) => {
          clouds.rotation.y = t * 0.5;
          const positions = rainSystem.geometry.attributes.position.array as Float32Array;
          for (let i = 0; i < rainCount; i++) {
            positions[i * 3 + 1] -= 0.004;
            if (positions[i * 3 + 1] < 0.05) positions[i * 3 + 1] = 0.20;
          }
          rainSystem.geometry.attributes.position.needsUpdate = true;
          if (Math.random() > 0.985) { flash.intensity = 3.0; } else { flash.intensity = Math.max(0, flash.intensity - 0.3); }
        };
        break;
      }
      case WeatherCondition.Snow: {
        const clouds = createCloudCluster(0xffffff, 0.18);
        weatherGroup.add(clouds);
        const snowGeo = new THREE.BufferGeometry();
        const snowCount = 50;
        const snowPos = new Float32Array(snowCount * 3);
        for (let i = 0; i < snowCount; i++) {
          snowPos[i * 3] = (Math.random() - 0.5) * 0.08;
          snowPos[i * 3 + 1] = Math.random() * 0.15 + 0.05;
          snowPos[i * 3 + 2] = (Math.random() - 0.5) * 0.08;
        }
        snowGeo.setAttribute('position', new THREE.BufferAttribute(snowPos, 3));
        const snowMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.002, transparent: true, opacity: 0.9 });
        const snowSystem = new THREE.Points(snowGeo, snowMat);
        weatherGroup.add(snowSystem);
        weatherGroup.userData.update = (t: number) => {
          clouds.rotation.y = t * 0.1;
          const positions = snowSystem.geometry.attributes.position.array as Float32Array;
          for (let i = 0; i < snowCount; i++) {
            positions[i * 3 + 1] -= 0.0008;
            positions[i * 3] += Math.sin(t * 3 + i) * 0.0003;
            if (positions[i * 3 + 1] < 0.05) positions[i * 3 + 1] = 0.20;
          }
          snowSystem.geometry.attributes.position.needsUpdate = true;
        };
        break;
      }
      case WeatherCondition.Clear:
      default: {
        const sunGeo = new THREE.RingGeometry(0.05, 0.065, 32);
        const sunMat = new THREE.MeshBasicMaterial({ color: 0xffaa00, side: THREE.DoubleSide, transparent: true, opacity: 0.0 });
        const sun = new THREE.Mesh(sunGeo, sunMat);
        sun.position.y = 0.14;
        sun.lookAt(0, 10, 0);
        weatherGroup.add(sun);
        weatherGroup.userData.update = (t: number) => {
          const s = 1 + Math.sin(t * 2) * 0.1;
          sun.scale.set(s, s, s);
          sun.material.opacity = 0.2 + Math.sin(t * 2) * 0.2;
          sun.rotation.z -= 0.01;
        };
        break;
      }
    }
  }, [condition]);



  useEffect(() => {
    if (!earthGroupRef.current || !cameraRef.current) return;

    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lng + 180) * (Math.PI / 180);
    const x = -(Math.sin(phi) * Math.cos(theta));
    const z = (Math.sin(phi) * Math.sin(theta));
    const y = (Math.cos(phi));

    const markerGroup = (earthGroupRef.current as any).markerGroup;
    if (markerGroup) {
      markerGroup.position.set(x, y, z);
      const normal = new THREE.Vector3(x, y, z).normalize();
      markerGroup.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal);
      if (pinRef.current) {
        pinRef.current.scale.set(0, 0, 0);
        gsap.to(pinRef.current.scale, { x: 1, y: 1, z: 1, duration: 1.2, delay: 2.2, ease: "elastic.out(1.2, 0.5)" });
      }
    }

    const targetRotY = -lng * (Math.PI / 180) - (Math.PI / 2);
    const camDist = 2.2;
    const camY = Math.sin(lat * (Math.PI / 180)) * camDist;
    const camZ = Math.cos(lat * (Math.PI / 180)) * camDist;

    const timeline = gsap.timeline();

    if (sunLightRef.current && sunMeshRef.current) {
      const sunPos = isDay ? new THREE.Vector3(6, 4, 6) : new THREE.Vector3(-10, 1, -8);

      gsap.to(sunLightRef.current.position, {
        x: sunPos.x, y: sunPos.y, z: sunPos.z, duration: 2,
        onUpdate: () => {
          if (sunMeshRef.current) {
            sunMeshRef.current.position.copy(sunPos).multiplyScalar(1.5);
          }
        }
      });
    }

    timeline.to(cameraRef.current.position, { z: 6, duration: 1.2, ease: "power2.inOut" });
    timeline.to(earthGroupRef.current.rotation, { y: targetRotY, duration: 2.0, ease: "power3.inOut" }, "-=0.8");
    timeline.to(cameraRef.current.position, { x: 0, y: camY, z: camZ, duration: 2.0, ease: "expo.out", onUpdate: () => cameraRef.current?.lookAt(0, 0, 0) }, "-=1.5");

  }, [lat, lng, isDay]);

  return <div ref={mountRef} className="fixed inset-0 z-0 w-full h-full overflow-hidden" />;
};

export default ThreeGlobe;