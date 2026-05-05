<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const icon = new URL('../assets/icons/icon-512.png', import.meta.url).href;
const router = useRouter();
const text = ref('');

function goToTranslate() {
  router.push({ path: '/preklad', query: { text: text.value } });
}
</script>

<template>
<section class="section is-flex is-flex-direction-column is-align-items-center">
  <h1 class="title center is-size-2">Preložte rusínčinu ihneď!</h1>
  <section class="section columns is-variable is-8 is-multiline">
    <div class="column is-full-mobile is-half-tablet is-half-desktop">
      <div class="control is-large">
        <textarea
          v-model="text"
          class="textarea is-large mb-4"
          placeholder="Zadajte text v rusínčine"
        ></textarea>
      </div>
    </div>
    <div class="column is-full-mobile is-half-tablet is-half-desktop is-flex is-flex-direction-column is-justify-content-flex-start is-align-items-flex-start">
      <p class="subtitle" style="max-width: 400px;">Zadajte akýkoľvek text v rusínskom jazyku, a nechajte si ho preložiť do slovenského jazyka alebo transliterujte do latinskej abecedy.</p>
      <button class="link px-2 py-2 mx-5" @click="goToTranslate">Preklad</button>
    </div>
  </section>
</section>
</template>

<style scoped>
.link {
  color: black;
  border: 7px solid black;
  text-decoration: underline;
  font-family: "Tiny5", sans-serif;
  font-size: x-large;
  background: none;
  cursor: pointer;
}
textarea {
  height: 300px;
  width: 100%;
}
@media (max-width: 600px) {
  textarea {
    height: 200px;
  }
  .column {
    padding: 0;
  }
}
</style>