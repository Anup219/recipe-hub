import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export const HeroCanvas: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, mount.clientWidth / mount.clientHeight, 0.1, 100);
    camera.position.z = 8;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    // ── Lighting (brighter for visibility) ──────────────────────────────────
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0xf97316, 2.5);
    dirLight.position.set(5, 5, 5);
    scene.add(dirLight);
    const pointLight = new THREE.PointLight(0xfbbf24, 3, 25);
    pointLight.position.set(-4, 2, 3);
    scene.add(pointLight);
    const rimLight = new THREE.PointLight(0xec4899, 2, 18);
    rimLight.position.set(4, -3, 2);
    scene.add(rimLight);

    // ── Meshes ────────────────────────────────────────────────────────────────
    const meshes: THREE.Mesh[] = [];
    const brandColors = [0xf97316, 0xfb923c, 0xfbbf24, 0xeab308, 0xef4444, 0xec4899, 0xf43f5e, 0xf59e0b];

    const shapes = [
      { geo: new THREE.TorusGeometry(0.7, 0.27, 20, 80), pos: [-3.5, 1.5, -1] },
      { geo: new THREE.SphereGeometry(0.65, 32, 32), pos: [3.2, 1.2, -2] },
      { geo: new THREE.IcosahedronGeometry(0.58, 0), pos: [0.5, -2.2, 0] },
      { geo: new THREE.TorusKnotGeometry(0.46, 0.16, 120, 16), pos: [3.8, -1.5, -1.5] },
      { geo: new THREE.OctahedronGeometry(0.55), pos: [-3.8, -1.8, -0.5] },
      { geo: new THREE.DodecahedronGeometry(0.52), pos: [1.5, 2.5, -2] },
      { geo: new THREE.ConeGeometry(0.42, 1.0, 6), pos: [-1.5, -2.8, -1] },
      { geo: new THREE.TorusGeometry(0.44, 0.17, 16, 60), pos: [-2.2, 2.8, -3] },
    ];

    shapes.forEach(({ geo, pos }, i) => {
      const mat = new THREE.MeshStandardMaterial({
        color: brandColors[i % brandColors.length],
        roughness: 0.2,
        metalness: 0.25,
        transparent: true,
        opacity: 0.92,
        emissive: brandColors[i % brandColors.length],
        emissiveIntensity: 0.18,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(...(pos as [number, number, number]));
      // MUCH faster speeds
      mesh.userData = {
        rx: (Math.random() > 0.5 ? 1 : -1) * (0.012 + Math.random() * 0.018),
        ry: (Math.random() > 0.5 ? 1 : -1) * (0.016 + Math.random() * 0.022),
        rz: (Math.random() > 0.5 ? 1 : -1) * (0.010 + Math.random() * 0.014),
        floatOffset: Math.random() * Math.PI * 2,
        floatSpeed: 1.2 + Math.random() * 1.0,
        floatAmplitude: 0.18 + Math.random() * 0.22,
        baseY: pos[1],
      };
      scene.add(mesh);
      meshes.push(mesh);
    });

    // ── Particles ─────────────────────────────────────────────────────────────
    const particleCount = 600;
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3]     = (Math.random() - 0.5) * 20;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 14;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10 - 3;
    }
    const partGeo = new THREE.BufferGeometry();
    partGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const partMat = new THREE.PointsMaterial({ color: 0xf97316, size: 0.07, transparent: true, opacity: 0.7, sizeAttenuation: true });
    const particles = new THREE.Points(partGeo, partMat);
    scene.add(particles);

    // ── Mouse parallax ────────────────────────────────────────────────────────
    let mouseX = 0, mouseY = 0;
    const handleMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 1.2;
      mouseY = -(e.clientY / window.innerHeight - 0.5) * 0.8;
    };
    window.addEventListener('mousemove', handleMouseMove);

    const handleResize = () => {
      if (!mount) return;
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      camera.position.x += (mouseX - camera.position.x) * 0.05;
      camera.position.y += (mouseY - camera.position.y) * 0.05;
      camera.lookAt(scene.position);

      meshes.forEach((mesh) => {
        const { rx, ry, rz, floatOffset, floatSpeed, floatAmplitude, baseY } = mesh.userData;
        mesh.rotation.x += rx;
        mesh.rotation.y += ry;
        mesh.rotation.z += rz;
        mesh.position.y = baseY + Math.sin(elapsed * floatSpeed + floatOffset) * floatAmplitude;
      });

      particles.rotation.y = elapsed * 0.06;
      particles.rotation.x = elapsed * 0.02;

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      meshes.forEach((m) => {
        (m.geometry as THREE.BufferGeometry).dispose();
        (m.material as THREE.Material).dispose();
      });
      partGeo.dispose();
      partMat.dispose();
      renderer.dispose();
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} className="absolute inset-0 pointer-events-none" style={{ zIndex: 0 }} />;
};
