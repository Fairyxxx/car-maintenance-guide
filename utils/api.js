// utils/api.js —— 统一业务接口层（纯前端，零后端）
// 本项目所有数据存于本机 wx.storage，保养判定在端上 engine 完成，不调用任何云或服务器。
// 页面只调用这里的业务方法，不关心底层存储细节。

const engine = require('./engine');

// ---------------- 业务接口 ----------------
const listVehicles = () => engine.listVehicles();

// 跨车聚合仪表盘数据（车辆数 / 累计花费 / 待处理项），纯本地可算
const fleetSummary = () => engine.fleetSummary();

const addVehicle = (payload) => engine.addVehicle(Object.assign({ action: 'add' }, payload));

const getVehicle = (vehicleId) => engine.getVehicle(vehicleId);

const updateVehicle = (payload) =>
  engine.updateVehicle(Object.assign({ action: 'update' }, payload));

const updateKm = (vehicleId, currentKm) =>
  engine.updateKm({ vehicleId, currentKm });

const addRecord = (payload) =>
  engine.addRecord(Object.assign({ action: 'addRecord' }, payload));

const deleteRecord = (payload) =>
  engine.deleteRecord(Object.assign({ action: 'deleteRecord' }, payload));

const deleteVehicle = (vehicleId) => engine.deleteVehicle({ vehicleId });

const getChecklist = (vehicleId) => engine.getChecklist(vehicleId);

// ---------------- 保养花费记账 ----------------
const addCost = (payload) => engine.addCost(Object.assign({ action: 'addCost' }, payload));

const listCosts = (vehicleId) => engine.listCosts(vehicleId);

const deleteCost = (payload) => engine.deleteCost(payload);

const summarizeCosts = (vehicleId) => engine.summarizeCosts(vehicleId);

const exportData = () => engine.exportData();

// 从剪贴板备份文本恢复：先 JSON.parse，再交给 engine 严格校验后写入本机。
const importData = (text) => {
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch (e) {
    return Promise.reject({ code: 400, message: '备份文本无法解析，请确认完整复制' });
  }
  return engine.importData(parsed);
};

// 清空本机数据后重置内存态：wx.clearStorageSync 只清持久化存储，
// engine 的模块级 db 常驻内存、reLaunch 不重新执行 engine.js，必须显式重置才真正生效。
const reset = () => engine.reset();

// 订阅消息：微信前端能力，不依赖云环境，本地同样真实可用。
const requestSubscribe = (tmplIds = []) =>
  new Promise((resolve) => {
    if (!tmplIds || !tmplIds.length) {
      resolve({ accepted: [], result: {}, configured: false });
      return;
    }
    wx.requestSubscribeMessage({
      tmplIds,
      success: (res) => {
        const accepted = tmplIds.filter((id) => res[id] === 'accept');
        resolve({ accepted, result: res, configured: true });
      },
      fail: () => resolve({ accepted: [], result: {} }),
    });
  });

module.exports = {
  listVehicles,
  addVehicle,
  getVehicle,
  updateVehicle,
  updateKm,
  addRecord,
  deleteRecord,
  deleteVehicle,
  getChecklist,
  addCost,
  listCosts,
  deleteCost,
  summarizeCosts,
  exportData,
  importData,
  reset,
  fleetSummary,
  requestSubscribe,
};
