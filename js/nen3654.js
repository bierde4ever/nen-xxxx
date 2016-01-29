$(document).ready(function () {
    LoadJSON();

    initHSPlijn();

    $('#hspl1').change(hspl1Change);
    $('#hspl3').change(hspl3Change);
    $('#hspl4').change(hspl4Change);
    $('#hspl5').change(hspl5Change);
});

var ERRORS = 0, CAPACITIEVE = 1, WEERSTAND = 2, INDUCTIEVE = 3, THERMISCHE = 4, MECHANISCHE = 5;
var outputHSPL = [];

function initHSPlijn() {
    outputHSPL[THERMISCHE] = messages.thermischeb_ok;
    hspl1Change();
}

function hspl1Change() {
    outputHSPL[ERRORS] = undefined;
    outputHSPL[CAPACITIEVE] = undefined;
    outputHSPL[WEERSTAND] = undefined;
    outputHSPL[INDUCTIEVE] = undefined;
    outputHSPL[MECHANISCHE] = undefined;

    if ($('#hspl1').val() === 'Ja') {
        outputHSPL[WEERSTAND] = messages.weerstandsb_ok;
        outputHSPL[INDUCTIEVE] = messages.inductieveb_ok;
        $('.petersburghspl').hide();
        $('#parallelloop-hsplijn').hide();
        $('.step2A').hide();
    } else {
        outputHSPL[CAPACITIEVE] = messages.capacitieveb_ok;
        $('.petersburghspl').show();
        $('#parallelloop-hsplijn').show();
        $('.step2A').show();
    }
    hspl3Change();
    hspl4Change();
    hspl5Change();
    updateHSPlOutput();
}

function hspl3Change() {
    var hartophart = $('#hspl3').val();
    if (!isValueValid(hartophart)) {
        return;
    }

    if ($('#hspl1').val() === 'Ja') {
        if (hartophart < 50) {
            outputHSPL[CAPACITIEVE] = messages.capacitieveb_nok; 
            // stap 3(I)
            outputHSPL[CAPACITIEVE] += Step3I();
        } else {
            outputHSPL[CAPACITIEVE] = messages.capacitieveb_ok;
        }
        if (hartophart < 58.9) {
            outputHSPL[MECHANISCHE] = messages.mechanischeb_nok;
            // stap 2(A)
            $('.afstandtotmast').show();
            $('.step2A').show();
            EvaluateStep2A();
        } else {
            outputHSPL[MECHANISCHE] = messages.mechanischeb_ok;
            $('.afstandtotmast').hide();
            $('.step2A').hide();
        }
    } else {
        if (hartophart < 50) {
            outputHSPL[WEERSTAND] = messages.weerstandsb_nok;
            // stap 2(B)
            $('.afstandtotmast').show();
        } else {
            outputHSPL[WEERSTAND] = messages.weerstandsb_ok;
        }
        if (hartophart < 58.9) {
            outputHSPL[MECHANISCHE] = messages.mechanischeb_nok;
            // stap 2(A)
            $('.afstandtotmast').show();
            $('.step2A').show();
            EvaluateStep2A();
        } else {
            outputHSPL[MECHANISCHE] = messages.mechanischeb_ok;
            $('.afstandtotmast').hide();
            $('.step2A').hide();
            hspl1Change();
        }
    }
    updateHSPlOutput();
}

