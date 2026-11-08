import {useEffect, useRef} from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';
import styles from './styles.module.css';

export default function PointCloudBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dataUrl = useBaseUrl('/data/pointcloud-hero.bin');
  const compressedDataUrl = useBaseUrl('/data/pointcloud-hero.dat');

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas: HTMLCanvasElement = canvasRef.current;
    const controller = new AbortController();
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let dispose = () => {};
    let cancelled = false;

    async function setup() {
      async function loadData(): Promise<ArrayBuffer> {
        if (typeof DecompressionStream !== 'undefined') {
          try {
            const response = await fetch(compressedDataUrl, {signal: controller.signal});
            if (!response.ok || !response.body) throw new Error('Point cloud unavailable');
            return await new Response(response.body.pipeThrough(new DecompressionStream('gzip'))).arrayBuffer();
          } catch (error) {
            if (controller.signal.aborted) throw error;
          }
        }
        const response = await fetch(dataUrl, {signal: controller.signal});
        if (!response.ok) throw new Error('Point cloud unavailable');
        return response.arrayBuffer();
      }
      const [THREE, response] = await Promise.all([
        import('three'),
        loadData(),
      ]);
      const data = new DataView(response);
      if (cancelled || data.byteLength % 9 !== 0) return;
      const mobile = window.matchMedia('(max-width: 600px)').matches;
      const count = Math.floor(data.byteLength / 9);
      const stride = mobile ? 2 : 1;
      const sampled = Math.ceil(count / stride);
      const positions = new Float32Array(sampled * 3);
      const colors = new Float32Array(sampled * 3);
      for (let index = 0, target = 0; index < count; index += stride, target++) {
        const offset = index * 9;
        positions[target * 3] = data.getInt16(offset, true) / 100;
        positions[target * 3 + 1] = data.getInt16(offset + 2, true) / 100;
        positions[target * 3 + 2] = data.getInt16(offset + 4, true) / 100;
        colors[target * 3] = data.getUint8(offset + 6) / 255;
        colors[target * 3 + 1] = data.getUint8(offset + 7) / 255;
        colors[target * 3 + 2] = data.getUint8(offset + 8) / 255;
      }
      const renderer = new THREE.WebGLRenderer({canvas, antialias: true, alpha: true});
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, mobile ? 1 : 1.5));
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 300);
      camera.up.set(0, 0, 1);
      camera.position.set(65, -85, 75);
      camera.lookAt(0, 0, 0);
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      const material = new THREE.PointsMaterial({size: mobile ? 0.17 : 0.14, vertexColors: true, sizeAttenuation: true});
      const cloud = new THREE.Points(geometry, material);
      scene.add(cloud);
      let frame = 0;
      let visible = true;
      let previous = 0;

      function render() { renderer.render(scene, camera); }
      function resize() {
        if (!canvas) return;
        const {width, height} = canvas.getBoundingClientRect();
        if (!width || !height) return;
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.position.set(width < 600 ? 95 : 65, width < 600 ? -120 : -85, width < 600 ? 105 : 75);
        camera.zoom = width < 600 ? 1.15 : Math.min(1.8, 1.25 + camera.aspect * 0.18);
        camera.lookAt(0, 0, 0);
        camera.updateProjectionMatrix();
        render();
      }
      function animate(time: number) {
        if (!visible || document.hidden || motion.matches) return;
        if (previous) cloud.rotation.z += Math.min(time - previous, 100) * 0.00006;
        previous = time;
        render();
        frame = requestAnimationFrame(animate);
      }
      function updateAnimation() {
        cancelAnimationFrame(frame);
        previous = 0;
        render();
        if (visible && !document.hidden && !motion.matches) frame = requestAnimationFrame(animate);
      }
      const intersection = new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
        updateAnimation();
      });
      const resizeObserver = new ResizeObserver(resize);
      intersection.observe(canvas);
      resizeObserver.observe(canvas);
      motion.addEventListener('change', updateAnimation);
      document.addEventListener('visibilitychange', updateAnimation);
      resize();
      updateAnimation();
      dispose = () => {
        cancelAnimationFrame(frame);
        intersection.disconnect();
        resizeObserver.disconnect();
        motion.removeEventListener('change', updateAnimation);
        document.removeEventListener('visibilitychange', updateAnimation);
        geometry.dispose();
        material.dispose();
        renderer.dispose();
      };
    }
    setup().catch(() => {});
    return () => {
      cancelled = true;
      controller.abort();
      dispose();
    };
  }, [compressedDataUrl, dataUrl]);

  return <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />;
}
