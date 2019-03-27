const electron = require('electron');
const { ipcRenderer, remote } = electron;
const fc = require("fullcalendar");
const cacheFile = remote.getGlobal('cacheFile');
const config = remote.getGlobal('config');
window.$ = window.jQuery = require('jquery');

const modalInfoAsignatura = document.getElementById("modalInfoAsignatura");
const modalBackgroundInfoAsignatura = document.getElementById("modalBackgroundInfoAsignatura");
const modalTitulo = document.getElementById("modalTitulo");
const btnCerrarInfoAsignatura = document.getElementById("btnCerrarInfoAsignatura");
const textoSeccion = document.getElementById("textoSeccion");
const textoProfesor = document.getElementById("textoProfesor");
const textoSala = document.getElementById("textoSala");
const textoTipoEvaluacion = document.getElementById("textoTipoEvaluacion");
const textoHoras = document.getElementById("textoHoras");
const textoPorcentaje = document.getElementById("textoPorcentaje");
const btnSemana = document.getElementById("btnSemana");
const btnMes = document.getElementById("btnMes");
const btnPrevio = document.getElementById("btnPrevio");
const btnSiguiente = document.getElementById("btnSiguiente");
const btnHoy = document.getElementById("btnHoy");
const textoTitulo = document.getElementById("textoTitulo");
const btnConfig = document.getElementById("btnConfig");
const configuraciones = document.getElementById("configuraciones");
const btnActualizarHorario = document.getElementById("btnActualizarHorario");
const btnRestablecerHorario = document.getElementById("btnRestablecerHorario");
const btnAbrirCrearRecordatorio = document.getElementById("btnAbrirCrearRecordatorio");
const modalCrearRecordatorio = document.getElementById("modalCrearRecordatorio");
const btnCerrarModalRecordatorio = document.getElementById("btnCerrarModalRecordatorio");
const modalBackgroundCrearRecordatorio = document.getElementById("modalBackgroundCrearRecordatorio");
const btnAceptarRecordatorio = document.getElementById("btnAceptarRecordatorio");
const modalCrearRecordatorioTitulo = document.getElementById("modalCrearRecordatorioTitulo");

var vistaActual = "agendaWeek";
var colorActual = config.uiColor;
var eventoActual = undefined;

// Se actualizan los colores de los botones:
actualizarColorUI(undefined);

// La vista de configuración debe estar oculta al iniciar el programa.
ocultarConfiguracion();

// Inicialización del calendario.
$('#calendar').fullCalendar({
    defaultView: "agendaWeek",
    hiddenDays: [0],
    header: false,
    allDaySlot: false,
    monthNames: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio',
        'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
    monthNamesShort: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
        'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
    buttonText: {
        today: 'Hoy',
        month: 'Mes',
        week: 'Semana',
        day: 'Día',
        list: 'Lista'
    },
    dayNames: ['Domingo', 'Lunes', 'Martes', 'Miercoles',
        'Jueves', 'Viernes', 'Sabado'],
    dayNamesShort: ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'],
    allDayText: "Todo el día",
    minTime: "08:00:00",
    maxTime: "24:00:00",
    themeSystem: "jquery-ui",
    viewRender: function (view) {
        textoTitulo.innerHTML = view.title;
    },
    events: cacheFile.events
});


var calendario = $('#calendar').fullCalendar('getCalendar');

calendario.on('eventClick', function (evento, jsEvent, view) {
    eventoActual = evento.data;
    mostrarInfoAsignatura();
    let clase = evento.data;
    modalCrearRecordatorioTitulo.innerHTML = "Recordatorio para: " + clase.asignatura;
    modalTitulo.innerHTML = clase.asignatura;
    textoSala.innerHTML = "<strong>Sala: </strong>" + clase.sala;
    textoHoras.innerHTML = "<strong>Horario: </strong> De " + clase.hora_inicio + " a " + clase.hora_termino;
    textoProfesor.innerHTML = "<strong>Profe: </strong>" + clase.profesor;
    textoSeccion.innerHTML = "<strong>Sección: </strong>" + clase.seccion;
    switch (clase.tipo) {
        case 3:
            textoTipoEvaluacion.innerHTML = "<strong>Tienes: </strong> <strong>" +
                " Salida a terreno</strong>.";
            break;
        case 5:
            textoTipoEvaluacion.innerHTML = "<strong>Tienes: </strong> <strong>" +
                clase.tipo_evaluacion +
                "</strong> y vale un <strong>" +
                clase.porcentaje +
                "%</strong>. ¡Recuerda estudiar!";
            break;


        default:
            textoTipoEvaluacion.innerHTML = "";
            break;
    }

});


