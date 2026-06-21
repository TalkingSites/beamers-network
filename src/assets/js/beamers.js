/* Beamers Network */

/* ─── Starfield canvas ────────────────────────────────────── */
function initStarfield() {
  const canvas = document.getElementById('starfield');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function resize() {
    const hero = canvas.parentElement;
    canvas.width  = hero ? hero.offsetWidth  : window.innerWidth;
    canvas.height = hero ? hero.offsetHeight : window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const stars = Array.from({ length: 180 }, () => ({
    x:    Math.random() * canvas.width,
    y:    Math.random() * canvas.height,
    r:    Math.random() * 1.4 + 0.3,
    op:   Math.random(),
    spd:  Math.random() * 0.008 + 0.003,
    dir:  Math.random() > 0.5 ? 1 : -1,
    gold: Math.random() < 0.15,
  }));

  const shooters = [];
  setInterval(function () {
    shooters.push({
      x: Math.random() * canvas.width * 0.8,
      y: Math.random() * canvas.height * 0.4,
      len: Math.random() * 80 + 40,
      spd: Math.random() * 6 + 4,
      angle: Math.PI / 5,
      life: 1,
      decay: Math.random() * 0.015 + 0.012,
    });
  }, 4500);

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    stars.forEach(function (s) {
      s.op += s.spd * s.dir;
      if (s.op >= 1) { s.op = 1; s.dir = -1; }
      if (s.op <= 0) { s.op = 0; s.dir = 1; }
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = s.gold
        ? 'rgba(245,200,66,' + (s.op * 0.9) + ')'
        : 'rgba(240,238,233,' + (s.op * 0.6) + ')';
      ctx.fill();
    });
    for (var i = shooters.length - 1; i >= 0; i--) {
      var sh = shooters[i];
      ctx.save();
      ctx.globalAlpha = sh.life * 0.7;
      ctx.strokeStyle = 'rgba(245,200,66,0.9)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(sh.x, sh.y);
      ctx.lineTo(sh.x - Math.cos(sh.angle) * sh.len, sh.y - Math.sin(sh.angle) * sh.len);
      ctx.stroke();
      ctx.restore();
      sh.x += Math.cos(sh.angle) * sh.spd;
      sh.y += Math.sin(sh.angle) * sh.spd;
      sh.life -= sh.decay;
      if (sh.life <= 0) shooters.splice(i, 1);
    }
    requestAnimationFrame(draw);
  }
  draw();
}

