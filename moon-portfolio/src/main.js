/* ============================================================
   oil-motion 风格的跟随效果
   —— 不用第三方库，用原生 JS 实现弹簧物理（spring physics），
      模拟 oil-motion 的手感：头部缓慢柔和地转向鼠标，
      眼球反应更快，女孩子整体还有一点点位移。
   ============================================================ */

/**
 * 一个阻尼弹簧。持续朝目标值靠拢，带惯性和轻微回弹。
 * 用固定步长积分（1/120s）保证不同帧率下手感一致。
 */
class Spring {
  constructor(value = 0, { stiffness = 120, damping = 18, precision = 0.01 } = {}) {
    this.value = value;
    this.target = value;
    this.velocity = 0;
    this.stiffness = stiffness;
    this.damping = damping;
    this.precision = precision;
  }
  set(target) {
    this.target = target;
  }
  /** dt: 秒 */
  step(dt) {
    // 固定步长积分，避免低帧率时发散
    const FIXED = 1 / 120;
    let remaining = Math.min(dt, 0.1);
    while (remaining > 0) {
      const h = Math.min(FIXED, remaining);
      remaining -= h;
      const force = -this.stiffness * (this.value - this.target) - this.damping * this.velocity;
      this.velocity += force * h;
      this.value += this.velocity * h;
    }
    if (Math.abs(this.value - this.target) < this.precision &&
        Math.abs(this.velocity) < this.precision) {
      this.value = this.target;
      this.velocity = 0;
    }
    return this.value;
  }
}

/* ---------- DOM ---------- */
const girl = document.getElementById('girl');
const head = document.querySelector('.girl-head');
const headInner = document.querySelector('.girl-head-inner');
const eyeL = document.querySelector('.girl-eye.l');
const eyeR = document.querySelector('.girl-eye.r');
const cardEls = Array.from(document.querySelectorAll('.card'));

if (girl && head) {
  /* ---------- 状态 ---------- */
  // 头部旋转（左右转头）
  const headRot = new Spring(0, { stiffness: 95, damping: 16 });
  // 头部水平位移（假 3D 视差）
  const headX = new Spring(0, { stiffness: 80, damping: 17 });
  // 眼球位移（反应更快，范围更大）
  const eyeX = new Spring(0, { stiffness: 210, damping: 20 });
  const eyeY = new Spring(0, { stiffness: 210, damping: 20 });
  // 女孩整体位移（很轻微）
  const bodyX = new Spring(0, { stiffness: 55, damping: 18 });
  const bodyY = new Spring(0, { stiffness: 55, damping: 18 });

  const MAX_ROT = 13;      // 头部最大转动角（度）
  const MAX_HEAD_X = 9;    // 头部水平位移上限（px）
  const MAX_EYE = 4.6;     // 眼球位移上限（px）
  const MAX_BODY = 5;      // 整体位移上限（px）

  let pointerInside = false;
  let mx = 0, my = 0;     // 相对女孩中心的归一化坐标 (-1 ~ 1)

  function updateTargets() {
    headRot.set(mx * MAX_ROT);
    headX.set(mx * MAX_HEAD_X);
    eyeX.set(mx * MAX_EYE);
    eyeY.set(my * MAX_EYE);
    bodyX.set(mx * MAX_BODY);
    bodyY.set(my * MAX_BODY * 0.7);
  }

  function onMove(e) {
    const r = girl.getBoundingClientRect();
    // 指针相对女孩中心的偏移，归一化到 -1 ~ 1
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height * 0.30;   // 以头部附近为基准
    mx = Math.max(-1, Math.min(1, (e.clientX - cx) / (r.width * 0.72)));
    my = Math.max(-1, Math.min(1, (e.clientY - cy) / (r.height * 0.55)));
    pointerInside = true;
    updateTargets();
  }

  function onLeave() {
    pointerInside = false;
    mx = 0; my = 0;
    updateTargets();
  }

  window.addEventListener('pointermove', onMove, { passive: true });
  window.addEventListener('pointerleave', onLeave);
  document.addEventListener('mouseleave', onLeave);
  // 触摸设备：点击/触摸时短暂跟随
  window.addEventListener('touchmove', (e) => {
    if (!e.touches || !e.touches.length) return;
    onMove(e.touches[0]);
  }, { passive: true });

  /* ---------- 渲染循环 ---------- */
  let last = performance.now();
  function frame(now) {
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;

    headRot.step(dt);
    headX.step(dt);
    eyeX.step(dt);
    eyeY.step(dt);
    bodyX.step(dt);
    bodyY.step(dt);

    head.style.setProperty('--head-rot', headRot.value.toFixed(3) + 'deg');
    if (headInner) headInner.style.setProperty('--head-x', headX.value.toFixed(2) + 'px');
    if (eyeL) {
      eyeL.style.setProperty('--ex', eyeX.value.toFixed(2) + 'px');
      eyeL.style.setProperty('--ey', eyeY.value.toFixed(2) + 'px');
    }
    if (eyeR) {
      eyeR.style.setProperty('--ex', eyeX.value.toFixed(2) + 'px');
      eyeR.style.setProperty('--ey', eyeY.value.toFixed(2) + 'px');
    }
    girl.style.setProperty('--gx', bodyX.value.toFixed(2) + 'px');
    girl.style.setProperty('--gy', bodyY.value.toFixed(2) + 'px');

    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

/* ============================================================
   卡片：轻微倾斜（跟随鼠标）+ hover 上浮
   ============================================================ */
cardEls.forEach((card) => {
  const inner = card;
  card.addEventListener('pointermove', (e) => {
    const r = card.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    inner.style.setProperty('--tilt-x', (-py * 4).toFixed(2) + 'deg');
    inner.style.setProperty('--tilt-y', (px * 5).toFixed(2) + 'deg');
  });
  card.addEventListener('pointerleave', () => {
    inner.style.setProperty('--tilt-x', '0deg');
    inner.style.setProperty('--tilt-y', '0deg');
  });
});

/* ============================================================
   平滑滚动：顶栏锚点偏移
   ============================================================ */
document.querySelectorAll('a[href^="#"]').forEach((a) => {
  a.addEventListener('click', (e) => {
    const id = a.getAttribute('href');
    if (!id || id === '#') return;
    const el = document.querySelector(id);
    if (!el) return;
    e.preventDefault();
    const top = el.getBoundingClientRect().top + window.scrollY - 76;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

/* ============================================================
   装饰：随机分布的星星位置微调 + 进场动画
   ============================================================ */
document.querySelectorAll('.star').forEach((s, i) => {
  s.style.left = `${4 + Math.random() * 92}%`;
  s.style.top = `${6 + Math.random() * 88}%`;
  s.style.setProperty('--dur', (2.8 + Math.random() * 2.4).toFixed(2) + 's');
  s.style.setProperty('--delay', (Math.random() * 3).toFixed(2) + 's');
});
document.querySelectorAll('.butterfly').forEach((b, i) => {
  b.style.setProperty('--dur', (8 + Math.random() * 6).toFixed(2) + 's');
  b.style.setProperty('--delay', (Math.random() * 4).toFixed(2) + 's');
});

/* 页面载入时的淡入 */
document.body.classList.add('is-loaded');
