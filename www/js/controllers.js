angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope,$rootScope,Token) {
  Token.test();
})

.controller('HomeCtrl', function($scope, $stateParams,$rootScope) {
  $scope.homeTitle = '<i class="icon ion-home" />';
})

.controller('SettingsCtrl', function($scope, $stateParams,$rootScope,CloudRequest,Storage,Token) {
  $scope.loginData = {};
  $scope.token = null;

  function updateTokens() {
    var json = JSON.parse(Storage.get("token"));
    if ( json != null ) {
      $scope.expires_in = Token.expires_in_about(new Date(json.expires_at));
    }
    $scope.token = json;
  }

  $scope.doLogin = function() {
    CloudRequest.connectionCloud($scope.loginData).success(function(res) {
        $rootScope.username = $scope.loginData.username;
        updateTokens();
    });
  };

  $scope.logOut = function() {
    Storage.unset("token");
    $rootScope.connectCloud = "button button-assertive icon ion-settings";
    updateTokens();
  }

  updateTokens();
})

.controller('CoresCtrl', function($scope, $stateParams,$rootScope,CloudRequest,Storage) {
  $scope.infoConnect = {};
  $scope.cores = [];

  $scope.coresTitle = '<img src="img/spark-icon-color.png" style="width:14px;height:14px" />'

  $scope.doRefresh = function() {

    CloudRequest.listCores().success(function(cores){
      $scope.cores = cores;
    })
    .error(function(err){
      $scope.cores = Storage.listItem("core");
    }).finally(function(){
      $scope.$broadcast('scroll.refreshComplete');
    });
  }

  $scope.deleteCore = function(coreId) {
    Storage.unset("core"+coreId);
    $scope.cores = Storage.listItem("core");
  }

  $scope.doRefresh();

})

.controller('CoreCtrl', function($scope, $stateParams,$rootScope,CloudRequest,Storage) {
  $scope.infoConnect = {};
  $scope.coresTitle = '<img src="img/spark-icon-color.png" style="width:14px;height:14px" />'
  $scope.unWindVar = false;
  $scope.unWindFunc = false;
  $scope.core = JSON.parse(Storage.get("core" + $stateParams.coreId));

  $scope.doRefresh = function() {
    CloudRequest.infodevice($scope.core.name).success(function(info){
      $scope.functions = info.functions;
      $scope.variables = info.variables;

      var number = 0;
      angular.forEach($scope.variables,function(type,key){
        number++;
      });

      $scope.nbFuncs = info.functions != null ? info.functions.length : 0;
      $scope.nbVars = number;

    })
    .error(function(err){
      $scope.functions = [];
      $scope.variables = [];
      $scope.nbFuncs = 0;
      $scope.nbVars = 0;
    })
    .finally(function() {
      $scope.$broadcast('scroll.refreshComplete');
    });
  }

  $scope.doRefresh();
  console.log($scope.core);
})
.controller('FunctionCtrl', function($scope, $stateParams,$rootScope,CloudRequest) {
  $scope.function = $stateParams.function;
  $scope.args = {};

  var core = $stateParams.coreId;
  $scope.sendData = function() {
    CloudRequest.sendData(core,$scope.function,$scope.args.value).success(function(data){
      $scope.result = data.return_value;
    });
  }

})
.controller('VariableCtrl', function($scope, $stateParams,$rootScope,CloudRequest) {
  $scope.variable = $stateParams.variable;
  $scope.coreId = $stateParams.coreId;

  CloudRequest.infodevice($stateParams.coreId,$stateParams.variable).success(function(data){
    console.log(data);
    $scope.var = data.result;
  });

})
.controller('ProjectsCtrl', function($scope,$q, $stateParams,$rootScope) {
  $scope.infoConnect = {};
  $rootScope.loginData =  $scope.loginData;

  $scope.projectsTitle = '<i class="icon ion-beer" />'

  // Let's imagine this is really an asynchronous function
function async(value) {
    var deferred = $q.defer();
    var asyncCalculation = value / 2;
    deferred.resolve(asyncCalculation);
    return deferred.promise;
}

var promise = async()
    .then(function() {
        $rootScope.connectCloud = "button button-energized icon ion-settings";
    })
    .then(function() {
      $rootScope.connectCloud = "button button-balanced icon ion-settings";
    });

  promise.then(function(x) {
      console.log(x);
  });
});
