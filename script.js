const player = document.getElementById('player');
const prizeCount = document.getElementById('prize-count');
const finalPrize = document.getElementById('final-prize');
const messageOverlay = document.getElementById('message-overlay');
const overlayTitle = document.getElementById('overlay-title');
const overlayText = document.getElementById('overlay-text');
const overlayCloseBtn = document.getElementById('overlay-close-btn');
const challengeZone = document.getElementById('challenge-zone');
const challengeInput = document.getElementById('challenge-input');
const canvasZone = document.getElementById('canvas-zone');
const gateA = document.getElementById('gate-A');
const gateB = document.getElementById('gate-B');
const screenStage1 = document.getElementById('screen-stage1');
const screenStage2 = document.getElementById('screen-stage2');
const screenEnding = document.getElementById('screen-ending');
const dragItems = Array.from(document.querySelectorAll('.drag-item'));
const dropZones = Array.from(document.querySelectorAll('.drop-target'));
const joystickContainer = document.getElementById('joystick-container');
const joystickBase = document.getElementById('joystick-base');
const joystickThumb = document.getElementById('joystick-thumb');
const infoBarText = document.querySelector('.info-bar div:first-child');

let prizePool = 0;
let movementLocked = false;
let stage1Complete = false;
let currentScreen = 'stage1';
let playerPos = { x: 0, y: 0 };
let keysDown = { w: false, a: false, s: false, d: false };
let joystickDirection = { x: 0, y: 0 };
let joystickActive = false;
let pointerId = null;
let activeTouchItem = null;
let originalDragParent = null;

function init() {
  setDeviceMode();
  setScreen('stage1');
  resetPlayerPosition();
  updatePrizeUI();
  setupKeyboardControls();
  setupJoystickControls();
  setupDragAndDrop();
  requestAnimationFrame(gameLoop);
}

function setDeviceMode() {
  const isMobile = /Mobi|Android|iPhone|iPad|iPod|Tablet|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.matchMedia('(pointer: coarse)').matches || navigator.maxTouchPoints > 0;
  document.body.classList.toggle('mobile', isMobile);
  infoBarText.innerHTML = isMobile
    ? 'Fitur Kontrol: Gunakan <span style="color:#4ecca3">Analog Virtual di bawah</span>'
    : 'Fitur Kontrol: Gunakan <span style="color:#4ecca3">W-A-S-D</span> untuk Bergerak';
}

window.addEventListener('resize', setDeviceMode);

function updatePrizeUI() {
  prizeCount.textContent = `$${prizePool}`;
  finalPrize.textContent = `$${prizePool}`;
}

function setScreen(stage) {
  currentScreen = stage;
  screenStage1.classList.toggle('active', stage === 'stage1');
  screenStage2.classList.toggle('active', stage === 'stage2');
  screenEnding.classList.toggle('active', stage === 'ending');
  if (stage === 'stage1') {
    movementLocked = false;
    resetPlayerPosition();
  }
  if (stage === 'stage2') {
    movementLocked = true;
  }
}

function resetPlayerPosition() {
  const zoneRect = canvasZone.getBoundingClientRect();
  playerPos.x = zoneRect.width / 2 - 26;
  playerPos.y = zoneRect.height - 88;
  player.style.left = `${playerPos.x}px`;
  player.style.top = `${playerPos.y}px`;
}

function gameLoop() {
  if (currentScreen === 'stage1' && !movementLocked) {
    handleMovement();
    checkGateCollision();
  }
  requestAnimationFrame(gameLoop);
}

function handleMovement() {
  const speed = 5;
  let dx = 0;
  let dy = 0;
  if (keysDown.w) dy -= speed;
  if (keysDown.s) dy += speed;
  if (keysDown.a) dx -= speed;
  if (keysDown.d) dx += speed;
  if (joystickActive) {
    dx += joystickDirection.x * speed;
    dy += joystickDirection.y * speed;
  }
  if (dx !== 0 || dy !== 0) {
    movePlayer(dx, dy);
  }
}

