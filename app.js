const electron = require('electron');
const url = require('url');
const path = require('path');
const https = require('https');
const fs = require('fs');
const jm = require("./jsonManager");
const configFileName = "config.json";
const { app, BrowserWindow, Menu, MenuItem, ipcMain, Tray, nativeImage } = electron;

let mainWindow;

var ventanas = {};
ventanas.agenda = {
    titulo: "El Pulento Horario Inacap",
    archivo: "schedule.html"
};
ventanas.recargarHorario = {
    titulo: "Descargar horario - EPHI-GUI",
    archivo: "reloadCache.html"
};

let config = jm.readFile(configFileName);
if (config instanceof Error) {
    console.log("Archivo de configuración no encontrado, generando..");
    config = {
        "urlHorario": "https://siga3.inacap.cl/Inacap.Siga.Horarios/Horario.aspx/getHTMLAsignaturasVirtuales?SESI_CCOD=",
        "archivoHorario": "cache.json",
        "archivoCalendario": "calendario.json",
        "uiColor": "is-primary",
        "colorClasesNormales": "is-primary",
        "colorEvaluaciones": "is-danger",
        "colorTextoClasesEvaluacion": "blanco",
        "colorTextoClasesNormales": "blanco",
        colores: {
            "is-primary": "#00d1b1",
            "is-danger": "#ff2245",
            "is-info": "#209bee",
            "is-success": "#23d160",
            "is-warning": "#fedd56",
            "is-white": "#ffffff",
            "negro": "#000000",
            "blanco": "#ffffff"
        }

    };
    jm.createFile(config, configFileName);
}
global.config = config;

let cacheFile = jm.readFile(config.archivoHorario);
if (cacheFile instanceof Error) {
    console.log("Archivo de caché no encontrado..");
    cacheFile = false;
} else {
    global.cacheFile = cacheFile;
}

let calendarFile = jm.readFile(config.archivoCalendario);

app.on("ready", () => {
    mainWindow = new BrowserWindow({
        "backgroundColor": "#111111",
        "width": 1000,
        "height": 600,
        "show": false,
        "resizable": true,
        "frame": true,
        "autoHideMenuBar": false,
        "minWidth": 668,
        "minHeight": 400,
        "webPreferences": {
            "devTools": true
        }
    });

    // Si hay un archivo de caché
    if (cacheFile) {
        mostrarEnVentana(ventanas.agenda);
    } else {
        // Si el archivo de cache no se encontró, al usuario se le solicita su SESI_COD
        mostrarEnVentana(ventanas.recargarHorario);
    }
    //mainWindow.toggleDevTools();
});

// Recibe la petición para verificar si el sesi_ccod recibido es válido
ipcMain.on("verificar sesi_ccod", (e, datos) => {
    if (datos.includes(" ") || datos.includes("=")) {
        mainWindow.webContents.send("sesi_ccod falso", "No has pegado el sesi_ccod bien.");
        return;
    }

    mainWindow.webContents.send("sesi_ccod conectando");

    console.log("Enviando petición:");
    try {
        // Intentamos enviar la petición https
        https.get({
            method: "POST",
            host: "siga3.inacap.cl",
            port: 443,
            path: '/Inacap.Siga.Horarios/Horario.aspx/getHTMLAsignaturasVirtuales?SESI_CCOD=' + datos,
            dataType: "json"
        },
            (resp) => {
                let data = "";
                resp.on("data", (chunk) => {
                    data += chunk;
                    mainWindow.webContents.send("sesi_ccod recibiendo");
                });

                resp.on("end", () => {
                    //console.log(data);
                    mainWindow.webContents.send("sesi_ccod procesando");
                    try {
                        let jsonString = data.toString().split("events:")[1].split("eventRender:")[0];
                        jsonString = jsonString.substring(0, jsonString.length - 1);
                        jsonString = "{ \"events\" : " + jsonString + "}";
                        cacheFile = JSON.parse(jsonString);
                        for (let i = 0; i < cacheFile.events.length; i++) {
                            const evento = cacheFile.events[i];

                            evento.title = evento.data.asignatura;

                            if (evento.data.tipo == 5) {
                                evento.color = config.colores[config.colorEvaluaciones];
                                evento.textColor = config.colores[config.colorTextoClasesEvaluacion];
                            }

                            if (evento.data.tipo == 1) {
                                evento.color = config.colores[config.colorClasesNormales];
                                evento.textColor = config.colores[config.colorTextoClasesNormales];
                            }
                        }
                        fs.writeFileSync(config.archivoHorario, JSON.stringify(cacheFile));
                        //console.log(cacheFile);
                        global.cacheFile = cacheFile;
                        mainWindow.webContents.send("sesi_ccod ok");
                        //mostrarEnVentana("schedule.html");

                    } catch (error) {
                        mainWindow.webContents.send("sesi_ccod falso", "Parece que inacap no reconoce tu código. ¿Esta bien escrito? ¿Es reciente?");
                    }

                })
                resp.on("error", (err) => {
                    console.log(err);
                    mainWindow.webContents.send("sesi_ccod falso", "Parece que inacap no reconoce tu código. ¿Esta bien escrito? ¿Es reciente?");

                });

            });

    } catch (error) {
        mainWindow.webContents.send("sesi_ccod error", "Parece que hay problemas de conexión. ¿Tienes internet? ¿La página de inacap carga bien?");
    }

});

