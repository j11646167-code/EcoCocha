const URL = "https://teachablemachine.withgoogle.com/models/oleVTr81F/";

let model, webcam;

let ecoCoins = Number(localStorage.getItem("ecoCoins")) || 0;
let totalResiduos = Number(localStorage.getItem("totalResiduos")) || 0;
let racha = Number(localStorage.getItem("racha")) || 0;
let ultimaFecha = localStorage.getItem("ultimaFecha") || "";
let hoyCount = Number(localStorage.getItem("hoyCount")) || 0;
let nivelAnterior = "";

const BADGES = [
    { id: "b100", icono: "🏅", umbral: 100, nombre: "Primeras 100 EcoCoins" },
    { id: "b500", icono: "🥈", umbral: 500, nombre: "500 EcoCoins" },
    { id: "b1000", icono: "🥇", umbral: 1000, nombre: "1000 EcoCoins" },
    { id: "b2000", icono: "👑", umbral: 2000, nombre: "Leyenda EcoCocha" },
    { id: "racha7", icono: "🔥", umbral: 0, nombre: "Racha de 7 días", esRacha: true }
];

window.onload = () => {
    document.getElementById("coins").innerText = ecoCoins;
    actualizarNivel();
    actualizarBarra();
    actualizarMascota();
    actualizarImpacto();
    revisarHoy();
    renderInsignias();
};

async function init() {
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";

    model = await tmImage.load(modelURL, metadataURL);

    const flip = true;
    webcam = new tmImage.Webcam(300, 300, flip);

    await webcam.setup();
    await webcam.play();

    window.requestAnimationFrame(loop);

    document.getElementById("webcam-container").innerHTML = "";
    document.getElementById("webcam-container").appendChild(webcam.canvas);
}

async function loop() {
    webcam.update();
    await predict();
    window.requestAnimationFrame(loop);
}

let ultimoResiduo = "";

async function predict() {
    const prediction = await model.predict(webcam.canvas);

    let mayor = prediction[0];
    for (let i = 1; i < prediction.length; i++) {
        if (prediction[i].probability > mayor.probability) {
            mayor = prediction[i];
        }
    }

    if (mayor.probability > 0.90) {

        if (mayor.className === "NINGUNO") {
            document.getElementById("label-container").innerHTML =
                "🚫 No se detectó un residuo reciclable";
        } else {
            document.getElementById("label-container").innerHTML =
                "♻️ " + mayor.className;
        }

        if (ultimoResiduo !== mayor.className) {
            agregarPuntos(mayor.className);
            ultimoResiduo = mayor.className;
        }
    }
}

function agregarPuntos(tipo) {

    let puntos = 0;
    if (tipo === "PLÁSTICOS") puntos = 100;
    if (tipo === "METALES Y VIDRIO") puntos = 70;
    if (tipo === "PAPELES Y CARTONES") puntos = 50;
    if (tipo === "ORGANICOS") puntos = 30;
    if (tipo === "NINGUNO") puntos = 0;

    if (tipo !== "NINGUNO") {
        sonidoDeteccion();
        totalResiduos++;
        hoyCount++;
        localStorage.setItem("totalResiduos", totalResiduos);
        localStorage.setItem("hoyCount", hoyCount);
        registrarRacha();
        actualizarImpacto();
        document.getElementById("hoyCount").innerText = hoyCount;

        const lista = document.getElementById("lista");
        lista.innerHTML += `<li>${tipo} +${puntos} EcoCoins</li>`;
    }

    ecoCoins += puntos;
    localStorage.setItem("ecoCoins", ecoCoins);
    document.getElementById("coins").innerText = ecoCoins;

    actualizarNivel();
    actualizarBarra();
    renderInsignias();
}

function actualizarNivel() {
    let nivel = "🌱 EcoNovato";
    if (ecoCoins >= 200) nivel = "♻️ EcoExplorador";
    if (ecoCoins >= 500) nivel = "🌳 EcoProtector";
    if (ecoCoins >= 1000) nivel = "🌎 EcoGuardián";
    if (ecoCoins >= 2000) nivel = "👑 EcoLeyenda";

    document.getElementById("nivel").innerText = nivel;

    if (nivelAnterior && nivel !== nivelAnterior) {
        lanzarConfeti();
    }
    nivelAnterior = nivel;
}

