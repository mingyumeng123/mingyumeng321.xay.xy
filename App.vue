<script>
export default {
    onLaunch: function() {
        console.log('App Launch')
        // 新增：初始化灰鲸广告 SDK
        setTimeout(() => {
            if (process.env.UNI_PLATFORM === 'app-plus' && window.hjAd) {
                window.hjAd.init({
                    appId: '59185你的灰鲸 App ID', // 替换成你的 App ID
                    debug: true
                }, (res) => {
                    console.log('灰鲸 SDK 初始化结果:', res);
                });
            }
        }, 1000);
    },
    onShow: function() {
        console.log('App Show')
    },
    onHide: function() {
        console.log('App Hide')
    }
}
</script>

<style>
/*每个页面公共css */
</style>