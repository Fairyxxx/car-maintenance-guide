// subpackages/cost/index.js —— 保养花费看板（子包，纯前端零后端）
// 每笔花费存于本机 db.costs[vehicleId]，聚合统计全部本地可算，无需服务器。
const { listCosts, addCost, deleteCost, summarizeCosts } = require('../../utils/api');
const { formatDate, formatKm, formatYuan } = require('../../utils/format');

Page({
  data: {
    vehicleId: '',
    vehicleName: '',
    costs: [],
    totalText: '¥0',
    thisYearText: '¥0',
    count: 0,
    byMonth: [],
    max: 1,
    showAdd: false,
    date: '',
    km: '',
    amount: '',
    shop: '',
    note: '',
    submitting: false,
  },

  onLoad(options) {
    const name = options && options.name ? decodeURIComponent(options.name) : '';
    this.setData({ vehicleId: options && options.vehicleId ? options.vehicleId : '', vehicleName: name });
  },

  onShow() {
    if (this.data.vehicleId) this.load();
  },

  async load() {
    const id = this.data.vehicleId;
    try {
      const [listRes, sumRes] = await Promise.all([listCosts(id), summarizeCosts(id)]);
      const costs = (listRes.data || []).map((c) => ({
        ...c,
        amountText: formatYuan(c.amount),
        kmText: c.km != null ? formatKm(c.km) : '',
      }));
      const s = sumRes.data;
      const byMonth = (s.byMonth || []).map((m) => ({
        key: m.key,
        label: m.label,
        amount: m.amount,
        amountShort: m.amount ? formatYuan(m.amount) : '',
      }));
      this.setData({
        costs,
        totalText: formatYuan(s.total),
        thisYearText: formatYuan(s.thisYear),
        count: s.count,
        byMonth,
        max: s.max || 1,
      });
    } catch (e) {
      console.error('[cost] 加载失败', e);
      wx.showToast({ title: '加载失败', icon: 'none' });
    }
  },

  openAdd() {
    this.setData({ showAdd: true, date: formatDate(new Date()), km: '', amount: '', shop: '', note: '' });
  },
  closeAdd() {
    this.setData({ showAdd: false });
  },
  noop() {},

  onDate(e) {
    this.setData({ date: e.detail.value });
  },
  onKm(e) {
    this.setData({ km: e.detail.value });
  },
  onAmount(e) {
    this.setData({ amount: e.detail.value });
  },
  onShop(e) {
    this.setData({ shop: e.detail.value });
  },
  onNote(e) {
    this.setData({ note: e.detail.value });
  },

  async submit() {
    const { vehicleId, date, km, amount, shop, note } = this.data;
    if (!amount || Number(amount) <= 0) {
      wx.showToast({ title: '请填写金额', icon: 'none' });
      return;
    }
    this.setData({ submitting: true });
    try {
      await addCost({
        vehicleId,
        date: date || formatDate(new Date()),
        km: km ? Number(km) : null,
        amount: Number(amount),
        shop,
        note,
      });
      this.setData({ showAdd: false });
      wx.showToast({ title: '已记录', icon: 'success' });
      this.load();
    } catch (e) {
      wx.showToast({ title: '保存失败，请重试', icon: 'none' });
    } finally {
      this.setData({ submitting: false });
    }
  },

  onDelete(e) {
    const id = e.currentTarget.dataset.id;
    wx.showModal({
      title: '删除记录',
      content: '确定删除这条花费记录？删除后不可恢复。',
      confirmText: '删除',
      confirmColor: '#ff4d6d',
      success: async (r) => {
        if (!r.confirm) return;
        try {
          await deleteCost({ vehicleId: this.data.vehicleId, costId: id });
          wx.showToast({ title: '已删除', icon: 'success' });
          this.load();
        } catch (err) {
          wx.showToast({ title: '删除失败', icon: 'none' });
        }
      },
    });
  },

  onShareAppMessage() {
    return {
      title: '保养指南：把每笔保养花费记下来，钱花在哪一目了然',
      path: '/pages/index/index',
    };
  },
});
