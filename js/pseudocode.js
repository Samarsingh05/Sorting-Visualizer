const pseudocodes = {
  'Bubble Sort': [
    'for i from 0 to n-1',
    '  for j from 0 to n-i-2',
    '    if array[j] > array[j+1]',
    '      swap(array[j], array[j+1])',
  ],
  'Selection Sort': [
    'for i from 0 to n-2',
    '  minIdx = i',
    '  for j from i+1 to n-1',
    '    if arr[j] < arr[minIdx]',
    '      minIdx = j',
    '  swap(arr[i], arr[minIdx])',
  ],
  'Insertion Sort': [
    'for i from 1 to n-1',
    '  key = arr[i]',
    '  j = i-1',
    '  while j>=0 and arr[j]>key',
    '    arr[j+1] = arr[j]',
    '    j = j-1',
    '  arr[j+1]=key',
  ],
  'Merge Sort': [
    'if left < right',
    '  mid = (left+right) // 2',
    '  mergeSort(arr, left, mid)',
    '  mergeSort(arr, mid+1, right)',
    '  merge(arr, left, mid, right)',
  ],
  'Quick Sort': [
    'function quickSort(arr, low, high)',
    '  if low < high',
    '    pi = partition(arr, low, high)',
    '    quickSort(arr, low, pi-1)',
    '    quickSort(arr, pi+1, high)',
  ],
  'Heap Sort': [
    'buildMaxHeap(arr)',
    'for i from n-1 downto 1',
    '  swap(arr[0], arr[i])',
    '  heapify(arr, 0, i)',
  ],
};
function renderPseudocode(algo, lineIdx, panelNumber = 1) {
  const lines = pseudocodes[algo] || [];
  let html = '';
  for (let i = 0; i < lines.length; i++) {
    const active = i === lineIdx ? 'active-line' : '';
    html += `<div class="${active}">${lines[i]}</div>`;
  }
  if (panelNumber === 2) {
    document.getElementById('pseudocodeBox2').innerHTML = html;
  } else {
    document.getElementById('pseudocodeBox').innerHTML = html;
  }
}

function getPseudocodeLine(algo, step) {
  if (!step) return -1;
  switch (algo) {
    case 'Bubble Sort':
      if (step.type === 'compare') return 2;
      if (step.type === 'swap') return 3;
      break;
    case 'Selection Sort':
      if (step.type === 'compare') return 3;
      if (step.type === 'swap') return 5;
      break;
    case 'Insertion Sort':
      if (step.type === 'compare') return 3;
      if (step.type === 'swap') return 4;
      break;
    case 'Merge Sort':
      if (step.type === 'merge') return 4;
      break;
    case 'Quick Sort':
      if (step.type === 'pivot' || step.type === 'swap') return 2;
      if (step.type === 'compare') return 1;
      break;
    case 'Heap Sort':
      if (step.type === 'swap') return 2;
      if (step.type === 'compare') return 1;
      break;
  }
  return -1;
}
