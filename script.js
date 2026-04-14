const setupScreen = document.getElementById('setup-screen');
const dealScreen = document.getElementById('deal-screen');
const playScreen = document.getElementById('play-screen');

const playerCountInput = document.getElementById('player-count');
const startBtn = document.getElementById('start-btn');
const revealBtn = document.getElementById('reveal-btn');
const nextBtn = document.getElementById('next-btn');
const restartBtn = document.getElementById('restart-btn');

const dealInstruction = document.getElementById('deal-instruction');
const revealZone = document.getElementById('reveal-zone');

const WORDS = {
  civilian: 'Ronaldo',
  undercover: 'Messi'
};

let state = {
  roles: [],
  currentIndex: 0,
  revealed: false
};

function shuffle(array) {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function resetRevealZone() {
  revealZone.innerHTML = '<p class="reveal-placeholder">Mot caché</p>';
}

function setDealInstruction() {
  dealInstruction.textContent = `Passe le téléphone au joueur ${state.currentIndex + 1}, puis appuie pour révéler.`;
}

function renderSecret() {
  const role = state.roles[state.currentIndex];
  const word = role === 'undercover' ? WORDS.undercover : WORDS.civilian;

  revealZone.innerHTML = `
    <div>
      <p class="player-label">Joueur ${state.currentIndex + 1}</p>
      <p class="secret">${word}</p>
    </div>
  `;
}

function startDealPhase() {
  let count = Number.parseInt(playerCountInput.value, 10);

  if (!Number.isInteger(count)) count = 5;
  count = Math.min(12, Math.max(3, count));

  const roles = ['undercover', ...Array(count - 1).fill('civilian')];

  state = {
    roles: shuffle(roles),
    currentIndex: 0,
    revealed: false
  };

  setupScreen.classList.add('hidden');
  playScreen.classList.add('hidden');
  dealScreen.classList.remove('hidden');

  revealBtn.classList.remove('hidden');
  nextBtn.classList.add('hidden');
  resetRevealZone();
  setDealInstruction();
}

function revealCurrentPlayerWord() {
  if (state.revealed) return;

  state.revealed = true;
  renderSecret();
  revealBtn.classList.add('hidden');
  nextBtn.classList.remove('hidden');

  if (state.currentIndex === state.roles.length - 1) {
    nextBtn.textContent = 'Commencer le débat';
  } else {
    nextBtn.textContent = 'Joueur suivant';
  }
}

function nextPlayerOrPlayPhase() {
  if (!state.revealed) return;

  if (state.currentIndex < state.roles.length - 1) {
    state.currentIndex += 1;
    state.revealed = false;
    setDealInstruction();
    resetRevealZone();
    revealBtn.classList.remove('hidden');
    nextBtn.classList.add('hidden');
    return;
  }

  dealScreen.classList.add('hidden');
  playScreen.classList.remove('hidden');
}

function resetAll() {
  setupScreen.classList.remove('hidden');
  dealScreen.classList.add('hidden');
  playScreen.classList.add('hidden');
  playerCountInput.focus();
}

startBtn.addEventListener('click', startDealPhase);
revealBtn.addEventListener('click', revealCurrentPlayerWord);
nextBtn.addEventListener('click', nextPlayerOrPlayPhase);
restartBtn.addEventListener('click', resetAll);
