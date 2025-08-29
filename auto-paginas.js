(function () {
    let intervalo = null;
    let darkMode = true;

    // ===== Criar GUI =====
    let gui = document.createElement("div");
    gui.style.position = "fixed";
    gui.style.top = "20px";
    gui.style.right = "20px";
    gui.style.padding = "15px";
    gui.style.background = "#2c3e50";
    gui.style.color = "#ecf0f1";
    gui.style.fontFamily = "Arial, sans-serif";
    gui.style.borderRadius = "15px";
    gui.style.boxShadow = "0 6px 18px rgba(0,0,0,0.5)";
    gui.style.zIndex = "999999";
    gui.style.width = "230px";
    gui.style.textAlign = "center";
    gui.style.cursor = "move";

    gui.innerHTML = `
        <h3 style="margin:0 0 10px 0; font-size:16px;">📖 Lean Leia Sp</h3>
        <div id="status" style="margin-bottom:8px; font-weight:bold; color:#e74c3c;">🔴 OFF</div>

        <label style="font-size:14px;">⏱ Tempo (s): <span id="tempoVal">5</span></label><br>
        <input type="range" id="tempoSlider" min="1" max="30" value="5" style="width:100%; margin:5px 0;">

        <label style="font-size:14px; display:block; margin-top:6px;">
            <input type="checkbox" id="modoAleatorio"> ⤭ Modo Aleatório
        </label>

        <br>
        <button id="iniciarBtn" style="margin-top:8px; padding:6px 12px; border:none; border-radius:8px; background:#27ae60; color:white; cursor:pointer; font-weight:bold;">▶ Iniciar</button>
        <button id="pararBtn" style="margin-top:5px; padding:6px 12px; border:none; border-radius:8px; background:#c0392b; color:white; cursor:pointer; font-weight:bold;">⏹ Parar</button>
        <br>
        <button id="modoBtn" style="margin-top:8px; padding:6px 12px; border:none; border-radius:8px; background:#8e44ad; color:white; cursor:pointer; font-weight:bold;">🌙 Dark/☀ Light</button>
    `;
    document.body.appendChild(gui);

    // ===== Criar container de logs =====
    let logContainer = document.createElement("div");
    logContainer.style.position = "fixed";
    logContainer.style.bottom = "20px";
    logContainer.style.left = "50%";
    logContainer.style.transform = "translateX(-50%)";
    logContainer.style.display = "flex";
    logContainer.style.flexDirection = "column";
    logContainer.style.alignItems = "center";
    logContainer.style.gap = "8px";
    logContainer.style.zIndex = "999999";
    document.body.appendChild(logContainer);

    // ===== Sistema de logs =====
    function addLog(msg, color = "#3498db") {
        let log = document.createElement("div");
        log.textContent = msg;
        log.style.background = color;
        log.style.color = "white";
        log.style.padding = "8px 14px";
        log.style.borderRadius = "12px";
        log.style.boxShadow = "0 4px 12px rgba(0,0,0,0.4)";
        log.style.fontSize = "14px";
        log.style.opacity = "0";
        log.style.transform = "translateY(20px)"; // começa baixo
        log.style.transition = "opacity 0.4s ease, transform 0.4s ease";

        logContainer.appendChild(log);

        // animação de entrada (sobe)
        requestAnimationFrame(() => {
            log.style.opacity = "1";
            log.style.transform = "translateY(0)";
        });

        // animação de saída (sobe e desaparece)
        setTimeout(() => {
            log.style.opacity = "0";
            log.style.transform = "translateY(-20px)";
            setTimeout(() => log.remove(), 400);
        }, 5000);
    }

    // ===== Função para mudar página =====
    function mudarPagina() {
        let botoes = document.querySelectorAll("button.sc-lkltAP.joPNDs");
        if (botoes.length > 0) {
            let botaoDireita = botoes[botoes.length - 1];
            botaoDireita.click();
            addLog("👉 Página virada!", "#2980b9");
        } else {
            addLog("⚠ Nenhum botão encontrado!", "#e67e22");
        }
    }

    // ===== Iniciar/Parar =====
    function iniciar() {
        let sliderVal = parseInt(document.getElementById("tempoSlider").value, 10);
        let aleatorio = document.getElementById("modoAleatorio").checked;

        if (intervalo) clearInterval(intervalo);

        if (aleatorio) {
            function cicloAleatorio() {
                mudarPagina();
                let prox = Math.floor(Math.random() * (sliderVal - 1 + 1)) + 1;
                intervalo = setTimeout(cicloAleatorio, prox * 1000);
            }
            cicloAleatorio();
        } else {
            intervalo = setInterval(mudarPagina, sliderVal * 1000);
        }

        document.getElementById("status").textContent = "🟢 ON";
        document.getElementById("status").style.color = "#2ecc71";
        addLog("▶ Auto leitura INICIADA", "#27ae60"); // log com animação
    }

    function parar() {
        if (intervalo) {
            clearInterval(intervalo);
            clearTimeout(intervalo);
        }
        intervalo = null;
        document.getElementById("status").textContent = "🔴 OFF";
        document.getElementById("status").style.color = "#e74c3c";
        addLog("⏹ Auto leitura PARADA", "#c0392b"); // log com animação
    }

    // ===== Dark/Light mode =====
    function toggleMode() {
        darkMode = !darkMode;
        if (darkMode) {
            gui.style.background = "#2c3e50";
            gui.style.color = "#ecf0f1";
            addLog("🌙 Modo Escuro", "#8e44ad");
        } else {
            gui.style.background = "#ecf0f1";
            gui.style.color = "#2c3e50";
            addLog("☀ Modo Claro", "#f39c12");
        }
    }

    // ===== Eventos =====
    document.getElementById("tempoSlider").oninput = function () {
        document.getElementById("tempoVal").textContent = this.value;
    };

    document.getElementById("iniciarBtn").onclick = iniciar;
    document.getElementById("pararBtn").onclick = parar;
    document.getElementById("modoBtn").onclick = toggleMode;

    // ===== Tornar GUI arrastável =====
    gui.onmousedown = function (e) {
        let offsetX = e.clientX - gui.getBoundingClientRect().left;
        let offsetY = e.clientY - gui.getBoundingClientRect().top;

        function move(e) {
            gui.style.left = (e.clientX - offsetX) + "px";
            gui.style.top = (e.clientY - offsetY) + "px";
            gui.style.right = "auto";
        }

        function stop() {
            document.removeEventListener("mousemove", move);
            document.removeEventListener("mouseup", stop);
        }

        document.addEventListener("mousemove", move);
        document.addEventListener("mouseup", stop);
    };
})();
