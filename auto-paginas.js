(function () {
    // ======== CONFIG =========
    const config = {
        defaultInterval: 30,
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
        width: 240px;
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

    #lean-timer { text-align:center; font-size:13px; margin-bottom:8px; }

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

    #lean-gui input[type=range], #lean-gui input[type=number] {
        width: 100%;
        margin-top:4px;
    }
    #lean-gui label { font-size:13px; display:block; margin-top:6px; }

    #lean-stealth-btn {
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 1000000;
        background: #444;
        color: #fff;
        border-radius: 50%;
        width: 40px;
        height: 40px;
        display:flex;
        align-items:center;
        justify-content:center;
        cursor: pointer;
        font-size:18px;
        box-shadow: 0 3px 8px rgba(0,0,0,0.3);
    }
    `;
    document.head.appendChild(style);

    // ======== VARIÁVEIS =========
    let interval = config.defaultInterval;
    let randomMin = 60;
    let randomMax = 120;
    let timer = null;
    let countdown = null;
    let remaining = 0;
    let running = false;
    let darkMode = false;
    let fixed = false;
    let randomMode = false;
    let stealth = false;
    let lang = "pt";
    let pages = 0;

    const langs = {
        pt: {
            title: "Lean Leia Sp",
            start: "▶ Iniciar",
            stop: "⏸ Parar",
            now: "⏭ Virar Agora",
            random: "Modo Aleatório Avançado",
            lock: "🔒 Fixar GUI",
            unlock: "🔓 Soltar GUI",
            theme: "🌙 Tema Escuro",
            light: "☀ Tema Claro",
            lang: "🌐 English",
            statusOn: "Executando...",
            statusOff: "Parado",
            interval: "⏱ Intervalo (segundos)",
            randomMin: "Mín (s)",
            randomMax: "Máx (s)",
            pages: "Páginas lidas",
            stealth: "👁 Ocultar Painel"
        },
        en: {
            title: "Lean Read Sp",
            start: "▶ Start",
            stop: "⏸ Stop",
            now: "⏭ Turn Now",
            random: "Advanced Random Mode",
            lock: "🔒 Lock GUI",
            unlock: "🔓 Unlock GUI",
            theme: "🌙 Dark Theme",
            light: "☀ Light Theme",
            lang: "🌐 Português",
            statusOn: "Running...",
            statusOff: "Stopped",
            interval: "⏱ Interval (seconds)",
            randomMin: "Min (s)",
            randomMax: "Max (s)",
            pages: "Pages read",
            stealth: "👁 Hide Panel"
        }
    };

    // ======== GUI =========
    const gui = document.createElement("div");
    gui.id = "lean-gui";
    gui.innerHTML = `
        <h3 data-i18n="title">${langs[lang].title}</h3>
        <div id="lean-status" class="off" data-i18n="statusOff">${langs[lang].statusOff}</div>
        <div id="lean-timer">--s</div>
        <label><span data-i18n="interval">${langs[lang].interval}</span>: <span id="lean-val">${interval}</span></label>
        <input type="range" min="${config.rangeMin}" max="${config.rangeMax}" value="${interval}" id="intervalRange" />
        <label><input type="checkbox" id="lean-random"> <span data-i18n="random">${langs[lang].random}</span></label>
        <label><span data-i18n="randomMin">${langs[lang].randomMin}</span>:
            <input type="number" id="lean-min" value="${randomMin}" min="5" max="600">
        </label>
        <label><span data-i18n="randomMax">${langs[lang].randomMax}</span>:
            <input type="number" id="lean-max" value="${randomMax}" min="5" max="600">
        </label>
        <button id="lean-start" data-i18n="start">${langs[lang].start}</button>
        <button id="lean-stop" data-i18n="stop">${langs[lang].stop}</button>
        <button id="lean-now" data-i18n="now">${langs[lang].now}</button>
        <div><span data-i18n="pages">${langs[lang].pages}</span>: <span id="lean-pages">0</span></div>
        <button id="lean-lock" data-i18n="lock">${langs[lang].lock}</button>
        <button id="lean-theme" data-i18n="theme">${langs[lang].theme}</button>
        <button id="lean-lang" data-i18n="lang">${langs[lang].lang}</button>
        <button id="lean-stealth" data-i18n="stealth">${langs[lang].stealth}</button>
    `;
    document.body.appendChild(gui);

    const logBox = document.createElement("div");
    logBox.id = "lean-logs";
    document.body.appendChild(logBox);

    // botão stealth
    const stealthBtn = document.createElement("div");
    stealthBtn.id = "lean-stealth-btn";
    stealthBtn.textContent = "⚡";
    stealthBtn.style.display = "none";
    document.body.appendChild(stealthBtn);

    // ======== FUNÇÕES =========
    function saveConfig() {
        localStorage.setItem("leanConfig", JSON.stringify({
            interval, randomMin, randomMax, darkMode, lang, fixed, randomMode, stealth,
            pos: { left: gui.style.left, top: gui.style.top, right: gui.style.right },
            pages
        }));
    }

    function loadConfig() {
        const saved = localStorage.getItem("leanConfig");
        if (!saved) return;
        try {
            const cfg = JSON.parse(saved);
            interval = cfg.interval ?? interval;
            randomMin = cfg.randomMin ?? randomMin;
            randomMax = cfg.randomMax ?? randomMax;
            darkMode = cfg.darkMode ?? darkMode;
            lang = cfg.lang ?? lang;
            fixed = cfg.fixed ?? fixed;
            randomMode = cfg.randomMode ?? randomMode;
            stealth = cfg.stealth ?? stealth;
            pages = cfg.pages ?? 0;

            document.getElementById("intervalRange").value = interval;
            document.getElementById("lean-val").textContent = interval;
            document.getElementById("lean-min").value = randomMin;
            document.getElementById("lean-max").value = randomMax;
            document.getElementById("lean-random").checked = randomMode;
            document.getElementById("lean-pages").textContent = pages;
            if (darkMode) gui.classList.add("dark");
            if (stealth) toggleStealth(true);
            if (cfg.pos?.left) {
                gui.style.left = cfg.pos.left;
                gui.style.top = cfg.pos.top;
                gui.style.right = cfg.pos.right;
            }
            refreshLang();
        } catch { }
    }

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
        clearInterval(countdown);
        setStatus(false);
        document.getElementById("lean-timer").textContent = "--s";
        log(langs[lang].statusOff, "⏸");
    }

    function tick() {
        if (!running) return;
        clickPage();
        pages++;
        document.getElementById("lean-pages").textContent = pages;
        log(lang === "pt" ? "Página virada" : "Page turned", "📖");

        let wait = interval * 1000;
        if (randomMode) {
            const min = Math.max(5, parseInt(randomMin));
            const max = Math.max(min + 1, parseInt(randomMax));
            wait = (Math.floor(Math.random() * (max - min + 1)) + min) * 1000;
        }

        remaining = wait / 1000;
        document.getElementById("lean-timer").textContent = remaining + "s";
        clearInterval(countdown);
        countdown = setInterval(() => {
            remaining--;
            if (remaining >= 0) {
                document.getElementById("lean-timer").textContent = remaining + "s";
            }
        }, 1000);

        timer = setTimeout(tick, wait);
        saveConfig();
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
        document.getElementById("lean-pages").textContent = pages;
    }

    function toggleStealth(force = null) {
        stealth = force !== null ? force : !stealth;
        gui.style.display = stealth ? "none" : "block";
        stealthBtn.style.display = stealth ? "flex" : "none";
        saveConfig();
    }

    // ======== EVENTOS =========
    document.getElementById("intervalRange").addEventListener("input", e => {
        interval = parseInt(e.target.value);
        document.getElementById("lean-val").textContent = interval;
        saveConfig();
    });

    document.getElementById("lean-min").addEventListener("change", e => {
        randomMin = parseInt(e.target.value);
        saveConfig();
    });
    document.getElementById("lean-max").addEventListener("change", e => {
        randomMax = parseInt(e.target.value);
        saveConfig();
    });

    document.getElementById("lean-start").onclick = start;
    document.getElementById("lean-stop").onclick = stop;
    document.getElementById("lean-now").onclick = () => {
        clickPage();
        pages++;
        document.getElementById("lean-pages").textContent = pages;
        log(lang === "pt" ? "Página virada manualmente" : "Page turned manually", "📖");
        saveConfig();
    };

    document.getElementById("lean-random").onchange = e => {
        randomMode = e.target.checked;
        saveConfig();
    };

    document.getElementById("lean-lock").onclick = e => {
        fixed = !fixed;
        gui.style.cursor = fixed ? "default" : "move";
        e.target.textContent = fixed ? langs[lang].unlock : langs[lang].lock;
        saveConfig();
    };

    document.getElementById("lean-theme").onclick = e => {
        darkMode = !darkMode;
        gui.classList.toggle("dark", darkMode);
        e.target.textContent = darkMode ? langs[lang].light : langs[lang].theme;
        saveConfig();
    };

    document.getElementById("lean-lang").onclick = () => {
        lang = lang === "pt" ? "en" : "pt";
        refreshLang();
        saveConfig();
    };

    document.getElementById("lean-stealth").onclick = () => toggleStealth();
    stealthBtn.onclick = () => toggleStealth(false);

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
    document.onmouseup = () => {
        if (dragging) saveConfig();
        dragging = false;
    };

    // ======== INIT =========
    loadConfig();

})();
