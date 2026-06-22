const URL = "https://teachablemachine.withgoogle.com/models/oleVTr81F/";

let model;
let webcam;
let ultimo = "";
let pin = localStorage.getItem("pinEcoCocha") || "";

window.onload = () => {
    if (pin) {
        document.getElementById("pinInput").value = pin;
        document.getElementById("pinEstado").innerText = "✅ Conectado: " + pin;
    }
};

function guardarPin() {
    const valor = document.getElementById("pinInput").value.trim();
    if (valor.length < 4) {
        alert("Escribe un código de al menos 4 dígitos");
        return;
    }
    pin = valor;
    localStorage.setItem("pinEcoCocha", pin);
    document.getElementById("pinEstado").innerText = "✅ Conectado: " + pin;
    init();
}

async function init() {
    try {
        document.getElementById("label-container").innerHTML =
            "Cargando modelo...";

        const modelURL = URL + "model.json";
        const metadataURL = URL + "metadata.json";

        model = await tmImage.load(modelURL, metadataURL);

        document.getElementById("label-container").innerHTML =
            "Abriendo cámara...";

        const flip = true;
        webcam = new tmImage.Webcam(300, 300, flip);

        await webcam.setup();
        await webcam.play();

        document.getElementById("webcam-container").innerHTML = "";
        document.getElementById("webcam-container")
            .appendChild(webcam.canvas);

        document.getElementById("label-container").innerHTML =
            "Esperando detección...";

        window.requestAnimationFrame(loop);
    } catch (error) {
        console.error(error);
        document.getElementById("label-container").innerHTML =
            "❌ Error al cargar el modelo o la cámara";
    }
}

async function loop() {
    webcam.update();
    await predict();
    window.requestAnimationFrame(loop);
}

async function predict() {
    const prediction = await model.predict(webcam.canvas);

    let mayor = prediction[0];

    for (let i = 1; i < prediction.length; i++) {
        if (prediction[i].probability > mayor.probability) {
            mayor = prediction[i];
        }
    }

    if (mayor.probability > 0.50 && ultimo !== mayor.className) {

        ultimo = mayor.className;

        let mensaje = "";

        if (mayor.className === "Plásticos") mensaje = "♻️ Plástico detectado";
        else if (mayor.className === "Papel y Cartón") mensaje = "📄 Papel y cartón detectados";
        else if (mayor.className === "Vidrio y Metal") mensaje = "🍾 Vidrio y metal detectados";
        else if (mayor.className === "Residuos Orgánicos") mensaje = "🍃 Residuo orgánico detectado";
        else if (mayor.className === "Ninguno") mensaje = "❌ Objeto no reciclable";
        else mensaje = mayor.className;

        document.getElementById("label-container").innerHTML = mensaje;

        if (typeof db !== "undefined" && pin) {
            db.ref("usuarios/" + pin + "/detecciones").push({
                material: mayor.className,
                fecha: new Date().toLocaleString()
            });
        }
    }
}