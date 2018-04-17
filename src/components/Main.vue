<template>
    <div class="main">
        <canvas ref="canvas" class="canvas"></canvas>
    </div>
</template>

<script>
    import ImgBack from '../assets/back.jpg';
    export default {
        name: "Main",

        /** 以下为数据 **/
        data: () => ({
            ctx: null,
            dpi: 1,
            back: null,
            ImgBack,
            isiOS: navigator.userAgent.indexOf('iPhone') > -1, // ios终端
            isIpad: navigator.userAgent.indexOf('iPad') > -1,  // ipad特殊处理
            isAndroid: navigator.userAgent.indexOf('Android') > -1 || navigator.userAgent.indexOf('Adr') > -1, // android终端
            phone: navigator.userAgent.match(/(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i),    // 是否是移动端
            width: 0,
            height: 0,
            stars: [],  // 所有的星星对象
        }),
        props: {
        },
        components:{
        },
        /** 以下为生命周期 **/
        mounted() {
            this.ctx = this.$refs.canvas.getContext('2d');
            this.ctx.fillStyle = '#222222';
            this.dpi = this.getDpi();
            this.width = this.$refs.canvas.clientWidth * this.dpi;
            this.height = this.$refs.canvas.clientHeight * this.dpi;
            this.$refs.canvas.width = this.width;
            this.$refs.canvas.height = this.height;
            window.addEventListener("resize", this.resize, false);
            this.initStar(2000);
            this.animate();

        },
        beforeUpdate(){

        },
        beforeDestroy(){

        },

        /** 以下为计算属性和方法等 **/
        computed: {

        },
        methods: {
            /**
             *  窗口大小改变后重置canvas的像素比
             */
            resize() {
                this.width = this.$refs.canvas.clientWidth * this.dpi;
                this.height = this.$refs.canvas.clientHeight * this.dpi;
                this.$refs.canvas.width = this.width;
                this.$refs.canvas.height = this.height;
            },
            /**
             *  初始化星星对象
             *  构造星星纹理
             * @param num 绘制多少颗星星
             */
            initStar(num) {
                /** 星星纹理 **/
                const c = document.createElement('canvas');
                const ctx = c.getContext('2d');
                c.width = 32;
                c.height = 32;
                c.style.width = '32px';
                c.style.height = '32px';
                const gradient = ctx.createRadialGradient(c.width/2,c.height/2,0,c.width/2,c.height/2,c.width/2);//创建放射状渐变
                gradient.addColorStop(0,'rgba(255,255,255,1)');
                gradient.addColorStop(0.2,'rgba(0,255,255,1)');
                gradient.addColorStop(0.4,'rgba(0,0,164,1)');
                gradient.addColorStop(1,'transparent');
                ctx.fillStyle = gradient;
                ctx.fillRect(0,0,c.width,c.height);	//画矩形

                const stars = [];

                for(let i=0; i<num; i++) {
                    let s;
                    let b;
                    b = Math.max((i/num)**2*16, 3);  // 星星大小（宽高）
                    s = Math.max(i**1.2/num * 10,0.4);  // 星星速度

                    stars.push({
                        dom: c,
                        x: this.random(-128, this.width+128),
                        y: this.random(0, this.height),
                        s,
                        b,
                    });
                }
                this.stars = stars;

                /** 背景 **/
                const back = document.createElement('img');
                back.src=this.ImgBack;
                this.back = back;
            },
            /**
             * 基础星星移动动画
             */
            drawStars() {
                const max = this.width + 32;
                // this.ctx.fillRect(0,0, this.width, this.height);
                this.ctx.drawImage(this.back,0,0,this.width,this.height);
                for(let i=0; this.stars[i]; i++) {
                    const d = this.stars[i];
                    this.ctx.drawImage(d.dom, d.x, d.y, d.b, d.b);
                    d.x += d.s/4;
                    if(d.x > max) {
                        d.x = -128;
                        d.y = this.random(0, this.height);
                    }
                }
            },
            /**
             * 主动画
             * */
            animate() {
                requestAnimationFrame(this.animate);
                this.drawStars();
            },
            /**
             * 工具 - 范围随机数
             * */
            random(min, max) {
              return (Math.random() * (max - min) + min) << 0;
            },
            /**
             * 工具 - 获取屏幕dpi
             */
            getDpi() {
                const devicePixelRatio = window.devicePixelRatio || 1;
                const backingStorePixelRatio = this.ctx.webkitBackingStorePixelRatio ||
                    this.ctx.mozBackingStorePixelRatio ||
                    this.ctx.msBackingStorePixelRatio ||
                    this.ctx.oBackingStorePixelRatio ||
                    this.ctx.backingStorePixelRatio || 1;
                if (this.isAndroid || this.isIpad || !this.phone) {
                    return devicePixelRatio / backingStorePixelRatio;
                } else {
                    return devicePixelRatio / backingStorePixelRatio * 2;
                }
            }
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
