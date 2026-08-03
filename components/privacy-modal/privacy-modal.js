// components/privacy-modal —— 隐私授权底部弹层
// 任意页面引入即可，由 utils/privacy 的全局事件控制显隐。
// 同意按钮使用官方 open-type="agreePrivacyAuthorization"，点击即完成平台授权登记。

const privacy = require('../../utils/privacy');

Component({
  data: {
    show: false,
  },

  lifetimes: {
    attached() {
      this.unsub = privacy.onPrivacyShow((shown) => {
        this.setData({ show: shown });
      });
    },
    detached() {
      if (this.unsub) this.unsub();
    },
  },

  methods: {
    noop() {},

    // 绑定在「同意并继续」按钮的 bindagreeprivacyauthorization 事件
    onAgree() {
      privacy.agree();
    },

    onReject() {
      privacy.reject();
    },

    // 查看完整隐私政策：优先打开平台契约页，未配置时回退到应用内政策页
    openContract() {
      wx.openPrivacyContract({
        fail: () => {
          wx.navigateTo({ url: '/pages/privacy/privacy' });
        },
      });
    },
  },
});