btnAceptarRecordatorio.onclick = () => {
    cerrarCrearRecordatorio();
    ipcRenderer.send("crearRecordatorio", {
        evento: eventoActual,
        texto: areaTextoRecordatorio.value
    });
};



btnAbrirCrearRecordatorio.onclick = () => {
    cerrarInfoAsignatura();
    mostrarCrearRecordatorio();
};

btnCerrarModalRecordatorio.onclick = () => {
    cerrarCrearRecordatorio();
}// TODO

modalBackgroundCrearRecordatorio.onclick = () => {
    cerrarCrearRecordatorio();
}

btnMes.onclick = () => {
    $('#calendar').fullCalendar('changeView', 'month');
    reiniciarBotones();
    botonActivado(btnMes);
    ocultarConfiguracion();
    mostrarCalendario();
    vistaActual = "month";
};

btnSemana.onclick = () => {
    $('#calendar').fullCalendar('changeView', 'agendaWeek');
    reiniciarBotones();
    botonActivado(btnSemana);
    ocultarConfiguracion();
    mostrarCalendario();
    vistaActual = "agendaWeek";
};

btnSiguiente.onclick = () => {
    $("#calendar").fullCalendar("next");
    mostrarCalendario();
    ocultarConfiguracion();
    reiniciarBotones();
    if (vistaActual == "agendaWeek") {
        botonActivado(btnSemana);
    } else {
        botonActivado(btnMes);
    }
};

btnActualizarHorario.onclick = function () {
    ipcRenderer.send("actualizarHorario");
}

btnConfig.onclick = () => {
    reiniciarBotones();
    botonActivado(btnConfig);
    ocultarCalendario();
    mostrarConfiguracion();
};

btnPrevio.onclick = () => {
    $("#calendar").fullCalendar("prev");
    mostrarCalendario();
    ocultarConfiguracion();
    reiniciarBotones();
    if (vistaActual == "agendaWeek") {
        botonActivado(btnSemana);
    } else {
        botonActivado(btnMes);
    }
};

btnHoy.onclick = () => {
    $("#calendar").fullCalendar("today");
    ocultarConfiguracion();
    mostrarCalendario();
    reiniciarBotones();
    if (vistaActual == "agendaWeek") {
        botonActivado(btnSemana);
    } else {
        botonActivado(btnMes);
    }
    Notification.requestPermission().then(function (result){
        console.log(result);
        
        new Notification("electron not", {
            body : " kjfashdlkfhadslkgfsaldkj",
            
        })
    });

};

modalBackgroundInfoAsignatura.onclick = () => {
    cerrarInfoAsignatura();
};

btnCerrarInfoAsignatura.onclick = () => {
    cerrarInfoAsignatura();
};

function mostrarInfoAsignatura() {

    modalInfoAsignatura.classList.add("is-active");
    //$(modalInfoAsignatura).fadeIn("slow");
};

function cerrarInfoAsignatura() {
    //$(modalInfoAsignatura).fadeOut("slow");
    modalInfoAsignatura.classList.remove("is-active");
};

function mostrarCrearRecordatorio() {
    modalCrearRecordatorio.classList.add("is-active");
}

function cerrarCrearRecordatorio() {
    modalCrearRecordatorio.classList.remove("is-active");
}

function ocultarCalendario() {
    $('#calendar').hide();
};

function mostrarCalendario() {
    $('#calendar').show();
};

function mostrarConfiguracion() {
    $(configuraciones).show();
};

function ocultarConfiguracion() {
    $("#configuraciones").hide();
};

// Reinicia el estado de los botones para que ninguno quede seleccionado
function reiniciarBotones() {
    btnConfig.classList.add("is-outlined");
    btnMes.classList.add("is-outlined");
    btnSemana.classList.add("is-outlined");

};

// Hace que el botón que le pasemos por parámetro se transforme en un boton activo
function botonActivado(elemento) {
    elemento.classList.remove("is-outlined");
};

// Asignación de los colores a los botones:
function actualizarColorUI(color) {
    if (!color) {
        color = config.uiColor;
    }
    btnConfig.classList.remove(colorActual);
    btnSemana.classList.remove(colorActual);
    btnMes.classList.remove(colorActual);
    btnHoy.classList.remove(colorActual);
    btnPrevio.classList.remove(colorActual);
    btnSiguiente.classList.remove(colorActual);
    btnActualizarHorario.classList.remove(colorActual);
    btnRestablecerHorario.classList.remove(colorActual);

    btnConfig.classList.add(color);
    btnSemana.classList.add(color);
    btnMes.classList.add(color);
    btnHoy.classList.add(color);
    btnPrevio.classList.add(color);
    btnSiguiente.classList.add(color);
    btnActualizarHorario.classList.add(color);
    btnRestablecerHorario.classList.add(color);

    colorActual = color;


}