function hspl4Change() {
    if ($('#hspl4').is(':visible')) {
        var afstandTotMast = $('#hspl4').val();
        if (!isValueValid(afstandTotMast)) {
            return;
        }
        EvaluateStep2A();
        // 2B
        if (afstandTotMast < 50) {
            outputHSPL[WEERSTAND] = messages.weerstandsb_nok;
            outputHSPL[WEERSTAND] += '<em>Toelichting: overbruggingsspanning, aanraakspanning en doorslag.</em><br>';
            outputHSPL[WEERSTAND] += Step3VI();
        } else {
            outputHSPL[WEERSTAND] = messages.weerstandsb_ok;
        }

        updateHSPlOutput();
    }
}
function hspl5Change() {
    if ($('#hspl5').is(':visible')) {
        var uitkomstFormule = $('#hspl5').val();
        if (!isValueValid(uitkomstFormule)) {
            return;
        }
        if (uitkomstFormule < 1) {
            outputHSPL[INDUCTIEVE] = messages.inductieveb_ok;
        } else {
            outputHSPL[INDUCTIEVE] = messages.inductieveb_nok;
            outputHSPL[INDUCTIEVE] += "<em>Toelichting: wisselstroomcorrosie.</em><br>";
            $('.step2A').show();
        }
        updateHSPlOutput();
    }
}

function EvaluateStep2B() {
    var afstandTotMast = $('#hspl4').val();
    if (!isValueValid(afstandTotMast)) {
        $('#outputValues').append("<strong>Ongeldige invoer: Vul waarde in bij afstand tot mast.</strong><br>");
    }
    else {
        if (afstandTotMast < 50) {
            $('#outputValues').append(messages.weerstandsb_nok);
            $('#outputValues').append('<em>Toelichting: overbruggingsspanning, aanraakspanning en doorslag</em><br>');
            // ga naar stap 3(VI)
            Step3VI();
        }
        else {
            $('#outputValues').append(messages.weerstandsb_ok);
        }
    }
}

function updateHSPlOutput() {
    var values = $('#outputvalues-hspl');
    values.empty();
    var index;
    for (index = 0; index < outputHSPL.length; index++) {
        if (outputHSPL[index] != undefined) {
            values.append(outputHSPL[index]);
        }
    }
}

function selectMastbeeld(deze) {
    var src = $(deze).attr('src');
    //$('#myImageDiv').prepend('<img src="' + src + '" class="img-responsive">');
    $('#myImage').attr('src', src);
    $('#k1').html($(deze).data('k1'));
    $('#k1').data('k1', $(deze).data('k1'));
    $('#k2').html($(deze).data('k2'));
    $('#k2').data('k2', $(deze).data('k2'));
    $('#lengte').val('');
    $('#hart').val('');
    $('#middle').val('');
    $('#myModal1').modal('show');
}

function UnityCheck(_l, _a, _k1, _k2) {
    var L = parseFloat(_l);
    var a = parseFloat(_a);
    var k1 = parseFloat(_k1);
    var k2 = parseFloat(_k2);
    var UC = L * k1 * (Math.log(k2) - Math.log(a));
    return UC;
}

function LoadJSON() {
    $.getJSON('../data.json', function (data) {
        var output = "";
        $.each(data, function (i, mastbeelden) {
            $.each(mastbeelden, function (x, mastbeeld) {
                output += '<div class="col-xs-12">';
                output += '<img src="' + mastbeeld.imagesrc
                + '" class="img-responsive"'
                + ' data-code="' + mastbeeld.code + '"'
                + ' data-k1="' + mastbeeld.k1.normaal + '"'
                + ' data-k2="' + mastbeeld.k2.normaal + '"'
                + ' data-k1normaal="' + mastbeeld.k1.normaal + '"'
                + ' data-k2normaal="' + mastbeeld.k2.normaal + '"'
                + ' data-k1corrosie="' + mastbeeld.k1.corrosie + '"'
                + ' data-k2corrosie="' + mastbeeld.k2.corrosie + '"'
                + ' data-k1eenfasekortsluiting="' + mastbeeld.k1.eenfasekortsluiting + '"'
                + ' data-k2eenfasekortsluiting="' + mastbeeld.k2.eenfasekortsluiting + '"'
                + ' data-k1onderhoud="' + mastbeeld.k1.onderhoud + '"'
                + ' data-k2onderhoud="' + mastbeeld.k2.onderhoud + '"'
                + ' data-hoogte="' + mastbeeld.hoogte + '"'
                + ' width="300" onClick="selectMast(this)">';
                output += '</div>';
            });
        });
        $('#placeholder').html(output);
    });
}

