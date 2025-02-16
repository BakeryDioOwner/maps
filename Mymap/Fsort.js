var map;
var placeSearch;
var currentResults = []; // 存储当前搜索结果
var currentCategory = 'all'; // 当前分类
var currentPage = 1; // 当前页码
var itemsPerPage = 5; // 每页显示的搜索结果数量

AMapLoader.load({
    key: '9655ab1d97c01e675e7045780ebdf7b5',
    version: '2.0',
    plugins: ['AMap.Scale', 'AMap.ToolBar', 'AMap.Geocoder', 'AMap.PlaceSearch', 'AMap.Driving', 'AMap.CitySearch']
}).then((AMap) => {
    map = new AMap.Map('container', {
        zoom: 11,
        center: [116.397428, 39.90923]
    });
    map.addControl(new AMap.Scale());
    map.addControl(new AMap.ToolBar());

    // 加载 CitySearch 插件，进行IP定位
    AMap.plugin('AMap.CitySearch', function() {
        var citySearch = new AMap.CitySearch();
        citySearch.getLocalCity(function(status, result) {
            if (status === 'complete' && result.info === 'OK') {
                // 获取城市成功
                var city = result.city;
                var bounds = result.bounds;
                map.setBounds(bounds); // 将地图视野设置为城市范围
                console.log('用户所在城市：', city);
            } else {
                console.error('IP定位失败：', result.info);
            }
        });
    });

    // 加载 PlaceSearch 插件
    AMap.plugin(["AMap.PlaceSearch"], function() {
        placeSearch = new AMap.PlaceSearch({
            type: '餐饮服务|住宿服务|风景名胜',
            panel: "panel",
            map: map,
            autoFitView: true
        });
    });

    // 获取用户位置
    document.getElementById('getLocation').onclick = function() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(showPosition, showError);
        } else {
            alert("Geolocation is not supported by this browser.");
        }
    };

    function showPosition(position) {
        var lat = position.coords.latitude;
        var lng = position.coords.longitude;
        startPoint = {
            location: [lng, lat]
        };
        var marker = new AMap.Marker({
            position: new AMap.LngLat(lng, lat),
            map: map
        });
        map.setCenter(new AMap.LngLat(lng, lat));
    }

    function showError(error) {
        switch(error.code) {
            case error.PERMISSION_DENIED:
                alert("User denied the request for Geolocation.");
                break;
            case error.POSITION_UNAVAILABLE:
                alert("Location information is unavailable.");
                break;
            case error.TIMEOUT:
                alert("The request to get user location timed out.");
                break;
            case error.UNKNOWN_ERROR:
                alert("An unknown error occurred.");
                break;
        }
    }


    // 搜索按钮点击事件
    document.getElementById('searchButton').onclick = function() {
        var keyword = document.getElementById('search').value;
        if (keyword) {
            placeSearch.search(keyword, function(status, result) {
                if (status === 'complete' && result.info === 'OK') {
                    var pois = result.poiList.pois;
                    if (pois.length > 0) {
                        currentResults = pois; // 存储搜索结果
                        displayResults(currentResults); // 显示搜索结果
                    } else {
                        alert('未找到相关地点');
                    }
                } else {
                    console.error('搜索失败：', result.info);
                    alert('搜索失败：' + result.info);
                }
            });
        }
    };

    // 显示搜索结果
    function displayResults(pois) {
        var panel = document.getElementById('panel');
        panel.innerHTML = '<div class="sort-buttons">' +
            '<button id="sortByComprehensive">综合</button>' +
            '<button id="sortByRating">评分</button>' +
            '<button id="sortByDistance">距离</button>' +
            '</div>' +
            '<div class="category-buttons">' +
            '<button id="filterRestaurant">餐饮</button>' +
            '<button id="filterHotel">酒店</button>' +
            '<button id="filterAttraction">名胜</button>' +
            '</div>';

        if (pois.length === 0) {
            panel.innerHTML += '<p>未找到相关结果</p>';
            return;
        }

        // 根据当前分类过滤结果
        var filteredResults = filterResultsByCategory(pois);


        // 计算当前页的结果范围
        var startIndex = (currentPage - 1) * itemsPerPage;
        var endIndex = startIndex + itemsPerPage;
        var paginatedResults = filteredResults.slice(startIndex, endIndex);

        var html = '<ul>';
        paginatedResults.forEach(function (poi) {
            html += `<li>
            <strong>${poi.name}</strong><br>
            地址: ${poi.address}<br>
            距离: ${poi.distance}米<br>
            ${poi.rating ? `<a href="https://www.example.com/reviews/${poi.id}" target="_blank">评分: ${poi.rating}</a>` : '无评分'}
            <button onclick="showDescription('${poi.name}')">查看介绍</button>
        </li>`;
        
        });
        html += '</ul>';

        panel.innerHTML += html;

        // 添加分页按钮
        panel.innerHTML += `
            <div class="pagination">
                <button id="prevPage">上一页</button>
                <span id="pageInfo">第 ${currentPage} 页 / 共 ${Math.ceil(filteredResults.length / itemsPerPage)} 页</span>
                <button id="nextPage">下一页</button>
            </div>
        `;

        // 绑定分页按钮事件
        bindPaginationEvents();

        // 绑定排序按钮事件
        document.getElementById('sortByRating').onclick = function() {
            sortResults('rating');
        };
        document.getElementById('sortByDistance').onclick = function() {
            sortResults('distance');
        };
        document.getElementById('sortByComprehensive').onclick = function() {
            sortResults('comprehensive');
        };

        // 绑定分类按钮事件
        document.getElementById('filterRestaurant').onclick = function() {
            currentCategory = 'restaurant';
            displayResults(currentResults);
        };
        document.getElementById('filterHotel').onclick = function() {
            currentCategory = 'hotel';
            displayResults(currentResults);
        };
        document.getElementById('filterAttraction').onclick = function() {
            currentCategory = 'attraction';
            displayResults(currentResults);
        };
    }

    // 根据分类过滤结果
    function filterResultsByCategory(pois) {
        if (currentCategory === 'all') {
            return pois;
        }
        return pois.filter(function(poi) {
            if (currentCategory === 'restaurant') {
                return poi.type.indexOf('餐饮服务') !== -1;
            } else if (currentCategory === 'hotel') {
                return poi.type.indexOf('住宿服务') !== -1;
            } else if (currentCategory === 'attraction') {
                return poi.type.indexOf('风景名胜') !== -1;
            }
            return true;
        });
    }

    // 排序结果
    function sortResults(sortType) {
        var filteredResults = filterResultsByCategory(currentResults);
        if (sortType === 'rating') {
            filteredResults.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        } else if (sortType === 'distance') {
            filteredResults.sort((a, b) => (a.distance || 0) - (b.distance || 0));
        } else if (sortType === 'comprehensive') {
            filteredResults.sort((a, b) => {
                var scoreA = (b.rating || 0) * 0.7 - (a.distance || 0) * 0.3;
                var scoreB = (a.rating || 0) * 0.7 - (b.distance || 0) * 0.3;
                return scoreB - scoreA;
            });
        }
        displayResults(filteredResults); // 重新显示排序后的结果
    }

    // 绑定分页按钮事件
    function bindPaginationEvents() {
        document.getElementById('prevPage').onclick = function() {
            if (currentPage > 1) {
                currentPage--;
                displayResults(currentResults);
            }
        };
        document.getElementById('nextPage').onclick = function() {
            var totalPages = Math.ceil(currentResults.length / itemsPerPage);
            if (currentPage < totalPages) {
                currentPage++;
                displayResults(currentResults);
            }
        };
    }

    // 显示讲解弹窗
    function showDescription(name) {
        // 调用百度百科或 AI API 获取地点介绍
        fetchDescription(name).then(description => {
            document.getElementById('descriptionTitle').innerText = name;
            document.getElementById('descriptionContent').innerText = description;
            document.getElementById('descriptionModal').style.display = 'block';
        }).catch(error => {
            console.error('获取介绍失败：', error);
            alert('获取介绍失败，请重试');
        });
    }

    // 关闭讲解弹窗
    document.getElementById('closeDescriptionModal').onclick = function() {
        document.getElementById('descriptionModal').style.display = 'none';
    };

    // 模拟调用百度百科或 AI API 获取地点介绍
    function fetchDescription(name) {
        return new Promise((resolve, reject) => {
            // 这里可以替换为实际的 API 调用
            setTimeout(() => {
                resolve(`${name} 是一个著名的地标，具有丰富的历史和文化背景。它的职能是...，优点是...`);
            }, 1000);
        });
    }

    // 结束搜索按钮点击事件
    document.getElementById('endSearchButton').onclick = function() {
        // 清除搜索结果
        map.clearMap(); // 清除地图上的所有覆盖物
        document.getElementById('panel').innerHTML = ''; // 清空右侧面板
        alert('搜索已结束');
    };

});
