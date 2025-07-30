let currArray = []; 
const maxArrayLen = 10;
let currSpeed = 1;
const speedDelays = [350, 100, 25];
const speedLabels = ['Slow', 'Medium', 'Fast'];
let runningVisualizerCount = 1;
let generators = [];
let pausedFlags = [];
let completedFlags = [];
let stepRequestedFlags = [];
let comparisonModeEnabled = false;
let visualizers = [];
const statsSummary = [];
const history = JSON.parse(localStorage.getItem('sort_history') || '[]');
const visualizersContainer = document.getElementById('visualizersContainer');
const extraAlgoSelectors = document.getElementById('extraAlgoSelectors');
const arrayStatus = document.getElementById('arrayStatus');
const statsContainer = document.getElementById('statsContainer');
const historyList = document.getElementById('historyList');
const restartBtn = document.getElementById('restartBtn');
const resetBtn = document.getElementById('resetBtn');

function parseCustomArray(inputStr) {
  let arr = inputStr
    .split(',')
    .map(x => parseInt(x.trim()))
    .filter(x => !isNaN(x));
  if (arr.length > maxArrayLen) arr = arr.slice(0, maxArrayLen);
  return arr;
}

function renderVisualizersArray(i, arr, opts = {}) {
  const containerId = `visualizer${i}`;
  renderArray(arr, opts, containerId);
}
function clearVisualizers() {
  visualizersContainer.innerHTML = '';
  visualizers = [];
  generators = [];
  pausedFlags = [];
  completedFlags = [];
  stepRequestedFlags = [];
}
function createVisualizerContainer(index, algoName) {
  const container = document.createElement('div');
  container.classList.add('visualizer-area');
  container.style.minWidth = '298px';
  container.id = `visualizer${index}`;
  container.setAttribute('aria-label', `Visualization of ${algoName}`);
  return container;
}
function handlePseudocodePanels() {
  const panel2 = document.getElementById('pseudocodePanel2');
  if (comparisonModeEnabled) {
    panel2.classList.remove('d-none');
    let algo2 = 'Selection Sort';
    const select2 = document.getElementById('algorithmSelect1');
    if (select2) algo2 = select2.value;
    renderPseudocode(algo2, -1, 2);
  } else {
    panel2.classList.add('d-none');
    document.getElementById('pseudocodeBox2').innerHTML = '';
  }
}

function addAlgorithmSelectors(count) {
  extraAlgoSelectors.innerHTML = '';
  for (let i = 1; i < count; i++) {
    const col = document.createElement('div');
    col.classList.add('col-12', 'col-md-4');
    const label = document.createElement('label');
    label.classList.add('fw-bold');
    label.setAttribute('for', `algorithmSelect${i}`);
    label.textContent = `Select Algorithm #${i + 1}`;
    const select = document.createElement('select');
    select.id = `algorithmSelect${i}`;
    select.classList.add('form-select');
    for (const algo of Object.keys(algorithmMap)) {
      const option = document.createElement('option');
      option.value = algo;
      option.textContent = algo;
      if (i === 1 && algo === "Selection Sort") option.selected = true;
      select.appendChild(option);
    }
    select.addEventListener('change', (e) => {
      renderPseudocode(e.target.value, -1, 2);
    });
    col.appendChild(label);
    col.appendChild(select);
    extraAlgoSelectors.appendChild(col);
  }
  extraAlgoSelectors.classList.remove('d-none');
  const sel2 = document.getElementById('algorithmSelect1');
  if (sel2) renderPseudocode(sel2.value, -1, 2);
}

function removeAlgorithmSelectors() {
  extraAlgoSelectors.innerHTML = '';
  extraAlgoSelectors.classList.add('d-none');
}
function updateArrayFromInput() {
  const inputEle = document.getElementById('customArrayInput');
  const input = inputEle.value.trim();
  let parsed = parseCustomArray(input);
  if (parsed.length > maxArrayLen) {
    arrayStatus.textContent = `Warning: Maximum allowed elements is ${maxArrayLen}. Extra values ignored.`;
    arrayStatus.classList.add('text-danger');
  } else if (parsed.length === 0) {
    arrayStatus.textContent = 'No bars yet. Enter comma-separated numbers and hit "Generate Array".';
    arrayStatus.classList.remove('text-danger');
  } else {
    arrayStatus.textContent = `Array length: ${parsed.length}`;
    arrayStatus.classList.remove('text-danger');
  }
  currArray = parsed;
  for (let i = 0; i < runningVisualizerCount; i++) {
    renderVisualizersArray(i, currArray);
  }
}
document.getElementById('customArrayInput').addEventListener('change', updateArrayFromInput);
document.getElementById('barColorPicker').addEventListener('input', e => {
  document.documentElement.style.setProperty('--bar-color', e.target.value);
});

