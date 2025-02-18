class VideoSearchManager {
    constructor() {
        this.searchUrl = 'http://api.moreapi.cn/api/bilibili/search';
        this.token = 'rFkXPfsbLwPJjQdBBbHxPgOoWk6eOH4I20hwlbGDYJ1vkyKBbuD61plFvzTmjSXz';
        this.searchResults = [];
        this.initSearchContainer();
    }

    initSearchContainer() {
        // 创建搜索容器
        const searchContainer = document.createElement('div');
        searchContainer.id = 'video-search-container';
        searchContainer.innerHTML = `
            <div class="search-box">
                <input type="text" id="search-input" placeholder="搜索视频...">
                <button id="search-button">搜索</button>
            </div>
            <div class="search-provider">结果由bilibili提供</div>
            <div id="results-container"></div>
        `;
        document.body.appendChild(searchContainer);

        // 添加事件监听
        const searchButton = document.getElementById('search-button');
        const searchInput = document.getElementById('search-input');

        searchButton.addEventListener('click', () => this.performSearch());
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.performSearch();
            }
        });
    }

    async performSearch() {
        const keyword = document.getElementById('search-input').value.trim();
        if (!keyword) {
            alert('请输入搜索关键词');
            return;
        }

        try {
            const response = await fetch(`${this.searchUrl}?keyword=${encodeURIComponent(keyword)}`, {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });
            const data = await response.json();

            if (data.code === 200) {
                this.displayResults(data.data);
            } else {
                throw new Error(data.message || '搜索失败');
            }
        } catch (error) {
            console.error('搜索出错：', error);
            this.showError('搜索出错，请稍后重试');
        }
    }

    displayResults(results) {
        const container = document.getElementById('results-container');
        if (!results || results.length === 0) {
            container.innerHTML = '<div class="no-results">未找到相关视频</div>';
            return;
        }

        const resultsHtml = results.map(video => `
            <div class="video-item">
                <img src="${video.pic}" alt="${video.title}">
                <div class="video-info">
                    <h3>${video.title}</h3>
                    <p>UP主：${video.author}</p>
                    <p>播放量：${video.play}  弹幕：${video.video_review}</p>
                    <a href="${video.arcurl}" target="_blank">观看视频</a>
                </div>
            </div>
        `).join('');

        container.innerHTML = resultsHtml;
    }

    showError(message) {
        const container = document.getElementById('results-container');
        container.innerHTML = `<div class="error-message">${message}</div>`;
    }
}
