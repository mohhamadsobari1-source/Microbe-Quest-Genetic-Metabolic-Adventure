// Microbe Quest - Quiz flow with WASD controls and mobile joystick

const questions = [
  {q: 'Materi genetik utama pada bakteri adalah...', opts: {A:'Protein',B:'RNA',C:'DNA kromosom sirkular',D:'Lipid'}, ans: 'C', icon:'🧬'},
  {q: 'DNA ekstrakromosomal yang dapat bereplikasi sendiri disebut...', opts: {A:'Flagel',B:'Kapsul',C:'Plasmid',D:'Ribosom'}, ans: 'C', icon:'🧫'},
  {q: 'Perpindahan DNA antar bakteri melalui kontak langsung disebut...', opts: {A:'Transformasi',B:'Konjugasi',C:'Transduksi',D:'Mutasi'}, ans: 'B', icon:'🔗'},
  {q: 'Transfer gen menggunakan bakteriofag disebut...', opts: {A:'Konjugasi',B:'Mutasi',C:'Transduksi',D:'Transformasi'}, ans: 'C', icon:'🦠'},
  {q: 'Pengambilan DNA bebas dari lingkungan oleh bakteri disebut...', opts: {A:'Transformasi',B:'Replikasi',C:'Translasi',D:'Fermentasi'}, ans: 'A', icon:'📥'},
  {q: 'Enzim yang membuka untai DNA saat replikasi adalah...', opts: {A:'Ligase',B:'Helicase',C:'Primase',D:'Restriktase'}, ans: 'B', icon:'🧩'},
  {q: 'Enzim utama sintesis DNA pada bakteri adalah...', opts: {A:'DNA Polimerase III',B:'RNA Polimerase',C:'Ligase',D:'Topoisomerase'}, ans: 'A', icon:'🔬'},
  {q: 'Perubahan permanen pada urutan basa DNA disebut...', opts: {A:'Mutasi',B:'Replikasi',C:'Transkripsi',D:'Translasi'}, ans: 'A', icon:'⚠️'},
  {q: 'Mutasi yang tidak mengubah asam amino disebut...', opts: {A:'Missense',B:'Nonsense',C:'Silent mutation',D:'Delesi'}, ans: 'C', icon:'🧾'},
  {q: 'Proses pembentukan RNA dari DNA disebut...', opts: {A:'Translasi',B:'Transkripsi',C:'Replikasi',D:'Rekombinasi'}, ans: 'B', icon:'📜'},
  {q: 'Operon yang mengatur metabolisme laktosa pada E. coli adalah...', opts: {A:'Operon lac',B:'Operon trp',C:'Operon his',D:'Operon ara'}, ans: 'A', icon:'🧪'},
  {q: 'Gen resistensi antibiotik sering ditemukan pada...', opts: {A:'Dinding sel',B:'Sitoplasma',C:'Plasmid',D:'Membran sel'}, ans: 'C', icon:'💊'},
  {q: 'Teknik untuk memperbanyak DNA secara cepat adalah...', opts: {A:'ELISA',B:'PCR',C:'Western Blot',D:'Fermentasi'}, ans: 'B', icon:'🧪'},
  {q: 'Fungsi enzim restriksi adalah...', opts: {A:'Menyatukan DNA',B:'Memotong DNA pada situs tertentu',C:'Membentuk ATP',D:'Membentuk RNA'}, ans: 'B', icon:'✂️'},
  {q: 'Penyisipan gen asing ke dalam bakteri disebut...', opts: {A:'Pasteurisasi',B:'Fermentasi',C:'Transformasi genetik',D:'Sterilisasi'}, ans: 'C', icon:'🔁'}
];

