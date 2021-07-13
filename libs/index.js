/** 页面逻辑相关参数 **/
const users = [
  { n: "Logic", s: 10 },
  { n: "士大夫", w: "大赞", s: 5 },
  { n: "Citrus", s: 2 },
  { n: "温度℃", s: 1 },
  { n: "Hodor", s: 10.24 },
  { n: "企鹅丫丫AVON", s: 1 },
  {
    n: "太苦特级方糖",
    w: "希望捐给猫猫",
    s: 1,
  },
  { n: "天将明", w: "探索未知", s: 5 },
  { n: "王宇晗", s: 1 },
  { n: "leooo", s: 0.1 },
  { n: "~科24~", s: 0.01 },
  {
    n: ["libs/imgs/users/niu.png"],
    s: 1,
  },
  { n: "moleQ", w: "我又来了", s: 1.01 },
  { n: ["西瓜丸子", "libs/imgs/users/xigua.png"], s: 1 },
  { n: "呐-是小中", w: "66", s: 0.01 },
  { n: "卡斯特梅的雨", s: 20 },
  { n: "氕氘氚", s: 1 },
  { n: "真羽", s: 1 },
  { n: "veer", s: 0.01 },
  {
    n: "浮生六记",
    w: "ETO成员前来报告",
    s: 1,
  },
  { n: "Z", w: "Hala Madrid", s: 1 },
  { n: "小张", s: 1 },
  { n: "小朋友真好吃", w: "么么哒", s: 0.1 },
  { n: "Alnitak", w: "THE WARTERDROP", s: 10.24 },
  { n: "HK", s: 10.25 },
  { n: "Z", w: "现实与幻想并存", s: 1 },
  { n: "希望重燃.", s: 10 },
  { n: "今天明天吃什么呢", w: "专升本复习完善成个人笔记最好", s: 5 },
  { n: "科捷智能科技-葛晋 Momiji", s: 66.6 },
  { n: "dragon.", w: "加油鸭", s: 0.01 },
  { n: "CoderWangx", w: "水滴很酷", s: 6.66 },
  { n: "Doggy", w: "太牛了woc", s: 1 },
  { n: "Mr O'G桑", s: 1 },
  { n: "傅Fu", w: "需要批发二向箔", s: 3 },
  { n: "我的网名十二个字不信你数", s: 5 },
];
let loadingCount = 3; // 总共有多少资源需要加载
let loadingPercent = 0; // 当前加载进度
let showType = 0; // 当前在哪个阶段
let animeObj = {
  shipSpeed: 100, // 当前飞船速度，加载百分比
  star_speed: -0.15, // 星空速度
};
const speedDom = document.getElementById("speed"); // 显示速度的DOM，多次要用
let musicPlaying = false; // 音乐是否正在播放中
let musicNum = 0; // 当前播放的哪一首歌曲

/** THREE相关参数 **/
let scene; // 场景
let camera; // 相机
let renderer; // 渲染器
let cameraControls; // 镜头控制器
let cubeCamera1; // 六面体相机1 模拟镜面
let cubeCamera2; // 六面体相机2 模拟镜面
let cubeMeterial; // 六面体相机材质 模拟镜面

let water_mesh; // 飞船主体模型
let cone_texture; // 光锥纹理贴图
let cone_group; // 光锥集合0
let cone_group1; // 光锥集合1
let cone_group2; // 光锥集合2

let cloud; // 低速星空1
let cloud2; // 低速星空2
let lineMesh; // 高速星空1
let lineMesh2; // 高速星空2

let tunnel; // 高速时空隧道
let tunnel_texture; // 高速时空隧道纹理

let skybox; // 天空盒
let skybox_texture; // 天空盒纹理 6张图

let ship_line; // 蓝色实线材质
let ship_red_line; // 红色实线材质
let line1_mesh; // 前 - 蓝色 - 实线 - 中圈
let line2_mesh; // 前 - 蓝色 - 实线 - 大圈
let line3_mesh; // 后 - 蓝色 - 实线 - 小圈
let q4_mesh; // 前 - 红色 - 虚线 - 小圈
let q5_mesh; // 后 - 红色 - 虚线 - 小圈
let dash1_mesh; // 前 - 蓝色 - 虚线 - 中圈
let line_group; // 3个红色三角形组

let composer; // 后期处理器
let effectFXAA; // 抗锯齿着色器
let raycaster; // 射线
let mouse; // 鼠标位置
let labelRenderer; // 2D标签渲染器
let title2d; // 2D标签 - 头部标题
let label2d; // 2D标签 - 右侧说明
let outlinePass; // 外边框

/** 初始化三要素 **/
function init3boss() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1500);
  renderer = new THREE.WebGLRenderer();

  camera.position.set(-10, 0, -50);
  camera.lookAt(new THREE.Vector3(0, 0, 0));
  renderer.setSize(window.innerWidth, window.innerHeight, true);
  renderer.setClearColor(0x000000);
  renderer.checkShaderErrors = false;
  document.getElementById("canvas-box").appendChild(renderer.domElement);
}

