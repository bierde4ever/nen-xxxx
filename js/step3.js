(function () {
    'use strict';

    angular.module('nenkb')
        .factory('step3', step3);

    function step3() {
        var factory = {};
        factory.Ia = function () {
            var outputValues = '<br>'
                + 'Capacitieve be&iuml;nvloeding HSP-lijn<br>'
                + '<ol>'
                + '<li>Controleer ingevulde gegevens</li>'
                + '<li>Aardingsmethodiek bovengrondse leiding</li>'
                + '<li>Spanningsniveau</li>'
                + '<li>Geometrie</li>'
                + '</ol>';
            return outputValues;
        };
        factory.I = function () {
            var outputValues = '<ol>'
                + '<li>Controleer ingevulde gegevens</li>'
                + '<li>Aardingsmethodiek bovengrondse leiding</li>'
                + '<li>Spanningsniveau</li>'
                + '<li>Geometrie</li>'
                + '</ol>';
            return outputValues;
        };

        factory.IIa = function () {
            var outputValues = '<br>'
                + 'Thermische be&iuml;nvloeding HSP-kabel<br>'
                + '<ol>'
                + '<li>Voor nieuwe kabels: bereken via NEN-IEC 60287</li>'
                + '<li>Voor bestaande systemen: voer een verificatie (meting/berekening) uit</li>'
                + '</ol>';
            return outputValues;
        };
        factory.II = function () {
            var outputValues = '<ol>'
                + '<li>Voor nieuwe kabels: bereken via NEN-IEC 60287</li>'
                + '<li>Voor bestaande systemen: voer een verificatie (meting/berekening) uit</li>'
                + '</ol>';
            return outputValues;
        };

        factory.IIIa = function () {
            var outputValues = '<br>'
                + 'Capacitieve be&iuml;nvloeding HSP-station<br>'
                + '<ol>'
                + '<li>Controleer ingevulde gegevens</li>'
                + '<li>Aardingsmethodiek bovengrondse leiding</li>'
                + '<li>Spaningsniveau</li>'
                + '<li>Type installatie (GIS of openluchtstation)</li>'
                + '</ol>';
            return outputValues;
        };

        factory.III = function () {
            var outputValues = '<ol>'
                + '<li>Controleer ingevulde gegevens</li>'
                + '<li>Aardingsmethodiek bovengrondse leiding</li>'
                + '<li>Spaningsniveau</li>'
                + '<li>Type installatie (GIS of openluchtstation)</li>'
                + '</ol>';
            return outputValues;
        };

        factory.IVa = function () {
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
        };

        factory.IV = function () {
            var outputValues = '<ol>'
                + '<li>Controleer ingevulde gegevens</li>'
                + '<li>Type systeem: AT-, RT-, ST-systeem</li>'
                + '<li>Geometrie</li>'
                + '<li>Aardingsmethodiek bovengrondse leiding</li>'
                + '<li>Spanningsniveau</li>'
                + '</ol>';
            return outputValues;
        };

        factory.Va = function () {
            var outputValues = '<br>'
                + 'Weerstandsbe&iuml;nvloeding TEV-systeem<br>'
                + '<ol>'
                + '<li>Controleer ingevulde gegevens</li>'
                + '<li>Met aardingssysteem verbonden geleidende delen</li>'
                + '</ol>';
            return outputValues;
        };
        
        factory.V = function () {
            var outputValues = '<ol>'
                + '<li>Controleer ingevulde gegevens</li>'
                + '<li>Met aardingssysteem verbonden geleidende delen</li>'
                + '</ol>';
            return outputValues;
        };

        factory.VIa = function () {
            var outputValues = '<br>'
                + 'Weerstandsbe&iuml;nvloeding HSP-lijn<br>'
                + '<ol>'
                + '<li>Controleer ingevulde gegevens</li>'
                + '<li>Aarding net</li>'
                + '<li>Type bekleding leiding</li>'
                + '</ol>';
            return outputValues;
        };

        factory.VI = function () {
            var outputValues = '<ol>'
                + '<li>Controleer ingevulde gegevens</li>'
                + '<li>Aarding net</li>'
                + '<li>Type bekleding leiding</li>'
                + '</ol>';
            return outputValues;
        };

        factory.VIIa = function () {
            var outputValues = '<br>'
                + 'Inductieve be&iuml;nvloeding<br>'
                + '<ol>'
                + '<li>Controleer ingevulde gegevens</li>'
                + '<li>Bepaal juiste K1 en K2 waarde</li>'
                + '</ol>';
            return outputValues;
        };

        factory.VII = function () {
            var outputValues = '<ol>'
                + '<li>Controleer ingevulde gegevens</li>'
                + '<li>Bepaal juiste K1 en K2 waarde</li>'
                + '</ol>';
            return outputValues;
        };

        factory.VIIIa = function () {
            var outputValues = '<br>'
                + 'Weerstandsbe&iuml;nvloeding HSP-kabel<br>'
                + '<ol>'
                + '<li>Controleer ingevulde gegevens</li>'
                + '<li>Aarding net</li>'
                + '<li>Type bekleding leiding</li>'
                + '<li>Type isolatie kabelmantels (is het GPLK?)</li>'
                + '</ol>';
            return outputValues;
        };

        factory.VIII = function () {
            var outputValues = '<ol>'
                + '<li>Controleer ingevulde gegevens</li>'
                + '<li>Aarding net</li>'
                + '<li>Type bekleding leiding</li>'
                + '<li>Type isolatie kabelmantels (is het GPLK?)</li>'
                + '</ol>';
            return outputValues;
        };

        factory.IXa = function () {
            var outputValues = '<br>'
                + 'Weerstandsbe&iuml;nvloeding HSP-station<br>'
                + '<ol>'
                + '<li>Controleer ingevulde gegevens</li>'
                + '<li>Aarding net</li>'
                + '<li>Type bekleding leiding</li>'
                + '</ol>';
            return outputValues;
        };

        factory.IX = function () {
            var outputValues = '<ol>'
                + '<li>Controleer ingevulde gegevens</li>'
                + '<li>Aarding net</li>'
                + '<li>Type bekleding leiding</li>'
                + '</ol>';
            return outputValues;
        };

        return factory;
    }
} ());