$(document).ready(function () {
    LoadJSON();

    initHSPlijn();
    initHSPkabel();

    $('#selecteerMast').click(selectMastA);
    $('#hspl1').change(hsplLeidingIsolatieChange);
    $('#hspl2').change(hsplParallelloopChange);
    $('#hspl3').change(hsplHartOpHartChange);
    $('#hspl4').change(hsplAfstandTotMastChange);

    $('#hspk1').change(hspkLeidingIsolatieChange);
    $('#hspk3').change(hspkHartOpHartChange);
    $('#hspk4').change(hspkAfstandTotAardingChange);
    $('#hspk5').change(hspkKabelLiggingChange);
});

var ERRORS = 0, CAPACITIEVE = 1, WEERSTAND = 2, INDUCTIEVE = 3, THERMISCHE = 4, MECHANISCHE = 5;
var outputHSPL = [];
var outputHSPK = [];
var outputHSPS = [];
var outputTEV = [];
// ********************** HSP Lijn - start *****************************
function initHSPlijn() {
    outputHSPL[THERMISCHE] = messages.thermischeb_ok;
    hsplLeidingIsolatieChange();
}
function hsplLeidingIsolatieChange() {
    outputHSPL[ERRORS] = undefined;
    outputHSPL[CAPACITIEVE] = undefined;
    outputHSPL[WEERSTAND] = undefined;
    outputHSPL[INDUCTIEVE] = undefined;
    outputHSPL[MECHANISCHE] = undefined;

    if ($('#hspl1').val() === 'Ja') {
        outputHSPL[WEERSTAND] = messages.weerstandsb_ok;
        outputHSPL[INDUCTIEVE] = messages.inductieveb_ok;
        $('#parallelloop-hspl').hide();
        $('.step2A').hide();
    } else {
        outputHSPL[CAPACITIEVE] = messages.capacitieveb_ok;
        $('#parallelloop-hspl').show();
        $('.step2A').show();
    }
    hsplHartOpHartChange();
    hsplAfstandTotMastChange();
    updateOutput("hspl", outputHSPL);
}

function hsplParallelloopChange() {
    EvaluateStep2C();
    updateOutput("hspl", outputHSPL);
}

function hsplHartOpHartChange() {
    var hartophart = $('#hspl3').val();
    if (!isValueValid(hartophart)) {
        outputHSPL[ERRORS] = "<strong>Ongeldige invoer voor Hart-op-hart</strong><br>"
        updateOutput("hspl", outputHSPL);
        return;
    }
    outputHSPL[ERRORS] = undefined;
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
        EvaluateStep2C();
        if (hartophart < 58.9) {
            outputHSPL[MECHANISCHE] = messages.mechanischeb_nok;
            // stap 2(A)
            $('.afstandtotmast').show();
            EvaluateStep2A();
        } else {
            outputHSPL[MECHANISCHE] = messages.mechanischeb_ok;
            $('.afstandtotmast').hide();
        }
    }
    updateOutput("hspl", outputHSPL);
}

function hsplAfstandTotMastChange() {
    if ($('#hspl4').is(':visible')) {
        var afstandTotMast = $('#hspl4').val();
        if (!isValueValid(afstandTotMast)) {
            outputHSPL[ERRORS] = "<strong>Ongeldige invoer voor Afstand tot mast</strong><br>"
            updateOutput("hspl", outputHSPL);
            return;
        }

        if ($('#hspl1').val() !== 'Ja') {
            EvaluateStep2B(afstandTotMast);
            EvaluateStep2A();
        } else {
            EvaluateStep2A();
        }
        updateOutput("hspl", outputHSPL);
    }
}

function EvaluateStep2A() {
    if ($('.step2A').is(':visible')) {
        var afstandTotMast = $('#hspl4').val();
        var hoogteMast = $('#myImage').data("hoogte");
        if (!isValueValid(afstandTotMast)) {
            outputHSPL[ERRORS] = "<strong>Ongeldige invoer voor Afstand tot mast</strong><br>"
            return;
        }
        if (!isValueValid(hoogteMast)) { // is er een mast gekozen
            outputHSPL[ERRORS] = "<strong>Ongeldige invoer: Selecteer een mast-type</strong><br>"
            return;
        }
        outputHSPL[ERRORS] = undefined;
        // 2A
        if (afstandTotMast < hoogteMast) {
            outputHSPL[MECHANISCHE] = messages.mechanischeb_nok;
            outputHSPL[MECHANISCHE] += '<em>Toelichting: mechanische beschadiging. Treed in overleg.</em><br>';
        } else {
            outputHSPL[MECHANISCHE] = messages.mechanischeb_ok;
        }
    }
}