function selectMast(img) {
    var clonedImage = $(img).clone(false);
    $(clonedImage).attr("id", "myImage");
    var image = $('#myImage');
    image.replaceWith(clonedImage);
    $('#k1').html($(img).data('k1'));
    $('#k1').data('k1', $(img).data('k1'));
    $('#k2').html($(img).data('k2'));
    $('#k2').data('k2', $(img).data('k2'));
    $("#myModal1").modal('hide');
    // is hartop hartafstand < 58.9, dan stap 2 A
    // stap2A
    if ($('#hspl3').val() < 58.9) {
       EvaluateStep2A();
    }

    // is petersburg formule zichtbaar en >= 1, dan stap 2 C
    // stap2C
}

function selectMastA() {
    $('#myModal1').modal('show');
}

var messages = {
    'capacitieveb_ok': 'Capacitieve be&iuml;nvloeding: OK<br>',
    'capacitieveb_nok': 'Capacitieve be&iuml;nvloeding: Niet OK<br>',
    'weerstandsb_ok': 'Weerstandsbe&iuml;nvloeding: OK<br>',
    'weerstandsb_nok': 'Weerstandsbe&iuml;nvloeding: Niet OK<br>',
    'inductieveb_ok': 'Inductieve be&iuml;nvloeding: OK<br>',
    'inductieveb_nok': 'Inductieve be&iuml;nvloeding: Niet OK<br>',
    'thermischeb_ok': 'Thermische be&iuml;nvloeding: OK<br>',
    'thermischeb_nok': 'Thermische be&iuml;nvloeding: Niet OK<br>',
    'mechanischeb_ok': 'Mechanische be&iuml;nvloeding: OK<br>',
    'mechanischeb_nok': 'Mechanische be&iuml;nvloeding: Niet OK<br>'
};