/** 初始化镜头控制器 **/
function initCameraControl() {
  cameraControls = new THREE.OrbitControls(camera, document.getElementById("canvas-box"));
  cameraControls.target.set(0, 0, 0);
  cameraControls.maxDistance = 100;
  cameraControls.minDistance = 40;
  cameraControls.enableKeys = false;
  cameraControls.enablePan = false;
  cameraControls.enabled = false; // 先禁用
  cameraControls.update();
}

/** 初始化两个六面体相机 为了模拟镜面做准备 **/
function initCubeCameras() {
  cubeCamera1 = new THREE.CubeCamera(1, 1500, 256);
  cubeCamera1.renderTarget.texture.minFilter = THREE.LinearMipMapLinearFilter;
  cubeCamera1.position.x = 1;
  scene.add(cubeCamera1);
  cubeCamera2 = new THREE.CubeCamera(1, 1500, 256);
  cubeCamera2.renderTarget.texture.minFilter = THREE.LinearMipMapLinearFilter;
  cubeCamera2.position.x = 1;
  scene.add(cubeCamera2);
  // 通过相机的画面作为贴图
  cubeMeterial = new THREE.MeshBasicMaterial({
    envMap: cubeCamera2.renderTarget.texture,
  });
}

/** 创建水滴探测器Obj 以及上面的光锥**/
function initWaterShip() {
  const points = [];
  const lang = 41;
  for (let i = 0; i < lang; i += 0.005) {
    if (i < 1) {
      const y = Deri.start(i);
      points.push(new THREE.Vector2(y, i));
    } else if ((i * 1000).toFixed(2) % 2) {
      const y = Deri.start(i);
      points.push(new THREE.Vector2(y, i));
      i += 0.03;
    }
  }

  const water_m = new THREE.LatheBufferGeometry(points, 20);
  water_mesh = new THREE.Mesh(water_m, cubeMeterial);
  water_mesh.rotation.set(0, 0, Math.PI / 2);
  water_mesh.position.x = 15;

  cone_group = new THREE.Group();

  for (let i = 100; i < points.length - 100; i += 100) {
    const p = createCone(points[i]);
    p.plane1.scale.set(0.01, 0.01, 0.01);
    p.plane2.scale.set(0.01, 0.01, 0.01);
    cone_group.add(p.plane1);
    cone_group.add(p.plane2);
  }

  cone_group1 = cone_group.clone();
  cone_group2 = cone_group.clone();
  cone_group1.rotation.y = (Math.PI / 180) * 120;
  cone_group2.rotation.y = (Math.PI / 180) * -120;

  water_mesh.add(cone_group);
  water_mesh.add(cone_group1);
  water_mesh.add(cone_group2);

  scene.add(water_mesh);
}

/** 生成单个光锥方法 **/
function createCone(position) {
  const material = new THREE.MeshBasicMaterial({
    // 基本材质
    map: cone_texture,
    transparent: true,
    depthTest: true,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
  });
  const height = 1.8;
  const width = 0.5;
  const geometry = new THREE.PlaneGeometry(width, height);

  const plane1 = new THREE.Mesh(geometry, material);
  plane1.rotation.z = (Math.PI / 180) * 90;
  plane1.position.y = height * 100;

  const plane2 = plane1.clone();
  plane2.rotation.x = (Math.PI / 180) * 90;

  plane1.position.copy(new THREE.Vector3(position.x + height / 2, position.y, 0));
  plane2.position.copy(new THREE.Vector3(position.x + height / 2, position.y, 0));

  return { plane1: plane1, plane2: plane2 };
}

/** 慢速星空 - 创建star纹理 **/
function makeStarTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 16;
  canvas.height = 16;
  const pen = canvas.getContext("2d");
  const gradient = pen.createRadialGradient(canvas.width / 2, canvas.height / 2, 0, canvas.width / 2, canvas.height / 2, canvas.width / 2);
  gradient.addColorStop(0, "rgba(255,255,255,1)");
  gradient.addColorStop(0.2, "rgba(0,255,255,1)");
  gradient.addColorStop(0.4, "rgba(0,0,164,1)");
  gradient.addColorStop(1, "rgba(0,0,0,1)");
  pen.fillStyle = gradient; //将笔触填充色设置为这个渐变放射状
  pen.fillRect(0, 0, canvas.width, canvas.height); //画矩形
  const texture = new THREE.Texture(canvas); //生成贴图对象（参数是图片或canvas画布）
  texture.needsUpdate = true; //将这个对象缓存到GPU
  return texture;
}

