const PUNTOS_POR_MATERIAL = {
    "Plásticos": 10,
    "Papel y Cartón": 6,
    "Vidrio y Metal": 14,
    "Residuos Orgánicos": 3,
    "Ninguno": 0
};

let pin = localStorage.getItem("pinEcoCocha") || "";
let ecoCoins = Number(localStorage.getItem("ecoCoins")) || 0;
let historial = JSON.parse(localStorage.getItem("historial")) || [];

function guardarPin() {
    const valor = document.getElementById("pinInput").value.trim();
    if (valor.length < 4) {
        alert("Escribe un código de al menos 4 dígitos");
        return;
    }
    pin = valor;
    localStorage.setItem("pinEcoCocha", pin);
    document.getElementById("pinEstado").innerText = "✅ Conectado: " + pin;
    escucharFirebase();
}

function actualizarInterfaz() {
    if (document.getElementById("coins")) {
        document.getElementById("coins").innerText = ecoCoins;
    }

    if (document.getElementById("lista")) {
        const listaHTML = document.getElementById("lista");
        listaHTML.innerHTML = "";
        historial.forEach(item => {
            listaHTML.innerHTML += `<li>${item}</li>`;
        });
    }

    const planta = document.getElementById("planta");
    const nivel = document.getElementById("nivel");

    if (planta && nivel) {
        if (ecoCoins >= 300) {
            planta.src = "arbol-adulto.png";
            nivel.innerText = "🌳 EcoLeyenda";
        } else if (ecoCoins >= 100) {
            planta.src = "arbol-adolescente.png";
            nivel.innerText = "🌿 EcoExplorador";
        } else {
            planta.src = "arbol-bebe.png";
            nivel.innerText = "🌱 EcoNovato";
        }
    }
}

function escucharFirebase() {
    if (typeof db === "undefined" || !pin) return;

    db.ref("usuarios/" + pin + "/detecciones").on("child_added", (snapshot) => {
        const nuevaDeteccion = snapshot.val();
        const registroUnico = `${nuevaDeteccion.fecha} - ${nuevaDeteccion.material}`;

        if (!historial.includes(registroUnico)) {
            const puntosGanados = PUNTOS_POR_MATERIAL[nuevaDeteccion.material] || 0;

            if (puntosGanados > 0) {
                ecoCoins += puntosGanados;
                historial.unshift(registroUnico);

                localStorage.setItem("ecoCoins", ecoCoins);
                localStorage.setItem("historial", JSON.stringify(historial));

                actualizarInterfaz();
            }
        }
    });
}

window.onload = () => {
    actualizarInterfaz();

    if (pin) {
        if (document.getElementById("pinInput")) {
            document.getElementById("pinInput").value = pin;
            document.getElementById("pinEstado").innerText = "✅ Conectado: " + pin;
        }
        escucharFirebase();
    }
};