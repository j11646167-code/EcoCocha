const URL = "https://teachablemachine.withgoogle.com/models/oleVTr81F/";

let model, webcam;
let ecoCoins = localStorage.getItem("ecoCoins") || 0;

document.getElementById("coins").innerText = ecoCoins;
actualizarNivel();

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
                "🚫 No se detectó ningún residuo";
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

    ecoCoins = Number(ecoCoins) + puntos;

    localStorage.setItem("ecoCoins", ecoCoins);

    document.getElementById("coins").innerText = ecoCoins;
    actualizarNivel();

    if (ecoCoins >= 100) {
        document.getElementById("insignia").innerText =
            "🏅 ¡Primeras 100 EcoCoins!";
    }

    const lista = document.getElementById("lista");

    if (tipo !== "NINGUNO") {
        lista.innerHTML +=
            `<li>${tipo} +${puntos} EcoCoins</li>`;
    }
}

function actualizarNivel() {
    let nivel = "🌱 EcoNovato";

    if (ecoCoins >= 200) nivel = "♻️ EcoExplorador";
    if (ecoCoins >= 500) nivel = "🌳 EcoProtector";
    if (ecoCoins >= 1000) nivel = "🌎 EcoGuardián";
    if (ecoCoins >= 2000) nivel = "👑 EcoLeyenda";

    document.getElementById("nivel").innerText = nivel;
}