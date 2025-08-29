(function() {
  let autoRunning = false;
  let interval = 30; // valor inicial em segundos
  let randomMode = false;
  let autoPageInterval;
  let isDarkMode = false;

  // ---- GUI ----
  const gui = document.createElement("div");
  gui.style.position = "fixed";
  gui.style.top = "20px";
  gui.style.right = "20px";
  gui.style.zIndex = "99999";
  gui.style.background = "#ffffff";
  gui.style.color = "#333";
  gui.style.padding = "15px";
  gui.style.borderRadius = "12px";
  gui.style.boxShadow = "0 4px 12px rgba(0,0,0,0.2)";
  gui.style.width = "220px";
  gui.style.cursor = "move";
  gui.style.fontFamily = "Arial, sans-serif";
  gui.innerHTML = `
    <h3 style="margin:0 0 10px 0; font-size:16px; text-align:center;">Lean Leia Sp</h3>
    <div>Status: <span id="status-indicator" style="font-weight:bold; color:red;">OFF</span></div>
    <label style="display:block; margin-top:10px;">⏱ Tempo (s): 
      <input id="time-slider" type="range" min="5" max="120" value="${interval}" style="width:100%;">
      <span id="time-value">${interval}</span>s
    </label>
    <label style="display:block; margin-top:10px;">
      <input type="checkbox" id="random-mode"> ⤭ Modo Aleatório
    </label>
    <button id="toggle-btn" style="margin-top:10px; padding:6px 10px; width:100%; border:none; border-radius:8px; background:#406a76; color:white; font-size:14px; cursor:pointer;">Iniciar</button>
    <button id="theme-btn" style="margin-top:10px; padding:6px 10px; width:100%; border:none; border-radius:8px; background:#888; color:white; font-size:14px; cursor:pointer;">🌙 Dark Mode</button>
  `;
  document.body.appendChild(gui);

  const statusIndicator = gui.querySelector("#status-indicator");
  const slider = gui.querySelector("#time-slider");
  const timeValue = gui.querySelector("#time-value");
  const randomCheckbox = gui.querySelector("#random-mode");
  const toggleBtn = gui.querySelector("#toggle-btn");
  const themeBtn = gui.querySelector("#theme-btn");

  // ---- Logs ----
  const logContainer = document.createElement("div");
  logContainer.style.position = "fixed";
  logContainer.style.bottom = "20px";
  logContainer.style.right = "20px";
  logContainer.style.display = "flex";
  logContainer.style.flexDirection = "column-reverse"; // novos embaixo
  logContainer.style.gap = "8px";
  logContainer.style.zIndex = "99999";
  document.body.appendChild(logContainer);

  function addLog(message, color = "#406a76") {
    const log = document.createElement("div");
    log.textContent = message;
    log.style.background = color;
    log.style.color = "white";
    log.style.padding = "8px 12px";
    log.style.borderRadius = "8px";
    log.style.fontSize = "14px";
    log.style.minWidth = "180px";
    log.style.textAlign = "center";
    log.style.opacity = "0";
    log.style.transform = "translateY(20px)";
    log.style.transition = "opacity 0.4s ease, transform 0.4s ease";

    logContainer.appendChild(log);

    requestAnimationFrame(() => {
      log.style.opacity = "1";
      log.style.transform = "translateY(0)";
    });

    setTimeout(() => {
      log.style.opacity = "0";
      log.style.transform = "translateY(20px)";
      setTimeout(() => log.remove(), 400);
    }, 5000);
  }

  // ---- Dark / Light Mode ----
  function toggleTheme() {
    isDarkMode = !isDarkMode;
    if (isDarkMode) {
      gui.style.background = "#222";
      gui.style.color = "#eee";
      gui.style.boxShadow = "0 4px 12px rgba(255,255,255,0.2)";
      themeBtn.textContent = "☀ Light Mode";
      themeBtn.style.background = "#444";
    } else {
      gui.style.background = "#fff";
      gui.style.color = "#333";
      gui.style.boxShadow = "0 4px 12px rgba(0,0,0,0.2)";
      themeBtn.textContent = "🌙 Dark Mode";
      themeBtn.style.background = "#888";
    }
  }

  themeBtn.onclick = toggleTheme;

  // ---- Draggable ----
  let offsetX, offsetY, isDragging = false;

  gui.addEventListener("mousedown", e => {
    isDragging = true;
    offsetX = e.clientX - gui.getBoundingClientRect().left;
    offsetY = e.clientY - gui.getBoundingClientRect().top;
  });
  document.addEventListener("mouseup", () => isDragging = false);
  document.addEventListener("mousemove", e => {
    if (isDragging) {
      gui.style.top = (e.clientY - offsetY) + "px";
      gui.style.left = (e.clientX - offsetX) + "px";
      gui.style.right = "auto";
    }
  });

  // ---- Controle ----
  slider.oninput = () => {
    interval = parseInt(slider.value, 10);
    timeValue.textContent = interval;
  };

  randomCheckbox.onchange = () => {
    randomMode = randomCheckbox.checked;
  };

  toggleBtn.onclick = () => {
    autoRunning = !autoRunning;
    if (autoRunning) {
      statusIndicator.textContent = "ON";
      statusIndicator.style.color = "green";
      toggleBtn.textContent = "Parar";
      addLog("▶ Auto-páginas iniciado", "#2e7d32");
      scheduleNextPage();
    } else {
      statusIndicator.textContent = "OFF";
      statusIndicator.style.color = "red";
      toggleBtn.textContent = "Iniciar";
      clearTimeout(autoPageInterval);
      addLog("⏸ Auto-páginas parado", "#c62828");
    }
  };

  function clickNextButton() {
    const buttons = document.querySelectorAll("button.sc-lkltAP.joPNDs");
    if (buttons.length > 1) {
      buttons[1].click(); // botão da direita
      addLog("📖 Página virada!");
    }
  }

  function scheduleNextPage() {
    clearTimeout(autoPageInterval);

    if (autoRunning) {
      let delay;
      if (randomMode) {
        delay = Math.floor(Math.random() * (120 - 15 + 1) + 15) * 1000; // 15s - 120s
      } else {
        delay = interval * 1000;
      }

      autoPageInterval = setTimeout(() => {
        clickNextButton();
        scheduleNextPage();
      }, delay);
    }
  }
})();
