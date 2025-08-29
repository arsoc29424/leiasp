(function() {
    // Evita duplicar a GUI se já estiver rodando
    if (window.autoPageGUI) {
        window.autoPageGUI.remove();
        clearInterval(window.autoPageInterval);
    }

    // ================= VARIÁVEIS =================
    let interval = 30; // valor inicial em segundos
    let running = false;
    let randomMode = false;
    let darkMode = false;

    // ================= GUI =================
    const gui = document.createElement("div");
    gui.id = "autoPageGUI";
    gui.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #fff;
        color: #000;
        padding: 12px;
        border-radius: 12px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        z-index: 99999;
        width: 220px;
        font-family: Arial, sans-serif;
        transition: background 0.3s, color 0.3s;
    `;
    gui.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;">
            <strong>📖 Auto Páginas</strong>
            <span id="statusDot" style="width:12px;height:12px;border-radius:50%;background:red;display:inline-block;"></span>
        </div>
        <div style="margin-top:10px;">
            <label>⏱ Intervalo: <span id="intervalValue">${interval}</span>s</label>
            <input type="range" id="intervalSlider" min="15" max="120" value="${interval}" step="1" style="width:100%;">
        </div>
        <div style="margin-top:10px;">
            <button id="startBtn">▶ Iniciar</button>
            <button id="stopBtn" disabled>⏸ Parar</button>
            <button id="nextBtn">⏩ Virar Agora</button>
        </div>
        <div style="margin-top:10px;">
            <label><input type="checkbox" id="randomMode"> 🎲 Modo Aleatório</label>
        </div>
        <div style="margin-top:10px;">
            <button id="themeBtn">🌙 Modo Escuro</button>
        </div>
    `;
    document.body.appendChild(gui);
    window.autoPageGUI = gui;

    // ================= LOGS =================
    const logContainer = document.createElement("div");
    logContainer.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        max-width: 350px;
        z-index: 99999;
    `;
    document.body.appendChild(logContainer);

    function addLog(message, type="info") {
        const log = document.createElement("div");
        let icon = "ℹ️";
        if (type === "start") icon = "✅";
        if (type === "stop") icon = "⏸";
        if (type === "page") icon = "📖";

        log.textContent = `${icon} ${message}`;
        log.style.cssText = `
            background: rgba(0,0,0,0.8);
            color: #fff;
            padding: 8px 12px;
            margin-top: 8px;
            border-radius: 8px;
            font-size: 14px;
            opacity: 0;
            transform: translateY(20px);
            transition: all 0.5s ease;
        `;
        logContainer.appendChild(log);

        // animação de entrada
        requestAnimationFrame(() => {
            log.style.opacity = "1";
            log.style.transform = "translateY(0)";
        });

        // animação de saída
        setTimeout(() => {
            log.style.opacity = "0";
            log.style.transform = "translateY(-20px)";
            setTimeout(() => log.remove(), 500);
        }, 5000);
    }

    // ================= FUNÇÕES =================
    function clickPage() {
        const buttons = document.querySelectorAll("button.sc-lkltAP.joPNDs");
        if (buttons.length > 1) {
            buttons[1].click(); // clica no botão da direita
            addLog("Página virada!", "page");
        }
    }

    function start() {
        if (running) return;
        running = true;
        document.getElementById("statusDot").style.background = "limegreen";
        document.getElementById("startBtn").disabled = true;
        document.getElementById("stopBtn").disabled = false;
        addLog("Auto páginas iniciado!", "start");

        window.autoPageInterval = setInterval(() => {
            let delay = interval * 1000;
            if (randomMode) {
                let min = 15, max = 120;
                delay = (Math.floor(Math.random() * (max - min + 1)) + min) * 1000;
            }
            setTimeout(clickPage, delay);
        }, interval * 1000);
    }

    function stop() {
        running = false;
        clearInterval(window.autoPageInterval);
        document.getElementById("statusDot").style.background = "red";
        document.getElementById("startBtn").disabled = false;
        document.getElementById("stopBtn").disabled = true;
        addLog("Auto páginas parado!", "stop");
    }

    // ================= EVENTOS =================
    document.getElementById("intervalSlider").oninput = (e) => {
        interval = parseInt(e.target.value, 10);
        document.getElementById("intervalValue").textContent = interval;
    };

    document.getElementById("startBtn").onclick = start;
    document.getElementById("stopBtn").onclick = stop;
    document.getElementById("nextBtn").onclick = clickPage;

    document.getElementById("randomMode").onchange = (e) => {
        randomMode = e.target.checked;
    };

    document.getElementById("themeBtn").onclick = () => {
        darkMode = !darkMode;
        if (darkMode) {
            gui.style.background = "#222";
            gui.style.color = "#fff";
            document.getElementById("themeBtn").textContent = "☀️ Modo Claro";
        } else {
            gui.style.background = "#fff";
            gui.style.color = "#000";
            document.getElementById("themeBtn").textContent = "🌙 Modo Escuro";
        }
    };

})();
