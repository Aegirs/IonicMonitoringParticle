// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic','btford.socket-io', 'starter.controllers','starter.services'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
})

.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider

  .state('app', {
    url: "/app",
    abstract: true,
    templateUrl: "templates/menu.html",
    controller: 'AppCtrl'
  })

  .state('app.projects', {
    url: "/projects",
    views: {
      'menuContent': {
        templateUrl: "templates/projects.html",
        controller:'ProjectsCtrl'
      }
    }
  })

  .state('app.home', {
    url: "/home",
    cache: false,
    views: {
      'menuContent': {
        templateUrl: "templates/home.html",
        controller: 'HomeCtrl'
      }
    }
  })
  .state('app.settings', {
    url: "/settings",
    views: {
      'menuContent': {
        templateUrl: "templates/settings.html",
        controller: 'SettingsCtrl'
      }
    }
  })
  .state('app.cores', {
    cache: false,
    url: "/cores",
    views: {
      'menuContent': {
        templateUrl: "templates/cores.html",
        controller: 'CoresCtrl'
      }
    }
  })
  .state('app.core', {
    url: "/cores/:coreId",
    views: {
      'menuContent': {
        templateUrl: "templates/core.html",
        controller: 'CoreCtrl'
      }
    }
  })
  .state('app.function', {
    cache: false,
    url: "/cores/:coreId/function/:function",
    views: {
      'menuContent': {
        templateUrl: "templates/function.html",
        controller: 'FunctionCtrl'
      }
    }
  })
  .state('app.variable', {
    cache: false,
    url: "/cores/:coreId/variable/:variable",
    views: {
      'menuContent': {
        templateUrl: "templates/variable.html",
        controller: 'VariableCtrl'
      }
    }
  })

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/home');
});
