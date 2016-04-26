(function() {
'use strict';

    angular
        .module('nenkb')
        .controller('TevController', TevController);

    TevController.$inject = ['mastbeelden', 'step3', '$uibModal', '$log'];
    function TevController(mastbeelden, step3, $uibModal, $log) {
        var vm = this;
        

        activate();

        ////////////////

        function activate() { }
    }
})();