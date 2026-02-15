
// Constants

const WIDTH = 1176;
const HEIGHT = 1470;
const HALF = HEIGHT / 2;


// DOM Elements

const elements = {
  video: document.getElementById('liveVideo'),
  canvas: document.getElementById('finalCanvas'),
  ctx: document.getElementById('finalCanvas')?.getContext('2d'),
  takePhotoBtn: document.getElementById('takePhoto'),
  countdownEl: document.querySelector('.countdown-timer')
};


// State

let photoStage = 0; // 0=top,1=bottom,2=done


// Helpers

const moveVideoToHalf = (i) => {
  const video = elements.video;
  if (!video) return;
  video.style.display = 'block';
  video.style.top = i === 0 ? '0' : '50%';
  video.style.left = '0';
  video.style.width = '100%';
  video.style.height = '50%';
};

const startCountdown = (callback) => {
  const countdownEl = elements.countdownEl;
  if (!countdownEl) return;

  let count = 3;
  countdownEl.textContent = count;
  countdownEl.style.display = 'flex';

  const intervalId = setInterval(() => {
    count--;
    if (count > 0) countdownEl.textContent = count;
    else {
      clearInterval(intervalId);
      countdownEl.style.display = 'none';
      callback();
    }
  }, 1000);
};

const capturePhoto = () => {
  const { video, ctx, takePhotoBtn } = elements;
  if (!video || !ctx || !takePhotoBtn) return;

  const yOffset = photoStage === 0 ? 0 : HALF;
  const vW = video.videoWidth;
  const vH = video.videoHeight;

  const targetAspect = WIDTH / HALF;
  const vAspect = vW / vH;

  let sx, sy, sw, sh;

  if (vAspect > targetAspect) {
    sh = vH;
    sw = vH * targetAspect;
    sx = (vW - sw) / 2;
    sy = 0;
  } else {
    sw = vW;
    sh = vW / targetAspect;
    sx = 0;
    sy = (vH - sh) / 2;
  }

  ctx.save();
  ctx.translate(WIDTH, 0);
  ctx.scale(-1, 1);
  ctx.drawImage(video, sx, sy, sw, sh, 0, yOffset, WIDTH, HALF);
  ctx.restore();

  photoStage++;
  if (photoStage === 1) {
    moveVideoToHalf(1);
    takePhotoBtn.disabled = false;
  } else if (photoStage === 2) {
    finalizePhotoStrip();
  }
};

const finalizePhotoStrip = () => {
  const { video, ctx, canvas } = elements;
  if (!video || !ctx || !canvas) return;

  video.style.display = 'none';

  const frame = new Image();
  frame.src = 'Assets/frame.png';
  frame.onload = () => {
    ctx.drawImage(frame, 0, 0, WIDTH, HEIGHT);
    localStorage.setItem('photoStrip', canvas.toDataURL('image/png'));
    setTimeout(() => window.location.href = 'final.html', 50);
  };

  if (frame.complete) frame.onload();
};


// Camera Setup

const setupCamera = () => {
  if (!elements.video) return;

  navigator.mediaDevices.getUserMedia({
    video: { width: { ideal: 2560 }, height: { ideal: 1440 }, facingMode: 'user' },
    audio: false
  })
  .then(stream => {
    elements.video.srcObject = stream;
    elements.video.play();
    moveVideoToHalf(0);
  })
  .catch(err => alert('Camera access failed: ' + err));
};


// Event Listeners

const setupEventListeners = () => {
  const { takePhotoBtn } = elements;
  if (takePhotoBtn) {
    takePhotoBtn.addEventListener('click', () => {
      if (photoStage > 1) return;
      takePhotoBtn.disabled = true;
      startCountdown(capturePhoto);
    });
  }

  window.addEventListener('resize', () => {
    if (photoStage === 0) moveVideoToHalf(0);
    else if (photoStage === 1) moveVideoToHalf(1);
  });
};



// Init

setupCamera();
setupEventListeners();
