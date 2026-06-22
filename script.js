const URL = "https://teachablemachine.withgoogle.com/models/oleVTr81F/";

let model;
let webcam;
let ultimo = "";

async function init() {

    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";

    model = await tmImage.load(modelURL, metadataURL);
    console.log("Modelo cargado");
    console.log (model.getClassLabels());

    const flip = true;

    webcam = new tmImage.Webcam(300, 300, flip);

    await webcam.setup();
    await webcam.play();
    console.log("Cámara iniciada");

    window.requestAnimationFrame(loop);

    document.getElementById("webcam-container").appendChild(webcam.canvas);
}

async function loop() {
    webcam.update();
    await predict();
    window.requestAnimationFrame(loop);
}

async function predict() {
console.log ("Detectando...");
    const prediction = await model.predict(webcam.canvas);

    let mayor = prediction[0];
    console.log(prediction);

    for (let i = 1; i < prediction.length; i++) {
        if (prediction[i].probability > mayor.probability) {
            mayor = prediction[i];
        }
    }

    if (mayor.probability > 0.60 && ultimo !== mayor.className) {

        ultimo = mayor.className;

        let mensaje = "";

        if (mayor.className === "Plásticos") {
            mensaje = "♻️ Plástico detectado";
        }

        else if (mayor.className === "Papel y Cartón") {
            mensaje = "📄 Papel y cartón detectados";
        }

        else if (mayor.className === "Vidrio y Metal") {
            mensaje = "🍾 Vidrio y metal detectados";
        }

        else if (mayor.className === "Residuos Orgánicos") {
            mensaje = "🍃 Residuo orgánico detectado";
        }

        else if (mayor.className === "Ninguno") {
            mensaje = "❌ no se detectó ningún residuo";
        }

        document.getElementById("label-container").innerHTML = mensaje;
        if (typeof db !== "undefined") {
    db.ref("detecciones").push({
        material: mayor.className,
        fecha: new Date().toLocaleString()
    });
}

        if (typeof db !== "undefined") {
            db.ref("detecciones").push({
                material: mayor.className,
                fecha: new Date().toLocaleString()
            });
        }
    }
}
window.onload = function () {
    init();
} 
 