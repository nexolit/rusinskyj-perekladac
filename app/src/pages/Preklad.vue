<template>
  <ScannerWindow 
    v-if="showScanner" 
    @close="showScanner = false" 
    @useText="handleScannedText" 
  />
  <section class="section">
    <div class="container" style="max-width: 860px;">
      <h1 class="title is-size-2">Prekladanie</h1>
      <div class="rows">
        <div class="row">
          <div class="control is-large" :class="{'is-loading': isRusynLoading}">
            <div class="textarea-container">
              <textarea ref="rusyn_text" @input="onInput('rusyn')" class="textarea is-large" :class="{'is-danger': isRusynError}" placeholder="Text v rusínčine" :readOnly="rusynIsDisabled" rows="6"></textarea>
              <button class="toggle-button script-toggle-button" :title="rusynType === 'cyr' ? 'Cyrilica' : 'Latinka'" @click="toggleRusynScript">{{ rusynType === 'cyr' ? 'Д' : 'D' }}</button>
              <button class="toggle-button record-toggle-button icon" :class="isRecording ? 'red-background' : ''" @click="toggleRecording('rusyn')"><i :class="isRecording ? 'fa-circle-stop' : 'fa-microphone'" class="fas"></i></button>
              <button class="toggle-button camera-toggle-button icon" @click="openScanner('rusyn')"><i class="fas fa-camera"></i></button>
            </div>
          </div>
        </div>
        <button class="button mr-5 mt-3 mb-3 has-text-weight-extrabold" style="text-decoration: none;" @click="translate">&udhar;</button>
        <div class="row">
          <div class="control is-large" :class="{'is-loading': isSlovakLoading}">
            <textarea ref="slovak_text" @input="onInput('slovak')" class="textarea is-large" :class="{'is-danger': isSlovakError}" placeholder="Text v slovenčine" :readOnly="slovakIsDisabled" rows="6"></textarea>
            <button class="toggle-button record-toggle-button icon" :class="isRecording2 ? 'red-background' : ''" @click="toggleRecording('slovak')"><i :class="isRecording2 ? 'fa-circle-stop' : 'fa-microphone'" class="fas"></i></button>
            <button class="toggle-button camera-toggle-button icon" @click="openScanner('slovak')"><i class="fas fa-camera"></i></button>
          </div>
        </div>
      </div>
      <button class="button mr-5 mt-3 mb-3" @click="translate">Prelož</button>
      <div v-if="whisperStatus" class="notification is-info is-light mt-3">
        <p class="has-text-centered">{{ whisperStatus }}</p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.button {
    color: black;
    border: 7px solid black;
    text-decoration: underline;
    font-family: "Tiny5", sans-serif;
    font-size: x-large;
    background: none;
    cursor: pointer;
}
.textarea-container {
  position: relative;
}
.toggle-button {
  position: absolute;
  border: none;
  background: #f0f0f0;
  padding: 6px 8px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 700;
  box-shadow: 0 1px 3px rgba(0,0,0,0.12);
  width: 32px;
  height: 32px;
}
.red-background{
  background: rgb(255, 90, 90);
  color: white !important;
}
.script-toggle-button {
  top: 8px;
  right: 8px;
}
.record-toggle-button {
  bottom: 8px;
  right: 8px;
}
.camera-toggle-button {
  bottom: 8px;
  right: 48px;
}
</style>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { translit } from 'translit-rue';
import axios from 'axios';
import ScannerWindow from './ImageRecognitionModule.vue';

const showScanner = ref(false);
const scannerTarget = ref('rusyn'); // Track which field the scanner is for
const route = useRoute();

const openScanner = (target) => {
  scannerTarget.value = target;
  showScanner.value = true;
};

const handleScannedText = (text) => {
  // Put scanned text in the appropriate field
  if (scannerTarget.value === 'rusyn') {
    if (rusyn_text.value) rusyn_text.value.value = text;
    target_lang = 'slovak'; // Source is Rusyn, translate to Slovak
    slovakIsDisabled.value = true;
    rusynIsDisabled.value = false;
  } else {
    if (slovak_text.value) slovak_text.value.value = text;
    target_lang = 'rusyn'; // Source is Slovak, translate to Rusyn
    rusynIsDisabled.value = true;
    slovakIsDisabled.value = false;
  }
  showScanner.value = false;
  
  // Automatically translate the scanned text
  setTimeout(() => translate(), 100);
};