function EvaluateHSPlStep1() {
    var isolated = $('#hspl1').val();
    var distance1 = $('#hspl2').val();
    var distance2 = $('#hspl3').val();
    var output = $('#outputValues');

    output.empty();
    if (!isValueValid(distance1)) {
        output.append("Ongeldige invoer: Vul correcte waarde in voor Parallelloop.<br>");
        return;
    }
    if (!isValueValid(distance2)) {
        output.append("Ongeldige invoer: Vul correcte waarde in voor Hart-op-Hart.<br>");
        return;
    }
    output.append(messages.thermischeb_ok);
    if (isolated == 'Ja') {
        $(".step2Totaal").hide();
        //$(".step2C").hide();
        output.append(messages.weerstandsb_ok);
        output.append(messages.inductieveb_ok);
        CheckCapacitieveHSPlijn(distance2);
        CheckMechanischHSPlijn(distance2);
    }
    else {
        output.append(messages.capacitieveb_ok);
        CheckWeerstandHSPlijn(distance2);
        CheckInductieveHSPlijn(); // Formules Petersburgconsultants
        CheckMechanischHSPlijn(distance2);
    }
}
function CheckCapacitieveHSPlijn(hartophart) {
    var output = $('#outputValues');
    if (hartophart < 50) {
        output.append(messages.capacitieveb_nok);
        output.append("<em>Toelichting: overbruggingsspanning.</em><br>");
        // ga naar stap 3I
        Step3I();
    }
    else {
        output.append(messages.capacitieveb_ok);
    }
}
function CheckWeerstandHSPlijn(hartophart) {
    if (hartophart < 50) {
        // ga naar stap 2(B)
        if ($(".afstandtotmast").is(':visible')) {
            EvaluateStep2B();
        }
        else {
            $('#outputValues').append(messages.weerstandsb_nok);
            $('#hspl4').val('');
            $(".afstandtotmast").show();
        }
    }
    else {
        //$(".afstandtotmast").hide();
        $('#outputValues').append(messages.weerstandsb_ok);
    }
}
function CheckInductieveHSPlijn() {
    var petersburg = $('#hspl5').val();
    if (!isValueValid(petersburg)) {
        $('#outputValues').append("Ongeldige invoer: Vul waarde in voor formule Petersburg<br>");
    }
    else {
        if (petersburg < 1) {
            $('#outputValues').append(messages.inductieveb_ok);
        }
        else {
            $('#outputValues').append(messages.inductieveb_nok);
            $('#outputValues').append("<em>Toelichting: wisselstroomcorrosie.</em><br>");
            if ($(".step2A").is(":visible")) {
                EvaluateStep2C();
            }
            else {
                $('#myImage').replaceWith('<img id="myImage" class="img-responsive">');
                $('#k1').empty();
                $('#k2').empty();
                $(".step2A").show();
            }
        }
    }
}
function CheckMechanischHSPlijn(hartophart) {
    if (hartophart < 58.9) {
        // ga naar stap 2(A)
        if ($(".step2A").is(':visible') && $(".afstandtotmast").is(':visible')) {
            EvaluateStep2A();
        }
        else {
            $('#hspl4').val('');
            $('#myImage').replaceWith('<img id="myImage" class="img-responsive">');
            $('#k1').empty();
            $('#k2').empty();
            $(".step2A").show();
            $(".afstandtotmast").show();
            $('#outputValues').append(messages.mechanischeb_nok);
            $('#outputValues').append("<em>Toelichting: mechanische beschadiging.</em><br>");
        }
    }
    else {
        $(".step2A").hide();
        $(".afstandtotmast").hide();
        $('#hspl4').val('');
        $('#myImage').replaceWith('<img id="myImage" class="img-responsive">');
        $('#k1').empty();
        $('#k2').empty();
        $('#outputValues').append(messages.mechanischeb_ok);
    }
}
function EvaluateStep2A() {
    var afstandTotMast = $('#hspl4').val();
    var hoogteMast = $('#myImage').data("hoogte");
    if (!isValueValid(afstandTotMast)) {
        $('#outputValues').append("<strong>Ongeldige invoer: Vul waarde voor afstand tot mast in.</strong><br>");
        return;
    }
    if ($('.step2A').is(':visible')) {
        if (!isValueValid(hoogteMast)) { // is er een mast gekozen
            $('#outputValues').append("<strong>Ongeldige invoer: Selecteer een mast-type.</strong><br>");
            return;
        }
        // 2A
        if (afstandTotMast < hoogteMast) {
            outputHSPL[MECHANISCHE] = messages.mechanischeb_nok;
            outputHSPL[MECHANISCHE] += '<em>Toelichting: mechanische beschadiging. Treed in overleg.</em><br>';
        } else {
            outputHSPL[MECHANISCHE] = messages.mechanischeb_ok;
        }
    }
}

function EvaluateStep2C(parallelloop, hartophart) {
    // Kies type mast uit schema/foto
    var hoogteMast = $('#myImage').data("hoogte");
    if (!isValueValid(hoogteMast)) {
        $('#outputValues').append("Ongeldige invoer: Selecteer een mast.<br>");
        return;
    }
    var image = $('#myImage');
    var mast = {
        k1: {
            normaal: image.data("k1normaal"),
            corrosie: image.data("k1corrosie"),
            eenfasekortsluiting: image.data("k1eenfasekortsluiting"),
            onderhoud: image.data("k1onderhoud")
        },
        k2: {
            normaal: image.data("k2normaal"),
            corrosie: image.data("k2corrosie"),
            eenfasekortsluiting: image.data("k2eenfasekortsluiting"),
            onderhoud: image.data("k2onderhoud")
        }
    };

    var ucnormaal = UnityCheck(parallelloop, hartophart, mast.k1.normaal, mast.k2.normaal);
    var uccorrosie = UnityCheck(parallelloop, hartophart, mast.k1.corrosie, mast.k2.corrosie);
    var uceenfasekortsluiting = UnityCheck(parallelloop, hartophart, mast.k1.eenfasekortsluiting, mast.k2.eenfasekortsluiting);
    var uconderhoud = UnityCheck(parallelloop, hartophart, mast.k1.onderhoud, mast.k2.onderhoud);
    if (ucnormaal < 1 && uccorrosie < 1 && uceenfasekortsluiting < 1 && uconderhoud < 1) {
        $('#outputValues').append(messages.inductieveb_ok);
    }
    else {
        $('#outputValues').append(messages.inductieveb_nok);
        if (uccorrosie >= 1) {
            $('#outputValues').append('<em>Toelichting: wisselstroomcorrosie. Treed in overleg</em><br>');
        }
        else {
            $('#outputValues').append('<em>Toelichting: aanraakspanning. Treed in overleg</em><br>');
        }
        Step3VII();
    }
}


