angular.module('starter')

.directive("detectFocus", function ($focusChat) {
    return {
        restrict: "A",
        scope: {
            onFocus: '&onFocus',
            onBlur: '&onBlur',
        },
        link: function (scope, elem) {

            elem.on("focus", function () {
                scope.onFocus();
                $focusChat.setFocusOnBlur(true);
            });

            elem.on("blur", function () {
                scope.onBlur();
                if ($focusChat.getFocusOnBlur())
                    elem[0].focus();
            });
        }
    }
})

.directive('focusMe', function($timeout) {
  return {
    link: function(scope, element, attrs) {
        // if (attrs.focusMeDisable === "false") {
        //     if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
        //         window.cordova.plugins.Keyboard.close(); //open keyboard manually
        //     }
        //     return;
        // }

      $timeout(function() {
        element[0].focus();
        if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
            window.cordova.plugins.Keyboard.show(); //open keyboard manually
        }
      });
    }
  };
})