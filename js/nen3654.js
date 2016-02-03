$(document).ready(function () {
    LoadJSON();

    initHSPlijn();
    initHSPkabel();
    initHSPstation();
    initTEVsysteem();

    $('#selecteerMast').click(selectMastA);
    $('#hspl1').change(hsplLeidingIsolatieChange);
    $('#hspl2').change(hsplParallelloopChange);
    $('#hspl3').change(hsplHartOpHartChange);
    $('#hspl4').change(hsplAfstandTotMastChange);

    $('#hspk1').change(hspkLeidingIsolatieChange);
    $('#hspk2').change(hspkParallelloopChange);
    $('#hspk3').change(hspkHartOpHartChange);
    $('#hspk4').change(hspkAfstandTotAardingChange);
    $('#hspk5').change(hspkKabelLiggingChange);

    $('#hsps1').change(hspsLeidingIsolatieChange);
    $('#hsps2').change(hspsAfstandParallelleZijdeChange);
    $('#hsps3').change(hspsAfstandTotHekwerkChange);

    $('#tev1').change(tevLeidingIsolatieChange);
    $('#tev2').change(tevParallelloopChange);
    $('#tev3').change(tevHartOpHartChange);
    $('#tev4').change(tevTypeTEVChange);
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
}

function hspkParallelloopChange() {
    EvaluateStep2E();
}
function hspkHartOpHartChange() {
    var hartophart = $('#hspk3').val();
    if (!isValueValid(hartophart)) {
        outputHSPK[ERRORS] = "<strong>Ongeldige invoer voor Hart-op-hart</strong><br>";
        updateOutput("hspk", outputHSPK);
        return;
    }
    outputHSPK[ERRORS] = undefined;
    if (hartophart < 10) {
        outputHSPK[THERMISCHE] = messages.thermischeb_nok;
        outputHSPK[THERMISCHE] += "<em>Toelichting: opwarming.</em><br>";
        outputHSPK[THERMISCHE] += Step3II();
    } else {
        outputHSPK[THERMISCHE] = messages.thermischeb_ok;
    }
    if (hartophart < 30) {
        outputHSPK[WEERSTAND] = messages.weerstandsb_nok;
        outputHSPK[WEERSTAND] += "<em>Toelichting: overbruggingsspanning, aanraakspanning en doorslag.</em><br>";
        // stap 2D        
        $('.step2D').show();
        EvaluateStep2D();
    } else {
        outputHSPK[WEERSTAND] = messages.weerstandsb_ok;
        $('.step2D').hide();
    }
    EvaluateStep2E();
}

function hspkAfstandTotAardingChange() {
    EvaluateStep2D();
    EvaluateStep2E();
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
        outputHSPK[WEERSTAND] += "<em>Toelichting: overbruggingsspanning, aanraakspanning en doorslag.</em><br>";
        outputHSPK[WEERSTAND] += Step3VIII();
    }
    else {
        outputHSPK[WEERSTAND] = messages.weerstandsb_ok;
    }
    updateOutput("hspk", outputHSPK);
}