function EvaluateHSPkStep1() {
    var isolated = $('#hspk1').val();
    var distance1 = $('#hspk2').val();
    var distance2 = $('#hspk3').val();

    var output = $('#outputValues');

    output.empty();
    if (!isValueValid(distance2)) {
        output.append("Ongeldige invoer: Hart op Hart afstand.<br>");
        return;
    }
    output.append(messages.capacitieveb_ok);
    output.append(messages.mechanischeb_ok);
    if (isolated == 'Ja') {
        $(".step2D").hide();
        //$(".step2E").hide();
        output.append(messages.weerstandsb_ok);
        output.append(messages.inductieveb_ok);
        output.append(messages.thermischeb_ok);
    }
    else {
        CheckThermischHSPkabel(distance2);
        CheckWeerstandHSPkabel(distance2);
        CheckInductieveHSPkabel();          // Formule Petersburgconsultants
    }
}
function CheckThermischHSPkabel(hartophart) {
    if (hartophart < 10) {
        $(".step2D").hide();
        $('#outputValues').append(messages.thermischeb_nok);
        // ga naar stap 3(II)
        Step3II();
    }
    else {
        $('#outputValues').append(messages.thermischeb_ok);
    }
}
function CheckWeerstandHSPkabel(hartophart) {
    if (hartophart < 30) {
        // ga naar stap 2(D)
        if ($(".step2D").is(':visible')) {
            EvaluateStep2D();
        }
        else {
            $('#outputValues').append(messages.weerstandsb_nok);
            $('#hspk4').val('');
            $(".step2D").show();
        }
    }
    else {
        $(".step2D").hide();
        $('#outputValues').append(messages.weerstandsb_ok);
    }
}
function CheckInductieveHSPkabel() {
    // if Formule van Petersburgconsultants < 1 {
    //     $('#outputValues').append(messages.inductieveb_ok);
    // }
    // else{
    //     $('#outputValues').append(messages.inductieveb_nok);
    //     $('#outputValues').append("<em>Toelichting: wisselstroomcorrosie.</em>");
    //     // ga naar stap 2(E)
    // }
}

