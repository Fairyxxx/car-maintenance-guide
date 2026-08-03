// utils/engine.js —— 本地保养判定引擎（纯前端，零后端）
// 车辆与保养记录持久化于本机 wx.storage（key: baoyang_local_db），冷启动自动加载；
// 判定算法在端上运行。无需任何服务器或云环境，无需域名备案，编译即可跑通完整链路。

const STATUS = { OVERDUE: 'overdue', SOON: 'soon', OK: 'ok', SKIP: 'skip' };
const SOON_THRESHOLD = 0.85;
const MS_PER_DAY = 24 * 60 * 60 * 1000;
const AVG_DAYS_PER_MONTH = 30.44;
const DB_KEY = 'baoyang_local_db';

// 规则集只加载一次（按 ruleSetId 缓存，找不到则回退通用规则集）
const RULESETS = require('../data/rule_sets.js');
const { formatDate, formatKm } = require('./format');
const ruleSetCache = {};
function getRuleSet(ruleSetId) {
  if (!ruleSetCache[ruleSetId]) {
    ruleSetCache[ruleSetId] = RULESETS[ruleSetId] || RULESETS.ruleset_generic;
  }
  return ruleSetCache[ruleSetId];
}

// ---------------- 本地持久化 ----------------
// 首次使用为空档案，由首页空状态引导用户建档。
// 不内置任何示例车辆：那既会让用户看到不属于自己的数据，也会被审核判定为样车/示例数据。
const LEGACY_SAMPLE_ID = 'demo_vw_001';

function defaultDB() {
  return { vehicles: [], records: {}, costs: {} };
}

// 两位补零（员工本地成本看板按月分组用，不依赖 format 的内部 pad）
function pad2(n) {
  return n < 10 ? '0' + n : '' + n;
}

// 旧版本曾内置一辆示例车（原内置样车），已安装的用户本机仍留有它。
// 这里做一次性迁移清除，但仅当它还是出厂原样（里程未改、记录仍是原 3 条）时才删；
// 若用户已在这辆车上记录过自己的真实数据，视为用户已接管，保留不动。
function migrate(saved) {
  const vehicles = saved.vehicles || [];
  const idx = vehicles.findIndex((v) => v && v._id === LEGACY_SAMPLE_ID);
  if (idx === -1) return saved;
  const recs = (saved.records && saved.records[LEGACY_SAMPLE_ID]) || [];
  const untouched = Number(vehicles[idx].currentKm) === 38000 && recs.length === 3;
  if (!untouched) return saved;
  vehicles.splice(idx, 1);
  if (saved.records) delete saved.records[LEGACY_SAMPLE_ID];
  if (saved.costs) delete saved.costs[LEGACY_SAMPLE_ID];
  return saved;
}

// 冷启动：优先从本机读取已保存的数据；无则初始化为空档案。
// 用 typeof wx 守卫，使本文件在 Node 测试环境（无 wx）下也能降级为内存模式运行。
function loadDB() {
  try {
    if (typeof wx !== 'undefined' && wx.getStorageSync) {
      const saved = wx.getStorageSync(DB_KEY);
      if (saved && Array.isArray(saved.vehicles)) {
        const before = saved.vehicles.length;
        const migrated = migrate(saved);
        if (migrated.vehicles.length !== before) saveDB(migrated);
        // 兼容老版本：旧备份可能不含 costs 字段，补默认避免后续读取为 undefined
        if (!migrated.costs) migrated.costs = {};
        return migrated;
      }
    }
  } catch (e) {}
  const init = defaultDB();
  saveDB(init);
  return init;
}

function saveDB(next) {
  db = next; // 内存引用始终最新（Node 测试或 wx 不可用时也保证进程内一致）
  try {
    if (typeof wx !== 'undefined' && wx.setStorageSync) {
      wx.setStorageSync(DB_KEY, next);
    }
  } catch (e) {}
}

