(function () {
    'use strict';

    angular
        .module('nenkb')
        .controller('HspkController', HspkController);

    HspkController.$inject = ['step3', '$uibModal', '$log', 'functionLibrary'];
    function HspkController(step3, $uibModal, $log, functionLibrary) {
        var vm = this;

        vm.currentStep = "1";
        vm.capacitieveBeinvloeding = true;
        vm.mechanischeBeinvloeding = true;
        vm.weerstandsBeinvloeding = false;
        vm.inductieveBeinvloeding = false;
        vm.thermischeBeinvloeding = false;
        vm.leidinggeisoleerd = true;
        vm.hartophart = null;
        vm.parallelloop = null;

        vm.kabelliggingen = [
            {
                code: 'K01',
                name: "Kabel in platvlak - 10-50kV",
                k1: {
                    normaal: 0.248,
                    corrosie: 0.153,
                    eenfasekortsluiting: 19.115,
                    onderhoud: 0.248
                },
                k2: {
                    normaal: 379,
                    corrosie: 379,
                    eenfasekortsluiting: 1296,
                    onderhoud: 379
                }
            },
            {
                code: 'K02',
                name: "Kabel in plat vlak - 150-400 kV",
                k1: {
                    normaal: 0.528,
                    corrosie: 0.330,
                    eenfasekortsluiting: 10.296,
                    onderhoud: 0.528
                },
                k2: {
                    normaal: 383,
                    corrosie: 370,
                    eenfasekortsluiting: 1290,
                    onderhoud: 383
                }
            },
            {
                code: 'K03',
                name: "Kabel in driehoeksligging - 10-50 kV",
                k1: {
                    normaal: 0.043,
                    corrosie: 0.025,
                    eenfasekortsluiting: 19.355,
                    onderhoud: 0.043
                },
                k2: {
                    normaal: 344,
                    corrosie: 400,
                    eenfasekortsluiting: 1276,
                    onderhoud: 344
                }
            },
            {
                code: 'K04',
                name: "Kabel in driehoeksligging - 150-400 kV",
                k1: {
                    normaal: 0.128,
                    corrosie: 0.080,
                    eenfasekortsluiting: 10.388,
                    onderhoud: 0.128
                },
                k2: {
                    normaal: 400,
                    corrosie: 400,
                    eenfasekortsluiting: 1276,
                    onderhoud: 400
                }
            }
        ];

        vm.kabelligging = vm.kabelliggingen[0];

        var stack = new Array();

        vm.steps = [
            {
                step: "1",
                template: "views/hspkstep1.html"
            },
            {
                step: "1.2",
                template: "views/hspkstep12.html"
            },
            {
                step: "1.2D",
                template: "views/hspkstep12D.html"
            },
            {
                step: "1.3",
                template: "views/hspkstep13.html"
            },
            {
                step: "9",
                template: "views/hspkstep9.html"
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
            if (vm.currentStep == "1.2") {
                evaluateStep12();
                return;
            }
            if (vm.currentStep == "1.2D") {
                evaluateStep12D();
                return;
            }

            //Bepaal Petersburg
            if (vm.currentStep == "1.3") {
                evaluateStep13();
                return;
            }
        }

        activate();

        ////////////////

        function activate() {
        }

        function evaluateStep1() {
            if (vm.leidinggeisoleerd) {
                vm.weerstandsBeinvloeding = true;
                vm.inductieveBeinvloeding = true;
                vm.thermischeBeinvloeding = true;
                vm.currentStep = "9";
            }
            else {
                vm.currentStep = "1.2";
            }
            stack.push("1");
        }

        function evaluateStep12() {
            if (vm.hartophart < 10) {
                vm.thermischeBeinvloeding = false;
                vm.thermischeToelichting = step3.II();
            }
            else {
                vm.thermischeBeinvloeding = true;
                vm.thermischeToelichting = null;;
            }
            if (vm.hartophart < 30) {
                vm.weerstandsBeinvloeding = false;
                vm.currentStep = "1.2D";
            }
            else {
                vm.weerstandsBeinvloeding = true;
                vm.weerstandsToelichting = null;
                vm.currentStep = "1.3";
            }
            stack.push("1.2");
        }

        function evaluateStep12D() {
            if (vm.afstandtotaarding < 30) {
                vm.weerstandsBeinvloeding = false;
                vm.weerstandsToelichting = step3.VIII();
            }
            else {
                vm.weerstandsBeinvloeding = true;
                vm.weerstandsToelichting = null;
            }
            vm.currentStep = "1.3";
            stack.push("1.2D");
        }

        function evaluateStep13() {
            if (functionLibrary.PetersBurg(vm.kabelligging, vm.parallelloop, vm.hartophart)) {
                vm.inductieveBeinvloeding = true;
                vm.inductieveToelichting = null;
            }
            else {
                vm.inductieveBeinvloeding = false;
                vm.inductieveToelichting = step3.VII();
            }
            vm.currentStep = "9";
            stack.push("1.3");
        }
    }
})();