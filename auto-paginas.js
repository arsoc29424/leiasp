(function () {
    // ===== Criar GUI =====
    let gui = document.createElement("div");
    gui.style.position = "fixed";
    gui.style.top = "20px";
    gui.style.right = "20px";
    gui.style.padding = "15px";
    gui.style.background = "linear-gradient(135deg, #2c3e50, #34495e)";
    gui.style.color = "#ecf0f1";
    gui.style.fontFamily = "Arial, sans-serif";
    gui.style.borderRadius = "15px";
    gui.style.boxShadow = "0 6px 18px rgba(0,0,0,0.5)";
    gui.style.zIndex = "999999";
    gui.style.width = "200px";
    gui.style.textAlign = "center";

    gui.innerHTML = `
        <h3 style="margin:0 0 10px 0; font-size:16px;">📖 Lean Leia Sp</h3>
        <label style="font-size:14px;">⏱ Tempo (s):</label>
        <input type="number" id="tempoInput" value="5" min="1" style="width:60px; margin:5px; border-radius:8px; border:none; padding:4px; text-align:center;">
        <br>
        <button id="iniciarBtn" style="margin-top:8px; padding:6px 12px; border:none; border-radius:8px; background:#27ae60; color:white; cursor:pointer; font-weight:bold;">▶ Iniciar</button>
        <button id="pararBtn" style="margin-top:5px; padding:6px 12px; border:none; border-radius:8px; background:#c0392b; color:white; cursor:pointer; font-weight:bold;">⏹ Parar</button>
    `;
    document.body.appendChild(gui);

    // ===== Criar container de logs =====
    let logContainer = document.createElement("div");
    logContainer.style.position = "fixed";
    logContainer.style.bottom = "20px";
    logContainer.style.left = "50%";
    logContainer.style.transform = "translateX(-50%)";
    logContainer.style.display = "flex";
    logContainer.style.flexDirection = "column-reverse"; // o mais novo vai pra baixo
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
        log.style.transition = "opacity 0.3s ease";

        logContainer.appendChild(log);
        requestAnimationFrame(() => (log.style.opacity = "1"));

        setTimeout(() => {
            log.style.opacity = "0";
            setTimeout(() => log.remove(), 300);
        }, 5000);
    }

    let intervalo = null;

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

    // ===== Botões da GUI =====
    document.getElementById("iniciarBtn").onclick = function () {
        let tempo = parseInt(document.getElementById("tempoInput").value, 10) * 1000;
        if (intervalo) clearInterval(intervalo);
        intervalo = setInterval(mudarPagina, tempo);
        addLog("▶ Auto leitura INICIADA", "#27ae60");
    };

    document.getElementById("pararBtn").onclick = function () {
        if (intervalo) clearInterval(intervalo);
        intervalo = null;
        addLog("⏹ Auto leitura PARADA", "#c0392b");
    };
})();