// 注意：db 必须先声明（初始化为 undefined）再赋值，否则 loadDB()->saveDB() 在
// 模块加载期对 db 的赋值会触发 TDZ（Cannot access 'db' before initialization），导致整包启动崩溃。
let db;
db = loadDB();
let vehicleSeq = 0;
// 保养记录序列号：每条记录写库时附一个 rid，便于精确删除（旧记录无 rid 时按复合键回退）
let recordSeq = 0;
function genRid() {
  return 'r_' + Date.now() + '_' + ++recordSeq;
}

// ---------------- 判定算法 ----------------
function resolveConditionFactor(conditionFactor, usageProfile) {
  if (!conditionFactor || !usageProfile) return 1;
  let factor = 1;
  Object.keys(conditionFactor).forEach((key) => {
    if (usageProfile[key] && conditionFactor[key] < factor) {
      factor = conditionFactor[key];
    }
  });
  return factor;
}

function resolveBaseline(item, vehicle, record) {
  if (record) {
    return { baseKm: record.serviceKm, baseDate: new Date(record.serviceDate), confidence: 'recorded' };
  }
  return {
    baseKm: 0,
    baseDate: vehicle.purchaseDate ? new Date(vehicle.purchaseDate) : null,
    confidence: 'estimated',
  };
}

// 聚合「上次保养」：按最近一次保养日期归组，列出那次更换的项目。
function buildLastService(records, ruleSet) {
  if (!records || !records.length) return null;
  const byDate = {};
  records.forEach((r) => {
    if (!r || !r.serviceDate) return;
    (byDate[r.serviceDate] = byDate[r.serviceDate] || []).push(r);
  });
  const dates = Object.keys(byDate).sort((a, b) => new Date(b) - new Date(a));
  if (!dates.length) return null;
  const latest = byDate[dates[0]];
  const nameMap = {};
  (ruleSet.items || []).forEach((it) => { nameMap[it.itemKey] = it.name; });
  const items = latest.map((r) => nameMap[r.itemKey] || r.itemKey).filter(Boolean);
  const km = latest.reduce((m, r) => Math.max(m, Number(r.serviceKm) || 0), 0);
  return { date: dates[0], km, items };
}

// 聚合「全部保养记录」：按日期倒序（同日按里程倒序）列出每一条已记录更换，供审计。
function buildServiceHistory(records, ruleSet) {
  if (!records || !records.length) return [];
  const nameMap = {};
  (ruleSet.items || []).forEach((it) => { nameMap[it.itemKey] = it.name; });
  return records
    .map((r) => ({
      rid: r.rid || `${r.itemKey}#${r.serviceDate}#${r.serviceKm}`,
      itemKey: r.itemKey,
      name: nameMap[r.itemKey] || r.itemKey,
      date: r.serviceDate || '',
      km: Number(r.serviceKm) || 0,
      source: r.source || 'manual',
    }))
    .sort((a, b) =>
      b.date === a.date ? b.km - a.km : new Date(b.date) - new Date(a.date)
    );
}