function movePlayer(dx, dy) {
  const zoneRect = canvasZone.getBoundingClientRect();
  const playerRect = player.getBoundingClientRect();
  playerPos.x = clamp(playerPos.x + dx, 0, zoneRect.width - playerRect.width);
  playerPos.y = clamp(playerPos.y + dy, 0, zoneRect.height - playerRect.height);
  player.style.left = `${playerPos.x}px`;
  player.style.top = `${playerPos.y}px`;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function checkGateCollision() {
  if (stage1Complete) return;
  const playerRect = player.getBoundingClientRect();
  if (rectIntersect(playerRect, gateB.getBoundingClientRect())) {
    stage1Complete = true;
    prizePool += 75;
    updatePrizeUI();
    showOverlay(
      'Jawaban Benar!',
      'Kamu memilih jalur respirasi aerob yang benar. Prize Pool bertambah.',
      false,
      () => setScreen('stage2')
    );
  } else if (rectIntersect(playerRect, gateA.getBoundingClientRect())) {
    movementLocked = true;
    showOverlay(
      'Ops! Salah Gerbang',
      'Kamu masuk gerbang yang salah. Selesaikan hambatan agar bisa kembali bergerak.',
      true
    );
  }
}

function rectIntersect(a, b) {
  return !(a.right < b.left || a.left > b.right || a.bottom < b.top || a.top > b.bottom);
}

function showOverlay(title, text, showChallenge, onClose) {
  overlayTitle.textContent = title;
  overlayText.textContent = text;
  challengeZone.style.display = showChallenge ? 'block' : 'none';
  overlayCloseBtn.style.display = showChallenge ? 'none' : 'inline-block';
  messageOverlay.classList.add('visible');
  overlayCloseBtn.onclick = () => {
    closeOverlay();
    if (onClose) onClose();
  };
  if (showChallenge) {
    challengeInput.value = '';
    challengeInput.focus();
  }
}

function closeOverlay() {
  messageOverlay.classList.remove('visible');
  overlayCloseBtn.style.display = 'inline-block';
  overlayCloseBtn.onclick = closeOverlay;
  if (currentScreen === 'stage1' && !stage1Complete) {
    movementLocked = false;
  }
}

function checkChallenge() {
  const answer = challengeInput.value.trim().toUpperCase();
  if (answer === 'TAC') {
    showOverlay(
      'Hebat!',
      'Hambatan teratasi dan gerakan dibuka kembali. Arahkan mikroba ke gerbang yang benar.',
      false
    );
  } else {
    overlayText.textContent = 'Jawaban belum benar. Coba lagi! Pastikan mengetik untai komplemen DNA dengan benar.';
    challengeInput.focus();
  }
}

function setupKeyboardControls() {
  window.addEventListener('keydown', (event) => {
    if (currentScreen !== 'stage1' || movementLocked) return;
    switch (event.key.toLowerCase()) {
      case 'w':
      case 'arrowup':
        keysDown.w = true;
        break;
      case 'a':
      case 'arrowleft':
        keysDown.a = true;
        break;
      case 's':
      case 'arrowdown':
        keysDown.s = true;
        break;
      case 'd':
      case 'arrowright':
        keysDown.d = true;
        break;
    }
  });

  window.addEventListener('keyup', (event) => {
    switch (event.key.toLowerCase()) {
      case 'w':
      case 'arrowup':
        keysDown.w = false;
        break;
      case 'a':
      case 'arrowleft':
        keysDown.a = false;
        break;
      case 's':
      case 'arrowdown':
        keysDown.s = false;
        break;
      case 'd':
      case 'arrowright':
        keysDown.d = false;
        break;
    }
  });
}

function setupJoystickControls() {
  if (!joystickBase || !joystickThumb) return;
  joystickBase.addEventListener('pointerdown', (event) => {
    event.preventDefault();
    if (pointerId !== null) return;
    pointerId = event.pointerId;
    joystickBase.setPointerCapture(pointerId);
    joystickActive = true;
    processJoystickPointer(event);
  });

  joystickBase.addEventListener('pointermove', (event) => {
    if (event.pointerId !== pointerId) return;
    processJoystickPointer(event);
  });

  joystickBase.addEventListener('pointerup', releaseJoystick);
  joystickBase.addEventListener('pointercancel', releaseJoystick);
  joystickBase.addEventListener('pointerleave', releaseJoystick);
}

function processJoystickPointer(event) {
  const rect = joystickBase.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  const x = event.clientX - centerX;
  const y = event.clientY - centerY;
  const maxRadius = rect.width / 2 - 30;
  const distance = Math.hypot(x, y);
  const clampedDistance = Math.min(distance, maxRadius);
  const angle = Math.atan2(y, x);
  const normalizedX = (clampedDistance / maxRadius) * Math.cos(angle);
  const normalizedY = (clampedDistance / maxRadius) * Math.sin(angle);
  joystickDirection.x = normalizedX;
  joystickDirection.y = normalizedY;
  joystickThumb.style.transform = `translate(${normalizedX * maxRadius}px, ${normalizedY * maxRadius}px)`;
}

function releaseJoystick() {
  pointerId = null;
  joystickActive = false;
  joystickDirection = { x: 0, y: 0 };
  joystickThumb.style.transform = 'translate(0, 0)';
}

function setupDragAndDrop() {
  dragItems.forEach((item) => {
    item.addEventListener('dragstart', dragStart);
    item.addEventListener('dragend', dragEnd);
    item.addEventListener('touchstart', touchStart, { passive: false });
  });

  dropZones.forEach((zone) => {
    zone.addEventListener('dragover', dragOver);
    zone.addEventListener('drop', dropItem);
  });

  window.addEventListener('touchmove', touchMove, { passive: false });
  window.addEventListener('touchend', touchEnd);
}

function dragStart(event) {
  event.dataTransfer.setData('text/plain', event.target.id);
  setTimeout(() => event.target.classList.add('dragging'), 0);
}

function dragEnd(event) {
  event.target.classList.remove('dragging');
}

function dragOver(event) {
  event.preventDefault();
}

function dropItem(event) {
  event.preventDefault();
  const id = event.dataTransfer.getData('text/plain');
  const dragged = document.getElementById(id);
  if (dragged) {
    event.currentTarget.appendChild(dragged);
  }
}

function touchStart(event) {
  event.preventDefault();
  const touch = event.changedTouches[0];
  activeTouchItem = event.currentTarget;
  originalDragParent = activeTouchItem.parentElement;
  activeTouchItem.classList.add('dragging-touch');
  activeTouchItem.style.position = 'fixed';
  activeTouchItem.style.left = `${touch.clientX - activeTouchItem.offsetWidth / 2}px`;
  activeTouchItem.style.top = `${touch.clientY - activeTouchItem.offsetHeight / 2}px`;
  activeTouchItem.style.pointerEvents = 'none';
}

function touchMove(event) {
  if (!activeTouchItem) return;
  event.preventDefault();
  const touch = event.changedTouches[0];
  activeTouchItem.style.left = `${touch.clientX - activeTouchItem.offsetWidth / 2}px`;
  activeTouchItem.style.top = `${touch.clientY - activeTouchItem.offsetHeight / 2}px`;
}

function touchEnd(event) {
  if (!activeTouchItem) return;
  event.preventDefault();
  const touch = event.changedTouches[0];
  const target = document.elementFromPoint(touch.clientX, touch.clientY);
  const validZone = target && target.closest('.drop-target');
  if (validZone) {
    validZone.appendChild(activeTouchItem);
  } else {
    document.getElementById('draggable-items').appendChild(activeTouchItem);
  }
  activeTouchItem.classList.remove('dragging-touch');
  activeTouchItem.style.position = 'static';
  activeTouchItem.style.left = '';
  activeTouchItem.style.top = '';
  activeTouchItem.style.pointerEvents = 'auto';
  activeTouchItem = null;
  originalDragParent = null;
}

function checkDragDrop() {
  const correct = dropZones.every((zone) => {
    const match = zone.dataset.match;
    const child = zone.querySelector('.drag-item');
    return child && child.id === match;
  });

  if (correct) {
    prizePool += 100;
    updatePrizeUI();
    showOverlay(
      'Jawaban Tepat!',
      'Semua pasangan cocok dengan benar. Segera lihat ringkasan akhir permainan.',
      false,
      () => setScreen('ending')
    );
  } else {
    showOverlay('Masih Ada yang Kurang', 'Beberapa pasangan belum tepat. Periksa kembali dan coba lagi.', false);
  }
}

function resetDragItems() {
  const container = document.getElementById('draggable-items');
  container.appendChild(document.getElementById('item1'));
  container.appendChild(document.getElementById('item2'));
  container.appendChild(document.getElementById('item3'));
}

function resetGame() {
  prizePool = 0;
  movementLocked = false;
  stage1Complete = false;
  keysDown = { w: false, a: false, s: false, d: false };
  joystickDirection = { x: 0, y: 0 };
  setScreen('stage1');
  resetPlayerPosition();
  updatePrizeUI();
  resetDragItems();
  closeOverlay();
}

window.checkDragDrop = checkDragDrop;
window.resetGame = resetGame;
window.closeOverlay = closeOverlay;
window.checkChallenge = checkChallenge;

init();
