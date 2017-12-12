/**
 * Created by Анастасия on 08.01.2017.
 */
"use strict";

(function () {
    angular.module("Arkanoid")
        .controller("gameController", controller);

    function controller($scope, canvasService, APP_CONSTANT) {
        let canvas = {}, player = {}, board = {}, ball = {};
        let bricksArray = [], quantityDownedBricks = 0;
        let bonusArray = [], isBonusCreate = false, intervalID;
        let isLostLife = false;
        let isPause = false;
        let isButtonDown = false, pressBtn;
        let requestAnimation;
        let countChangeDeviationCoefficient = 0;

        Initialize();

        $scope.start = function () {
            isLostLife = false;
            if (intervalID) {
                clearInterval(intervalID);
            }
            intervalID = setInterval(createBonuse, 7000);

            if (requestAnimation) {
                window.cancelAnimationFrame(requestAnimation);
            }
            quantityDownedBricks = 0;
            player = {
                score: 0,
                life: 3
            };
            board = {
                X: APP_CONSTANT.BOARD.X,
                Y: APP_CONSTANT.BOARD.Y,
                height: APP_CONSTANT.BOARD.height,
                width: APP_CONSTANT.BOARD.width
            };
            ball = {
                X: APP_CONSTANT.BALL.X,
                Y: APP_CONSTANT.BALL.Y,
                radius: APP_CONSTANT.BALL.radius,
                deviationX: APP_CONSTANT.BALL.deviation,
                deviationY: -APP_CONSTANT.BALL.deviation
            };
            bonusArray = [];
            initializeBricksArray();

            isPause = false;
            requestAnimation = window.requestAnimationFrame(moveBall);

            document.addEventListener("keydown", moveBoard);
            document.addEventListener("keyup", keyReleased)

            $scope.life = player.life;
            $scope.score = player.score;
        };


        function Initialize() {
            canvasService.Initialize();
            canvas.dom = canvasService.getCanvasById();
            canvas.ctx = canvas.dom.getContext("2d");

        }

        function initializeBricksArray() {
            let x = APP_CONSTANT.BRICKS.X;
            let y = APP_CONSTANT.BRICKS.Y;
            for (let i = 0; i < APP_CONSTANT.BRICKS.quantityRow; i++) {
                bricksArray[i] = [];
                y += APP_CONSTANT.BRICKS.margin + APP_CONSTANT.BRICKS.height;
                for (let j = 0; j < APP_CONSTANT.BRICKS.quantityColumn; j++) {
                    bricksArray[i][j] = {
                        X: x,
                        Y: y,
                        isDowned: false
                    };
                    x += APP_CONSTANT.BRICKS.margin + APP_CONSTANT.BRICKS.width;
                }
                x = APP_CONSTANT.BRICKS.X;

            }
        }

        function drawElements() {
            canvasService.clearCanvas(canvas.ctx, canvas.dom.width, canvas.dom.height);
            canvasService.drawBall(canvas.ctx, ball.X, ball.Y, ball.radius);
            canvasService.drawRectangle(canvas.ctx, board.X, board.Y, board.width, board.height);
            if (bonusArray.length > 0) {
                drawBonusArray();
            }
            drawBricksArray();

        }

        function drawBricksArray() {
            for (let i = 0; i < APP_CONSTANT.BRICKS.quantityRow; i++) {
                for (let j = 0; j < APP_CONSTANT.BRICKS.quantityColumn; j++) {
                    let brick = bricksArray[i][j];
                    if (brick.isDowned) continue;
                    canvasService.drawRectangle(canvas.ctx, brick.X, brick.Y, APP_CONSTANT.BRICKS.width, APP_CONSTANT.BRICKS.height);
                }
            }
        }

        function drawBonusArray() {
            for (let i = 0; i < bonusArray.length; i++) {
                let bonus = bonusArray[i];
                canvasService.drawBall(canvas.ctx, bonus.X, bonus.Y, bonus.radius);
                if (bonus.Y + bonus.step + bonus.radius >= board.Y) {
                    if (bonus.X + bonus.radius > board.X
                        && bonus.X - bonus.radius < board.X + board.width) {
                        $scope.score += bonus.value;
                        $scope.$apply();
                    }
                    bonusArray.splice(i, 1);
                }
                bonus.Y += bonus.step;
            }

        }

        function moveBall() {

            checkCollision();

            if (isPause) return;

            ball.X += ball.deviationX;
            ball.Y += ball.deviationY;

            drawElements();

            requestAnimation = window.requestAnimationFrame(moveBall);
        }

        function checkCollision() {
            //collision with walls
            if (ball.Y + ball.deviationY - ball.radius < 0) {
                ball.deviationY = changeDeviation(ball.deviationY);
            }
            if (ball.X + ball.deviationX + ball.radius > canvas.dom.width || ball.X + ball.deviationX - ball.radius < 0) {
                ball.deviationX = changeDeviation(ball.deviationX);
            }


            let coefficientLow = 0.9, coefficientRaise = 1.1;
            //collision with board
            if (ball.Y + ball.radius + ball.deviationY > board.Y) {
                if (ball.X + ball.radius > board.X
                    && ball.X - ball.radius < board.X + board.width) {

                    if (!isLostLife) {

                        let isDeviationPositive = false;
                        if(isButtonDown)
                            ball.deviationX > 0 ? isDeviationPositive = true : isDeviationPositive = false;

                        if (countChangeDeviationCoefficient == 0 && !isButtonDown) {
                            ball.deviationY = changeDeviation(ball.deviationY);
                        }
                        else{
                            if (isDeviationPositive && pressBtn == "left"
                                || !isDeviationPositive && pressBtn == "right"
                                || countChangeDeviationCoefficient < 0) {
                                ball.deviationY = changeDeviation(ball.deviationY, coefficientRaise);
                                ball.deviationX = changeDeviation(ball.deviationX, -coefficientLow);
                                countChangeDeviationCoefficient++;
                            } else
                            {
                                ball.deviationY = changeDeviation(ball.deviationY, coefficientLow);
                                ball.deviationX = changeDeviation(ball.deviationX, -coefficientRaise);
                                countChangeDeviationCoefficient--;
                            }

                        }


                    }

                }
                else {
                    isLostLife = true;
                    if (ball.Y + ball.radius + ball.deviationY > board.Y + board.height)
                        lostLife();
                }
            }

            //collision with bricks
            for (let i = 0; i < APP_CONSTANT.BRICKS.quantityRow; i++) {
                for (let j = 0; j < APP_CONSTANT.BRICKS.quantityColumn; j++) {

                    let brick = bricksArray[i][j];
                    if (brick.isDowned) continue;

                    if (ball.X + ball.radius > brick.X && ball.X - ball.radius < brick.X + APP_CONSTANT.BRICKS.width
                        && ball.Y + ball.radius > brick.Y && ball.Y - ball.radius < brick.Y + APP_CONSTANT.BRICKS.height) {
                        quantityDownedBricks++;
                        ball.deviationY = changeDeviation(ball.deviationY);
                        brick.isDowned = true;
                        $scope.score++;
                        $scope.$apply();
                        if (quantityDownedBricks == APP_CONSTANT.BRICKS.quantityRow * APP_CONSTANT.BRICKS.quantityColumn)
                            finishedGame("WIN!");
                    }


                }
            }
        }

        function changeDeviation(currentDeviation, coefficient = 1) {
            return -currentDeviation * coefficient;
        }

        function lostLife() {
            isLostLife = false;
            board = {
                X: APP_CONSTANT.BOARD.X,
                Y: APP_CONSTANT.BOARD.Y,
                height: APP_CONSTANT.BOARD.height,
                width: APP_CONSTANT.BOARD.width
            };
            ball = {
                X: APP_CONSTANT.BALL.X,
                Y: APP_CONSTANT.BALL.Y,
                radius: APP_CONSTANT.BALL.radius,
                deviationX: APP_CONSTANT.BALL.deviation,
                deviationY: -APP_CONSTANT.BALL.deviation
            };
            $scope.life--;
            $scope.$apply();
            if ($scope.life == 0)
                finishedGame("Lose");
        }

        function moveBoard(e) {
            let keyPress = e.keyCode;
            let step = APP_CONSTANT.BOARD.step;
            if (keyPress == 37)
                if (board.X - step > 0) {
                    board.X -= step;
                    isButtonDown = true;
                    pressBtn = "left";
                }
                else
                    board.X = 4;

            if (keyPress == 39) {
                if (board.X + board.width + step < canvas.dom.width) {
                    board.X += step;
                    isButtonDown = true;
                    pressBtn = "right";
                }
                else {
                    board.X = canvas.dom.width - board.width - 4;
                }
            }

        }

        function keyReleased() {
            isButtonDown = false;
        }

        function createBonuse() {
            isBonusCreate = true;
            let bonus = {
                X: getRandom(APP_CONSTANT.BONUS.radius, canvas.dom.width - APP_CONSTANT.BONUS.radius),
                Y: APP_CONSTANT.BONUS.Y,
                radius: APP_CONSTANT.BONUS.radius,
                step: APP_CONSTANT.BONUS.step,
                value: APP_CONSTANT.BONUS.value
            };
            bonusArray.push(bonus);
        }

        function finishedGame(message) {
            isPause = true;
            clearInterval(intervalID);
            //canvasService.clearCanvas(canvas.ctx, canvas.dom.width, canvas.dom.height);
            canvasService.showMessage(canvas.ctx, message);

        }

        function getRandom(min, max) {
            return Math.random() * (max - min) + min;
        }

    }

})();