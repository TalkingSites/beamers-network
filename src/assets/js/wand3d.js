import * as THREE from '/assets/js/three.module.min.js';

const container = document.getElementById('wand-3d');
if (container) initWand3D(container);

function initWand3D(container) {
  const heroSection = container.closest('.hero-section');

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.35;
  container.appendChild(renderer.domElement);

  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 50);
  camera.position.set(0, 0, 8);

  scene.add(new THREE.AmbientLight(0x1A1040, 0.8));
  const key = new THREE.DirectionalLight(0xF8E090, 2.4);
  key.position.set(-3, 5, 5);
  scene.add(key);
  const fill = new THREE.DirectionalLight(0x4030A0, 0.65);
  fill.position.set(5, -2, 2);
  scene.add(fill);
  const rim = new THREE.DirectionalLight(0x8060FF, 0.4);
  rim.position.set(0, -5, -2);
  scene.add(rim);
  const tipLight = new THREE.PointLight(0xF5C842, 2.5, 6);
  scene.add(tipLight);

  const goldMat = new THREE.MeshStandardMaterial({
    color: 0xC8A030, metalness: 0.92, roughness: 0.08,
  });
  const handleMat = new THREE.MeshStandardMaterial({
    color: 0x2D1F5E, metalness: 0.62, roughness: 0.28,
  });
  const ringMat = new THREE.MeshStandardMaterial({
    color: 0xF5C842, metalness: 0.96, roughness: 0.04,
    emissive: 0xC08010, emissiveIntensity: 0.22,
  });
  const starMat = new THREE.MeshStandardMaterial({
    color: 0xF5C842, metalness: 0.82, roughness: 0.06,
    emissive: 0xF5C842, emissiveIntensity: 0.38,
  });

  /* Pivot group: the "wrist" — wand rotates around this point */
  const pivotGroup = new THREE.Group();
  scene.add(pivotGroup);

  /* Wand shifted up inside pivot so the handle sits near the pivot center */
  const wand = new THREE.Group();
  wand.position.y = 2.2;
  pivotGroup.add(wand);

  const body = new THREE.Mesh(
    new THREE.CylinderGeometry(0.048, 0.098, 3.1, 22, 1),
    goldMat
  );
  body.position.y = -0.18;
  wand.add(body);

  const handle = new THREE.Mesh(
    new THREE.CylinderGeometry(0.098, 0.118, 0.82, 22, 1),
    handleMat
  );
  handle.position.y = -1.98;
  wand.add(handle);

  [-1.70, -1.93, -2.16].forEach(y => {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(0.132, 0.022, 12, 26),
      ringMat
    );
    ring.rotation.x = Math.PI / 2;
    ring.position.y = y;
    wand.add(ring);
  });

  const cap = new THREE.Mesh(new THREE.SphereGeometry(0.128, 16, 12), handleMat);
  cap.position.y = -2.40;
  wand.add(cap);

  const capBand = new THREE.Mesh(new THREE.TorusGeometry(0.118, 0.017, 10, 22), ringMat);
  capBand.rotation.x = Math.PI / 2;
  capBand.position.y = -2.27;
  wand.add(capBand);

  function buildStarShape(outer, inner, pts) {
    const shape = new THREE.Shape();
    for (let i = 0; i < pts * 2; i++) {
      const a = (i / (pts * 2)) * Math.PI * 2 - Math.PI / 2;
      const r = i % 2 === 0 ? outer : inner;
      const x = Math.cos(a) * r, y = Math.sin(a) * r;
      i === 0 ? shape.moveTo(x, y) : shape.lineTo(x, y);
    }
    shape.closePath();
    return shape;
  }

  const starGeo = new THREE.ExtrudeGeometry(buildStarShape(0.30, 0.12, 5), {
    depth: 0.14,
    bevelEnabled: true,
    bevelThickness: 0.032,
    bevelSize: 0.030,
    bevelSegments: 5,
  });
  starGeo.center();

  const starMesh = new THREE.Mesh(starGeo, starMat);
  starMesh.position.y = 1.72;
  starMesh.rotation.x = 0;
  wand.add(starMesh);

  function makeGlowSprite() {
    const sz = 128;
    const c  = document.createElement('canvas');
    c.width = c.height = sz;
    const ctx = c.getContext('2d');
    const g   = ctx.createRadialGradient(sz/2, sz/2, 0, sz/2, sz/2, sz/2);
    g.addColorStop(0,    'rgba(255,242,160,1)');
    g.addColorStop(0.18, 'rgba(245,200,66,0.88)');
    g.addColorStop(0.50, 'rgba(245,180,30,0.30)');
    g.addColorStop(1,    'rgba(245,180,30,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, sz, sz);
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({
      map: new THREE.CanvasTexture(c),
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }));
    sp.scale.set(1.1, 1.1, 1);
    return sp;
  }

  const glow = makeGlowSprite();
  glow.position.y = 1.72;
  wand.add(glow);

  /* Invisible marker for accurate tip world-position (handles all nested transforms) */
  const tipMarker = new THREE.Object3D();
  tipMarker.position.y = 1.72;
  wand.add(tipMarker);

  /* Particles */
  const particles = [];

  function spawnParticles(worldPos) {
    for (let i = 0; i < 20; i++) {
      const sz  = 0.020 + Math.random() * 0.030;
      const mat = new THREE.MeshBasicMaterial({
        color: Math.random() > 0.28 ? 0xF5C842 : 0xFFFFFF,
        transparent: true, depthWrite: false,
      });
      const mesh = new THREE.Mesh(new THREE.SphereGeometry(sz, 5, 4), mat);
      mesh.position.copy(worldPos);
      scene.add(mesh);
      const spd = 0.045 + Math.random() * 0.07;
      const phi = Math.random() * Math.PI * 2;
      const the = Math.random() * Math.PI;
      particles.push({
        mesh,
        vel: new THREE.Vector3(
          Math.sin(the) * Math.cos(phi) * spd,
          Math.abs(Math.cos(the)) * spd + 0.022,
          Math.sin(the) * Math.sin(phi) * spd * 0.45
        ),
        life: 1.0,
        decay: 0.020 + Math.random() * 0.018,
      });
    }
  }

  /* Animation phases (as fractions of CYCLE) */
  const CYCLE        = 3.5;
  const FLOURISH_END = 0.72;
  const TAP_PEAK     = 0.79;
  const TAP_END      = 0.93;
  const SWING_Z      = 0.30;
  const SWING_X      = 0.30;

  let elapsed      = 0;
  let lastTapCycle = -1;
  let prevTime     = performance.now();
  let isMobile     = window.innerWidth < 992;
  const tipWorldPos = new THREE.Vector3();

  /* Wand home position — right side of canvas, proportional to camera frustum */
  let wandHomeX = 3.0;
  const WAND_HOME_Y = -1.5;

  function computeWandHomeX() {
    const halfH = Math.tan((50 / 2) * Math.PI / 180) * 8;
    return halfH * camera.aspect * 0.58;
  }

  /* Converts screen pixel delta to world-unit delta at z=0 */
  function pixelToWorld(screenDX, screenDY) {
    const halfH = Math.tan((50 / 2) * Math.PI / 180) * 8;
    const halfW = halfH * camera.aspect;
    const cw = renderer.domElement.clientWidth  || window.innerWidth;
    const ch = renderer.domElement.clientHeight || window.innerHeight;
    return {
      x:  screenDX * (2 * halfW) / cw,
      y: -screenDY * (2 * halfH) / ch,
    };
  }

  /* Drag state — translates the whole wand in world space */
  let isDragging = false;
  let dragX = 0, dragY = 0;
  let dragPrevClientX = 0, dragPrevClientY = 0;
  let dragVelX = 0, dragVelY = 0;

  /* Spring-back state */
  let isSpringBack = false;
  let springX = 0, springY = 0;
  let springVelX = 0, springVelY = 0;

  const SPRING_K       = 0.12;
  const SPRING_DAMPING = 0.78;
  const SPRING_EPS     = 0.003;

  const eventTarget = heroSection || container;

  function onMouseDown(e) {
    if (isMobile) return;
    if (e.target.closest('a, button')) return;
    isDragging      = true;
    isSpringBack    = false;
    dragX           = pivotGroup.position.x;
    dragY           = pivotGroup.position.y;
    dragPrevClientX = e.clientX;
    dragPrevClientY = e.clientY;
    dragVelX        = 0;
    dragVelY        = 0;
    if (heroSection) heroSection.classList.add('is-dragging');
    e.preventDefault();
  }

  function onMouseMove(e) {
    if (!isDragging || isMobile) return;
    const dx = e.clientX - dragPrevClientX;
    const dy = e.clientY - dragPrevClientY;
    dragPrevClientX = e.clientX;
    dragPrevClientY = e.clientY;
    const w = pixelToWorld(dx, dy);
    dragX += w.x;
    dragY += w.y;
    dragVelX = dragVelX * 0.7 + w.x * 0.3;
    dragVelY = dragVelY * 0.7 + w.y * 0.3;
  }

  function onMouseUp() {
    if (!isDragging) return;
    isDragging   = false;
    isSpringBack = true;
    springX      = dragX;
    springY      = dragY;
    springVelX   = dragVelX;
    springVelY   = dragVelY;
    if (heroSection) heroSection.classList.remove('is-dragging');
  }

  eventTarget.addEventListener('mousedown', onMouseDown);
  window.addEventListener('mousemove', onMouseMove);
  window.addEventListener('mouseup', onMouseUp);

  function smoothstep(t) {
    t = Math.max(0, Math.min(1, t));
    return t * t * (3 - 2 * t);
  }

  function loop() {
    requestAnimationFrame(loop);

    const now = performance.now();
    const dt  = Math.min((now - prevTime) / 1000, 0.05);
    prevTime  = now;
    elapsed  += dt;

    const t   = (elapsed % CYCLE) / CYCLE;
    const cyc = Math.floor(elapsed / CYCLE);

    /* Rotation animation — always runs regardless of drag */
    let rz = 0, rx = 0, px = 0;

    if (t <= FLOURISH_END) {
      const f     = t / FLOURISH_END;
      const angle = f * Math.PI * 2;
      rz = SWING_Z * Math.sin(angle);
      rx = SWING_X * Math.cos(angle);
    } else if (t <= TAP_PEAK) {
      const tapRz = isMobile ? 0.10 : 0.32;
      const f = smoothstep((t - FLOURISH_END) / (TAP_PEAK - FLOURISH_END));
      rz =  f * tapRz;
      rx = SWING_X * (1 - f);
      px =  f * 0.22;
    } else if (t <= TAP_END) {
      const tapRz = isMobile ? 0.10 : 0.32;
      const f = smoothstep((t - TAP_PEAK) / (TAP_END - TAP_PEAK));
      rz = (1 - f) * tapRz;
      rx = 0;
      px = (1 - f) * 0.22;
    }

    pivotGroup.rotation.z = rz;
    pivotGroup.rotation.x = rx;

    /* Position — home + tap nudge normally, overridden by drag / spring */
    const homeX = wandHomeX + px;
    const homeY = WAND_HOME_Y + Math.sin(elapsed * 1.1) * 0.18;

    if (isDragging) {
      pivotGroup.position.x = dragX;
      pivotGroup.position.y = dragY;
    } else if (isSpringBack) {
      const dxs = homeX - springX;
      const dys = homeY - springY;
      springVelX += dxs * SPRING_K;
      springVelY += dys * SPRING_K;
      springVelX *= SPRING_DAMPING;
      springVelY *= SPRING_DAMPING;
      springX    += springVelX;
      springY    += springVelY;
      pivotGroup.position.x = springX;
      pivotGroup.position.y = springY;
      if (Math.abs(dxs) < SPRING_EPS && Math.abs(dys) < SPRING_EPS &&
          Math.abs(springVelX) < SPRING_EPS && Math.abs(springVelY) < SPRING_EPS) {
        isSpringBack = false;
      }
    } else {
      pivotGroup.position.x = homeX;
      pivotGroup.position.y = homeY;
    }

    /* Star spins on its own local axis */
    starMesh.rotation.z += dt * 1.0;

    /* Tip world position drives the point light and particles */
    tipMarker.getWorldPosition(tipWorldPos);
    tipLight.position.copy(tipWorldPos);

    /* Glow pulse */
    const pulse = 1.0 + 0.28 * Math.sin(elapsed * 3.8);
    glow.scale.set(pulse, pulse, 1);

    /* Flash and glow during the snap tap (suppressed while dragging) */
    const isTapping = !isDragging && t > FLOURISH_END && t < TAP_END;
    if (isTapping) {
      const tapProgress = t < TAP_PEAK
        ? smoothstep((t - FLOURISH_END) / (TAP_PEAK - FLOURISH_END))
        : 1 - smoothstep((t - TAP_PEAK) / (TAP_END - TAP_PEAK));
      tipLight.intensity        += (7.0 - tipLight.intensity) * 0.18;
      starMat.emissiveIntensity += (1.6 - starMat.emissiveIntensity) * 0.18;
      glow.scale.setScalar(1.0 + tapProgress * (isMobile ? 0.5 : 1.6));
    } else {
      tipLight.intensity        += (2.2  - tipLight.intensity) * 0.05;
      starMat.emissiveIntensity += (0.38 - starMat.emissiveIntensity) * 0.04;
    }

    /* Particle burst once per cycle at the tap peak (suppressed while dragging) */
    if (!isDragging && Math.abs(t - TAP_PEAK) < 0.018 && cyc !== lastTapCycle) {
      lastTapCycle = cyc;
      spawnParticles(tipWorldPos.clone());
      window.dispatchEvent(new CustomEvent('wand-tap'));
    }

    /* Particle update */
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.mesh.position.add(p.vel);
      p.vel.y -= 0.0018;
      p.life  -= p.decay;
      p.mesh.material.opacity = Math.max(0, p.life);
      p.mesh.scale.setScalar(Math.max(0, p.life));
      if (p.life <= 0) {
        scene.remove(p.mesh);
        p.mesh.geometry.dispose();
        p.mesh.material.dispose();
        particles.splice(i, 1);
      }
    }

    renderer.render(scene, camera);
  }

  loop();

  function onResize() {
    const mobile = window.innerWidth < 992;
    if (mobile && isDragging) {
      isDragging = false;
      if (heroSection) heroSection.classList.remove('is-dragging');
    }
    isMobile = mobile;
    const w = (heroSection ? heroSection.offsetWidth  : 0) || window.innerWidth;
    const h = (heroSection ? heroSection.offsetHeight : 0) || window.innerHeight;
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    wandHomeX = computeWandHomeX();
  }
  window.addEventListener('resize', onResize);
  onResize();
}
