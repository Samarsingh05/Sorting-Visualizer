let userSelectedBarColor = '#1877f2';

function updateBarColor(color) {
  userSelectedBarColor = color;
  document.documentElement.style.setProperty('--bar-color', color);
  document.documentElement.style.setProperty('--primary-color', color);
}

document.getElementById('barColorPicker').addEventListener('input', (e) => {
  updateBarColor(e.target.value);
});

document.getElementById('themeToggle').onclick = () => {
  const body = document.body;
  const isDark = body.getAttribute('data-bs-theme') === 'dark';
  body.setAttribute('data-bs-theme', isDark ? 'light' : 'dark');
  updateBarColor(userSelectedBarColor);
};
