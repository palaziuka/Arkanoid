/**
 * Created by Анастасия on 08.01.2017.
 */

"use strict";

(function () {

    angular.module("Arkanoid")
        .service("canvasService", canvasService);

    function canvasService(APP_CONSTANT) {

        this.drawBall = drawBall;
        this.Initialize = Initialize;
        this.getCanvasById = getCanvasById;
        this.drawRectangle = drawRectangle;
        this.clearCanvas = clearCanvas;
        this.showMessage = showMessage;

        let canvas;

        function Initialize() {
            canvas = angular.element(document.querySelector("#playing-field"))[0];
            canvas.height = APP_CONSTANT.CANVAS.height;
            canvas.width = APP_CONSTANT.CANVAS.width;

        }

        function getCanvasById() {
            return canvas;
        }

        function drawRectangle(ctx, x, y, width, height) {
            ctx.beginPath();
            ctx.rect(x, y, width, height);
            ctx.strokeStyle = "white";
            ctx.lineWidth = 1;
            ctx.stroke();
            ctx.closePath();
        }

        function drawBall(ctx, x, y, radius) {
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, 2 * Math.PI, false);
            ctx.lineWidth = 2;
            ctx.strokeStyle = "white";
            ctx.stroke();
            ctx.closePath();
        }

        function clearCanvas(ctx, width, height) {
            ctx.beginPath();
            ctx.fillStyle = "black";
            ctx.fillRect(0,0, width, height);
            ctx.closePath();
        }
        
        function showMessage(ctx, message) {
            ctx.lineWidth = 1;
            ctx.strokeStyle = "white";
            ctx.font = "70px serif";
            ctx.strokeText(message, 350, 450);
        }

    }




})();