function EvaluateStep2E() {
    outputHSPK[INDUCTIEVE] = messages.inductieveb_nok;
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
    updateOutput("hspk", outputHSPK);
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

function Step3VIII() {
    var outputValues = '<br>'
        + 'Weerstandsbe&iuml;nvloeding HSP-kabel<br>'
        + '<ol>'
        + '<li>Controleer ingevulde gegevens</li>'
        + '<li>Aarding net</li>'
        + '<li>Type bekleding leiding</li>'
        + '<li>Type isolatie kabelmantels (is het GPLK?)</li>'
        + '</ol>';
    return outputValues;
}
function EvaluateHSPkStep1() {
}
// ********************** HSP Kabel - einde *****************************
// ********************** HSP Station - start *****************************
function initHSPstation() {
    outputHSPS[THERMISCHE] = messages.thermischeb_ok;
    outputHSPS[MECHANISCHE] = messages.mechanischeb_ok;
    hspsLeidingIsolatieChange();
}
function hspsLeidingIsolatieChange() {
    outputHSPS[ERRORS] = undefined;
    outputHSPS[WEERSTAND] = undefined;
    outputHSPS[INDUCTIEVE] = undefined;
    outputHSPS[CAPACITIEVE] = undefined;
    if ($('#hsps1').val() === 'Ja') {
        outputHSPS[WEERSTAND] = messages.weerstandsb_ok;
        outputHSPS[INDUCTIEVE] = messages.inductieveb_ok;
        $("#parallellezijde").hide();
        $('.Step2F').hide();
    } else {
        outputHSPS[CAPACITIEVE] = messages.capacitieveb_ok;
        $("#parallellezijde").show();
        $('.Step2F').show();
    }
    hspsAfstandTotHekwerkChange();
    updateOutput("hsps", outputHSPS);
}

function hspsAfstandParallelleZijdeChange() {
    EvaluateStep2G();
}
function hspsAfstandTotHekwerkChange() {
    var afstandTotHekwerk = $('#hsps3').val();
    if (!isValueValid(afstandTotHekwerk)) {
        outputHSPS[ERRORS] = '<strong>Ongeldige invoer voor Afstand tot hekwerk</strong><br>';
        updateOutput('hsps', outputHSPS);
        return;
    }
    outputHSPS[ERRORS] = undefined;
    if ($('#hsps1').val() === 'Ja') {
        if (afstandTotHekwerk < 25) {
            outputHSPS[CAPACITIEVE] = messages.capacitieveb_nok;
            outputHSPS[CAPACITIEVE] += "<em>Toelichting: overbruggingsspanning</em><br>";
            outputHSPS[CAPACITIEVE] += Step3III();
        } else {
            outputHSPS[CAPACITIEVE] = messages.capacitieveb_ok;
        }
    }
    else {
        if (afstandTotHekwerk < 500) {
            outputHSPS[WEERSTAND] = messages.weerstandsb_nok;
            outputHSPS[WEERSTAND] += "<em>Toelichting: overbruggingsspanning, aanraakspanning en doorslag</em><br>";
            // Stap 2F
            $('.Step2F').show();
            EvaluateStep2F();
        } else {
            outputHSPS[WEERSTAND] = messages.weerstandsb_ok;
            $('.Step2F').hide();
        }
        EvaluateStep2G();
    }
    updateOutput('hsps', outputHSPS);
}

function EvaluateStep2F() {
    var afstandTotHekwerk = $('#hsps3').val();
    var omtrekStation = $('#hsps4').val();
    if (!isValueValid(afstandTotHekwerk)) {
        outputHSPS[ERRORS] = "<strong>Ongeldige invoer voor Afstand tot hekwerk.</strong><br.";
        updateOutput("hsps", outputHSPS);
        return;
    }
    if (afstandTotHekwerk < 0.5 * omtrekStation) {
        outputHSPS[WEERSTAND] = messages.weerstandsb_nok;
        outputHSPS[WEERSTAND] += '<em>Toelichting: overbruggingsspanning, aanraakspanning en doorslag.</em>';
        outputHSPS[WEERSTAND] += Step3IX();
    }
    else {
        outputHSPS[WEERSTAND] = messages.weerstandsb_ok;
    }
    updateOutput('hsps', outputHSPS);
}
function Step3III() {
    var outputValues = '<br>'
        + 'Capacitieve be&iuml;nvloeding HSP-station<br>'
        + '<ol>'
        + '<li>Controleer ingevulde gegevens</li>'
        + '<li>Aardingsmethodiek bovengrondse leiding</li>'
        + '<li>Spaningsniveau</li>'
        + '<li>Type installatie (GIS of openluchtstation)</li>'
        + '</ol>';
    return outputValues;
}
function EvaluateStep2G() {
    outputHSPS[INDUCTIEVE] = messages.inductieveb_nok;
    var afstandParallellezijde = $("#hsps2").val();
    var afstandHekwerk = $("#hsps3").val();

    if (!isValueValid(afstandParallellezijde)) {
        outputHSPS[ERRORS] = "<strong>Ongeldige invoer voor Afstand langste parallelle zijde.</strong><br>";
        updateOutput("hsps", outputHSPS);
        return;
    }
    if (!isValueValid(afstandHekwerk)) {
        outputHSPS[ERRORS] = "<strong>Ongeldige invoer voor Afstand tot hekwerk.</strong><br>";
        updateOutput("hsps", outputHSPS);
        return;
    }
    
    // gebruik K1 en K2 van configuratie L05
    var station = {
        k1: {
            normaal: 8.976,
            corrosie: 3.360,
            eenfasekortsluiting: 5.951,
            onderhoud: 5.984
        },
        k2: {
            normaal: 401,
            corrosie: 403,
            eenfasekortsluiting: 2177,
            onderhoud: 441
        }
    };
    var ucnormaal = UnityCheck(afstandParallellezijde, afstandHekwerk, station.k1.normaal, station.k2.normaal);
    var uccorrosie = UnityCheck(afstandParallellezijde, afstandHekwerk, station.k1.corrosie, station.k2.corrosie);
    var uceenfasekortsluiting = UnityCheck(afstandParallellezijde, afstandHekwerk, station.k1.eenfasekortsluiting, station.k2.eenfasekortsluiting);
    var uconderhoud = UnityCheck(afstandParallellezijde, afstandHekwerk, station.k1.onderhoud, station.k2.onderhoud);
    if (ucnormaal < 1 && uccorrosie < 1 && uceenfasekortsluiting < 1 && uconderhoud < 1) {
        outputHSPS[INDUCTIEVE] = messages.inductieveb_ok;
    }
    else {
        outputHSPS[INDUCTIEVE] = messages.inductieveb_nok;
        if (uccorrosie >= 1) {
            outputHSPS[INDUCTIEVE] += '<em>Toelichting: wisselstroomcorrosie. Treed in overleg</em><br>';
        }
        else {
            outputHSPS[INDUCTIEVE] += '<em>Toelichting: aanraakspanning. Treed in overleg</em><br>';
        }
        outputHSPS[INDUCTIEVE] += Step3VII();
    }

    updateOutput("hsps", outputHSPS);
}

function Step3IX() {
    var outputValues = '<br>'
        + 'Weerstandsbe&iuml;nvloeding HSP-station<br>'
        + '<ol>'
        + '<li>Controleer ingevulde gegevens</li>'
        + '<li>Aarding net</li>'
        + '<li>Type bekleding leiding</li>'
        + '</ol>';
    return outputValues;
}
function EvaluateHSPsStep1() {
}
// ********************** HSP Station - einde *****************************
// ********************** TEV Systeem - start *****************************
function initTEVsysteem() {
    outputTEV[THERMISCHE] = messages.thermischeb_ok;
    outputTEV[MECHANISCHE] = messages.mechanischeb_ok;
    tevLeidingIsolatieChange();
}
function tevLeidingIsolatieChange() {
    outputTEV[ERRORS] = undefined;
    outputTEV[CAPACITIEVE] = undefined;
    outputTEV[WEERSTAND] = undefined;
    outputTEV[INDUCTIEVE] = undefined;

    if ($('#tev1').val() === 'Ja') {
        outputTEV[WEERSTAND] = messages.weerstandsb_ok;
        outputTEV[INDUCTIEVE] = messages.inductieveb_ok;
        $('.step2H').hide();
    } else {
        outputTEV[CAPACITIEVE] = messages.capacitieveb_ok;
        $('.step2H').show();
        tevTypeTEVChange();
    }
    tevParallelloopChange();
    tevHartOpHartChange();
    updateOutput("tev", outputTEV);
}
function tevParallelloopChange() {
    var parallelloop = $("#tev2").val();

    if (!isValueValid(parallelloop)) {
        outputTEV[ERRORS] = "<strong>Ongeldige invoer voor Parallelloop.</strong><br>";
        updateOutput("tev", outputTEV);
        return;
    }
    tevHartOpHartChange();
    if ($('#tev1').val() !== 'Ja') {
        EvaluateStep2H();
    }
}
function tevHartOpHartChange() {
    var hartophart = $("#tev3").val();
    var parallelloop = $("#tev2").val();

    if (!isValueValid(hartophart)) {
        outputTEV[ERRORS] = "<strong>Ongeldige invoer voor Hart-op-hart.</strong><br>";
        updateOutput("tev", outputTEV);
        return;
    }
    outputTEV[ERRORS] = undefined;
    if ($('#tev1').val() === 'Ja') {
        if (hartophart > 10) {
            outputTEV[CAPACITIEVE] = messages.capacitieveb_ok;
        }
        else {
            if (!isValueValid(parallelloop)) {
                outputTEV[ERRORS] = "<strong>Ongeldige invoer voor Parallelloop.</strong><br>";
                updateOutput("tev", outputTEV);
                return;
            }
            if (parallelloop < 1) {
                outputTEV[CAPACITIEVE] = messages.capacitieveb_ok;
            } else {
                outputTEV[CAPACITIEVE] = messages.capacitieveb_nok;
                outputTEV[CAPACITIEVE] += "<em>Toelichting: overbruggingsspanning.</em><br>";
                outputTEV[CAPACITIEVE] += Step3IV();
            }
        }
    } else {
        if (hartophart < 13) {
            outputTEV[WEERSTAND] = messages.weerstandsb_nok;
            outputTEV[WEERSTAND] += "<em>Toelichting: overbruggingsspanning, aansraakspanning en doorslag.</em><br>";
            outputTEV[WEERSTAND] += Step3V();
        } else {
            outputTEV[WEERSTAND] = messages.weerstandsb_ok;
        }
        EvaluateStep2H();
    }
    updateOutput("tev", outputTEV);
}
function tevTypeTEVChange() {
    EvaluateStep2H();
}

function Step3IV() {
    var outputValues = '<br>'
        + 'Capacitieve be&iuml;nvloeding TEV-systeem<br>'
        + '<ol>'
        + '<li>Controleer ingevulde gegevens</li>'
        + '<li>Type systeem: AT-, RT-, ST-systeem</li>'
        + '<li>Geometrie</li>'
        + '<li>Aardingsmethodiek bovengrondse leiding</li>'
        + '<li>Spanningsniveau</li>'
        + '</ol>';
    return outputValues;
}
function Step3V() {
    var outputValues = '<br>'
        + 'Weerstandsbe&iuml;nvloeding TEV-systeem<br>'
        + '<ol>'
        + '<li>Controleer ingevulde gegevens</li>'
        + '<li>Met aardingssysteem verbonden geleidende delen</li>'
        + '</ol>';
    return outputValues;
}
function EvaluateStep2H() {
    outputTEV[INDUCTIEVE] = messages.inductieveb_nok;
    var hartophart = $('#tev3').val();
    if (!isValueValid(hartophart)) {
        outputTEV[ERRORS] = "<strong>Ongeldige invoer voor Hart-op-hart</strong><br>";
        updateOutput("hspk", outputTEV);
        return;
    }
    var parallelloop = $('#tev2').val();
    if (!isValueValid(parallelloop)) {
        outputTEV[ERRORS] = "<strong>Ongeldige invoer voor Parallelloop</strong><br>";
        updateOutput("hspk", outputTEV);
        return;
    }

    outputTEV[ERRORS] = undefined;
    var ligging = $('#tev4').find('option:selected');
    var typeTEV = {
        k1: {
            normaal: ligging.data("k1normaal"),
            corrosie: ligging.data("k1corrosie"),
            eenfasekortsluiting: ligging.data("k1eenfasekortsluiting"),
        },
        k2: {
            normaal: ligging.data("k2normaal"),
            corrosie: ligging.data("k2corrosie"),
            eenfasekortsluiting: ligging.data("k2eenfasekortsluiting"),
        }
    };

    var ucnormaal = UnityCheck(parallelloop, hartophart, typeTEV.k1.normaal, typeTEV.k2.normaal);
    var uccorrosie = UnityCheck(parallelloop, hartophart, typeTEV.k1.corrosie, typeTEV.k2.corrosie);
    var uceenfasekortsluiting = UnityCheck(parallelloop, hartophart, typeTEV.k1.eenfasekortsluiting, typeTEV.k2.eenfasekortsluiting);
    if (ucnormaal < 1 && uccorrosie < 1 && uceenfasekortsluiting < 1) {
        outputTEV[INDUCTIEVE] = messages.inductieveb_ok;
    }
    else {
        outputTEV[INDUCTIEVE] = messages.inductieveb_nok;
        if (uccorrosie >= 1) {
            outputTEV[INDUCTIEVE] += '<em>Toelichting: wisselstroomcorrosie. Treed in overleg</em><br>';
        }
        else {
            outputTEV[INDUCTIEVE] += '<em>Toelichting: aanraakspanning. Treed in overleg</em><br>';
        }
        outputTEV[INDUCTIEVE] += Step3VII();
    }
    updateOutput("tev", outputTEV);
}
function EvaluateTEVStep1() {
}
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
                output += '<div class="col-xs-8">';
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
                output += '<div class="col-xs-4"><p><small>';
                output += 'Geometrie: ' + mastbeeld.geometrie + '<br>';
                output += 'Code: ' + mastbeeld.code + '<br>';
                output += 'Spanning: ' + mastbeeld.spanning + '<br>';
                output += 'Hoogte: ' + mastbeeld.hoogte + '<br>';
                output += 'K1 Normaal: ' + mastbeeld.k1.normaal + '<br>';
                output += 'K2 Normaal: ' + mastbeeld.k2.normaal + '<br>';
                output += 'K1 Corrosie: ' + mastbeeld.k1.corrosie + '<br>';
                output += 'K2 Corrosie: ' + mastbeeld.k2.corrosie + '<br>';
                output += 'K1 Eenfasekortsluiting: ' + mastbeeld.k1.eenfasekortsluiting + '<br>';
                output += 'K2 Eenfasekortsluiting: ' + mastbeeld.k2.eenfasekortsluiting + '<br>';
                output += 'K1 Onderhoud: ' + mastbeeld.k1.onderhoud + '<br>';
                output += 'K1 Onderhoud: ' + mastbeeld.k2.onderhoud + '<br>';
                output += '</small></p></div>';
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
    // $("#mastdata").html('<ul style="list-style-type:none"'
    //     + "<li><strong>K1 normaal:</strong> " + $(img).data('k1normaal') + "</li>"
    //     + "<li><strong>K2 normaal:</strong> " + $(img).data('k2normaal') + "</li>"
    //     + "<li><strong>K1 corrosie:</strong> " + $(img).data('k1corrosie') + "</li>"
    //     + "<li><strong>K2 corrosie:</strong> " + $(img).data('k2corrosie') + "</li>"
    //     + "<li><strong>K1 eenfase:</strong> " + $(img).data('k1eenfasekortsluiting') + "</li>"
    //     + "<li><strong>K2 eenfase:</strong> " + $(img).data('k2eenfasekortsluiting') + "</li>"
    //     + "<li><strong>K1 onderhoud:</strong> " + $(img).data('k1onderhoud') + "</li>"
    //     + "<li><strong>K2 onderhoud:</strong> " + $(img).data('k2onderhoud') + "</li>"
    //     + "<li><strong>Hoogte:</strong> " + $(img).data('hoogte') + "</li>"
    //     + "</ul>");
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
function Step3VII() {
    var outputValues = '<br>'
        + 'Inductieve be&iuml;nvloeding<br>'
        + '<ol>'
        + '<li>Controleer ingevulde gegevens</li>'
        + '<li>Bepaal juiste K1 en K2 waarde</li>'
        + '</ol>';
    return outputValues;
}
