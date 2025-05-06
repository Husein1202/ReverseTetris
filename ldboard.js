    function renderLeaderboard(mode) {
    const container = document.getElementById('leaderboard');
    container.innerHTML = '';
    
    const data = leaderboardData[mode] || [];
    
    data.forEach(entry => {
      // Main row
      const row = document.createElement('div');
      row.className = 'leaderboard-row';
      row.innerHTML = `
        <div class="rank">${entry.rank}</div>
        <div class="name">${entry.name}</div>
        <div class="time">${entry.time}</div>
      `;
      container.appendChild(row);
      
      // Stats row if exists
      if (entry.stats) {
        const statsRow = document.createElement('div');
        statsRow.className = 'stats-row';
        statsRow.textContent = entry.stats;
        container.appendChild(statsRow);
      }
    });
  }
  
  // Tab switching
  document.querySelectorAll('.mode-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.mode-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      renderLeaderboard(tab.dataset.mode);
    });
  });
  
  // Initial load
  renderLeaderboard('40l');