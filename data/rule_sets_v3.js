// data/rule_sets_v3.js —— 第六轮扩充：补齐仍缺失的在售品牌（2026-08-03）
// 由 data/rule_sets.js 统一 require 并合并导出，对外仍以 rule_sets.js 为单一出口。
//
// 本轮解决的问题：前五轮把已有车型全部接入了专属手册，但车型库里**根本没有**这些在售主流品牌，
// 用户搜不到自己的车，等于没有保养计划。本轮按官方保养规范补齐 8 套规则集：
//
//   ruleset_vw_ev          大众 ID. 家族 + 奥迪 Q4 e-tron —— 合资纯电此前是空白
//   ruleset_geely_galaxy   吉利银河（雷神 EM-i / EM-P 电混与纯电）
//   ruleset_changan_qiyuan 长安启源（增程 / 插混）
//   ruleset_avatr          阿维塔（纯电版）
//   ruleset_avatr_reev     阿维塔（增程版，与纯电版计量口径不同，单独建库）
//   ruleset_arcfox         极狐 ARCFOX（北汽新能源）
//   ruleset_baic           北京汽车 BJ 系列硬派越野（燃油 / 柴油）
//   ruleset_jac            江淮 瑞风 / 思皓
//
// 数据口径优先级：厂商官方保养规范文件 > 官方保养手册周期表 > 官方渠道公开的保养项目表。
// 取不到逐款官方手册的，在 manual.note 中如实标注口径来源，不冒充专属手册。
//
// 本轮一个重要发现（已写进对应 note）：部分新能源品牌的官方周期明显短于工程需要，
// 典型如极狐把「刹车油 / 减速器油」都压在 2 万公里。本产品的处理原则是
// **如实呈现厂商周期 + 说明可先做检测**，既不替厂商放宽，也不替门店加码。

const { upsellFuel, upsellEv } = require('./rule_set_common.js');

// 纯电共用尾部：电池检测 + 刹车片 + 轮胎
function evTail(opts) {
  const o = opts || {};
  return [
    { itemKey: 'brake_pad', name: '刹车片', category: 'safety', necessity: 'conditional', intervalKm: o.padKm || 80000, intervalMonth: null, note: o.padNote || '动能回收承担了大部分减速任务，纯电车刹车片寿命普遍是燃油车的 2 倍以上。按厚度判断，剩余小于 3mm 才需更换，不要按里程盲换。' },
    { itemKey: 'battery', name: '动力电池健康检测', category: 'electrical', necessity: 'conditional', intervalKm: o.batteryKm || 20000, intervalMonth: 12, note: o.batteryNote || '随常规保养做一次电池健康度与高压线束检测，属于检测项而非更换项。容量衰减超出质保阈值可走三电质保。' },
    { itemKey: 'tire', name: '轮胎', category: 'safety', necessity: 'conditional', intervalKm: o.tireKm || 60000, intervalMonth: null, note: o.tireNote || '按磨损与老化判断。纯电车整备质量大、起步扭矩高，建议每 1 万公里做一次四轮换位。' },
  ];
}

// 燃油共用尾部：刹车片 + 轮胎
function fuelTail(opts) {
  const o = opts || {};
  return [
    { itemKey: 'brake_pad', name: '刹车片', category: 'safety', necessity: 'conditional', intervalKm: o.padKm || 60000, intervalMonth: null, note: o.padNote || '磨损件，按厚度检测判断，不按固定里程更换。低于 3mm 需更换，门店以「快到里程了」为由推荐更换属于过度保养。' },
    { itemKey: 'tire', name: '轮胎', category: 'safety', necessity: 'conditional', intervalKm: o.tireKm || 60000, intervalMonth: null, note: o.tireNote || '按花纹深度与老化判断：花纹低于 1.6mm 或胎侧出现裂纹、鼓包时更换，与行驶里程没有固定对应关系。' },
  ];
}

