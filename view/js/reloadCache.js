const electron = require('electron');
const { ipcRenderer } = electron;
const bulmaAccordion = require("bulma-accordion");

const sesiInput = document.getElementById("sesiInput");
const sesiAviso = document.getElementById("sesiAviso");
const modalInicio = document.getElementById("modalInicio");
const btnContinuar = document.getElementById("btnContinuarModal");
const btnCerrarModal = document.getElementById("btnCerrarModal");
const btnAceptarSesi = document.getElementById("btnAceptarSesi");
const modalDescargaExitosa = document.getElementById("modalDescargaExitosa");
const btnContinuarModalDescarga = document.getElementById("btnContinuarModalDescarga");
const sesiInputControl = document.getElementById("sesiInputControl");

// Cargar el acordeón:
bulmaAccordion.attach();

btnContinuar.onclick = function () {
    ocultarModalInicio();
};

btnCerrarModal.onclick = function () {
    ocultarModalInicio();
};

btnAceptarSesi.onclick = () => {
    procesarCodigoSesion();
}

btnContinuarModalDescarga.onclick = () => {
    ipcRenderer.send("usuario continuar");
};


function ocultarModalInicio() {
    modalInicio.style.display = "none";
};

function mostrarModalDescarga() {
    modalDescargaExitosa.classList.add("is-active");
};


sesiAviso.style.display = "none";

sesiInput.onkeyup = function (e) {

    if (e.key == "Enter") {
        procesarCodigoSesion();
    }
};

// Esta función le avisa al proceso principal que hay que conectarse
// a INACAP.
function procesarCodigoSesion() {
    // Hay que detectar un patrón mejor para saber si es que el 
    // código ingresado es válido
    if (sesiInput.value.length > 30) {
        resetClasesSesiInput();
        resetClasesSesiAviso();
        sesiInput.classList.add("is-info");
        sesiInputControl.classList.add("is-loading");
        sesiAviso.classList.add("is-info");
        sesiAviso.innerText = "Procesando..";
        ipcRenderer.send("verificar sesi_ccod", sesiInput.value);

    } else {
        resetClasesSesiInput();
        resetClasesSesiAviso();
        sesiInput.classList.add("is-danger");
        sesiAviso.style.display = "block";
        sesiAviso.classList.add("is-danger");
        sesiAviso.innerText = "¡Ingresa un sesi_ccod válido!";
    }


}

ipcRenderer.on("sesi_ccod falso", (e, data) => {
    resetClasesSesiInput();
    resetClasesSesiAviso();
    sesiInputControl.classList.remove("is-loading");
    sesiInput.classList.add("is-danger");
    sesiAviso.style.display = "block";
    sesiAviso.classList.add("is-danger");
    sesiAviso.innerText = data;
});

ipcRenderer.on("sesi_ccod conectando", (e, data) => {
    resetClasesSesiInput();
    resetClasesSesiAviso();
    sesiInput.classList.add("is-info");
    sesiAviso.style.display = "block";
    sesiAviso.classList.add("is-info");
    sesiAviso.innerText = "Conectando con inacap..";
});

ipcRenderer.on("sesi_ccod recibiendo", (e, data) => {
    resetClasesSesiInput();
    resetClasesSesiAviso();
    sesiInput.classList.add("is-info");
    sesiAviso.style.display = "block";
    sesiAviso.classList.add("is-info");
    sesiAviso.innerText = "Recibiendo datos del horario..";
});

ipcRenderer.on("sesi_ccod procesando", (e, data) => {
    resetClasesSesiInput();
    resetClasesSesiAviso();
    sesiInput.classList.add("is-info");
    sesiAviso.style.display = "block";
    sesiAviso.classList.add("is-info");
    sesiAviso.innerText = "Procesando los datos recibidos...";
});

ipcRenderer.on("sesi_ccod error", (e, data) => {
    resetClasesSesiInput();
    resetClasesSesiAviso();
    sesiInputControl.classList.remove("is-loading");
    sesiInput.classList.add("is-danger");
    sesiAviso.style.display = "block";
    sesiAviso.classList.add("is-info");
    sesiAviso.innerText = data;
});

ipcRenderer.on("sesi_ccod ok", (e, data) => {
    mostrarModalDescarga();
});

/**
 * Reinicia las clases del elemento sesiAviso.
 */
function resetClasesSesiAviso() {
    sesiAviso.classList.remove("is-warning");
    sesiAviso.classList.remove("is-info");
    sesiAviso.classList.remove("is-success");
    sesiAviso.classList.remove("is-danger");

}

/**
 * Reinicia las clases del elemento sesiInput
 */
function resetClasesSesiInput() {
    sesiInput.classList.remove("is-warning");
    sesiInput.classList.remove("is-info");
    sesiInput.classList.remove("is-success");
    sesiInput.classList.remove("is-danger");

}