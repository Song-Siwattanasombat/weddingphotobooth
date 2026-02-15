
// Constants

const WIDTH = 1176;
const HEIGHT = 1470;


// DOM Elements

const canvas = document.getElementById("finalCanvas");
const ctx = canvas?.getContext("2d");
const downloadBtn = document.getElementById("downloadBtn");
const homeBtn = document.getElementById("homeBtn");
const resetBtn = document.getElementById("reset");
const logo = document.querySelector(".logo");


// Sticker State

let stickers = [];
let selectedSticker = null;
let dragOffset = { x: 0, y: 0 };


// Load Photo from Previous Page

const finalImage = new Image();
const dataURL = localStorage.getItem("photoStrip");

if (!dataURL) {
  alert("No photo found!");
} else {
  finalImage.src = dataURL;
  finalImage.onload = drawCanvas;
  localStorage.removeItem("photoStrip");
}


// Draw Canvas

function drawCanvas() {
  if (!ctx) return;
  ctx.clearRect(0, 0, WIDTH, HEIGHT);
  ctx.drawImage(finalImage, 0, 0, WIDTH, HEIGHT);
  stickers.forEach(s => ctx.drawImage(s.img, s.x, s.y, s.width, s.height));
}


// Pointer Helpers

function getPointerPos(e) {
  if (!canvas) return { x: 0, y: 0 };
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;

  const clientX = e.touches?.[0]?.clientX ?? e.clientX;
  const clientY = e.touches?.[0]?.clientY ?? e.clientY;

  return {
    x: (clientX - rect.left) * scaleX,
    y: (clientY - rect.top) * scaleY
  };
}


// Drag & Drop

function pointerDown(e) {
  const { x, y } = getPointerPos(e);
  for (let i = stickers.length - 1; i >= 0; i--) {
    const s = stickers[i];
    if (x >= s.x && x <= s.x + s.width && y >= s.y && y <= s.y + s.height) {
      selectedSticker = s;
      s.dragging = true;
      dragOffset.x = x - s.x;
      dragOffset.y = y - s.y;
      stickers.splice(i, 1);
      stickers.push(s);
      drawCanvas();
      e.preventDefault();
      break;
    }
  }
}

function pointerMove(e) {
  if (!selectedSticker?.dragging) return;
  const { x, y } = getPointerPos(e);
  selectedSticker.x = x - dragOffset.x;
  selectedSticker.y = y - dragOffset.y;
  drawCanvas();
  e.preventDefault();
}

function pointerUp() {
  if (selectedSticker) selectedSticker.dragging = false;
  selectedSticker = null;
}


// Event Listeners

if (canvas) {
  canvas.addEventListener("mousedown", pointerDown);
  canvas.addEventListener("mousemove", pointerMove);
  canvas.addEventListener("mouseup", pointerUp);
  canvas.addEventListener("mouseleave", pointerUp);

  canvas.addEventListener("touchstart", pointerDown);
  canvas.addEventListener("touchmove", pointerMove);
  canvas.addEventListener("touchend", pointerUp);
  canvas.addEventListener("touchcancel", pointerUp);
}

// Reset Stickers
if (resetBtn) {
  resetBtn.addEventListener("click", () => {
    stickers = [];
    drawCanvas();
  });
}

// Download Canvas
downloadBtn?.addEventListener("click", () => {
  if (!canvas) return;
  canvas.toBlob(blob => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "photo-strip.png";
    a.click();
  }, "image/png");
});

// Home Button
homeBtn?.addEventListener("click", () => {
  window.location.href = "index.html";
});

// Logo Click = Home
logo?.addEventListener("click", () => {
  window.location.href = "index.html";
});


// Add Sticker Utility

function addSticker(src) {
  const img = new Image();
  img.src = src;
  img.onload = () => {
    stickers.push({
      img,
      x: WIDTH / 2 - img.width / 6,
      y: HEIGHT / 2 - img.height / 6,
      width: img.width / 2.5,
      height: img.height / 2.5,
      dragging: false
    });
    drawCanvas();
  };
}