/** 星空 - 创建星空粒子系统 低速星空和高速星空**/
function initStarSky() {
  /** 低速星空 **/
  //粒子材质
  const material1 = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 3,
    transparent: true,
    blending: THREE.AdditiveBlending,
    map: makeStarTexture(),
  });

  const geom = new THREE.Geometry();
  const range = 700; // 横向范围
  const rangex = 2000; // 纵向范围
  const offset = 15; // 补偿，为了不碰到飞船
  const color = new THREE.Color(0x00ffcc);
  for (let i = 0; i < 8000; i++) {
    let y = Math.random() * range - range / 2;
    let z = Math.random() * range - range / 2;
    if (y < offset && z < offset && y > -offset && z > -offset) {
      const r = Math.random() * (range / 2 - offset) + offset;
      y = y > 0 ? y + r : y - r;
      z = z > 0 ? z + r : z - r;
    }

    const particle = new THREE.Vector3(Math.random() * rangex - rangex / 2, y, z);
    geom.vertices.push(particle);
    geom.colors.push(color);
  }

  // 创建粒子系统，相当于abc中的c
  cloud = new THREE.Points(geom, material1); //参数是形状和材质
  cloud2 = new THREE.Points(geom, material1); // 创建第2个

  cloud.sortParticles = true; //粒子重新排序
  cloud2.sortParticles = true;
  cloud2.position.x = 2000;
  scene.add(cloud);
  scene.add(cloud2);

  /** 高速星空 **/
  const geometry = new THREE.BufferGeometry();
  const points = [];
  /** 定义顶点 **/
  for (let i = 0; i < 1000; i++) {
    const x = Math.random() * 3000 - 1500;
    let y = Math.random() * 500 - 250;
    let z = Math.random() * 500 - 250;
    if (y < offset && z < offset && y > -offset && z > -offset) {
      const r = Math.random() * (250 - offset) + offset;
      y = y > 0 ? y + r : y - r;
      z = z > 0 ? z + r : z - r;
    }

    const lang = Math.random() * 100 + 200;
    points.push(x, y, z, x + lang, y, z);
  }

  geometry.addAttribute("position", new THREE.Float32BufferAttribute(points, 3)); // 设置顶点们

  const material2 = new THREE.LineBasicMaterial({
    color: 0x638daf,
    linewidth: 1,
    linecap: "square",
    linejoin: "bevel",
  });
  lineMesh = new THREE.LineSegments(geometry, material2);
  lineMesh2 = lineMesh.clone();
  lineMesh2.position.x = 3000;
  lineMesh.visible = false;
  lineMesh2.visible = false;
  scene.add(lineMesh);
  scene.add(lineMesh2);
}

/** 创建高速时空隧道 **/
function initTunne() {
  const tunnel_points = [];
  for (let i = 0; i <= 4; i += 1) {
    if (i === 0 || i === 4) {
      tunnel_points.push(new THREE.Vector3(1, 600 * i));
    }
    tunnel_points.push(new THREE.Vector3(100, 600 * i));
  }
  const tunnel_geometry = new THREE.LatheBufferGeometry(tunnel_points, 20);

  tunnel_texture.wrapT = tunnel_texture.wrapS = THREE.RepeatWrapping;
  tunnel_texture.repeat.set(6, 6);

  const tunnel_material = new THREE.MeshBasicMaterial({
    side: THREE.BackSide,
    transparent: true,
    alphaMap: tunnel_texture,
    color: 0x3333aa,
    opacity: 0.1,
  });

  tunnel = new THREE.Mesh(tunnel_geometry, tunnel_material);
  tunnel.rotation.z = (Math.PI / 180) * 90;
  tunnel.position.x = 1200;
  tunnel.visible = false;
  scene.add(tunnel);
}

/** 创建天空盒 **/
function initSkyBox() {
  const shader = THREE.ShaderLib["cube"];
  shader.uniforms["tCube"].value = skybox_texture;
  shader.uniforms["opacity"] = { value: 1 };
  const material = new THREE.ShaderMaterial({
    fragmentShader: shader.fragmentShader,
    vertexShader: shader.vertexShader,
    uniforms: shader.uniforms,
    transparent: false,
    depthWrite: false,
    side: THREE.BackSide,
  });

  skybox = new THREE.Mesh(new THREE.BoxGeometry(2000, 2000, 2000), material);
  scene.add(skybox);
}