/* ================= 大众 ID. 家族（含奥迪 Q4 e-tron） ================= */
// 依据：上汽大众官方《ID.3 车型保养规范》（techcare.svw-volkswagen.com 官方技术文件）
const RULESET_VW_EV = {
  _id: 'ruleset_vw_ev',
  name: '大众 ID. 纯电（ID.3 / ID.4 / ID.6 / 奥迪 Q4 e-tron）',
  version: 1,
  updatedAt: '2026-08-03',
  source: '上汽大众《ID.3 车型保养规范》官方技术文件 + 一汽-大众 ID. 系列官方保养口径（首保 6 个月/5000 公里，常规 1 年/1 万公里）',
  manual: {
    title: '上汽大众 / 一汽-大众 ID. 系列车型保养规范',
    scope: '适用：大众 ID.3 / ID.4 X / ID.4 CROZZ / ID.6 X / ID.6 CROZZ，以及同平台（MEB）的奥迪 Q4 e-tron',
    note: '官方原文口径：首次保养检测在 6 个月或 5000 公里进行；常规保养检测为 1 年或 1 万公里，之后每 1 年/1 万公里一次。官方保养规范里真正的「更换件」只有花粉滤芯、制动液、R744 制冷剂三项，其余全部是检查、清洁、润滑类工序。凡是超出这三项的更换建议，都可以要求门店指出手册依据。',
  },
  items: [
    { itemKey: 'cabin_filter', name: '空调滤芯（灰尘及花粉过滤器）', category: 'comfort', necessity: 'must', intervalKm: 10000, intervalMonth: 12, conditionFactor: { dusty: 0.5 }, note: '官方保养规范列为每 1 年/1 万公里更换（建议）。官方同时注明：在灰尘较大环境行驶应缩短至每 5000 公里。滤芯脏污会直接影响空调制冷效果，是 ID. 车型最主要的自费更换件。' },
    { itemKey: 'brake_fluid', name: '刹车油', category: 'safety', necessity: 'must', intervalKm: null, intervalMonth: 24, note: '官方规范：首次 3 年更换，之后每 2 年一次。本产品按 2 年提醒，新车前 3 年不必提前更换。可先做含水量检测，超过 3% 必须更换。' },
    { itemKey: 'ac_refrigerant', name: 'R744 制冷剂（热泵版）', category: 'comfort', necessity: 'conditional', intervalKm: null, intervalMonth: 24, note: '官方规范把 R744（二氧化碳）制冷剂列为每 2 年更换的专项部件——这是 ID. 系列区别于普通车型的特有项目。但仅热泵空调版本适用，非热泵车型没有这一项，被推荐时先确认自己车辆是否带热泵。' },
    { itemKey: 'sunroof_drain', name: '天窗排水功能检查', category: 'comfort', necessity: 'optional', intervalKm: 10000, intervalMonth: 12, note: '官方列入每 1 年/1 万公里的检测项目：检查、必要时清洁，属于检查而非更换。带天窗车型才需要。' },
    { itemKey: 'gear_oil', name: '减速器油', category: 'transmission', necessity: 'unnecessary', note: '大众 MEB 平台官方保养规范未把减速器齿轮油列入任何更换周期，属于终身免维护设计。门店按「电车也要换齿轮油」推销时，可以直接要求出示 ID. 保养规范中的对应条目。' },
    { itemKey: 'coolant', name: '防冻液（三电冷却）', category: 'electrical', necessity: 'conditional', intervalKm: 120000, intervalMonth: 96, note: '官方保养规范未列入固定更换周期，属长效冷却液，日常只做液位与冰点检查。' },
    { itemKey: 'battery_12v', name: '12V 蓄电池检查', category: 'electrical', necessity: 'conditional', intervalKm: 10000, intervalMonth: 12, note: '官方每次保养检测都包含 12V 蓄电池状态检查。纯电车 12V 电瓶亏电是最常见的「趴窝」原因，属于检查项，状态正常无需更换。' },
    { itemKey: 'wiper', name: '雨刮片', category: 'comfort', necessity: 'optional', intervalKm: null, intervalMonth: 12, note: '官方规范写的是「检查并清洁雨刮片，必要时更换」——先清洁，不行再换。' },
    ...evTail({ padNote: '官方每次保养检查制动摩擦片厚度与制动盘状态，「必要时更换」。ID. 系列动能回收强，刹车片实际寿命普遍很长。' }),
    ...upsellEv(),
  ],
};

