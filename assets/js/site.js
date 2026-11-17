// 첫 화면의 스크롤 연출.
// 흰 종이 위의 CAMELL!A 로고에서 시작해, 스크롤을 내리면 느낌표 아래 점의 구멍으로 들어가고
// 그 안의 태양계를 지나 로또리 행성 앞에 멈춘다.
(async () => {
  const story = document.querySelector('.story');
  if (!story) return;

  const here = document.currentScript.src;
  const THREE_URL = new URL('../vendor/three.module.min.js', here).href;
  const MARK_URL = new URL('../img/lottory-mark.png', here).href;

  const stage = story.querySelector('.stage');
  const glCanvas = stage.querySelector('.gl');
  const cv = stage.querySelector('.paper');
  const ctx = cv.getContext('2d');
  const head = stage.querySelector('.head');
  const headLogo = stage.querySelector('.head-logo');
  const cue = stage.querySelector('.cue');
  const cap1 = stage.querySelector('.cap-1');
  const cap2 = stage.querySelector('.cap-2');
  // 기기에서 '동작 줄이기'(Windows 의 애니메이션 효과 끄기 등)를 켠 경우:
  // 스크롤에 따라 움직이는 연출은 그대로 두고, 행성이 스스로 도는 움직임만 멈춘다.
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const TAU = Math.PI * 2, RAD = Math.PI / 180;
  const clamp01 = (v) => Math.max(0, Math.min(1, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const smooth = (a, b, v) => { const t = clamp01((v - a) / (b - a)); return t * t * (3 - 2 * t); };
  const easeOut = (t) => 1 - Math.pow(1 - t, 3);
  const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

  // ── 로고 (CAMELL!A). 느낌표 아래 점의 가운데 구멍이 우주로 들어가는 문이 된다.
  const LETTERS = [
    'M98.59 96.3A47.38 47.38 0 1 0 98.59 159.7L82.87 145.54A26.22 26.22 0 1 1 82.87 110.46Z',
    'M105.03 174L139.07 82L159.31 82L193.35 174L171.27 174L163.78 153.76L134.6 153.76L127.11 174ZM149.19 114.29L157.65 137.2L140.73 137.2Z',
    'M201.63 174L201.63 82L223.71 82L252.23 131.4L280.75 82L302.83 82L302.83 174L282.59 174L282.59 119.2L260.51 157.44L243.95 157.44L221.87 119.2L221.87 174Z',
    'M318.47 82L382.87 82L382.87 99.48L338.71 99.48L338.71 118.34L375.51 118.34L375.51 135.82L338.71 135.82L338.71 156.52L382.87 156.52L382.87 174L318.47 174Z',
    'M396.67 82L416.91 82L416.91 156.52L455.55 156.52L455.55 174L396.67 174Z',
    'M467.51 82L487.75 82L487.75 156.52L526.39 156.52L526.39 174L467.51 174Z',
    'M541.59 93.05A13.76 13.76 0 0 1 568.87 93.05L564.86 124.74A9.71 9.71 0 1 1 545.6 124.74Z',
    'M580.39 174L614.43 82L634.67 82L668.71 174L646.63 174L639.14 153.76L609.96 153.76L602.47 174ZM624.55 114.29L633.02 137.2L616.09 137.2Z',
  ].map((d) => new Path2D(d));
  const DOT = new Path2D('M547.58 149.87A8.46 8.46 0 0 1 562.88 149.87A8.46 8.46 0 0 1 567.61 164.42A8.46 8.46 0 0 1 555.23 173.42A8.46 8.46 0 0 1 542.85 164.42A8.46 8.46 0 0 1 547.58 149.87ZM551.85 160.4A3.38 3.38 0 1 1 558.61 160.4A3.38 3.38 0 1 1 551.85 160.4Z');
  const LOGO = { x: 12, y: 78, w: 661, h: 100 };
  const HOLE = { x: 555.23, y: 160.4, r: 3.38 };

  let W = 0, H = 0, dpr = 1;

  // 흰 종이와 로고를 그린다. 점의 구멍만 뚫려 있어서 그 뒤의 우주가 보인다.
  // 구멍이 화면을 얼마나 덮었는지(0~1)를 돌려준다.
  function drawPaper(p) {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    const zt = clamp01((p - 0.06) / 0.44);
    const logoW = Math.min(W * 0.62, 560), s0 = logoW / LOGO.w;
    const lx0 = (W - logoW) / 2, ly0 = H * 0.47 - LOGO.h * s0 / 2;
    const hx0 = lx0 + (HOLE.x - LOGO.x) * s0, hy0 = ly0 + (HOLE.y - LOGO.y) * s0;
    const half = Math.hypot(W, H) / 2;
    const zMax = half * 1.15 / (HOLE.r * s0);
    const k = s0 * Math.exp(Math.log(zMax) * Math.pow(zt, 1.15));
    const m = smooth(0, 0.5, zt);
    const hx = lerp(hx0, W / 2, m), hy = lerp(hy0, H / 2, m), hr = HOLE.r * k;
    if (hr >= half * 1.1) return 1;

    ctx.beginPath(); ctx.rect(0, 0, W, H); ctx.arc(hx, hy, hr, 0, TAU);
    ctx.fillStyle = '#fff'; ctx.fill('evenodd');
    ctx.save();
    ctx.translate(hx - HOLE.x * k, hy - HOLE.y * k); ctx.scale(k, k);
    ctx.fillStyle = '#15191F'; for (const l of LETTERS) ctx.fill(l, 'evenodd');
    ctx.fillStyle = '#B81F36'; ctx.fill(DOT, 'evenodd');
    ctx.restore();
    // 멈춰 있을 때는 로고 원래 모습대로 구멍을 흰색으로 막아 둔다
    const cover = 1 - smooth(0.03, 0.12, p);
    if (cover > 0) { ctx.globalAlpha = cover; ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(hx, hy, hr + 0.6, 0, TAU); ctx.fill(); ctx.globalAlpha = 1; }
    return clamp01(hr / half);
  }

  // ── 우주: 실제 3D. 해에서 나오는 빛으로 행성의 낮과 밤이 생긴다.
  let space = null;
  try {
    space = buildSpace(await import(THREE_URL));
  } catch (err) {
    console.warn('3D 장면을 만들지 못해 우주를 검은 바탕으로만 보여 줍니다.', err);
    glCanvas.style.background = '#000';
  }

  function buildSpace(THREE) {
    const renderer = new THREE.WebGLRenderer({ canvas: glCanvas, antialias: true, powerPreference: 'high-performance' });
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setClearColor(0x000000, 1);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 6000);

    // 잡음 (행성 표면 무늬를 만들 때 쓴다)
    const hash3 = (x, y, z) => { let h = Math.imul(x, 374761393) ^ Math.imul(y, 668265263) ^ Math.imul(z, 1274126177); h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
    const noise3 = (x, y, z) => {
      const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z), xf = x - xi, yf = y - yi, zf = z - zi;
      const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf), w = zf * zf * (3 - 2 * zf);
      return lerp(
        lerp(lerp(hash3(xi, yi, zi), hash3(xi + 1, yi, zi), u), lerp(hash3(xi, yi + 1, zi), hash3(xi + 1, yi + 1, zi), u), v),
        lerp(lerp(hash3(xi, yi, zi + 1), hash3(xi + 1, yi, zi + 1), u), lerp(hash3(xi, yi + 1, zi + 1), hash3(xi + 1, yi + 1, zi + 1), u), v), w);
    };
    const fbm = (x, y, z, oct) => { let a = 0.5, f = 1, s = 0, n = 0; for (let i = 0; i < oct; i++) { s += a * noise3(x * f, y * f, z * f); n += a; a *= 0.5; f *= 2.03; } return s / n; };
    const ramp = (stops, t) => {
      const x = clamp01(t) * (stops.length - 1), i = Math.min(stops.length - 2, Math.floor(x)), f = x - i, a = stops[i], b = stops[i + 1];
      return [lerp(a[0], b[0], f), lerp(a[1], b[1], f), lerp(a[2], b[2], f)];
    };
    const mix3 = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
    // 구 표면 전체에 입힐 그림을 한 점씩 색칠해서 만든다
    function surface(w, h, shade) {
      const c = document.createElement('canvas'); c.width = w; c.height = h;
      const g = c.getContext('2d'), img = g.createImageData(w, h), d = img.data;
      for (let j = 0; j < h; j++) {
        const lat = (j / (h - 1) - 0.5) * Math.PI, cl = Math.cos(lat), y = Math.sin(lat);
        for (let i = 0; i < w; i++) {
          const lon = i / w * TAU, col = shade(cl * Math.cos(lon), y, cl * Math.sin(lon), lat, lon), k = (j * w + i) * 4;
          d[k] = col[0]; d[k + 1] = col[1]; d[k + 2] = col[2]; d[k + 3] = 255;
        }
      }
      g.putImageData(img, 0, 0);
      const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
      return t;
    }

    const shades = {
      // 로또리: 로또리 아이콘의 파란색 바탕에 옅은 구름
      lottory: (x, y, z) => {
        const base = ramp([[70, 118, 196], [102, 153, 219], [128, 174, 232]], fbm(x * 1.8 + 3, y * 1.8, z * 1.8, 4));
        const cloud = smooth(0.52, 0.76, fbm(x * 2.6 + 9, y * 4.4, z * 2.6, 5));
        return mix3(base, [238, 244, 252], cloud * 0.5 + smooth(0.86, 1, Math.abs(y)) * 0.35);
      },
      rock: (x, y, z) => {
        const n = fbm(x * 3, y * 3, z * 3, 5), crater = smooth(0.62, 0.7, fbm(x * 9 + 4, y * 9, z * 9, 3));
        return mix3(ramp([[70, 68, 66], [128, 124, 118], [176, 171, 163]], n), [58, 56, 55], crater * 0.5);
      },
      rust: (x, y, z) => {
        const n = fbm(x * 2.4 + 7, y * 2.4, z * 2.4, 5), dark = smooth(0.55, 0.72, fbm(x * 4 + 1, y * 4, z * 4, 4));
        const col = mix3(ramp([[104, 48, 30], [170, 88, 54], [206, 132, 88]], n), [70, 36, 28], dark * 0.55);
        return mix3(col, [236, 226, 214], smooth(0.9, 0.97, Math.abs(y)));
      },
      banded: (x, y, z, lat, lon) => {
        const wob = fbm(x * 2.2, y * 7, z * 2.2, 4) - 0.5;
        const band = Math.sin((y + wob * 0.13) * 15) * 0.5 + 0.5;
        const col = ramp([[150, 108, 80], [222, 198, 166], [186, 140, 104], [236, 220, 194], [164, 122, 92]], band * 0.82 + fbm(x * 5, y * 16, z * 5, 3) * 0.18);
        const dl = Math.atan2(Math.sin(lon - 2.3), Math.cos(lon - 2.3)), spot = Math.exp(-((dl * dl) / 0.05 + ((lat + 0.36) * (lat + 0.36)) / 0.012));
        return mix3(col, [176, 84, 56], spot * 0.85);
      },
      ringed: (x, y, z) => {
        const wob = fbm(x * 2, y * 6, z * 2, 3) - 0.5;
        return ramp([[196, 174, 132], [232, 216, 180], [210, 190, 150], [240, 228, 198]], Math.sin((y + wob * 0.08) * 11) * 0.5 + 0.5);
      },
      ice: (x, y, z) => {
        const wob = fbm(x * 2, y * 5, z * 2, 3) - 0.5;
        return ramp([[126, 168, 172], [176, 208, 206], [150, 190, 190]], Math.sin((y + wob * 0.1) * 7) * 0.5 + 0.5);
      },
    };

    // R = 궤도 반지름, r = 행성 반지름, period = 한 바퀴 도는 시간(초), spin = 자전 속도
    // 새 앱이 생기면 여기에 행성을 더하고 shades 에 표면을 추가한다.
    const PLANETS = [
      { key: 'lottory', R: 9, r: 0.78, period: 46, phase: 2.2, spin: 0.05, rough: 0.82 },
      { key: 'rock', R: 13.2, r: 0.42, period: 74, phase: 0.4, spin: 0.03, rough: 1 },
      { key: 'rust', R: 17.4, r: 0.58, period: 110, phase: 4.3, spin: 0.06, rough: 0.95 },
      { key: 'banded', R: 24.5, r: 1.95, period: 190, phase: 3.3, spin: 0.12, rough: 0.9 },
      { key: 'ringed', R: 33, r: 1.5, period: 300, phase: 5.6, spin: 0.1, rough: 0.9, ring: [1.95, 3.5] },
      { key: 'ice', R: 41, r: 0.95, period: 430, phase: 1.3, spin: 0.07, rough: 0.9 },
    ];

    // 별
    const dot = document.createElement('canvas'); dot.width = dot.height = 32;
    { const g = dot.getContext('2d'), gr = g.createRadialGradient(16, 16, 0, 16, 16, 16); gr.addColorStop(0, '#fff'); gr.addColorStop(0.45, 'rgba(255,255,255,.55)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 32, 32); }
    const dotTex = new THREE.CanvasTexture(dot);
    let seed = 23;
    const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    const starLayers = [[2600, 1.5, 0.5], [640, 2.3, 0.78], [90, 3.6, 0.95]].map(([count, size, opacity]) => {
      const pos = new Float32Array(count * 3), col = new Float32Array(count * 3);
      for (let i = 0; i < count; i++) {
        const u = rnd() * 2 - 1, th = rnd() * TAU, rr = 900 + rnd() * 900, s = Math.sqrt(1 - u * u), tint = rnd();
        pos[i * 3] = rr * s * Math.cos(th); pos[i * 3 + 1] = rr * u; pos[i * 3 + 2] = rr * s * Math.sin(th);
        col[i * 3] = tint < 0.2 ? 1 : 0.86 + rnd() * 0.14; col[i * 3 + 1] = 0.9 + rnd() * 0.1; col[i * 3 + 2] = tint > 0.8 ? 1 : 0.88 + rnd() * 0.12;
      }
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.BufferAttribute(col, 3));
      const m = new THREE.PointsMaterial({ size, map: dotTex, vertexColors: true, transparent: true, opacity, sizeAttenuation: false, depthWrite: false, blending: THREE.AdditiveBlending });
      const pts = new THREE.Points(g, m); pts.userData.size = size; scene.add(pts);
      return pts;
    });

    // 해: 가운데는 희고 가장자리로 갈수록 붉어지는 구체
    const sunR = 2.3;
    scene.add(new THREE.Mesh(new THREE.SphereGeometry(sunR, 64, 48), new THREE.ShaderMaterial({
      vertexShader: 'varying vec3 vN; varying vec3 vV; void main(){ vec4 mv = modelViewMatrix * vec4(position, 1.0); vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }',
      fragmentShader: 'varying vec3 vN; varying vec3 vV; void main(){ float mu = max(dot(normalize(vN), normalize(vV)), 0.0); float k = pow(mu, 0.5); vec3 c = mix(vec3(1.0, 0.62, 0.26), vec3(1.0, 0.98, 0.93), k); gl_FragColor = vec4(c, 1.0); }',
    })));
    const glowTex = (stops) => {
      const c = document.createElement('canvas'); c.width = c.height = 256;
      const g = c.getContext('2d'), gr = g.createRadialGradient(128, 128, 0, 128, 128, 128);
      for (const [o, col] of stops) gr.addColorStop(o, col);
      g.fillStyle = gr; g.fillRect(0, 0, 256, 256);
      const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
    };
    const glow = (scale, stops, opacity) => {
      const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex(stops), transparent: true, opacity, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }));
      s.scale.set(scale, scale, 1); scene.add(s);
    };
    glow(sunR * 4.4, [[0, 'rgba(255,240,214,1)'], [0.24, 'rgba(255,226,184,.5)'], [0.5, 'rgba(255,206,150,.12)'], [1, 'rgba(255,196,130,0)']], 0.9);
    glow(sunR * 11, [[0, 'rgba(255,238,214,.3)'], [0.35, 'rgba(255,232,206,.07)'], [1, 'rgba(255,228,200,0)']], 0.42);

    scene.add(new THREE.PointLight(0xfff3e2, 2.6, 0, 0));
    scene.add(new THREE.AmbientLight(0x8fa6c8, 0.045));

    // 궤도선
    const orbitGeo = (R) => { const pts = []; for (let i = 0; i <= 256; i++) { const a = i / 256 * TAU; pts.push(new THREE.Vector3(R * Math.cos(a), 0, R * Math.sin(a))); } return new THREE.BufferGeometry().setFromPoints(pts); };

    // 대기: 해를 향한 가장자리가 옅게 빛난다
    const atmosphere = (r, color, strength) => new THREE.Mesh(new THREE.SphereGeometry(r, 64, 48), new THREE.ShaderMaterial({
      uniforms: { c: { value: new THREE.Color(color) }, s: { value: strength } },
      vertexShader: 'varying vec3 vN; varying vec3 vV; varying float vLit; void main(){ vec4 wp = modelMatrix * vec4(position, 1.0); vec3 wn = normalize(mat3(modelMatrix) * normal); vLit = smoothstep(-0.25, 0.6, dot(wn, normalize(-wp.xyz))); vec4 mv = viewMatrix * wp; vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }',
      fragmentShader: 'uniform vec3 c; uniform float s; varying vec3 vN; varying vec3 vV; varying float vLit; void main(){ float f = pow(1.0 - max(dot(normalize(vN), normalize(vV)), 0.0), 2.6); gl_FragColor = vec4(c, f * s * vLit); }',
      transparent: true, blending: THREE.AdditiveBlending, depthWrite: false,
    }));

    const bodies = PLANETS.map((def) => {
      const group = new THREE.Group();
      const big = def.r > 1;
      const mesh = new THREE.Mesh(new THREE.SphereGeometry(def.r, 72, 48), new THREE.MeshStandardMaterial({ map: surface(big ? 1024 : 512, big ? 512 : 256, shades[def.key]), roughness: def.rough, metalness: 0 }));
      group.add(mesh);
      if (def.ring) {
        const [ri, ro] = def.ring, g = new THREE.RingGeometry(ri, ro, 160, 1), pos = g.attributes.position, uv = g.attributes.uv;
        for (let i = 0; i < pos.count; i++) uv.setXY(i, (Math.hypot(pos.getX(i), pos.getY(i)) - ri) / (ro - ri), 0.5);
        const c = document.createElement('canvas'); c.width = 512; c.height = 2;
        const cg = c.getContext('2d'), img = cg.createImageData(512, 2);
        for (let i = 0; i < 512; i++) {
          const t = i / 511, n = fbm(t * 26, 3.1, 7.7, 4), gap = smooth(0.58, 0.6, t) * (1 - smooth(0.64, 0.66, t));
          const a = clamp01((0.25 + n * 1.1) * smooth(0, 0.06, t) * (1 - smooth(0.9, 1, t)) * (1 - gap * 0.9));
          for (let j = 0; j < 2; j++) { const k = (j * 512 + i) * 4; img.data[k] = 226 - n * 40; img.data[k + 1] = 208 - n * 44; img.data[k + 2] = 172 - n * 46; img.data[k + 3] = a * 235; }
        }
        cg.putImageData(img, 0, 0);
        const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
        const ring = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ map: tex, transparent: true, side: THREE.DoubleSide, depthWrite: false, opacity: 0.8 }));
        ring.rotation.x = -Math.PI / 2 + 0.42; ring.rotation.y = 0.2;
        mesh.rotation.z = 0.42;
        group.add(ring);
      }
      scene.add(group);
      scene.add(new THREE.LineLoop(orbitGeo(def.R), new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: def.key === 'lottory' ? 0.2 : 0.085, depthWrite: false })));
      return { def, group, mesh };
    });

    // 로또리 행성: 대기와, 가까이 가야 드러나는 선인장 무늬
    const L = bodies[0];
    L.group.add(atmosphere(L.def.r * 1.045, 0x9cc4ff, 0.85));
    const decal = new THREE.Mesh(new THREE.SphereGeometry(L.def.r * 1.004, 72, 48), new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false, toneMapped: false }));
    decal.visible = false;
    L.group.add(decal);
    const mark = new Image();
    mark.onload = () => {
      // 구 표면 그림의 한가운데(가로 80도, 세로 80도 넓이)에 선인장을 얹는다
      const c = document.createElement('canvas'); c.width = 2048; c.height = 1024;
      const pw = 2048 * (80 / 360), ph = 1024 * (80 / 180);
      const cg = c.getContext('2d'); cg.imageSmoothingQuality = 'high';
      cg.drawImage(mark, (2048 - pw) / 2, (1024 - ph) / 2, pw, ph);
      const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
      decal.material.map = t; decal.material.needsUpdate = true; decal.visible = true;
    };
    mark.src = MARK_URL;

    const PARK = -40 * RAD;
    const v = { c0: new THREE.Vector3(), c1: new THREE.Vector3(), t: new THREE.Vector3(), pl: new THREE.Vector3(), sun: new THREE.Vector3(), o: new THREE.Vector3(), x: new THREE.Vector3(), y: new THREE.Vector3(), z: new THREE.Vector3(), m: new THREE.Matrix4() };

    return {
      resize() {
        renderer.setPixelRatio(dpr); renderer.setSize(W, H, false);
        for (const s of starLayers) s.material.size = s.userData.size * dpr;
      },
      render(p, time) {
        const aspect = W / H, wide = aspect > 1.15;
        camera.fov = wide ? 32 : 40; camera.aspect = aspect; camera.updateProjectionMatrix();
        const enter = easeOut(clamp01((p - 0.06) / 0.5));
        const e3 = easeInOut(clamp01((p - 0.74) / 0.23));

        for (const b of bodies) {
          let a = b.def.phase + time * TAU / b.def.period;
          // 로또리는 다가갈수록 정해진 자리로 옮겨 세워서, 마지막 장면이 늘 같게 한다
          if (b === L) { let diff = (PARK - a) % TAU; if (diff > Math.PI) diff -= TAU; if (diff < -Math.PI) diff += TAU; a += diff * e3; }
          b.group.position.set(b.def.R * Math.cos(a), 0, b.def.R * Math.sin(a));
          b.mesh.rotation.y = time * b.def.spin;
        }

        // 전체가 보이는 자리(c0)에서 로또리 바로 앞(c1)으로
        const vHalf = camera.fov * RAD / 2, hHalf = Math.atan(Math.tan(vHalf) * aspect);
        const D = (wide ? 35 : 19) / Math.tan(hHalf) * (1 + 1.5 * (1 - enter));
        v.c0.set(0, D * Math.sin(21 * RAD), D * Math.cos(21 * RAD));
        v.pl.copy(L.group.position);
        v.sun.copy(v.pl).multiplyScalar(-1).normalize();
        v.o.copy(v.sun).multiplyScalar(0.75).add(v.x.set(0.25, 0.22, 0.7)).normalize();
        const d1 = L.def.r / Math.tan(vHalf * (wide ? 0.25 : 0.2));
        v.c1.copy(v.pl).addScaledVector(v.o, d1);
        camera.position.lerpVectors(v.c0, v.c1, e3);
        v.t.copy(v.pl); v.t.y -= d1 * Math.tan(vHalf) * 0.2;
        v.t.multiplyScalar(e3);
        camera.lookAt(v.t);

        // 선인장 무늬는 항상 보는 사람 쪽을 향하고, 가까이 갈수록 드러난다
        v.x.copy(camera.position).sub(v.pl).normalize();
        v.z.crossVectors(v.x, camera.up).normalize();
        v.y.crossVectors(v.z, v.x).normalize();
        decal.quaternion.setFromRotationMatrix(v.m.makeBasis(v.x, v.y, v.z));
        decal.material.opacity = smooth(0.88, 0.98, p);

        renderer.render(scene, camera);
      },
    };
  }

  function resize() {
    W = stage.clientWidth; H = stage.clientHeight;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    if (space) space.resize();
  }

  const t0 = performance.now();
  function render(now) {
    const rect = story.getBoundingClientRect();
    if (rect.bottom <= 0) return;   // 연출 구간을 지나 보이지 않으면 그리지 않는다
    const max = rect.height - H;
    const p = max > 0 ? clamp01(-rect.top / max) : 0;
    if (space && p > 0.03) space.render(p, reduce ? 0 : (now - t0) / 1000);
    const open = drawPaper(p);

    stage.classList.toggle('is-dark', open > 0.72);
    cue.style.opacity = (1 - smooth(0.005, 0.05, p)).toFixed(3);
    head.style.opacity = (1 - smooth(0.05, 0.1, p) + smooth(0.5, 0.56, p)).toFixed(3);
    headLogo.style.opacity = smooth(0.5, 0.56, p).toFixed(3);
    const in1 = smooth(0.52, 0.59, p), out1 = smooth(0.68, 0.75, p);
    cap1.style.opacity = (in1 * (1 - out1)).toFixed(3);
    cap1.style.transform = 'translateY(' + ((1 - in1) * 18 - out1 * 18).toFixed(1) + 'px)';
    const c2 = smooth(0.92, 0.985, p);
    cap2.style.opacity = c2.toFixed(3);
    cap2.style.transform = 'translateY(' + ((1 - c2) * 18).toFixed(1) + 'px)';
  }
  function loop(now) { render(now); requestAnimationFrame(loop); }

  new ResizeObserver(() => { resize(); render(performance.now()); }).observe(stage);
  resize();
  requestAnimationFrame(loop);
})();