/** 飞船附加物 **/
function initAppendage() {
  // 创建了一个圆圈的顶点坐标
  const ship_g = new THREE.Geometry();
  for (let j = 0; j < Math.PI * 2.01; j += (2 * Math.PI) / 180) {
    let v = new THREE.Vector3(Math.cos(j), Math.sin(j), 0);
    ship_g.vertices.push(v);
  }
  const line = new MeshLine();
  line.setGeometry(ship_g);

  // 蓝色实线材质 需要全局
  ship_line = new MeshLineMaterial({
    color: new THREE.Color(0x70c1b3),
    lineWidth: 0.05,
    transparent: true,
    opacity: 0,
    side: THREE.DoubleSide,
  });

  // 红色实线材质 需要全局
  ship_red_line = new MeshLineMaterial({
    color: new THREE.Color(0xff4308),
    transparent: true,
    opacity: 0,
    lineWidth: 0.1,
  });

  // 蓝色虚线材质
  const ship_dash = new MeshLineMaterial({
    color: new THREE.Color(0x70c1b3),
    lineWidth: 0.05,
    dashArray: 0.333,
    dashRatio: 0.666,
    opacity: 0,
    transparent: true,
    side: THREE.DoubleSide,
  });

  // 红色虚线材质
  const ship_red_dash = new MeshLineMaterial({
    color: new THREE.Color(0xff4308),
    dashArray: 0.5,
    dashRatio: 0.5,
    transparent: true,
    lineWidth: 0.05,
  });

  // 前 - 蓝色 - 实线 - 中圈
  line1_mesh = new THREE.Mesh(line.geometry, ship_line);
  line1_mesh.scale.set(0.01, 0.01, 0.01); // 3,3,3
  line1_mesh.rotation.y = (Math.PI / 180) * 90;
  line1_mesh.position.x = 10; // 20
  scene.add(line1_mesh);

  // 前 - 蓝色 - 实线 - 大圈
  line2_mesh = line1_mesh.clone();
  line2_mesh.scale.set(0.01, 0.01, 0.01); // 8,8,8
  line2_mesh.position.x = 10; // 17
  scene.add(line2_mesh);

  // 后 - 蓝色 - 实线 - 小圈
  line3_mesh = line1_mesh.clone();
  line3_mesh.scale.set(0.01, 0.01, 0.01); // 1.5,1.5,1.5
  line3_mesh.position.x = -13; // -33
  scene.add(line3_mesh);

  // 前 - 红色 - 虚线 - 小圈
  q4_mesh = new THREE.Mesh(line.geometry, ship_red_dash);
  q4_mesh.scale.set(0.01, 0.01, 0.01); // 1.5, 1.5, 1.5
  q4_mesh.rotation.y = (Math.PI / 180) * 90;
  q4_mesh.position.x = 6; // 16
  scene.add(q4_mesh);

  // 后 - 红色 - 虚线 - 小圈
  q5_mesh = q4_mesh.clone();
  q5_mesh.scale.set(0.01, 0.01, 0.01); // 1.3,1.3,1.3
  q5_mesh.position.x = -13.5; // -33.5
  scene.add(q5_mesh);

  // 前 - 蓝色 - 虚线 - 中圈
  dash1_mesh = new THREE.Mesh(line.geometry, ship_dash);
  dash1_mesh.scale.set(4, 4, 4); // 3.3, 3.3, 3.3
  dash1_mesh.rotation.y = (Math.PI / 180) * 90;
  dash1_mesh.position.x = 20;
  scene.add(dash1_mesh);

  /** 3个红色三角 **/
  const ship_line4_g = new THREE.Geometry();
  ship_line4_g.vertices.push(new THREE.Vector3(0, 7, 0));
  ship_line4_g.vertices.push(new THREE.Vector3(0, 5, 0));

  const line4 = new MeshLine();
  line4.setGeometry(ship_line4_g, function (p) {
    return 1 - p;
  });

  const line4_mesh = new THREE.Mesh(line4.geometry, ship_red_line);
  line4_mesh.position.set(17, 0, 0);

  const line5_mesh = line4_mesh.clone();
  const line6_mesh = line4_mesh.clone();

  line5_mesh.rotation.x = (Math.PI / 180) * 120;
  line6_mesh.rotation.x = (Math.PI / 180) * 240;

  line_group = new THREE.Group();
  line_group.add(line4_mesh);
  line_group.add(line5_mesh);
  line_group.add(line6_mesh);
  scene.add(line_group);
}

/** 初始化2D铭牌 **/
function init2dLabel() {
  // 顶部标签
  const label1Div = document.createElement("div");
  label1Div.className = "title2d";
  label1Div.id = "title2d";
  label1Div.innerHTML = '<div class="t pointernone">Waterdrop</div><div class="l1"></div><div class="l2"></div>';

  const label1 = new THREE.CSS2DObject(label1Div);
  label1.position.set(15, 15, 0); // 将其坐标设置为原点偏上
  water_mesh.add(label1);

  // 后部标签
  const label2Div = document.createElement("div");
  label2Div.className = "label2";
  label2Div.id = "label2";
  label2Div.innerHTML = '<p class="pointernone">这是2.0版本的"水滴"</p><p>配置了<i>曲率驱动引擎</i>及强互作用力外壳</p><p>由半人马星座α星系朝着太阳系行进</p><p>约<i>4个地球年</i>后抵达</p><p>哈勃望远镜已能捕获其图像</p>';
  const label2 = new THREE.CSS2DObject(label2Div);
  label2.position.set(10, 50, 0);
  water_mesh.add(label2);
}

/** 初始化所有后处理特效 **/
function initComposer() {
  /** 铭牌渲染器 **/
  labelRenderer = new THREE.CSS2DRenderer();
  labelRenderer.setSize(window.innerWidth, window.innerHeight);
  labelRenderer.domElement.style.position = "absolute";
  labelRenderer.domElement.style.top = 0;
  document.getElementById("canvas-box").appendChild(labelRenderer.domElement);

  /** 后处理 - 后期渲染器 **/
  composer = new THREE.EffectComposer(renderer);
  var renderPass = new THREE.RenderPass(scene, camera);
  composer.addPass(renderPass);

  /** 后处理 - 外边框 **/
  outlinePass = new THREE.OutlinePass(new THREE.Vector2(window.innerWidth, window.innerHeight), scene, camera);
  outlinePass.edgeStrength = 0.1; // 0就看不见了
  outlinePass.edgeGlow = 1;
  outlinePass.edgeThickness = 3;
  outlinePass.selectedObjects = [water_mesh];
  composer.addPass(outlinePass);

  /** 后处理 - 抗锯齿 **/
  effectFXAA = new THREE.ShaderPass(THREE.FXAAShader);
  effectFXAA.uniforms["resolution"].value.set(1 / window.innerWidth, 1 / window.innerHeight);
  effectFXAA.renderToScreen = true;
  composer.addPass(effectFXAA);

  /** 后处理 - 屏幕闪动 **/
  glitchPass = new THREE.GlitchPass(1);
  glitchPass.renderToScreen = true;
  glitchPass.goWild = false;
}