/* ================= 吉利银河（雷神 EM-i / EM-P 电混 + 纯电） ================= */
const RULESET_GEELY_GALAXY = {
  _id: 'ruleset_geely_galaxy',
  name: '吉利银河（L7 / L6 / E5 / 星愿 / 星舰7 / 星耀6 / M9）',
  version: 1,
  updatedAt: '2026-08-03',
  source: '吉利银河官方保养手册周期（首保 5000 公里/6 个月，常规 1 万公里/12 个月）+ 车质网《吉利银河完全评价报告》官方保养项目表',
  manual: {
    title: '吉利银河随车保养手册（雷神电混口径）',
    scope: '适用：吉利银河 L7 / L6 / E5 / 星愿 / 星舰7 / 星耀6 / M9 等雷神 EM-i、EM-P 电混与纯电车型',
    note: '官方口径：首保 5000 公里或 6 个月（免费，含机油机滤 + 三电检测），之后常规保养 1 万公里或 12 个月。2025 年后上市的新车型（如星耀6、M9）官方已把机油周期放宽到 1.5 万公里，请以自己随车手册为准。首任非营运车主整车 6 年/15 万公里、三电终身质保，前提是按官方周期保养并保留完整记录——这是银河车主最需要守住的一条。',
  },
  items: [
    { itemKey: 'engine_oil', name: '机油（混动专用）', category: 'engine', necessity: 'must', intervalKm: 10000, intervalMonth: 12, conditionFactor: { urban: 0.8, shortTrip: 0.75, dusty: 0.85 }, note: '官方要求 0W-20、API SP 级混动专用全合成机油，加注量约 4.3L。新款车型手册已放宽至 1.5 万公里。极端低温（-20℃ 以下）或长期短途高频充电通勤，建议缩短到 7500 公里。' },
    { itemKey: 'oil_filter', name: '机油滤清器', category: 'engine', necessity: 'must', intervalKm: 10000, intervalMonth: 12, note: '随机油同步更换。首任车主通常有 4 年/10 万公里免费基础保养权益，这一项基本不用自己花钱。' },
    { itemKey: 'air_filter', name: '空气滤清器', category: 'engine', necessity: 'must', intervalKm: 10000, intervalMonth: 12, conditionFactor: { dusty: 0.5 }, note: '官方首次在 1 万公里更换，之后可按 2 万公里执行。属于百元级、可自行更换的项目。' },
    { itemKey: 'cabin_filter', name: '空调滤芯', category: 'comfort', necessity: 'must', intervalKm: 20000, intervalMonth: 24, conditionFactor: { dusty: 0.5 }, note: '官方在 2 万公里节点更换。网购品牌件自行更换约百元，4S 店报价常在 300 元以上。' },
    { itemKey: 'brake_fluid', name: '刹车油', category: 'safety', necessity: 'must', intervalKm: 20000, intervalMonth: 24, note: '官方在 2 万公里节点更换。电混车动能回收强、制动负荷低，可先做含水量检测，超过 3% 再换。' },
    { itemKey: 'gear_oil', name: '减速器油（3DHT）', category: 'transmission', necessity: 'must', intervalKm: 40000, intervalMonth: 48, note: '雷神 3 挡 DHT Pro 变速机构的齿轮油，官方在 4 万公里节点更换。必须使用原厂规格，混用可能影响质保。' },
    { itemKey: 'spark_plug', name: '火花塞', category: 'engine', necessity: 'must', intervalKm: 40000, intervalMonth: 48, note: '官方与减速器油同在 4 万公里节点。混动专用发动机多在高效转速区间运行，点火负荷低于同排量燃油车。' },
    { itemKey: 'coolant', name: '防冻液（三电 + 发动机）', category: 'electrical', necessity: 'must', intervalKm: 60000, intervalMonth: 60, note: '官方在 6 万公里节点更换。三电回路与发动机回路规格不同、不可混加。' },
    { itemKey: 'fuel_filter', name: '汽油滤清器', category: 'engine', necessity: 'must', intervalKm: 60000, intervalMonth: 72, note: '官方在 6 万公里节点与三电冷却液一并更换。' },
    { itemKey: 'battery', name: '三电系统检测', category: 'electrical', necessity: 'conditional', intervalKm: 10000, intervalMonth: 12, note: '随常规保养做神盾电池健康度与电驱检测，属于检测项。三电终身质保的前提就是这份检测记录。' },
    { itemKey: 'timing_chain', name: '正时链条', category: 'engine', necessity: 'conditional', intervalKm: null, intervalMonth: null, note: '雷神混动专用发动机为正时链条，设计免维护、无固定更换里程。' },
    ...fuelTail({ padKm: 80000, padNote: '电混车动能回收承担大部分减速，刹车片磨损远低于同级燃油车。官方明确低于 3mm 才需更换（单套原厂约 400-600 元）。' }),
    ...upsellFuel(),
  ],
};

