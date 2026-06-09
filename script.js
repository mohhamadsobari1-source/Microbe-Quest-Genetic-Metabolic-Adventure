// ===== DATA =====
const arenaQuestions = [
  { q: "Organel yang menjadi tempat sintesis protein pada sel prokariotik?", opts: ["Ribosom", "Mitokondria", "Nukleus", "Lisosom"], ans: 0, pts: 100, fact: "Ribosom 70S ada di bakteri, berbeda dengan 80S di eukariot!" },
  { q: "Proses replikasi DNA menggunakan enzim utama?", opts: ["RNA Polimerase", "DNA Polimerase", "Lipase", "Amilase"], ans: 1, pts: 120, fact: "DNA Polimerase III adalah enzim utama replikasi DNA pada prokariot!" },
  { q: "Hukum Mendel pertama dikenal sebagai hukum?", opts: ["Dominansi", "Segregasi", "Asortasi", "Rekombinasi"], ans: 1, pts: 100, fact: "Hukum Segregasi: alel berpasangan memisah saat pembentukan gamet!" },
  { q: "Proses fermentasi laktat menghasilkan produk akhir berupa?", opts: ["Etanol", "CO₂", "Asam laktat", "Asam asetat"], ans: 2, pts: 130, fact: "Lactobacillus mengubah piruvat → asam laktat untuk regenerasi NAD⁺!" },
  { q: "Materi genetik pada virus HIV adalah?", opts: ["DNA ganda", "DNA tunggal", "RNA ganda", "RNA tunggal"], ans: 3, pts: 150, fact: "HIV adalah retrovirus dengan RNA untai tunggal yang ditranskripsi balik menjadi DNA!" },
  { q: "Siklus Krebs berlangsung di?", opts: ["Sitosol", "Ribosom", "Matriks mitokondria", "Membran inti"], ans: 2, pts: 140, fact: "Siklus Krebs atau siklus asam sitrat terjadi di matriks mitokondria!" },
  { q: "Kodon yang menjadi sinyal STOP saat translasi?", opts: ["AUG", "UAA", "GGC", "CCC"], ans: 1, pts: 120, fact: "UAA, UAG, dan UGA adalah tiga kodon stop—juga disebut kodon nonsense!" },
  { q: "Plasmid pada bakteri berfungsi sebagai?", opts: ["Membran sel", "DNA ekstrakromosomal", "Ribosom tambahan", "Vakuola cadangan"], ans: 1, pts: 110, fact: "Plasmid adalah DNA sirkular kecil yang dapat bereplikasi bebas—dasar rekayasa genetika!" },
  { q: "Proses pembuatan RNA dari DNA disebut?", opts: ["Translasi", "Replikasi", "Transkripsi", "Transformasi"], ans: 2, pts: 100, fact: "Transkripsi menghasilkan mRNA yang kemudian ditranslasi menjadi protein!" },
  { q: "Pada genetika populasi, keseimbangan Hardy-Weinberg terjadi jika?", opts: ["Ada seleksi alam", "Populasi kecil", "Tidak ada mutasi", "Ada migrasi"], ans: 2, pts: 160, fact: "5 syarat H-W: populasi besar, kawin acak, tidak ada mutasi/migrasi/seleksi!" },
];

const ddQuestions = [
  {
    q: "Seret setiap komponen ke kelompok yang benar: Organel Sel Prokariotik vs Eukariotik",
    items: ["Ribosom 70S", "Mitokondria", "Nukleus", "Plasmid", "Retikulum Endoplasma", "Kloroplas"],
    zones: [
      { label: "🦠 Sel Prokariotik", correct: ["Ribosom 70S", "Plasmid"] },
      { label: "🌿 Sel Eukariotik", correct: ["Mitokondria", "Nukleus", "Retikulum Endoplasma", "Kloroplas"] },
    ]
  },
  {
    q: "Kelompokkan molekul berikut ke dalam Anabolisme (membangun) atau Katabolisme (memecah):",
    items: ["Sintesis protein", "Glikolisis", "Siklus Krebs", "Sintesis DNA", "Fosforilasi oksidatif", "Glukoneogenesis"],
    zones: [
      { label: "⬆️ Anabolisme", correct: ["Sintesis protein", "Sintesis DNA", "Glukoneogenesis"] },
      { label: "⬇️ Katabolisme", correct: ["Glikolisis", "Siklus Krebs", "Fosforilasi oksidatif"] },
    ]
  },
  {
    q: "Susun tahap replikasi DNA dari DNA → DNA baru (seret ke Urutan 1, 2, 3):",
    items: ["Elongasi untai", "Penempelan primer", "Inisiasi di origin of replication"],
    zones: [
      { label: "Langkah 1", correct: ["Inisiasi di origin of replication"] },
      { label: "Langkah 2", correct: ["Penempelan primer"] },
      { label: "Langkah 3", correct: ["Elongasi untai"] },
    ]
  }
];

