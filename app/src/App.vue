<script setup>
import banner from './assets/ui/banner.bmp';
import footer from './assets/ui/footer.bmp';
</script>

<template>
<header>
    <img :src="banner" alt="Nápis Rusínsky prekladač s tradičným folkórnym vzorom">
    <nav>
        <router-link class="link px-2 py-2 mx-5" to="/">Domov</router-link>
        <router-link class="link px-2 py-2 mx-5" to="/preklad">Preklad</router-link>
    </nav>
</header>
<main>
    <router-view />
</main>
<footer>
    <img :src="footer" alt="Tradičný folklórny vzor" type="image/bmp">
</footer>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Tiny5&display=swap');

.link {
    color: black;
    text-decoration: underline;
    font-family: "Tiny5", sans-serif;
    font-size: x-large;
    border: 7px solid rgb(0, 0, 0, 0);
}
.link:hover {
    border: 7px solid black;
}
nav {
    position: absolute;
    top: 2vh;
    right: 6vw;
}
footer img {
    position: absolute;
    bottom: 0;
}
</style>
<script>
export default {

}
</script>
