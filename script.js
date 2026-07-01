/* ============================================================
   PromptLens — built by Anurag Mishra
   github.com/anurag2882 | linkedin.com/in/anuragmishra27
   Licensed under the MIT License
   ============================================================ */

/* ============================================================
   Prompt & Create — shared front-end logic
   Everything runs client-side. "AI" generation is simulated
   using lightweight image analysis (canvas pixel sampling)
   combined with templated language, so results still react
   to the actual uploaded image (dominant colour, brightness,
   orientation) rather than being purely random.
   ============================================================ */

(function () {
  "use strict";

  /* ---------------- Nav toggle (mobile) ---------------- */
  const menuToggle = document.getElementById("menuToggle");
  const navInner = document.getElementById("navInner");
  if (menuToggle && navInner) {
    menuToggle.addEventListener("click", () => {
      navInner.classList.toggle("menu-open");
    });
  }

  /* ---------------- Toast ---------------- */
  const toastEl = document.getElementById("toast");
  const toastMsgEl = document.getElementById("toastMsg");
  let toastTimer = null;
  window.showToast = function (msg, icon) {
    if (!toastEl) return;
    toastMsgEl.textContent = msg;
    const iconEl = toastEl.querySelector(".ic");
    if (iconEl) iconEl.className = "ic " + (icon || "fa-solid fa-circle-check");
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("show"), 2600);
  };

  /* ---------------- Newsletter form (all pages) ---------------- */
  const subscribeForm = document.getElementById("subscribeForm");
  if (subscribeForm) {
    subscribeForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const input = subscribeForm.querySelector("input[type=email]");
      if (input && input.value.trim()) {
        showToast("Subscribed! Check your inbox soon.", "fa-solid fa-paper-plane");
        subscribeForm.reset();
      }
    });
  }

  /* ---------------- Contact Us modal ---------------- */
  const contactLink = document.getElementById("contactUsLink");
  if (contactLink) {
    const overlay = document.createElement("div");
    overlay.className = "modal-overlay";
    overlay.innerHTML = `
      <div class="modal-card" role="dialog" aria-modal="true" aria-label="Contact details">
        <button class="modal-close" id="modalCloseBtn" aria-label="Close"><i class="fa-solid fa-xmark"></i></button>
        <h3>Let's connect</h3>
        <p class="sub">Reach out through any of the channels below.</p>
        <div class="contact-list">
          <a class="contact-row" href="https://www.linkedin.com/in/anuragmishra27" target="_blank" rel="noopener">
            <span class="ic"><i class="fa-brands fa-linkedin-in"></i></span>
            <span class="meta"><span class="value">LinkedIn</span></span>
            <i class="fa-solid fa-arrow-up-right-from-square copy-ic"></i>
          </a>
          <a class="contact-row" href="https://github.com/anurag2882" target="_blank" rel="noopener">
            <span class="ic"><i class="fa-brands fa-github"></i></span>
            <span class="meta"><span class="value">GitHub</span></span>
            <i class="fa-solid fa-arrow-up-right-from-square copy-ic"></i>
          </a>
          <a class="contact-row" href="mailto:anuragmishra.5347@gmail.com">
            <span class="ic"><i class="fa-solid fa-envelope"></i></span>
            <span class="meta"><span class="value">Email</span></span>
            <i class="fa-solid fa-arrow-up-right-from-square copy-ic"></i>
          </a>
          <a class="contact-row" href="tel:+918810703682">
            <span class="ic"><i class="fa-solid fa-phone"></i></span>
            <span class="meta"><span class="value">Mobile</span></span>
            <i class="fa-solid fa-arrow-up-right-from-square copy-ic"></i>
          </a>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    function openModal() { overlay.classList.add("show"); }
    function closeModal() { overlay.classList.remove("show"); }

    contactLink.addEventListener("click", (e) => { e.preventDefault(); openModal(); });
    overlay.querySelector("#modalCloseBtn").addEventListener("click", closeModal);
    overlay.addEventListener("click", (e) => { if (e.target === overlay) closeModal(); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeModal(); });
  }

  /* ---------------- "Coming soon" links (AI Generator, Privacy, Terms) ---------------- */
  document.querySelectorAll("[data-soon]").forEach((el) => {
    el.addEventListener("click", (e) => {
      e.preventDefault();
      showToast(`"${el.dataset.soon}" is coming soon — we're working on it!`, "fa-solid fa-triangle-exclamation");
    });
  });

  /* ---------------- History store (localStorage) ---------------- */
  const HISTORY_KEY = "pc_history_v1";
  function getHistory() {
    try { return JSON.parse(localStorage.getItem(HISTORY_KEY)) || []; }
    catch (e) { return []; }
  }
  function saveHistory(list) {
    try { localStorage.setItem(HISTORY_KEY, JSON.stringify(list.slice(0, 30))); }
    catch (e) { /* storage full or unavailable — fail silently */ }
  }
  function addHistoryEntry(entry) {
    const list = getHistory();
    list.unshift(Object.assign({ id: Date.now(), date: new Date().toISOString() }, entry));
    saveHistory(list);
  }

  /* ---------------- Image analysis helpers ---------------- */
  function analyzeImage(imgEl) {
    return new Promise((resolve) => {
      try {
        const canvas = document.createElement("canvas");
        const w = (canvas.width = 48);
        const h = (canvas.height = 48);
        const ctx = canvas.getContext("2d");
        ctx.drawImage(imgEl, 0, 0, w, h);
        const data = ctx.getImageData(0, 0, w, h).data;
        let r = 0, g = 0, b = 0, n = 0;
        for (let i = 0; i < data.length; i += 4) {
          r += data[i]; g += data[i + 1]; b += data[i + 2]; n++;
        }
        r = Math.round(r / n); g = Math.round(g / n); b = Math.round(b / n);
        const brightness = (r + g + b) / 3;
        resolve({ r, g, b, brightness, orientation: imgEl.naturalWidth >= imgEl.naturalHeight ? "landscape" : "portrait" });
      } catch (e) {
        resolve({ r: 140, g: 130, b: 160, brightness: 140, orientation: "landscape" });
      }
    });
  }

  function colorName({ r, g, b, brightness }) {
    if (brightness < 60) return "deep, moody shadow tones";
    if (brightness > 200) return "bright, airy highlights";
    if (r > g && r > b) return "warm amber and crimson hues";
    if (b > r && b > g) return "cool blue and teal tones";
    if (g > r && g > b) return "earthy green undertones";
    return "balanced neutral tones";
  }

  function hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash);
  }

  function drawTextOnlyArt(ctx, w, h, prompt, style) {
    const hash = hashString(prompt.trim().toLowerCase() || "prompt and create");
    const baseHue = hash % 360;

    const styleConfig = {
      "Realistic": { sat: 55, hueSpread: 28, blobs: 5, light: 52 },
      "Cinematic": { sat: 45, hueSpread: 18, blobs: 4, light: 38 },
      "Anime": { sat: 78, hueSpread: 50, blobs: 6, light: 60 },
      "Fantasy / Painterly": { sat: 65, hueSpread: 60, blobs: 7, light: 55 },
      "Cyberpunk": { sat: 85, hueSpread: 80, blobs: 6, light: 45 }
    };
    const cfg = styleConfig[style] || styleConfig["Realistic"];

    // base gradient backdrop derived from the prompt's hash
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, `hsl(${baseHue}, ${cfg.sat}%, ${Math.max(cfg.light - 18, 10)}%)`);
    grad.addColorStop(1, `hsl(${(baseHue + cfg.hueSpread) % 360}, ${cfg.sat}%, ${Math.min(cfg.light + 14, 88)}%)`);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // layered soft "blobs" for an abstract painterly feel, seeded by the prompt
    let seed = hash;
    function rand() { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; }

    for (let i = 0; i < cfg.blobs; i++) {
      const hue = (baseHue + i * (cfg.hueSpread / cfg.blobs) + rand() * 20) % 360;
      const cx = rand() * w;
      const cy = rand() * h;
      const r = (0.18 + rand() * 0.28) * Math.max(w, h);
      const blobGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
      blobGrad.addColorStop(0, `hsla(${hue}, ${cfg.sat}%, ${cfg.light + 10}%, 0.55)`);
      blobGrad.addColorStop(1, `hsla(${hue}, ${cfg.sat}%, ${cfg.light}%, 0)`);
      ctx.fillStyle = blobGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
    }

    // subtle vignette to ground the composition
    const vignette = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.3, w / 2, h / 2, Math.max(w, h) * 0.7);
    vignette.addColorStop(0, "rgba(0,0,0,0)");
    vignette.addColorStop(1, "rgba(0,0,0,0.22)");
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, w, h);

    // a faint style label so the canvas isn't ambiguous about its origin
    ctx.font = `600 ${Math.round(w * 0.032)}px Manrope, sans-serif`;
    ctx.fillStyle = "rgba(255,255,255,0.65)";
    ctx.textBaseline = "bottom";
    ctx.fillText(`AI · ${style}`, w * 0.04, h * 0.96);
  }

  /* ============================================================
     PHOTO → PROMPT PAGE
     ============================================================ */
  const dropzone = document.getElementById("dropzone");
  if (dropzone && document.getElementById("statusPill")) {
    const fileInput = document.getElementById("fileInput");
    const chooseFileBtn = document.getElementById("chooseFileBtn");
    const dzPrompt = document.getElementById("dzPrompt");
    const previewWrap = document.getElementById("previewWrap");
    const previewImg = document.getElementById("previewImg");
    const removeImgBtn = document.getElementById("removeImgBtn");
    const generateBtn = document.getElementById("generateBtn");
    const statusPill = document.getElementById("statusPill");
    const resultArea = document.getElementById("resultArea");
    const styleSelect = document.getElementById("styleSelect");

    let uploadedDataUrl = null;

    function setUploaded(dataUrl) {
      uploadedDataUrl = dataUrl;
      previewImg.src = dataUrl;
      previewWrap.style.display = "block";
      dzPrompt.style.display = "none";
      generateBtn.disabled = false;
    }
    function clearUploaded() {
      uploadedDataUrl = null;
      previewImg.src = "";
      previewWrap.style.display = "none";
      dzPrompt.style.display = "block";
      generateBtn.disabled = true;
      fileInput.value = "";
    }

    function handleFile(file) {
      if (!file || !file.type.startsWith("image/")) {
        showToast("Please upload a JPG, PNG, or WEBP image.", "fa-solid fa-triangle-exclamation");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        showToast("That image is larger than 10MB.", "fa-solid fa-triangle-exclamation");
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => setUploaded(e.target.result);
      reader.readAsDataURL(file);
    }

    chooseFileBtn.addEventListener("click", () => fileInput.click());
    dropzone.addEventListener("click", (e) => { if (e.target === dropzone || dzPrompt.contains(e.target)) fileInput.click(); });
    dropzone.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); fileInput.click(); } });
    fileInput.addEventListener("change", (e) => handleFile(e.target.files[0]));

    ["dragenter", "dragover"].forEach((evt) =>
      dropzone.addEventListener(evt, (e) => { e.preventDefault(); dropzone.classList.add("drag"); })
    );
    ["dragleave", "drop"].forEach((evt) =>
      dropzone.addEventListener(evt, (e) => { e.preventDefault(); dropzone.classList.remove("drag"); })
    );
    dropzone.addEventListener("drop", (e) => {
      const file = e.dataTransfer.files[0];
      handleFile(file);
    });

    removeImgBtn.addEventListener("click", (e) => { e.stopPropagation(); clearUploaded(); });

    const SUBJECTS = [
      "a striking close-up portrait", "a sweeping landscape vista", "an intimate candid moment",
      "a dynamic action shot", "a quiet, contemplative scene", "an architectural study",
      "a still-life arrangement", "an atmospheric street scene"
    ];
    const DETAILS = [
      "soft natural light wrapping around the subject", "dramatic rim lighting carving out the silhouette",
      "a shallow depth of field that isolates the focal point", "fine textures rendered in crisp detail",
      "gentle film grain adding organic texture", "subtle motion blur suggesting movement"
    ];

    function buildPrompt(meta, style, formats) {
      const subject = SUBJECTS[Math.floor(Math.random() * SUBJECTS.length)];
      const detail = DETAILS[Math.floor(Math.random() * DETAILS.length)];
      const tones = colorName(meta);
      const orient = meta.orientation === "portrait" ? "vertical framing" : "wide horizontal framing";
      const styleStr = style.toLowerCase();

      let base = `${subject}, captured with ${orient}, featuring ${tones}. ${detail}. Rendered in a ${styleStr} style`;

      if (formats.includes("detailed")) {
        base += `, ultra-detailed, high resolution, professional photography, balanced composition, evocative mood.`;
      } else {
        base += `.`;
      }

      let out = base;
      if (formats.includes("short")) {
        out += `\n\nShort version: ${styleStr} ${subject}, ${tones}, ${orient}.`;
      }
      if (formats.includes("midjourney")) {
        out += `\n\nMidjourney: ${subject}, ${tones}, ${detail}, ${styleStr} style, highly detailed, 8k --ar ${meta.orientation === "portrait" ? "2:3" : "3:2"} --v 6`;
      }
      if (formats.includes("sd")) {
        out += `\n\nStable Diffusion: (${subject}:1.2), ${tones}, ${detail}, ${styleStr}, masterpiece, best quality, ultra detailed, 8k uhd\nNegative prompt: blurry, low quality, distorted, watermark`;
      }
      return out;
    }

    generateBtn.addEventListener("click", async () => {
      if (!uploadedDataUrl) return;
      const formats = Array.from(document.querySelectorAll("[data-fmt]"))
        .filter((c) => c.checked)
        .map((c) => c.dataset.fmt);
      if (formats.length === 0) {
        showToast("Select at least one prompt format.", "fa-solid fa-triangle-exclamation");
        return;
      }

      statusPill.textContent = "Generating…";
      statusPill.classList.remove("ready");
      generateBtn.disabled = true;
      resultArea.innerHTML = `
        <div class="loading-bar"><span></span></div>
        <p class="loading-label">Analyzing your image and writing the prompt…</p>
      `;

      const meta = await analyzeImage(previewImg);

      setTimeout(() => {
        const promptText = buildPrompt(meta, styleSelect.value, formats);
        statusPill.textContent = "Completed";
        statusPill.classList.add("ready");
        generateBtn.disabled = false;

        resultArea.innerHTML = `
          <div class="tip-box" style="background:#f0fbf4; border-color:#cdeedb; color:#1e6b3e; margin-bottom:18px;">
            <span class="ic"><i class="fa-solid fa-circle-check"></i></span>
            <span>Your AI generated prompt is ready! You can copy, download, or regenerate it.</span>
          </div>
          <p class="opt-label" style="margin-top:0;">Detailed Prompt</p>
          <div class="prompt-result" id="promptResultText"></div>
          <div class="result-actions">
            <button class="btn btn-ghost" id="copyBtn"><i class="fa-regular fa-copy"></i> Copy Prompt</button>
            <button class="btn btn-primary" id="regenBtn"><i class="fa-solid fa-rotate"></i> Regenerate</button>
            <button class="btn btn-ghost" id="downloadBtn"><i class="fa-solid fa-download"></i> Download TXT</button>
          </div>
          <div class="tip-box">
            <span class="ic">💡</span>
            <span>Tip: Use this prompt in Midjourney, Stable Diffusion, or any AI image generator to get amazing results!</span>
          </div>
        `;
        document.getElementById("promptResultText").textContent = promptText;

        document.getElementById("copyBtn").addEventListener("click", () => {
          navigator.clipboard.writeText(promptText).then(
            () => showToast("Prompt copied to clipboard!", "fa-regular fa-copy"),
            () => showToast("Could not copy — please copy manually.", "fa-solid fa-triangle-exclamation")
          );
        });
        document.getElementById("regenBtn").addEventListener("click", () => generateBtn.click());
        document.getElementById("downloadBtn").addEventListener("click", () => {
          const blob = new Blob([promptText], { type: "text/plain" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url; a.download = "prompt-and-create.txt"; a.click();
          URL.revokeObjectURL(url);
          showToast("Prompt downloaded.", "fa-solid fa-download");
        });

        addHistoryEntry({ type: "prompt", thumb: uploadedDataUrl, text: promptText.split("\n")[0], style: styleSelect.value });
      }, 1400);
    });
  }

  /* ============================================================
     PROMPT → IMAGE PAGE
     ============================================================ */
  const generatedBox = document.getElementById("generatedBox");
  if (generatedBox) {
    const fileInput = document.getElementById("fileInput");
    const chooseFileBtn = document.getElementById("chooseFileBtn");
    const dz = document.getElementById("dropzone");
    const dzPrompt = document.getElementById("dzPrompt");
    const uploadedBlock = document.getElementById("uploadedBlock");
    const previewImg = document.getElementById("previewImg");
    const removeImgBtn = document.getElementById("removeImgBtn");
    const originalBox = document.getElementById("originalBox");
    const generateBtn = document.getElementById("generateBtn");
    const promptInput = document.getElementById("promptInput");
    const charCount = document.getElementById("charCount");
    const ratioChips = document.querySelectorAll("#ratioChips .chip");
    const styleSelect = document.getElementById("styleSelect");
    const qualityRange = document.getElementById("qualityRange");
    const qualityLabel = document.getElementById("qualityLabel");
    const resultActions = document.getElementById("resultActions");
    const examplesBtn = document.getElementById("examplesBtn");

    let uploadedDataUrl = null;
    let selectedRatio = "1:1";
    const qualityMap = { 1: "Standard", 2: "Enhanced", 3: "High" };
    checkReady(); // photo is optional — button only needs a prompt

    function checkReady() {
      generateBtn.disabled = promptInput.value.trim().length === 0;
    }

    function setUploaded(dataUrl) {
      uploadedDataUrl = dataUrl;
      previewImg.src = dataUrl;
      uploadedBlock.style.display = "block";
      dzPrompt.style.display = "none";
      originalBox.innerHTML = `<img src="${dataUrl}" alt="Original upload">`;
      checkReady();
    }
    function clearUploaded() {
      uploadedDataUrl = null;
      previewImg.src = "";
      uploadedBlock.style.display = "none";
      dzPrompt.style.display = "block";
      originalBox.innerHTML = `<span style="color:#c3b6e8; font-size:13px;">No photo uploaded — generating from prompt only</span>`;
      fileInput.value = "";
      checkReady();
    }

    function handleFile(file) {
      if (!file || !file.type.startsWith("image/")) {
        showToast("Please upload a JPG, PNG, or WEBP image.", "fa-solid fa-triangle-exclamation");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        showToast("That image is larger than 10MB.", "fa-solid fa-triangle-exclamation");
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => setUploaded(e.target.result);
      reader.readAsDataURL(file);
    }

    chooseFileBtn.addEventListener("click", () => fileInput.click());
    dz.addEventListener("click", (e) => { if (e.target === dz || dzPrompt.contains(e.target)) fileInput.click(); });
    dz.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); fileInput.click(); } });
    fileInput.addEventListener("change", (e) => handleFile(e.target.files[0]));
    ["dragenter", "dragover"].forEach((evt) => dz.addEventListener(evt, (e) => { e.preventDefault(); dz.classList.add("drag"); }));
    ["dragleave", "drop"].forEach((evt) => dz.addEventListener(evt, (e) => { e.preventDefault(); dz.classList.remove("drag"); }));
    dz.addEventListener("drop", (e) => handleFile(e.dataTransfer.files[0]));
    removeImgBtn.addEventListener("click", (e) => { e.stopPropagation(); clearUploaded(); });

    promptInput.addEventListener("input", () => {
      charCount.textContent = promptInput.value.length;
      checkReady();
    });

    ratioChips.forEach((chip) => {
      chip.addEventListener("click", () => {
        ratioChips.forEach((c) => c.classList.remove("active"));
        chip.classList.add("active");
        selectedRatio = chip.dataset.ratio;
      });
    });

    qualityRange.addEventListener("input", () => { qualityLabel.textContent = qualityMap[qualityRange.value]; });

    examplesBtn.addEventListener("click", () => {
      const examples = [
        "Turn this into a cyberpunk style with neon lights, futuristic buildings in the background, purple and blue color tone.",
        "Reimagine this as a watercolor painting with soft pastel colors and visible brush strokes.",
        "Transform into a moody black-and-white film noir scene with dramatic shadows.",
        "Make this look like a vintage 1970s film photograph with warm grain and faded colors."
      ];
      promptInput.value = examples[Math.floor(Math.random() * examples.length)];
      charCount.textContent = promptInput.value.length;
      checkReady();
    });

    function ratioToAspect(ratio) {
      const map = { "1:1": "1/1", "9:16": "9/16", "16:9": "16/9", "4:5": "4/5", "3:2": "3/2" };
      return map[ratio] || "1/1";
    }

    generateBtn.addEventListener("click", async () => {
      if (!promptInput.value.trim()) return;
      generateBtn.disabled = true;
      resultActions.style.display = "none";
      generatedBox.style.aspectRatio = ratioToAspect(selectedRatio);
      generatedBox.classList.remove("placeholder");
      generatedBox.innerHTML = `
        <div style="padding:24px; text-align:center; width:100%;">
          <div class="loading-bar"><span></span></div>
          <p class="loading-label">Generating your ${styleSelect.value.toLowerCase()} image…</p>
        </div>
      `;

      const meta = uploadedDataUrl ? await analyzeImage(previewImg) : null;

      setTimeout(() => {
        const canvas = document.createElement("canvas");
        const baseSize = 480;
        let w = baseSize, h = baseSize;
        const parts = selectedRatio.split(":").map(Number);
        if (parts[0] > parts[1]) { h = Math.round(baseSize * parts[1] / parts[0]); }
        else if (parts[1] > parts[0]) { w = Math.round(baseSize * parts[0] / parts[1]); }
        canvas.width = w; canvas.height = h;
        const ctx = canvas.getContext("2d");

        const filters = {
          "Realistic": "saturate(1.05) contrast(1.05)",
          "Cinematic": "contrast(1.2) saturate(0.9) sepia(0.12)",
          "Anime": "saturate(1.6) contrast(1.15) brightness(1.05)",
          "Fantasy / Painterly": "saturate(1.3) contrast(0.95) blur(0.4px) hue-rotate(-8deg)",
          "Cyberpunk": "saturate(1.7) contrast(1.25) hue-rotate(190deg) brightness(0.95)"
        };

        if (uploadedDataUrl) {
          // Re-renders the original photo through a colour/style filter so
          // the result visibly reacts to both the photo and chosen style.
          ctx.drawImage(previewImg, 0, 0, w, h);
          ctx.filter = filters[styleSelect.value] || "saturate(1.1)";
          ctx.drawImage(canvas, 0, 0);
        } else {
          // No photo was provided — generate an abstract artwork purely
          // from the text prompt: a deterministic hash of the prompt
          // picks a hue, then the chosen style shapes the composition.
          drawTextOnlyArt(ctx, w, h, promptInput.value, styleSelect.value);
        }

        const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
        generatedBox.innerHTML = `<img src="${dataUrl}" alt="Generated result">`;
        resultActions.style.display = "flex";
        generateBtn.disabled = false;

        document.getElementById("downloadImgBtn").onclick = () => {
          const a = document.createElement("a");
          a.href = dataUrl; a.download = "prompt-and-create-generated.jpg"; a.click();
          showToast("Image downloaded.", "fa-solid fa-download");
        };
        document.getElementById("regenImgBtn").onclick = () => generateBtn.click();

        addHistoryEntry({ type: "image", thumb: dataUrl, text: promptInput.value.slice(0, 80), style: styleSelect.value });
        showToast("Image generated!", "fa-solid fa-wand-magic-sparkles");
      }, 1800);
    });
  }

  /* ============================================================
     HISTORY PAGE
     ============================================================ */
  const historyWrap = document.getElementById("historyWrap");
  if (historyWrap) {
    function timeAgo(iso) {
      const diff = Date.now() - new Date(iso).getTime();
      const mins = Math.floor(diff / 60000);
      if (mins < 1) return "just now";
      if (mins < 60) return mins + "m ago";
      const hrs = Math.floor(mins / 60);
      if (hrs < 24) return hrs + "h ago";
      return Math.floor(hrs / 24) + "d ago";
    }

    function renderHistory() {
      const list = getHistory();
      if (list.length === 0) {
        historyWrap.innerHTML = `
          <div class="empty-history">
            <i class="fa-regular fa-clock" style="font-size:30px; color:#c3b6e8;"></i>
            <p style="margin-top:12px;">No generations yet. Try the
              <a href="photo-to-prompt.html" style="color:var(--violet); font-weight:700;">Photo to Prompt</a> or
              <a href="prompt-to-image.html" style="color:var(--violet); font-weight:700;">Prompt to Image</a> tool.</p>
          </div>`;
        return;
      }
      let rows = list.map((item) => `
        <tr>
          <td><img class="history-thumb" src="${item.thumb}" alt=""></td>
          <td><span class="tag-pill ${item.type}">${item.type === "prompt" ? "Prompt" : "Image"}</span></td>
          <td style="max-width:340px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${escapeHtml(item.text || "")}</td>
          <td>${escapeHtml(item.style || "—")}</td>
          <td>${timeAgo(item.date)}</td>
          <td><button class="icon-btn" data-del="${item.id}" title="Delete"><i class="fa-regular fa-trash-can"></i></button></td>
        </tr>
      `).join("");

      historyWrap.innerHTML = `
        <table class="history-table">
          <thead><tr><th>Preview</th><th>Type</th><th>Summary</th><th>Style</th><th>When</th><th></th></tr></thead>
          <tbody>${rows}</tbody>
        </table>`;

      historyWrap.querySelectorAll("[data-del]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const id = Number(btn.dataset.del);
          saveHistory(getHistory().filter((h) => h.id !== id));
          renderHistory();
          showToast("Entry removed.", "fa-regular fa-trash-can");
        });
      });
    }

    function escapeHtml(str) {
      const div = document.createElement("div");
      div.textContent = str;
      return div.innerHTML;
    }

    const clearBtn = document.getElementById("clearHistoryBtn");
    if (clearBtn) {
      clearBtn.addEventListener("click", () => {
        saveHistory([]);
        renderHistory();
        showToast("History cleared.", "fa-regular fa-trash-can");
      });
    }
    renderHistory();
  }

  /* ============================================================
     PRICING PAGE
     ============================================================ */
  document.querySelectorAll(".plan-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      showToast(`${btn.dataset.plan} plan selected — this is a front-end demo.`, "fa-solid fa-star");
    });
  });

})();
