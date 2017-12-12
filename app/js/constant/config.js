/**
 * Created by Анастасия on 08.01.2017.
 */

"use strict";

(function () {
    angular.module("Arkanoid")
        .constant("APP_CONSTANT",
            {
                "CANVAS": {
                    height : 850,
                    width : 850
                },
                "BOARD": {
                    X : 300,
                    Y : 800,
                    height : 10,
                    width : 150,
                    step : 10
                },
                "BALL": {
                    X : 475,
                    Y : 780,
                    deviation : 3,
                    radius : 10
                },
                "BRICKS": {
                    X : 10,
                    Y : 100,
                    height : 20,
                    width : 70,
                    quantityRow : 6,
                    quantityColumn : 10,
                    margin : 14
                },
                "BONUS": {
                    Y : 0,
                    radius : 5,
                    value: 5,
                    step : 1
                }
            }

        );

})();