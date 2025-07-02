<script setup>
const icon = new URL('../assets/icons/icon-512.png', import.meta.url).href;
</script>

<template>
<section class="section is-flex is-flex-direction-column is-align-items-center">
    <h1 class="title center is-size-2">Rusínsky prekladač</h1>
    <section class="section is-flex is-flex-direction-row is-align-items-center is-justify-content-space-around">
        <img :src="icon" width="512px" alt="Logo Rusínského prekladača">
        <p class="is-size-4">
            Tento projekt vznikol ku výročiu 30. výročia kodifikácie Rusínského jazyka, <br>
            aby sa zachoval a neupadol do zabudnutia, <br>
            aby nezmizol z verejného povedomia, <br>
            a aby zostal súčasťou našej kultúrnej identity.
        </p>
    </section>
</section>
</template>