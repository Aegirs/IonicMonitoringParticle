/**
 * Created by mazurkiewicz on 26/02/15.
 */

angular.module('starter.services',['base64'])
.factory('CloudRequest', function ($http,$base64,$rootScope,Token,Storage) {
    return {
      connectionCloud: connectionCloud,
      listCores: listCores,
      infodevice: infodevice,
      sendData: sendData
    };

    function connectionCloud(infoConnection) {
      $rootScope.connectCloud = "button button-energized icon ion-settings";

      return $http({
        method: 'GET',
        url: "https://api.particle.io/v1/access_tokens" ,
        headers: {'Authorization': 'Basic ' + $base64.encode(Token.idConnection(infoConnection)) }
      }).success(function(tokens){
        Token.update(tokens,infoConnection);
        $rootScope.connectCloud = "button button-balanced icon ion-settings";
      }).error(function(err) {
        console.log(err);
        $rootScope.connectCloud = "button button-assertive icon ion-settings";
      });
    }

    function listCores() {
      $rootScope.connectCloud = "button button-energized icon ion-settings";
      var token = Token.get();

      return $http.get('https://api.particle.io/v1/devices?access_token=' + token).success(function(cores) {
        angular.forEach(cores,function(core) {
          Storage.set("core" + core.id,JSON.stringify(core));
        });
        $rootScope.connectCloud = "button button-balanced icon ion-settings";
      }).error(function(err) {
        angular.forEach(Storage.listItem("core"),function(core) {
          core.connected = false;
          Storage.set("core" + core.id,JSON.stringify(core));
        });
        console.log(err);
        $rootScope.connectCloud = "button button-assertive icon ion-settings";
      });
    }

    function infodevice(core,params) {
      $rootScope.connectCloud = "button button-energized icon ion-settings";
      var token = Token.get();
      var subString = core;

      if ( angular.isDefined(params) ) {
        subString += "/" + params;
      }

      return $http.get('https://api.particle.io/v1/devices/' + subString +'?access_token=' + token)
      .success(function(res){
        $rootScope.connectCloud = "button button-balanced icon ion-settings";
      })
      .error(function(err){
        $rootScope.connectCloud = "button button-assertive icon ion-settings";
      });
    }

    function sendData(core,functionName,args) {
      $rootScope.connectCloud = "button button-energized icon ion-settings";

      var token = Token.get();
      return $http({
        method: 'POST',
        url: "https://api.particle.io/v1/devices/" + core + "/" + functionName + '?access_token=' + token ,
        data: "&args=" + args,
        headers: {'Content-Type': 'application/x-www-form-urlencoded'}
      }).success(function(data){
        $rootScope.connectCloud = "button button-balanced icon ion-settings";
      }).error(function(err) {
        $rootScope.connectCloud = "button button-assertive icon ion-settings";
        console.log(err);
      });
    }
        /* $scope.$on('$destroy', function () {
         socket.unsyncUpdates('token');
         });*/
})
.factory('Storage', function() {
  return {
    get: get,
    set: set,
    unset: unset,
    listItem: listItem,
    clearAll: clearAll
  };

  function get(key) {
    return localStorage.getItem(key);
  }

  function set(key, value) {
    return localStorage.setItem(key, value);
  }

  function unset(key) {
    return localStorage.removeItem(key);
  }

  function listItem(begin) {
    var res = [];

    for(var i = 0 ; i < localStorage.length;i++) {
      var key = localStorage.key(i);
      console.log("Key: " + key);
      if( angular.isDefined(begin) ) {
        if ( key.substring(0,begin.length) == begin ) {
          res.push(JSON.parse(get(key)));
        }
      }
      else {
        res.push(JSON.parse(get(key)));
      }
    }

    return res;
  }

  function clearAll() {
    localStorage.clear();
  }

})
.factory('Token',function($http,$base64,$rootScope,Storage) {
  return {
    idConnection: idConnection,
    get: get,
    create: create,
    test: test,
    update: update,
    delete: deleteToken,
    convertDate:convertDate,
    expires_in_about:expires_in_about
  };

  function dataConnection(infoConnection) {
    return  "grant_type=password" +
      "&username=" + infoConnection.username + "&password=" + infoConnection.password;
  }
  function idConnection(infoConnection) {
    return infoConnection.username + ":" + infoConnection.password;
  }

  function get() {
    var tokenJson = JSON.parse(Storage.get("token"));
    var token = null;

    if ( tokenJson != null ) {
        token = tokenJson.token;
    }
    return token;
  }

  function create(infoConnection) {
    $rootScope.connectCloud = "button button-energized icon ion-settings";

    return $http({
      method: 'POST',
      url: "https://api.particle.io/oauth/token",
      headers: {'Content-Type': 'application/x-www-form-urlencoded','Authorization': 'Basic ' + $base64.encode('spark:spark')},
      data:  dataConnection(infoConnection)
    }).error(function(err) {
      $rootScope.connectCloud = "button button-assertive icon ion-settings";
      console.log(err);
    });
  }

  function deleteToken(idConnect,token) {
    $rootScope.connectCloud = "button button-energized icon ion-settings";

    return $http({
      method: 'DELETE',
      url: "https://api.particle.io/v1/access_tokens/" + token.token,
      headers: {'Authorization': 'Basic ' + $base64.encode(idConnect)}
    }).success(function (data) {
      $rootScope.connectCloud = "button button-balanced icon ion-settings";
      console.log(token);
      Storage.unset("token" + token);
    }).error(function (err) {
      $rootScope.connectCloud = "button button-assertive icon ion-settings";
      console.log(err);
    });
  }

  function test() {
    $rootScope.connectCloud = "button button-energized icon ion-settings";

    var token = get();
    return $http.get('https://api.particle.io/v1/devices/?access_token=' + token)
    .success(function(data) {
      $rootScope.connectCloud = "button button-balanced icon ion-settings";
    }).error(function (err) {
      $rootScope.connectCloud = "button button-assertive icon ion-settings";
      console.log(err);
    });;
  }

  function parseToken(token) {
    var expires_at = new Date() + new Date(token.expires_in);
    return {token:token.access_token,expires_at:expires_at.toString(),client:""}
  }

  function update(tokens,infoConnection) {

    var valid = false;

    angular.forEach(tokens ,function(token){
      var expires_in = new Date(token.expires_at) - new Date();
      if ( expires_in < 0 ) {
        deleteToken(idConnection(infoConnection),token.token);
      }
      else if ( !valid ){
        valid = true;
        Storage.set("token",JSON.stringify(token) );
        console.log(token);
      }
    });

    if ( !valid ) {
      create(infoConnection).success(function(newToken) {
        Storage.set("token",JSON.stringify(parseToken(newToken)));
      });
    }
  }

  function convertDate(date) {
    var minutes = Math.floor(date/1000/60);
    var hours = Math.floor(minutes/60);
    var days = Math.floor(hours/24);
    var months = Math.floor(days/30);
    var years = Math.floor(months/12);

    minutes -= 60*hours;
    hours -= 24*days;
    days -= 30*months;
    months -= 12*years;

    return {"minutes":minutes, "hours":hours, "days":days,"months":months,"years":years};
  }

  function expires_res(value,name) {
    if ( value > 1 ) {
      return value + name + "s";
    }
    else {
      return value + name;
    }
  }
  function expires_in_about(date) {
    var convert = convertDate(date - new Date());
    var res = "expires in about ";

    if ( convert.years > 0 ) {
      res += expires_res(convert.years," year");
    }
    else if ( convert.months > 0 ) {
      res += expires_res(convert.months," month");
    }
    else if ( convert.days > 0 ) {
      res += expires_res(convert.days," day");
    }
    else if ( convert.minutes > 0 ) {
      res += expires_res(convert.minutes," minute");
    }
    else {
      res = "expires soon";
    }

    return res;
  }
})
.factory('socket', function ($http,$rootScope,socketFactory) {
  myIoSocket = io.connect('http://192.168.1.39:23');
  mySocket = socketFactory({
    ioSocket: myIoSocket
  });

  mySocket.forward('connect');

  return mySocket;
});;
