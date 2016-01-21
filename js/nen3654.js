$(document).ready(function () {
    LoadJSON();
    // $('#myModal1').on('show.bs.modal', function (e) {
    //     alert($(e.relatedTarget).data('l1'));
    // });
    // $('#placeholder img').on('click', function(){
    // $('#myModal1').modal('toggle', $(this))
    //         selectMastbeeld(this);
    //     });
});


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
        for (var i in data.mastbeelden) {
            output += '<div class="col-xs-12">';
            output += '<img src="' + data.mastbeelden[i].imagesrc
            + '" class="img-responsive"'
            + ' data-code="' + data.mastbeelden[i].code + '"'
            + ' data-k1="' + data.mastbeelden[i].k1.normaal + '"'
            + ' data-k2="' + data.mastbeelden[i].k2.normaal + '"'
            + ' data-k1normaal="' + data.mastbeelden[i].k1.normaal + '"'
            + ' data-k2normaal="' + data.mastbeelden[i].k2.normaal + '"'
            + ' data-k1corrosie="' + data.mastbeelden[i].k1.corrosie + '"'
            + ' data-k2corrosie="' + data.mastbeelden[i].k2.corrosie + '"'
            + ' data-k1eenfasekortsluiting="' + data.mastbeelden[i].k1.eenfasekortsluiting + '"'
            + ' data-k2eenfasekortsluiting="' + data.mastbeelden[i].k2.eenfasekortsluiting + '"'
            + ' data-k1onderhoud="' + data.mastbeelden[i].k1.onderhoud + '"'
            + ' data-k2onderhoud="' + data.mastbeelden[i].k2.onderhoud + '"'
            + ' data-hoogte="' + data.mastbeelden[i].hoogte + '"'
            + ' width="300" onClick="selectMast(this)">';
            output += '</div>';
        }
        $('#placeholder').html(output);
        //document.getElementById("placeholder").innerHTML = output;
    });
}

