function renderArray(arr, opts = {}, containerId = 'visualizer') {
  const container = document.getElementById(containerId);
  if (!container) return;
  if (!arr || arr.length === 0) {
    container.innerHTML = ''; 
    return;
  }
  let html = '';
  const activeIndices = opts.compare ?? [];
  const type = opts.type || '';
  const pivotIdx = opts.pivot;
  const mergeIdx = opts.merge;
  for (let i = 0; i < arr.length; i++) {
    let height = 32 + arr[i] * 4.6; 
    let classes = ['sort-bar'];
    if (activeIndices.includes(i)) classes.push(type);
    if (pivotIdx !== undefined && i === pivotIdx) classes.push('pivot');
    if (type === 'merge' && mergeIdx && (Array.isArray(mergeIdx) ? mergeIdx.includes(i) : i === mergeIdx))
      classes.push('merge');
    html += `<div class="${classes.join(' ')}" style="height:${height}px; width:${(100 / arr.length).toFixed(3)}%;" data-value="${arr[i]}"></div>`;
  }
  container.innerHTML = html;
}