/** 初始化射线相关 **/
function initRaycaster() {
  raycaster = new THREE.Raycaster();
  mouse = new THREE.Vector2(10000, 10000);
}

/** 鼠标移动记录位置 **/
function onMouseMove(e) {
  mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
}

function checkLoading() {
  loadingPercent += 1;
  speedDom.innerText = ((loadingPercent / loadingCount) * 100).toFixed(2);
  if (loadingPercent >= loadingCount) {
    init();
  }
}

/** 加载所有纹理和图片 **/
function initAllTexturesAndImgs() {
  const loader = new THREE.TextureLoader();
  const cubeLoader = new THREE.CubeTextureLoader();
  loader.load(
    "./libs/imgs/lightray_red.jpg",
    function (texture) {
      cone_texture = texture;
      checkLoading();
    },
    null,
    function (err) {
      console.log("光锥纹理加载失败", err);
    },
  );

  loader.load(
    "./libs/imgs/001_electric.jpg",
    function (texture) {
      tunnel_texture = texture;
      checkLoading();
    },
    null,
    function (err) {
      console.log("时空隧道纹理加载失败", err);
    },
  );

  cubeLoader.load(
    ["libs/imgs/skybox/posx.jpg", "libs/imgs/skybox/negx.jpg", "libs/imgs/skybox/posy.jpg", "libs/imgs/skybox/negy.jpg", "libs/imgs/skybox/posz.jpg", "libs/imgs/skybox/negz.jpg"],
    function (texture) {
      skybox_texture = texture;
      checkLoading();
    },
    null,
    function (err) {
      console.log("天空盒纹理加载失败", err);
    },
  );
}

/** 窗体大小改变时重置分辨率等参数 **/
function onResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
  labelRenderer.setSize(window.innerWidth, window.innerHeight);
  effectFXAA.uniforms["resolution"].value.set(1 / window.innerWidth, 1 / window.innerHeight);
}

/** animate动画相关 **/
let count = 0;
let hoverToDo = false; // 选中后，是否已经在执行霓虹灯效果
let noHoverToDo = false; // 非选中后，是否需要重置霓虹灯状态
let nowNum = 0; // 当前霓虹灯走到哪一个了
function animate() {
  requestAnimationFrame(animate);
  animate_basic();

  if (showType > 2) {
    // 第2阶段完毕后才开始射线
    animate_rayhover();
  }

  if (showType === 2) {
    TWEEN.update();
    if (animeObj.star_speed > -10) {
      animeObj.star_speed -= 0.02;
    }
  } else if (showType === 3) {
    if (animeObj.star_speed > -40) {
      // 初阶段加速
      animeObj.star_speed -= 0.08;
      tunnel.material.opacity += 0.001;
      outlinePass.edgeStrength += 0.005;
    } else {
      // 开始特效
      showType = 4;
      composer.addPass(glitchPass);
      skybox.visible = false;
      cloud.visible = false;
      cloud2.visible = false;
      lineMesh.visible = true;
      lineMesh2.visible = true;
      tunnel.material.opacity = 1;
      setTimeout(function () {
        showType = 5;
        glitchPass.renderToScreen = false;
        $("#ship-type-ul").css("transform", "translateY(-100px)");
        speedRipple();
      }, 400);
    }
    skybox.position.x -= 2;
    skybox.scale.x += 2;
  } else if (showType === 5) {
    if (outlinePass.edgeStrength > 0.05) {
      outlinePass.edgeStrength -= 0.01;
    } else {
      showType = 6;
    }
  }

  if (count % 2 === 0) {
    cubeMeterial.envMap = cubeCamera1.renderTarget.texture;
    cubeCamera2.update(renderer, scene);
  } else {
    cubeMeterial.envMap = cubeCamera2.renderTarget.texture;
    cubeCamera1.update(renderer, scene);
  }
  count++;
  count = count > 1000000 ? 1 : count;

  labelRenderer.render(scene, camera);
  if (showType === 6) {
    renderer.render(scene, camera);
  } else {
    composer.render();
  }
}

// 速度脉动
function speedRipple() {
  animeObj.shipSpeed = animeObj.shipSpeed > 1079252848.7 ? 1079252848.7 : 1079252848.8;
  speedDom.innerText = animeObj.shipSpeed.toFixed(2);
  setTimeout(speedRipple, Math.random() * 600 + 100);
}
// 基本运动
function animate_basic() {
  line_group.rotation.x += 0.01;
  dash1_mesh.rotation.x -= 0.01;
  cloud.position.x += animeObj.star_speed; // 低速星空速度
  cloud2.position.x += animeObj.star_speed;
  lineMesh.position.x -= 40;
  lineMesh2.position.x -= 40;
  q4_mesh.rotation.x -= 0.04;
  q5_mesh.rotation.x -= 0.04;
  tunnel_texture.offset.x += 0.01;
  tunnel_texture.offset.y -= 0.06;

  if (cloud.position.x <= -1500) {
    cloud.position.x = 2500;
  }
  if (cloud2.position.x <= -1500) {
    cloud2.position.x = 2500;
  }
  if (lineMesh.position.x <= -3000) {
    lineMesh.position.x = 3000;
  }
  if (lineMesh2.position.x <= -3000) {
    lineMesh2.position.x = 3000;
  }
}