function actualizarBarra() {
    const escalones = [0, 200, 500, 1000, 2000, 999999];
    let actual = 0;
    for (let i = 0; i < escalones.length - 1; i++) {
        if (ecoCoins >= escalones[i] && ecoCoins < escalones[i+1]) {
            actual = i;
            break;
        }
    }
    const base = escalones[actual];
    const siguiente = escalones[actual + 1];
    const progreso = siguiente === 999999 ? 100 :
        Math.min(100, ((ecoCoins - base) / (siguiente - base)) * 100);

    document.getElementById("barraFill").style.width = progreso + "%";
    document.getElementById("barraTexto").innerText =
        siguiente === 999999
            ? `${ecoCoins} EcoCoins · ¡nivel máximo!`
            : `${ecoCoins} / ${siguiente} hacia el siguiente nivel`;
}

function registrarRacha() {
    const hoy = new Date().toDateString();

    if (ultimaFecha === hoy) return; // ya contado hoy

    const ayer = new Date();
    ayer.setDate(ayer.getDate() - 1);

    if (ultimaFecha === ayer.toDateString()) {
        racha++;
    } else {
        racha = 1;
        hoyCount = 1;
        localStorage.setItem("hoyCount", hoyCount);
    }

    ultimaFecha = hoy;
    localStorage.setItem("racha", racha);
    localStorage.setItem("ultimaFecha", ultimaFecha);

    document.getElementById("racha").innerText = racha;
    actualizarMascota();
}

function revisarHoy() {
    const hoy = new Date().toDateString();
    if (ultimaFecha !== hoy) {
        hoyCount = 0;
        localStorage.setItem("hoyCount", 0);
    }
    document.getElementById("racha").innerText = racha;
    document.getElementById("hoyCount").innerText = hoyCount;
}

function actualizarMascota() {
    let emoji = "🌱";
    let estado = "Brote";

    if (racha >= 14) { emoji = "🌲"; estado = "Árbol pleno"; }
    else if (racha >= 7) { emoji = "🌳"; estado = "Árbol joven"; }
    else if (racha >= 3) { emoji = "🌿"; estado = "Planta creciendo"; }

    document.getElementById("mascota").innerText = emoji;
    document.getElementById("estadoArbol").innerText = estado;
}

function actualizarImpacto() {
    const kg = (totalResiduos * 0.15).toFixed(1);
    document.getElementById("impactoKg").innerText = kg;
}

function renderInsignias() {
    const grid = document.getElementById("insigniasGrid");
    grid.innerHTML = "";

    BADGES.forEach(b => {
        const lograda = b.esRacha ? racha >= 7 : ecoCoins >= b.umbral;
        const div = document.createElement("div");
        div.className = "insignia-item" + (lograda ? " lograda" : "");
        div.title = b.nombre;
        div.innerText = b.icono;
        grid.appendChild(div);
    });
}

function sonidoDeteccion() {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.value = 880;
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.15);
    } catch (e) {}
}

function lanzarConfeti() {
    const cont = document.getElementById("confetti-container");
    const emojis = ["🎉", "♻️", "🌿", "✨"];
    for (let i = 0; i < 24; i++) {
        const span = document.createElement("span");
        span.className = "confeti-pieza";
        span.innerText = emojis[Math.floor(Math.random() * emojis.length)];
        span.style.left = Math.random() * 100 + "vw";
        span.style.animationDelay = (Math.random() * 0.5) + "s";
        cont.appendChild(span);
        setTimeout(() => span.remove(), 2200);
    }
}

function compartir() {
    const texto = `🌎 ¡Llevo ${ecoCoins} EcoCoins reciclando con EcoCocha! 🔥 Racha de ${racha} días. ♻️`;
    window.open(`https://wa.me/?text=${encodeURIComponent(texto)}`, "_blank");
}

function abrirModal() {
    document.getElementById("modalInfo").classList.add("activo");
}

function cerrarModal() {
    document.getElementById("modalInfo").classList.remove("activo");
}

function reiniciarProgreso() {
    if (confirm("¿Seguro que quieres reiniciar todo tu progreso?")) {
        ["ecoCoins", "totalResiduos", "racha", "ultimaFecha", "hoyCount"].forEach(k => localStorage.removeItem(k));
        ecoCoins = 0;
        totalResiduos = 0;
        racha = 0;
        ultimaFecha = "";
        hoyCount = 0;

        document.getElementById("coins").innerText = 0;
        document.getElementById("lista").innerHTML = "";
        document.getElementById("racha").innerText = 0;
        document.getElementById("hoyCount").innerText = 0;

        actualizarNivel();
        actualizarBarra();
        actualizarMascota();
        actualizarImpacto();
        renderInsignias();
    }
}