function selectMast(img) {
    var image = $('#myImage');
    $(img).attr("id", "myImage");
    image.replaceWith(img);
    $('#k1').html($(img).data('k1'));
    $('#k1').data('k1', $(img).data('k1'));
    $('#k2').html($(img).data('k2'));
    $('#k2').data('k2', $(img).data('k2'));
    $('.step2A2').show();
    $("#myModal1").modal('hide');
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

    $('#outputValues').empty();
    $('#outputValues').append(messages.thermischeb_ok);
    if (isolated == 'Ja') {
        $(".step2Totaal").hide();
        //$(".step2C").hide();
        $('#outputValues').append(messages.weerstandsb_ok);
        $('#outputValues').append(messages.inductieveb_ok);
        CheckCapacitieveHSPlijn(distance2);
        CheckMechanischHSPlijn(distance2);
    }
    else {
        $('#outputValues').append(messages.capacitieveb_ok);
        CheckWeerstandHSPlijn(distance2);
        CheckInductieveHSPlijn(); // Formules Petersburgconsultants
        CheckMechanischHSPlijn(distance2);
    }
}
function CheckCapacitieveHSPlijn(hartophart) {
    if (hartophart < 50) {
        $('#outputValues').append(messages.capacitieveb_nok);
        $('#outputValues').append("<em>Toelichting: overbruggingsspanning.</em><br>");
        // ga naar stap 3I
        Step3I();
    }
    else {
        $('#outputValues').append(messages.capacitieveb_ok);
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
    // if Formule van Petersburgconsultants < 1 {
    //     $('#outputValues').append(messages.inductieveb_ok);
    // }
    // else{
    //     $('#outputValues').append(messages.inductieveb_nok);
    //     $('#outputValues').append("<em>Toelichting: wisselstroomcorrosie.</em>");
    //     // ga naar stap 2(C)
    // }
}
function CheckMechanischHSPlijn(hartophart) {
    if (hartophart < 58.9) {
        // ga naar stap 2(A)
        if ($(".step2A").is(':visible') && $(".afstandtotmast").is(':visible')) {
            EvaluateStep2A();
        }
        else {
            $('#hspl4').val('');
            $('#myImage').attr('src', '');
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
        $('#myImage').attr('src', '');
        $('#k1').empty();
        $('#k2').empty();
        $('#outputValues').append(messages.mechanischeb_ok);
    }
}

function EvaluateHSPkStep1() {
    var isolated = $('#hspk1').val();
    var distance1 = $('#hspk2').val();
    var distance2 = $('#hspk3').val();

    $('#outputValues').empty();
    if (!isValueValid(distance2)) {
        $('#outputValues').append("Ongeldige invoer");
    }
    else {
        $('#outputValues').append(messages.capacitieveb_ok);
        $('#outputValues').append(messages.mechanischeb_ok);
        if (isolated == 'Ja') {
            $(".step2D").hide();
            //$(".step2E").hide();
            $('#outputValues').append(messages.weerstandsb_ok);
            $('#outputValues').append(messages.inductieveb_ok);
            $('#outputValues').append(messages.thermischeb_ok);
        }
        else {
            CheckThermischHSPkabel(distance2);
            CheckWeerstandHSPkabel(distance2);
            CheckInductieveHSPkabel();          // Formule Petersburgconsultants
        }
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

function EvaluateStep2A() {
    var afstandTotMast = $('#hspl4').val();
    var hoogteMast = $('#myImage').data("hoogte");
    if (!isValueValid(afstandTotMast) || !isValueValid(hoogteMast)) {
        $('#outputValues').append("Ongeldige invoer");
    }
    else {
        if (afstandTotMast < hoogteMast) {
            $('#outputValues').append(messages.mechanischeb_nok);
            $('#outputValues').append('<em>Toelichting: mechanische beschadiging. Treed in overleg</em><br>');
        }
        else {
            $('#outputValues').append(messages.mechanischeb_ok);
        }
    }
}

function EvaluateStep2B() {
    var afstandTotMast = $('#hspl4').val();
    if (afstandTotMast < 50) {
        $('#outputValues').append(messages.mechanischeb_nok);
        $('#outputValues').append('<em>Toelichting: overbruggingsspanning, aanraakspanning en doorslag</em><br>');
        // ga naar stap 3(VI)
        Step3VI();
    }
    else {
        $('#outputValues').append(messages.mechanischeb_ok);
    }
}

function EvaluateStep2C(parallelloop, hartophart) {
    // Kies type mast uit schema/foto
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
        if(uccorrosie >= 1){
              $('#outputValues').append('<em>Toelichting: wisselstroomcorrosie. Treed in overleg</em><br>');
        }
        else{
              $('#outputValues').append('<em>Toelichting: aanraakspanning. Treed in overleg</em><br>');
        }
        Step3VII();
    }
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
    $('#outputValues').append('<br>');
    $('#outputValues').append('Capacitieve be&iuml;nvloeding HSP-lijn<br>');
    $('#outputValues').append('<ol>');
    $('#outputValues').append('<li>Controleer ingevulde gegevens</li>')
    $('#outputValues').append('<li>Aardingsmethodiek bovengrondse leiding</li>')
    $('#outputValues').append('<li>Spanningsniveau</li>')
    $('#outputValues').append('<li>Geometrie</li>')
    $('#outputValues').append('</ol>');
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
    $('#outputValues').append('<br>');
    $('#outputValues').append('Weerstandsbe&iuml;nvloeding HSP-lijn<br>');
    $('#outputValues').append('<ol>');
    $('#outputValues').append('<li>Controleer ingevulde gegevens</li>')
    $('#outputValues').append('<li>Aarding net</li>')
    $('#outputValues').append('<li>Type bekleding leiding</li>')
    $('#outputValues').append('</ol>');
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