function evaluateItem(item, vehicle, record, now) {
  if (item.necessity === 'unnecessary') {
    return {
      itemKey: item.itemKey,
      name: item.name,
      status: STATUS.SKIP,
      necessity: item.necessity,
      progress: 0,
      progressPct: 0,
      note: item.note || '厂商保养手册未列入此项目，正常使用无需额外更换',
      confidence: 'rule',
    };
  }

  const { baseKm, baseDate, confidence } = resolveBaseline(item, vehicle, record);
  const factor = resolveConditionFactor(item.conditionFactor, vehicle.usageProfile);

  let kmProgress = 0;
  if (item.intervalKm && typeof vehicle.currentKm === 'number') {
    const effectiveInterval = item.intervalKm * factor;
    kmProgress = effectiveInterval > 0 ? (vehicle.currentKm - baseKm) / effectiveInterval : 0;
  }

  let timeProgress = 0;
  if (item.intervalMonth && baseDate && !isNaN(baseDate.getTime())) {
    const elapsedMonths = (now - baseDate.getTime()) / MS_PER_DAY / AVG_DAYS_PER_MONTH;
    timeProgress = elapsedMonths / item.intervalMonth;
  }

  const progress = Math.max(kmProgress, timeProgress, 0);
  const drivenBy = kmProgress >= timeProgress ? 'mileage' : 'time';

  let status;
  if (progress >= 1) status = STATUS.OVERDUE;
  else if (progress >= SOON_THRESHOLD) status = STATUS.SOON;
  else status = STATUS.OK;

  let remainingKm = null;
  if (item.intervalKm && typeof vehicle.currentKm === 'number') {
    remainingKm = Math.round(baseKm + item.intervalKm * factor - vehicle.currentKm);
  }

  // 剩余天数：与 timeProgress 同源（时间维度不叠加工况系数），供「下次保养预告」使用。
  let remainingDays = null;
  if (item.intervalMonth && baseDate && !isNaN(baseDate.getTime())) {
    const dueTs = baseDate.getTime() + item.intervalMonth * AVG_DAYS_PER_MONTH * MS_PER_DAY;
    remainingDays = Math.round((dueTs - now) / MS_PER_DAY);
  }

  return {
    itemKey: item.itemKey,
    name: item.name,
    status,
    necessity: item.necessity,
    progress: Math.round(progress * 100) / 100,
    progressPct: Math.min(100, Math.round(progress * 100)),
    drivenBy,
    remainingKm,
    remainingDays,
    conditionFactor: factor,
    lastServiceKm: record ? record.serviceKm : null,
    lastServiceDate: record ? record.serviceDate : null,
    note: item.note || '',
    confidence,
  };
}

// 聚合「下次保养预告」：挑出当前最紧迫的一项，转成用户能直接读懂的一句话。
// 这是零后端架构下唯一能真实兑现的「提醒」——不承诺推送，只把结论说清楚。
// 优先级：已超期 > 建议关注 > 最近将到期的正常项；unnecessary(skip) 永不参与。
function buildNextDue(results) {
  const pick = (status) =>
    results
      .filter((r) => r.status === status)
      .sort((a, b) => b.progress - a.progress)[0];

  const hit =
    pick(STATUS.OVERDUE) ||
    pick(STATUS.SOON) ||
    results
      .filter((r) => r.status === STATUS.OK && typeof r.remainingKm === 'number')
      .sort((a, b) => a.remainingKm - b.remainingKm)[0];

  if (!hit) return null;

  // 里程与时间取先到者，和判定算法 progress = max(里程, 时间) 保持同一口径
  const byKm = typeof hit.remainingKm === 'number';
  const byDay = typeof hit.remainingDays === 'number';
  let text;
  if (hit.status === STATUS.OVERDUE) {
    if (byKm && hit.remainingKm < 0) text = `${hit.name}已超期 ${formatKm(-hit.remainingKm)}`;
    else if (byDay && hit.remainingDays < 0) text = `${hit.name}已超期 ${-hit.remainingDays} 天`;
    else text = `${hit.name}已到更换周期`;
  } else {
    const parts = [];
    if (byKm && hit.remainingKm > 0) parts.push(`还有 ${formatKm(hit.remainingKm)}`);
    if (byDay && hit.remainingDays > 0) parts.push(`${hit.remainingDays} 天`);
    text = parts.length
      ? `${hit.name}${parts.join(' / ')}到期`
      : `${hit.name}即将到期`;
  }

  return {
    itemKey: hit.itemKey,
    name: hit.name,
    status: hit.status,
    remainingKm: hit.remainingKm,
    remainingDays: hit.remainingDays,
    text,
  };
}

// 车辆健康度：从体检结论的「需保养项目」占比推导，skip（无需理会）不计入健康评估
// —— 它代表「你没被推荐不必要的项目」，与车况无关。
// 公式：健康度 = (ok×1 + soon×0.5) / (overdue + soon + ok) × 100。
// 该值纯由既有结论推导，不新增任何存储字段，零后端架构下完全本地可算。
function computeHealth(summary) {
  const s = summary || {};
  const need = (s.overdueCount || 0) + (s.soonCount || 0) + (s.okCount || 0);
  if (!need) return { score: 100, level: 'good', hasData: false };
  const ratio = ((s.okCount || 0) * 1 + (s.soonCount || 0) * 0.5) / need;
  const score = Math.round(ratio * 100);
  let level = 'good';
  if (s.overdueCount > 0) level = 'bad';
  else if (s.soonCount > 0) level = 'warn';
  return { score, level, hasData: true };
}