function EvaluateHSPsStep1() {
    var isolated = $('#hsps1').val();
    var distance1 = $('#hsps2').val();
    var distance2 = $('#hsps3').val();

    $('#outputValues').empty();
    $('#outputValues').append(messages.thermischeb_ok);
    $('#outputValues').append(messages.mechanischeb_ok);
    if (isolated == 'Ja') {
        $(".step2F").hide();
        //$(".step2G").hide();
        $('#outputValues').append(messages.weerstandsb_ok);
        $('#outputValues').append(messages.inductieveb_ok);
        CheckCapacitieveHSPstation(distance2);
    }
    else {
        $('#outputValues').append(messages.capacitieveb_ok);
        CheckWeerstandHSPstation(distance2);
        CheckInductieveHSPstation(); // Formule Petersburgconsultants
    }
}
function CheckCapacitieveHSPstation(aftandTotHekwerk) {
    if (aftandTotHekwerk < 25) {
        $('#outputValues').append(messages.capacitieveb_nok);
        $('#outputValues').append("<em>Toelichting: overbruggingsspanning.</em><br>");
        // ga naar stap 3(III)
        Step3III();
    }
    else {
        $('#outputValues').append(messages.capacitieveb_ok);
    }
}
function CheckWeerstandHSPstation(aftandTotHekwerk) {
    if (aftandTotHekwerk < 500) {
        // ga naar stap 2(F)
        if ($(".step2F").is(':visible')) {
            EvaluateStep2F();
        }
        else {
            $('#outputValues').append(messages.weerstandsb_nok);
            $('#hsps4').val('');
            $(".step2F").show();
        }
    }
    else {
        $(".step2F").hide();
        $('#outputValues').append(messages.weerstandsb_ok);
    }
}
function CheckInductieveHSPstation() {
    // if Formule van Petersburgconsultants < 1 {
    //     $('#outputValues').append(messages.inductieveb_ok);
    // }
    // else{
    //     $('#outputValues').append(messages.inductieveb_nok);
    //     $('#outputValues').append("<em>Toelichting: wisselstroomcorrosie.</em>");
    //     // ga naar stap 2(G)
    // }
}

function EvaluateTEVStep1() {
    var isolated = $('#tev1').val();
    var distance1 = $('#tev2').val();
    var distance2 = $('#tev3').val();
    $('#outputValues').empty();
    $('#outputValues').append(messages.thermischeb_ok);
    $('#outputValues').append(messages.mechanischeb_ok);
    if (isolated == 'Ja') {
        //$(".step2H").hide();
        $('#outputValues').append(messages.weerstandsb_ok);
        $('#outputValues').append(messages.inductieveb_ok);
        CheckCapacitieveTEV(distance1, distance2);
    }
    else {
        $('#outputValues').append(messages.capacitieveb_ok);
        CheckWeerstandTEV(distance2);
        CheckInductieveTEV(); // Formule Petersburgconsultants
    }
}
function CheckCapacitieveTEV(parallelloop, hartophart) {
    if (hartophart < 10 && parallelloop >= 1) {
        $('#outputValues').append(messages.capacitieveb_nok);
        // ga naar stap 3(IV)
    }
    if (hartophart >= 10 || parallelloop < 1) {
        $('#outputValues').append(messages.capacitieveb_ok);
    }
}
function CheckWeerstandTEV(hartophart) {
    if (hartophart < 13) {
        $('#outputValues').append(messages.weerstandsb_nok);
        // ga naar stap 3(V)
    }
    else {
        $('#outputValues').append(messages.weerstandsb_ok);
    }
}
function CheckInductieveTEV() {
    // if Formule van Petersburgconsultants < 1 {
    //     $('#outputValues').append(messages.inductieveb_ok);
    // }
    // else{
    //     $('#outputValues').append(messages.inductieveb_nok);
    //     $('#outputValues').append("<em>Toelichting: wisselstroomcorrosie.</em>");
    //     // ga naar stap 2(H)
    // }
}

function EvaluateStep2D() {
    var afstandTotAarding = $('#hspk4').val();
    if (afstandTotAarding < 30) {
        $('#outputValues').append(messages.weerstandsb_nok);
        $('#outputValues').append('<em>Toelichting: overbruggingsspanning, aanraakspanning en doorslag.</em>');
        Step3VIII();
    }
    else {
        $('#outputValues').append(messages.weerstandsb_ok);
    }
}

function EvaluateStep2E(flatSurface) {
    // Kies type mast uit schema/foto
    var K1 = 10;
    var K2 = 10;
    var chk = UnityCheck(K1, K2);
    if (chk >= 1) {
        $('#outputValues').append(messages.inductieveb_nok);
    }
    else {
        $('#outputValues').append(messages.inductieveb_ok);
    }
}

