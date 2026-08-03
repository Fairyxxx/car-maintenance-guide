// app.js —— 全局初始化（纯前端，零后端）
// 本项目所有数据存于本机 wx.storage，保养判定在端上 engine 完成，无需任何服务器或云环境。
// 直接用微信开发者工具编译即可跑通完整链路，无需开通云开发、无需部署后端、无需域名备案。

const privacy = require('./utils/privacy');

App({
  globalData: {
    // 当前查看的结论（页面间传递，item-detail 按 itemKey 还原单项）
    currentChecklist: null,
  },

  onLaunch() {
    // 隐私授权为微信基础库接口，与是否联网/上云无关，始终初始化
    privacy.initPrivacy();
  },

  // 全局异常兜底：未捕获的同步错误 / Promise 拒绝统一收集，避免直接白屏。
  // 不吞掉错误（仍打印到控制台便于排查），仅在真正致命时给用户一个友好提示，
  // 让主链路在个别边界异常下不至于整页崩溃。
  onError(err) {
    console.error('[app] 全局异常', err);
  },

  onUnhandledRejection(res) {
    const reason = res && (res.reason || res.promise);
    console.error('[app] 未处理的 Promise 拒绝', reason);
  },
});