function localEvaluate(vehicle, records) {
  const ruleSet = getRuleSet(vehicle.ruleSetId);
  // 全量记录按日期倒序（同日里程倒序），保证「最近一次」取的是最新日期那笔，
  // 与后端版本行为一致；否则老车补录会被更早的低里程记录覆盖基线，误判 overdue。
  const sorted = (records || []).slice().sort((a, b) =>
    b.serviceDate === a.serviceDate
      ? Number(b.serviceKm) - Number(a.serviceKm)
      : new Date(b.serviceDate) - new Date(a.serviceDate)
  );
  const latestRecord = {};
  sorted.forEach((r) => {
    if (!latestRecord[r.itemKey]) latestRecord[r.itemKey] = r;
  });

  const now = Date.now();
  const results = ruleSet.items.map((item) =>
    evaluateItem(item, vehicle, latestRecord[item.itemKey], now)
  );

  const grouped = { overdue: [], soon: [], ok: [], skip: [] };
  results.forEach((r) => grouped[r.status].push(r));
  grouped.overdue.sort((a, b) => b.progress - a.progress);
  grouped.soon.sort((a, b) => b.progress - a.progress);

  const summary = {
    overdueCount: grouped.overdue.length,
    soonCount: grouped.soon.length,
    okCount: grouped.ok.length,
    skipCount: grouped.skip.length,
  };

  const yearPart = vehicle.year ? ' ' + vehicle.year + '款' : '';
  return {
    vehicle: {
      _id: vehicle._id,
      currentKm: vehicle.currentKm,
      modelName: `${vehicle.brand} ${vehicle.series}${yearPart}`,
    },
    summary,
    grouped,
    ruleVersion: ruleSet.version,
    manual: ruleSet.manual,
    nextDue: buildNextDue(results),
    lastService: buildLastService(sorted, ruleSet),
    serviceHistory: buildServiceHistory(sorted, ruleSet),
    health: computeHealth(summary),
    evaluatedAt: now,
    disclaimer:
      `本结论整理自《${ruleSet.manual.title}》，仅供参考，实际请以车辆检测结果和随车保养手册为准。`,
  };
}

// ---------------- 业务接口（数据持久化于本机） ----------------
function listVehicles() {
  return Promise.resolve({ code: 0, data: db.vehicles.slice() });
}

function addVehicle(data) {
  const { action, ...payload } = data;
  // _id 唯一：同一毫秒内连续建档会得到相同的 Date.now()，叠加自增序号彻底杜绝碰撞。
  vehicleSeq += 1;
  const _id = 'v_' + Date.now() + '_' + vehicleSeq;
  const v = Object.assign({ _id }, payload, { createdAt: Date.now() });
  db.vehicles.push(v);
  if (payload.lastOilKm) {
    // 机油与机油滤清器通常同次更换，一并作为真实基线，否则老车易误判为「立即更换」。
    const d = formatDate(new Date());
    db.records[v._id] = [
      { rid: genRid(), itemKey: 'engine_oil', serviceKm: payload.lastOilKm, serviceDate: d },
      { rid: genRid(), itemKey: 'oil_filter', serviceKm: payload.lastOilKm, serviceDate: d },
    ];
  }
  saveDB(db);
  return Promise.resolve({ code: 0, data: { _id: v._id } });
}

function updateKm(data) {
  const v = db.vehicles.find((x) => x._id === data.vehicleId);
  if (!v) return Promise.reject({ code: 404, message: '车辆不存在: ' + data.vehicleId });
  v.currentKm = data.currentKm;
  saveDB(db);
  return Promise.resolve({ code: 0, data: {} });
}