function EvaluateStep2F() {
    var afstandTotHekwerk = $('#hsps3').val();
    var omtrekStation = $('#hsps4').val();
    if (afstandTotHekwerk < 0.5 * omtrekStation) {
        $('#outputValues').append(messages.weerstandsb_nok);
        $('#outputValues').append('<em>Toelichting: overbruggingsspanning, aanraakspanning en doorslag.</em>');
        Step3IX();
    }
    else {
        $('#outputValues').append(messages.weerstandsb_ok);
    }
}

function EvaluateStep2G() {
    // gebruik K1 en K2 van configuratie L05
    var K1 = 10;
    var K2 = 10;
    var chk = UnityCheck(K1, K2);
    if (chk >= 1) {
        $('#outputValues').append(messages.inductieveb_nok);
        // k1 en k2 : Normaal bedrijf
        $('#outputValues').append('<em>Toelichting: aanraakspanning. Treed in overleg</em><br>');
        // ga naar stap 3(VI)
        Step3VII();        
        // k1 en k2 : Corrosie
        $('#outputValues').append('<em>Toelichting: wisselstroomcorrosie. Treed in overleg</em><br>');
        // ga naar stap 3(VI)
        Step3VII();        
        // k1 en k2 : Eenfasekortsluiting
        $('#outputValues').append('<em>Toelichting: aanraakspanning. Treed in overleg</em><br>');
        // ga naar stap 3(VI)
        Step3VII();        
        // k1 en k2 : Onderhoud
        $('#outputValues').append('<em>Toelichting: aanraakspanning. Treed in overleg</em><br>');
        // ga naar stap 3(VI)
        Step3VII();
    }
    else {
        $('#outputValues').append(messages.inductieveb_ok);
    }
}

function EvaluateStep2H(tevType) {
    var K1 = 10;
    var K2 = 10;
    if (tevType == 'A') {
        K1 = 20;
        K2 = 20;
    }
    else if (tevType == 'B') {
        K1 = 30;
        K2 = 30;
    }
    else if (tevType == 'C') {
        K1 = 40;
        K2 = 40;
    }
    var chk = UnityCheck(K1, K2);
    if (chk >= 1) {
        $('#outputValues').append(messages.inductieveb_nok);
        // k1 en k2 : Normaal bedrijf
        $('#outputValues').append('<em>Toelichting: aanraakspanning. Treed in overleg</em><br>');
        // ga naar stap 3(VII)
        Step3VII();
        // k1 en k2 : Corrosie
        $('#outputValues').append('<em>Toelichting: wisselstroomcorrosie. Treed in overleg</em><br>');
        // ga naar stap 3(VII)
        Step3VII();        
        // k1 en k2 : Eenfasekortsluiting
        $('#outputValues').append('<em>Toelichting: aanraakspanning. Treed in overleg</em><br>');
        // ga naar stap 3(VII)
        Step3VII();
    }
    else {
        $('#outputValues').append(messages.inductieveb_ok);
    }
}


