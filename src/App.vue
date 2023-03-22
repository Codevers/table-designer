<template>
    <div id="app">
        <div>
            <el-button @click="openTableDesigner()">打开表格设计器</el-button>
        </div>
    </div>
</template>

<script>
export default {
    name: 'App',
    methods: {
        openTableDesigner() {
            this.$tableDesigner.open().then((res) => {
                console.log('response', res)
            })
        }
    }
}
</script>
<style>
#app {
    font-family: Avenir, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
    margin-top: 60px;
}
body{
    background: #f3f3f3;
}
</style>
