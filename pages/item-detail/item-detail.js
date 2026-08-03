// pages/item-detail/item-detail.js —— 单项详情
const app = getApp();
const store = require('../../utils/store');
const { getChecklist } = require('../../utils/api');
const { formatKm } = require('../../utils/format');

const STATUS_TEXT = {
  overdue: '需要立即更换',
  soon: '建议关注',
  ok: '暂不用更换',
  skip: '无需理会',
};

// 单项 → 避坑文章映射：把"为什么这么判断"和"避坑科普"打通，
// 让用户在看到结论后能顺手读到对应的深度科普（避坑内容是产品的差异化核心）。
const ITEM_TO_ARTICLE = {
  engine_oil: { id: 1, title: '全合成机油真的能跑 1 万公里吗？' },
  oil_filter: { id: 1, title: '全合成机油真的能跑 1 万公里吗？' },
  transmission_oil: { id: 2, title: '变速箱油「终身免维护」是真话吗？' },
  gear_oil: { id: 2, title: '变速箱油「终身免维护」是真话吗？' },
  throttle_clean: { id: 3, title: '节气门清洗被强推？先问有没有症状' },
  brake_fluid: { id: 4, title: '刹车油凭年限换，还是凭检测换？' },
  brake_pad: { id: 4, title: '刹车油凭年限换，还是凭检测换？' },
  spark_plug: { id: 5, title: '镍合金 vs 铱金：差价与寿命差多少' },
  cabin_filter: { id: 6, title: '空调滤芯每次保养都让换？先看再决定' },
  air_filter: { id: 6, title: '空调滤芯每次保养都让换？先看再决定' },
  oil_additive: { id: 7, title: '燃油宝：清积碳、省油是真还是坑' },
  coolant: { id: 8, title: '防冻液：颜色能混加吗？终身免换？' },
  battery: { id: 10, title: '电瓶亏电就直接换？先充试试' },
  // —— 2026-08-03 补齐：保证每个保养项都能顺手读到对应避坑科普（油品/正时/制动/空调/轮胎等）——
  fuel_filter: { id: 7, title: '燃油宝：清积碳、省油是真还是坑' }, // 燃油系统
  transfer_oil: { id: 2, title: '变速箱油「终身免维护」是真话吗？' }, // 分动箱油
  steering_oil: { id: 2, title: '变速箱油「终身免维护」是真话吗？' }, // 转向助力油
  timing_belt: { id: 9, title: '正时皮带/链条：链条真的终身免维护？' }, // 正时皮带
  timing_chain: { id: 9, title: '正时皮带/链条：链条真的终身免维护？' }, // 正时链条
  brake_caliper: { id: 4, title: '刹车油凭年限换，还是凭检测换？' }, // 制动钳
  tire: { id: 4, title: '刹车油凭年限换，还是凭检测换？' }, // 轮胎（安全/按需更换）
  tire_rotation: { id: 4, title: '刹车油凭年限换，还是凭检测换？' }, // 轮胎换位
  engine_flush: { id: 7, title: '燃油宝：清积碳、省油是真还是坑' }, // 发动机内部养护（过度保养）
  ac_disinfect: { id: 6, title: '空调滤芯每次保养都让换？先看再决定' }, // 空调管道杀菌
  ac_desiccant: { id: 6, title: '空调滤芯每次保养都让换？先看再决定' }, // 空调干燥剂
  wiper: { id: 6, title: '空调滤芯每次保养都让换？先看再决定' }, // 雨刮片（易损件自查）
};
const CONF_TEXT = {
  recorded: '基于你的保养记录',
  estimated: '基于购车时间推算（建议补录真实记录）',
  rule: '基于厂商保养手册',
};