function addRecord(data) {
  const { vehicleId, itemKey, serviceKm, serviceDate } = data;
  if (!db.records[vehicleId]) db.records[vehicleId] = [];
  // 保留完整流水：不做按 itemKey 去重，让用户能审计每次保养；
  // 判定基线只取最新一笔（见 localEvaluate 的 sorted 逻辑），与后端版本一致。
  db.records[vehicleId].push({ rid: genRid(), itemKey, serviceKm, serviceDate });
  saveDB(db);
  return Promise.resolve({ code: 0, data: {} });
}

// 删除单条保养记录（支持撤回误录）。按 rid 精确删除；旧记录无 rid 时回退到
// 复合键（itemKey#serviceDate#serviceKm）匹配，保证历史数据同样可删。
function deleteRecord(data) {
  const { vehicleId, rid } = data;
  const arr = db.records[vehicleId];
  if (!arr || !arr.length) return Promise.resolve({ code: 0, data: {} });
  db.records[vehicleId] = arr.filter((r) => {
    const k = r.rid || `${r.itemKey}#${r.serviceDate}#${r.serviceKm}`;
    return k !== rid;
  });
  saveDB(db);
  return Promise.resolve({ code: 0, data: {} });
}

function deleteVehicle(data) {
  const { vehicleId } = data;
  const idx = db.vehicles.findIndex((x) => x._id === vehicleId);
  if (idx !== -1) db.vehicles.splice(idx, 1);
  delete db.records[vehicleId];
  // 同步清理该车在本机的花费台账，否则删除记录会残留在 db.costs 中，
  // 既污染备份导出、又与「该车保养记录也会一并移除」的删除确认文案相矛盾。
  delete db.costs[vehicleId];
  saveDB(db);
  return Promise.resolve({ code: 0, data: {} });
}

// 取单辆车及其全部保养记录（编辑车辆页预填用）
function getVehicle(vehicleId) {
  const v = db.vehicles.find((x) => x._id === vehicleId);
  if (!v) return Promise.reject({ code: 404, message: '车辆不存在: ' + vehicleId });
  return Promise.resolve({ code: 0, data: { vehicle: v, records: db.records[vehicleId] || [] } });
}

// 编辑车辆：更新可改字段；lastOilKm 仅刷新机油/机滤基线（不破坏其它历史记录）
function updateVehicle(data) {
  const { vehicleId } = data;
  const v = db.vehicles.find((x) => x._id === vehicleId);
  if (!v) return Promise.reject({ code: 404, message: '车辆不存在: ' + vehicleId });

  ['brand', 'series', 'engine', 'ruleSetId', 'year', 'currentKm', 'purchaseDate'].forEach((f) => {
    if (data[f] !== undefined && data[f] !== null) v[f] = data[f];
  });
  if (data.usageProfile) v.usageProfile = data.usageProfile;
  // 编辑时不把 lastOilKm 落到 vehicle 对象上（基线已记录在 records 中），
  // 避免该字段在 vehicle 里永久残留成脏数据。
  delete v.lastOilKm;

  // 机油与机滤通常同次更换；仅调整这两项基线，保留空气滤等其它完整流水。
  // 用户「清空上次换机油里程」时移除自动基线，交由购车日期推算，避免脏基线误判。
  if (data.lastOilKm !== undefined) {
    const km = data.lastOilKm ? Number(data.lastOilKm) : null;
    const d = formatDate(new Date());
    if (!db.records[vehicleId]) db.records[vehicleId] = [];
    const recs = db.records[vehicleId];
    ['engine_oil', 'oil_filter'].forEach((key) => {
      const sorted = recs
        .filter((r) => r.itemKey === key)
        .sort((a, b) => new Date(b.serviceDate) - new Date(a.serviceDate) || Number(b.serviceKm) - Number(a.serviceKm));
      if (km && sorted.length) {
        sorted[0].serviceKm = km;
        sorted[0].serviceDate = d;
      } else if (!km && sorted.length) {
        recs.splice(recs.indexOf(sorted[0]), 1);
      } else if (km && !sorted.length) {
        recs.push({ rid: genRid(), itemKey: key, serviceKm: km, serviceDate: d });
      }
    });
  }

  saveDB(db);
  return Promise.resolve({ code: 0, data: { _id: vehicleId } });
}