onMounted(() => {
  if (route.query.text && rusyn_text.value) {
    rusyn_text.value.value = route.query.text;
    slovakIsDisabled.value = true;
    target_lang = 'slovak';
  }
  initWhisper();
});

const API_URL = "https://api.rusyn.it";

const cyrillicPattern = /[\u0400-\u04FF]/;

const rusyn_text = ref(null);
const slovakIsDisabled = ref(false);
const slovak_text = ref(null);
const rusynIsDisabled = ref(false);

const isRusynLoading = ref(false);
const isSlovakLoading = ref(false);

const isRusynError = ref(false);
const isSlovakError = ref(false);

const rusynType = ref('cyr');

// Voice recognition state
const isRecording = ref(false);
const isRecording2 = ref(false);
const whisperStatus = ref('');
const whisperPipeline = ref(null);
const mediaRecorder = ref(null);
const audioChunks = ref([]);
const activeRecordingTarget = ref(null);

const isCyrillic = (t) => cyrillicPattern.test(t);
const isLatin = (t) => /[A-Za-z\u00C0-\u017F]/.test(t);

function toggleRusynScript() {
  const newScript = rusynType.value === 'cyr' ? 'lat' : 'cyr';
  const val = rusyn_text.value?.value || '';
  rusynType.value = newScript;
  if (!val.trim()) return;
  if (newScript === 'lat') {
    if (isCyrillic(val)) rusyn_text.value.value = translit(val, 'cyrLat');
  } else {
    if (isLatin(val)) rusyn_text.value.value = translit(val, 'latCyr');
  }
}

let target_lang = "";
function onInput(origin) {
  const r = rusyn_text.value?.value || '';
  const s = slovak_text.value?.value || '';
  const val = origin === 'rusyn' ? r : s;

  if (!val.trim()) {
    if (origin === 'rusyn') {
      if (s.trim()) {
        if (isCyrillic(s)) {
          target_lang = 'slovak';
          slovakIsDisabled.value = true;
          rusynIsDisabled.value = false;
        } else {
          target_lang = 'rusyn';
          rusynIsDisabled.value = true;
          slovakIsDisabled.value = false;
        }
      } else {
        rusynIsDisabled.value = false;
        slovakIsDisabled.value = false;
        target_lang = '';
      }
    } else {
      if (r.trim()) {
        if (isCyrillic(r)) {
          target_lang = 'slovak';
          slovakIsDisabled.value = true;
          rusynIsDisabled.value = false;
        } else {
          target_lang = 'rusyn';
          rusynIsDisabled.value = true;
          slovakIsDisabled.value = false;
        }
      } else {
        rusynIsDisabled.value = false;
        slovakIsDisabled.value = false;
        target_lang = '';
      }
    }
    return;
  }

  if (isCyrillic(val)) {
    target_lang = 'slovak';
    slovakIsDisabled.value = true;
    rusynIsDisabled.value = false;
  } else {
    if (origin === 'slovak') {
      target_lang = 'rusyn';
      rusynIsDisabled.value = true;
      slovakIsDisabled.value = false;
    } else {
      target_lang = 'slovak';
      slovakIsDisabled.value = true;
      rusynIsDisabled.value = false;
    }
  }
}

function translate() {
    isSlovakError.value = false;
    isRusynError.value = false;

    if(target_lang == "slovak") {
      if (slovak_text.value) slovak_text.value.value = "";
      let translation_text = rusyn_text.value?.value || '';
      if(!isCyrillic(translation_text)) 
        translation_text = translit(translation_text, "latCyr");
        
      isSlovakLoading.value = true;
      axios.get(API_URL + '/translate/rue/sk/' + translation_text)
      .catch(function (error) {
        if (slovak_text.value) slovak_text.value.value = error.message;
        isSlovakError.value = true;
      })
      .then(function (response) {
        if (slovak_text.value) slovak_text.value.value = response.data;
      }).finally(() => isSlovakLoading.value = false);
    } else if(target_lang == "rusyn") {
      if (rusyn_text.value) rusyn_text.value.value = "";
      const translation_text = slovak_text.value?.value || '';
      isRusynLoading.value = true;
      axios.get(API_URL + '/translate/sk/rue/' + translation_text)
      .catch(function (error) {
        if (rusyn_text.value) rusyn_text.value.value = error.message;
        isRusynError.value = true;
      })
      .then(function (response) {
        if (rusyn_text.value) rusyn_text.value.value = response.data;
      }).finally(() => isRusynLoading.value = false);
    }
}