document.getElementById('speedRange').addEventListener('input', e => {
  currSpeed = parseInt(e.target.value);
  document.getElementById('speedLabel').textContent = speedLabels[currSpeed];
});

document.getElementById('generateBtn').addEventListener('click', () => {
  updateArrayFromInput();
  resetStatsAndButtons();
});

document.getElementById('comparisonMode').addEventListener('change', (e) => {
  comparisonModeEnabled = e.target.checked;
  handlePseudocodePanels();
  if (comparisonModeEnabled) {
    runningVisualizerCount = 2;
    addAlgorithmSelectors(runningVisualizerCount);
  } else {
    runningVisualizerCount = 1;
    removeAlgorithmSelectors();
  }
  clearVisualizers();
  buildVisualizers();
  resetStatsAndButtons();
  if (currArray.length > 0) {
    for (let i = 0; i < runningVisualizerCount; i++)
      renderVisualizersArray(i, currArray);
  }
});

function getSelectedAlgorithms() {
  let algos = [];
  algos.push(document.getElementById('algorithmSelect0').value);
  if (comparisonModeEnabled) {
    for (let i = 1; i < runningVisualizerCount; i++) {
      const sel = document.getElementById(`algorithmSelect${i}`);
      if (sel) algos.push(sel.value);
    }
  }
  return algos;
}
function buildVisualizers() {
  visualizersContainer.innerHTML = '';
  for (let i = 0; i < runningVisualizerCount; i++) {
    const div = createVisualizerContainer(i, getSelectedAlgorithms()[i]);
    visualizersContainer.appendChild(div);
  }
}
function resetStatsAndButtons() {
  document.getElementById('pauseBtn').disabled = true;
  document.getElementById('resumeBtn').classList.add('d-none');
  document.getElementById('pauseBtn').classList.remove('d-none');
  document.getElementById('startBtn').disabled = false;
  document.getElementById('stepBtn').disabled = false;
  restartBtn.classList.add('d-none');
  statsContainer.innerHTML = '';
  updateHistoryDisplay();
}

function saveToHistory(stat) {
  history.push(stat);
  if (history.length > 15) history.shift();
  localStorage.setItem('sort_history', JSON.stringify(history));
  updateHistoryDisplay();
}
function updateHistoryDisplay() {
  let html = history
    .slice(-8)
    .reverse()
    .map(
      stat => `<li class="list-group-item">
        <b>${stat.algo}</b> [${stat.len}] - Time: ${stat.time ? stat.time.toFixed(1) : '-'} ms, Swaps: ${stat.swaps}, Comparisons: ${stat.comparisons}
      </li>`
    )
    .join('');
  historyList.innerHTML = html;
}
function updateStatsPanel(index, stats) {
  if (!statsSummary[index]) statsSummary[index] = {};
  statsSummary[index] = stats;
  statsContainer.innerHTML = statsSummary
    .map((s, i) => {
      if (!s) return '';
      return `<div class="stats-token" role="region" aria-label="Statistics for algorithm ${i + 1}">
        <b>Algo ${i + 1} (${s.algo}): </b>
        Comp: ${s.comparisons || 0}, Swaps: ${s.swaps || 0}, Time: ${Math.round(s.time || 0)} ms
      </div>`;
    })
    .join('');
}