ipcMain.on("actualizarHorario", (e, data) => {
    mostrarEnVentana(ventanas.recargarHorario);
});

ipcMain.on("usuario continuar", (e, data) => {
    mostrarEnVentana(ventanas.agenda);
});

ipcMain.on("crearRecordatorio" , (e, datos)=> {
    console.log(datos.texto);
    console.log(datos.evento);
   
});

ipcMain.on("uiColor", (evento, color) => {
    config.uiColor = color;
    jm.createFile(config, configFileName);
});

// Al reiniciar los colores del calendario es necesario reiniciar.
ipcMain.on("colorEvaluaciones", (evento, colorEvaluaciones) => {
    config.colorEvaluaciones = colorEvaluaciones;
    jm.createFile(config, configFileName);
    for (let i = 0; i < cacheFile.events.length; i++) {
        const evento = cacheFile.events[i];

        if (evento.data.tipo == 5) {
            evento.color = config.colores[config.colorEvaluaciones];
        }
    }
    fs.writeFileSync(config.archivoHorario, JSON.stringify(cacheFile));
    mostrarEnVentana(ventanas.agenda);
});

ipcMain.on("colorClasesNormales", (evento, colorClasesNormales) => {
    config.colorClasesNormales = colorClasesNormales;
    jm.createFile(config, configFileName);
    for (let i = 0; i < cacheFile.events.length; i++) {
        const evento = cacheFile.events[i];

        if (evento.data.tipo == 1) {
            evento.color = config.colores[config.colorClasesNormales];
        }
    }
    fs.writeFileSync(config.archivoHorario, JSON.stringify(cacheFile));
    mostrarEnVentana(ventanas.agenda);
});

ipcMain.on("colorTextoNormales", (evento, color) => {
    config.colorTextoClasesNormales = color;
    jm.createFile(config, configFileName);
    for (let i = 0; i < cacheFile.events.length; i++) {
        const evento = cacheFile.events[i];

        if (evento.data.tipo == 1) {
            evento.textColor = config.colores[config.colorTextoClasesNormales];
            console.log(evento.textColor);

        }
    }
    fs.writeFileSync(config.archivoHorario, JSON.stringify(cacheFile));
    mostrarEnVentana(ventanas.agenda);
});

ipcMain.on("colorTextoEvaluaciones", (evento, color) => {
    config.colorTextoClasesEvaluacion = color;
    jm.createFile(config, configFileName);
    for (let i = 0; i < cacheFile.events.length; i++) {
        const evento = cacheFile.events[i];

        if (evento.data.tipo == 5) {
            evento.textColor = config.colores[config.colorTextoClasesEvaluacion];
            
        }
    }
    fs.writeFileSync(config.archivoHorario, JSON.stringify(cacheFile));
    mostrarEnVentana(ventanas.agenda);
});

// Esta funcion si que sabe como cambiar páginas
function mostrarEnVentana(ventana) {
    mainWindow.hide();
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, "view", ventana.archivo),
        protocol: "file",
        slashes: true
    }));

    mainWindow.on('ready-to-show', () => {
        mainWindow.show();
        mainWindow.setTitle(ventana.titulo);
    });

    mainWindow.webContents.on('did-finish-load', function () {
        mainWindow.show();
        mainWindow.setTitle(ventana.titulo);

    });

    mainWindow.on("closed", () => {
        app.quit();
    });

    mainWindow.on("unresponsive", () => {
        console.log("La ventana se está pegando");
    });

}