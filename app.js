// Puntos asignados automáticamente por cada material detectado
const PUNTOS_POR_MATERIAL = {
    "Plásticos": 50,
    "Papel y Cartón": 30,
    "Vidrio y Metal": 40,
    "Residuos Orgánicos": 20,
    "Ninguno": 0
};

// Cargar estado inicial desde el almacenamiento local
let ecoCoins = Number(localStorage.getItem("ecoCoins")) || 0;
let historial = JSON.parse(localStorage.getItem("historial")) || [];

// Función única para refrescar visualmente la pantalla
function actualizarInterfaz() {
    if (document.getElementById("coins")) {
        document.getElementById("coins").innerText = ecoCoins;
    }

    if (document.getElementById("lista")) {
        const listaHTML = document.getElementById("lista");
        listaHTML.innerHTML = ""; // Limpia la lista antes de redibujar
        historial.forEach(item => {
            listaHTML.innerHTML += `<li>${item}</li>`;
        });
    }

    const planta = document.getElementById("planta");
    const nivel = document.getElementById("nivel");

    if (planta && nivel) {
        if (ecoCoins >= 700) {
            planta.src = "arbol-adulto.png";
            nivel.innerText = "🌳 EcoLeyenda";
        } else if (ecoCoins >= 300) {
            planta.src = "arbol-adolescente.png";
            nivel.innerText = "🌿 EcoExplorador";
        } else {
            planta.src = "arbol-bebe.png";
            nivel.innerText = "🌱 EcoNovato";
        }
    }
}

// Dibujar la interfaz por primera vez al abrir el archivo
actualizarInterfaz();

// Escuchar Firebase en tiempo real para capturar detecciones de la cámara
if (typeof db !== "undefined") {
    db.ref("detecciones").on("child_added", (snapshot) => {
        const nuevaDeteccion = snapshot.val();
        const registroUnico = `${nuevaDeteccion.fecha} - ${nuevaDeteccion.material}`;

        // Evita duplicar registros que ya procesamos localmente
        if (!historial.includes(registroUnico)) {
            const puntosGanados = PUNTOS_POR_MATERIAL[nuevaDeteccion.material] || 0;

            if (puntosGanados > 0) {
                ecoCoins += puntosGanados;
                historial.unshift(registroUnico); // Agrega lo más nuevo arriba

                // Guardar permanentemente en el navegador
                localStorage.setItem("ecoCoins", ecoCoins);
                localStorage.setItem("historial", JSON.stringify(historial));

                // Actualizar lo que ve el usuario en pantalla
                actualizarInterfaz();
            }
        }
    });
}