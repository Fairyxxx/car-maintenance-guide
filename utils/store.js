// utils/store.js —— 体检结论缓存
// 结论算完后写入本地，首页卡片与体检页可先渲染缓存结论，引擎算完再刷新。
//
// 注意：这里只缓存「体检结论」，不缓存车辆列表。
// 车辆列表由 engine 直接持久化在本机（baoyang_local_db），读取是同步的本机操作，
// 再加一层列表缓存只会带来删车后「幽灵车」这类不一致问题。

const keyOf = (vehicleId) => `checklist_${vehicleId}`;

function saveChecklist(vehicleId, data) {
  try {
    wx.setStorageSync(keyOf(vehicleId), { data, at: Date.now() });
  } catch (e) {
    console.warn('[store] 保存结论失败', e);
  }
}

function getChecklist(vehicleId) {
  try {
    return wx.getStorageSync(keyOf(vehicleId)) || null;
  } catch (e) {
    return null;
  }
}

function removeChecklist(vehicleId) {
  try {
    wx.removeStorageSync(keyOf(vehicleId));
  } catch (e) {
    console.warn('[store] 删除结论缓存失败', e);
  }
}

module.exports = {
  saveChecklist,
  getChecklist,
  removeChecklist,
};
