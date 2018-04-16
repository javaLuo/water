<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<style lang="less">
*{
    -webkit-overflow-scrolling: touch;			/* 允许独立滚动区域，解决IOS上的非body元素滚动条滚动时卡顿 */
    -webkit-tap-highlight-color: transparent;	/* 覆盖IOS上用户点击连接时的默认高亮颜色 */
    -webkit-touch-callout:none;					/* 禁用系统默认菜单，相当于禁用右键菜单 */
    outline: none;
}
body {
    padding:0;
    margin:0;
    background-color:#222;
}
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
</style>
