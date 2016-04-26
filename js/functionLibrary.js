(function () {
    'use strict';

    angular
        .module('nenkb')
        .factory('functionLibrary', functionLibrary);

    function functionLibrary() {
        var service = {
            PetersBurg: PetersBurg,
            PetersBurgKabel: PetersBurgKabel
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
        function PetersBurgKabel(kabel, parallelloop, hartophart) {
            var ucnormaal = UnityCheck(parallelloop, hartophart, kabel.k1normaal, kabel.k2normaal);
            var uccorrosie = UnityCheck(parallelloop, hartophart, kabel.k1corrosie, kabel.k2corrosie);
            var uceenfasekortsluiting = UnityCheck(parallelloop, hartophart, kabel.k1eenfasekortsluiting, kabel.k2eenfasekortsluiting);
            var uconderhoud = UnityCheck(parallelloop, hartophart, kabel.k1onderhoud, kabel.k2onderhoud);

            return ucnormaal < 1 && uccorrosie < 1 && uceenfasekortsluiting < 1 && uconderhoud < 1;
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