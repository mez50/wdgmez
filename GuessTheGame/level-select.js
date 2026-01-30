document.querySelectorAll('.level-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const level = btn.dataset.level;
        window.location.href = `game.html?level=${level}`;
    });
});