// Whisper.js Voice Recognition
async function initWhisper() {
  try {
    whisperStatus.value = 'Načítavam Whisper model...';
    const { pipeline, env } = await import('@xenova/transformers');
    
    env.allowLocalModels = false;
    env.useBrowserCache = true;
    
    whisperPipeline.value = await pipeline('automatic-speech-recognition', 'Xenova/whisper-tiny');
    whisperStatus.value = '';
  } catch (e) {
    console.error('Failed to load Whisper:', e);
    whisperStatus.value = 'Chyba pri načítavaní Whisper modelu';
  }
}

async function toggleRecording(target) {
  if (target === 'rusyn') {
    if (isRecording.value) {
      stopRecording();
    } else {
      startRecording('rusyn');
    }
  } else {
    if (isRecording2.value) {
      stopRecording();
    } else {
      startRecording('slovak');
    }
  }
}

async function startRecording(target) {
  if (!whisperPipeline.value) {
    whisperStatus.value = 'Whisper model ešte nie je načítaný...';
    return;
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    
    activeRecordingTarget.value = target;
    audioChunks.value = [];
    
    mediaRecorder.value = new MediaRecorder(stream);
    
    mediaRecorder.value.ondataavailable = (event) => {
      audioChunks.value.push(event.data);
    };
    
    mediaRecorder.value.onstop = async () => {
      const audioBlob = new Blob(audioChunks.value, { type: 'audio/webm' });
      
      try {
        whisperStatus.value = 'Spracúvam reč...';
        
        const audioContext = new AudioContext({ sampleRate: 16000 });
        const arrayBuffer = await audioBlob.arrayBuffer();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        
        const result = await whisperPipeline.value(audioBuffer, {
          chunk_length_s: 30,
          stride_length_s: 5
        });
        
        const transcript = result.text?.trim() || '';
        
        if (transcript) {
          if (activeRecordingTarget.value === 'rusyn') {
            if (rusyn_text.value) {
              rusyn_text.value.value = rusyn_text.value.value ? rusyn_text.value.value + '\n' + transcript : transcript;
            }
          } else {
            if (slovak_text.value) {
              slovak_text.value.value = slovak_text.value.value ? slovak_text.value.value + '\n' + transcript : transcript;
            }
          }
        }
        
        whisperStatus.value = '';
      } catch (e) {
        console.error('Speech recognition failed:', e);
        whisperStatus.value = 'Chyba pri rozpoznávaní reči';
      }
      
      stream.getTracks().forEach(track => track.stop());
    };
    
    mediaRecorder.value.start();
    
    if (target === 'rusyn') {
      isRecording.value = true;
      isRecording2.value = false;
    } else {
      isRecording2.value = true;
      isRecording.value = false;
    }
    
  } catch (e) {
    console.error('Failed to access microphone:', e);
    if (e.name === 'NotAllowedError') {
      whisperStatus.value = 'Prístup k mikrofónu bol zamietnutý';
    } else {
      whisperStatus.value = 'Chyba: ' + e.message;
    }
  }
}

function stopRecording() {
  if (mediaRecorder.value && mediaRecorder.value.state !== 'inactive') {
    mediaRecorder.value.stop();
  }
  isRecording.value = false;
  isRecording2.value = false;
  activeRecordingTarget.value = null;
}

// Watch for recording state changes to stop recording when toggled off
watch([isRecording, isRecording2], ([newRusyn, newSlovak], [oldRusyn, oldSlovak]) => {
  if (oldRusyn && !newRusyn && mediaRecorder.value) {
    stopRecording();
  }
  if (oldSlovak && !newSlovak && mediaRecorder.value) {
    stopRecording();
  }
});
</script>