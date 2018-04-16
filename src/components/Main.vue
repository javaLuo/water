<template>
    <div class="main">
        <canvas ref="canvas" class="canvas"></canvas>
    </div>
</template>

<script>
    export default {
        name: "Main",

        /** 以下为数据 **/
        data: () => ({
            ctx: null,
            width: 0,
            height: 0,
        }),
        props: {
        },

        /** 以下为生命周期 **/
        mounted() {
            console.log('what:',this.$refs.canvas);
            this.ctx = this.$refs.canvas.getContext('2d');
            console.log({d: this.$refs.canvas});
            this.width = this.$refs.canvas.clientWidth;
            this.height = this.$refs.canvas.clientHeight;
            window.addEventListener("resize", this.resize, false);
        },
        beforeUpdate(){

        },
        beforeDestroy(){

        },

        /** 以下为计算属性和方法等 **/
        computed: {

        },
        methods: {
            // 窗口大小改变后重置canvas的像素比
            resize() {
                this.width = this.$refs.canvas.clientWidth;
                this.height = this.$refs.canvas.clientHeight;
                this.$refs.canvas.width = this.width;
                this.$refs.canvas.height = this.height;
            },
        },
        watch: {

        }
    };
</script>

<style scoped lang="less">
    .main{
        width: 100vw;
        height: 100vh;
        .canvas{
            display: block;
            width: 100%;
            height: 100%;
        }
    }
</style>
