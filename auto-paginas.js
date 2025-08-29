(function() {
    // Criar container da interface
    let gui = document.createElement("div");
    gui.style.position = "fixed";
    gui.style.bottom = "20px";
    gui.style.right = "20px";
    gui.style.padding = "15px";
    gui.style.background = "rgba(0,0,0,0.85)";
    gui.style.color = "#fff";
    gui.style.fontFamily = "Arial, sans-serif";
    gui.style.borderRadius = "12px";
    gui.style.boxShadow = "0 4px 12px rgba(0,0,0,0.4)";
    gui.style.zIndex = "999999";

    gui.innerHTML = `
        <h3 style="margin:0 0 10px 0; font-size:16px; text-align:center;">📖 Lean Leia Sp</h3>
        <label style="font-size:14px;">⏱ Tempo (segundos):</label>
        <input type="number" id="tempoInput" value="5" min="1" style="width:60px; margin:5px;">
        <br>
        <button id="iniciarBtn" style="margin-top:5px; padding:5px 10px; border:none; border-radius:6px; background:#4CAF50; color:white; cursor:pointer;">▶ Iniciar</button>
        <button id="pararBtn" style="margin-top:5px; padding:5px 10px; border:none; border-radius:6px; background:#f44336; color:white; cursor:pointer;">⏹ Parar</button>
    `;

    document.body.appendChild(gui);

    let intervalo = null;

    // Função para mudar página -> sempre clicar no botão da direita
    function mudarPagina() {
        let botoes = document.querySelectorAll("button.sc-lkltAP.joPNDs");
        if (botoes.length > 0) {
            let botaoDireita = botoes[botoes.length - 1]; // pega o último (direita)
            botaoDireita.click();
            console.log("👉 Cliquei no botão da direita");
        } else {
            console.log("⚠ Nenhum botão encontrado!");
        }
    }

    document.getElementById("iniciarBtn").onclick = function() {
        let tempo = parseInt(document.getElementById("tempoInput").value, 10) * 1000;
        if (intervalo) clearInterval(intervalo);
        intervalo = setInterval(mudarPagina, tempo);
        console.log("▶ Auto leitura iniciada a cada " + tempo/1000 + "s");
    };

    document.getElementById("pararBtn").onclick = function() {
        if (intervalo) clearInterval(intervalo);
        intervalo = null;
        console.log("⏹ Auto leitura parada");
    };
})();
