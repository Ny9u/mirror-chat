<template>
  <canvas ref="canvasRef" class="wave-canvas" width="150" height="150"></canvas>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";

const canvasRef = ref(null);
let animationId = null;

const initWaveAnimation = () => {
  const canvas = canvasRef.value;
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const sphereRadius = 45;

  const rotateX = 0.4;
  const rotateY = 0.3;

  const project3D = (x, y, z) => {
    const cosX = Math.cos(rotateX);
    const sinX = Math.sin(rotateX);
    const cosY = Math.cos(rotateY);
    const sinY = Math.sin(rotateY);

    const y1 = y * cosX - z * sinX;
    const z1 = y * sinX + z * cosX;
    const x2 = x * cosY - z1 * sinY;
    const z2 = x * sinY + z1 * cosY;

    return {
      x: centerX + x2,
      y: centerY - y1,
      z: z2,
    };
  };

  const animate = () => {
    if (!canvasRef.value) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const time = Date.now() / 1000;

    for (let i = 0; i < 7; i++) {
      const latAngle = ((i + 1) / 8) * Math.PI - Math.PI / 2;
      const latRadius = Math.cos(latAngle) * sphereRadius;
      const latY = Math.sin(latAngle) * sphereRadius;

      const points3D = [];
      const segments = 60;

      for (let j = 0; j <= segments; j++) {
        const angle = (j / segments) * Math.PI * 2 + time * 0.5;
        const x = Math.cos(angle) * latRadius;
        const y = latY;
        const z = Math.sin(angle) * latRadius;
        const waveOffset = Math.sin(angle * 2 + time * 3) * 4;
        points3D.push({ x, y: y + waveOffset, z });
      }

      const points2D = points3D.map((p) => project3D(p.x, p.y, p.z));

      const avgZ = points3D.reduce((sum, p) => sum + p.z, 0) / points3D.length;
      const depth = (avgZ + sphereRadius) / (sphereRadius * 2);
      const alpha = 0.2 + depth * 0.8;
      const lineWidth = 1 + depth * 2;

      ctx.beginPath();
      ctx.strokeStyle = `rgba(76, 175, 80, ${alpha})`;
      ctx.lineWidth = lineWidth;
      ctx.lineCap = "round";

      points2D.forEach((point, idx) => {
        if (idx === 0) ctx.moveTo(point.x, point.y);
        else ctx.lineTo(point.x, point.y);
      });

      ctx.closePath();
      ctx.stroke();
    }

    animationId = requestAnimationFrame(animate);
  };

  animate();
};

const stopWaveAnimation = () => {
  if (animationId) {
    cancelAnimationFrame(animationId);
    animationId = null;
  }
};

onMounted(() => {
  initWaveAnimation();
});

onBeforeUnmount(() => {
  stopWaveAnimation();
});
</script>