function getChecklist(vehicleId) {
  const v = db.vehicles.find((x) => x._id === vehicleId);
  if (!v) return Promise.reject({ code: 404, message: '车辆不存在: ' + vehicleId });
  return Promise.resolve({ code: 0, data: localEvaluate(v, db.records[vehicleId] || []) });
}

// ---------------- 保养花费记账（纯前端，零后端） ----------------
// 每笔花费 = 一次到店消费（金额必填，日期/里程/门店/备注选填），存于本机 db.costs[vehicleId]。
// 与「保养记录（service_records，按项目）」解耦：前者记钱、后者记项目，互不干扰，
// 既能在体检页补录「换了什么」，也能在花费页记录「花了多少」，构成完整的本机养车台账。
let costSeq = 0;

function addCost(data) {
  const { vehicleId, date, amount, km, shop, note } = data;
  if (!db.costs[vehicleId]) db.costs[vehicleId] = [];
  const cost = {
    costId: 'c_' + Date.now() + '_' + ++costSeq,
    date: date || formatDate(new Date()),
    amount: Number(amount) || 0,
    km: km != null && km !== '' ? Number(km) : null,
    shop: shop || '',
    note: note || '',
  };
  db.costs[vehicleId].push(cost);
  saveDB(db);
  return Promise.resolve({ code: 0, data: cost });
}

function listCosts(vehicleId) {
  const arr = (db.costs[vehicleId] || []).slice().sort((a, b) =>
    b.date === a.date
      ? (b.costId || '').localeCompare(a.costId || '')
      : new Date(b.date) - new Date(a.date)
  );
  return Promise.resolve({ code: 0, data: arr });
}

function deleteCost(data) {
  const { vehicleId, costId } = data;
  if (!db.costs[vehicleId]) return Promise.resolve({ code: 0, data: {} });
  db.costs[vehicleId] = db.costs[vehicleId].filter((c) => c.costId !== costId);
  saveDB(db);
  return Promise.resolve({ code: 0, data: {} });
}

// 花费看板聚合：累计 / 本年支出 / 笔数 + 近 6 个月按月柱状图数据。
// 全部本地可算，不新增存储字段，零后端架构下完整可用。
function summarizeCosts(vehicleId) {
  const arr = db.costs[vehicleId] || [];
  const total = arr.reduce((s, c) => s + (Number(c.amount) || 0), 0);
  const y = new Date().getFullYear();
  const thisYear = arr
    .filter((c) => c.date && c.date.slice(0, 4) === String(y))
    .reduce((s, c) => s + (Number(c.amount) || 0), 0);

  const now = new Date();
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({ key: `${d.getFullYear()}-${pad2(d.getMonth() + 1)}`, label: `${d.getMonth() + 1}月` });
  }
  const byMonthMap = {};
  arr.forEach((c) => {
    if (c.date) {
      const mk = c.date.slice(0, 7);
      byMonthMap[mk] = (byMonthMap[mk] || 0) + (Number(c.amount) || 0);
    }
  });
  const byMonth = months.map((m) => ({ key: m.key, label: m.label, amount: byMonthMap[m.key] || 0 }));
  const max = Math.max(1, ...byMonth.map((m) => m.amount));
  return Promise.resolve({ code: 0, data: { total, thisYear, count: arr.length, byMonth, max } });
}

// 导出本机全部数据（车辆 + 保养记录）的纯净快照，用于用户自助备份。
// 零后端架构下数据只存本机，换机/卸载会丢失，给一份可复制的备份是正式版应有的能力。
function exportData() {
  return Promise.resolve({
    code: 0,
    data: {
      app: 'car-maintenance-guide',
      schema: 1,
      exportedAt: new Date().toISOString(),
      vehicles: db.vehicles.map((v) => Object.assign({}, v)),
      records: Object.keys(db.records).reduce((acc, k) => {
        acc[k] = (db.records[k] || []).map((r) => Object.assign({}, r));
        return acc;
      }, {}),
      costs: Object.keys(db.costs).reduce((acc, k) => {
        acc[k] = (db.costs[k] || []).map((c) => Object.assign({}, c));
        return acc;
      }, {}),
    },
  });
}

