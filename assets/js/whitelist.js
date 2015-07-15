var siteApp = angular.module('whitelistApp', ['ui.bootstrap']);

siteApp.controller('WhitelistController', function($scope,$modal,$http,$interval) {
  $scope.rows = [];
  $scope.blacklist = [];

  $scope.pageSize = 50;
  $scope.currentPage = 50;


  $scope.sort = {
    column: 'last_access',
    descending: true
  };

  $scope.getOrdering = function() {
    return $scope.sort.column;
  };
  $scope.setOrderBy = function(o) {
    if ( o === $scope.sort.column ) {
      $scope.sort.descending = !$scope.sort.descending;
    }
    $scope.sort.column = o;
  };
  $scope.sortingBy = function(o) {
    return $scope.sort.column == o;
  };
  

  $scope.loadRows = function () {
    // Our parameters
    
    $http.get("rest/whitelist")
    .success(function(result) {
      console.log(result);
      $scope.rows = result.rows;
    })
    .error(function(data,status,headers,config) {
      console.log('failure');
      toastr.error ( "Could not contact server" );
    })
    config = { params : {
      "test" : "Foo"
    } }
    
    $http.get( "rest/blacklist", config )
    .success(function(result) {
      console.log(result);
      $scope.blacklist = result.rows;
      $scope.numberOfItems;
    })
    .error(function(data,status,headers,config) {
      console.log('failure');
      toastr.error ( "Could not contact server" );
    })
  }
  // Reload every 5 seconds
  $interval($scope.loadRows, 5000);

  $scope.addSite = function(site,id) {

    var save = function() {
      var c;
      c = $http.post("/rest/whitelist", $scope.site)
      c.success(function() {
        $scope.loadRows();
      }).error(function(data,status,headers,config) {
        toastr.error("Could not save site to server");
      });
    };

    if ( id ) {
      var c = $http.delete("/rest/blacklist/" + id);
      c.success(function(result) { $scope.loadRows(); })
      c.error(function(data,status,headers,config) {
        toastr.error("Could not remove cached item");
      });
    }

    if ( site ) {
      $scope.site = {
        "url" : site
      };
      save();
      return;
    }
    $scope.site = {};
    $modal.open({
      templateUrl: 'site.html',
      scope: $scope,
      controller: function($scope,$modalInstance) {
        console.log("Create Site Modal");
        $scope.save = function() { save(); $modalInstance.dismiss();};
        $scope.close = function() { $modalInstance.dismiss(); };
      }
    });

  }
  $scope.editSite = function(site) {
    $scope.createSite(site);
  };

  $scope.deleteSite = function(site) {
    $modal.open ({
      templateUrl: 'confirm.html',
      scope: $scope,
      controller: function($scope, $modalInstance) {
        $scope.title = "Remove " + site.url + " from whitelist?";
        $scope.ok = function() {
          console.log("Calling delete!");
          $http.delete("rest/whitelist/" + site.id).success(function() {
            console.log("delete success")
            $scope.loadRows();
            $modalInstance.dismiss();
          })
          .error(function(data,status,headers,config) {
            toastr.error("Could not remove " + site.url + " from the list...\n" + data);
          });
        };
        $scope.cancel = function() { $modalInstance.dismiss(); };
      }
    });
  };


  console.log("Loading")
  $scope.loadRows();

});
