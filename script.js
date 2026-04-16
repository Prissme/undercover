const setupScreen = document.getElementById('setup-screen');
const dealScreen = document.getElementById('deal-screen');
const playScreen = document.getElementById('play-screen');

const playerCountInput = document.getElementById('player-count');
const undercoverCountInput = document.getElementById('undercover-count');
const mrWhiteCountInput = document.getElementById('mrwhite-count');
const wordModeInput = document.getElementById('word-mode');
const namesContainer = document.getElementById('names-container');
const setupHint = document.getElementById('setup-hint');

const startBtn = document.getElementById('start-btn');
const revealBtn = document.getElementById('reveal-btn');
const nextBtn = document.getElementById('next-btn');
const restartBtn = document.getElementById('restart-btn');

const dealInstruction = document.getElementById('deal-instruction');
const revealZone = document.getElementById('reveal-zone');
const voteList = document.getElementById('vote-list');
const eliminationLog = document.getElementById('elimination-log');

const FOOTBALL_WORDS = [
  'Lionel Messi',
  'Cristiano Ronaldo',
  'Kylian Mbappé',
  'Erling Haaland',
  'Zinedine Zidane',
  'Ronaldinho',
  'Neymar',
  'Vinícius Júnior',
  'Karim Benzema',
  'Robert Lewandowski',
  'Luka Modrić',
  'Andrés Iniesta',
  'Kevin De Bruyne',
  'Mohamed Salah',
  'Sergio Ramos',
  'Virgil van Dijk',
  'Xavi',
  'Sergio Busquets',
  'Paolo Maldini',
  'Franz Beckenbauer'
];

const FIRSTNAME_WORDS = ['Albert', 'Driss', 'Ariyen', 'Imad', 'Almir', 'Benjamin', 'Erwan', 'Larsson', 'Verpoorten'];
const ANIME_WORDS = [
  'Naruto',
  'Sasuke',
  'Sakura',
  'Mikasa',
  'Livai',
  'Eren',
  'Goku',
  'Vegeta',
  'Sukuna',
  'Gojo',
  'Itadori',
  'Luffy'
];

const WORD_SETS = {
  football: FOOTBALL_WORDS,
  firstname: FIRSTNAME_WORDS,
  anime: ANIME_WORDS
};

let state = {
  players: [],
  currentIndex: 0,
  revealed: false,
  selectedWords: [FOOTBALL_WORDS[0], FOOTBALL_WORDS[1]],
  eliminatedIndexes: []
};

