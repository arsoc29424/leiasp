(function() {
  let autoRunning = false;
  let autoPageInterval;
  let interval = 30; // default
  let randomMode = false;
  let darkMode = false;
  let fixed = false;
  let language = "pt"; // padrão

  const translations = {
    pt: {
      title: "Lean Leia Sp",
      start: "Iniciar ▶",
      stop: "Parar ⏸",
      next: "Virar Agora ⚡",
      random: "Modo Aleatório",
      dark: "Dark/Light",
      lock: "Fixar GUI 🔒",
      unlock: "Desfixar GUI 🔓",
      lang: "Idioma 🌐",
      statusRunning: "Executando...",
      statusStopped: "Parado."
    },
    en: {
      title: "Lean Read Sp",
      start: "Start ▶",
      stop: "Stop ⏸",
      next: "Next Now ⚡",
      random: "Random Mode",
      dark: "Dark/Light",
      lock: "Lock GUI 🔒",
      unlock: "Unlock GUI 🔓",
      lang: "Language 🌐",
      statusRunning: "Running...",
      statusStopped: "Stopped."
    }
  };

  function t(key) {
    return translations[language][key];
  }

  // ===== GUI =====
  const gui = document.createElement("div");
  gui.style.position = "fixed";
  gui.style.top = "20px";
  gui.style.right = "20px";
  gui.style.background = "white";
  gui.style.border = "1px solid #ccc";
  gui.style.borderRadius = "12px";
  gui.style.padding = "12px";
  gui.style.zIndex = 9999;
  gui.style.width = "210px";
  gui.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
  gui.style.fontFamily = "Arial, sans-serif";
  gui.style.transition = "background 0.3s, color 0.3s";

  gui.innerHTML = `
    <h3 style="margin:0 0 10px 0; font-size:16px; text-align:center;">${t("title")}</h3>
    <button id="startBtn">${t("start")}</button>
    <button id="stopBtn">${t("stop")}</button>
    <button id="nextBtn">${t("next")}</button>
    <br><br>
    <label>${t("random")} <input type="checkbox" id="randomMode"></label><br>
    <label>${t("dark")} <input type="checkbox" id="darkMode"></label><br>
    <button id="lockBtn">${t("lock")}</button>
    <button id="langBtn">${t("lang")}</button>
    <br><br>
    <label>⏱ Intervalo: <span id="intervalLabel">${interval}</span>s</label>
    <input type="range" min="5" max="120" value="30" id="intervalRange" />
    <br><br>
    <div id="status" style="padding:5px; text-align:center; border-radius:8px; font-weight:bold; background:#f2f2f2;">${t("statusStopped")}</div>
  `;

  document.body.appendChild(gui);

  // ===== Botões =====
  const startBtn = gui.querySelector("#startBtn");
  const stopBtn = gui.querySelector("#stopBtn");
  const nextBtn = gui.querySelector("#nextBtn");
  const randomCheck = gui.querySelector("#randomMode");
  const darkCheck = gui.querySelector("#darkMode");
  const lockBtn = gui.querySelector("#lockBtn");
  const langBtn = gui.querySelector("#langBtn");
  const slider = gui.querySelector("#intervalSlider");
  const label = gui.querySelector("#intervalLabel");
  const status = gui.querySelector("#status");

  // ===== Estilo dos botões =====
  gui.querySelectorAll("button").forEach(btn => {
    btn.style.margin = "3px";
    btn.style.padding = "6px 10px";
    btn.style.border = "none";
    btn.style.borderRadius = "8px";
    btn.style.cursor = "pointer";
    btn.style.transition = "all 0.3s";
    btn.onmouseover = () => btn.style.background = "#ddd";
    btn.onmouseout = () => btn.style.background = "";
  });

  // ===== Logs =====
  const logContainer = document.createElement("div");
  logContainer.style.position = "fixed";
  logContainer.style.bottom = "20px";
  logContainer.style.right = "20px";
  logContainer.style.display = "flex";
  logContainer.style.flexDirection = "column-reverse";
  logContainer.style.gap = "6px";
  logContainer.style.zIndex = 9999;
  document.body.appendChild(logContainer);

  function logMessage(msg, type="info") {
    const log = document.createElement("div");
    log.textContent = msg;
    log.style.padding = "8px 12px";
    log.style.borderRadius = "8px";
    log.style.background = "#406a76";
    log.style.color = "white";
    log.style.fontSize = "14px";
    log.style.boxShadow = "0 2px 6px rgba(0,0,0,0.2)";
    log.style.opacity = "0";
    log.style.transform = "translateY(20px)";
    log.style.transition = "all 0.5s";

    if(type==="start") log.textContent = "✅ " + msg;
    if(type==="stop") log.textContent = "⏸ " + msg;
    if(type==="page") log.textContent = "📖 " + msg;

    logContainer.appendChild(log);

    requestAnimationFrame(() => {
      log.style.opacity = "1";
      log.style.transform = "translateY(0)";
    });

    setTimeout(() => {
      log.style.opacity = "0";
      log.style.transform = "translateY(20px)";
      setTimeout(() => log.remove(), 500);
    }, 5000);
  }

  // ===== Botão de virar página =====
  function clickNextButton() {
    const buttons = document.querySelectorAll("button.sc-lkltAP.joPNDs");
    if (buttons.length > 1) {
      buttons[1].click(); // botão da direita
      logMessage(language==="pt" ? "Página virada" : "Page turned", "page");
    }
  }

  // ===== Funções =====
  function scheduleNextPage() {
    clearTimeout(autoPageInterval);

    if (autoRunning) {
      let delay;
      if (randomMode) {
        delay = Math.floor(Math.random() * (120 - 15 + 1) + 15) * 1000;
      } else {
        delay = interval * 1000;
      }

      autoPageInterval = setTimeout(() => {
        clickNextButton();
        scheduleNextPage();
      }, delay);
    }
  }

  function updateStatus() {
    if(autoRunning){
      status.textContent = t("statusRunning");
      status.style.background = "#28a745";
      status.style.color = "white";
      status.style.boxShadow = "0 0 8px #28a745";
    } else {
      status.textContent = t("statusStopped");
      status.style.background = "#f2f2f2";
      status.style.color = "#333";
      status.style.boxShadow = "0 0 0";
    }
  }

  // ===== Event Listeners =====
  startBtn.onclick = () => {
    autoRunning = true;
    logMessage(language==="pt" ? "Auto iniciado" : "Auto started","start");
    updateStatus();
    scheduleNextPage();
  };

  stopBtn.onclick = () => {
    autoRunning = false;
    clearTimeout(autoPageInterval);
    logMessage(language==="pt" ? "Auto parado" : "Auto stopped","stop");
    updateStatus();
  };

  nextBtn.onclick = () => {
    clickNextButton();
  };

  randomCheck.onchange = e => randomMode = e.target.checked;
  darkCheck.onchange = e => {
    darkMode = e.target.checked;
    gui.style.background = darkMode ? "#1e1e1e" : "white";
    gui.style.color = darkMode ? "white" : "black";
  };

  slider.oninput = e => {
    interval = parseInt(e.target.value);
    label.textContent = interval;
  };

  langBtn.onclick = () => {
    language = language === "pt" ? "en" : "pt";
    gui.querySelector("h3").textContent = t("title");
    startBtn.textContent = t("start");
    stopBtn.textContent = t("stop");
    nextBtn.textContent = t("next");
    randomCheck.parentNode.firstChild.textContent = t("random")+" ";
    darkCheck.parentNode.firstChild.textContent = t("dark")+" ";
    lockBtn.textContent = fixed ? t("unlock") : t("lock");
    langBtn.textContent = t("lang");
    updateStatus();
  };

  lockBtn.onclick = () => {
    fixed = !fixed;
    lockBtn.textContent = fixed ? t("unlock") : t("lock");
    if(fixed) {
      gui.onmousedown = null;
    } else {
      makeDraggable(gui);
    }
  };

  // ===== Drag =====
  function makeDraggable(el) {
    let offsetX, offsetY, dragging = false;
    el.onmousedown = e => {
      if(fixed) return;
      dragging = true;
      offsetX = e.clientX - el.offsetLeft;
      offsetY = e.clientY - el.offsetTop;
    };
    document.onmouseup = () => dragging=false;
    document.onmousemove = e => {
      if(dragging && !fixed) {
        el.style.left = (e.clientX - offsetX)+"px";
        el.style.top = (e.clientY - offsetY)+"px";
        el.style.right = "auto";
      }
    };
  }
  makeDraggable(gui);

})();
