// 加载游戏到主页 iframe
function loadMainGame() {
    if (gamesData && gamesData.length > 0) {
        const firstGame = gamesData[0];
        const iframe = document.getElementById('game-iframe');
        const title = document.getElementById('current-game-title');
        const icon = document.getElementById('game-icon');
        
        if (iframe && firstGame.iframeUrl) {
            iframe.src = firstGame.iframeUrl;
        }
        
        if (title) {
            title.textContent = firstGame.name || 'Game';
        }
        
        if (icon && firstGame.imageUrl) {
            icon.src = firstGame.imageUrl.replace('game_icon', 'icon');
            icon.onerror = function() {
                this.src = 'img/icon/popcornGame.jpg';
            };
        }
    }
}

// 加载游戏（用于点击游戏卡片）
function loadGame(gameIndex) {
    if (gamesData && gamesData[gameIndex]) {
        const game = gamesData[gameIndex];
        const iframe = document.getElementById('game-iframe');
        const title = document.getElementById('current-game-title');
        const icon = document.getElementById('game-icon');
        
        if (iframe) {
            iframe.src = game.iframeUrl || '';
        }
        
        if (title) {
            title.textContent = game.name || 'Game';
        }
        
        if (icon && game.imageUrl) {
            icon.src = game.imageUrl.replace('game_icon', 'icon');
            icon.onerror = function() {
                this.src = 'img/icon/popcornGame.jpg';
            };
        }
    }
}

// 全屏切换
function toggleFullscreen() {
    const iframe = document.getElementById('game-iframe');
    if (iframe) {
        if (iframe.requestFullscreen) {
            iframe.requestFullscreen();
        } else if (iframe.webkitRequestFullscreen) {
            iframe.webkitRequestFullscreen();
        } else if (iframe.msRequestFullscreen) {
            iframe.msRequestFullscreen();
        }
    }
}

// 打乱数组顺序（用于随机排序）
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// 动态生成21个随机游戏卡片
function loadRelatedGames() {
    const container = document.getElementById('related-games-container');
    if (!container) return;
    
    // 合并所有分类的游戏数据
    const allGames = [
        ...(window.gamesData || []),
        ...(window.actionGames || []),
        ...(window.battleRoyaleData || []),
        ...(window.fpsData || []),
        ...(window.multiplayerGames || []),
        ...(window.sniperData || [])
    ];
    
    if (allGames.length === 0) return;
    
    // 随机打乱游戏数据，取前21个
    const shuffledGames = shuffleArray(allGames).slice(0, 21);
    
    // 清空容器
    container.innerHTML = '';
    
    // 生成游戏卡片
    shuffledGames.forEach((game) => {
        const card = document.createElement('div');
        card.className = 'game-card';
        card.setAttribute('data-game', game.id);
        const imageUrl = game.imageUrl;
        card.innerHTML = `
            <div class="game-card-img">
                <img src="${imageUrl}" alt="${game.name}" onerror="this.src='img/icon/popcornGame.jpg'">
            </div>
            <div class="game-card-title">${game.name}</div>
        `;
        card.addEventListener('click', function() {
            loadGameById(game.id);
        });
        container.appendChild(card);
    });
}

// 根据游戏ID跳转到游戏页面
function loadGameById(gameId) {
    // 合并所有分类的游戏数据
    const allGames = [
        ...(window.gamesData || []),
        ...(window.actionGames || []),
        ...(window.battleRoyaleData || []),
        ...(window.fpsData || []),
        ...(window.multiplayerGames || []),
        ...(window.sniperData || [])
    ];

    const game = allGames.find(g => g.id === gameId);
    if (!game) return;

    // 跳转到游戏页面
    if (game.link) {
        // 获取当前页面的目录路径
        const currentPath = window.location.pathname;
        const pathParts = currentPath.split('/').filter(p => p);
        // 移除最后一个文件名，得到当前目录
        pathParts.pop();
        const currentDir = pathParts.length > 0 ? pathParts.join('/') + '/' : '';

        // 如果游戏链接已经是绝对路径（以/开头）或包含完整路径，直接跳转
        // 否则，根据当前目录调整链接
        if (game.link.startsWith('/')) {
            window.location.href = game.link;
        } else if (game.link.includes('/')) {
            // 游戏链接包含目录信息（如 FPS/xxx.html）
            // 检查是否需要回退目录
            const linkParts = game.link.split('/');
            // 计算链接相对于当前目录的路径
            let targetPath = game.link;
            // 如果当前在子目录中且游戏链接也包含子目录，需要回退
            if (currentDir && !game.link.startsWith(currentDir)) {
                // 计算相对路径：当前目录回退到根目录，再加上游戏链接
                const depth = currentDir.split('/').filter(p => p).length;
                const backPath = '../'.repeat(depth);
                targetPath = backPath + game.link;
            }
            window.location.href = targetPath;
        } else {
            // 游戏链接只是文件名（在根目录）
            window.location.href = game.link;
        }
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    // 加载主页游戏
    loadMainGame();
    
    // 加载21个随机游戏
    loadRelatedGames();
    
    // 初始化粒子背景
    initParticles();
    
    // 初始化鼠标跟随效果
    initCursorGlow();
    
    // 为新游戏区域的卡片添加点击事件
    const newGameCards = document.querySelectorAll('.series-game');
    newGameCards.forEach(card => {
        card.addEventListener('click', function() {
            const gameIndex = this.getAttribute('data-game');
            if (gameIndex !== null) {
                loadGame(parseInt(gameIndex));
            }
        });
    });
});

// 粒子背景效果
function initParticles() {
    const container = document.getElementById('particles');
    if (!container || container.childElementCount > 0) return;
    
    for (let i = 0; i < 30; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 20 + 's';
        particle.style.animationDuration = (15 + Math.random() * 10) + 's';
        particle.style.width = (3 + Math.random() * 4) + 'px';
        particle.style.height = particle.style.width;
        container.appendChild(particle);
    }
}

// 鼠标跟随光效
function initCursorGlow() {
    const glow = document.getElementById('cursorGlow');
    if (!glow || glow.dataset.bound === 'true') return;

    glow.dataset.bound = 'true';
    
    document.addEventListener('mousemove', (e) => {
        glow.style.left = e.clientX + 'px';
        glow.style.top = e.clientY + 'px';
    });
    
    document.addEventListener('mouseleave', () => {
        glow.style.opacity = '0';
    });
    
    document.addEventListener('mouseenter', () => {
        glow.style.opacity = '1';
    });
}
