const canvas = document.querySelector('#gameCanvas');
const context = canvas.getContext('2d');
const gridSize = 24;
const cellSize = canvas.width / gridSize;
const maxGrowth = 100;
const initialSnake = [{ x: 7, y: 12 }, { x: 6, y: 12 }, { x: 5, y: 12 }];
let snake = [...initialSnake];
let fruit = { x: 17, y: 12 };
let direction = { x: 1, y: 0 };
let nextDirection = { ...direction };
let score = 0;
let level = 1;
let timer = null;
let playing = false;
let paused = false;
let best = Number(localStorage.getItem('snakeArcadeBest') || 0);

const scoreElement = document.querySelector('#score');
const bestElement = document.querySelector('#bestScore');
const levelElement = document.querySelector('#level');
const speedElement = document.querySelector('#speedLabel');
const statusText = document.querySelector('#statusText');
const overlay = document.querySelector('#overlay');
const overlayKicker = document.querySelector('#overlayKicker');
const overlayTitle = document.querySelector('#overlayTitle');
const overlayMessage = document.querySelector('#overlayMessage');
const startButton = document.querySelector('#startButton');
const pauseButton = document.querySelector('#pauseButton');

function scoreText(value) { return String(value).padStart(2, '0'); }
function updateStats() { scoreElement.textContent = scoreText(score); bestElement.textContent = scoreText(best); levelElement.textContent = scoreText(level); speedElement.textContent = `${4 + Math.floor(level / 2)} FPS`; }
function speed() { return Math.max(180, 1000 / (4 + Math.floor(level / 2))); }
function restartTimer() { clearInterval(timer); timer = setInterval(tick, speed()); }
function placeFruit() { do { fruit = { x: Math.floor(Math.random() * gridSize), y: Math.floor(Math.random() * gridSize) }; } while (snake.some(segment => segment.x === fruit.x && segment.y === fruit.y)); }
function draw() {
  context.fillStyle = '#0a1820'; context.fillRect(0, 0, canvas.width, canvas.height);
  context.strokeStyle = 'rgba(246, 240, 223, .065)'; context.lineWidth = 1;
  for (let line = 1; line < gridSize; line++) { const point = line * cellSize; context.beginPath(); context.moveTo(point, 0); context.lineTo(point, canvas.height); context.stroke(); context.beginPath(); context.moveTo(0, point); context.lineTo(canvas.width, point); context.stroke(); }
  context.fillStyle = '#f48476'; context.beginPath(); context.arc((fruit.x + .5) * cellSize, (fruit.y + .5) * cellSize, cellSize * .34, 0, Math.PI * 2); context.fill();
  snake.forEach((segment, index) => { context.fillStyle = index === 0 ? '#f3cf58' : '#9ce5bb'; const inset = index === 0 ? 2 : 3; context.fillRect(segment.x * cellSize + inset, segment.y * cellSize + inset, cellSize - inset * 2, cellSize - inset * 2); });
}
function tick() {
  direction = nextDirection;
  const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };
  const wallHit = head.x < 0 || head.x >= gridSize || head.y < 0 || head.y >= gridSize;
  const bodyHit = snake.some(segment => segment.x === head.x && segment.y === head.y);
  if (wallHit || bodyHit) { endGame(); return; }
  snake.unshift(head);
  if (head.x === fruit.x && head.y === fruit.y) { if (score < maxGrowth) score++; level = Math.floor(score / 5) + 1; if (score > best) { best = score; localStorage.setItem('snakeArcadeBest', best); } placeFruit(); restartTimer(); } else snake.pop();
  updateStats(); draw();
}
function startGame() { snake = [...initialSnake]; direction = { x: 1, y: 0 }; nextDirection = { ...direction }; score = 0; level = 1; placeFruit(); playing = true; paused = false; overlay.classList.add('hidden'); pauseButton.disabled = false; pauseButton.textContent = 'Pause'; statusText.textContent = 'RUNNING'; updateStats(); draw(); restartTimer(); }
function endGame() { clearInterval(timer); playing = false; pauseButton.disabled = true; overlayKicker.textContent = 'GAME OVER'; overlayTitle.textContent = `Score ${scoreText(score)}`; overlayMessage.textContent = score === best && score > 0 ? 'New high score. Run it back.' : 'The grid got you. Try a tighter turn.'; startButton.innerHTML = 'Play again <b>↗</b>'; overlay.classList.remove('hidden'); statusText.textContent = 'GAME OVER'; draw(); }
function togglePause() { if (!playing) return; paused = !paused; if (paused) { clearInterval(timer); statusText.textContent = 'PAUSED'; overlayKicker.textContent = 'PAUSED'; overlayTitle.textContent = 'Take five'; overlayMessage.textContent = 'Your run is waiting on the grid.'; startButton.innerHTML = 'Resume <b>↗</b>'; overlay.classList.remove('hidden'); } else { overlay.classList.add('hidden'); statusText.textContent = 'RUNNING'; startButton.innerHTML = 'Start game <b>↗</b>'; restartTimer(); } }
function setDirection(value) { const directions = { up: { x: 0, y: -1 }, down: { x: 0, y: 1 }, left: { x: -1, y: 0 }, right: { x: 1, y: 0 } }; const candidate = directions[value]; if (!candidate || candidate.x + direction.x === 0 && candidate.y + direction.y === 0) return; nextDirection = candidate; }

document.addEventListener('keydown', event => { const keys = { ArrowUp: 'up', w: 'up', ArrowDown: 'down', s: 'down', ArrowLeft: 'left', a: 'left', ArrowRight: 'right', d: 'right' }; if (keys[event.key]) { event.preventDefault(); setDirection(keys[event.key]); } if (event.code === 'Space') { event.preventDefault(); togglePause(); } });
document.querySelectorAll('[data-direction]').forEach(button => button.addEventListener('click', () => setDirection(button.dataset.direction)));
startButton.addEventListener('click', () => paused ? togglePause() : startGame());
pauseButton.addEventListener('click', togglePause);
document.querySelector('#resetButton').addEventListener('click', startGame);
updateStats(); draw();
