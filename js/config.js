(function () {
    angular.module('nenkb')
        .config(moduleConfig);

    moduleConfig.$inject = ['$routeProvider'];

    function moduleConfig($routeProvider) {
        $routeProvider
            .when('/', {
                templateUrl: 'views/home.html'
            })
            .when('/hspl', {
                templateUrl: 'views/hspl.html',
                controller: 'HsplController',
                controllerAs: 'hspl'
            })
            .when('/hspk', {
                templateUrl: 'views/hspk.html',
                controller: 'HspkController',
                controllerAs: 'hspk'
            })
            .when('/hsps', {
                templateUrl: 'views/hsps.html',
                controller: 'HspsController',
                controllerAs: 'hsps'
            })
            .when('/tev', {
                templateUrl: 'views/tev.html',
                controller: 'TevController',
                controllerAs: 'tev'
            })
            .otherwise({
                redirectTo: '/'
            })

    };
} ());