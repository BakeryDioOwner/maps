
//创建地图
var map;
map = new AMap.Map('container', {
    viewMode: '2D', // 默认使用 2D 模式，如果希望使用带有俯仰角的 3D 模式，请设置 viewMode: '3D'
    zoom:11, // 初始化地图层级
    center: [116.397428, 39.90923] // 初始化地图中心点
});
AMapLoader.load({ //首次调用 load
    key:'002f9fc2e00e5e1ddc1d1b5ec81436ef',//首次load key为必填
    version:'2.0',
    plugins:['AMap.Scale','AMap.ToolBar']
}).then((AMap)=>{
    map = new AMap.Map('container');
    map.addControl(new AMap.Scale())
    map.addControl(new AMap.ToolBar())
    map.add(new AMap.Marker({
        position:map.getCenter()
    }));
}).catch((e)=>{
    console.error(e);
});

AMapLoader.load({ //可多次调用load
    plugins:['AMap.MapType']
}).then((AMap)=>{
    map.addControl(new AMap.MapType())
}).catch((e)=>{
    console.error(e);
});

