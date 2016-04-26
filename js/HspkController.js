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
                code: 'K01', k1normaal: 0.248, k2normaal: 379,
                k1corrosie: 0.153, k2corrosie: 379,
                k1eenfasekortsluiting: 19.115,
                k2eenfasekortsluiting: 1296,
                k1onderhoud: 0.248,
                k2onderhoud: 379,
                name: "Kabel in platvlak - 10-50kV"
            },
            {
                code: 'K02', k1normaal: 0.528, k2normaal: 383,
                k1corrosie: 0.330, k2corrosie: 370,
                k1eenfasekortsluiting: 10.296,
                k2eenfasekortsluiting: 1290,
                k1onderhoud: 0.528,
                k2onderhoud: 383,
                name: "Kabel in plat vlak - 150-400 kV"
            },
            {
                code: 'K03', k1normaal: 0.043, k2normaal: 344,
                k1corrosie: 0.025, k2corrosie: 400,
                k1eenfasekortsluiting: 19.355,
                k2eenfasekortsluiting: 1276,
                k1onderhoud: 0.043,
                k2onderhoud: 344,
                name: "Kabel in driehoeksligging - 10-50 kV"
            },
            {
                code: 'K04', k1normaal: 0.128, k2normaal: 400,
                k1corrosie: 0.080, k2corrosie: 400,
                k1eenfasekortsluiting: 10.388,
                k2eenfasekortsluiting: 1276,
                k1onderhoud: 0.128,
                k2onderhoud: 400,
                name: "Kabel in driehoeksligging - 150-400 kV"
            }
        ]
        
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
                return;
            }
            if (vm.currentStep == "1.2") {
                if (vm.hartophart < 10) {
                    vm.thermischeBeinvloeding = false;
                    vm.thermischeToelichting = step3.II();
                }
                else {
                    vm.thermischeBeinvloeding = true;
                }
                if (vm.hartophart < 30) {
                    vm.weerstandsBeinvloeding = false;
                    vm.currentStep = "1.2D"
                }
                else {
                    vm.weerstandsBeinvloeding = true;
                    vm.weerstandsToelichting = null;
                    vm.currentStep = "1.3";
                }
                stack.push("1.2");
                return;
            }
            if (vm.currentStep == "1.2D") {
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
                return;
            }

            //Bepaal Petersburg
            if (vm.currentStep == "1.3") {
                if (functionLibrary.PetersBurgKabel(vm.kabelligging, vm.parallelloop, vm.hartophart)) {
                    vm.inductieveBeinvloeding = true;
                    vm.inductieveToelichting = true;
                }
                else {
                    vm.inductieveBeinvloeding = false;
                    vm.inductieveToelichting = step3.VII();
                }
                vm.currentStep = "9";
                stack.push("1.3")
                return;
            }
        }

        activate();

        ////////////////

        function activate() {
        }
    }
})();