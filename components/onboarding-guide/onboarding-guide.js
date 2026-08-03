// components/onboarding-guide —— 首次启动新手引导
// 纯前端：是否看过引导存在本机 wx.storage（key: baoyang_onboarded），零后端、零网络。
// 与 privacy-modal 的隐私授权弹层互不冲突：引导用全屏遮罩（z-index 最高），
// 完成后若仍需隐私授权，下层隐私底部弹层会自然浮现，形成「引导 → 授权」的顺滑顺序。

const STORAGE_KEY = 'baoyang_onboarded';

Component({
  data: {
    show: false,
    current: 0,
    slides: [
      {
        key: 'neutral',
        icon: '⚖️',
        title: '最懂「该换什么」的保养助手',
        desc: '中立第三方，不替 4S 店和修理厂说话。告诉你什么该换、什么不用换，不再为过度保养买单。',
        steps: [],
      },
      {
        key: 'how',
        icon: '📋',
        title: '三步生成专属体检报告',
        desc: '对照你的车型与里程，按厂商保养手册逐项判断，每项都给得出依据。',
        steps: ['添加车辆（品牌 / 里程）', '一键生成专属体检报告', '到店补录，越用越准'],
      },
      {
        key: 'privacy',
        icon: '🔒',
        title: '数据只存在你手机',
        desc: '不上传云端、不采集隐私、可随时备份导出。放心用，你的车况只你自己看得见。',
        steps: [],
      },
    ],
  },

  lifetimes: {
    attached() {
      let seen = false;
      try {
        seen = wx.getStorageSync(STORAGE_KEY) === '1';
      } catch (e) {}
      if (!seen) this.setData({ show: true });
    },
  },

  methods: {
    onChange(e) {
      this.setData({ current: e.detail.current });
    },

    next() {
      const max = this.data.slides.length - 1;
      this.setData({ current: Math.min(this.data.current + 1, max) });
    },

    // 完成或跳过：写入本地标记，永不重复打扰（除非用户在设置里手动重看）
    finish() {
      try {
        wx.setStorageSync(STORAGE_KEY, '1');
      } catch (e) {}
      this.setData({ show: false });
    },
  },
});
