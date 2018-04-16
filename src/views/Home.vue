<template>
  <div class="home">
      <Main />
  </div>
</template>

<script>
import Main from '../components/Main.vue';
export default {
  name: "home",
  components: {
    Main,
  }
};
</script>

<style lang="less" scoped>
    .home{
        width: 100vw;
        height: 100vh;
    }
</style>