/* ================= 长安启源（增程 / 插混） ================= */
const RULESET_CHANGAN_QIYUAN = {
  _id: 'ruleset_changan_qiyuan',
  name: '长安启源（A05 / A07 / Q05 / E07）',
  version: 1,
  updatedAt: '2026-08-03',
  source: '长安汽车官方保养手册（2026 款启源 A07 增程版保养周期表）',
  manual: {
    title: '长安启源随车保养手册',
    scope: '适用：长安启源 A05 / A07 / Q05 / E07 等增程与插混车型',
    note: '官方保养手册把启源的保养拆成两条线：整车线（每 1 万公里常规检查 + 空调滤芯）与增程器线（每 1 万公里机油机滤）。增程器只发电、不直驱，工况单一稳定，磨损远小于传统燃油发动机——这也是官方敢把周期定在 1 万公里的原因。金钟罩电池首任非营运车主终身质保、不限里程。',
  },
  items: [
    { itemKey: 'engine_oil', name: '增程器机油', category: 'engine', necessity: 'must', intervalKm: 10000, intervalMonth: 12, conditionFactor: { urban: 0.85, shortTrip: 0.8 }, note: '官方每 1 万公里更换机油机滤（约 380 元）。按增程器工作里程计——长期用电通勤、增程器很少启动的车主，按时间（1 年）执行即可。' },
    { itemKey: 'oil_filter', name: '机油滤清器', category: 'engine', necessity: 'must', intervalKm: 10000, intervalMonth: 12, note: '随增程器机油同步更换。' },
    { itemKey: 'cabin_filter', name: '空调滤芯', category: 'comfort', necessity: 'must', intervalKm: 10000, intervalMonth: 12, conditionFactor: { dusty: 0.5 }, note: '官方每 1 万公里常规保养项目（含常规检查约 280 元）。按整车行驶里程计。' },
    { itemKey: 'brake_fluid', name: '刹车油', category: 'safety', necessity: 'must', intervalKm: 20000, intervalMonth: 24, note: '官方在 2 万公里节点与冷却液一并更换。可先做含水量检测，超过 3% 必须更换。' },
    { itemKey: 'coolant', name: '防冻液（三电 + 增程器）', category: 'electrical', necessity: 'must', intervalKm: 20000, intervalMonth: 24, note: '官方在 2 万公里节点更换（与刹车油合计约 600 元）。这一项周期短于多数同类增程车，属于长安官方设定，不是门店加码。' },
    { itemKey: 'gear_oil', name: '减速器油', category: 'transmission', necessity: 'must', intervalKm: 40000, intervalMonth: 48, note: '官方每 4 万公里更换（约 400 元）。未到节点无需更换。' },
    { itemKey: 'spark_plug', name: '火花塞', category: 'engine', necessity: 'conditional', intervalKm: 40000, intervalMonth: 48, note: '按增程器工作里程计，不是整车总里程。以电为主的用车方式下，实际到达时间会远晚于 4 万公里整车里程。' },
    { itemKey: 'air_filter', name: '空气滤清器', category: 'engine', necessity: 'must', intervalKm: 20000, intervalMonth: 24, conditionFactor: { dusty: 0.5 }, note: '增程器进气滤芯，按增程器工作里程约 2 万公里更换。' },
    { itemKey: 'fuel_filter', name: '汽油滤清器', category: 'engine', necessity: 'conditional', intervalKm: 60000, intervalMonth: 72, note: '增程器油耗低、燃油系统负荷小，官方未列入常规更换节点。出现供油异常再检查。' },
    { itemKey: 'battery', name: '三电系统检测', category: 'electrical', necessity: 'conditional', intervalKm: 10000, intervalMonth: 12, note: '随常规保养做金钟罩电池健康度检测。官方衰减标准：8 年内衰减超 30% 免费更换。' },
    ...fuelTail({ padKm: 80000, padNote: '增程车动能回收强，刹车片磨损低于同级燃油车。按厚度判断，低于 3mm 才换。' }),
    ...upsellFuel(),
  ],
};

/* ================= 阿维塔（纯电版） ================= */
const RULESET_AVATR = {
  _id: 'ruleset_avatr',
  name: '阿维塔 纯电（11 / 12 / 06 纯电版）',
  version: 1,
  updatedAt: '2026-08-03',
  source: '阿维塔官方保养标准（纯电版首保 12 个月/2 万公里，常规 12 个月/1 万公里）+ 官方保养项目节点表',
  manual: {
    title: '阿维塔科技随车保养手册（纯电版）',
    scope: '适用：阿维塔 11 / 12 / 06 等纯电版车型（CHN 平台，长安 + 华为 + 宁德时代）',
    note: '官方口径：纯电版首保为 12 个月或 2 万公里内（免费，含三电深度检测、底盘紧固、电子系统初始化），必须在官方授权服务中心完成，逾期会影响终身三电质保。常规保养间隔为 12 个月或 1 万公里；部分官方渠道对 11/12 给出的是 2 万公里口径，请以随车手册为准，本产品按更保守的 1 万公里提醒。',
  },
  items: [
    { itemKey: 'cabin_filter', name: '空调滤芯', category: 'comfort', necessity: 'must', intervalKm: 10000, intervalMonth: 12, conditionFactor: { dusty: 0.5 }, note: '官方在 1 万公里节点更换并做轮胎换位（部分车型手册为 2 万公里）。是纯电版最主要的定期更换件。' },
    { itemKey: 'brake_fluid', name: '刹车油', category: 'safety', necessity: 'must', intervalKm: 40000, intervalMonth: 24, note: '官方 DOT4 规格，4 万公里或 2 年更换。官方特别强调制动液每 2 年必须更换（与里程无关），避免含水量超标影响制动。' },
    { itemKey: 'gear_oil', name: '减速器油', category: 'transmission', necessity: 'must', intervalKm: 60000, intervalMonth: 60, note: '官方在 6 万公里大保养节点与三电冷却液一并更换。未到节点无需更换。' },
    { itemKey: 'coolant', name: '防冻液（三电冷却）', category: 'electrical', necessity: 'must', intervalKm: 60000, intervalMonth: 60, note: '官方 6 万公里大保养项目，同时完成智驾系统全面标定。必须使用原厂指定型号。' },
    { itemKey: 'battery', name: '动力电池健康检测', category: 'electrical', necessity: 'conditional', intervalKm: 10000, intervalMonth: 12, note: '随年度保养做电池健康度与高压系统检测。官方建议日常保持 40%-60% 电量区间存放，长期停放每月至少充放电一次。' },
    { itemKey: 'charge_port', name: '充电接口清洁', category: 'electrical', necessity: 'optional', intervalKm: null, intervalMonth: 6, note: '官方建议每 6 个月清洁一次充电接口、清除灰尘异物，防止触点氧化。属于可自行完成的维护，不必到店付费。' },
    { itemKey: 'wiper', name: '雨刮片', category: 'comfort', necessity: 'optional', intervalKm: null, intervalMonth: 12, note: '按刮拭效果判断，出现条纹或异响再换。' },
    ...evTail({ padNote: '800V 高压平台 + 强动能回收，刹车片磨损很慢。按厚度判断，低于 3mm 才换。' }),
    ...upsellEv(),
  ],
};