// ===== STATE =====
let gameMode = 'arena';
let score = 0, lives = 3, correct = 0, wrong = 0;
let currentQ = 0;
let arenaActive = false;
let keys = {};
let player = { x: 280, y: 200, vx: 0, vy: 0, size: 18 };
let answerCards = [];
let pendingResult = null;
let prizeTimer, obsTimer;
let ddCurrentIdx = 0;
let ddScore = 0, ddWrong = 0;
let currentObstacle = false;
let animFrame;
let playerName = '';

const CANVAS_W = 640, CANVAS_H = 420;
const CARD_W = 130, CARD_H = 52;
const SPEED = 3.2;
const FRICTION = 0.82;
const CARD_POSITIONS = [
  { x: 80,  y: 60 },   // top-left
  { x: 430, y: 60 },   // top-right
  { x: 80,  y: 330 },  // bot-left
  { x: 430, y: 330 },  // bot-right
];

function selectMode(m) {
  gameMode = m;
  document.querySelectorAll('.mode-card').forEach(c => c.classList.remove('selected'));
  document.getElementById('mode-' + m).classList.add('selected');
}

function startGame() {
  score = 0; lives = 3; correct = 0; wrong = 0; currentQ = 0;
  // Read player name input (optional)
  const pn = document.getElementById('player-name');
  playerName = pn && pn.value.trim() ? pn.value.trim() : 'Pemain';
  if (gameMode === 'arena') {
    showScreen('arena');
    loadArenaQ();
    if (animFrame) cancelAnimationFrame(animFrame);
    arenaActive = true;
    loop();
  } else {
    ddCurrentIdx = 0; ddScore = 0; ddWrong = 0;
    showScreen('dragdrop');
    loadDDQ();
  }
}

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

function goMenu() {
  arenaActive = false;
  if (animFrame) cancelAnimationFrame(animFrame);
  showScreen('menu');
}

// ===== ARENA =====
function loadArenaQ() {
  const qi = currentQ % arenaQuestions.length;
  const q = arenaQuestions[qi];
  document.getElementById('arena-q').textContent = q.q;
  document.getElementById('score-display').textContent = score;
  document.getElementById('level-display').textContent = Math.floor(currentQ / 5) + 1;
  document.getElementById('qnum-display').textContent = (currentQ % 5) + 1;
  updateLives();

  // Reset player
  player.x = CANVAS_W / 2 - player.size;
  player.y = CANVAS_H / 2 - player.size;
  player.vx = 0; player.vy = 0;

  // Shuffle answer positions
  const shuffled = [...CARD_POSITIONS].sort(() => Math.random() - 0.5);
  answerCards = q.opts.map((opt, i) => ({
    text: opt,
    x: shuffled[i].x, y: shuffled[i].y,
    w: CARD_W, h: CARD_H,
    isCorrect: i === q.ans,
    color: ['#534AB7', '#1D9E75', '#D85A30', '#185FA5'][i],
    hit: false,
  }));
  pendingResult = null;
  currentObstacle = false;
}

function updateLives() {
  document.getElementById('lives-display').textContent = '❤️'.repeat(Math.max(0,lives));
}

function checkCollision() {
  if (pendingResult !== null || currentObstacle) return;
  const px = player.x, py = player.y, ps = player.size;
  for (let card of answerCards) {
    if (px + ps > card.x + 8 && px < card.x + card.w - 8 &&
        py + ps > card.y + 8 && py < card.y + card.h - 8) {
      if (card.isCorrect) {
        showPrize();
        card.hit = true;
      } else {
        showObstacle(card.text);
      }
      break;
    }
  }
}