// DOM elements
const questionIndexEl = document.getElementById('question-index');
const questionTextEl = document.getElementById('question-text');
const gateA = document.getElementById('gate-A');
const gateB = document.getElementById('gate-B');
const gateC = document.getElementById('gate-C');
const gateD = document.getElementById('gate-D');
const player = document.getElementById('player');
const scoreCount = document.getElementById('score-count');
const quizScreen = document.getElementById('quiz-screen');
const endingScreen = document.getElementById('screen-ending');
const finalScoreEl = document.getElementById('final-score');
const finalGradeEl = document.getElementById('final-grade');
const finalMsgEl = document.getElementById('final-msg');
const joystickBase = document.getElementById('joystick-base');
const joystickThumb = document.getElementById('joystick-thumb');

let current = 0;
let score = 0;
let acceptingInput = true;
let pointerId = null;
let gameStarted = false;
let keysDown = { w:false, a:false, s:false, d:false };
let joystickVector = { x:0, y:0 };
let joystickActive = false;
let rafId = null;

function init() {
  document.body.classList.toggle('mobile', isMobile());
  bindStart();
  bindKeyboard();
  bindJoystick();
  bindOptionClicks();
  renderQuestion();
}

function isMobile() {
  return /Mobi|Android|iPhone|iPad|iPod|Tablet/i.test(navigator.userAgent) || window.matchMedia('(pointer: coarse)').matches || navigator.maxTouchPoints > 0;
}

function renderQuestion() {
  const q = questions[current];
  questionIndexEl.textContent = `Soal ${current+1} / ${questions.length}`;
  questionTextEl.innerHTML = `${q.icon} ${q.q}`;
  gateA.innerHTML = `<strong>A.</strong> <span class="opt-text">${q.opts.A}</span>`;
  gateB.innerHTML = `<strong>B.</strong> <span class="opt-text">${q.opts.B}</span>`;
  gateC.innerHTML = `<strong>C.</strong> <span class="opt-text">${q.opts.C}</span>`;
  gateD.innerHTML = `<strong>D.</strong> <span class="opt-text">${q.opts.D}</span>`;
  acceptingInput = true;
}

function bindOptionClicks() {
  [gateA, gateB, gateC, gateD].forEach(el => {
    el.addEventListener('click', () => {
      if (!acceptingInput || !gameStarted) return;
      handleChoice(el.dataset.option);
    });
  });
}

// Keyboard controls (W/A/S/D) -> choose A/B/C/D respectively
// Dokumentasi: event listener ini menangani input keyboard dari pengguna desktop.
function bindKeyboard() {
  // Keyboard controls for movement: WASD
  window.addEventListener('keydown', (e) => {
    const k = e.key.toLowerCase();
    if (k === 'w' || k === 'arrowup') keysDown.w = true;
    if (k === 'a' || k === 'arrowleft') keysDown.a = true;
    if (k === 's' || k === 'arrowdown') keysDown.s = true;
    if (k === 'd' || k === 'arrowright') keysDown.d = true;
    // immediate response for keyboard so user sees movement without waiting frame
    applyMovementOnce();
  });
  window.addEventListener('keyup', (e) => {
    const k = e.key.toLowerCase();
    if (k === 'w' || k === 'arrowup') keysDown.w = false;
    if (k === 'a' || k === 'arrowleft') keysDown.a = false;
    if (k === 's' || k === 'arrowdown') keysDown.s = false;
    if (k === 'd' || k === 'arrowright') keysDown.d = false;
  });
}

// Joystick handling for mobile: process pointerdown/move/up on the joystick base.
// On pointerup we determine dominant direction and map to A/B/C/D (Up/Left/Down/Right).
// Dokumentasi: joystick menghasilkan nilai arah yang diterjemahkan ke pilihan soal.
function bindJoystick() {
  if (!joystickBase) return;
  joystickBase.addEventListener('pointerdown', (ev) => {
    ev.preventDefault();
    if (pointerId !== null) return;
    pointerId = ev.pointerId;
    joystickBase.setPointerCapture(pointerId);
    joystickActive = true;
    processJoystick(ev);
  });
  joystickBase.addEventListener('pointermove', (ev) => {
    if (ev.pointerId !== pointerId) return;
    processJoystick(ev);
    // apply small immediate movement for mobile responsiveness
    applyMovementOnce();
  });
  const release = (ev) => {
    if (ev.pointerId !== pointerId) return;
    // on release stop moving
    joystickActive = false;
    joystickVector = { x:0, y:0 };
    joystickThumb.style.transform = 'translate(0,0)';
    pointerId = null;
  };
  joystickBase.addEventListener('pointerup', release);
  joystickBase.addEventListener('pointercancel', release);
  joystickBase.addEventListener('pointerleave', release);
}

