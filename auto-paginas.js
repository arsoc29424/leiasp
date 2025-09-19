(function () {
    // ======== CONFIG =========
    const config = {
        defaultInterval: 30,
        randomMin: 60,
        randomMax: 120,
        rangeMin: 5,
        rangeMax: 120,
        logDuration: 5200,
        maxLogs: 5
    };

    // ======== ESTILOS =========
    const style = document.createElement("style");
    style.innerHTML = `
    #lean-gui {
        position: fixed;
        top: 50px;
        right: 50px;
        width: 220px;
        background: #fff;
        border-radius: 15px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.3);
        font-family: Arial, sans-serif;
        padding: 12px;
        z-index: 999999;
        user-select: none;
        transition: background 0.3s, color 0.3s;
    }
    #lean-gui.dark { background:#111; color:#fff; }

    #lean-gui h3 { margin: 0 0 10px; font-size: 16px; text-align:center; }

    #lean-gui button {
        margin: 4px 0;
        padding: 6px 10px;
        width: 100%;
        border: none;
        border-radius: 10px;
        cursor: pointer;
        transition: background 0.3s;
        font-size: 14px;
    }
    #lean-gui button:hover { filter: brightness(1.2); }

    #lean-status {
        text-align:center;
        margin: 8px 0;
        font-weight:bold;
    }
    #lean-status.on { color:lime; text-shadow:0 0 8px lime; animation: pulse 1.2s infinite; }
    #lean-status.off { color:red; text-shadow:0 0 8px red; }

    @keyframes pulse {
        0%,100% { opacity:1; }
        50% { opacity:0.5; }
    }

    #lean-logs {
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        width: 300px;
        z-index: 999999;
    }
    .lean-log {
        background: rgba(0,0,0,0.8);
        color: #fff;
        margin-top: 6px;
        padding: 8px 12px;
        border-radius: 12px;
        font-size: 13px;
        display: flex;
        align-items: center;
        gap: 6px;
        opacity: 0;
        transform: translateY(20px);
        animation: slideUp 0.4s forwards;
    }
    @keyframes slideUp {
        to { opacity:1; transform: translateY(0); }
    }
    .lean-log.hide {
        animation: slideDown 0.4s forwards;
    }
    @keyframes slideDown {
        to { opacity:0; transform: translateY(20px); }
    }

    #lean-gui input[type=range] {
        width: 100%;
    }
    #lean-gui label { font-size:13px; display:block; margin-top:6px; }
    `;
    document.head.appendChild(style);

    // ======== VARIÁVEIS =========
    let interval = config.defaultInterval;
    let timer = null;
    let running = false;
    let darkMode = false;
    let fixed = false;
    let randomMode = false;
    let lang = "pt";

    const langs = {
        pt: {
            title: "Lean Leia Sp",
            start: "▶ Iniciar",
            stop: "⏸ Parar",
            now: "⏭ Virar Agora",
            random: "Modo Aleatório",
            lock: "🔒 Fixar GUI",
            unlock: "🔓 Soltar GUI",
            theme: "🌙 Tema Escuro",
            light: "☀ Tema Claro",
            lang: "🌐 English",
            statusOn: "Executando...",
            statusOff: "Parado",
            interval: "⏱ Intervalo (segundos)"
        },
        en: {
            title: "Lean Read Sp",
            start: "▶ Start",
            stop: "⏸ Stop",
            now: "⏭ Turn Now",
            random: "Random Mode",
            lock: "🔒 Lock GUI",
            unlock: "🔓 Unlock GUI",
            theme: "🌙 Dark Theme",
            light: "☀ Light Theme",
            lang: "🌐 Português",
            statusOn: "Running...",
            statusOff: "Stopped",
            interval: "⏱ Interval (seconds)"
        }
    };

    // ======== GUI =========
    const gui = document.createElement("div");
    gui.id = "lean-gui";
    gui.innerHTML = `
        <h3 data-i18n="title">${langs[lang].title}</h3>
        <div id="lean-status" class="off" data-i18n="statusOff">${langs[lang].statusOff}</div>
        <label><span data-i18n="interval">${langs[lang].interval}</span>: <span id="lean-val">${interval}</span></label>
        <input type="range" min="${config.rangeMin}" max="${config.rangeMax}" value="${interval}" id="intervalRange" />
        <button id="lean-start" data-i18n="start">${langs[lang].start}</button>
        <button id="lean-stop" data-i18n="stop">${langs[lang].stop}</button>
        <button id="lean-now" data-i18n="now">${langs[lang].now}</button>
        <label><input type="checkbox" id="lean-random"> <span data-i18n="random">${langs[lang].random}</span></label>
        <button id="lean-lock" data-i18n="lock">${langs[lang].lock}</button>
        <button id="lean-theme" data-i18n="theme">${langs[lang].theme}</button>
        <button id="lean-lang" data-i18n="lang">${langs[lang].lang}</button>
    `;
    document.body.appendChild(gui);

    const logBox = document.createElement("div");
    logBox.id = "lean-logs";
    document.body.appendChild(logBox);

    // ======== FUNÇÕES =========
    function log(msg, icon = "ℹ️") {
        if (logBox.children.length >= config.maxLogs) {
            logBox.removeChild(logBox.firstChild);
        }
        const div = document.createElement("div");
        div.className = "lean-log";
        div.innerHTML = `<span>${icon}</span> ${msg}`;
        logBox.appendChild(div);
        setTimeout(() => div.classList.add("hide"), config.logDuration - 400);
        setTimeout(() => div.remove(), config.logDuration);
    }

    function setStatus(isRunning) {
        const el = document.getElementById("lean-status");
        el.textContent = isRunning ? langs[lang].statusOn : langs[lang].statusOff;
        el.className = isRunning ? "on" : "off";
    }

    function start() {
        if (running) return;
        running = true;
        setStatus(true);
        tick();
        log(langs[lang].statusOn, "✅");
    }

    function stop() {
        running = false;
        clearTimeout(timer);
        setStatus(false);
        log(langs[lang].statusOff, "⏸");
    }

    function tick() {
        if (!running) return;
        clickPage();
        log(lang === "pt" ? "Página virada" : "Page turned", "📖");

        let wait = interval * 1000;
        if (randomMode) {
            wait = (Math.floor(Math.random() * (config.randomMax - config.randomMin + 1)) + config.randomMin) * 1000;
        }
        timer = setTimeout(tick, wait);
    }

    function clickPage() {
        const nextBtn = document.querySelector("button.sc-lkltAP[aria-label='Próxima página'], button.sc-lkltAP:nth-of-type(2)");
        if (nextBtn) nextBtn.click();
    }

    function refreshLang() {
        document.querySelectorAll("[data-i18n]").forEach(el => {
            const key = el.getAttribute("data-i18n");
            el.textContent = langs[lang][key];
        });
        setStatus(running);
        document.getElementById("lean-val").textContent = interval;
        document.getElementById("lean-lock").textContent = fixed ? langs[lang].unlock : langs[lang].lock;
        document.getElementById("lean-theme").textContent = darkMode ? langs[lang].light : langs[lang].theme;
    }

    // ======== EVENTOS =========
    document.getElementById("intervalRange").addEventListener("input", e => {
        interval = parseInt(e.target.value);
        document.getElementById("lean-val").textContent = interval;
    });

    document.getElementById("lean-start").onclick = start;
    document.getElementById("lean-stop").onclick = stop;
    document.getElementById("lean-now").onclick = () => {
        clickPage();
        log(lang === "pt" ? "Página virada manualmente" : "Page turned manually", "📖");
    };

    document.getElementById("lean-random").onchange = e => {
        randomMode = e.target.checked;
    };

    document.getElementById("lean-lock").onclick = e => {
        fixed = !fixed;
        gui.style.cursor = fixed ? "default" : "move";
        e.target.textContent = fixed ? langs[lang].unlock : langs[lang].lock;
    };

    document.getElementById("lean-theme").onclick = e => {
        darkMode = !darkMode;
        gui.classList.toggle("dark", darkMode);
        e.target.textContent = darkMode ? langs[lang].light : langs[lang].theme;
    };

    document.getElementById("lean-lang").onclick = () => {
        lang = lang === "pt" ? "en" : "pt";
        refreshLang();
    };

    // ======== DRAG =========
    let offsetX, offsetY, dragging = false;
    gui.onmousedown = e => {
        if (fixed) return;
        dragging = true;
        offsetX = e.clientX - gui.getBoundingClientRect().left;
        offsetY = e.clientY - gui.getBoundingClientRect().top;
    };

    document.onmousemove = ev => {
        if (!dragging) return;
        requestAnimationFrame(() => {
            gui.style.left = (ev.clientX - offsetX) + "px";
            gui.style.top = (ev.clientY - offsetY) + "px";
            gui.style.right = "auto";
        });
    };

    document.onmouseup = () => dragging = false;

})();
