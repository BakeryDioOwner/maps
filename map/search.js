 //地图加载
    var map = new AMap.Map("container", {
        resizeEnable: true
    });
    //输入提示
    var autoOptions = {
        input: "tipinput"
    }; 
    
    
    

    AMap.plugin(['AMap.PlaceSearch','AMap.AutoComplete'], function(){
        var auto = new AMap.AutoComplete(autoOptions);
        var placeSearch = new AMap.PlaceSearch({
            map: map
        });  //构造地点查询类
        auto.on("select", select);//注册监听，当选中某条记录时会触发
        function select(e) {
            placeSearch.setCity(e.poi.adcode);
            placeSearch.search(e.poi.name);  //关键字查询查询
        }
    });