function showPrize() {
  const qi = currentQ % arenaQuestions.length;
  const q = arenaQuestions[qi];
  score += q.pts; correct++;
  document.getElementById('score-display').textContent = score;
  document.getElementById('prize-pts').textContent = '+' + q.pts + ' pts';
  document.getElementById('prize-fact').textContent = q.fact;
  const pp = document.getElementById('prize-popup');
  pp.classList.add('show');
  pendingResult = 'correct';
  clearTimeout(prizeTimer);
  prizeTimer = setTimeout(() => {
    pp.classList.remove('show');
    currentQ++;
    if (currentQ >= arenaQuestions.length) {
      endArena();
    } else {
      loadArenaQ();
    }
  }, 2200);
}

function showObstacle(wrongAnswer) {
  wrong++;
  lives = Math.max(0, lives - 1);
  updateLives();
  const obsEl = document.getElementById('obs-overlay');
  document.getElementById('obs-desc').textContent = '"' + wrongAnswer + '" bukan jawabannya. Cari kartu yang benar!';
  obsEl.classList.add('show');
  currentObstacle = true;

  // Bounce player back to center
  player.x = CANVAS_W / 2 - player.size;
  player.y = CANVAS_H / 2 - player.size;
  player.vx = (Math.random() - 0.5) * 6;
  player.vy = (Math.random() - 0.5) * 6;

  clearTimeout(obsTimer);
  obsTimer = setTimeout(() => {
    obsEl.classList.remove('show');
    currentObstacle = false;
    if (lives <= 0) { endArena(); }
  }, 1800);
}

function endArena() {
  arenaActive = false;
  if (animFrame) cancelAnimationFrame(animFrame);
  showResult(gameMode);
}