// 射线hover效果处理
function animate_rayhover() {
  raycaster.setFromCamera(mouse, camera);
  if (raycaster.intersectObjects([water_mesh]).length) {
    // 被选中
    title2d && !title2d.hasClass("show") && title2d.addClass("show");
    label2d && !label2d.hasClass("show") && label2d.addClass("show");
    // 前面中圈
    if (line1_mesh.position.x < 20) {
      line1_mesh.position.x += 1;
    }
    if (line1_mesh.scale.x < 3) {
      const scale = line1_mesh.scale.x + 0.1;
      line1_mesh.scale.set(scale, scale, scale);
    }
    // 前面大圈
    if (line2_mesh.position.x < 17) {
      line2_mesh.position.x += 1;
    }
    if (line2_mesh.scale.x < 8) {
      const scale = line2_mesh.scale.x + 0.4;
      line2_mesh.scale.set(scale, scale, scale);
    }
    // 后面小圈
    if (line3_mesh.position.x > -23) {
      line3_mesh.position.x -= 1;
    }
    if (line3_mesh.scale.x < 1.5) {
      const scale = (line3_mesh.scale.x += 0.1);
      line3_mesh.scale.set(scale, scale, scale);
    }
    // 前面红色小圈
    if (q4_mesh.position.x < 16) {
      q4_mesh.position.x += 1;
    }
    if (q4_mesh.scale.x < 1.5) {
      const scale = (q4_mesh.scale.x += 0.1);
      q4_mesh.scale.set(scale, scale, scale);
    }
    // 后面红色小圈
    if (q5_mesh.position.x > -23.5) {
      q5_mesh.position.x -= 1;
    }
    if (q5_mesh.scale.x < 1.5) {
      const scale = (q5_mesh.scale.x += 0.1);
      q5_mesh.scale.set(scale, scale, scale);
    }
    // 前面虚线中圈
    if (dash1_mesh.material.uniforms.opacity.value < 1) {
      dash1_mesh.material.uniforms.opacity.value += 0.02;
    }
    if (dash1_mesh.scale.x > 3.3) {
      const scale = (dash1_mesh.scale.x -= 0.1);
      dash1_mesh.scale.set(scale, scale, scale);
    }
    // 三个三角形的材质
    if (ship_red_line.uniforms.opacity.value < 1) {
      ship_red_line.uniforms.opacity.value += 0.01;
    }
    // 实现蓝色线圈材质
    if (ship_line.uniforms.opacity.value < 1) {
      ship_line.uniforms.opacity.value = 1;
    }

    /** 被选中，处理cone_group **/
    if (count % 200 === 0 && !hoverToDo) {
      hoverToDo = true;
      noHoverToDo = true;
      nowNum = 0;
    }
    if (hoverToDo) {
      nowNum += 0.15;
      const now = Math.floor(nowNum) * 2;

      if (now > cone_group.children.length + 2) {
        hoverToDo = false;
      }

      for (let i = 0; i < cone_group.children.length; i += 2) {
        if (i === now && cone_group.children[now].scale.x < 1) {
          const scale = cone_group.children[now].scale.x + 0.1;
          cone_group.children[now].scale.set(scale, 1, scale);
          cone_group.children[now + 1].scale.set(scale, 1, scale);
          cone_group1.children[now].scale.set(scale, 1, scale);
          cone_group1.children[now + 1].scale.set(scale, 1, scale);
          cone_group2.children[now].scale.set(scale, 1, scale);
          cone_group2.children[now + 1].scale.set(scale, 1, scale);
        } else if (i !== now && cone_group.children[i].scale.x > 0) {
          const scale = cone_group.children[i].scale.x - 0.05;
          cone_group.children[i].scale.set(scale, scale, scale);
          cone_group.children[i + 1].scale.set(scale, scale, scale);
          cone_group1.children[i].scale.set(scale, scale, scale);
          cone_group1.children[i + 1].scale.set(scale, scale, scale);
          cone_group2.children[i].scale.set(scale, scale, scale);
          cone_group2.children[i + 1].scale.set(scale, scale, scale);
        }
      }
    }
  } else {
    // 未被选中
    title2d && title2d.hasClass("show") && title2d.removeClass("show");
    label2d && label2d.hasClass("show") && label2d.removeClass("show");
    // 前面中圈
    if (line1_mesh.position.x > 10) {
      line1_mesh.position.x -= 1;
    }
    if (line1_mesh.scale.x > 0) {
      const scale = line1_mesh.scale.x - 0.1;
      line1_mesh.scale.set(scale, scale, scale);
    }
    // 前面大圈
    if (line2_mesh.position.x > 10) {
      line2_mesh.position.x -= 1;
    }
    if (line2_mesh.scale.x > 0) {
      const scale = line2_mesh.scale.x - 0.4;
      line2_mesh.scale.set(scale, scale, scale);
    }
    // 后面小圈
    if (line3_mesh.position.x < -13) {
      line3_mesh.position.x += 1;
    }
    if (line3_mesh.scale.x > 0) {
      const scale = (line3_mesh.scale.x -= 0.1);
      line3_mesh.scale.set(scale, scale, scale);
    }
    // 前面红色小圈
    if (q4_mesh.position.x > 6) {
      q4_mesh.position.x -= 1;
    }
    if (q4_mesh.scale.x > 0) {
      const scale = (q4_mesh.scale.x -= 0.1);
      q4_mesh.scale.set(scale, scale, scale);
    }
    // 后面红色小圈
    if (q5_mesh.position.x < -13.5) {
      q5_mesh.position.x += 1;
    }
    if (q5_mesh.scale.x > 0) {
      const scale = (q5_mesh.scale.x -= 0.1);
      q5_mesh.scale.set(scale, scale, scale);
    }
    // 前面虚线中圈
    if (dash1_mesh.material.uniforms.opacity.value > 0) {
      dash1_mesh.material.uniforms.opacity.value = 0;
    }
    if (dash1_mesh.scale.x < 7) {
      dash1_mesh.scale.set(7, 7, 7);
    }
    // 三个三角形的材质
    if (ship_red_line.uniforms.opacity.value > 0) {
      ship_red_line.uniforms.opacity.value = 0;
    }
    // 实现蓝色线圈材质
    if (ship_line.uniforms.opacity.value > 0) {
      ship_line.uniforms.opacity.value -= 0.05;
    }

    if (noHoverToDo) {
      noHoverToDo = false;
      hoverToDo = false;
      nowNum = 0;
      for (let i = 0; i < cone_group.children.length; i++) {
        cone_group.children[i].scale.set(0.001, 0.001, 0.001);
        cone_group1.children[i].scale.set(0.001, 0.001, 0.001);
        cone_group2.children[i].scale.set(0.001, 0.001, 0.001);
      }
    }
  }
}

