<template>
  <div id="app">
    <header>
      <nav>
        <router-link to="/">確率分布</router-link> |
        <router-link to="/range-equity">レンジvsレンジ</router-link>
      </nav>
    </header>
    <main>
      <router-view></router-view>
    </main>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'App'
})
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}

header {
  background-color: #f8f9fa;
  padding: 15px 0;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

nav {
  text-align: center;
}

nav a {
  font-weight: bold;
  color: #2c3e50;
  text-decoration: none;
  margin: 0 10px;
  padding: 5px 10px;
  border-radius: 4px;
}

nav a.router-link-exact-active {
  color: #42b983;
  background-color: #eaf5f0;
}

main {
  max-width: 1000px;
  margin: 0 auto;
}
</style> 