/* ================= 阿维塔（增程版） ================= */
const RULESET_AVATR_REEV = {
  _id: 'ruleset_avatr_reev',
  name: '阿维塔 增程（07 / 11 / 12 增程版）',
  version: 1,
  updatedAt: '2026-08-03',
  source: '阿维塔官方保养标准（增程版首保燃油行驶 5000 公里或 6 个月，之后 12 个月/1 万公里）',
  manual: {
    title: '阿维塔科技随车保养手册（增程版）',
    scope: '适用：阿维塔 07 / 11 / 12 等增程版车型',
    note: '官方口径：增程版首保为购车后燃油行驶 5000 公里或 6 个月内（免费，含机油、机滤、减速器油更换与三电检测），第二年起改为 12 个月或 1 万公里一次。注意增程版的机油周期按**增程器燃油工作里程**计，不是整车总里程——以电为主的车主实际到店频率会明显低于表面里程。',
  },
  items: [
    { itemKey: 'engine_oil', name: '增程器机油', category: 'engine', necessity: 'must', intervalKm: 10000, intervalMonth: 12, conditionFactor: { urban: 0.85, shortTrip: 0.8 }, note: '首保为燃油行驶 5000 公里或 6 个月，之后每 1 万公里或 12 个月。按增程器工作里程计。' },
    { itemKey: 'oil_filter', name: '机油滤清器', category: 'engine', necessity: 'must', intervalKm: 10000, intervalMonth: 12, note: '随机油同步更换，首保免费项目已包含。' },
    { itemKey: 'cabin_filter', name: '空调滤芯', category: 'comfort', necessity: 'must', intervalKm: 10000, intervalMonth: 12, conditionFactor: { dusty: 0.5 }, note: '官方在 1 万公里节点更换并做轮胎换位。按整车行驶里程计。' },
    { itemKey: 'brake_fluid', name: '刹车油', category: 'safety', necessity: 'must', intervalKm: 40000, intervalMonth: 24, note: '官方 DOT4 规格，4 万公里或 2 年更换。官方强调每 2 年必换（与里程无关）。' },
    { itemKey: 'spark_plug', name: '火花塞', category: 'engine', necessity: 'must', intervalKm: 40000, intervalMonth: 48, note: '官方在 4 万公里节点与制动液一并更换（增程版特有项目，纯电版没有）。按增程器工作里程计。' },
    { itemKey: 'air_filter', name: '空气滤清器', category: 'engine', necessity: 'must', intervalKm: 20000, intervalMonth: 24, conditionFactor: { dusty: 0.5 }, note: '官方在 2 万公里中期养护节点更换增程器进气滤芯。' },
    { itemKey: 'gear_oil', name: '减速器油', category: 'transmission', necessity: 'must', intervalKm: 60000, intervalMonth: 60, note: '官方 6 万公里大保养项目，与三电冷却液同节点。' },
    { itemKey: 'coolant', name: '防冻液（三电 + 增程器）', category: 'electrical', necessity: 'must', intervalKm: 60000, intervalMonth: 60, note: '官方 6 万公里大保养项目。两套回路规格不同、不可混加。' },
    { itemKey: 'fuel_filter', name: '汽油滤清器', category: 'engine', necessity: 'conditional', intervalKm: 80000, intervalMonth: 96, note: '增程器燃油系统负荷小，官方未列入常规更换节点。出现供油异常再检查。' },
    { itemKey: 'battery', name: '三电系统检测', category: 'electrical', necessity: 'conditional', intervalKm: 10000, intervalMonth: 12, note: '随年度保养检测。官方提示：避免长期纯电行驶导致增程器积碳，建议每 2 万公里用燃油模式跑一段高速。' },
    ...fuelTail({ padKm: 80000, padNote: '增程车动能回收强，刹车片磨损低于同级燃油车，按厚度判断。' }),
    ...upsellFuel(),
  ],
};

