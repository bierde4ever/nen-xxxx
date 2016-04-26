(function () {
    angular.module('nenkb')
        .controller('ModalInstanceCtrl', ModalInstanceCtrl);
    // Please note that $uibModalInstance represents a modal window (instance) dependency.
    // It is not the same as the $uibModal service used above.

    ModalInstanceCtrl.$inject = ['$uibModalInstance', 'items'];

    function ModalInstanceCtrl($uibModalInstance, items) {
        var vm = this;

        vm.items = items;
        vm.selected = {
            item: vm.items[0]
        };

        vm.ok = function () {
            $uibModalInstance.close(vm.selected.item);
        };

        vm.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };
    };
} ());