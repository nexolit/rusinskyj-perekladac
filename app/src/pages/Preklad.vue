<template>
<section class="section">
    <h1 class="title">Prekladanie</h1>
    <div class="control is-large" :class="{'is-loading': isRusynLoading}">
    	<textarea ref="rusyn_text" @change="rusyn_change" class="textarea is-large is-flex-direction-row mb-5" placeholder="Text v rusínčine" :readOnly="rusynIsDisabled"></textarea>
    </div>
    <div class="control is-large" :class="{'is-loading': isSlovakLoading}">
    	<textarea ref="slovak_text" @change="slovak_change" class="textarea is-large mb-5" placeholder="Text v slovenčine" :readOnly="slovakIsDisabled"></textarea>
    </div>
    <button class="button mr-5" @click="translate">Prelož</button>
</section>
</template>

<script setup>
import { ref } from 'vue';
import { translit } from 'translit-rue';
import axios from 'axios';

const API_URL = "https://api.rusyn.it"; // Change this to http://localhost:5000 for local usage

// http://jrgraphix.net/r/Unicode/0400-04FF
const cyrillicPattern = /^[\u0400-\u04FF]+$/;

const rusyn_text = ref(null);
const slovakIsDisabled = ref(false);
const slovak_text = ref(0);
const rusynIsDisabled = ref(null);

const isRusynLoading = ref(false);
const isSlovakLoading = ref(false);

let target_lang = "";
function rusyn_change() {
    console.log("changed")
    if(rusyn_text.value.value.trim() != '') {
        slovakIsDisabled.value = true;
        target_lang = "slovak";
    } else if(slovak_text.value.value.trim() != '') {
    	target_lang = "rusyn";
    	slovakIsDisabled.value = false;
    } else {
        slovakIsDisabled.value = false;
        target_lang = "";
    }
}

function slovak_change() {
    if(slovak_text.value.value.trim() != '') {
        rusynIsDisabled.value = true;
        target_lang = "rusyn";
    } else if(rusyn_text.value.value.trim() != '') {
    	target_lang = "slovak";
    	rusynIsDisabled.value = false;
    } else {
        rusynIsDisabled.value = false;
        target_lang = "";
    }
}

function translate() {
    if(target_lang == "slovak") {
        let translation_text = rusyn_text.value.value;
        //translit into Azbuka
        if(!cyrillicPattern.test(translation_text)) 
            translation_text = translit(translation_text, "latCyr");
        
	    isSlovakLoading.value = true;
        axios.get(API_URL + '/translate/rue/sk/' + translation_text)
        .then(function (response) {
            // handle success
            slovak_text.value.value = response.data;
        }).finally(() => isSlovakLoading.value = false);
    } else if(target_lang == "rusyn") {
        const translation_text = slovak_text.value.value;
        isRusynLoading.value = true;
        axios.get(API_URL + 'http://localhost:5000/translate/sk/rue/' + translation_text)
        .then(function (response) {
            // handle success
            rusyn_text.value.value = response.data;
        }).finally(() => isRusynLoading.value = false);
    }
}
</script>
