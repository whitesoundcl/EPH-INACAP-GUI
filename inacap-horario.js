var specialElementHandlers = {
    '#editor': function (element, renderer) {
        return true;
    }
};

function imprimir() {

    valida_sesion(function (result) {
        
        var resized = false;

        if ($('#main-content').width() <612) {
            $('#main-content').css({ 'width': '1000px' });
            $(window).trigger('resize');
            $("#calendar").fullCalendar('render');
            resized = true;
        }
        jQuery("#btn-imprimir").css({ visibility: 'hidden' });
        //evaluacionesPDF(true);

        var html2obj = html2canvas($('#main-content'), {
            allowTaint: true,
            taintTest: false
        });

        var queue = html2obj.parse();
        var canvas = html2obj.render(queue);

        var ctx = canvas.getContext('2d');

        //ctx.webkitImageSmoothingEnabled = false;
        //ctx.mozImageSmoothingEnabled = false;
        //ctx.imageSmoothingEnabled = false;

        var img = canvas.toDataURL("image/png");

        jQuery("#btn-imprimir").css({ visibility: 'visible' });
       if (resized == true)
       {
            $('#main-content').css({ 'width': '100%' });
            $(window).trigger('resize');
            $("#calendar").fullCalendar('render');
            resized = false;
        }
        
        //evaluacionesPDF(false);

        jQuery("#canvas").val(img);
        jQuery("#frmhorario").submit();
    });
}


function paramValue(paramName) {
    var regexS = "[\\?&]" + paramName + "=([^&#]*)";
    var regex = new RegExp(regexS,'i');//no case sensitive
    var tmpURL = window.location.href;
    var results = regex.exec(tmpURL);
    if (results == null)
        return "";
    else
        return results[1];
}

function valida_sesion(success) {

    var params = new Object();

    params.sesi_ccod = paramValue('sesi_ccod');
    
    if (params.sesi_ccod == "")
    {
        document.location = 'UI/ErrorSesion.htm';
    }
    else
    {
        var dataparams = JSON.stringify(params);

        jQuery.ajax({
            type: "POST",
            url: "Horario.aspx/ValidaSesion",
            data: dataparams,
            contentType: "application/json",
            dataType: "json",
            async: true,
            success: function (result)
            {
                if (result.d == "0")
                {
                    document.location = 'UI/ErrorSesion.htm';
                }
                else
                {
                    if (success != undefined)
                    {
                        success(result.d);
                    }
                }
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                //document.location = 'UI/ErrorSesion.htm';
            }
        });
    }
}

jQuery(function () {
    jQuery("select[name='periodo']").change(function (e) {
        valida_sesion(function (result) { });
    });


    setTimeout(function () { $("#main-content .fc-state-active").addClass("bandera"); }, 100);

    var tipo_usuario = jQuery("#tipo_usuario").val();

    if (tipo_usuario == 1) {
        $("#main-content").delegate(".fc-state-active,.fc-corner-left,.fc-corner-right", "click", function () {

            var vista = 2;
            if ($(".fc-button-month").hasClass("fc-state-active")) {
                vista = 1;
            } else if ($(".fc-button-agendaWeek").hasClass("fc-state-active")) {
                vista = 2;
            } else if ($(".fc-button-agendaDay").hasClass("fc-state-active")) {
                vista = 3;
            }

            if (vista != 3) {

                var v_fecha_inicio = moment($('#calendar').fullCalendar('getView').visStart).format('D-M-YYYY')
                var v_fecha_termino = moment($('#calendar').fullCalendar('getView').visEnd).add('d', -1).format('D-M-YYYY');
                paramValue('sesi_ccod');
                var peri_ccod;
                var params = new Object();
                params.sesi_ccod = paramValue('sesi_ccod');
                params.fecha_inicio = v_fecha_inicio;
                params.fecha_termino = v_fecha_termino;
                params.vista = vista;
                if (!$("#periodo").val()) {
                    params.peri_ccod = 0;
                } else {
                    params.peri_ccod = $("#periodo").val();
                }

                var dataparams = JSON.stringify(params);
                $("#contenedor_online").css("display", "none");
                jQuery.ajax({
                    type: "POST",
                    url: "Horario.aspx/getHTMLAsignaturasVirtuales",
                    data: dataparams,
                    contentType: "application/json",
                    dataType: "json",
                    success: function (result) {
                        if (result.d != undefined && result.d != null) {
                            if(tipo_usuario==1)
                            {
                                    $("#asig_virtuales").html(result.d);
                                    $("#contenedor_online").css("display", "block");
                            }
                        }
                    },
                    error: function (XMLHttpRequest, textStatus, errorThrown) {
                    }
                });

                //$("#contenedor_online").css("display", "block");

            } 
//                    else {
//                        $("#contenedor_online").css("display", "none");
//                    }
        });

    } 
//            else {
//                $("#contenedor_online").css("display", "none");
//            }

    /*$("#main-content").delegate(".fc-corner-left,.fc-corner-right", "click", function () {
    alert("click");
    });*/
});


$(document).ready(function () {
    var vista = 2;
    if ($(".fc-button-month").hasClass("fc-state-active")) {
        vista = 1;
    } else if ($(".fc-button-agendaWeek").hasClass("fc-state-active")) {
        vista = 2;
    } else if ($(".fc-button-agendaDay").hasClass("fc-state-active")) {
        vista = 3;
    }

     var tipo_usuario = jQuery("#tipo_usuario").val();

    if (vista != 3) {

        var v_fecha_inicio = moment($('#calendar').fullCalendar('getView').visStart).format('D-M-YYYY')
        var v_fecha_termino = moment($('#calendar').fullCalendar('getView').visEnd).add('d', -1).format('D-M-YYYY');
        paramValue('sesi_ccod');
        var peri_ccod;
        var params = new Object();
        params.sesi_ccod = paramValue('sesi_ccod');
        params.fecha_inicio = v_fecha_inicio;
        params.fecha_termino = v_fecha_termino;
        params.vista = vista;
        if (!$("#periodo").val()) {
            params.peri_ccod = 0;
        } else {
            params.peri_ccod = $("#periodo").val();
        }

        var dataparams = JSON.stringify(params);

         $("#contenedor_online").css("display", "none");
        jQuery.ajax({
            type: "POST",
            url: "Horario.aspx/getHTMLAsignaturasVirtuales",
            data: dataparams,
            contentType: "application/json",
            dataType: "json",
            success: function (result) {
                if (result.d != undefined && result.d != null) {
                    if(tipo_usuario==1)
                    {
                            $("#asig_virtuales").html(result.d);
                            $("#contenedor_online").css("display", "block");
                    }
                }
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
            }
        });

        //$("#contenedor_online").css("display", "block");

    } 
//            else {
//                $("#contenedor_online").css("display", "none");
//            }
});