Page({
  data: {
    item: null,
    statusText: '',
    confText: '',
    manual: null,          // 该项结论参考的保养手册
    footer: '',            // 底部免责说明（动态引用手册名）
    progressPct: '',       // 已用周期百分比（整数，避免浮点误差）
    isOverdue: false,
  },

  onLoad(options) {
    const { itemKey, vehicleId } = options;
    this.itemKey = itemKey;
    this.vehicleId = vehicleId;

    const found = this.findItem(itemKey, vehicleId);
    if (found) {
      this.apply(found);
      return;
    }

    // 冷启动兜底：内存与本地缓存都无数据时，主动拉取该车结论再还原单项，
    // 让被分享 / 重开直达单项详情的链接也能正常打开（与 checklist 同源兜底）。
    if (vehicleId) {
      wx.showLoading({ title: '加载中' });
      this.fetchAndApply(itemKey, vehicleId)
        .then((ok) => {
          if (!ok) this.fail();
        })
        .catch(() => this.fail())
        .finally(() => wx.hideLoading());
    } else {
      this.fail();
    }
  },

  // 冷启动主动取数：写入本地缓存与全局，便于后续交互与再次冷开
  async fetchAndApply(itemKey, vehicleId) {
    try {
      const res = await getChecklist(vehicleId);
      if (!res || !res.data) return false;
      store.saveChecklist(vehicleId, res.data);
      app.globalData.currentChecklist = res.data;
      const hit = this.searchIn(res.data, itemKey);
      if (hit) {
        this.apply({ item: hit, manual: res.data.manual || null });
        return true;
      }
      return false;
    } catch (e) {
      console.error('[item-detail] 冷启动拉取失败', e);
      return false;
    }
  },

  fail() {
    wx.showToast({ title: '数据丢失', icon: 'none' });
    setTimeout(() => wx.navigateBack(), 800);
  },

  apply(found) {
    const { item, manual } = found;
    this.setData({
      item,
      statusText: STATUS_TEXT[item.status] || '',
      confText: CONF_TEXT[item.confidence] || '',
      manual,
      footer: manual
        ? `本结论整理自《${manual.title}》，仅供参考，实际请以车辆检测结果和随车保养手册为准。`
        : '本结论基于厂商保养手册整理，仅供参考，实际请以车辆检测结果和随车保养手册为准。',
      // 优先用引擎下发的整数百分比（封顶 100），缺失时回退本地取整，杜绝浮点显示
      progressPct: item.progressPct != null
        ? item.progressPct
        : (item.progress != null ? Math.round(item.progress * 100) : ''),
      // 里程千分位对齐（如 28,000 km），与体检页保持一致
      remainingKmText: item.remainingKm != null ? formatKm(item.remainingKm) : '',
      lastServiceKmText: item.lastServiceKm != null ? formatKm(item.lastServiceKm) : '',
      isOverdue: item.progress >= 1,
      // 关联避坑文章：让用户从结论顺手读到对应的深度科普
      relatedArticle: ITEM_TO_ARTICLE[item.itemKey] || null,
    });
  },

  // 跳去避坑文章（深链带 id，内容页会自动展开该篇）
  goRelated() {
    const a = this.data.relatedArticle;
    if (!a) return;
    wx.navigateTo({ url: `/pages/content/index?id=${a.id}` });
  },

  // 优先从当前体检结论还原；兜底从本地持久化缓存（分享深链冷启动后打开场景）
  findItem(itemKey, vehicleId) {
    const live = this.searchIn(app.globalData.currentChecklist, itemKey);
    if (live) return { item: live, manual: (app.globalData.currentChecklist && app.globalData.currentChecklist.manual) || null };
    if (vehicleId) {
      const cached = store.getChecklist(vehicleId);
      if (cached && cached.data) {
        const hit = this.searchIn(cached.data, itemKey);
        if (hit) return { item: hit, manual: cached.data.manual || null };
      }
    }
    return null;
  },

  searchIn(list, itemKey) {
    if (!list || !list.grouped) return null;
    for (const key of Object.keys(list.grouped)) {
      const found = list.grouped[key].find((x) => x.itemKey === itemKey);
      if (found) return found;
    }
    return null;
  },

  // 单项目分享：让「无需理会」这类结论可单独转发给车友，有理有据地说不
  onShareAppMessage() {
    const item = this.data.item;
    if (!item) return { title: '保养指南', path: '/pages/index/index' };
    return {
      title: `${item.name}：${this.data.statusText}，厂商保养手册这样建议`,
      path: `/pages/item-detail/item-detail?itemKey=${item.itemKey}&vehicleId=${this.vehicleId}`,
    };
  },

  onShareTimeline() {
    const item = this.data.item;
    if (!item) return { title: '保养指南', query: '' };
    return {
      title: `${item.name}：${this.data.statusText}`,
      query: `itemKey=${item.itemKey}&vehicleId=${this.vehicleId}`,
    };
  },
});