/* ================= 极狐 ARCFOX（北汽新能源） ================= */
const RULESET_ARCFOX = {
  _id: 'ruleset_arcfox',
  name: '极狐 ARCFOX（阿尔法S / 阿尔法T5 / 阿尔法S5 / 考拉）',
  version: 1,
  updatedAt: '2026-08-03',
  source: '极狐汽车官方保养手册周期表（首保 1 万公里/12 个月，之后每 2 万公里/12 个月）+ 官方保养配件周期',
  manual: {
    title: '极狐 ARCFOX 官方保养手册',
    scope: '适用：极狐 阿尔法S / 阿尔法T5 / 阿尔法S5 / 考拉 等纯电车型',
    note: '官方口径：首保 1 万公里或 12 个月（多数车型免费），之后每 2 万公里或 12 个月一次。需要注意的是，极狐官方把刹车油与减速器油都压在 2 万公里，明显短于行业普遍做法（刹车油 2 年、减速器油 6 万公里）。本产品如实呈现厂商周期，但建议：质保期内按官方执行以免影响索赔，出保后刹车油可先做含水量检测再决定。',
  },
  items: [
    { itemKey: 'cabin_filter', name: '空调滤芯', category: 'comfort', necessity: 'must', intervalKm: 20000, intervalMonth: 12, conditionFactor: { dusty: 0.5 }, note: '官方每 2 万公里更换，原厂件约 135 元、第三方约 75 元，属于可自行更换的项目。多尘或高湿地区建议换 PM2.5 + 活性炭复合滤芯。' },
    { itemKey: 'brake_fluid', name: '刹车油', category: 'safety', necessity: 'must', intervalKm: 20000, intervalMonth: 24, note: '官方每 2 万公里更换（工时费偏高，约 420 元）。这一周期短于行业惯例，出保后可先做含水量检测，超过 3% 再换。' },
    { itemKey: 'gear_oil', name: '减速器油', category: 'transmission', necessity: 'must', intervalKm: 20000, intervalMonth: 24, note: '官方每 2 万公里更换（在官方口径里属于强制项，5 万公里保养费用约 490 元）。同级纯电车普遍是 6 万公里，极狐这一项确实更勤，属于厂商设定而非门店加码。' },
    { itemKey: 'coolant', name: '防冻液（三电冷却）', category: 'electrical', necessity: 'must', intervalKm: 80000, intervalMonth: 48, note: '官方每 8 万公里更换，建议冰点 -40℃ 规格。' },
    { itemKey: 'air_filter', name: '空气滤清器（电机散热进气）', category: 'electrical', necessity: 'optional', intervalKm: 20000, intervalMonth: 24, conditionFactor: { dusty: 0.5 }, note: '滤芯堵塞会降低电机散热效率、间接影响续航。多尘地区提前更换，费用很低。' },
    { itemKey: 'battery', name: '动力电池健康检测', category: 'electrical', necessity: 'conditional', intervalKm: 20000, intervalMonth: 12, note: '官方建议每年做一次电池健康检查，读取 SOC、电机温度与电控数据。整车 5 年/20 万公里质保、三电终身质保（首任车主）。' },
    { itemKey: 'wiper', name: '雨刮片', category: 'comfort', necessity: 'optional', intervalKm: null, intervalMonth: 12, note: '按刮拭效果判断更换。' },
    ...evTail({ padKm: 40000, padNote: '官方给出的参考更换周期是 4 万公里，但那是设计寿命参考值。5 万公里时刹车片厚度普遍还有 5-7mm，低于 3mm 才必须更换。', tireKm: 60000, tireNote: '官方参考周期 6 万公里，实际按花纹深度与老化判断。胎压标准区间 2.5-2.8bar。' }),
    ...upsellEv(),
  ],
};

