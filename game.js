await import('https://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.0/jquery.min.js');
let main = () => (function () {
    $("body").html("");
    var CSS = {
        arena: {
            width: 900,
            height: 600,
            background: '#62247B',
            position: 'fixed',
            top: '50%',
            left: '50%',
            zIndex: '999',
            transform: 'translate(-50%, -50%)'
        },
        ball: {
            width: 15,
            height: 15,
            position: 'absolute',
            top: 0,
            left: 444,
            borderRadius: 50,
            background: '#C6A62F'
        },
        line: {
            width: 0,
            height: 600,
            borderLeft: '2px dashed #C6A62F',
            position: 'absolute',
            top: 0,
            left: '50%'
        },
        stick: {
            width: 12,
            height: 85,
            position: 'absolute',
            background: '#C6A62F'
        },
        stick1: {
            left: 0,
            top: 150
        },
        stick2: {
            right: 0,
            top: 150
        },
        startGame: {
            color: 'white',
            fontSize: 18,
            top: '10%',
            left: '25%',
            position: 'absolute',
            fontFamily: 'sans-serif',
            zIndex: '1001',
            fontWeight: 'bold'
        }
    };

    var CONSTS = {
    	gameSpeed: 20,
        score1: 0,
        score2: 0,
        stick1Speed: 0,
        stick2Speed: 0,
        ballTopSpeed: 0,
        ballLeftSpeed: 0,
        isStarted: 0
    };

    function start() {
        draw();
        setEvents();
        loop();
    }

    function draw() {
        if(!CONSTS.isStarted) {
            $('<div><button onclick="showResults()" id="results">Sonuçları Gör</button></div>').appendTo('body');
        }
        $('<div/>', {id: 'pong-game'}).css(CSS.arena).appendTo('body');
        $('<div/>', {id: 'pong-line'}).css(CSS.line).appendTo('#pong-game');
        $('<div/>', {id: 'pong-ball'}).css(CSS.ball).appendTo('#pong-game');
        $('<div/>', {id: 'stick-1'}).css($.extend(CSS.stick1, CSS.stick)).appendTo('#pong-game');
        $('<div/>', {id: 'stick-2'}).css($.extend(CSS.stick2, CSS.stick)).appendTo('#pong-game');
        $('<div id="start-game">OYUNU BASLATMAK ICIN ENTER TUSUNA BAS!</div>').css(CSS.startGame).appendTo("#pong-game");
        $("#results").css("fontSize", '24px');
    }

    function setEvents() {
        $(document).on('keydown', function (e) {
            if (e.keyCode == 87) {
                CONSTS.stick1Speed = $('#stick-1').position().top <= 0 ? 0 : -5;
            }
            if (e.keyCode == 83) {
                CONSTS.stick1Speed = $('#stick-1').position().top >= (CSS.arena.height - CSS.stick1.height) ? 0 : 5;
            }
            if (e.keyCode == 38) {
                CONSTS.stick2Speed = $('#stick-2').position().top <= 0 ? 0 : -5;
            }
            if (e.keyCode == 40) {
                CONSTS.stick2Speed = $('#stick-2').position().top >= (CSS.arena.height - CSS.stick1.height) ? 0 : 5;
            }
            if (e.keyCode == 13) {
                if (!CONSTS.isStarted) {
                    $('#start-game').remove();
                    $(`<div id="scoreBoard"><div id="leftScore">${CONSTS.score1}</div><div id="rightScore">${CONSTS.score2}</div></div>`).appendTo('#pong-game');
                    $('#scoreBoard').css({display: 'flex', justifyContent: 'center'});
                    $('#scoreBoard > div').css({padding: '25px', fontSize: '45px', fontWeight: '900', fontFamily: 'sans-serif', color: 'white'})
                    roll();
                    CONSTS.isStarted = 1
                }
            }
        });

        $(document).on('keyup', function (e) {
            CONSTS.stick1Speed = e.keyCode == 87 || e.keyCode == 83 ? 0 : CONSTS.stick1Speed;
            CONSTS.stick2Speed = e.keyCode == 38 || e.keyCode == 40 ? 0 : CONSTS.stick2Speed; 
        });
    }

    function loop() {
        window.pongLoop = setInterval(function () {
            // Stick1 
            CSS.stick1.top += CONSTS.stick1Speed;
            CONSTS.stick1Speed = CSS.stick1.top <= 0 || CSS.stick1.top >= (CSS.arena.height - CSS.stick1.height) ? CONSTS.stick1Speed *= -1 : CONSTS.stick1Speed;
            $('#stick-1').css('top', CSS.stick1.top);
            // Stick 2
            CSS.stick2.top += CONSTS.stick2Speed;
            CONSTS.stick2Speed = CSS.stick2.top <= 0 || CSS.stick2.top >= (CSS.arena.height - CSS.stick2.height) ? CONSTS.stick2Speed *= -1 : CONSTS.stick2Speed;
            $('#stick-2').css('top', CSS.stick2.top);



            CSS.ball.top += CONSTS.ballTopSpeed;
            CSS.ball.left += CONSTS.ballLeftSpeed;

            if (CSS.ball.top <= 0 ||
                CSS.ball.top >= CSS.arena.height - CSS.ball.height) {
                CONSTS.ballTopSpeed = CONSTS.ballTopSpeed * -1;
            }

            $('#pong-ball').css({top: CSS.ball.top,left: CSS.ball.left});
            if (CSS.ball.left <= CSS.stick.width) {
            	CSS.ball.top > CSS.stick1.top && CSS.ball.top < CSS.stick1.top + CSS.stick.height && (CONSTS.ballLeftSpeed = CONSTS.ballLeftSpeed * -1) || roll("rightsGoal");
            }
            if (CSS.ball.left >= CSS.arena.width - CSS.ball.width - CSS.stick.width) {
                CSS.ball.top > CSS.stick2.top && CSS.ball.top < CSS.stick2.top + CSS.stick.height && (CONSTS.ballLeftSpeed = CONSTS.ballLeftSpeed * -1) || roll("leftsGoal");
            }
        }, CONSTS.gameSpeed);
    }

    function gameOver() {
        const newResult = {  
            leftTeam: CONSTS.score1,
            rightTeam: CONSTS.score2
        };
        let localStorageData = JSON.parse(localStorage.getItem("matchResults"));
        if (localStorageData != null) {
            localStorageData[localStorageData.length] = newResult;
            localStorage.setItem("matchResults", JSON.stringify(localStorageData));
        }
        else {
            let newList = [newResult];
            localStorage.setItem("matchResults", JSON.stringify(newList));
        }
        location.reload();
    }

    function roll(event) {
        event == "leftsGoal" ? $('#leftScore').html(++CONSTS.score1) : event == "rightsGoal" ? $('#rightScore').html(++CONSTS.score2) : null;
        if(CONSTS.score1 == 5 || CONSTS.score2 == 5) {
            return gameOver();
        }
        CSS.ball.top = Math.floor(Math.random() * CSS.arena.height);
        CSS.ball.left = 444;

        var side = -1;

        if (Math.random() < 0.5) {
            side = 1;
        }

        CONSTS.ballTopSpeed = Math.random() * -2 - 3;
        CONSTS.ballLeftSpeed = side * (Math.random() * 2 + 3);
    }

    start();
})();

function showResults() {
    $("body").html('<div><button onclick="main()" id="results">Geri Dön</button></div><table class="table"><thead class="thead-dark"><tr><th>Sol Takım</th><th>Sağ Takım</th></tr></thead><tbody></tbody></table>');
    let localStorageData = JSON.parse(localStorage.getItem("matchResults"));
    if (localStorageData != null) {
        localStorageData.forEach(element => {
            $(`<tr><td>${element.leftTeam}</td><td>${element.rightTeam}</td></tr>`).appendTo('tbody');
        });
    }
}
main();