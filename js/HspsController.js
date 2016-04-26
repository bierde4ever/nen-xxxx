(function() {
'use strict';

    angular
        .module('nenkb')
        .controller('HspsController', HspsController);

    HspsController.$inject = ['mastbeelden', 'step3', '$uibModal', '$log'];
    function HspsController(mastbeelden, step3, $uibModal, $log) {
        var vm = this;
        

        activate();

        ////////////////

        function activate() {
            $log.info('Activated Hsps View');
         }
    }
})();