function shuffle(array) {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function fillPlayerCountChoices() {
  for (let count = 3; count <= 20; count += 1) {
    const option = document.createElement('option');
    option.value = String(count);
    option.textContent = `${count} joueurs`;
    playerCountInput.append(option);
  }

  playerCountInput.value = '6';
}

function createNameInputs(count) {
  namesContainer.innerHTML = '';

  for (let i = 0; i < count; i += 1) {
    const input = document.createElement('input');
    input.className = 'name-input';
    input.type = 'text';
    input.maxLength = 24;
    input.placeholder = `Joueur ${i + 1}`;
    input.value = `Joueur ${i + 1}`;
    input.dataset.index = String(i);
    namesContainer.append(input);
  }
}

function fillRoleCountChoices() {
  const count = Number.parseInt(playerCountInput.value, 10) || 6;
  undercoverCountInput.innerHTML = '';
  mrWhiteCountInput.innerHTML = '';

  for (let i = 1; i <= Math.max(1, count - 1); i += 1) {
    const option = document.createElement('option');
    option.value = String(i);
    option.textContent = String(i);
    undercoverCountInput.append(option);
  }

  for (let i = 0; i <= Math.max(0, count - 2); i += 1) {
    const option = document.createElement('option');
    option.value = String(i);
    option.textContent = String(i);
    mrWhiteCountInput.append(option);
  }

  undercoverCountInput.value = '1';
  mrWhiteCountInput.value = '0';
  syncRoleConstraints();
}

function syncRoleConstraints() {
  const count = Number.parseInt(playerCountInput.value, 10) || 6;
  let undercovers = Number.parseInt(undercoverCountInput.value, 10) || 1;
  let mrWhites = Number.parseInt(mrWhiteCountInput.value, 10) || 0;

  const maxUnder = Math.max(1, count - 1 - mrWhites);
  undercovers = Math.min(Math.max(1, undercovers), maxUnder);

  const maxWhite = Math.max(0, count - 1 - undercovers);
  mrWhites = Math.min(Math.max(0, mrWhites), maxWhite);

  undercoverCountInput.value = String(undercovers);
  mrWhiteCountInput.value = String(mrWhites);

  setupHint.textContent = `Rôles: ${undercovers} Undercover${undercovers > 1 ? 's' : ''}, ${mrWhites} Mr White.`;
}

function resetRevealZone() {
  revealZone.innerHTML = '<p class="reveal-placeholder">Mot caché</p>';
}

function setDealInstruction() {
  const player = state.players[state.currentIndex];
  dealInstruction.textContent = `Passe le téléphone à ${player.name}, puis appuie pour révéler.`;
}

function renderSecret() {
  const player = state.players[state.currentIndex];
  const word =
    player.role === 'undercover'
      ? state.selectedWords[1]
      : player.role === 'mrwhite'
        ? 'Aucun mot (Mr White)'
        : state.selectedWords[0];

  revealZone.innerHTML = `
    <div>
      <p class="player-label">${player.name}</p>
      <p class="secret">${word}</p>
    </div>
  `;
}

function buildPlayers(count, undercovers, mrWhites) {
  const names = [...namesContainer.querySelectorAll('.name-input')].map((input, index) => {
    const value = input.value.trim();
    return value || `Joueur ${index + 1}`;
  });

  const roles = [
    ...Array(undercovers).fill('undercover'),
    ...Array(mrWhites).fill('mrwhite'),
    ...Array(count - undercovers - mrWhites).fill('civilian')
  ];

  return shuffle(roles).map((role, index) => ({
    id: index,
    name: names[index],
    role
  }));
}

function pickSecretWords() {
  const mode = wordModeInput.value in WORD_SETS ? wordModeInput.value : 'football';
  const words = WORD_SETS[mode];
  const mixedWords = shuffle(words);
  return [mixedWords[0], mixedWords[1]];
}

function renderVoteList() {
  voteList.innerHTML = '';
  state.players.forEach((player, index) => {
    const button = document.createElement('button');
    button.className = 'btn vote-btn';
    button.textContent = state.eliminatedIndexes.includes(index)
      ? `${player.name} (éliminé)`
      : `Éliminer ${player.name}`;
    button.disabled = state.eliminatedIndexes.includes(index);
    button.addEventListener('click', () => eliminatePlayer(index));
    voteList.append(button);
  });
}

function eliminatePlayer(index) {
  if (state.eliminatedIndexes.includes(index)) return;

  const player = state.players[index];
  state.eliminatedIndexes.push(index);

  const line = document.createElement('p');
  const roleLabel =
    player.role === 'civilian'
      ? 'Civil'
      : player.role === 'undercover'
        ? 'Undercover'
        : 'Mr White';

  line.textContent = `${player.name} est éliminé(e) : ${roleLabel}.`;
  eliminationLog.prepend(line);

  renderVoteList();
}

function startDealPhase() {
  const count = Number.parseInt(playerCountInput.value, 10) || 6;
  const undercovers = Number.parseInt(undercoverCountInput.value, 10) || 1;
  const mrWhites = Number.parseInt(mrWhiteCountInput.value, 10) || 0;

  state = {
    players: buildPlayers(count, undercovers, mrWhites),
    currentIndex: 0,
    revealed: false,
    selectedWords: pickSecretWords(),
    eliminatedIndexes: []
  };

  setupScreen.classList.add('hidden');
  playScreen.classList.add('hidden');
  dealScreen.classList.remove('hidden');

  revealBtn.classList.remove('hidden');
  nextBtn.classList.add('hidden');
  resetRevealZone();
  setDealInstruction();
  eliminationLog.innerHTML = '';
}

function revealCurrentPlayerWord() {
  if (state.revealed) return;

  state.revealed = true;
  renderSecret();
  revealBtn.classList.add('hidden');
  nextBtn.classList.remove('hidden');

  if (state.currentIndex === state.players.length - 1) {
    nextBtn.textContent = 'Commencer le débat';
  } else {
    nextBtn.textContent = 'Joueur suivant';
  }
}

function nextPlayerOrPlayPhase() {
  if (!state.revealed) return;

  if (state.currentIndex < state.players.length - 1) {
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
  renderVoteList();
}

function resetAll() {
  setupScreen.classList.remove('hidden');
  dealScreen.classList.add('hidden');
  playScreen.classList.add('hidden');
  eliminationLog.innerHTML = '';
  playerCountInput.focus();
}

fillPlayerCountChoices();
fillRoleCountChoices();
createNameInputs(Number.parseInt(playerCountInput.value, 10));

playerCountInput.addEventListener('change', () => {
  fillRoleCountChoices();
  createNameInputs(Number.parseInt(playerCountInput.value, 10));
});
undercoverCountInput.addEventListener('change', syncRoleConstraints);
mrWhiteCountInput.addEventListener('change', syncRoleConstraints);

startBtn.addEventListener('click', startDealPhase);
revealBtn.addEventListener('click', revealCurrentPlayerWord);
nextBtn.addEventListener('click', nextPlayerOrPlayPhase);
restartBtn.addEventListener('click', resetAll);