/* ================= 北京汽车 BJ 系列（硬派越野） ================= */
const RULESET_BAIC = {
  _id: 'ruleset_baic',
  name: '北京汽车 BJ 越野（BJ40 / BJ60 / BJ80）',
  version: 1,
  updatedAt: '2026-08-03',
  source: '北京越野官方保养规范（首保 5000 公里/6 个月，常规 1 万公里/12 个月）+ 北京越野授权售后四驱专项保养口径',
  manual: {
    title: '北京越野（BJ 系列）随车保养手册',
    scope: '适用：北京汽车 BJ40 / BJ60 / BJ80 等非承载式车身 + 分时四驱硬派越野车型（汽油 / 柴油 / 增程）',
    note: '官方口径：首保 5000 公里或 6 个月（免费），常规保养 1 万公里或 12 个月。硬派越野的特殊之处在于「四驱传动线」——变速箱油、分动箱油、前后桥齿轮油官方随 6 万公里一并更换，这些是两驱 SUV 完全没有的项目，被推荐时不属于过度保养。反过来，频繁沙漠、泥地越野的用户官方建议把机油周期缩短到 4000-5000 公里。',
  },
  items: [
    { itemKey: 'engine_oil', name: '机油', category: 'engine', necessity: 'must', intervalKm: 10000, intervalMonth: 12, conditionFactor: { urban: 0.8, shortTrip: 0.7, dusty: 0.5 }, note: '2.0T 汽油版官方要求 API SP 级 5W-30 全合成机油（北方冬季可用 0W-30）。常规工况 1 万公里；频繁高强度越野时官方建议缩短到 4000-5000 公里。高速或越野后怠速 1-2 分钟再熄火，保护涡轮。' },
    { itemKey: 'oil_filter', name: '机油滤清器', category: 'engine', necessity: 'must', intervalKm: 10000, intervalMonth: 12, note: '随机油同步更换。' },
    { itemKey: 'air_filter', name: '空气滤清器', category: 'engine', necessity: 'must', intervalKm: 20000, intervalMonth: 24, conditionFactor: { dusty: 0.3 }, note: '官方每 2 万公里更换。沙尘环境下官方建议缩短到每 5000 公里检查、必要时提前更换——这是越野车最该缩短的一项，滤芯堵塞会直接导致进气不足、动力下降。涉水后必须开盖检查是否进水。' },
    { itemKey: 'cabin_filter', name: '空调滤芯', category: 'comfort', necessity: 'must', intervalKm: 20000, intervalMonth: 24, conditionFactor: { dusty: 0.4 }, note: '官方每 2 万公里更换，多沙尘越野环境可提前。' },
    { itemKey: 'transmission_oil', name: '变速箱油（8AT）', category: 'transmission', necessity: 'must', intervalKm: 60000, intervalMonth: 72, note: '官方 8 挡手自一体变速箱每 6 万公里更换专用变速箱油。' },
    { itemKey: 'transfer_oil', name: '分动箱油 + 前后桥齿轮油', category: 'transmission', necessity: 'must', intervalKm: 60000, intervalMonth: 72, note: '分时四驱特有项目，官方随 6 万公里与变速箱油同步更换（部分口径为首次 2 万、之后每 4 万）。长期沙尘环境使用建议缩短至 1.5-2 万公里。这一项是硬派越野必做，两驱车没有。' },
    { itemKey: 'brake_fluid', name: '刹车油', category: 'safety', necessity: 'must', intervalKm: 40000, intervalMonth: 24, note: '官方每 2 年或 4 万公里更换。涉水越野后应重点检查制动系统。' },
    { itemKey: 'coolant', name: '防冻液', category: 'engine', necessity: 'must', intervalKm: 60000, intervalMonth: 48, note: '官方每 1 万公里检查冷却液状态，约 6 万公里或 4 年更换。增程版还需定期清理电池散热孔灰尘。' },
    { itemKey: 'spark_plug', name: '火花塞', category: 'engine', necessity: 'must', intervalKm: 40000, intervalMonth: 48, note: '2.0T 涡轮增压机型约 4 万公里更换（柴油版没有这一项）。' },
    { itemKey: 'fuel_filter', name: '燃油滤清器', category: 'engine', necessity: 'must', intervalKm: 40000, intervalMonth: 48, note: '汽油版约 4 万公里；柴油版负荷更高，换季维保时官方会重点检查燃油管路与颗粒捕捉器。' },
    { itemKey: 'chassis_check', name: '底盘螺栓复紧 + 传动轴防尘套检查', category: 'safety', necessity: 'conditional', intervalKm: 5000, intervalMonth: 6, note: '越野专项：官方建议每 5000 公里用扭矩扳手复紧底盘螺栓（120-150 N·m），并检查摆臂胶套、稳定杆连杆、传动轴防尘套。这是越野车特有的检查项，不越野的城市用户可按常规保养节点顺带检查。' },
    { itemKey: 'shock_absorber', name: '减震器 / 悬挂胶套检查', category: 'safety', necessity: 'conditional', intervalKm: 30000, intervalMonth: 36, note: '官方每 3 万公里检查减震器是否漏油、胶套是否开裂。属于检查项，无异常不需更换。' },
    { itemKey: 'throttle_clean', name: '节气门 / 喷油嘴积碳检查', category: 'engine', necessity: 'conditional', intervalKm: 20000, intervalMonth: 24, note: '官方每 2 万公里检查积碳情况——注意是「检查」不是「必洗」。无怠速抖动等症状时不需要清洗。' },
    ...fuelTail({ padKm: 50000, padNote: '官方每 5000 公里检查刹车片厚度。越野车整备质量大，磨损快于同级城市 SUV，但仍按厚度判断（低于 3mm 更换）。', tireNote: '城市通勤胎压 2.3-2.5bar，沙漠泥地越野前降至 1.8-2.0bar、回城后恢复。花纹低于 1.6mm 或胎壁有划伤鼓包时更换。' }),
    { itemKey: 'engine_flush', name: '发动机内部养护 / 燃油宝', category: 'upsell', necessity: 'unnecessary', note: '厂商保养手册未列入此项目。官方售后明确「不强制附加项目」，加注 92 号及以上合格燃油即可。' },
    { itemKey: 'ac_disinfect', name: '空调管道杀菌', category: 'upsell', necessity: 'unnecessary', note: '更换空调滤芯即可解决绝大部分异味问题。' },
    { itemKey: 'oil_additive', name: '机油添加剂 / 抗磨剂', category: 'upsell', necessity: 'unnecessary', note: '合格全合成机油已含完整添加剂配方，额外添加可能破坏原有配比。' },
  ],
};