function loop() {
  if (!arenaActive) return;
  const canvas = document.getElementById('arena-canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = CANVAS_W; canvas.height = CANVAS_H;

  // Move player
  if (keys['w'] || keys['arrowup'])    player.vy -= SPEED;
  if (keys['s'] || keys['arrowdown'])  player.vy += SPEED;
  if (keys['a'] || keys['arrowleft'])  player.vx -= SPEED;
  if (keys['d'] || keys['arrowright']) player.vx += SPEED;
  player.vx *= FRICTION; player.vy *= FRICTION;
  if (Math.abs(player.vx) < 0.05) player.vx = 0;
  if (Math.abs(player.vy) < 0.05) player.vy = 0;
  player.x = Math.max(0, Math.min(CANVAS_W - player.size*2, player.x + player.vx));
  player.y = Math.max(0, Math.min(CANVAS_H - player.size*2, player.y + player.vy));

  checkCollision();
  draw(ctx);
  animFrame = requestAnimationFrame(loop);
}

function draw(ctx) {
  // Background
  ctx.fillStyle = '#0a1628';
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

  // Grid
  ctx.strokeStyle = 'rgba(93,202,165,0.06)';
  ctx.lineWidth = 1;
  for (let x = 0; x < CANVAS_W; x += 40) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,CANVAS_H); ctx.stroke(); }
  for (let y = 0; y < CANVAS_H; y += 40) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(CANVAS_W,y); ctx.stroke(); }

  // Floating particles
  const t = Date.now() / 1000;
  for (let i = 0; i < 8; i++) {
    const px2 = (Math.sin(t * 0.5 + i * 1.3) * 0.4 + 0.5) * CANVAS_W;
    const py2 = (Math.cos(t * 0.4 + i * 0.9) * 0.4 + 0.5) * CANVAS_H;
    ctx.beginPath();
    ctx.arc(px2, py2, 2, 0, Math.PI*2);
    ctx.fillStyle = `rgba(93,202,165,${0.15 + 0.1 * Math.sin(t + i)})`;
    ctx.fill();
  }

  // Answer cards
  for (let card of answerCards) {
    if (card.hit) continue;
    const glow = pendingResult === null && !currentObstacle;
    const bounce = Math.sin(t * 1.8 + answerCards.indexOf(card)) * 2;

    ctx.save();
    ctx.shadowColor = card.color;
    ctx.shadowBlur = glow ? 12 : 0;
    roundRect(ctx, card.x, card.y + bounce, card.w, card.h, 10);
    ctx.fillStyle = card.color + '44';
    ctx.fill();
    ctx.strokeStyle = card.color;
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();

    ctx.fillStyle = '#fff';
    ctx.font = '600 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    wrapText(ctx, card.text, card.x + card.w/2, card.y + card.h/2 + bounce, card.w - 16, 15);
  }

  // Player
  const pulseR = player.size + Math.sin(t * 4) * 2;
  ctx.beginPath();
  ctx.arc(player.x + player.size, player.y + player.size, pulseR + 6, 0, Math.PI*2);
  ctx.fillStyle = 'rgba(93,202,165,0.12)';
  ctx.fill();

  // Player body (cell shape)
  ctx.save();
  ctx.shadowColor = '#5DCAA5';
  ctx.shadowBlur = 15;
  ctx.beginPath();
  ctx.arc(player.x + player.size, player.y + player.size, player.size, 0, Math.PI*2);
  ctx.fillStyle = '#1D9E75';
  ctx.fill();
  ctx.strokeStyle = '#5DCAA5';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();

  // Cell nucleus
  ctx.beginPath();
  ctx.arc(player.x + player.size, player.y + player.size, player.size * 0.42, 0, Math.PI*2);
  ctx.fillStyle = 'rgba(255,255,255,0.3)';
  ctx.fill();

  // Player direction indicator
  const vlen = Math.sqrt(player.vx**2 + player.vy**2);
  if (vlen > 0.5) {
    const angle = Math.atan2(player.vy, player.vx);
    ctx.save();
    ctx.translate(player.x + player.size, player.y + player.size);
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.moveTo(player.size + 4, 0);
    ctx.lineTo(player.size + 10, -4);
    ctx.lineTo(player.size + 10, 4);
    ctx.closePath();
    ctx.fillStyle = '#9FE1CB';
    ctx.fill();
    ctx.restore();
  }

  // Path lines to cards (guide lines)
  if (!pendingResult && !currentObstacle) {
    for (let card of answerCards) {
      if (card.hit) continue;
      const cx = card.x + card.w/2, cy = card.y + card.h/2;
      const dx = cx - (player.x + player.size), dy = cy - (player.y + player.size);
      const dist = Math.sqrt(dx*dx + dy*dy);
      if (dist < 140) {
        ctx.beginPath();
        ctx.moveTo(player.x + player.size, player.y + player.size);
        ctx.lineTo(cx, cy);
        ctx.strokeStyle = `rgba(93,202,165,${0.15 * (1 - dist/140)})`;
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 6]);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }
  }
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x+r, y);
  ctx.lineTo(x+w-r, y);
  ctx.quadraticCurveTo(x+w, y, x+w, y+r);
  ctx.lineTo(x+w, y+h-r);
  ctx.quadraticCurveTo(x+w, y+h, x+w-r, y+h);
  ctx.lineTo(x+r, y+h);
  ctx.quadraticCurveTo(x, y+h, x, y+h-r);
  ctx.lineTo(x, y+r);
  ctx.quadraticCurveTo(x, y, x+r, y);
  ctx.closePath();
}

function wrapText(ctx, text, cx, cy, maxW, lineH) {
  const words = text.split(' ');
  let line = '';
  const lines = [];
  for (let w of words) {
    const test = line + w + ' ';
    if (ctx.measureText(test).width > maxW && line) { lines.push(line.trim()); line = w + ' '; }
    else line = test;
  }
  if (line) lines.push(line.trim());
  const startY = cy - ((lines.length - 1) * lineH) / 2;
  lines.forEach((l, i) => ctx.fillText(l, cx, startY + i * lineH));
}

// Canvas click
document.getElementById('arena-canvas').addEventListener('click', (e) => {
  if (pendingResult !== null || currentObstacle) return;
  const rect = e.target.getBoundingClientRect();
  const scaleX = CANVAS_W / rect.width, scaleY = CANVAS_H / rect.height;
  const mx = (e.clientX - rect.left) * scaleX, my = (e.clientY - rect.top) * scaleY;
  for (let card of answerCards) {
    if (card.hit) continue;
    if (mx > card.x && mx < card.x + card.w && my > card.y && my < card.y + card.h) {
      player.x = card.x + card.w/2 - player.size;
      player.y = card.y + card.h/2 - player.size;
      setTimeout(() => checkCollision(), 120);
      break;
    }
  }
});

