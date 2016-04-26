(function() {
    'use strict';
    
    angular
        .module('nenkb')
        .factory('mastbeelden', mastbeelden);
    
    mastbeelden.$inject = ['$http', 'GLOBALS', '$log'];
    
    function mastbeelden($http, GLOBALS, $log) {
        return {
            getMasten: getMasten
        };
        
        function getMasten() {
            return $http.get(GLOBALS.mastbeeldenUrl)
                .then(getMastbeeldenComplete)
                .catch(getMastbeeldenFailed);
                
            function getMastbeeldenComplete(response){
                $log.info("getMastbeeldenComplete");
                return response.data;
            }
            
            function getMastbeeldenFailed(error) {
                $log.error('XHR failed for getMastbeelden.' + error.data);
            }
        };
    };
} ());