/* ─── Three.js wand (see wand3d.js ES module) ────────────── */
function initWand3D_UNUSED() {
  var container = document.getElementById('wand-3d');
  if (!container || typeof THREE === 'undefined') return;

  var W = 420, H = 460;

  /* Renderer */
  var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(W, H);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.35;
  container.appendChild(renderer.domElement);

  /* Scene + camera */
  var scene  = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(40, W / H, 0.1, 50);
  camera.position.set(0, 0, 9);

  /* Lights */
  scene.add(new THREE.AmbientLight(0x1A1040, 0.8));

  var key = new THREE.DirectionalLight(0xF8E090, 2.4);
  key.position.set(-3, 5, 5);
  scene.add(key);

  var fill = new THREE.DirectionalLight(0x4030A0, 0.65);
  fill.position.set(5, -2, 2);
  scene.add(fill);

  var rim = new THREE.DirectionalLight(0x8060FF, 0.4);
  rim.position.set(0, -5, -2);
  scene.add(rim);

  var tipLight = new THREE.PointLight(0xF5C842, 2.5, 6);
  scene.add(tipLight);

  /* Materials */
  var goldMat = new THREE.MeshStandardMaterial({
    color: 0xC8A030, metalness: 0.92, roughness: 0.08,
  });
  var darkGoldMat = new THREE.MeshStandardMaterial({
    color: 0x7A5010, metalness: 0.85, roughness: 0.18,
  });
  var handleMat = new THREE.MeshStandardMaterial({
    color: 0x2D1F5E, metalness: 0.62, roughness: 0.28,
  });
  var ringMat = new THREE.MeshStandardMaterial({
    color: 0xF5C842, metalness: 0.96, roughness: 0.04,
    emissive: 0xC08010, emissiveIntensity: 0.22,
  });
  var starMat = new THREE.MeshStandardMaterial({
    color: 0xF5C842, metalness: 0.82, roughness: 0.06,
    emissive: 0xF5C842, emissiveIntensity: 0.38,
  });

  /* Wand group */
  var wand = new THREE.Group();

  /* Body: tapered cylinder (radiusTop at +Y tip, radiusBottom at handle) */
  wand.add(Object.assign(
    new THREE.Mesh(new THREE.CylinderGeometry(0.048, 0.098, 3.1, 22, 1), goldMat),
    { position: new THREE.Vector3(0, -0.18, 0) }
  ));

  /* Handle */
  wand.add(Object.assign(
    new THREE.Mesh(new THREE.CylinderGeometry(0.098, 0.118, 0.82, 22, 1), handleMat),
    { position: new THREE.Vector3(0, -1.98, 0) }
  ));

  /* Gold wrap rings */
  [-1.70, -1.93, -2.16].forEach(function (y) {
    var ring = new THREE.Mesh(new THREE.TorusGeometry(0.132, 0.022, 12, 26), ringMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = y;
    wand.add(ring);
  });

  /* Handle end cap */
  wand.add(Object.assign(
    new THREE.Mesh(new THREE.SphereGeometry(0.128, 16, 12), handleMat),
    { position: new THREE.Vector3(0, -2.40, 0) }
  ));

  /* Cap accent band */
  var capBand = new THREE.Mesh(new THREE.TorusGeometry(0.118, 0.017, 10, 22), ringMat);
  capBand.rotation.x = Math.PI / 2;
  capBand.position.y = -2.27;
  wand.add(capBand);

  /* Extruded 5-pointed star at tip */
  function buildStarShape(outer, inner, pts) {
    var shape = new THREE.Shape();
    for (var i = 0; i < pts * 2; i++) {
      var a = (i / (pts * 2)) * Math.PI * 2 - Math.PI / 2;
      var r = i % 2 === 0 ? outer : inner;
      var x = Math.cos(a) * r, y = Math.sin(a) * r;
      i === 0 ? shape.moveTo(x, y) : shape.lineTo(x, y);
    }
    shape.closePath();
    return shape;
  }

  var starGeo = new THREE.ExtrudeGeometry(buildStarShape(0.30, 0.12, 5), {
    depth: 0.14,
    bevelEnabled: true,
    bevelThickness: 0.032,
    bevelSize: 0.030,
    bevelSegments: 5,
  });
  starGeo.center();

  var starMesh = new THREE.Mesh(starGeo, starMat);
  starMesh.position.y = 1.72;
  /* Lay star flat (perpendicular to wand axis) */
  starMesh.rotation.x = Math.PI / 2;
  wand.add(starMesh);

  /* Glow sprite (canvas-based radial gradient, additive blending) */
  function makeGlowSprite() {
    var sz = 128;
    var c  = document.createElement('canvas');
    c.width = c.height = sz;
    var cx = c.getContext('2d');
    var g  = cx.createRadialGradient(sz/2, sz/2, 0, sz/2, sz/2, sz/2);
    g.addColorStop(0,    'rgba(255,242,160,1)');
    g.addColorStop(0.18, 'rgba(245,200,66,0.88)');
    g.addColorStop(0.50, 'rgba(245,180,30,0.30)');
    g.addColorStop(1,    'rgba(245,180,30,0)');
    cx.fillStyle = g;
    cx.fillRect(0, 0, sz, sz);
    var sp = new THREE.Sprite(new THREE.SpriteMaterial({
      map: new THREE.CanvasTexture(c),
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }));
    sp.scale.set(1.1, 1.1, 1);
    return sp;
  }

  var glow = makeGlowSprite();
  glow.position.y = 1.72;
  wand.add(glow);

  scene.add(wand);

  /* Particles */
  var particles = [];

  function spawnParticles(worldPos) {
    for (var i = 0; i < 20; i++) {
      var sz  = 0.020 + Math.random() * 0.030;
      var mat = new THREE.MeshBasicMaterial({
        color: Math.random() > 0.28 ? 0xF5C842 : 0xFFFFFF,
        transparent: true, depthWrite: false,
      });
      var mesh = new THREE.Mesh(new THREE.SphereGeometry(sz, 5, 4), mat);
      mesh.position.copy(worldPos);
      scene.add(mesh);

      var spd = 0.045 + Math.random() * 0.07;
      var phi = Math.random() * Math.PI * 2;
      var the = Math.random() * Math.PI;
      particles.push({
        mesh: mesh,
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

  /* Animation */
  var CYCLE        = 5.0;
  var TAP_T        = 0.54;
  var elapsed      = 0;
  var lastTapCycle = -1;
  var selfSpin     = 0;
  var prevTime     = performance.now();
  var tipWorldPos  = new THREE.Vector3();
  var upAxis       = new THREE.Vector3(0, 1, 0);

  /* Tilted elliptical orbit — X/Y motion with Z component for depth */
  function orbitPos(t) {
    var a    = t * Math.PI * 2;
    var tilt = 0.42;
    return new THREE.Vector3(
      1.65 * Math.cos(a),
      1.20 * Math.sin(a) * Math.cos(tilt),
      1.20 * Math.sin(a) * Math.sin(tilt) * 0.75
    );
  }

  function loop() {
    requestAnimationFrame(loop);

    var now = performance.now();
    var dt  = Math.min((now - prevTime) / 1000, 0.05);
    prevTime = now;
    elapsed += dt;

    var t = (elapsed % CYCLE) / CYCLE;

    /* Move wand along orbit */
    var pos     = orbitPos(t);
    var nextPos = orbitPos(((elapsed % CYCLE) + 0.14) / CYCLE);
    wand.position.copy(pos);

    /* Orient wand: tip (+Y) points along direction of travel */
    var dir = nextPos.clone().sub(pos).normalize();
    var dot = dir.dot(upAxis);
    if (Math.abs(dot) < 0.9995) {
      var baseQ  = new THREE.Quaternion().setFromUnitVectors(upAxis, dir);
      selfSpin  += dt * 0.48;
      var spinQ  = new THREE.Quaternion().setFromAxisAngle(dir, selfSpin);
      wand.quaternion.multiplyQuaternions(spinQ, baseQ);
    }

    /* Slow Z-axis wobble for organic feel */
    starMesh.rotation.z += dt * 1.0;

    /* Track tip in world space */
    tipWorldPos.set(0, 1.72, 0);
    tipWorldPos.applyQuaternion(wand.quaternion);
    tipWorldPos.add(wand.position);
    tipLight.position.copy(tipWorldPos);

    /* Glow pulse */
    var pulse = 1.0 + 0.28 * Math.sin(elapsed * 3.8);
    glow.scale.set(pulse, pulse, 1);

    /* Scale wand slightly larger when near (perspective depth cue) */
    var s = 1.0 + wand.position.z * 0.065;
    wand.scale.setScalar(s);

    /* Tap behaviour */
    var distToTap = Math.abs(t - TAP_T);
    var cyc       = Math.floor(elapsed / CYCLE);

    if (distToTap < 0.06) {
      tipLight.intensity   += (7.0  - tipLight.intensity) * 0.14;
      starMat.emissiveIntensity += (1.6 - starMat.emissiveIntensity) * 0.14;
      glow.scale.setScalar(2.6);
    } else {
      tipLight.intensity   += (2.2  - tipLight.intensity) * 0.05;
      starMat.emissiveIntensity += (0.38 - starMat.emissiveIntensity) * 0.04;
    }

    if (distToTap < 0.018 && cyc !== lastTapCycle) {
      lastTapCycle = cyc;
      spawnParticles(tipWorldPos.clone());
    }

    /* Particle update */
    for (var i = particles.length - 1; i >= 0; i--) {
      var p = particles[i];
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

  /* Responsive resize */
  function onResize() {
    var w = Math.min(container.offsetWidth || W, W);
    var h = Math.round(w * H / W);
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  window.addEventListener('resize', onResize);
  onResize();
}

/* ─── Wish card cycling ───────────────────────────────────── */
function initWishCycle() {
  var cards = document.querySelectorAll('.wish-card');
  if (!cards.length) return;
  var current  = 0;
  var CYCLE_MS = 5000;
  var TAP_MS   = 2700;

  function activate(idx) {
    cards.forEach(function (c, i) {
      c.classList.remove('active', 'tapped');
      if (i === idx) c.classList.add('active');
    });
    setTimeout(function () {
      if (cards[idx]) cards[idx].classList.add('tapped');
    }, TAP_MS);
  }

  activate(0);
  setInterval(function () {
    current = (current + 1) % cards.length;
    activate(current);
  }, CYCLE_MS);
}

/* ─── Smooth scroll ───────────────────────────────────────── */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      var target = document.querySelector(this.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}

/* ─── Wand tap headline light-up ─────────────────────────── */
function initWandTapEffect() {
  const headline = document.querySelector('.hero-headline');
  if (!headline) return;
  window.addEventListener('wand-tap', function () {
    headline.classList.remove('wand-lit');
    void headline.offsetWidth;
    headline.classList.add('wand-lit');
  });
}

document.addEventListener('DOMContentLoaded', function () {
  initStarfield();
  initWishCycle();
  initSmoothScroll();
  initWandTapEffect();
});
