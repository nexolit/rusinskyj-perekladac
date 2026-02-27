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
  <h1 class="title center is-size-2">Preložte rusínske texty ihneď!</h1>
  <section class="section columns is-vcentered is-variable is-8">
    <div class="control is-large">
      <textarea
        v-model="text"
        class="textarea is-large mb-4"
        placeholder="Zadajte text v rusínčine alebo slovenčine"
        rows="10"
        cols="30"
      ></textarea>
    </div>
    <section class="section rows">
      <p class="subtitle" style="max-width: 400px;">Zadajte akýkoľvek text v rusínskom alebo slovenskom jazyku a nechajte si ho preložiť do opačného jazyka alebo transliterujte do opačnej abecedy.</p>
      <button class="link px-2 py-2 mx-5" @click="goToTranslate">Preklad</button>
    </section>
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
</style>