const canvas = document.querySelector('#gameCanvas');
const context = canvas.getContext('2d');
const gridSize = 24;
const cellSize = canvas.width / gridSize;
const maxGrowth = 100;
const startSnake = [{ x: 7, y: 12 }, { x: 6, y: 12 }, { x: 5, y: 12 }];
let snake = [...startSnake];
let apple = { x: 17, y: 12 };
let direction = { x: 1, y: 0 };
let nextDirection = { ...direction };
let score = 0;
let level = 1;
let gameTimer = null;
let isPlaying = false;
let isPaused = false;
let best = Number(localStorage.getItem('snakeBest') || 0);

const scoreElement = document.querySelector('#score');
const bestElement = document.querySelector('#bestScore');
const lengthElement = document.querySelector('#length');
const levelElement = document.querySelector('#level');
const speedElement = document.querySelector('#speedLabel');
const overlay = document.querySelector('#overlay');
const overlayKicker = document.querySelector('#overlayKicker');
const overlayTitle = document.querySelector('#overlayTitle');
const overlayMessage = document.querySelector('#overlayMessage');
const startButton = document.querySelector('#startButton');
const pauseButton = document.querySelector('#pauseButton');
const statusText = document.querySelector('#statusText');

function formatScore(value) { return String(value).padStart(2, '0'); }
function updateStats() { scoreElement.textContent = formatScore(score); bestElement.textContent = formatScore(best); lengthElement.textContent = formatScore(snake.length); levelElement.textContent = formatScore(level); speedElement.textContent = `${4 + Math.floor(level / 2)} FPS`; }
function gameSpeed() { return Math.max(180, 1000 / (4 + Math.floor(level / 2))); }
function runTimer() { clearInterval(gameTimer); gameTimer = setInterval(tick, gameSpeed()); }
function placeApple() {
  do { apple = { x: Math.floor(Math.random() * gridSize), y: Math.floor(Math.random() * gridSize) }; }
  while (snake.some(segment => segment.x === apple.x && segment.y === apple.y));
}
function draw() {
  context.fillStyle = '#162c2b'; context.fillRect(0, 0, canvas.width, canvas.height);
  context.strokeStyle = 'rgba(241, 238, 231, .055)'; context.lineWidth = 1;
  for (let line = 1; line < gridSize; line++) { const point = line * cellSize; context.beginPath(); context.moveTo(point, 0); context.lineTo(point, canvas.height); context.stroke(); context.beginPath(); context.moveTo(0, point); context.lineTo(canvas.width, point); context.stroke(); }
  context.fillStyle = '#f06f52'; context.beginPath(); context.arc((apple.x + .5) * cellSize, (apple.y + .5) * cellSize, cellSize * .33, 0, Math.PI * 2); context.fill();
  snake.forEach((segment, index) => { context.fillStyle = index === 0 ? '#c7ee75' : '#337f79'; const inset = index === 0 ? 2 : 3; context.fillRect(segment.x * cellSize + inset, segment.y * cellSize + inset, cellSize - inset * 2, cellSize - inset * 2); });
}
function tick() {
  direction = nextDirection; const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };
  const hitWall = head.x < 0 || head.x >= gridSize || head.y < 0 || head.y >= gridSize;
  const hitSelf = snake.some(segment => segment.x === head.x && segment.y === head.y);
  if (hitWall || hitSelf) { endGame(); return; }
  snake.unshift(head);
  if (head.x === apple.x && head.y === apple.y) { if (score < maxGrowth) score++; level = Math.floor(score / 5) + 1; if (score > best) { best = score; localStorage.setItem('snakeBest', best); } placeApple(); runTimer(); } else snake.pop();
  updateStats(); draw();
}
function startGame() { snake = [...startSnake]; direction = { x: 1, y: 0 }; nextDirection = { ...direction }; score = 0; level = 1; placeApple(); isPlaying = true; isPaused = false; overlay.classList.add('hidden'); pauseButton.disabled = false; pauseButton.innerHTML = '<span class="pause-icon">||</span> Pause'; statusText.textContent = 'RUNNING'; updateStats(); draw(); runTimer(); }
function endGame() { clearInterval(gameTimer); isPlaying = false; pauseButton.disabled = true; overlayKicker.textContent = 'RUN COMPLETE'; overlayTitle.textContent = `Score ${formatScore(score)}`; overlayMessage.textContent = score === best && score > 0 ? 'New best run. The board is yours again.' : 'The walls won this round. Try a tighter turn.'; startButton.textContent = 'Run again  ->'; overlay.classList.remove('hidden'); statusText.textContent = 'GAME OVER'; draw(); }
function togglePause() { if (!isPlaying) return; isPaused = !isPaused; if (isPaused) { clearInterval(gameTimer); statusText.textContent = 'PAUSED'; pauseButton.innerHTML = '<span class="pause-icon">></span> Resume'; overlayKicker.textContent = 'TAKE A BREATH'; overlayTitle.textContent = 'Game paused'; overlayMessage.textContent = 'Your run is waiting right where you left it.'; startButton.textContent = 'Resume run  ->'; overlay.classList.remove('hidden'); } else { overlay.classList.add('hidden'); statusText.textContent = 'RUNNING'; pauseButton.innerHTML = '<span class="pause-icon">||</span> Pause'; runTimer(); } }
function setDirection(value) { const directions = { up: { x: 0, y: -1 }, down: { x: 0, y: 1 }, left: { x: -1, y: 0 }, right: { x: 1, y: 0 } }; const candidate = directions[value]; if (!candidate || (candidate.x + direction.x === 0 && candidate.y + direction.y === 0)) return; nextDirection = candidate; }

document.addEventListener('keydown', event => { const keys = { ArrowUp: 'up', w: 'up', ArrowDown: 'down', s: 'down', ArrowLeft: 'left', a: 'left', ArrowRight: 'right', d: 'right' }; if (keys[event.key]) { event.preventDefault(); setDirection(keys[event.key]); } if (event.code === 'Space') { event.preventDefault(); togglePause(); } });
document.querySelectorAll('[data-direction]').forEach(button => button.addEventListener('click', () => setDirection(button.dataset.direction)));
startButton.addEventListener('click', () => isPaused ? togglePause() : startGame());
pauseButton.addEventListener('click', togglePause);
document.querySelector('#resetButton').addEventListener('click', startGame);
updateStats(); draw();
document.addEventListener('visibilitychange', () => { if (document.hidden && isPlaying && !isPaused) togglePause(); });