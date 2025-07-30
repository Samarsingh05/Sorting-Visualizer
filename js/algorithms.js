function swap(arr, i, j) {
  [arr[i], arr[j]] = [arr[j], arr[i]];
}

async function* bubbleSort(arr) {
  let n = arr.length, comparisons = 0, swaps = 0;
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      comparisons++;
      yield { type: 'compare', indices: [j, j + 1], arr: arr.slice(), comparisons, swaps };
      if (arr[j] > arr[j + 1]) {
        swaps++; swap(arr, j, j + 1);
        yield { type: 'swap', indices: [j, j + 1], arr: arr.slice(), comparisons, swaps };
      }
    }
  }
  yield { type: 'done', arr: arr.slice(), comparisons, swaps };
}

async function* selectionSort(arr) {
  let n = arr.length, comparisons = 0, swaps = 0;
  for (let i = 0; i < n - 1; i++) {
    let min = i;
    for (let j = i + 1; j < n; j++) {
      comparisons++;
      yield { type: 'compare', indices: [min, j], arr: arr.slice(), comparisons, swaps };
      if (arr[j] < arr[min]) min = j;
    }
    if (min !== i) {
      swaps++; swap(arr, i, min);
      yield { type: 'swap', indices: [i, min], arr: arr.slice(), comparisons, swaps };
    }
  }
  yield { type: 'done', arr: arr.slice(), comparisons, swaps };
}

async function* insertionSort(arr) {
  let n = arr.length, comparisons = 0, swaps = 0;
  for (let i = 1; i < n; i++) {
    let key = arr[i], j = i - 1, didSwap = false;
    while (j >= 0 && arr[j] > key) {
      comparisons++;
      yield { type: 'compare', indices: [j, j + 1], arr: arr.slice(), comparisons, swaps };
      arr[j + 1] = arr[j]; swaps++; didSwap = true;
      yield { type: 'swap', indices: [j, j + 1], arr: arr.slice(), comparisons, swaps };
      j--;
    }
    arr[j + 1] = key;
    if (didSwap) yield { type: 'swap', indices: [j + 1], arr: arr.slice(), comparisons, swaps };
  }
  yield { type: 'done', arr: arr.slice(), comparisons, swaps };
}

async function* mergeSort(arr, l = 0, r = arr.length - 1, stats = { comparisons: 0, swaps: 0 }) {
  if (l >= r) {
    if (l === 0 && r === arr.length - 1) yield { type: 'done', arr: arr.slice(), ...stats };
    return;
  }
  const mid = Math.floor((l + r) / 2);
  for await (const s of mergeSort(arr, l, mid, stats)) yield s;
  for await (const s of mergeSort(arr, mid + 1, r, stats)) yield s;
  let left = arr.slice(l, mid + 1), right = arr.slice(mid + 1, r + 1), i = 0, j = 0, k = l;
  while (i < left.length && j < right.length) {
    stats.comparisons++;
    yield { type: 'compare', indices: [l + i, mid + 1 + j], arr: arr.slice(), ...stats };
    if (left[i] <= right[j]) { arr[k++] = left[i++]; }
    else { arr[k++] = right[j++]; stats.swaps++; }
    yield { type: 'merge', indices: [k - 1], arr: arr.slice(), ...stats };
  }
  while (i < left.length) arr[k++] = left[i++];
  while (j < right.length) arr[k++] = right[j++];
  if (l === 0 && r === arr.length - 1) yield { type: 'done', arr: arr.slice(), ...stats };
}

async function quickPartition(arr, lo, hi, stats) {
  let steps = [], pivot = arr[hi], i = lo - 1;
  for (let j = lo; j < hi; j++) {
    stats.comparisons++;
    steps.push({ type: 'compare', indices: [j, hi], arr: arr.slice(), ...stats, pivot: hi });
    if (arr[j] <= pivot) {
      i++; stats.swaps++; swap(arr, i, j);
      steps.push({ type: 'swap', indices: [i, j], arr: arr.slice(), ...stats, pivot: hi });
    }
  }
  swap(arr, i + 1, hi); stats.swaps++;
  steps.push({ type: 'swap', indices: [i + 1, hi], arr: arr.slice(), ...stats, pivot: i + 1 });
  steps.push({ type: 'pivot', indices: [i + 1], arr: arr.slice() });
  return { p: i + 1, steps };
}

async function* quickSort(arr, lo = 0, hi = arr.length - 1, stats = { comparisons: 0, swaps: 0 }) {
  if (lo < hi) {
    const partitionResult = await quickPartition(arr, lo, hi, stats);
    for (const step of partitionResult.steps) yield step;
    const p = partitionResult.p;
    for await (const s of quickSort(arr, lo, p - 1, stats)) yield s;
    for await (const s of quickSort(arr, p + 1, hi, stats)) yield s;
  } else if (lo === 0 && hi === arr.length - 1) {
    yield { type: 'done', arr: arr.slice(), ...stats };
  }
}

async function* heapSort(arr) {
  const n = arr.length; let swaps = 0, comparisons = 0;
  function* heapify(arr, n, i) {
    let largest = i, left = 2 * i + 1, right = 2 * i + 2;
    if (left < n) {
      comparisons++;
      if (arr[left] > arr[largest]) largest = left;
      yield { type: 'compare', indices: [left, i], arr: arr.slice(), comparisons, swaps };
    }
    if (right < n) {
      comparisons++;
      if (arr[right] > arr[largest]) largest = right;
      yield { type: 'compare', indices: [right, i], arr: arr.slice(), comparisons, swaps };
    }
    if (largest !== i) {
      swaps++; swap(arr, i, largest);
      yield { type: 'swap', indices: [i, largest], arr: arr.slice(), comparisons, swaps };
      yield* heapify(arr, n, largest);
    }
  }
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    for (const s of heapify(arr, n, i)) yield s;
  }
  for (let i = n - 1; i > 0; i--) {
    swaps++; swap(arr, 0, i);
    yield { type: 'swap', indices: [0, i], arr: arr.slice(), comparisons, swaps };
    for (const s of heapify(arr, i, 0)) yield s;
  }
  yield { type: 'done', arr: arr.slice(), comparisons, swaps };
}

const algorithmMap = {
  'Bubble Sort': bubbleSort,
  'Selection Sort': selectionSort,
  'Insertion Sort': insertionSort,
  'Merge Sort': arr => mergeSort(arr),
  'Quick Sort': arr => quickSort(arr),
  'Heap Sort': heapSort,
};
