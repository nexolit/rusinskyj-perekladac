<template>
  <section class="section">
    <div class="container" style="max-width: 860px;">
      <h1 class="title is-size-2">Prekladanie</h1>
      <div class="rows">
        <div class="row">
          <div class="control is-large" :class="{'is-loading': isRusynLoading}">
            <div class="textarea-container">
              <textarea ref="rusyn_text" @input="onInput('rusyn')" class="textarea is-large" :class="{'is-danger': isRusynError}" placeholder="Text v rusínčine" :readOnly="rusynIsDisabled" rows="6"></textarea>
              <button class="toggle-button script-toggle-button" :title="rusynType === 'cyr' ? 'Cyrilica' : 'Latinka'" @click="toggleRusynScript">{{ rusynType === 'cyr' ? 'Д' : 'D' }}</button>
              <button class="toggle-button record-toggle-button icon" :title="rusynType === 'cyr' ? 'Cyrilica' : 'Latinka'" @click="toggleRusynScript"><i class="fas fa-microphone"></i></button>
              <button class="toggle-button camera-toggle-button icon" :title="rusynType === 'cyr' ? 'Cyrilica' : 'Latinka'" @click="toggleRusynScript"><i class="fas fa-camera"></i></button>
            </div>
          </div>
        </div>
        <button class="button mr-5 mt-3 mb-3" @click="translate">Vymeň(Ikonka)</button>
        <div class="row">
          <div class="control is-large" :class="{'is-loading': isSlovakLoading}">
            <textarea ref="slovak_text" @input="onInput('slovak')" class="textarea is-large" :class="{'is-danger': isSlovakError}" placeholder="Text v slovenčine" :readOnly="slovakIsDisabled" rows="6"></textarea>
          </div>
        </div>
      </div>
      <button class="button mr-5 mt-3 mb-3" @click="translate">Prelož</button>
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
.script-toggle {
  display: inline-flex;
  background: #f0f0f0;
  border-radius: 8px;
  padding: 3px;
  gap: 2px;
}

.toggle-btn {
  border: none;
  background: transparent;
  border-radius: 6px;
  padding: 4px 12px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  color: #888;
  transition: all 0.18s ease;
}

.toggle-btn.active {
  background: white;
  color: #111;
  box-shadow: 0 1px 4px rgba(0,0,0,0.15);
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
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { translit } from 'translit-rue';
import axios from 'axios';

const route = useRoute();

onMounted(() => {
  if (route.query.text && rusyn_text.value) {
    rusyn_text.value.value = route.query.text;
    slovakIsDisabled.value = true;
    target_lang = "slovak";
  }
});

const API_URL = "https://api.rusyn.it"; // Change this to http://localhost:5000 for local usage

// http://jrgraphix.net/r/Unicode/0400-04FF
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
    // if current emptied, decide based on other textarea
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

  // If there's content, use isCyrillic to decide. If origin is rusyn and no Cyrillic assume rusyn latin.
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
      // rusyn origin but latin chars -> still rusyn input
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
      //translit into Azbuka
      if(!isCyrillic(translation_text)) 
        translation_text = translit(translation_text, "latCyr");
        
    	isSlovakLoading.value = true;
      axios.get(API_URL + '/translate/rue/sk/' + translation_text)
      .catch(function (error) {
        //handle error
        if (slovak_text.value) slovak_text.value.value = error.message;
        isSlovakError.value = true;
      })
      .then(function (response) {
        // handle success
        if (slovak_text.value) slovak_text.value.value = response.data;
      }).finally(() => isSlovakLoading.value = false);
    } else if(target_lang == "rusyn") {
      if (rusyn_text.value) rusyn_text.value.value = "";
      const translation_text = slovak_text.value?.value || '';
      isRusynLoading.value = true;
      axios.get(API_URL + '/translate/sk/rue/' + translation_text)
      .catch(function (error) {
        //handle error
        if (rusyn_text.value) rusyn_text.value.value = error.message;
        isRusynError.value = true;
      })
      .then(function (response) {
        // handle success
        if (rusyn_text.value) rusyn_text.value.value = response.data;
      }).finally(() => isRusynLoading.value = false);
    }
}
</script>
