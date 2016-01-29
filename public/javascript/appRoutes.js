/**
 * Created by sarah.maroon on 12/23/2015.
 */
(function(){
    var app = angular.module("appRoutes",[]);
    app.config(function($routeProvider){
        $routeProvider
            .when("/main", {
                templateUrl: "../view/html/main.html"
            })
            .when("/about", {
                templateUrl: "../view/html/about.html"
            })
            .when("/blog", {
                templateUrl: "../view/html/blog.html",
                controller: "blogController"
            })
            .when("/contact", {
                templateUrl: "../view/html/contact.html",
                controller: "contactController"
            })
            .otherwise({redirectTo:"/main"});

    });

}());