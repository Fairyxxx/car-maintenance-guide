// pages/checklist/checklist.js —— 保养体检结论页（核心页）
const { getChecklist, requestSubscribe, addRecord, deleteRecord, updateKm } = require('../../utils/api');
const store = require('../../utils/store');
const { fromNow, formatDate, formatKm } = require('../../utils/format');
const app = getApp();

// 订阅消息模板 ID。留空表示未启用微信推送提醒。
//
// 说明：微信订阅消息的下发必须由服务端调用 subscribeMessage.send 完成，
// 本项目为纯前端零后端架构，没有服务端定时扫描到期项并推送的能力。
// 因此这里默认留空，「保养提醒」只提供本机能真实兑现的能力（到期预告 + 收藏入口），
// 不向用户承诺做不到的推送。日后若接入服务端，在此填入模板 ID 即自动启用推送入口。
const SUBSCRIBE_TMPL = [];

const HEALTH_COLOR = { bad: '#ff4d6d', warn: '#fbbf24', good: '#34d399' };
const HEALTH_LABEL = { bad: '需关注', warn: '需注意', good: '状态良好' };

Page({
  data: {
    vehicleId: '',
    vehicle: null,
    healthScore: null,
    healthLevel: '',
    healthColor: '#34d399',
    healthLabel: '',
    summary: { overdueCount: 0, soonCount: 0, okCount: 0, skipCount: 0 },
    grouped: { overdue: [], soon: [], ok: [], skip: [] },
    manual: null,
    nextDue: null,
    lastService: null,
    serviceHistory: [],
    showHistory: false,
    disclaimer: '',
    evaluatedText: '',
    loading: true,
    showOk: false,
    // 补录保养记录弹层状态
    showRecordModal: false,
    recordDate: '',
    recordKm: '',
    recordCandidates: [],
    submittingRecord: false,
    // 更新里程弹层状态（里程是结论核心依据，允许在体检页直接改）
    showKmModal: false,
    kmInput: '',
    updatingKm: false,
    // 保养提醒弹层：仅展示本机能兑现的能力；推送入口按模板配置与否条件显示
    showRemindModal: false,
    subscribeReady: SUBSCRIBE_TMPL.length > 0,
  },

  onLoad(options) {
    const id = options.vehicleId;
    this.setData({ vehicleId: id });

    if (!id) {
      wx.showToast({ title: '缺少车辆ID', icon: 'none' });
      this.setData({ loading: false });
      return;
    }

    // 离线兜底：先渲染本地缓存结论（弱网/地下车库秒开）
    const cache = store.getChecklist(id);
    if (cache && cache.data) this.applyData(cache.data, true);

    this.load(id);
  },

  async load(id) {
    this.setData({ loading: true });
    try {
      const res = await getChecklist(id);
      if (!res || !res.data) {
        throw new Error(res && res.message ? res.message : '返回数据为空');
      }
      this.applyData(res.data, false);
      store.saveChecklist(id, res.data);
      app.globalData.currentChecklist = res.data;
    } catch (e) {
      console.error('[checklist] 加载失败', e);
      if (!this.data.vehicle) wx.showToast({ title: '加载失败', icon: 'none' });
    } finally {
      this.setData({ loading: false });
      // 收起下拉刷新（无刷新时调用为无操作的 no-op）
      wx.stopPullDownRefresh();
    }
  },

  // 手动下拉刷新：补录保养 / 更新里程后主动拉取最新结论
  onPullDownRefresh() {
    if (this.data.vehicleId) this.load(this.data.vehicleId);
    else wx.stopPullDownRefresh();
  },

  applyData(data, fromCache) {
    // 里程千分位对齐展示：remainingKm / lastServiceKm 经 formatKm 预格式化为文本，
    // 避免 item-card 与 item-detail 仍显示裸数字（如 28000 km）
    const fmt = (km) => (km === null || km === undefined ? '' : formatKm(km));
    const grouped = {};
    ['overdue', 'soon', 'ok', 'skip'].forEach((k) => {
      grouped[k] = (data.grouped[k] || []).map((it) => ({
        ...it,
        remainingKmText: fmt(it.remainingKm),
        lastServiceKmText: fmt(it.lastServiceKm),
      }));
    });

    this.setData({
      vehicle: {
        ...data.vehicle,
        kmText: formatKm(data.vehicle.currentKm),
      },
      summary: data.summary,
      // 健康度：引擎已算好（data.health），兜底用 summary 本地重算，保证任何来源都展示
      healthScore: data.health && data.health.hasData ? data.health.score : null,
      healthLevel: data.health && data.health.level ? data.health.level : '',
      healthColor:
        HEALTH_COLOR[data.health && data.health.level] || '#34d399',
      healthLabel: HEALTH_LABEL[data.health && data.health.level] || '',
      grouped,
      manual: data.manual,
      nextDue: data.nextDue || null,
      // 上次保养里程千分位对齐 hero 展示（如 28,000 km）
      lastService: data.lastService
        ? { ...data.lastService, kmText: formatKm(data.lastService.km) }
        : null,
      // 全部保养记录：每条里程千分位对齐流水展示
      serviceHistory: (data.serviceHistory || []).map((r) => ({
        ...r,
        kmText: formatKm(r.km),
      })),
      disclaimer: data.disclaimer,
      evaluatedText: fromCache
        ? '缓存 · ' + fromNow(data.evaluatedAt)
        : '更新于 ' + fromNow(data.evaluatedAt),
    });
  },

  toggleOk() {
    this.setData({ showOk: !this.data.showOk });
  },

  toggleHistory() {
    this.setData({ showHistory: !this.data.showHistory });
  },

  // 删除单条保养记录：误录或录错里程时可直接撤回，删除后判定基线自动重算。
  // rid 由 buildServiceHistory 附带（新记录为真实 rid，旧记录按复合键回退），精确匹配不误伤其它流水。
  async deleteHistoryItem(e) {
    const rid = e.currentTarget.dataset.rid;
    if (!rid) return;
    const confirmed = await new Promise((resolve) =>
      wx.showModal({
        title: '删除这条记录',
        content: '删除后该项目的判定基线会重新计算，操作不可撤销',
        confirmColor: '#ff4d6d',
        success: (r) => resolve(!!r.confirm),
      })
    );
    if (!confirmed) return;
    try {
      await deleteRecord({ vehicleId: this.data.vehicleId, rid });
      wx.showToast({ title: '已删除', icon: 'success' });
      await this.load(this.data.vehicleId);
    } catch (err) {
      wx.showToast({ title: '删除失败，请重试', icon: 'none' });
    }
  },

  onSelect(e) {
    const item = e.detail.item;
    wx.navigateTo({
      url: `/pages/item-detail/item-detail?itemKey=${item.itemKey}&vehicleId=${this.data.vehicleId}`,
    });
  },

  // 保养提醒：展示下次到期预告 + 收藏引导。零后端下这是能真实兑现的部分，
  // 不弹「请配置模板」这类开发者话术，也不承诺无法送达的推送。
  openRemindModal() {
    if (!this.data.vehicle) return;
    this.setData({ showRemindModal: true });
  },

  closeRemindModal() {
    this.setData({ showRemindModal: false });
  },

  // 从提醒弹层跳去更新里程：先收起提醒层，避免两层弹层叠加
  remindUpdateKm() {
    this.setData({ showRemindModal: false });
    this.openKmModal();
  },

  // 跳转保养花费看板：从体检结论页直达，用户看完报告顺手记下花了多少，
  // 让「花费」这个子包能力不再被埋在「我的」里三层。
  goCost() {
    const v = this.data.vehicle;
    if (!v) return;
    const name = v.modelName || '';
    wx.navigateTo({
      url: `/subpackages/cost/index?vehicleId=${this.data.vehicleId}&name=${encodeURIComponent(name)}`,
    });
  },

  // 仅在后台已配置订阅模板时才可达（按钮条件渲染）
  async onSubscribe() {
    const res = await requestSubscribe(SUBSCRIBE_TMPL);
    if (res.accepted && res.accepted.length) {
      this.setData({ showRemindModal: false });
      wx.showToast({ title: '已开启微信提醒', icon: 'success' });
    } else {
      wx.showToast({ title: '未开启，可稍后再试', icon: 'none' });
    }
  },

  // 补录一次保养记录：让"上次保养"空状态从死链变可用，并刷新判定基线
  openRecordModal() {
    if (!this.data.vehicle) return;
    const seen = {};
    const candidates = [];
    ['overdue', 'soon', 'ok'].forEach((k) => {
      (this.data.grouped[k] || []).forEach((it) => {
        if (!seen[it.itemKey]) {
          seen[it.itemKey] = true;
          candidates.push({ itemKey: it.itemKey, name: it.name, checked: false });
        }
      });
    });
    this.setData({
      showRecordModal: true,
      recordCandidates: candidates,
      recordDate: formatDate(new Date()),
      recordKm: String(this.data.vehicle.currentKm || ''),
    });
  },

  toggleRecordItem(e) {
    const key = e.currentTarget.dataset.key;
    const list = this.data.recordCandidates.map((c) =>
      c.itemKey === key ? { ...c, checked: !c.checked } : c
    );
    this.setData({ recordCandidates: list });
  },

  onRecordDate(e) {
    this.setData({ recordDate: e.detail.value });
  },

  onRecordKm(e) {
    this.setData({ recordKm: e.detail.value });
  },

  closeRecordModal() {
    this.setData({ showRecordModal: false });
  },

  noop() {},

  // 在体检页直接更新里程：里程是结论的核心依据，改完立即重算
  openKmModal() {
    if (!this.data.vehicle) return;
    this.setData({
      showKmModal: true,
      kmInput: String(this.data.vehicle.currentKm || ''),
    });
  },

  onKmInput(e) {
    this.setData({ kmInput: e.detail.value });
  },

  closeKmModal() {
    this.setData({ showKmModal: false });
  },

  async submitKm() {
    const { vehicleId, kmInput } = this.data;
    if (!kmInput || Number(kmInput) <= 0) {
      wx.showToast({ title: '请填写里程', icon: 'none' });
      return;
    }
    this.setData({ updatingKm: true });
    try {
      await updateKm(vehicleId, Number(kmInput));
      this.setData({ showKmModal: false });
      wx.showToast({ title: '已更新', icon: 'success' });
      await this.load(vehicleId);
    } catch (e) {
      wx.showToast({ title: '更新失败', icon: 'none' });
    } finally {
      this.setData({ updatingKm: false });
    }
  },

  async submitRecord() {
    const { vehicleId, recordDate, recordKm, recordCandidates } = this.data;
    const picked = recordCandidates.filter((c) => c.checked);
    if (!picked.length) {
      wx.showToast({ title: '请选择更换了哪些项目', icon: 'none' });
      return;
    }
    if (!recordKm || Number(recordKm) <= 0) {
      wx.showToast({ title: '请填写当时里程', icon: 'none' });
      return;
    }
    this.setData({ submittingRecord: true });
    try {
      await Promise.all(
        picked.map((c) =>
          addRecord({
            vehicleId,
            itemKey: c.itemKey,
            serviceKm: Number(recordKm),
            serviceDate: recordDate,
          })
        )
      );
      this.setData({ showRecordModal: false });
      wx.showToast({ title: '已补录', icon: 'success' });
      await this.load(vehicleId);
    } catch (e) {
      wx.showToast({ title: '补录失败，请重试', icon: 'none' });
    } finally {
      this.setData({ submittingRecord: false });
    }
  },

  onShareAppMessage() {
    const s = this.data.summary;
    return {
      title: `我的车做了次保养体检：${s.overdueCount} 项该换，${s.skipCount} 项完全不用换！`,
      path: `/pages/checklist/checklist?vehicleId=${this.data.vehicleId}`,
    };
  },

  onShareTimeline() {
    const s = this.data.summary;
    return {
      title: `保养体检：${s.overdueCount} 项该换，${s.skipCount} 项其实完全不用换`,
      query: `vehicleId=${this.data.vehicleId}`,
    };
  },
});
