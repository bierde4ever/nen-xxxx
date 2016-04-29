(function () {
    'use strict';

    angular
        .module('nenkb')
        .controller('HspsController', HspsController);

    HspsController.$inject = ['step3', '$uibModal', '$log', 'functionLibrary'];
    function HspsController(step3, $uibModal, $log, functionLibrary) {
        var vm = this;

        vm.currentStep = "1";
        vm.capacitieveBeinvloeding = false;
        vm.mechanischeBeinvloeding = true;
        vm.weerstandsBeinvloeding = false;
        vm.inductieveBeinvloeding = false;
        vm.thermischeBeinvloeding = true;
        vm.leidinggeisoleerd = true;
        vm.afstandtothekwerk = null;
        vm.omtrekhekwerk = null;
        vm.parallelloop = null;

        var stack = new Array();

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


        vm.steps = [
            {
                step: "1",
                template: "views/hsps.1.html"
            },
            {
                step: "1.1",
                template: "views/hsps.1.1.html"
            },
            {
                step: "1.2",
                template: "views/hsps.1.1.html"
            },
            {
                step: "1.2F",
                template: "views/hsps.1.2F.html"
            },
            {
                step: "1.2G",
                template: "views/hsps.1.2G.html"
            },
            {
                step: "9",
                template: "views/hsps.9.html"
            }
        ];

        vm.getStepTemplate = function () {
            for (var i = 0; i < vm.steps.length; i++) {
                if (vm.currentStep == vm.steps[i].step) {
                    return vm.steps[i].template;
                }
            }
        };
        vm.getPreviousStepTemplate = function () {
            vm.currentStep = stack.pop();
        };

        vm.evaluateStep = function () {
            if (vm.currentStep == "1") {
                evaluateStep1();
                return;
            }
            if (vm.currentStep == "1.1") {
                evaluateStep11();
                return;
            }
            if (vm.currentStep == "1.2") {
                evaluateStep12();
                return;
            }
            if (vm.currentStep == "1.2F") {
                evaluateStep12F();
                return;
            }

            //Bepaal Petersburg
            if (vm.currentStep == "1.2G") {
                evaluateStep12G();
                return;
            }
        }


        activate();

        ////////////////

        function activate() {
            $log.info('Activated Hsps View');
        }

        function evaluateStep1() {
            if (vm.leidinggeisoleerd) {
                vm.weerstandsBeinvloeding = true;
                vm.inductieveBeinvloeding = true;
                vm.currentStep = "1.1";
            }
            else {
                vm.weerstandsBeinvloeding = false;
                vm.inductieveBeinvloeding = false;
                vm.capacitieveBeinvloeding = true;
                vm.currentStep = "1.2";
            }
            stack.push("1");
        }

        function evaluateStep11() {
            if (vm.afstandtothekwerk < 25) {
                vm.capacitieveBeinvloeding = false;
                vm.capacitieveToelichting = step3.III();
            }
            else {
                vm.capacitieveBeinvloeding = true;
                vm.capacitieveToelichting = null;
            }
            vm.currentStep = "9";
            stack.push("1.1");
        }

        function evaluateStep12() {
            if (vm.afstandtothekwerk < 500) {
                vm.weerstandsBeinvloeding = false;
                vm.currentStep = "1.2F"
            }
            else {
                vm.weerstandsBeinvloeding = true;
                vm.weerstandsToelichting = null;
                vm.currentStep = "1.2G"
            }
            stack.push("1.2");
        }

        function evaluateStep12F() {
            if (vm.afstandtothekwerk < 0.5 * vm.omtrekhekwerk) {
                vm.weerstandsBeinvloeding = false;
                vm.weerstandsToelichting = step3.IX();
            }
            else {
                vm.weerstandsBeinvloeding = true;
                vm.weerstandsToelichting = null;
            }
            vm.currentStep = "1.2G"
            stack.push("1.2F");
        }

        function evaluateStep12G() {
            if (functionLibrary.PetersBurg(station, vm.parallelloop, vm.afstandtothekwerk)) {
                vm.inductieveBeinvloeding = true;
                vm.inductieveToelichting = null;
            }
            else {
                vm.inductieveBeinvloeding = false;
                vm.inductieveToelichting = step3.VII();
            }
            vm.currentStep = "9";
            stack.push("1.2G")
        }
    }
})();