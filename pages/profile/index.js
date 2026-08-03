// pages/profile/index.js —— 车主档案（主包 tabBar 页）
const { listVehicles, updateKm, deleteVehicle, fleetSummary } = require('../../utils/api');
const { formatKm, formatYuan } = require('../../utils/format');
const store = require('../../utils/store');

Page({
  data: {
    vehicles: [],
    selId: '',
    km: '',
    // 仪表盘：跨车聚合指标（纯本地可算）
    vehicleCount: 0,
    totalCostText: '¥0',
    alerts: 0,
  },

  onShow() {
    this.load();
  },

  async load() {
    try {
      const res = await listVehicles();
      const list = (res.data || []).map((v) => ({ ...v, kmText: formatKm(v.currentKm) }));
      this.setData({ vehicles: list });
    } catch (e) {
      wx.showToast({ title: '加载失败', icon: 'none' });
    }
    // 仪表盘：跨车聚合（车辆数 / 累计花费 / 待处理项），纯本地可算、零后端
    try {
      const f = await fleetSummary();
      this.setData({
        vehicleCount: f.vehicleCount,
        totalCostText: formatYuan(f.totalCost),
        alerts: f.overdue + f.soon,
      });
    } catch (e) {}
  },

  onSel(e) {
    this.setData({ selId: e.currentTarget.dataset.id });
  },

  onKm(e) {
    this.setData({ km: e.detail.value });
  },

  goAdd() {
    wx.navigateTo({ url: '/pages/vehicle-add/vehicle-add' });
  },

  goSettings() {
    wx.navigateTo({ url: '/subpackages/settings/index' });
  },

  // 跳转保养花费看板：花费按车辆归集，必须先选中一辆车
  goCost() {
    if (!this.data.selId) {
      wx.showToast({ title: '请先在上方选择车辆', icon: 'none' });
      return;
    }
    const v = this.data.vehicles.find((x) => x._id === this.data.selId);
    const name = v ? `${v.brand} ${v.series}${v.year ? ' ' + v.year + '款' : ''}` : '';
    wx.navigateTo({
      url: `/subpackages/cost/index?vehicleId=${this.data.selId}&name=${encodeURIComponent(name)}`,
    });
  },

  onEdit(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/vehicle-add/vehicle-add?vehicleId=${id}` });
  },

  async save() {
    const { selId, km } = this.data;
    if (!selId) {
      wx.showToast({ title: '请选择车辆', icon: 'none' });
      return;
    }
    if (!km || Number(km) <= 0) {
      wx.showToast({ title: '请填写里程', icon: 'none' });
      return;
    }
    try {
      await updateKm(selId, Number(km));
      // 里程是结论核心依据：清除该车体检缓存，让首页卡片下次打开立即重算，
      // 与体检页/编辑车辆页的更新行为保持一致，避免出现首页状态滞后。
      store.removeChecklist(selId);
      wx.showToast({ title: '已更新', icon: 'success' });
      this.setData({ km: '' });
      this.load();
    } catch (e) {
      wx.showToast({ title: '更新失败', icon: 'none' });
    }
  },

  onDelete(e) {
    const { id, name } = e.currentTarget.dataset;
    wx.showModal({
      title: '删除车辆',
      content: `确定删除「${name}」？该车的保养记录也会一并移除。`,
      confirmText: '删除',
      confirmColor: '#ff4d6d',
      success: async (r) => {
        if (!r.confirm) return;
        try {
          await deleteVehicle(id);
          store.removeChecklist(id);
          wx.showToast({ title: '已删除', icon: 'success' });
          if (this.data.selId === id) this.setData({ selId: '', km: '' });
          this.load();
        } catch (err) {
          wx.showToast({ title: '删除失败', icon: 'none' });
        }
      },
    });
  },
});
