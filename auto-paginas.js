javascript:(() => {
  // ========= ESTILOS =========
  const style = document.createElement("style");
  style.innerHTML = `
    #autoPagerGUI {
      position: fixed;
      top: 20px;
      right: 40px;
      background: var(--bg);
      color: var(--fg);
      border: 2px solid var(--border);
      border-radius: 12px;
      padding: 12px;
      font-family: Arial, sans-serif;
      font-size: 14px;
      z-index: 999999;
      width: 260px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.2);
      user-select: none;
      transition: background 0.3s, color 0.3s;
    }
    #autoPagerGUI.dark { --bg: #222; --fg: #eee; --border: #555; }
    #autoPagerGUI.light { --bg: #fff; --fg: #222; --border: #ccc; }
    #autoPagerGUI h3 { margin: 0 0 10px; font-size: 16px; text-align: center; }

    #autoPagerGUI button {
      background: var(--border);
      border: none;
      border-radius: 8px;
      padding: 6px 10px;
      margin: 4px;
      cursor: pointer;
      transition: transform 0.2s, background 0.3s;
      color: var(--fg);
      font-size: 14px;
    }
    #autoPagerGUI button:hover { background: #3c82f6; color: white; transform: scale(1.05); }
    #autoPagerGUI button:active { transform: scale(0.95); }

    #autoPagerGUI label { display:block; margin-top: 8px; font-size: 13px; }
    #autoPagerGUI input[type=range] { width: 100%; }

    .status-indicator {
      margin-top: 10px;
      padding: 4px;
      border-radius: 6px;
      text-align: center;
      font-weight: bold;
    }
    .status-on {
      background: rgba(0,200,0,0.2);
      color: lime;
      animation: glowGreen 1s infinite alternate;
    }
    .status-off {
      background: rgba(200,0,0,0.2);
      color: red;
      animation: glowRed 1s infinite alternate;
    }
    @keyframes glowGreen { from{box-shadow:0 0 5px lime;} to{box-shadow:0 0 15px lime;} }
    @keyframes glowRed { from{box-shadow:0 0 5px red;} to{box-shadow:0 0 15px red;} }

    #logContainer {
      position: fixed;
      bottom: 20px;
      right: 40px;
      width: 260px;
      z-index: 999999;
    }
    .logMessage {
      background: var(--bg);
      color: var(--fg);
      border-radius: 8px;
      padding: 6px 10px;
      margin-top: 6px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.2);
      opacity: 0;
      transform: translateY(20px);
      transition: all 0.5s ease;
      display:flex;
      align-items:center;
      gap:6px;
    }
    .logMessage.show { opacity: 1; transform: translateY(0); }
    .logMessage.hide { opacity: 0; transform: translateY(-20px); }
  `;
  document.head.appendChild(style);

  // ========= VARIÁVEIS =========
  let interval = 30;
  let autoRunning = false;
  let autoPageTimeout = null;
  let randomMode = false;
  let fixedGUI = false;
  let lang = "pt";
  const dict = {
    pt: {
      title: "📖 Auto Páginas",
      start: "▶ Iniciar",
      stop: "⏸ Parar",
      next: "⏩ Virar Agora",
      random: "Modo aleatório",
      interval: "Intervalo (s):",
      theme: "🌗 Tema",
      pin: "📌 Fixar GUI",
      statusOn: "Executando...",
      statusOff: "Parado",
      logStart: "✅ Auto-páginas iniciado",
      logStop: "⏸ Auto-páginas parado",
      logTurn: "📖 Página virada"
    },
    en: {
      title: "📖 Auto Pager",
      start: "▶ Start",
      stop: "⏸ Stop",
      next: "⏩ Next Now",
      random: "Random mode",
      interval: "Interval (s):",
      theme: "🌗 Theme",
      pin: "📌 Pin GUI",
      statusOn: "Running...",
      statusOff: "Stopped",
      logStart: "✅ Auto-pager started",
      logStop: "⏸ Auto-pager stopped",
      logTurn: "📖 Page turned"
    }
  };

  // ========= GUI =========
  const gui = document.createElement("div");
  gui.id = "autoPagerGUI";
  gui.className = "light";
  gui.innerHTML = `
    <h3 id="guiTitle">${dict[lang].title}</h3>
    <div style="text-align:center;">
      <button id="startBtn">${dict[lang].start}</button>
      <button id="stopBtn">${dict[lang].stop}</button>
      <button id="nextBtn">${dict[lang].next}</button>
    </div>
    <label>${dict[lang].interval}
      <input type="range" min="5" max="120" value="30" id="intervalRange" />
      <span id="intervalValue">30</span>s
    </label>
    <label><input type="checkbox" id="randomChk"> ${dict[lang].random}</label>
    <div style="margin-top:6px; text-align:center;">
      <button id="themeBtn">${dict[lang].theme}</button>
      <button id="pinBtn">${dict[lang].pin}</button>
      <button id="langBtn">🌐</button>
    </div>
    <div id="status" class="status-indicator status-off">${dict[lang].statusOff}</div>
  `;
  document.body.appendChild(gui);

  // ========= LOG CONTAINER =========
  const logContainer = document.createElement("div");
  logContainer.id = "logContainer";
  document.body.appendChild(logContainer);

  function addLog(msg) {
    const log = document.createElement("div");
    log.className = "logMessage";
    log.innerHTML = msg;
    logContainer.appendChild(log);
    setTimeout(() => log.classList.add("show"), 50);
    setTimeout(() => {
      log.classList.remove("show");
      log.classList.add("hide");
      setTimeout(() => log.remove(), 500);
    }, 5000);
  }

  // ========= FUNÇÕES =========
  function clickNextButton() {
    const btns = document.querySelectorAll("button.sc-lkltAP");
    if (btns.length > 1) {
      btns[1].click();
      addLog(dict[lang].logTurn);
    }
  }

  function scheduleNextPage() {
    clearTimeout(autoPageTimeout);
    if (!autoRunning) return;

    let delay;
    if (randomMode) {
      delay = Math.floor(Math.random() * (120 - 15 + 1) + 15) * 1000;
    } else {
      delay = interval * 1000;
    }

    autoPageTimeout = setTimeout(() => {
      clickNextButton();
      scheduleNextPage();
    }, delay);
  }

  function startAuto() {
    if (!autoRunning) {
      autoRunning = true;
      document.getElementById("status").className = "status-indicator status-on";
      document.getElementById("status").textContent = dict[lang].statusOn;
      scheduleNextPage();
      addLog(dict[lang].logStart);
    }
  }

  function stopAuto() {
    autoRunning = false;
    clearTimeout(autoPageTimeout);
    document.getElementById("status").className = "status-indicator status-off";
    document.getElementById("status").textContent = dict[lang].statusOff;
    addLog(dict[lang].logStop);
  }

  // ========= EVENTOS =========
  document.getElementById("startBtn").onclick = startAuto;
  document.getElementById("stopBtn").onclick = stopAuto;
  document.getElementById("nextBtn").onclick = clickNextButton;

  document.getElementById("intervalRange").oninput = e => {
    interval = +e.target.value;
    document.getElementById("intervalValue").textContent = interval;
  };
  document.getElementById("randomChk").onchange = e => randomMode = e.target.checked;

  document.getElementById("themeBtn").onclick = () => {
    gui.classList.toggle("dark");
    gui.classList.toggle("light");
  };

  document.getElementById("pinBtn").onclick = () => {
    fixedGUI = !fixedGUI;
    gui.style.cursor = fixedGUI ? "default" : "move";
  };

  document.getElementById("langBtn").onclick = () => {
    lang = lang === "pt" ? "en" : "pt";
    gui.remove();
    logContainer.remove();
    style.remove();
    eval("(" + arguments.callee.toString() + ")()"); // reinicia script com nova lingua
  };

  // ========= DRAGGABLE =========
  let isDragging = false, offsetX, offsetY;
  gui.onmousedown = e => {
    if (fixedGUI) return;
    isDragging = true;
    offsetX = e.clientX - gui.offsetLeft;
    offsetY = e.clientY - gui.offsetTop;
  };
  document.onmousemove = e => {
    if (isDragging && !fixedGUI) {
      gui.style.left = e.clientX - offsetX + "px";
      gui.style.top = e.clientY - offsetY + "px";
      gui.style.right = "auto";
    }
  };
  document.onmouseup = () => isDragging = false;

})();