function processJoystick(ev) {
  const rect = joystickBase.getBoundingClientRect();
  const cx = rect.left + rect.width/2;
  const cy = rect.top + rect.height/2;
  const dx = ev.clientX - cx;
  const dy = ev.clientY - cy;
  const max = rect.width/2 - 20;
  const dist = Math.hypot(dx,dy);
  const clampedX = (dx / Math.max(dist,1)) * Math.min(dist, max);
  const clampedY = (dy / Math.max(dist,1)) * Math.min(dist, max);
  joystickThumb.style.transform = `translate(${clampedX}px, ${clampedY}px)`;
  joystickVector.x = clampedX / max;
  joystickVector.y = clampedY / max;
}

function handleChoice(choice) {
  acceptingInput = false;
  const q = questions[current];
  const isCorrect = choice === q.ans;
  // highlight
  clearHighlights();
  const el = document.querySelector(`#gate-${choice}`);
  if (el) el.classList.add('selected', isCorrect ? 'correct' : 'wrong');
  if (isCorrect) {
    score += 10;
    scoreCount.textContent = score;
    showFeedback('Benar! +10 poin');
  } else {
    showFeedback('Salah. +0 poin');
  }
  // next
  setTimeout(() => {
    current++;
    acceptingInput = true;
    if (current >= questions.length) {
      endQuiz();
    } else {
      renderQuestion();
      clearHighlights();
      // reset player position for next soal
      resetPlayerPosition();
    }
  }, 700);
}

function clearHighlights() {
  [gateA, gateB, gateC, gateD].forEach(g => {
    g.classList.remove('selected','correct','wrong');
  });
}

function showFeedback(text) {
  const fb = document.getElementById('feedback');
  fb.textContent = text;
  setTimeout(() => { if (fb.textContent === text) fb.textContent = ''; }, 900);
}

function endQuiz() {
  quizScreen.classList.remove('active');
  endingScreen.classList.add('active');
  finalScoreEl.textContent = score;
  // determine predicate
  let pred = '';
  let msg = '';
  if (score >= 140) { pred = '🏆 Master Genetika Mikrobiologi'; msg = 'Luar biasa! Anda menguasai konsep genetika mikrobiologi dengan sangat baik.'; }
  else if (score >= 120) { pred = '🥇 Ahli Genetika'; msg = 'Kerja bagus! Pengetahuan Anda sudah berada di tingkat lanjut.'; }
  else if (score >= 100) { pred = '🥈 Peneliti Muda'; msg = 'Bagus! Terus tingkatkan pemahaman Anda mengenai genetika mikroba.'; }
  else if (score >= 70) { pred = '🥉 Asisten Laboratorium'; msg = 'Anda sudah memahami dasar-dasarnya, namun masih perlu pendalaman materi.'; }
  else { pred = '📚 Perlu Belajar Lagi'; msg = 'Jangan menyerah! Pelajari kembali konsep genetika mikrobiologi dan coba lagi.'; }
  finalGradeEl.textContent = `Predikat: ${pred}`;
  finalMsgEl.textContent = msg;
}

function resetGame() {
  current = 0;
  score = 0;
  scoreCount.textContent = score;
  endingScreen.classList.remove('active');
  quizScreen.classList.add('active');
  renderQuestion();
  // show start screen again
  const start = document.getElementById('start-screen');
  start.classList.add('active');
  quizScreen.classList.remove('active');
  gameStarted = false;
}

