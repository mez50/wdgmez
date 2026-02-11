document.querySelectorAll('.level-card').forEach(btn => {
    btn.addEventListener('click', () => {
        const level = btn.dataset.level;
        window.location.href = `game2.html?level=${level}`;
    });
});