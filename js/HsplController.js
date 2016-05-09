/// <reference path="../typings/main.d.ts" />

// an Immediately Invoked Function Expresssion IIFE or "iffy"
(function () {
    angular.module("nenkb")
        .controller('HsplController', HsplController);

    HsplController.$inject = ['mastbeelden', 'step3', '$uibModal', '$log', 'functionLibrary'];
    function HsplController(mastbeelden, step3, $uibModal, $log, functionLibrary) {

        var vm = this;

        vm.currentStep = "1";

        vm.isolatie = {
            iso01: { value: true, text: "Ja" },
            iso02: { value: false, text: "Nee" }
        }

        vm.capacitieveToelichting = null;
        vm.mechanischeToelichting = null;
        vm.weerstandsToelichting = null;
        vm.inductieveToelichting = null;
        vm.thermischeToelichting = null;
        vm.step122b = false;

        vm.hartafstand = null;
        vm.leidinggeisoleerd = vm.isolatie.iso01;
        vm.capacitievebeinvloeding = false;
        vm.weerstandsbeinvloeding = false;
        vm.inductievebeinvloeding = false;
        vm.thermischebeinvloeding=  true;
        vm.mechanischebeinvloeding = false;

        vm.afstandTotMast = null;
        vm.parallelloop = null;

        var stack = new Array();

        vm.steps = [
            {
                step: "1",
                template: "views/hspl.1.html"
            },
            {
                step: "1.1",
                template: "views/hspl.1.1.html"
            },
            {
                step: "1.1.2a",
                template: "views/hspl.1.1.2a.html"
            },
            {
                step: "1.2",
                template: "views/hspl.1.1.html"
            },
            {
                step: "1.2.2",
                template: "views/hspl.1.2.2.html"
            },
            {
                step: "1.2.2b",
                template: "views/hspl.1.2.2b.html"
            },
            {
                step: "9",
                template: "views/hspl.9.html"
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

        vm.animationsEnabled = true;
        vm.open = function (size) {
            var modalInstance = $uibModal.open({
                animation: vm.animationsEnabled,
                templateUrl: '../views/mastbeelden.html',
                controller: 'ModalInstanceCtrl',
                controllerAs: 'inst',
                size: size,
                resolve: {
                    items: function () {
                        return vm.masten;
                    }
                }
            });

            modalInstance.result.then(function (selectedItem) {
                vm.selectedMastbeeld = selectedItem;
            }, function () {
                $log.info('Modal dismissed at: ' + new Date());
            });
        };


        vm.selectedMastbeeld = null;

        vm.evaluateStep = function () {
            if (vm.currentStep == "1") {
                evaluateStep1();
                return;
            }
            if (vm.currentStep == "1.1") {
                evaluateStep11();
                return;
            }
            if (vm.currentStep == "1.1.2a") {
                evaluateStep112a();
                return;
            }
            if (vm.currentStep == "1.2") {
                evaluateStep12();
                return;
            }
            if (vm.currentStep == "1.2.2b") {
                evaluateStep122b();
                return;
            }

            // Bepaal Petersburg
            if (vm.currentStep == "1.2.2") {
                evaluateStep122();
                return;
            }
        };

        activate();

        function activate() {
            return getMasten().then(function () {
                $log.info('Activated Hspl View');
            });
        }

        function getMasten() {
            return mastbeelden.getMasten()
                .then(function (data) {
                    vm.masten = data;
                    return vm.masten;
                })
        }

        function evaluateStep1() {
            if (vm.leidinggeisoleerd.value) {
                vm.weerstandsbeinvloeding = true;
                vm.inductievebeinvloeding = true;
                vm.capacitievebeinvloeding = false;
                vm.currentStep = "1.1";
            }
            else {
                vm.weerstandsbeinvloeding = false;
                vm.inductievebeinvloeding = false;
                vm.capacitievebeinvloeding = true;
                vm.currentStep = "1.2";
            }
            stack.push("1");
        }

        function evaluateStep11() {
            if (vm.hartafstand < 50) {
                vm.capacitievebeinvloeding = false;
                vm.capacitieveToelichting = step3.I();
                vm.currentStep = "9";
            }
            else {
                vm.capacitievebeinvloeding = true;
                vm.capacitieveToelichting = null;
                vm.mechanischeToelichting = null;
                if (vm.hartafstand < 58.9) {
                    vm.mechanischebeinvloeding = false;
                    vm.currentStep = "1.1.2a";
                }
                else {
                    vm.mechanischebeinvloeding = true;
                    vm.currentStep = "9";
                }
            }
            stack.push("1.1");
        }

        function evaluateStep112a() {
            if (vm.afstandTotMast < vm.selectedMastbeeld.hoogte) {
                vm.mechanischebeinvloeding = false;
                vm.mechanischeToelichting = "Mechanische beschadiging: Treed in overleg!";
            }
            else {
                vm.mechanischebeinvloeding = true;
                vm.mechanischeToelichting = null;
            }
            vm.currentStep = "9";
            stack.push("1.1.2a");
        }

        function evaluateStep12() {
            if (vm.hartafstand < 50) {
                vm.weerstandsbeinvloeding = false;
                vm.currentStep = "1.2.2b";
                vm.step122b = true;
            }
            else {
                vm.weerstandsbeinvloeding = true;
                vm.step122b = false;
                vm.currentStep = "1.2.2";
            }
            stack.push("1.2");
        }

        function evaluateStep122b() {
            if (vm.afstandTotMast < 50) {
                vm.weerstandsbeinvloeding = false;
                vm.weerstandsToelichting = step3.VI();
            }
            else {
                vm.weerstandsbeinvloeding = true;
                vm.weerstandsToelichting = null;
            }
            vm.currentStep = "1.2.2";
            stack.push("1.2.2b");
        }

        function evaluateStep122() {
            if (functionLibrary.PetersBurg(vm.selectedMastbeeld, vm.parallelloop, vm.afstandTotMast)) {
                vm.inductievebeinvloeding = true;
                vm.inductieveToelichting = null;
            }
            else {
                vm.inductievebeinvloeding = false;
                vm.inductieveToelichting = step3.VII();
            }
            if (vm.hartafstand < 58.9) {
                vm.mechanischebeinvloeding = false;
                vm.mechanischeToelichting = null;
                if (vm.afstandTotMast < vm.selectedMastbeeld.hoogte) {
                    vm.mechanischebeinvloeding = false;
                    vm.mechanischeToelichting = "Mechanische beschadiging: Treed in overleg!";
                }
                else {
                    vm.mechanischebeinvloeding = true;
                }
            }
            else {
                vm.mechanischebeinvloeding = true;
                vm.mechanischeToelichting = null;
            }
            vm.currentStep = "9";
            stack.push("1.2.2");
        }
    };
} ());