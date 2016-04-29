(function () {
    'use strict';

    angular
        .module('nenkb')
        .factory('functionLibrary', functionLibrary);

    function functionLibrary() {
        var service = {
            PetersBurg: PetersBurg,
            PetersBurgTev: PetersBurgTev
        };

        return service;

        ////////////////
        function PetersBurg(mastbeeld, parallelloop, hartophart) {
            var ucnormaal = UnityCheck(parallelloop, hartophart, mastbeeld.k1.normaal, mastbeeld.k2.normaal);
            var uccorrosie = UnityCheck(parallelloop, hartophart, mastbeeld.k1.corrosie, mastbeeld.k2.corrosie);
            var uceenfasekortsluiting = UnityCheck(parallelloop, hartophart, mastbeeld.k1.eenfasekortsluiting, mastbeeld.k2.eenfasekortsluiting);
            var uconderhoud = UnityCheck(parallelloop, hartophart, mastbeeld.k1.onderhoud, mastbeeld.k2.onderhoud);

            return ucnormaal < 1 && uccorrosie < 1 && uceenfasekortsluiting < 1 && uconderhoud < 1;

        }
        function PetersBurgTev(tevsysteem, parallelloop, hartophart) {
            var ucnormaal = UnityCheck(parallelloop, hartophart, tevsysteem.k1.normaal, tevsysteem.k2.normaal);
            var uccorrosie = UnityCheck(parallelloop, hartophart, tevsysteem.k1.corrosie, tevsysteem.k2.corrosie);
            var uceenfasekortsluiting = UnityCheck(parallelloop, hartophart, tevsysteem.k1.eenfasekortsluiting, tevsysteem.k2.eenfasekortsluiting);

            return ucnormaal < 1 && uccorrosie < 1 && uceenfasekortsluiting < 1;
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

    }
})();