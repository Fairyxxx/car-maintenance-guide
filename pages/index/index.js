// pages/index/index.js —— 首页：我的车辆
const { listVehicles, getChecklist } = require('../../utils/api');
const { getChecklist: getCachedChecklist, saveChecklist } = require('../../utils/store');
const { formatKm } = require('../../utils/format');
const { computeHealth } = require('../../utils/engine');

const HEALTH_COLOR = { bad: '#ff4d6d', warn: '#fbbf24', good: '#34d399' };
const HEALTH_LABEL = { bad: '需关注', warn: '需注意', good: '状态良好' };

// 给车辆列表附加「缓存体检结论」摘要，首页即可一眼看出哪辆车该关注
// 并据结论推导「健康度评分」，无需新增存储字段（纯由 summary 计算）。
function decorate(list) {
  return (list || []).map((v) => {
    const decorated = { ...v, kmText: formatKm(v.currentKm) };
    const cache = getCachedChecklist(v._id);
    const s = cache && cache.data && cache.data.summary;
    if (s) {
      decorated.alerts = s.overdueCount || 0;
      decorated.statusHint = `${s.overdueCount} 项该换 · ${s.skipCount} 项不用换`;
      // 把「下次保养预告」也带到首页卡片，让车主一眼看到最近要处理的项目，
      // 不必先点进体检页。数据来自缓存结论里的 nextDue（端上即可算，无需后端）。
      const nd = cache.data && cache.data.nextDue;
      if (nd && nd.text) {
        decorated.nextDueText = nd.text;
        decorated.nextDueStatus = nd.status;
      }
      // 缓存结论可能来自旧版本（无 health 字段），用 summary 即时推导，保证口碑环即时可见
      const h = (cache.data && cache.data.health) || computeHealth(s);
      if (h && h.hasData) {
        decorated.hasHealth = true;
        decorated.healthScore = h.score;
        decorated.healthLevel = h.level;
        decorated.healthColor = HEALTH_COLOR[h.level] || '#34d399';
        decorated.healthLabel = HEALTH_LABEL[h.level] || '';
      }
    }
    return decorated;
  });
}

Page({
  data: {
    vehicles: [],
    loading: true,
  },

  onShow() {
    this.load();
  },

  async load() {
    this.setData({ loading: true });

    // 车辆列表由 engine 直接读本机存储，是同步级操作，无需再套一层列表缓存
    // （那样会在删车后残留「幽灵车」）。体检结论仍走缓存，见 decorate()。
    try {
      const res = await listVehicles();
      this.setData({ vehicles: decorate(res.data || []), loading: false });
      // 后台为每辆车拉取最新体检结论，让首页卡片直接显示「X 项该换」，
      // 不再需要先点进每辆车的体检页。失败静默忽略，不阻塞主链路。
      this.refreshStatuses(res.data || []);
    } catch (e) {
      this.setData({ loading: false });
      wx.showToast({ title: '加载失败', icon: 'none' });
    }
  },

  // 后台刷新每辆车的体检状态摘要，逐辆 setData 局部更新，单辆失败不影响其他
  async refreshStatuses(vehicles) {
    // TTL：本地缓存 5 分钟内且已有结论则跳过重复拉取，
    // 避免每次 onShow（如从体检页返回）都打引擎，减少无谓网络与 setData。
    const FRESH_MS = 5 * 60 * 1000;
    const now = Date.now();
    await Promise.all(
      (vehicles || []).map(async (v) => {
        try {
          const cached = getCachedChecklist(v._id);
          if (cached && cached.data && cached.data.summary && now - (cached.at || 0) < FRESH_MS) {
            return;
          }
          const r = await getChecklist(v._id);
          if (!r || !r.data || !r.data.summary) return;
          saveChecklist(v._id, r.data); // 写入本地缓存，下次冷启秒开
          const idx = this.data.vehicles.findIndex((x) => x._id === v._id);
          if (idx === -1) return;
          const s = r.data.summary;
          const h = r.data.health || computeHealth(s);
          const key = `vehicles[${idx}]`;
          const patch = {
            [`${key}.alerts`]: s.overdueCount || 0,
            [`${key}.statusHint`]: `${s.overdueCount} 项该换 · ${s.skipCount} 项不用换`,
          };
          if (r.data.nextDue && r.data.nextDue.text) {
            patch[`${key}.nextDueText`] = r.data.nextDue.text;
            patch[`${key}.nextDueStatus`] = r.data.nextDue.status;
          }
          if (h && h.hasData) {
            patch[`${key}.hasHealth`] = true;
            patch[`${key}.healthScore`] = h.score;
            patch[`${key}.healthLevel`] = h.level;
            patch[`${key}.healthColor`] = HEALTH_COLOR[h.level] || '#34d399';
            patch[`${key}.healthLabel`] = HEALTH_LABEL[h.level] || '';
          }
          this.setData(patch);
        } catch (e) {
          // 单辆车结论缺失或越权，首页仅不显示其状态，不报错
        }
      })
    );
  },

  goAdd() {
    wx.navigateTo({ url: '/pages/vehicle-add/vehicle-add' });
  },

  // 下拉刷新：与体检页一致，下拉即重新拉取车辆列表
  onPullDownRefresh() {
    this.load().finally(() => wx.stopPullDownRefresh());
  },

  goChecklist(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/checklist/checklist?vehicleId=${id}` });
  },

  goEdit(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/vehicle-add/vehicle-add?vehicleId=${id}` });
  },

  onShareAppMessage() {
    return {
      title: '保养指南：告诉你什么该换，什么不用换',
      path: '/pages/index/index',
    };
  },

  // 首页也支持分享到朋友圈，让车主把「中立第三方保养指南」这个心智扩散出去
  onShareTimeline() {
    const n = this.data.vehicles.length;
    return {
      title: n
        ? `我已用保养指南管理了 ${n} 辆车，什么该换什么不用换一目了然`
        : '保养指南：该换的别漏，不该换的别花冤枉钱',
    };
  },
});
