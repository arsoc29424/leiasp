(function() {
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
    #lean-gui label { font-size:13px; }

    `;
    document.head.appendChild(style);

    // ======== VARIÁVEIS =========
    let interval = 30;
    let timer = null;
    let running = false;
    let darkMode = false;
    let fixed = false;
    let randomMode = false;
    let lang = "pt";
    const langs = {
        pt: {
            title:"Lean Leia Sp",
            start:"▶ Iniciar",
            stop:"⏸ Parar",
            now:"⏭ Virar Agora",
            random:"Modo Aleatório",
            lock:"🔒 Fixar GUI",
            unlock:"🔓 Soltar GUI",
            theme:"🌙 Tema Escuro",
            light:"☀ Tema Claro",
            lang:"🌐 English",
            statusOn:"Executando...",
            statusOff:"Parado"
        },
        en: {
            title:"Lean Read Sp",
            start:"▶ Start",
            stop:"⏸ Stop",
            now:"⏭ Turn Now",
            random:"Random Mode",
            lock:"🔒 Lock GUI",
            unlock:"🔓 Unlock GUI",
            theme:"🌙 Dark Theme",
            light:"☀ Light Theme",
            lang:"🌐 Português",
            statusOn:"Running...",
            statusOff:"Stopped"
        }
    };

    // ======== GUI =========
    const gui = document.createElement("div");
    gui.id = "lean-gui";
    gui.innerHTML = `
        <h3 id="lean-title">${langs[lang].title}</h3>
        <div id="lean-status" class="off">${langs[lang].statusOff}</div>
        <label>${lang==="pt"?"⏱ Intervalo (segundos)":"⏱ Interval (seconds)"}: <span id="lean-val">${interval}</span></label>
        <input type="range" min="5" max="120" value="${interval}" id="intervalRange" />
        <button id="lean-start">${langs[lang].start}</button>
        <button id="lean-stop">${langs[lang].stop}</button>
        <button id="lean-now">${langs[lang].now}</button>
        <label><input type="checkbox" id="lean-random"> ${langs[lang].random}</label>
        <button id="lean-lock">${langs[lang].lock}</button>
        <button id="lean-theme">${langs[lang].theme}</button>
        <button id="lean-lang">${langs[lang].lang}</button>
    `;
    document.body.appendChild(gui);

    // Logs container
    const logBox = document.createElement("div");
    logBox.id = "lean-logs";
    document.body.appendChild(logBox);

    // ======== FUNÇÕES =========
    function log(msg, icon="ℹ️") {
        const div = document.createElement("div");
        div.className = "lean-log";
        div.innerHTML = `<span>${icon}</span> ${msg}`;
        logBox.appendChild(div);
        setTimeout(()=>div.classList.add("hide"),4800);
        setTimeout(()=>div.remove(),5200);
    }

    function start() {
        if(running) return;
        running = true;
        document.getElementById("lean-status").textContent = langs[lang].statusOn;
        document.getElementById("lean-status").className = "on";
        tick();
        log(langs[lang].statusOn,"✅");
    }

    function stop() {
        running = false;
        clearTimeout(timer);
        document.getElementById("lean-status").textContent = langs[lang].statusOff;
        document.getElementById("lean-status").className = "off";
        log(langs[lang].statusOff,"⏸");
    }

    function tick() {
        if(!running) return;
        clickPage();
        log(lang==="pt"?"Página virada":"Page turned","📖");
        let wait = interval*1000;
        if(randomMode) {
            const min=60, max=120;
            wait = (Math.floor(Math.random()*(max-min+1))+min)*1000;
        }
        timer = setTimeout(tick,wait);
    }

    function clickPage() {
        const btns = document.querySelectorAll("button.sc-lkltAP");
        if(btns.length>1) btns[1].click();
    }

    // ======== EVENTOS =========
    document.getElementById("intervalRange").addEventListener("input",e=>{
        interval = parseInt(e.target.value);
        document.getElementById("lean-val").textContent = interval;
    });

    document.getElementById("lean-start").onclick = start;
    document.getElementById("lean-stop").onclick = stop;
    document.getElementById("lean-now").onclick = ()=>{ clickPage(); log(lang==="pt"?"Página virada manualmente":"Page turned manually","📖"); };

    document.getElementById("lean-random").onchange = e=>{
        randomMode = e.target.checked;
    };

    document.getElementById("lean-lock").onclick = e=>{
        fixed = !fixed;
        gui.style.cursor = fixed?"default":"move";
        e.target.textContent = fixed?langs[lang].unlock:langs[lang].lock;
    };

    document.getElementById("lean-theme").onclick = e=>{
        darkMode = !darkMode;
        if(darkMode) {
            gui.classList.add("dark");
            document.body.style.background="#000";
            document.body.style.color="#fff";
            e.target.textContent = langs[lang].light;
        } else {
            gui.classList.remove("dark");
            document.body.style.background="#fff";
            document.body.style.color="#000";
            e.target.textContent = langs[lang].theme;
        }
    };

    document.getElementById("lean-lang").onclick = e=>{
        lang = lang==="pt"?"en":"pt";
        refreshLang();
    };

    function refreshLang(){
        document.getElementById("lean-title").textContent=langs[lang].title;
        document.getElementById("lean-start").textContent=langs[lang].start;
        document.getElementById("lean-stop").textContent=langs[lang].stop;
        document.getElementById("lean-now").textContent=langs[lang].now;
        document.querySelector("label[for]").textContent=lang==="pt"?"⏱ Intervalo (segundos)":"⏱ Interval (seconds)";
        document.getElementById("lean-random").nextSibling.textContent=" "+langs[lang].random;
        document.getElementById("lean-lock").textContent=fixed?langs[lang].unlock:langs[lang].lock;
        document.getElementById("lean-theme").textContent=darkMode?langs[lang].light:langs[lang].theme;
        document.getElementById("lean-lang").textContent=langs[lang].lang;
        document.getElementById("lean-status").textContent=running?langs[lang].statusOn:langs[lang].statusOff;
    }

    // ======== DRAG =========
    let offsetX, offsetY;
    gui.onmousedown = e=>{
        if(fixed) return;
        offsetX = e.clientX - gui.getBoundingClientRect().left;
        offsetY = e.clientY - gui.getBoundingClientRect().top;
        document.onmousemove = ev=>{
            gui.style.left = (ev.clientX-offsetX)+"px";
            gui.style.top = (ev.clientY-offsetY)+"px";
            gui.style.right="auto";
        };
        document.onmouseup = ()=>document.onmousemove=null;
    };

})();