// 从用户备份恢复本机数据（备份文本经 api 层 JSON.parse 后传入）。
// 仅接受本程序 exportData() 产出的格式，做严格校验，绝不把任意字符串写进本地存储。
// 备份/恢复闭环：换机或卸载重装后，把此前「备份我的数据」复制的文本粘贴回来即可还原。
function importData(snapshot) {
  if (!snapshot || typeof snapshot !== 'object') {
    return Promise.reject({ code: 400, message: '备份内容格式不正确' });
  }
  if (snapshot.app !== 'car-maintenance-guide' || snapshot.schema !== 1) {
    return Promise.reject({ code: 400, message: '不是本程序的备份文件' });
  }
  if (!Array.isArray(snapshot.vehicles)) {
    return Promise.reject({ code: 400, message: '备份缺少车辆数据' });
  }
  if (!snapshot.records || typeof snapshot.records !== 'object') {
    return Promise.reject({ code: 400, message: '备份缺少保养记录' });
  }
  // costs 为可选字段（老备份可能没有），缺失时按空对象处理，保证导入不报错
  const costs = {};
  if (snapshot.costs && typeof snapshot.costs === 'object') {
    Object.keys(snapshot.costs).forEach((k) => {
      const arr = Array.isArray(snapshot.costs[k]) ? snapshot.costs[k] : [];
      costs[k] = arr.map((c) => ({
        costId: c.costId || 'c_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
        date: c.date || '',
        amount: Number(c.amount) || 0,
        km: c.km != null ? Number(c.km) : null,
        shop: c.shop || '',
        note: c.note || '',
      }));
    });
  }
  // 规整：补全每辆车 _id；保养记录逐项收口为判定所需字段
  const vehicles = snapshot.vehicles.map((v) => {
    const nv = Object.assign({}, v);
    if (!nv._id) nv._id = 'v_' + Date.now() + '_' + ++vehicleSeq;
    return nv;
  });
  const records = {};
  Object.keys(snapshot.records).forEach((k) => {
    const arr = Array.isArray(snapshot.records[k]) ? snapshot.records[k] : [];
    records[k] = arr.map((r) => ({
      itemKey: r.itemKey,
      serviceKm: Number(r.serviceKm) || 0,
      serviceDate: r.serviceDate || '',
      source: r.source || 'manual',
    }));
  });
  db = { vehicles, records, costs };
  saveDB(db);
  return Promise.resolve({ code: 0, data: { count: vehicles.length } });
}

// 重置本机数据：清空后重新从（已清空的）存储初始化，得到空档案。
// 关键：wx.clearStorageSync 只清持久化存储，engine 的模块级 db 在 app 生命周期内常驻内存、
// reLaunch 不会重新执行 engine.js，因此必须显式重置 db，否则「清空本地缓存」后车辆会重新出现。
function reset() {
  db = loadDB();
  return Promise.resolve({ code: 0 });
}

// 全部车辆概览：跨车聚合待处理项与累计花费，用于「我的」页仪表盘。
// 逐车 localEvaluate 拿 summary（纯本地计算），再累加本机 costs；零后端、零网络。
// 任一车判定异常不影响整体（try/catch 跳过该车），保证仪表盘始终能渲染。
function fleetSummary() {
  const vehicles = db.vehicles || [];
  let overdue = 0;
  let soon = 0;
  let ok = 0;
  let skip = 0;
  let totalCost = 0;
  vehicles.forEach((v) => {
    try {
      const r = localEvaluate(v, db.records[v._id] || []);
      const s = r.summary || {};
      overdue += s.overdueCount || 0;
      soon += s.soonCount || 0;
      ok += s.okCount || 0;
      skip += s.skipCount || 0;
    } catch (e) {}
  });
  Object.keys(db.costs || {}).forEach((k) => {
    (db.costs[k] || []).forEach((c) => {
      totalCost += Number(c.amount) || 0;
    });
  });
  return { vehicleCount: vehicles.length, overdue, soon, ok, skip, totalCost };
}

module.exports = {
  computeHealth,
  fleetSummary,
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
};
