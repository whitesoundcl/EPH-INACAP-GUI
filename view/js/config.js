// Este archivo representa las acciones javascript de la vista de configuracion
// de schedule.html

var selectColor = document.getElementById("selectColor");
var selectColorClases = document.getElementById("selectColorClases");
var selectColorEvaluaciones = document.getElementById("selectColorEvaluaciones");
var selectColorTexto = document.getElementById("selectColorTexto");
var selectColorTextoEvaluacion = document.getElementById("selectColorTextoEvaluacion");


// Establecer el color seleccionado en el dropdown:
$(selectColor).val(config.uiColor);
$(selectColorClases).val(config.colorClasesNormales);
$(selectColorEvaluaciones).val(config.colorEvaluaciones);
$(selectColorTexto).val(config.colorTextoClasesNormales);
$(selectColorTextoEvaluacion).val(config.colorTextoClasesEvaluacion);


selectColor.onchange = (e)=> {
    ipcRenderer.send("uiColor", selectColor.options[selectColor.selectedIndex].value );
    actualizarColorUI(selectColor.options[selectColor.selectedIndex].value);
};

selectColorClases.onchange = (e)=>{
    ipcRenderer.send("colorClasesNormales", selectColorClases.options[selectColorClases.selectedIndex].value );
};

selectColorEvaluaciones.onchange = (e) => {
    ipcRenderer.send("colorEvaluaciones", selectColorEvaluaciones.options[selectColorEvaluaciones.selectedIndex].value );
};

selectColorTexto.onchange = (e)=>{
    ipcRenderer.send("colorTextoNormales", selectColorTexto.options[selectColorTexto.selectedIndex].value );

};

selectColorTextoEvaluacion.onchange = (e) => {
    ipcRenderer.send("colorTextoEvaluaciones", selectColorTextoEvaluacion.options[selectColorTextoEvaluacion.selectedIndex].value );

};