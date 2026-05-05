<template>
  <div class="fullscreen-scanner">
    <!-- Top Left (Close or Retake) -->
    <button class="icon-btn top-left" @click="!photoTaken ? $emit('close') : retake()">
      <i class="fas" :class="photoTaken ? 'fa-rotate-right' : 'fa-arrow-left'"></i>
    </button>

    <video ref="videoEl" autoplay playsinline muted class="layer-video"></video>
    <canvas ref="canvasEl" class="layer-canvas" :class="{ visible: photoTaken }"></canvas>

    <!-- Overlay Container for Text Blocks -->
    <div v-if="photoTaken && results.length" class="text-overlay-layer">
      <div 
        v-for="(item, index) in results" 
        :key="index" 
        class="text-box"
        :style="calculateBoxStyle(item.bbox)"
      >
        {{ item.text }}
      </div>
    </div>

    <!-- Status Messages -->
    <div v-if="!isModelReady || isScanning" class="status-overlay">
      <span>{{ isScanning ? 'Skenujem...' : 'Načítavam OCR model...' }}</span>
    </div>

    <!-- Bottom Controls -->
    <div v-if="!photoTaken" class="controls">
      <button class="snap-btn" @click="scanText" :disabled="isScanning || !isModelReady">
        <i class="far fa-circle-dot"></i>
      </button>
    </div>
    <div v-else>
      <button class="icon-btn bottom-left" @click="save"><i class="fas fa-download"></i></button>
      <button class="icon-btn bottom-right" @click="confirmText"><i class="fas fa-check"></i></button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { PaddleOcrService } from 'ppu-paddle-ocr/web';

const emit = defineEmits(['close', 'useText']);

const videoEl = ref(null);
const canvasEl = ref(null);
const isScanning = ref(false);
const photoTaken = ref(false);
const isModelReady = ref(false);

// Store individual text fragments with their coordinates
const results = ref([]); 
const imgSize = ref({ width: 0, height: 0 });

let stream = null;
let ocrService = null;

onMounted(async () => {
  await startCamera();
  try {
    ocrService = new PaddleOcrService({ processing: { engine: 'canvas-native' } });
    await ocrService.initialize();
    isModelReady.value = true;
  } catch (e) { console.error('OCR Init Error:', e); }
});

onUnmounted(() => {
  stopCamera();
  ocrService = null;
});

const scanText = async () => {
  if (isScanning.value || !ocrService) return;
  isScanning.value = true;

  try {
    const video = videoEl.value;
    const canvas = canvasEl.value;
    const ctx = canvas.getContext('2d');

    imgSize.value = { width: video.videoWidth, height: video.videoHeight };
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);
    video.pause();

    // Perform recognition
    const res = await ocrService.recognize(canvas);
    
    // Process regions/lines from the result
    // Note: Structure usually contains { text: string, regions: Array<{text, bbox}> }
    results.value = res.regions || []; 
    photoTaken.value = true;
  } catch (e) {
    console.error('OCR failed:', e);
  } finally {
    isScanning.value = false;
  }
};

const calculateBoxStyle = (bbox) => {
  if (!bbox) return {};
  // Assuming bbox format: [xmin, ymin, xmax, ymax]
  const [x1, y1, x2, y2] = bbox;
  
  return {
    left: `${(x1 / imgSize.value.width) * 100}%`,
    top: `${(y1 / imgSize.value.height) * 100}%`,
    width: `${((x2 - x1) / imgSize.value.width) * 100}%`,
    height: `${((y2 - y1) / imgSize.value.height) * 100}%`,
    position: 'absolute'
  };
};

const startCamera = async () => {
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
    });
    videoEl.value.srcObject = stream;
  } catch (e) {
    console.error('Camera access denied:', e);
    alert('Kamera nie je dostupná. Prosím povoľte prístup k kamere.');
  }
};

const stopCamera = () => {
  if (stream) {
    stream.getTracks().forEach(track => track.stop());
    stream = null;
  }
};

const retake = () => {
  photoTaken.value = false;
  results.value = [];
  const video = videoEl.value;
  video.play();
};

const confirmText = () => {
  const extractedText = results.value.map(item => item.text).join(' ');
  emit('useText', extractedText);
};

const save = () => {
  const canvas = canvasEl.value;
  const link = document.createElement('a');
  link.href = canvas.toDataURL('image/png');
  link.download = `ocr-scan-${Date.now()}.png`;
  link.click();
};
</script>

<style scoped>
.fullscreen-scanner {
  position: fixed;
  inset: 0;
  background: black;
  z-index: 10000;
  overflow: hidden;
}

.layer-video, .layer-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Container that sits perfectly over the video/canvas */
.text-overlay-layer {
  position: absolute;
  inset: 0;
  z-index: 10001;
  pointer-events: none;
}

.text-box {
  background: rgba(45, 45, 45, 0.85); /* Dark background like the reference image */
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  padding: 2px 4px;
  border-radius: 2px;
  white-space: nowrap;
  pointer-events: auto; /* Make individual boxes clickable if needed */
}

/* Icon Buttons from your concept image */
.icon-btn {
  position: absolute;
  width: 54px;
  height: 54px;
  border-radius: 50%;
  background: rgba(50, 50, 50, 0.7);
  backdrop-filter: blur(5px);
  color: white;
  border: none;
  z-index: 10005;
}

.top-left { top: 20px; left: 20px; }
.bottom-left { bottom: 40px; left: 30px; }
.bottom-right { bottom: 40px; right: 30px; }

.snap-btn {
  position: absolute;
  bottom: 40px;
  left: 50%;
  transform: translateX(-50%);
  width: 70px;
  height: 70px;
  border-radius: 50%;
  background: white;
  border: 8px solid rgba(255, 255, 255, 0.3);
  z-index: 10005;
}
</style>