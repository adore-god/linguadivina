document.querySelectorAll('.info-tip').forEach(tip => {
  tip.addEventListener('click', e => {
    e.stopPropagation();
    document.querySelectorAll('.info-tip.active').forEach(t => {
      if (t !== tip) t.classList.remove('active');
    });
    tip.classList.toggle('active');
  });
});
document.addEventListener('click', () => {
  document.querySelectorAll('.info-tip.active').forEach(t => t.classList.remove('active'));
});