
/* -------------------------
   ELEMENTLER
------------------------- */
const beforeInput = document.getElementById("beforeInput");
const afterInput = document.getElementById("afterInput");
const chooseBeforeBtn = document.getElementById("chooseBeforeBtn");
const chooseAfterBtn = document.getElementById("chooseAfterBtn");
const dropBefore = document.getElementById("dropBefore");
const dropAfter = document.getElementById("dropAfter");
const analyzeBtn = document.getElementById("analyzeBtn");
const exampleButtons = document.querySelectorAll(".example-btn");
const resultCanvas = document.getElementById("resultCanvas");
const ctx = resultCanvas.getContext("2d");
const planElement = document.getElementById("afetPlan");

let beforeImg = null;
let afterImg = null;

let overlayRects = [];
let damageSummary = null;

/* -------------------------
   BUTONLAR
------------------------- */
chooseBeforeBtn.onclick = () => beforeInput.click();
chooseAfterBtn.onclick = () => afterInput.click();

/* -------------------------
   DOSYA YÜKLEME
------------------------- */
beforeInput.onchange = e => loadImage(e.target.files[0], "before");
afterInput.onchange = e => loadImage(e.target.files[0], "after");

function loadImage(file, type) {
  const reader = new FileReader();
  reader.onload = evt => {
    const img = new Image();
    img.onload = () => {
      if (type === "before") beforeImg = img;
      else {
        afterImg = img;
        overlayRects = [];
        damageSummary = null;
      }
    };
    img.src = evt.target.result;
  };
  reader.readAsDataURL(file);
}

/* -------------------------
   ANALİZ ET
------------------------- */
analyzeBtn.onclick = runAnalysis;

function runAnalysis() {
  if (!afterImg) {
    alert("Deprem sonrası görsel yükle veya bir örnek seç.");
    return;
  }

  ctx.clearRect(0, 0, resultCanvas.width, resultCanvas.height);
  ctx.drawImage(afterImg, 0, 0, resultCanvas.width, resultCanvas.height);

  if (overlayRects.length === 0) generateOverlay();
  drawOverlay();
  updatePlan();
}

/* -------------------------
   OVERLAY ÜRET
------------------------- */
function generateOverlay() {
  overlayRects = [];
  let reds = 0, oranges = 0, yellows = 0;

  const colors = [
    { c: "rgba(255,0,0,0.35)", t: "red" },
    { c: "rgba(255,165,0,0.35)", t: "orange" },
    { c: "rgba(255,215,0,0.35)", t: "yellow" },
  ];

  for (let i = 0; i < 25; i++) {
    const pick = colors[Math.floor(Math.random() * colors.length)];
    overlayRects.push({
      x: Math.random() * resultCanvas.width,
      y: Math.random() * resultCanvas.height,
      w: 40 + Math.random() * 120,
      h: 40 + Math.random() * 120,
      color: pick.c,
      type: pick.t
    });

    if (pick.t === "red") reds++;
    if (pick.t === "orange") oranges++;
    if (pick.t === "yellow") yellows++;
  }

  if (reds >= 8 || reds + oranges >= 15) damageSummary = "agir";
  else if (reds + oranges >= 8) damageSummary = "orta";
  else damageSummary = "hafif";
}

/* -------------------------
   OVERLAY ÇİZ
------------------------- */
function drawOverlay() {
  overlayRects.forEach(r => {
    ctx.fillStyle = r.color;
    ctx.fillRect(r.x, r.y, r.w, r.h);
  });
}

/* -------------------------
   MÜDAHALE PLANI
------------------------- */
function updatePlan() {
  if (!damageSummary) return;

  if (damageSummary === "agir") {
    planElement.innerHTML = `
      <strong>Müdahale Planı:</strong><br>
      • 3 arama-kurtarma ekibi<br>
      • İlk 30 dk müdahale<br>
      • Kara yolu riskli → drone<br>
      • Acil iletişim uyarısı`;
  } else if (damageSummary === "orta") {
    planElement.innerHTML = `
      <strong>Müdahale Planı:</strong><br>
      • 2 kurtarma ekibi<br>
      • 1 saat içinde tarama<br>
      • Lojistik destek<br>
      • Ek ekip hazırda`;
  } else {
    planElement.innerHTML = `
      <strong>Müdahale Planı:</strong><br>
      • 1 inceleme ekibi<br>
      • Gözlemsel rapor<br>
      • Kaynak aktarımı<br>
      • İzleme modunda`;
  }
}

/* -------------------------
        ÖRNEK GÖRSELLER
------------------------- */
const demoImages = {
  1: { before: "assets/oncesi-1.jpg", after: "assets/sonrasi-1.jpg" },
  2: { before: "assets/oncesi-2.jpg", after: "assets/sonrasi-2.jpg" },
  3: { before: "assets/oncesi-3.jpg", after: "assets/sonrasi-3.jpg" }
};


exampleButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    const id = btn.dataset.example;
    loadDemo(id);
  });
});

function loadDemo(id) {
  beforeImg = new Image();
  beforeImg.src = demoImages[id].before;

  afterImg = new Image();
  afterImg.onload = () => {
    overlayRects = [];      // önceki analiz sıfırlanır
    damageSummary = null;   // plan sıfırlanır
    runAnalysis();          // yeni örnek otomatik analiz edilir
  };
  afterImg.src = demoImages[id].after;
}
