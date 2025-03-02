class VideoSearchManager {
    constructor() {
        this.searchBaseUrl = 'https://www.bing.com/videos/search';
        this.initSearchContainer();
    }

    initSearchContainer() {
        const searchContainer = document.createElement('div');
        searchContainer.id = 'video-search-container';
        searchContainer.innerHTML = `
            <div class="search-box">
                <input type="text" id="search-input" placeholder="搜索地点视频...">
                <button id="search-button">搜索</button>
            </div>
            <div class="search-provider">点击搜索将跳转到必应视频</div>
        `;
        document.body.appendChild(searchContainer);

        const searchButton = document.getElementById('search-button');
        const searchInput = document.getElementById('search-input');

        searchButton.addEventListener('click', () => this.performSearch());
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.performSearch();
            }
        });
    }

    performSearch() {
        const keyword = document.getElementById('search-input').value.trim();
        if (!keyword) {
            alert('请输入搜索关键词');
            return;
        }

        // 构建必应视频搜索URL并在新标签页中打开
        const searchUrl = `${this.searchBaseUrl}?q=${encodeURIComponent(keyword)}`;
        window.open(searchUrl, '_blank');
    }
}
