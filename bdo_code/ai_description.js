class AIDescriptionManager {
    constructor() {
        this.initContainer();
    }

    initContainer() {
        // 创建AI描述容器
        const container = document.createElement('div');
        container.id = 'ai-description-container';
        container.innerHTML = `
            <div class="search-box">
                <input type="text" id="place-input" placeholder="输入地点名称获取AI描述...">
                <button id="get-description">获取描述</button>
            </div>
            <div id="description-result"></div>
            <div id="review-form" style="display: none;">
                <h3>为这个地点评分</h3>
                <input type="number" id="score" min="1" max="5" placeholder="1-5分">
                <textarea id="advantages" placeholder="优点"></textarea>
                <textarea id="suggestions" placeholder="建议"></textarea>
                <textarea id="travel-tips" placeholder="给其他游客的建议"></textarea>
                <textarea id="other-comments" placeholder="其他想说的"></textarea>
                <button id="submit-review">提交评价</button>
            </div>
        `;
        document.body.appendChild(container);

        // 添加事件监听
        const descButton = document.getElementById('get-description');
        const placeInput = document.getElementById('place-input');
        const submitReview = document.getElementById('submit-review');

        descButton.addEventListener('click', () => this.getDescription());
        placeInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.getDescription();
            }
        });
        submitReview.addEventListener('click', () => this.submitReview());
    }

    async getDescription() {
        const place = document.getElementById('place-input').value.trim();
        if (!place) {
            alert('请输入地点名称');
            return;
        }

        try {
            const response = await fetch('http://localhost:5000/api/place', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ place })
            });

            const data = await response.json();
            if (data.description) {
                document.getElementById('description-result').innerHTML = data.description;
                document.getElementById('review-form').style.display = 'block';
            } else {
                document.getElementById('description-result').innerHTML = '获取描述失败';
            }
        } catch (error) {
            console.error('Error:', error);
            document.getElementById('description-result').innerHTML = '获取描述时出错';
        }
    }

    async submitReview() {
        const review = {
            地点: document.getElementById('place-input').value.trim(),
            评分: document.getElementById('score').value,
            时间: new Date().toISOString(),
            优点: document.getElementById('advantages').value.trim(),
            建议: document.getElementById('suggestions').value.trim(),
            游玩建议: document.getElementById('travel-tips').value.trim(),
            其他评价: document.getElementById('other-comments').value.trim()
        };

        try {
            const response = await fetch('http://localhost:5000/api/review', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(review)
            });

            const data = await response.json();
            alert('评价提交成功！');
            document.getElementById('review-form').style.display = 'none';
        } catch (error) {
            console.error('Error:', error);
            alert('评价提交失败');
        }
    }
} 