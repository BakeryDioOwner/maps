class MapManager {
    constructor() {
        this.map = null;
        this.marker = null;
        this.geolocation = null;
        this.init();
    }

    init() {
        // 初始化地图
        this.map = new AMap.Map('map-container', {
            zoom: 11,
            center: [116.397428, 39.90923], // 北京市中心
            viewMode: '3D'
        });

        // 添加地图控件
        this.map.addControl(new AMap.Scale());
        this.map.addControl(new AMap.ToolBar());

        // 初始化定位
        this.initGeolocation();
    }

    initGeolocation() {
        AMap.plugin('AMap.Geolocation', () => {
            this.geolocation = new AMap.Geolocation({
                enableHighAccuracy: true, // 使用高精度定位
                timeout: 10000, // 超时时间
                buttonPosition: 'RB', // 定位按钮位置
                buttonOffset: new AMap.Pixel(10, 20), // 定位按钮偏移量
                zoomToAccuracy: true // 定位成功后是否自动调整地图视野
            });

            this.map.addControl(this.geolocation);

            // 监听定位成功事件
            this.geolocation.getCurrentPosition((status, result) => {
                if (status === 'complete') {
                    this.onLocationSuccess(result);
                } else {
                    this.onLocationError(result);
                }
            });
        });
    }

    onLocationSuccess(data) {
        const position = [data.position.lng, data.position.lat];
        
        // 清除旧的标记
        if (this.marker) {
            this.marker.setMap(null);
        }

        // 创建新的标记
        this.marker = new AMap.Marker({
            position: position,
            icon: new AMap.Icon({
                size: new AMap.Size(40, 40),
                image: 'https://webapi.amap.com/theme/v1.3/markers/n/mark_b.png',
                imageSize: new AMap.Size(40, 40)
            }),
            offset: new AMap.Pixel(-20, -40)
        });

        // 将标记添加到地图
        this.marker.setMap(this.map);

        // 添加信息窗体
        const infoWindow = new AMap.InfoWindow({
            content: `
                <div>
                    <p>当前位置：${data.formattedAddress}</p>
                    <p>经度：${data.position.lng}</p>
                    <p>纬度：${data.position.lat}</p>
                    <p>定位精度：${data.accuracy} 米</p>
                </div>
            `,
            offset: new AMap.Pixel(0, -40)
        });

        // 点击标记时显示信息窗体
        this.marker.on('click', () => {
            infoWindow.open(this.map, position);
        });

        // 自动适应视野
        this.map.setFitView();
    }

    onLocationError(error) {
        console.error('定位失败：', error);
        alert('定位失败，请确保已授权位置访问权限');
    }

    // 手动更新位置
    updateLocation() {
        if (this.geolocation) {
            this.geolocation.getCurrentPosition();
        }
    }
}

// 页面加载完成后初始化地图
document.addEventListener('DOMContentLoaded', () => {
    const mapManager = new MapManager();

    // 添加定时更新位置的功能（每5分钟更新一次）
    setInterval(() => mapManager.updateLocation(), 5 * 60 * 1000);
});