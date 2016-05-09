(function () {
    'use strict';

    angular
        .module('nenkb')
        .controller('TevController', TevController);

    TevController.$inject = ['step3', '$uibModal', '$log', 'functionLibrary'];
    function TevController(step3, $uibModal, $log, functionLibrary) {
        var vm = this;

        vm.isolatie = {
            iso01: { value: true, text: "Ja" },
            iso02: { value: false, text: "Nee" }
        }

        vm.currentStep = "1";
        vm.capacitieveBeinvloeding = false;
        vm.mechanischeBeinvloeding = true;
        vm.weerstandsBeinvloeding = false;
        vm.inductieveBeinvloeding = false;
        vm.thermischeBeinvloeding = true;
        vm.leidinggeisoleerd = vm.isolatie.iso01;
        vm.hartophart = null;
        vm.parallelloop = null;

        var stack = new Array();

        vm.tevsystemen = [
            {
                code: 'T01',
                name: "TEV Betuweroute (incl. Rotterdamse Havenspoorlijn)",
                k1: {
                    normaal: 0.191,
                    corrosie: 0.033,
                    eenfasekortsluiting: 0.006,
                    onderhoud: 0
                },
                k2: {
                    normaal: 1445,
                    corrosie: 1445,
                    eenfasekortsluiting: 1445,
                    onderhoud: 0
                }
            },
            {
                code: 'T02',
                name: "TEV HSL-Zuid Noordelijke tak (Hoofddorp - Rotterdam)",
                k1: {
                    normaal: 0.108,
                    corrosie: 0.024,
                    eenfasekortsluiting: 0.015,
                    onderhoud: 0
                },
                k2: {
                    normaal: 1318,
                    corrosie: 1318,
                    eenfasekortsluiting: 1318,
                    onderhoud: 383
                }
            },
            {
                code: 'T03',
                name: "TEV HSL-Zuid Zuidelijke tak (Barendrecht - Belgische grens)",
                k1: {
                    normaal: 0.205,
                    corrosie: 0.034,
                    eenfasekortsluiting: 0.010,
                    onderhoud: 0.043
                },
                k2: {
                    normaal: 1230,
                    corrosie: 1230,
                    eenfasekortsluiting: 1230,
                    onderhoud: 0
                }
            }
        ];

        vm.tevsysteem = vm.tevsystemen[0];

        vm.steps = [
            {
                step: "1",
                template: "views/tev.1.html"
            },
            {
                step: "1.1",
                template: "views/tev.1.1.html"
            },
            {
                step: "2.1",
                template: "views/tev.2.1.html"
            },
            {
                step: "2.2H",
                template: "views/tev.2.2H.html"
            },
            {
                step: "9",
                template: "views/tev.9.html"
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
            if (vm.currentStep == "2.1") {
                evaluateStep21();
                return;
            }
            //Bepaal Petersburg
            if (vm.currentStep == "2.2H") {
                evaluateStep22H();
                return;
            }
        }

        activate();

        ////////////////

        function activate() { }

        function evaluateStep1() {
            if (vm.leidinggeisoleerd.value) {
                vm.weerstandsBeinvloeding = true;
                vm.inductieveBeinvloeding = true;
                vm.currentStep = "1.1";
            }
            else {
                vm.weerstandsBeinvloeding = false;
                vm.inductieveBeinvloeding = false;
                vm.capacitieveBeinvloeding = true;
                vm.currentStep = "2.1";
            }
            stack.push("1");
        }

        function evaluateStep11() {
            if (vm.hartophart < 10 && vm.parallelloop >= 1) {
                vm.capacitieveBeinvloeding = false;
                vm.capacitieveToelichting = step3.IV();
            }
            else {
                vm.capacitieveBeinvloeding = true;
                vm.capacitieveToelichting = null;
            }
            vm.currentStep = "9";
            stack.push("1.1");
        }
        
        function evaluateStep21() {
            if (vm.hartophart < 13) {
                vm.weerstandsBeinvloeding = false;
                vm.weerstandsToelichting = step3.V();
            }
            else {
                vm.weerstandsBeinvloeding = true;
                vm.weerstandsToelichting = null;
            }
            vm.currentStep = "2.2H";
            stack.push("2.1");
        }
        
        function evaluateStep22H(){
            if (functionLibrary.PetersBurgTev(vm.tevsysteem, vm.parallelloop, vm.hartophart)) {
                vm.inductieveBeinvloeding = true;
                vm.inductieveToelichting = null;
            }
            else {
                vm.inductieveBeinvloeding = false;
                vm.inductieveToelichting = step3.VII();
            }
            vm.currentStep = "9";
            stack.push("2.2H")
        }


    }
})();