function EvaluateStep2B(afstandTotMast) {
    if (afstandTotMast < 50) {
        outputHSPL[WEERSTAND] = messages.weerstandsb_nok;
        outputHSPL[WEERSTAND] += '<em>Toelichting: overbruggingsspanning, aanraakspanning en doorslag.</em><br>';
        outputHSPL[WEERSTAND] += Step3VI();
    } else {
        outputHSPL[WEERSTAND] = messages.weerstandsb_ok;
    }
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
function EvaluateStep2C() {
    var parallelloop = $('#hspl2').val();
    var hartophart = $('#hspl3').val();
    var hoogteMast = $('#myImage').data("hoogte");
    if (!isValueValid(hartophart)) {
        outputHSPL[ERRORS] = "<strong>Ongeldige invoer voor Hart-op-hart.</strong><br>";
        return;
    }
    if (!isValueValid(parallelloop)) {
        outputHSPL[ERRORS] = "<strong>Ongeldige invoer voor Parallelloop.</strong><br>";
        return;
    }
    // Kies type mast uit schema/foto
    if (!isValueValid(hoogteMast)) {
        outputHSPL[ERRORS] = "<strong>Ongeldige invoer: Selecteer een mast-type.</strong><br>";
        return;
    }
    outputHSPL[ERRORS] = undefined;
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
        outputHSPL[INDUCTIEVE] = messages.inductieveb_ok;
    }
    else {
        outputHSPL[INDUCTIEVE] = messages.inductieveb_nok;
        if (uccorrosie >= 1) {
            outputHSPL[INDUCTIEVE] += '<em>Toelichting: wisselstroomcorrosie. Treed in overleg</em><br>';
        }
        else {
            outputHSPL[INDUCTIEVE] += '<em>Toelichting: aanraakspanning. Treed in overleg</em><br>';
        }
        outputHSPL[INDUCTIEVE] += Step3VII();
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
}
function EvaluateHSPlStep1() {
}
// ********************** HSP Lijn - einde *****************************

// ********************** HSP Kabel - start *****************************
function initHSPkabel() {
    outputHSPK[CAPACITIEVE] = messages.capacitieveb_ok;
    outputHSPK[MECHANISCHE] = messages.mechanischeb_ok;
    hspkLeidingIsolatieChange();
}
function hspkLeidingIsolatieChange() {
    outputHSPK[ERRORS] = undefined;
    outputHSPK[WEERSTAND] = undefined;
    outputHSPK[INDUCTIEVE] = undefined;
    outputHSPK[THERMISCHE] = undefined;
    if ($('#hspk1').val() === 'Ja') {
        outputHSPK[WEERSTAND] = messages.weerstandsb_ok;
        outputHSPK[INDUCTIEVE] = messages.inductieveb_ok;
        outputHSPK[THERMISCHE] = messages.thermischeb_ok;
        $('#parallelloop-hspk').hide();
        $('#hartophart-hspk').hide();
        $('.step2E').hide();
    } else {
        $('#parallelloop-hspk').show();
        $('#hartophart-hspk').show();
        $('.step2E').show();
        hspkHartOpHartChange();
        hspkParallelloopChange();
        hspkKabelLiggingChange();
    }
    updateOutput("hspk", outputHSPK);
}

function hspkKabelLiggingChange() {
    EvaluateStep2E();
    updateOutput("hspk", outputHSPK);
}

function hspkParallelloopChange() {
    var parallelloop = $('#hspk2').val();
    if (!isValueValid(parallelloop)) {
        outputHSPK[ERRORS] = "<strong>Ongeldige invoer voor Parallelloop</strong><br>";
        updateOutput("hspk", outputHSPK);
        return;
    }
    var hartophart = $('#hspk3').val();
    if (!isValueValid(hartophart)) {
        outputHSPK[ERRORS] = "<strong>Ongeldige invoer voor Hart-op-hart</strong><br>";
        updateOutput("hspk", outputHSPK);
        return;
    }
    outputHSPK[ERRORS] = undefined;
}
function hspkHartOpHartChange() {
    var hartophart = $('#hspk3').val();
    if (!isValueValid(hartophart)) {
        outputHSPK[ERRORS] = "<strong>Ongeldige invoer voor Hart-op-hart</strong><br>";
    } else {
        if (hartophart < 10) {
            outputHSPK[THERMISCHE] = messages.thermischeb_nok;
            outputHSPK[THERMISCHE] += "<em>Toelichting: opwarming.</em><br>";
            outputHSPK[THERMISCHE] += Step3II();
        } else {
            outputHSPK[THERMISCHE] = messages.thermischeb_ok;
        }
        if (hartophart < 30) {
            outputHSPK[WEERSTAND] = messages.weerstandsb_nok;
            outputHSPK[WEERSTAND] = "<em>Toelichting: overbruggigsspanning, aanraakspanning en doorslag.</em><br>";
            // stap 2D        
            $('.step2D').show();
            EvaluateStep2D();
        } else {
            outputHSPK[WEERSTAND] = messages.weerstandsb_ok;
            $('.step2D').hide();
        }
        var parallelloop = $('#hspk2').val();
        if (!isValueValid(parallelloop)) {
            outputHSPK[ERRORS] = "<strong>Ongeldige invoer voor Parallelloop</strong><br>";
        } else {
            EvaluateStep2E();
            outputHSPK[ERRORS] = undefined;
        }
    }
    updateOutput("hspk", outputHSPK);
}

function hspkAfstandTotAardingChange() {
    EvaluateStep2D();
}
function EvaluateStep2D() {
    var afstandTotAarding = $('#hspk4').val();
    if (!isValueValid(afstandTotAarding)) {
        outputHSPK[ERRORS] = "<em>Ongeldige invoer voor Aarding kabelsysteem.</em><br>";
        updateOutput("hspk", outputHSPK);
        return;
    }
    outputHSPK[ERRORS] = undefined;
    if (afstandTotAarding < 30) {
        outputHSPK[WEERSTAND] = messages.weerstandsb_nok;
        outputHSPK[WEERSTAND] += "<em>Toelichting: overbruggingsspanning, aanraakspanning en doorslag.</em>";
        outputHSPK[WEERSTAND] += Step3VIII();
    }
    else {
        outputHSPK[WEERSTAND] = messages.weerstandsb_ok;
    }
    updateOutput("hspk", outputHSPK);
}

function EvaluateStep2E() {
    var hartophart = $('#hspk3').val();
    if (!isValueValid(hartophart)) {
        outputHSPK[ERRORS] = "<strong>Ongeldige invoer voor Hart-op-hart</strong><br>";
        updateOutput("hspk", outputHSPK);
        return;
    }
    var parallelloop = $('#hspk2').val();
    if (!isValueValid(parallelloop)) {
        outputHSPK[ERRORS] = "<strong>Ongeldige invoer voor Parallelloop</strong><br>";
        updateOutput("hspk", outputHSPK);
        return;
    }

    outputHSPK[ERRORS] = undefined;
    var ligging = $('#hspk5').find('option:selected');
    var kabel = {
        k1: {
            normaal: ligging.data("k1normaal"),
            corrosie: ligging.data("k1corrosie"),
            eenfasekortsluiting: ligging.data("k1eenfasekortsluiting"),
            onderhoud: ligging.data("k1onderhoud")
        },
        k2: {
            normaal: ligging.data("k2normaal"),
            corrosie: ligging.data("k2corrosie"),
            eenfasekortsluiting: ligging.data("k2eenfasekortsluiting"),
            onderhoud: ligging.data("k2onderhoud")
        }
    };

    var ucnormaal = UnityCheck(parallelloop, hartophart, kabel.k1.normaal, kabel.k2.normaal);
    var uccorrosie = UnityCheck(parallelloop, hartophart, kabel.k1.corrosie, kabel.k2.corrosie);
    var uceenfasekortsluiting = UnityCheck(parallelloop, hartophart, kabel.k1.eenfasekortsluiting, kabel.k2.eenfasekortsluiting);
    var uconderhoud = UnityCheck(parallelloop, hartophart, kabel.k1.onderhoud, kabel.k2.onderhoud);
    if (ucnormaal < 1 && uccorrosie < 1 && uceenfasekortsluiting < 1 && uconderhoud < 1) {
        outputHSPK[INDUCTIEVE] = messages.inductieveb_ok;
    }
    else {
        outputHSPK[INDUCTIEVE] = messages.inductieveb_nok;
        if (uccorrosie >= 1) {
            outputHSPK[INDUCTIEVE] += '<em>Toelichting: wisselstroomcorrosie. Treed in overleg</em><br>';
        }
        else {
            outputHSPK[INDUCTIEVE] += '<em>Toelichting: aanraakspanning. Treed in overleg</em><br>';
        }
        outputHSPK[INDUCTIEVE] += Step3VII();
    }
}
function Step3II() {
    var outputValues = '<br>'
        + 'Thermische be&iuml;nvloeding HSP-kabel<br>'
        + '<ol>'
        + '<li>Voor nieuwe kabels: bereken via NEN-IEC 60287</li>'
        + '<li>Voor bestaande systemen: voer een verificatie (meting/berekening) uit</li>'
        + '</ol>';
    return outputValues;
}
// ********************** HSP Kabel - einde *****************************
// ********************** HSP Station - start *****************************
// ********************** HSP Station - einde *****************************
// ********************** TEV Systeem - start *****************************
// ********************** TEV Systeem - einde *****************************

// ********************** Algemene functies - start *****************************
function updateOutput(outputType, outputArray) {
    var values = $('#outputvalues-' + outputType);
    values.empty();
    var index;
    for (index = 0; index < outputArray.length; index++) {
        if (outputArray[index] != undefined) {
            values.append(outputArray[index]);
        }
    }
}

function UnityCheck(_l, _a, _k1, _k2) {
    // Formule van Petersburgconsultants
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
    $("#mastdata").html('<ul style="list-style-type:none"'
        + "<li><strong>K1 normaal:</strong> " + $(img).data('k1normaal') + "</li>"
        + "<li><strong>K2 normaal:</strong> " + $(img).data('k2normaal') + "</li>"
        + "<li><strong>K1 corrosie:</strong> " + $(img).data('k1corrosie') + "</li>"
        + "<li><strong>K2 corrosie:</strong> " + $(img).data('k2corrosie') + "</li>"
        + "<li><strong>K1 eenfase:</strong> " + $(img).data('k1eenfasekortsluiting') + "</li>"
        + "<li><strong>K2 eenfase:</strong> " + $(img).data('k2eenfasekortsluiting') + "</li>"
        + "<li><strong>K1 onderhoud:</strong> " + $(img).data('k1onderhoud') + "</li>"
        + "<li><strong>K2 onderhoud:</strong> " + $(img).data('k2onderhoud') + "</li>"
        + "<li><strong>Hoogte:</strong> " + $(img).data('hoogte') + "</li>"
        + "</ul>");
    $("#myModal1").modal('hide');
    // is hartop hartafstand < 58.9, dan stap 2 A
    // stap2A
    if ($('#hspl3').val() < 58.9) {
        EvaluateStep2A();
    }
    // stap2C
    if ($('#hspl1').val() !== 'Ja') {
        EvaluateStep2C();
    }
    updateOutput("hspl", outputHSPL);
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

function isValueValid(value) {
    if (value === undefined || value == null || value == '') {
        return false;
    }
    return true;
}// ********************** Algemene functies - einde *****************************

function EvaluateHSPkStep1() {
}

function EvaluateHSPsStep1() {
}

function EvaluateTEVStep1() {
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
function Step3VII() {
    var outputValues = '<br>'
        + 'Inductieve be&iuml;nvloeding<br>'
        + '<ol>'
        + '<li>Controleer ingevulde gegevens</li>'
        + '<li>Bepaal juiste K1 en K2 waarde</li>'
        + '</ol>';
    return outputValues;
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