function initNames() {
  users.sort(function (a, b) {
    return b.s - a.s;
  });
  let str = "";
  let num = 0;
  for (let i = 0; i < users.length; i++) {
    let n = "";
    if (users[i].n instanceof Array) {
      n = users[i].n
        .map(function (item, index) {
          return item.indexOf("libs/") > -1 ? '<img src="' + item + '">' : item;
        })
        .join("");
    } else {
      n = users[i].n;
    }

    str += `<li><div>${n}</div>${users[i].w ? `<div class="w">(${users[i].w})</div>` : ""}<div class="s">¥${users[i].s}</div></li>`;
    num += users[i].s;
  }

  const fixed = 2;
  let pos = num.toString().indexOf("."),
    decimal_places = num.toString().length - pos - 1,
    _int = num * Math.pow(10, decimal_places),
    divisor_1 = Math.pow(10, decimal_places - fixed),
    divisor_2 = Math.pow(10, fixed);
  num = Math.round(_int / divisor_1) / divisor_2;
  $(str).appendTo($("#names"));
  $("#sum").text(num);
}
/** 开始初始化 **/
function init() {
  init3boss(); // 三要素
  initCameraControl(); // 初始化镜头控制器
  initCubeCameras(); // 初始化六面体相机
  initWaterShip(); // 初始化水滴探测器及光锥对象
  init2dLabel(); // 初始化2D标签
  initStarSky(); // 初始化低速和高速星空
  initTunne(); // 初始化时空隧道
  initSkyBox(); // 初始化天空盒
  initAppendage(); // 初始化飞船附加物
  initComposer(); // 初始化各后期通道
  initRaycaster(); // 初始化射线
  initWords(); // 初始化标题文字
  initNames(); // 构造赞助者名单
  // 浏览器改变事件
  window.addEventListener("resize", onResize, false);
  window.addEventListener("mousemove", onMouseMove, false);
  FastClick.attach(document.body);
  labelRenderer.render(scene, camera);

  // 绑定音频事件
  $("#play-btn").on("click", function () {
    if (musicPlaying) {
      musicPlaying = false;
      pause();
    } else {
      musicPlaying = true;
      play();
    }
  });
  $("#next-btn").on("click", next);
  $("#audio").on("ended", next);

  // 菜单事件
  $("#menu-w").on("click", function (e) {
    const $p = $("#page-w");
    if ($p.hasClass("show")) {
      // 当前页已经出现了
      $("#pages-box, #pages-box>div, #close").removeClass("show");
    } else {
      $("#pages-box, #close").addClass("show");
      $("#pages-box>div").removeClass("show");
      $p.scrollTop(0).addClass("show");
    }
  });
  $("#menu-m").on("click", function (e) {
    const $p = $("#page-m");
    if ($p.hasClass("show")) {
      // 当前页已经出现了
      $("#pages-box, #pages-box>div, #close").removeClass("show");
    } else {
      $("#pages-box, #close").addClass("show");
      $("#pages-box>div").removeClass("show");
      $p.scrollTop(0).addClass("show");
    }
  });
  $("#menu-t").on("click", function (e) {
    const $p = $("#page-t");
    if ($p.hasClass("show")) {
      // 当前页已经出现了
      $("#pages-box, #pages-box>div, #close").removeClass("show");
    } else {
      $("#pages-box, #close").addClass("show");
      $("#pages-box>div").removeClass("show");
      $p.scrollTop(0).addClass("show");
    }
  });
  $("#close").on("click", function () {
    $("#pages-box, #pages-box>div, #close").removeClass("show");
  });

  $("#pages-box").on("touchmove mousewheel DOMMouseScroll", function (e) {
    e.stopPropagation();
  });

  setTimeout(function () {
    title2d = $("#title2d");
    label2d = $("#label2");
  });
  initShow(); // 开始了

  $("#ship-info-btn").addClass("show"); // s首个按钮出现
}

