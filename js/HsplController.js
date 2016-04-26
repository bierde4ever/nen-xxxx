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

        var hsplVariables = {
            hartafstand: 40,
            leidinggeisoleerd: vm.isolatie.iso01,
            capacitievebeinvloeding: false,
            weerstandsbeinvloeding: false,
            inductievebeinvloeding: false,
            thermischebeinvloeding: true,
            mechanischebeinvloeding: false
        }

        vm.afstandTotMast = null;
        vm.parallelloop = null;

        var stack = new Array();

        vm.steps = [
            {
                step: "1",
                template: "views/hsplstep1.html"
            },
            {
                step: "1.1",
                template: "views/hsplstep11.html"
            },
            {
                step: "1.1.1",
                template: "views/hsplstep111.html"
            },
            {
                step: "1.1.2a",
                template: "views/hsplstep112a.html"
            },
            {
                step: "1.2",
                template: "views/hsplstep11.html"
            },
            {
                step: "1.2.1",
                template: "views/hsplstep121.html"
            },
            {
                step: "1.2.2",
                template: "views/hsplstep122.html"
            },
            {
                step: "1.2.2a",
                template: "views/hsplstep112a.html"
            },
            {
                step: "1.2.2b",
                template: "views/hsplstep122b.html"
            },
            {
                step: "1.2.3",
                template: "views/hsplstep11.html"
            },
            {
                step: "1.2.4",
                template: "views/hsplstep124.html"
            },
            {
                step: "9",
                template: "views/hsplstep9.html"
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

        vm.hsplVariables = hsplVariables;
        vm.evaluateStep = function () {
            if (vm.currentStep == "1") {
                if (vm.hsplVariables.leidinggeisoleerd.value) {
                    vm.hsplVariables.weerstandsbeinvloeding = true;
                    vm.hsplVariables.inductievebeinvloeding = true;
                    vm.currentStep = "1.1";
                }
                else {
                    vm.hsplVariables.capacitievebeinvloeding = true;
                    vm.currentStep = "1.2";
                }
                stack.push("1");
                return;
            }
            if (vm.currentStep == "1.1") {
                if (hsplVariables.hartafstand < 50) {
                    hsplVariables.capacitievebeinvloeding = false;
                    vm.hsplVariables.capatoelichting = step3.I();
                    vm.currentStep = "9";
                }
                else {
                    hsplVariables.capacitievebeinvloeding = true;
                    if (hsplVariables.hartafstand < 58.9) {
                        hsplVariables.mechanischebeinvloeding = false;
                        vm.currentStep = "1.1.2a";
                    }
                    else {
                        hsplVariables.mechanischebeinvloeding = true;
                        vm.currentStep = "9";
                    }
                }
                stack.push("1.1");
                return;
            }
            if (vm.currentStep == "1.1.2a") {
                if (vm.afstandTotMast < vm.selectedMastbeeld.hoogte) {
                    vm.hsplVariables.mechanischebeinvloeding = false;
                    vm.hsplVariables.toelichting = "Mechanische beschadiging: Treed in overleg!";
                    vm.currentStep = "9";
                }
                else {
                    vm.hsplVariables.mechanischebeinvloeding = true;
                    vm.currentStep = "9";
                }
                stack.push("1.1.2a");
                return;
            }
            if (vm.currentStep == "1.2") {
                if (hsplVariables.hartafstand < 50) {
                    hsplVariables.weerstandsbeinvloeding = false;
                    vm.currentStep = "1.2.2b";
                }
                else {
                    hsplVariables.weerstandsbeinvloeding = true;
                    vm.currentStep = "1.2.2";
                }
                stack.push("1.2");
                return;
            }
            if (vm.currentStep == "1.2.2b") {
                if (vm.afstandTotMast < 50) {
                    hsplVariables.weerstandsbeinvloeding = false;
                    //toelicht: overbruggingsspanning, aanraakspanning  en doorslag Step3 (VI)
                    vm.hsplVariables.toelichting = step3.VI();
                }
                else {
                    hsplVariables.weerstandsbeinvloeding = true;
                }
                vm.currentStep = "1.2.2";
                stack.push("1.2.2b");
                return;
            }

            // Bepaal Petersburg
            if (vm.currentStep == "1.2.2") {
                if (functionLibrary.PetersBurg(vm.selectedMastbeeld, vm.parallelloop, vm.afstandTotMast)) {
                    hsplVariables.inductievebeinvloeding = true;
                }
                else {
                    hsplVariables.inductievebeinvloeding = false;
                    hsplVariables.toelichting += step3.VII();
                }
                if (hsplVariables.hartafstand < 58.9) {
                    hsplVariables.mechanischebeinvloeding = false;
                    if (vm.afstandTotMast < vm.selectedMastbeeld.hoogte) {
                        vm.hsplVariables.mechanischebeinvloeding = false;
                        vm.hsplVariables.toelichting += "Mechanische beschadiging: Treed in overleg!";
                    }
                    else {
                        vm.hsplVariables.mechanischebeinvloeding = true;
                    }
                }
                else {
                    hsplVariables.mechanischebeinvloeding = true;
                }
                vm.currentStep = "9";
                stack.push("1.2.2");
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

    };
} ());