// 初始化 ShareSDK
MobShare.config({
  appkey: '3af0bb82d06fd', // 必填，从 ShareSDK 后台获取
  appsecret: '200eb7b63c004e6d587773651ac99f8c', // 必填，从 ShareSDK 后台获取
});

const shareConfig = {
  title: '今日游玩记录', // 分享标题
  content: '今天去了美丽的西湖，风景如画，心情愉悦！', // 分享内容
  url: 'https://example.com', // 分享链接
  pic: 'https://example.com/poster.jpg' // 分享图片
};

// 分享到微信朋友圈
function shareToWechatTimeline() {
  MobShare.share({
    platform: 'wechat_timeline', // 分享到微信朋友圈
    title: shareConfig.title, // 分享标题
    summary: shareConfig.content, // 分享描述
    pic: shareConfig.pic, // 分享图片
    url: shareConfig.url, // 分享链接
    success: function () {
      console.log('分享到微信朋友圈成功');
    },
    error: function (err) {
      console.error('分享到微信朋友圈失败:', err);
    }
  });
}

// 分享到QQ空间
function shareToQQZone() {
  MobShare.share({
    platform: 'qzone', // 分享到QQ空间
    title: shareConfig.title, // 分享标题
    summary: shareConfig.content, // 分享描述
    pic: shareConfig.pic, // 分享图片
    url: shareConfig.url, // 分享链接
    success: function () {
      console.log('分享到QQ空间成功');
    },
    error: function (err) {
      console.error('分享到QQ空间失败:', err);
    }
  });
}

// 分享到微博
function shareToWeibo() {
  MobShare.share({
    platform: 'sina_weibo', // 分享到微博
    title: shareConfig.title, // 分享标题
    summary: shareConfig.content, // 分享描述
    pic: shareConfig.pic, // 分享图片
    url: shareConfig.url, // 分享链接
    success: function () {
      console.log('分享到微博成功');
    },
    error: function (err) {
      console.error('分享到微博失败:', err);
    }
  });
}

