document.addEventListener('DOMContentLoaded', () => {
    const nicknameInput = document.getElementById('nickname');
    const selectGameBtn = document.getElementById('select-game-btn');
    const gameSelection = document.getElementById('game-selection');
    const gameArea = document.getElementById('game-area');
    const results = document.getElementById('results');
    const resultsList = document.getElementById('results-list');

    let timerInterval;
    let startTime;

    selectGameBtn.addEventListener('click', () => {
        if (nicknameInput.value.trim() === '') {
            alert('Пожалуйста, введите ник!');
            return;
        }

        gameSelection.style.display = 'block';
        selectGameBtn.style.display = 'none'; 
        nicknameInput.style.display = 'none'; 
    });
    
function createObstacles(count) {
    for (let i = 0; i < count; i++) {
        const obstacle = document.createElement('div');
        obstacle.className = 'obstacle';
        obstacle.style.top = `${Math.random() * 300 + 20}px`;
        obstacle.style.left = `${Math.random() * 500}px`;
        gameArea.appendChild(obstacle);
    }
}


function startTimer(seconds) {
    startTime = Date.now();
    const timerDisplay = document.getElementById('timer');

    timerInterval = setInterval(() => {
        const elapsed = Math.round((Date.now() - startTime) / 100) / 10;
        const remaining = (seconds - elapsed).toFixed(1);
        timerDisplay.textContent = `Время: ${remaining} сек.`;

        if (remaining <= 0) {
            clearInterval(timerInterval);
            alert('Время вышло!');
            resetGame();
        }
    }, 100);
}

function resetGame() {
    clearInterval(timerInterval); // Останавливаем таймер
    gameOver = false; 
    gameArea.innerHTML = '';
    playerPosition = null;
    path = []; 
    gameArea.style.display = 'none'; 
    gameSelection.style.display = 'block'; 
}




function addResult(score) {
    const li = document.createElement('li');
    li.textContent = `${nicknameInput.value.trim()}: ${score} очков`;
    resultsList.appendChild(li);
    results.style.display = 'block';
}

// Начать игру "Кривая"

document.getElementById('start-curve-game').addEventListener('click', () => {
    startCurveGame();
});

function startCurveGame() {
    gameSelection.style.display = 'none';
    gameArea.style.display = 'block';
    gameArea.innerHTML = '<div id="timer">Время: 0 сек.</div><canvas id="gameCanvas"></canvas>'; 

    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    canvas.width = gameArea.offsetWidth;
    canvas.height = gameArea.offsetHeight;

    const startTime = Date.now(); 
    let timeLeft = 15;
    let isDragging = false;
    let path = generatePath(canvas.width, canvas.height); 
    let playerPosition = { x: path[0].x, y: path[0].y };
    let gameOver = false; 

    drawPath();
    drawPlayer();
    
    function generatePath(width, height) {
        const path = [];
        const startX = 50;
        const startY = height / 2;
        const endX = width - 50;
        const endY = height / 2;
        const numPoints = 20;

        path.push({ x: startX, y: startY });

        for (let i = 1; i < numPoints - 1; i++) {
            const x = startX + (endX - startX) * (i / (numPoints - 1));
            const y = startY + (Math.random() - 0.5) * height / 3; // Рандомная высота
            path.push({ x: x, y: y });
        }

        path.push({ x: endX, y: endY });
        return path;
    }

    function drawPath() {
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(path[0].x, path[0].y);
        for (let i = 1; i < path.length; i++) {
            ctx.lineTo(path[i].x, path[i].y);
        }
        ctx.stroke();
    }

    function drawPlayer() {
        ctx.fillStyle = 'red';
        ctx.beginPath();
        ctx.arc(playerPosition.x, playerPosition.y, 10, 0, 2 * Math.PI);
        ctx.fill();
    }

    function checkWin() {
        const distanceToTarget = Math.sqrt(
            (playerPosition.x - path[path.length - 1].x) ** 2 + 
            (playerPosition.y - path[path.length - 1].y) ** 2
        );
    
        if (distanceToTarget < 20 && !gameOver) { // Проверяем, что игра еще не завершена
            const timeTaken = (Date.now() - startTime) / 1000;
            const score = Math.max(0, timeLeft * 10); // Убедитесь, что timeLeft корректен
            gameOver = true; // Завершаем игру, чтобы цикл не продолжался
            
            alert(`Вы выиграли! Ваш результат: ${score} очков. Время: ${timeTaken.toFixed(1)} сек.`);
            addResult(score); // Добавляем результат
            setTimeout(resetGame, 100); // Перезагружаем игру
        }
    }
    

    


    function checkLose() {
        if (gameOver) return;

        let lose = true;

        for (let i = 0; i < path.length - 1; i++) {
            const dist = distanceToSegment(path[i], path[i + 1], playerPosition);
            if (dist <= 10) {
                lose = false;
                break; 
            }
        }

        if (lose) {
            const score = -15;
            alert(`Вы проиграли! Ваш результат: ${score} очков`);
            addResult(score);
            gameOver = true; 
            setTimeout(resetGame, 100);
        }
    }

    // Функция для вычисления расстояния от точки до сегмента линии
    function distanceToSegment(lineStart, lineEnd, point) {
        const lineLength = Math.sqrt((lineEnd.x - lineStart.x) ** 2 + (lineEnd.y - lineStart.y) ** 2);
        if (lineLength === 0) return Math.sqrt((point.x - lineStart.x) ** 2 + (point.y - lineStart.y) ** 2);

        const t = ((point.x - lineStart.x) * (lineEnd.x - lineStart.x) + (point.y - lineStart.y) * (lineEnd.y - lineStart.y)) / (lineLength ** 2);

        const projection = {
            x: lineStart.x + t * (lineEnd.x - lineStart.x),
            y: lineStart.y + t * (lineEnd.y - lineStart.y)
        };

        const dist = Math.sqrt((point.x - projection.x) ** 2 + (point.y - projection.y) ** 2);
        return dist;
    }

    function gameLoop() {
        if (gameOver) return; 
        ctx.clearRect(0, 0, canvas.width, canvas.height); 

        drawPath();
        drawPlayer();
        checkLose();
        checkWin(); 
        if (isDragging && !gameOver) {
            requestAnimationFrame(gameLoop);
        }
    }

    canvas.addEventListener('mousedown', (e) => {
        if (gameOver) return; 
        isDragging = true;
        gameLoop();
    });

    canvas.addEventListener('mousemove', (e) => {
        if (gameOver) return; 
        if (isDragging) {
            const rect = canvas.getBoundingClientRect();
            playerPosition = { x: e.clientX - rect.left, y: e.clientY - rect.top};
        }
    });

    document.addEventListener('mouseup', () => {
        if (gameOver) return; 
        isDragging = false;
    });

    startTimer(15); 
}


//123 123ыфв  123 12 ывф 321 123 

 // Игра "Мышка"
 document.getElementById('start-mouse-game').addEventListener('click', () => {
    startMouseGame();
});
 function startMouseGame() {
    gameSelection.style.display = 'none';
    gameArea.style.display = 'block';
    gameArea.innerHTML = '<div id="timer">Время: 0 сек.</div>'; 

    const house = document.createElement('div');
    house.id = 'house';
    house.style.top = '20px';
    house.style.left = '20px';
    gameArea.appendChild(house);

    const hole = document.createElement('div');
    hole.id = 'hole';
    hole.style.top = '300px';
    hole.style.left = '520px';
    gameArea.appendChild(hole);

    const mouse = document.createElement('div');
    mouse.id = 'mouse';
    gameArea.appendChild(mouse);

    createObstacles(5);

    let isDragging = false;

    house.addEventListener('click', () => {
        mouse.style.display = 'block';
        mouse.style.top = `${parseInt(house.style.top) + 10}px`;
        mouse.style.left = `${parseInt(house.style.left) + 10}px`;
        startTimer(5); 
    });

    mouse.addEventListener('mousedown', () => (isDragging = true));
    document.addEventListener('mouseup', () => (isDragging = false));
    document.addEventListener('mousemove', (e) => {
        if (isDragging) {
            const rect = gameArea.getBoundingClientRect();
            const x = e.clientX - rect.left - 15;
            const y = e.clientY - rect.top - 15;
            mouse.style.left = `${x}px`;
            mouse.style.top = `${y}px`;

            checkCollision(mouse);
            checkWin(mouse, hole);
        }
    });

    animateMovingObjects(house, hole);
}

function animateMovingObjects(house, hole) {
    let houseDirection = 1;
    let holeDirection = -1;

    setInterval(() => {
        const houseTop = parseInt(house.style.top);
        const holeTop = parseInt(hole.style.top);

        if (houseTop <= 0 || houseTop >= 350) houseDirection *= -1;
        if (holeTop <= 0 || holeTop >= 350) holeDirection *= -1;

        house.style.top = `${houseTop + houseDirection * 5}px`;
        hole.style.top = `${holeTop + holeDirection * 5}px`;
    }, 100);
}

function checkCollision(mouse) {
    const rect1 = mouse.getBoundingClientRect();
    const obstacles = document.querySelectorAll('.obstacle');
    obstacles.forEach((obstacle) => {
        const rect2 = obstacle.getBoundingClientRect();
        if (
            rect1.left < rect2.right &&
            rect1.right > rect2.left &&
            rect1.top < rect2.bottom &&
            rect1.bottom > rect2.top
        ) {
            const score = -15;
            alert('Вы врезались в препятствие!');
            resetGame();
        }
    });
}

function checkWin(mouse, hole) {
    const rect1 = mouse.getBoundingClientRect();
    const rect2 = hole.getBoundingClientRect();
    if (
        rect1.left < rect2.right &&
        rect1.right > rect2.left &&
        rect1.top < rect2.bottom &&
        rect1.bottom > rect2.top
    ) {
        const timeTaken = Math.round((Date.now() - startTime) / 100) / 10;
        const score = Math.round((4 - timeTaken) * 10);
        alert(`Вы выиграли! Ваш результат: ${score} очков`);
        addResult(score);
        resetGame();
    }
}

  // Игра "Лампочка"

  document.getElementById('start-lamp-game').addEventListener('click', () => {
    startLampGame();
});
function startLampGame() {
    gameSelection.style.display = 'none';
    gameArea.style.display = 'block';
    gameArea.innerHTML = '<div id="timer">Игра началась!</div>'; 

    const lamp = document.createElement('img');
    lamp.id = 'lamp';
    lamp.src = 'lamp_off.png';
    gameArea.appendChild(lamp);

    let isOn = false;
    let onTime = 0;

    const interval = setInterval(() => {
        if (!isOn) {
            lamp.src = 'lamp_on.png';
            isOn = true;
            onTime = Math.random() * (3 - 1) + 1; 
            setTimeout(() => {
                lamp.src = 'lamp_off.png';
                isOn = false;
                clearInterval(interval);
                showInputForTime(onTime);
            }, onTime * 1000);
        }
    }, Math.random() * (5000 - 2000) + 2000);
}

function showInputForTime(onTime) {
    const inputWrapper = document.createElement('div');
    inputWrapper.id = 'input-wrapper';
    inputWrapper.innerHTML = `Введите время горения лампочки (с точностью до 0.1): <input type="number" step="0.1" id="time-input"> <button id="submit-time">Отправить</button>`;
    gameArea.appendChild(inputWrapper);

    document.getElementById('submit-time').addEventListener('click', () => {
        const userTime = parseFloat(document.getElementById('time-input').value);
        const score = Math.round((userTime - onTime) * 5 * 10) / 10;
        alert(`Ваш результат: ${score} очков`);
        addResult(score);
        resetGame();
    });
}
    
});