/* ================= 江淮 瑞风 / 思皓 ================= */
const RULESET_JAC = {
  _id: 'ruleset_jac',
  name: '江淮（瑞风 S3 / S4 / M4 / 思皓 X8）',
  version: 1,
  updatedAt: '2026-08-03',
  source: '江淮汽车官方保养周期表（首保 3000 公里/3 个月，之后每 5000 公里/6 个月）',
  manual: {
    title: '江淮汽车随车保养手册（瑞风系列官方周期表）',
    scope: '适用：江淮 瑞风 S3 / S4 / S7 / M4 / 思皓 X8 等燃油车型',
    note: '官方口径：首保 3000 公里或 3 个月（免费，含机油、机滤、变速箱油与全车检查），之后每 5000 公里或 6 个月常规保养。官方保养周期表明确标注了「●更换 / ○检查」两种状态——很多被门店按「更换」推销的项目，官方其实只要求检查。整车质保 3 年或 10 万公里，电子助力 + 正时链条为长期免维护设计。',
  },
  items: [
    { itemKey: 'engine_oil', name: '机油', category: 'engine', necessity: 'must', intervalKm: 5000, intervalMonth: 6, conditionFactor: { urban: 0.8, shortTrip: 0.7, dusty: 0.8 }, note: '官方周期表每 5000 公里或 6 个月。原厂标配为矿物机油，改用半合成或全合成机油可获得更好的抗氧化与清洁性能，但周期仍建议按官方执行。' },
    { itemKey: 'oil_filter', name: '机油滤清器', category: 'engine', necessity: 'must', intervalKm: 5000, intervalMonth: 6, note: '官方周期表中机油与机滤始终同节点更换。' },
    { itemKey: 'air_filter', name: '空气滤清器', category: 'engine', necessity: 'must', intervalKm: 15000, intervalMonth: 18, conditionFactor: { dusty: 0.5 }, note: '官方每 1.5 万公里更换（周期表中的 18000 / 33000 / 48000 节点）。日常保养时官方只要求「检查/清洁」，不是每次都换。' },
    { itemKey: 'cabin_filter', name: '空调滤芯', category: 'comfort', necessity: 'must', intervalKm: 15000, intervalMonth: 18, conditionFactor: { dusty: 0.5 }, note: '官方每 1.5 万公里更换，与空气滤清器同节点。' },
    { itemKey: 'fuel_filter', name: '燃油滤清器', category: 'engine', necessity: 'must', intervalKm: 15000, intervalMonth: 18, note: '官方每 1.5 万公里更换，与空滤同节点。这是江淮区别于多数「汽滤终身免换」车型的地方，被推荐时不属于过度保养。' },
    { itemKey: 'spark_plug', name: '火花塞', category: 'engine', necessity: 'must', intervalKm: 20000, intervalMonth: 12, note: '官方每 2 万公里或 1 年更换。周期偏短是因为原厂配的是普通镍合金塞；换装铱金塞后实际寿命可显著延长，出保后可结合点火状态判断。' },
    { itemKey: 'brake_fluid', name: '刹车油', category: 'safety', necessity: 'must', intervalKm: 40000, intervalMonth: 24, note: '官方每 2 年或 4 万公里更换。可先做含水量检测，超过 3% 必须更换。' },
    { itemKey: 'coolant', name: '防冻液', category: 'engine', necessity: 'must', intervalKm: 80000, intervalMonth: 48, note: '官方正常情况每 4 年或 8 万公里更换；特殊工况（高温、重载、频繁短途）缩短至 1 年或 2 万公里。' },
    { itemKey: 'transmission_oil', name: '变速箱油', category: 'transmission', necessity: 'must', intervalKm: 60000, intervalMonth: 72, note: '自动变速箱油官方每 6 万公里更换；手动变速箱油为每 1 年或 2 万公里（周期短很多，手动挡车主注意别漏做）。CVT 车型官方在 5.8 万公里节点更换。' },
    { itemKey: 'timing_chain', name: '正时链条', category: 'engine', necessity: 'conditional', intervalKm: null, intervalMonth: null, note: '江淮官方明确瑞风采用正时链条 + 电子助力，属于长期免维护设计，无固定更换里程。任何按里程推荐「更换正时套件」的建议都缺乏官方依据。' },
    ...fuelTail({ padKm: 60000 }),
    ...upsellFuel(),
  ],
};

module.exports = {
  ruleset_vw_ev: RULESET_VW_EV,
  ruleset_geely_galaxy: RULESET_GEELY_GALAXY,
  ruleset_changan_qiyuan: RULESET_CHANGAN_QIYUAN,
  ruleset_avatr: RULESET_AVATR,
  ruleset_avatr_reev: RULESET_AVATR_REEV,
  ruleset_arcfox: RULESET_ARCFOX,
  ruleset_baic: RULESET_BAIC,
  ruleset_jac: RULESET_JAC,
};
