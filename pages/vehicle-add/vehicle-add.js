// pages/vehicle-add/vehicle-add.js —— 建档 / 编辑车辆流程
const { getBrandGroups, searchModels, getModel, findModel } = require('../../utils/models');
const { addVehicle, getVehicle, updateVehicle } = require('../../utils/api');
const store = require('../../utils/store');

Page({
  data: {
    editMode: false,
    editId: '',
    editName: '',
    keyword: '',
    groups: [],          // 品牌分组（搜索时退化为扁平列表，按品牌归并）
    selected: null,
    currentKm: '',
    lastOilKm: '',
    purchaseDate: '',
    year: '',
    usage: { urban: false, shortTrip: false, dusty: false },
    submitting: false,
    // 手动建档兜底：车型不在预设列表时，用户自行填写品牌/车系并选择动力类型
    manualMode: false,
    manualBrand: '',
    manualSeries: '',
    manualPowertrain: 'fuel', // fuel | ev | range_ext
  },

  onLoad(options) {
    this.setData({ groups: getBrandGroups(), manualMode: false, manualBrand: '', manualSeries: '', manualPowertrain: 'fuel' });
    if (options && options.vehicleId) {
      this.initEdit(options.vehicleId);
    }
  },

  // 切换「手动建档」模式（仅建档模式可用，编辑已有车辆走原流程）
  toggleManual() {
    if (this.data.editMode) return;
    const on = !this.data.manualMode;
    // 进入手动模式清空已选预设车型，避免两套来源混淆
    this.setData({ manualMode: on, selected: on ? null : this.data.selected });
  },

  onManualBrand(e) {
    this.setData({ manualBrand: e.detail.value });
  },
  onManualSeries(e) {
    this.setData({ manualSeries: e.detail.value });
  },
  pickPowertrain(e) {
    this.setData({ manualPowertrain: e.currentTarget.dataset.pt });
  },

  // 编辑模式：拉取车辆与记录，预填表单（车型按规则集+车系反查，找不到则保留原值）
  async initEdit(vehicleId) {
    try {
      const res = await getVehicle(vehicleId);
      const v = res.data.vehicle;
      const recs = res.data.records || [];
      const oil = recs
        .filter((r) => r.itemKey === 'engine_oil')
        .sort((a, b) => new Date(b.serviceDate) - new Date(a.serviceDate) || Number(b.serviceKm) - Number(a.serviceKm))[0];
      const sel = findModel(v.ruleSetId, v.series) || null;
      const yearPart = v.year ? v.year + '款' : '';
      this.setData({
        editMode: true,
        editId: vehicleId,
        editName: `${v.brand} ${v.series}${yearPart}`,
        selected: sel,
        currentKm: v.currentKm != null ? String(v.currentKm) : '',
        lastOilKm: oil ? String(oil.serviceKm) : '',
        purchaseDate: v.purchaseDate || '',
        year: v.year || '',
        usage: v.usageProfile || { urban: false, shortTrip: false, dusty: false },
      });
      wx.setNavigationBarTitle({ title: '编辑车辆' });
    } catch (e) {
      wx.showToast({ title: '加载车辆失败', icon: 'none' });
    }
  },

  onSearch(e) {
    const kw = e.detail.value;
    this.setData({ keyword: kw, groups: this.buildGroups(searchModels(kw)) });
  },

  // 搜索结果按品牌归并，保持分组展示
  buildGroups(list) {
    const map = {};
    const order = [];
    list.forEach((m) => {
      if (!map[m.brand]) {
        map[m.brand] = { brand: m.brand, items: [] };
        order.push(m.brand);
      }
      map[m.brand].items.push(m);
    });
    return order.map((b) => map[b]);
  },

  selectModel(e) {
    const id = e.currentTarget.dataset.id;
    this.setData({ selected: getModel(id) });
    wx.pageScrollTo({ selector: '#step2', duration: 200 });
  },

  onKm(e) {
    this.setData({ currentKm: e.detail.value });
  },
  onOil(e) {
    this.setData({ lastOilKm: e.detail.value });
  },
  onDate(e) {
    this.setData({ purchaseDate: e.detail.value });
  },
  onYear(e) {
    // fields="year" 时 picker 返回 "YYYY"，统一取前 4 位，兼容个别基础库返回 "YYYY-MM-DD"
    const y = (e.detail.value || '').slice(0, 4);
    this.setData({ year: y ? Number(y) : '' });
  },

  toggleUsage(e) {
    const key = e.currentTarget.dataset.key;
    this.setData({ [`usage.${key}`]: !this.data.usage[key] });
  },

  async submit() {
    const { selected, currentKm, lastOilKm, purchaseDate, year, usage, editMode, editId, manualMode, manualBrand, manualSeries, manualPowertrain } = this.data;
    if (!currentKm || Number(currentKm) <= 0) {
      wx.showToast({ title: '请填写当前里程', icon: 'none' });
      return;
    }
    if (!editMode && !selected && !manualMode) {
      wx.showToast({ title: '请选择车型或手动填写', icon: 'none' });
      return;
    }
    if (manualMode) {
      if (!manualBrand || !manualBrand.trim() || !manualSeries || !manualSeries.trim()) {
        wx.showToast({ title: '请填写品牌和车系', icon: 'none' });
        return;
      }
    }
    this.setData({ submitting: true });
    try {
      if (editMode) {
        // 编辑：更新可改字段；未重选车型时保留原品牌/车系/规则集
        const payload = {
          vehicleId: editId,
          currentKm: Number(currentKm),
          lastOilKm: lastOilKm ? Number(lastOilKm) : null,
          purchaseDate: purchaseDate || null,
          year: year ? Number(year) : null,
          usageProfile: usage,
        };
        if (selected) {
          payload.brand = selected.brand;
          payload.series = selected.series;
          payload.engine = selected.engine;
          payload.ruleSetId = selected.ruleSetId;
        }
        await updateVehicle(payload);
        store.removeChecklist(editId); // 车辆信息变化，清除旧体检缓存，下次打开重算
        wx.showToast({ title: '已保存', icon: 'success' });
        setTimeout(() => wx.navigateBack(), 600);
        return;
      }
      // 手动建档：车型不在预设列表时，用户填写品牌/车系并选择动力类型，
      // 按动力类型回落到对应通用规则集（燃油→generic / 纯电→ev / 增程→range_ext）。
      let payload;
      if (manualMode) {
        const PT = {
          fuel: { ruleSetId: 'ruleset_generic', engine: '燃油' },
          ev: { ruleSetId: 'ruleset_ev', engine: '纯电' },
          range_ext: { ruleSetId: 'ruleset_range_ext', engine: '增程' },
        };
        const pt = PT[manualPowertrain] || PT.fuel;
        payload = {
          brand: manualBrand.trim(),
          series: manualSeries.trim(),
          engine: pt.engine,
          ruleSetId: pt.ruleSetId,
          year: year ? Number(year) : null,
          currentKm: Number(currentKm),
          lastOilKm: lastOilKm ? Number(lastOilKm) : null,
          purchaseDate: purchaseDate || null,
          usageProfile: usage,
        };
      } else {
        payload = {
          modelId: selected.id,
          brand: selected.brand,
          series: selected.series,
          engine: selected.engine,
          ruleSetId: selected.ruleSetId,
          year: year ? Number(year) : null,
          currentKm: Number(currentKm),
          lastOilKm: lastOilKm ? Number(lastOilKm) : null,
          purchaseDate: purchaseDate || null,
          usageProfile: usage,
        };
      }
      const res = await addVehicle(payload);
      wx.showToast({ title: '添加成功', icon: 'success' });
      setTimeout(() => {
        wx.redirectTo({ url: `/pages/checklist/checklist?vehicleId=${res.data._id}` });
      }, 700);
    } catch (e) {
      wx.showToast({ title: editMode ? '保存失败，请重试' : '添加失败，请重试', icon: 'none' });
    } finally {
      this.setData({ submitting: false });
    }
  },
});