/** 逻辑开始的地方 **/
initAllTexturesAndImgs(); // 加载所有资源

function initWords() {
  const $i = $("#title>i");

  $i.each(function (index, dom) {
    dom.style.transitionDelay = Math.floor(Math.random() * 2500 + 500) + "ms";
  });
}

// 初始化不同阶段的出现逻辑
function initShow() {
  $("#ship-info-btn").on("click", function () {
    var shipInfoBtn = $(this);
    if (!shipInfoBtn.hasClass("show")) {
      return;
    }
    shipInfoBtn.removeClass("show");
    const type = Number(shipInfoBtn.data("type"));
    switch (type) {
      case 1: // 第1阶段
        show1();
        return;
      case 2: // 第2阶段 常规航行
        show2();
        return;
      case 3: // 第3阶段 高速航行
        show3();
        return;
    }
  });
}
// 画面出现
function show1() {
  animate();
  showType = 1;
  $("#mask").fadeOut(5000, function () {
    $("#menu").addClass("show");
    setTimeout(function () {
      $("#ship-type-ul").css("transform", "translateY(-40px)");
      $("#ship-info-btn .btn-word").text("起航");
      $("#ship-info-btn").data("type", 2).addClass("show");
      $("#ship-info-box,#logo").css("z-index", "10");
      $("#menu li").css("transition", "all 200ms !important");
    }, 2000);
  });
  $("#title-box, #logo").addClass("show");
  $("#ship-type-ul").css("transform", "translateY(-20px)");
  $("#speed-unit").text("km/h");

  play();
}

// 常规推进
const CoordinateOrigin = new THREE.Vector3(0, 0, 0);
function show2() {
  $("#title-box").removeClass("show");
  showType = 2;
  const tween = new TWEEN.Tween({
    x: camera.position.x,
    z: camera.position.z,
  })
    .to(
      {
        x: -50,
        z: -18,
      },
      4000,
    )
    .easing(TWEEN.Easing.Quadratic.InOut)
    .onUpdate(function () {
      camera.position.x = this.x;
      camera.position.z = this.z;
      camera.lookAt(CoordinateOrigin);
    })
    .onComplete(function () {
      $("#control-remind").addClass("show");
      $("#ship-info-box").addClass("pointernone");
      cameraControls.enabled = true;
      showType = 2.5; // 表示第2阶段已完毕
      setTimeout(function () {
        $("#control-remind").removeClass("show");
      }, 5000);
      setTimeout(function () {
        $("#ship-info-box").removeClass("pointernone");
        $("#ship-type-ul").css("transform", "translateY(-80px)");
        $("#ship-info-btn .btn-word").text("开始星际穿梭");
        $("#ship-info-btn").data("type", 3).addClass("show");
      }, 10000);
    });
  tween.start();
  anime({
    targets: animeObj,
    shipSpeed: 10000,
    round: 1,
    easing: "linear",
    duration: 4000,
    update: function () {
      speedDom.innerText = animeObj.shipSpeed.toFixed(2);
    },
  });
  setTimeout(function () {
    $("#ship-type-ul").css("transform", "translateY(-60px)");
  }, 4000);
}

// 曲率推进
function show3() {
  showType = 3;
  tunnel.visible = true;
  $("#ship-info-box").addClass("pointernone");
  // skybox.material.transparent = true;
  // composer.addPass( outlinePass );
  anime({
    targets: animeObj,
    shipSpeed: [{ value: 1079252848, duration: 12000 }], // 1079252848.8
    round: 1,
    easing: "linear",
    update: function () {
      speedDom.innerText = animeObj.shipSpeed.toFixed(2);
    },
  });
}

/** 音频控制相关 **/
const musics = [
  { url: "libs/music/0.mp3", title: "Fearless" },
  { url: "libs/music/1.mp3", title: "Qiu Mansion" },
];

function play() {
  const audio = document.getElementById("audio");
  musicPlaying = true;
  $("#play-btn i").addClass("animePlay");
  audio.play();
}

function pause() {
  const audio = document.getElementById("audio");
  musicPlaying = false;
  $("#play-btn i").removeClass("animePlay");
  audio.pause();
}

function next() {
  const audio = document.getElementById("audio");
  let musicNow = musicNum + 1 > musics.length - 1 ? 0 : musicNum + 1;
  musicNum = musicNow;
  audio.pause();
  audio.src = musics[musicNow].url;
  musicPlaying = true;
  $("#play-btn i").addClass("animePlay");
  $("#music-name").text(musics[musicNow].title);
  audio.play();
}