// Keyboard
document.addEventListener('keydown', e => {
  keys[e.key.toLowerCase()] = true;
  if (['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright'].includes(e.key.toLowerCase())) e.preventDefault();
});
document.addEventListener('keyup', e => { keys[e.key.toLowerCase()] = false; });

// ===== DRAG DROP =====
let dragItem = null, dragOrigin = null;

function loadDDQ() {
  const q = ddQuestions[ddCurrentIdx % ddQuestions.length];
  document.getElementById('dd-question').textContent = q.q;

  const bank = document.getElementById('dd-bank');
  bank.innerHTML = '';
  const shuffledItems = [...q.items].sort(() => Math.random() - 0.5);
  shuffledItems.forEach(item => {
    const el = createDDItem(item, 'bank');
    bank.appendChild(el);
  });

  const zonesC = document.getElementById('dd-zones-container');
  zonesC.innerHTML = '';
  q.zones.forEach((zone, zi) => {
    const zEl = document.createElement('div');
    zEl.className = 'dd-zone';
    zEl.dataset.zone = zi;
    zEl.innerHTML = `<div class="dd-zone-label">${zone.label}</div>`;
    zEl.addEventListener('dragover', e => { e.preventDefault(); zEl.classList.add('drag-over'); });
    zEl.addEventListener('dragleave', () => zEl.classList.remove('drag-over'));
    zEl.addEventListener('drop', e => { e.preventDefault(); zEl.classList.remove('drag-over'); dropToZone(zEl); });
    // pointer support for touch devices
    zEl.addEventListener('pointerup', e => { e.preventDefault(); zEl.classList.remove('drag-over'); dropToZone(zEl); });
    zonesC.appendChild(zEl);
  });
}

function createDDItem(text, origin) {
  const el = document.createElement('div');
  el.className = 'dd-item';
  el.textContent = text;
  el.draggable = true;
  el.dataset.item = text;
  el.dataset.origin = origin;
  el.addEventListener('dragstart', e => {
    dragItem = text;
    dragOrigin = el.parentElement;
    el.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
  });
  // Pointer support: set drag origin for touch/pointer interactions
  el.addEventListener('pointerdown', e => { dragItem = text; dragOrigin = el.parentElement; el.classList.add('dragging'); e.preventDefault(); });
  el.addEventListener('pointerup', e => { /* pointerup handled by zone/bank handlers */ });
  el.addEventListener('pointercancel', () => { dragItem = null; dragOrigin = null; el.classList.remove('dragging'); });
  el.addEventListener('dragend', () => el.classList.remove('dragging'));
  return el;
}

function dropToZone(zoneEl) {
  if (!dragItem) return;
  if (dragOrigin) {
    const existing = dragOrigin.querySelector(`[data-item="${CSS.escape(dragItem)}"]`);
    if (existing) existing.remove();
  }
  // Remove from any zone it was already in
  document.querySelectorAll('.dd-zone').forEach(z => {
    const it = z.querySelector(`[data-item="${CSS.escape(dragItem)}"]`);
    if (it) it.remove();
  });
  const newEl = createDDItem(dragItem, 'zone');
  zoneEl.appendChild(newEl);
  dragItem = null; dragOrigin = null;
}

// Allow dropping back to bank
document.getElementById('dd-bank').addEventListener('dragover', e => e.preventDefault());
document.getElementById('dd-bank').addEventListener('drop', e => {
  e.preventDefault();
  if (!dragItem) return;
  document.querySelectorAll('.dd-zone').forEach(z => {
    const it = z.querySelector(`[data-item="${CSS.escape(dragItem)}"]`);
    if (it) it.remove();
  });
  const newEl = createDDItem(dragItem, 'bank');
  document.getElementById('dd-bank').appendChild(newEl);
  dragItem = null;
});
// pointerup on bank to support touch devices
document.getElementById('dd-bank').addEventListener('pointerup', e => {
  e.preventDefault();
  if (!dragItem) return;
  document.querySelectorAll('.dd-zone').forEach(z => {
    const it = z.querySelector(`[data-item="${CSS.escape(dragItem)}"]`);
    if (it) it.remove();
  });
  const newEl = createDDItem(dragItem, 'bank');
  document.getElementById('dd-bank').appendChild(newEl);
  dragItem = null; dragOrigin = null;
});