async function runSortingVisualizer(i, arr, algoName) {
  generators[i] = algorithmMap[algoName](arr.slice());
  pausedFlags[i] = false;
  completedFlags[i] = false;
  stepRequestedFlags[i] = false;
  const stats = { comparisons: 0, swaps: 0, time: 0, algo: algoName, len: arr.length };
  const delay = () => new Promise(res => setTimeout(res, speedDelays[currSpeed]));
  const t0 = performance.now();

  while (true) {
    if (pausedFlags[i]) {
      await new Promise(res => {
        const check = () => {
          if (!pausedFlags[i] || stepRequestedFlags[i]) {
            stepRequestedFlags[i] = false;
            res();
          } else setTimeout(check, 50);
        };
        check();
      });
    }
    let { value, done } = await generators[i].next();
    if (done) break;
    stats.comparisons = value.comparisons ?? stats.comparisons;
    stats.swaps = value.swaps ?? stats.swaps;
    renderVisualizersArray(i, value.arr, {
      compare: value.indices ?? [],
      type: value.type,
      pivot: value.pivot,
      merge: value.type === 'merge' ? value.indices : null,
    });
    if (i === 0) {
      renderPseudocode(algoName, getPseudocodeLine(algoName, value), 1);
      updateStatsPanel(i, stats);
    }
    else if (i === 1 && comparisonModeEnabled) {
      renderPseudocode(algoName, getPseudocodeLine(algoName, value), 2);
      updateStatsPanel(i, stats);
    } else {
      updateStatsPanel(i, stats);
    }
    if (!pausedFlags[i]) await delay();
  }
  stats.time = performance.now() - t0;
  completedFlags[i] = true;
  updateStatsPanel(i, stats);
  saveToHistory(stats);
  if (runningVisualizerCount === 1) {
    restartBtn.classList.remove('d-none');
  }
}
let allRunningTasks = [];
async function startSorting() {
  if (generators.some((g, idx) => g && !completedFlags[idx])) {
    alert('Sorting in progress, please wait or pause first.');
    return;
  }
  resetStatsAndButtons();
  clearVisualizers();
  buildVisualizers();
  const algos = getSelectedAlgorithms();
  document.getElementById('startBtn').disabled = true;
  document.getElementById('pauseBtn').disabled = false;
  restartBtn.classList.add('d-none');
  allRunningTasks = [];
  for (let i = 0; i < algos.length; i++) {
    generators[i] = null;
    pausedFlags[i] = false;
    completedFlags[i] = false;
    stepRequestedFlags[i] = false;
    visualizers[i] = createVisualizerContainer(i, algos[i]);
  }
  for (let i = 0; i < algos.length; i++) {
    allRunningTasks.push(runSortingVisualizer(i, currArray, algos[i]));
  }
}
function pauseAll() {
  for (let i = 0; i < runningVisualizerCount; i++) pausedFlags[i] = true;
  document.getElementById('pauseBtn').disabled = true;
  document.getElementById('resumeBtn').classList.remove('d-none');
  document.getElementById('stepBtn').disabled = false;
}
function resumeAll() {
  for (let i = 0; i < runningVisualizerCount; i++) pausedFlags[i] = false;
  document.getElementById('resumeBtn').classList.add('d-none');
  document.getElementById('pauseBtn').disabled = false;
  document.getElementById('stepBtn').disabled = false;
}
function stepAll() {
  for (let i = 0; i < runningVisualizerCount; i++) {
    if (pausedFlags[i]) stepRequestedFlags[i] = true;
    else { pausedFlags[i] = true; stepRequestedFlags[i] = true; }
  }
}
function restartSorting() {
  if (!currArray.length) return;
  restartBtn.classList.add('d-none');
  resetStatsAndButtons();
  clearVisualizers();
  buildVisualizers();
  startSorting();
}
document.getElementById('startBtn').addEventListener('click', () => {
  const inputEle = document.getElementById('customArrayInput');
  if (inputEle.value.trim() === '') {
    alert('Please enter some numbers to sort.');
    return;
  }
  updateArrayFromInput();
  if (currArray.length > 0) startSorting();
});
document.getElementById('pauseBtn').addEventListener('click', pauseAll);
document.getElementById('resumeBtn').addEventListener('click', resumeAll);
document.getElementById('stepBtn').addEventListener('click', stepAll);
restartBtn.addEventListener('click', restartSorting);

resetBtn.addEventListener('click', () => {
  document.getElementById('customArrayInput').value = '';
  currArray = [];
  arrayStatus.textContent = 'Please generate or enter an array to start.';
  clearVisualizers();
  statsContainer.innerHTML = '';
  renderPseudocode(document.getElementById('algorithmSelect0').value, -1, 1);
  renderPseudocode(document.getElementById('algorithmSelect1') ? document.getElementById('algorithmSelect1').value : '', -1, 2);
  document.getElementById('pauseBtn').disabled = true;
  document.getElementById('resumeBtn').classList.add('d-none');
  document.getElementById('startBtn').disabled = false;
  document.getElementById('stepBtn').disabled = false;
  restartBtn.classList.add('d-none');
  document.getElementById('comparisonMode').checked = false;
  comparisonModeEnabled = false;
  runningVisualizerCount = 1;
  removeAlgorithmSelectors();
  buildVisualizers();
  handlePseudocodePanels();
});

window.onload = () => {
  runningVisualizerCount = 1;
  currArray = [];
  arrayStatus.textContent = 'Please generate or enter an array to start.';
  buildVisualizers();
  renderPseudocode(document.getElementById('algorithmSelect0').value, -1, 1);
  renderPseudocode('', -1, 2);
  updateHistoryDisplay();
  resetStatsAndButtons();
  handlePseudocodePanels();
};