window.resetGame = resetGame;

function bindStart() {
  const start = document.getElementById('start-screen');
  const nameInput = document.getElementById('start-name');
  const startBtn = document.getElementById('start-btn');
  startBtn.addEventListener('click', () => {
    const name = nameInput.value.trim();
    if (!name) {
      nameInput.focus();
      return;
    }
    document.getElementById('player-name').value = name || '';
    // hide start, show quiz
    start.classList.remove('active');
    document.getElementById('quiz-screen').classList.add('active');
    gameStarted = true;
    resetPlayerPosition();
    // start animation loop
    if (!rafId) rafId = requestAnimationFrame(mainLoop);
  });
}

function mainLoop() {
  // movement only when game started and quiz active
  if (gameStarted && document.getElementById('quiz-screen').classList.contains('active')) {
    const speed = 3.8;
    let dx = 0, dy = 0;
    if (keysDown.w) dy -= speed;
    if (keysDown.s) dy += speed;
    if (keysDown.a) dx -= speed;
    if (keysDown.d) dx += speed;
    if (joystickActive) {
      dx += joystickVector.x * speed * 1.4;
      dy += joystickVector.y * speed * 1.4;
    }
    if (dx !== 0 || dy !== 0) movePlayer(dx, dy);
    // check collisions with gates
    checkGateCollisions();
  }
  rafId = requestAnimationFrame(mainLoop);
}

// Apply one-step movement immediately for responsiveness (called on keydown/pointermove)
function applyMovementOnce() {
  if (!gameStarted || !document.getElementById('quiz-screen').classList.contains('active')) return;
  const speed = 4.0;
  let dx = 0, dy = 0;
  if (keysDown.w) dy -= speed;
  if (keysDown.s) dy += speed;
  if (keysDown.a) dx -= speed;
  if (keysDown.d) dx += speed;
  if (joystickActive) {
    dx += joystickVector.x * speed * 1.2;
    dy += joystickVector.y * speed * 1.2;
  }
  if (dx !== 0 || dy !== 0) {
    movePlayer(dx, dy);
    checkGateCollisions();
  }
}

// movement helpers
let playerPos = { x:0, y:0 };
function resetPlayerPosition() {
  const zoneRect = document.getElementById('canvas-zone').getBoundingClientRect();
  const p = document.getElementById('player');
  playerPos.x = zoneRect.left + zoneRect.width/2 - (p.offsetWidth/2);
  playerPos.y = zoneRect.top + zoneRect.height - 120;
  // place absolute relative to container
  p.style.position = 'absolute';
  p.style.left = `${playerPos.x - zoneRect.left}px`;
  p.style.top = `${playerPos.y - zoneRect.top}px`;
}

function movePlayer(dx, dy) {
  const zone = document.getElementById('canvas-zone');
  const zoneRect = zone.getBoundingClientRect();
  const p = document.getElementById('player');
  const playerRect = p.getBoundingClientRect();
  let newX = (playerRect.left - zoneRect.left) + dx;
  let newY = (playerRect.top - zoneRect.top) + dy;
  newX = Math.max(0, Math.min(newX, zoneRect.width - playerRect.width));
  newY = Math.max(0, Math.min(newY, zoneRect.height - playerRect.height));
  p.style.left = `${newX}px`;
  p.style.top = `${newY}px`;
}

function checkGateCollisions() {
  if (!acceptingInput) return;
  const p = document.getElementById('player');
  const playerRect = p.getBoundingClientRect();
  const gates = [gateA, gateB, gateC, gateD];
  for (const g of gates) {
    if (!g) continue;
    const gr = g.getBoundingClientRect();
    if (!(playerRect.right < gr.left || playerRect.left > gr.right || playerRect.bottom < gr.top || playerRect.top > gr.bottom)) {
      // collision
      handleChoice(g.dataset.option);
      break;
    }
  }
}

// Initialize after definitions
init();