function checkDragDrop() {
  const q = ddQuestions[ddCurrentIdx % ddQuestions.length];
  let localCorrect = 0, localTotal = 0;
  const details = [];

  q.zones.forEach((zone, zi) => {
    const zEl = document.querySelector(`.dd-zone[data-zone="${zi}"]`);
    const placed = [...zEl.querySelectorAll('.dd-item')].map(el => el.dataset.item);
    zone.correct.forEach(correctItem => {
      localTotal++;
      if (placed.includes(correctItem)) localCorrect++;
      else details.push(`"${correctItem}" seharusnya di ${zone.label}`);
    });
    placed.forEach(item => {
      if (!zone.correct.includes(item)) details.push(`"${item}" salah ditempatkan`);
    });
  });

  const isWin = localCorrect === localTotal && details.filter(d => d.includes('salah')).length === 0;
  ddScore += isWin ? 200 : Math.floor(localCorrect / localTotal * 100);
  if (!isWin) ddWrong++;
  score = ddScore; correct += localCorrect > 0 ? 1 : 0; wrong += isWin ? 0 : 1;

  ddCurrentIdx++;
  if (ddCurrentIdx >= ddQuestions.length) {
    showResult('dragdrop');
  } else {
    // Show quick feedback then next question
    const btn = document.querySelector('.dd-check-btn');
    if (isWin) {
      btn.textContent = '✅ Benar! Lanjut...';
      btn.style.background = '#1D9E75';
    } else {
      btn.textContent = `⚠️ ${localCorrect}/${localTotal} benar. Lanjut...`;
      btn.style.background = '#993C1D';
      const infos = details.slice(0,2);
      const infoEl = document.createElement('p');
      infoEl.style.cssText = 'color:#FAC775;font-size:12px;text-align:center;margin-top:8px';
      infoEl.textContent = infos.join(' · ');
      document.getElementById('dragdrop').appendChild(infoEl);
      setTimeout(() => infoEl.remove(), 2000);
    }
    setTimeout(() => {
      btn.textContent = '✅ Selesai & Cek Jawaban';
      btn.style.background = '';
      loadDDQ();
    }, 1800);
  }
}

// ===== RESULT =====
function showResult(mode) {
  showScreen('result');
  const isGood = correct >= (mode === 'arena' ? 5 : 2);
  document.getElementById('res-emoji').textContent = isGood ? '🏆' : '💪';
  document.getElementById('res-title').textContent = isGood ? 'Luar Biasa!' : 'Terus Belajar!';
  document.getElementById('res-title').className = 'result-title ' + (isGood ? 'win' : 'lose');
  // show player name if provided
  const rp = document.getElementById('res-player');
  if (rp) rp.textContent = playerName ? `Pemain: ${playerName}` : '';
  document.getElementById('res-msg').textContent = isGood
    ? 'Kamu menguasai Genetika & Metabolisme Mikrobiologi dengan sangat baik! Skor tinggi terkumpul!'
    : 'Jangan menyerah! Setiap percobaan membuat kamu lebih paham ilmu biologi sel. Coba lagi!';
  document.getElementById('res-score').textContent = score;
  document.getElementById('res-correct').textContent = correct;
  document.getElementById('res-wrong').textContent = wrong;
}

// expose helpers
window.selectMode = selectMode;
window.startGame = startGame;
window.goMenu = goMenu;
window.checkDragDrop = checkDragDrop;

// Movement keys (already used by loop)
document.addEventListener('keydown', e => { keys[e.key.toLowerCase()] = true; if (['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright'].includes(e.key.toLowerCase())) e.preventDefault(); });
document.addEventListener('keyup', e => { keys[e.key.toLowerCase()] = false; });

// Mobile joystick buttons
function bindJoyBtn(id, key) {
  const el = document.getElementById(id);
  if (!el) return;
  el.addEventListener('pointerdown', e => { keys[key] = true; e.preventDefault(); });
  el.addEventListener('pointerup', e => { keys[key] = false; e.preventDefault(); });
  el.addEventListener('pointercancel', e => { keys[key] = false; });
  el.addEventListener('pointerleave', e => { keys[key] = false; });
}
bindJoyBtn('joy-up', 'w');
bindJoyBtn('joy-left', 'a');
bindJoyBtn('joy-down', 's');
bindJoyBtn('joy-right', 'd');

// Initialize default menu state
showScreen('menu');