function Step3I() {
    var outputValues = '<br>'
        + 'Capacitieve be&iuml;nvloeding HSP-lijn<br>'
        + '<ol>'
        + '<li>Controleer ingevulde gegevens</li>'
        + '<li>Aardingsmethodiek bovengrondse leiding</li>'
        + '<li>Spanningsniveau</li>'
        + '<li>Geometrie</li>'
        + '</ol>';
    return outputValues;
    // $('#outputValues').append('<br>');
    // $('#outputValues').append('Capacitieve be&iuml;nvloeding HSP-lijn<br>');
    // $('#outputValues').append('<ol>');
    // $('#outputValues').append('<li>Controleer ingevulde gegevens</li>')
    // $('#outputValues').append('<li>Aardingsmethodiek bovengrondse leiding</li>')
    // $('#outputValues').append('<li>Spanningsniveau</li>')
    // $('#outputValues').append('<li>Geometrie</li>')
    // $('#outputValues').append('</ol>');
}
function Step3II() {
    $('#outputValues').append('<br>');
    $('#outputValues').append('Thermische be&iuml;nvloeding HSP-kabel<br>');
    $('#outputValues').append('<ol>');
    $('#outputValues').append('<li>Voor nieuwe kabels: bereken via NEN-IEC 60287</li>')
    $('#outputValues').append('<li>Voor bestaande systemen: voer een verificatie (meting/berekening) uit</li>')
    $('#outputValues').append('</ol>');
}
function Step3III() {
    $('#outputValues').append('<br>');
    $('#outputValues').append('Capacitieve be&iuml;nvloeding HSP-station<br>');
    $('#outputValues').append('<ol>');
    $('#outputValues').append('<li>Controleer ingevulde gegevens</li>')
    $('#outputValues').append('<li>Aardingsmethodiek bovengrondse leiding</li>')
    $('#outputValues').append('<li>Spaningsniveau</li>')
    $('#outputValues').append('<li>Type installatie (GIS of openluchtstation)</li>')
    $('#outputValues').append('</ol>');
}
function Step3IV() {
    $('#outputValues').append('<br>');
    $('#outputValues').append('Capacitieve be&iuml;nvloeding TEV-systeem<br>');
    $('#outputValues').append('<ol>');
    $('#outputValues').append('<li>Controleer ingevulde gegevens</li>')
    $('#outputValues').append('<li>Type systeem: AT-, RT-, ST-systeem</li>')
    $('#outputValues').append('<li>Geometrie</li>')
    $('#outputValues').append('<li>Aardingsmethodiek bovengrondse leiding</li>')
    $('#outputValues').append('<li>Spanningsniveau</li>')
    $('#outputValues').append('</ol>');
}
function Step3V() {
    $('#outputValues').append('<br>');
    $('#outputValues').append('Weerstandsbe&iuml;nvloeding TEV-systeem<br>');
    $('#outputValues').append('<ol>');
    $('#outputValues').append('<li>Controleer ingevulde gegevens</li>')
    $('#outputValues').append('<li>Met aardingssysteem verbonden geleidende delen</li>')
    $('#outputValues').append('</ol>');
}
function Step3VI() {
    var outputValues = '<br>'
        + 'Weerstandsbe&iuml;nvloeding HSP-lijn<br>'
        + '<ol>'
        + '<li>Controleer ingevulde gegevens</li>'
        + '<li>Aarding net</li>'
        + '<li>Type bekleding leiding</li>'
        + '</ol>';
    return outputValues;
}
function Step3VII() {
    $('#outputValues').append('<br>');
    $('#outputValues').append('Inductieve be&iuml;nvloeding<br>');
    $('#outputValues').append('<ol>');
    $('#outputValues').append('<li>Controleer ingevulde gegevens</li>')
    $('#outputValues').append('<li>Bepaal juiste K1 en K2 waarde</li>')
    $('#outputValues').append('</ol>');
}
function Step3VIII() {
    $('#outputValues').append('<br>');
    $('#outputValues').append('Weerstandsbe&iuml;nvloeding HSP-kabel<br>');
    $('#outputValues').append('<ol>');
    $('#outputValues').append('<li>Controleer ingevulde gegevens</li>')
    $('#outputValues').append('<li>Aarding net</li>')
    $('#outputValues').append('<li>Type bekleding leiding</li>')
    $('#outputValues').append('<li>Type isolatie kabelmantels (is het GPLK?)</li>')
    $('#outputValues').append('</ol>');
}
function Step3IX() {
    $('#outputValues').append('<br>');
    $('#outputValues').append('Weerstandsbe&iuml;nvloeding HSP-station<br>');
    $('#outputValues').append('<ol>');
    $('#outputValues').append('<li>Controleer ingevulde gegevens</li>')
    $('#outputValues').append('<li>Aarding net</li>')
    $('#outputValues').append('<li>Type bekleding leiding</li>')
    $('#outputValues').append('</ol>');
}

function isValueValid(value) {
    if (value === undefined || value == null || value == '') {
        return false;
    }
    return true;
}