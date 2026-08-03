// data/rule_sets_ext.js —— 保养规则集扩展包（专属手册补充）
// 由 data/rule_sets.js 统一 require 并合并导出，对外仍以 rule_sets.js 为单一出口。
//
// 本文件收录「此前回落到通用兜底」的品牌专属规则集，以及从通用纯电规则中拆出的
// 特斯拉专属规则。周期均整理自厂商官方渠道（已 WebSearch 校验，来源标注见各 source 字段）。
const { upsellFuel, upsellEv } = require('./rule_set_common.js');

// ---------------- 保时捷（Macan / Cayenne） ----------------
// 依据：保时捷官方售后「定期保养服务」保养时间表（after-sales.porschehk.com）
const RULESET_PORSCHE = {
  _id: 'ruleset_porsche',
  name: '保时捷保养规则（Macan / Cayenne）',
  version: 1,
  updatedAt: '2026-08-03',
  source: '保时捷官方售后定期保养时间表（Macan / Cayenne 车款保养周期）',
  manual: {
    title: '保时捷官方定期保养时间表',
    scope: '适用：保时捷 Macan / Cayenne（汽油机型）；718 / 911 / Panamera 周期相近可参考',
    note: '本页周期整理自保时捷官方售后公布的保养时间表。保时捷采用「换油保养（1 万公里/1 年）+ 中期保养（3 万公里/2 年）+ 全面保养（6 万公里/4 年）」三级体系，未达里程也须按年限执行。',
  },
  items: [
    { itemKey: 'engine_oil', name: '机油', category: 'engine', necessity: 'must', intervalKm: 10000, intervalMonth: 12, conditionFactor: { urban: 0.7, shortTrip: 0.6, dusty: 0.8 }, note: '官方换油保养周期为每 1 万公里或每 1 年，以先到者为准；未达里程也必须按年限更换。原厂指定 Mobil 1 认证机油。' },
    { itemKey: 'oil_filter', name: '机油滤清器', category: 'engine', necessity: 'must', intervalKm: 10000, intervalMonth: 12, note: '随机油同步更换。' },
    { itemKey: 'spark_plug', name: '火花塞', category: 'engine', necessity: 'must', intervalKm: 20000, intervalMonth: 24, note: '官方时间表明确列在每 2 万公里 / 每 2 年节点更换，周期显著短于普通家用车，属于保时捷的正常项目而非过度保养。' },
    { itemKey: 'throttle_clean', name: '节气门清洗', category: 'engine', necessity: 'must', intervalKm: 20000, intervalMonth: 24, note: '保时捷是少数把节气门清洗写进官方保养时间表的品牌（每 2 万公里 / 2 年）。对多数其他品牌这属过度保养项，但对你的车是手册正式项目，建议照做。' },
    { itemKey: 'brake_fluid', name: '刹车油', category: 'safety', necessity: 'must', intervalKm: 30000, intervalMonth: 24, note: '官方中期保养（3 万公里 / 2 年）固定项目。高性能车制动负荷大，此项不建议按含水量拖延。' },
    { itemKey: 'air_filter', name: '空气滤清器', category: 'engine', necessity: 'must', intervalKm: 60000, intervalMonth: 48, conditionFactor: { dusty: 0.5 }, note: '官方全面保养（6 万公里 / 4 年）节点更换；Cayenne 部分年款标注更长。多尘环境应缩短。' },
    { itemKey: 'cabin_filter', name: '空调滤芯（花粉滤清器）', category: 'comfort', necessity: 'optional', intervalKm: 20000, intervalMonth: 24, conditionFactor: { dusty: 0.5 }, note: '官方标注「如有需要」更换，不影响行车安全，可按车内空气质量自行判断。' },
    { itemKey: 'transfer_oil', name: '分动箱油', category: 'transmission', necessity: 'must', intervalKm: 60000, intervalMonth: 48, note: '四驱车型分动箱（Transfer gear）在官方全面保养 6 万公里 / 4 年节点换油，是容易被忽略的正式项目。' },
    { itemKey: 'transmission_oil', name: 'PDK 变速箱油', category: 'transmission', necessity: 'conditional', intervalKm: 180000, intervalMonth: 144, note: '官方时间表把 PDK 变速箱油、离合器油列在 18 万公里 / 12 年，周期极长。若门店在 6 万公里就推荐更换 PDK 油，属于明显提前。' },
    { itemKey: 'coolant', name: '防冻液', category: 'engine', necessity: 'conditional', intervalKm: null, intervalMonth: null, note: '保时捷官方保养时间表未设固定更换周期，按液位与冰点检测结果处理即可，无需按年限盲目更换。' },
    { itemKey: 'brake_pad', name: '刹车片', category: 'safety', necessity: 'conditional', intervalKm: 40000, intervalMonth: null, conditionFactor: { urban: 0.6 }, note: '按厚度与磨损报警判断。激烈驾驶、赛道使用会大幅缩短寿命。' },
    { itemKey: 'battery', name: '蓄电池', category: 'electrical', necessity: 'conditional', intervalKm: null, intervalMonth: 48, note: '按启动性能和电压检测判断，一般 3-5 年。' },
    { itemKey: 'tire', name: '轮胎 / 补胎胶', category: 'safety', necessity: 'conditional', intervalKm: 50000, intervalMonth: null, note: '按磨损与老化判断。官方另要求在中期/全面保养时检查随车补胎胶的有效期，过期需更换。' },
    { itemKey: 'engine_flush', name: '发动机内部养护 / 燃油宝', category: 'upsell', necessity: 'unnecessary', note: '保时捷官方保养项目中虽含燃油添加剂，但使用合格标号燃油的车辆无需额外单独加购；不要按次收费重复添加。' },
    { itemKey: 'ac_disinfect', name: '空调管道杀菌', category: 'upsell', necessity: 'unnecessary', note: '更换花粉滤清器即可解决绝大部分异味问题，管道杀菌不在厂商保养项目中。' },
    { itemKey: 'oil_additive', name: '机油添加剂 / 抗磨剂', category: 'upsell', necessity: 'unnecessary', note: '原厂认证机油已含完整添加剂配方，额外添加可能破坏配比。' },
  ],
};

// ---------------- 捷豹路虎（Ingenium 平台） ----------------
// 依据：路虎中国官网保养服务包（landrover.com.cn）— 保养间隔不超过 12 个月或 10,000 公里
const RULESET_JLR = {
  _id: 'ruleset_jlr',
  name: '捷豹路虎保养规则（Ingenium）',
  version: 1,
  updatedAt: '2026-08-03',
  source: '路虎中国官网保养服务包 + 捷豹路虎 Ingenium 平台机油规格标准（STJLR）',
  manual: {
    title: '捷豹路虎 Ingenium 平台保养手册',
    scope: '适用：路虎 揽胜极光 / 发现运动，捷豹 XFL 等搭载 Ingenium 系列发动机（PT204/PT306）车型',
    note: '路虎中国官方建议保养间隔不超过 12 个月或 10,000 公里（以先到者为准），采用基础尊护 A/B 套餐交替执行。机油必须使用 STJLR 认证低灰分产品，这是本平台最关键的一条。',
  },
  items: [
    { itemKey: 'engine_oil', name: '机油（须 STJLR 认证）', category: 'engine', necessity: 'must', intervalKm: 10000, intervalMonth: 12, conditionFactor: { urban: 0.7, shortTrip: 0.6, dusty: 0.8 }, note: '官方间隔不超过 1 万公里或 12 个月。必须选用带 STJLR 认证的低灰分全合成机油——普通机油灰分超标会堵塞颗粒捕捉器（GPF），引发怠速抖动、动力不足、故障灯常亮。这项钱绝对不能省。城区拥堵为主（均速低于 30km/h）建议缩短至 8000 公里。' },
    { itemKey: 'oil_filter', name: '机油滤清器', category: 'engine', necessity: 'must', intervalKm: 10000, intervalMonth: 12, note: '随机油同步更换，不建议只换油不换滤。' },
    { itemKey: 'air_filter', name: '空气滤清器', category: 'engine', necessity: 'must', intervalKm: 30000, intervalMonth: 36, conditionFactor: { dusty: 0.5 }, note: '基础尊护 B 套餐项目，约 3 万公里更换；多尘地区缩短。' },
    { itemKey: 'cabin_filter', name: '空调滤芯', category: 'comfort', necessity: 'optional', intervalKm: 20000, intervalMonth: 12, conditionFactor: { dusty: 0.5 }, note: '不影响行车安全，主要影响车内空气质量。' },
    { itemKey: 'spark_plug', name: '火花塞', category: 'engine', necessity: 'must', intervalKm: 60000, intervalMonth: 72, note: 'Ingenium 汽油机型约 6 万公里更换，具体以随车手册为准。' },
    { itemKey: 'fuel_filter', name: '汽油滤清器', category: 'engine', necessity: 'must', intervalKm: 60000, intervalMonth: 72, note: '多为内置油泵总成，更换成本较高，无异常可按上限执行。' },
    { itemKey: 'brake_fluid', name: '刹车油', category: 'safety', necessity: 'conditional', intervalKm: null, intervalMonth: 24, note: '按含水量检测结果更换，超过 3% 才需更换。不要仅凭年限盲目更换。' },
    { itemKey: 'brake_pad', name: '刹车片', category: 'safety', necessity: 'conditional', intervalKm: 40000, intervalMonth: null, conditionFactor: { urban: 0.6 }, note: '按厚度判断，剩余小于 3mm 需更换。车重较大，市区路况磨损更快。' },
    { itemKey: 'coolant', name: '防冻液', category: 'engine', necessity: 'must', intervalKm: 100000, intervalMonth: 60, note: '长效型按 10 万公里或 5 年，不同规格不可混加。' },
    { itemKey: 'transmission_oil', name: '变速箱油（ZF 8AT）', category: 'transmission', necessity: 'conditional', intervalKm: 80000, intervalMonth: 96, note: '搭载 ZF 8 速自动变速箱，官方标注免维护，但实际建议 8 万公里左右更换以保证换挡品质与寿命。' },
    { itemKey: 'timing_chain', name: '正时链条检查', category: 'engine', necessity: 'conditional', intervalKm: null, intervalMonth: null, note: '重点检测项：早期 2.0 Ingenium 存在正时链条张紧器隐患。典型症状是冷启动瞬间有几秒金属「哗啦」异响，一旦出现应尽快检修，不要拖到断链。无异响则无需预防性更换。' },
    { itemKey: 'battery', name: '蓄电池', category: 'electrical', necessity: 'conditional', intervalKm: null, intervalMonth: 48, note: '按启动性能和电压检测判断，一般 3-5 年。带启停功能须用 AGM/EFB 规格，不可用普通电瓶替代。' },
    { itemKey: 'tire', name: '轮胎', category: 'safety', necessity: 'conditional', intervalKm: 60000, intervalMonth: null, note: '按磨损与老化判断，胎纹低于 1.6mm 或出现龟裂、鼓包需及时更换。' },
    ...upsellFuel(),
  ],
};

// ---------------- Jeep（指南者 / 自由光） ----------------
// 依据：Jeep 官方保养周期表（首保 5000 公里，全车油液集中 5 万公里）
const RULESET_JEEP = {
  _id: 'ruleset_jeep',
  name: 'Jeep 保养规则（指南者 / 自由光）',
  version: 1,
  updatedAt: '2026-08-03',
  source: 'Jeep 官方保养周期表整理（指南者 / 自由光）',
  manual: {
    title: 'Jeep 随车保养手册（指南者 / 自由光）',
    scope: '适用：Jeep 指南者 / 自由光 等国产 Jeep 车型',
    note: '本页周期整理自 Jeep 官方保养周期表。Jeep 的特点是「全车油液集中在 5 万公里更换」，且汽油滤清器为终身免更换设计，这两点最容易被门店做文章。',
  },
  items: [
    { itemKey: 'engine_oil', name: '机油', category: 'engine', necessity: 'must', intervalKm: 10000, intervalMonth: 12, conditionFactor: { urban: 0.7, shortTrip: 0.6, dusty: 0.8 }, note: '首保 5000 公里；之后涡轮机型建议 7500 公里 / 6 个月，自吸机型 1 万公里 / 12 个月。使用原厂全合成机油可按 1 万公里执行，不必迷信「5000 公里一保」。' },
    { itemKey: 'oil_filter', name: '机油滤清器', category: 'engine', necessity: 'must', intervalKm: 10000, intervalMonth: 12, note: '随机油同步更换。' },
    { itemKey: 'air_filter', name: '空气滤清器', category: 'engine', necessity: 'must', intervalKm: 20000, intervalMonth: 24, conditionFactor: { dusty: 0.5 }, note: '官方周期表标注每 1-2 万公里更换，可先检查滤芯脏污程度再决定，无需到期即换。' },
    { itemKey: 'cabin_filter', name: '空调滤芯', category: 'comfort', necessity: 'optional', intervalKm: 40000, intervalMonth: 24, conditionFactor: { dusty: 0.5 }, note: '官方建议每 4 万公里或 2 年更换。北方多尘地区可酌情缩短，自行更换成本很低。' },
    { itemKey: 'fuel_filter', name: '汽油滤清器', category: 'engine', necessity: 'unnecessary', note: 'Jeep 官方明确标注汽油滤清器为「终身免更换」（内置于油泵总成）。若门店按里程推荐更换汽油滤，属于典型的过度保养项目，可直接拒绝。' },
    { itemKey: 'spark_plug', name: '火花塞', category: 'engine', necessity: 'must', intervalKm: 50000, intervalMonth: 60, note: '官方周期表在 5 万公里节点更换。' },
    { itemKey: 'brake_fluid', name: '刹车油', category: 'safety', necessity: 'conditional', intervalKm: 50000, intervalMonth: 24, note: '官方随全车油液在 5 万公里节点更换；日常按含水量检测判断，超过 3% 才需更换。' },
    { itemKey: 'brake_pad', name: '刹车片', category: 'safety', necessity: 'conditional', intervalKm: 40000, intervalMonth: null, conditionFactor: { urban: 0.6 }, note: '按厚度判断，剩余小于 3mm 需更换。' },
    { itemKey: 'coolant', name: '防冻液', category: 'engine', necessity: 'must', intervalKm: 100000, intervalMonth: 60, note: '官方周期约 10 万公里，长效型防冻液不必频繁更换，注意规格不可混加。' },
    { itemKey: 'transmission_oil', name: '变速箱油', category: 'transmission', necessity: 'conditional', intervalKm: 50000, intervalMonth: 60, note: '官方随全车油液在 5 万公里节点更换。请先确认自己车型是 9AT 还是 CVT，两者用油完全不同，CVT 油单价更高。' },
    { itemKey: 'steering_oil', name: '转向助力油', category: 'transmission', necessity: 'conditional', intervalKm: 50000, intervalMonth: 60, note: '官方随全车油液在 5 万公里节点更换；电子助力转向车型无此项，先确认车辆配置。' },
    { itemKey: 'timing_chain', name: '正时链条', category: 'engine', necessity: 'unnecessary', note: 'Jeep 该平台采用正时链条传动，官方标注免维护、无固定更换周期。无异响时按里程更换正时套件属于过度保养。' },
    { itemKey: 'battery', name: '蓄电池', category: 'electrical', necessity: 'conditional', intervalKm: null, intervalMonth: 48, note: '按启动性能和电压检测判断，一般 3-5 年。' },
    { itemKey: 'tire', name: '轮胎', category: 'safety', necessity: 'conditional', intervalKm: 60000, intervalMonth: null, note: '按磨损与老化判断，胎纹低于 1.6mm 或出现龟裂、鼓包需及时更换。' },
    ...upsellFuel(),
  ],
};

// ---------------- 标致 / 雪铁龙（PSA 平台） ----------------
// 依据：雪铁龙 C4L 随车保养手册 + PSA 机油认证标准（B71 2312/2302、ACEA C2/C3）
const RULESET_PSA = {
  _id: 'ruleset_psa',
  name: '标致雪铁龙保养规则（PSA）',
  version: 1,
  updatedAt: '2026-08-03',
  source: '雪铁龙/标致随车保养手册整理 + PSA 官方机油认证标准',
  manual: {
    title: '标致·雪铁龙 PSA 平台保养手册',
    scope: '适用：标致 408 / 雪铁龙 C4L 等 PSA 平台车型（1.6T / 1.8L / 1.2T）',
    note: '本页周期整理自法系车随车手册。法系车两个关键点：机油须满足 PSA B71 或 ACEA A5/B5（国六 GPF 车型需 C2/C3 低灰分）；1.2T 湿式正时皮带是必须按期更换的安全项。',
  },
  items: [
    { itemKey: 'engine_oil', name: '机油（须 PSA/ACEA 认证）', category: 'engine', necessity: 'must', intervalKm: 10000, intervalMonth: 12, conditionFactor: { urban: 0.7, shortTrip: 0.6, dusty: 0.8 }, note: '原厂口径 7500 公里 / 6 个月；使用全合成机油可放宽到 1 万公里 / 1 年。必须满足 PSA B71 2312/2302 或 ACEA A5/B5 认证，国六 GPF 车型须用 C2/C3 低灰分，否则会堵塞颗粒捕捉器。' },
    { itemKey: 'oil_filter', name: '机油滤清器', category: 'engine', necessity: 'must', intervalKm: 10000, intervalMonth: 12, note: '随机油同步更换。' },
    { itemKey: 'timing_belt', name: '正时皮带（1.2T 湿式 / 1.6L）', category: 'engine', necessity: 'must', intervalKm: 90000, intervalMonth: 72, note: '安全关键项，断裂会直接顶弯气门、报废发动机。1.6L/1.2T 采用正时皮带，官方周期 6 年或 9 万公里；其中 1.2T 为「浸油式（湿式）皮带」，老化会掉屑堵塞机油滤网，建议提前到 7 万公里更换。注意：1.6T 新款为正时链条，免维护，不适用本项。' },
    { itemKey: 'air_filter', name: '空气滤清器', category: 'engine', necessity: 'must', intervalKm: 30000, intervalMonth: 24, conditionFactor: { dusty: 0.5 }, note: '官方约 3 万公里；多尘地区 1 万公里检查，脏了再换。' },
    { itemKey: 'cabin_filter', name: '空调滤芯', category: 'comfort', necessity: 'optional', intervalKm: 10000, intervalMonth: 12, conditionFactor: { dusty: 0.5 }, note: '建议每 1 万公里或半年更换，雨季雾霾季可缩短，可自行更换。' },
    { itemKey: 'spark_plug', name: '火花塞', category: 'engine', necessity: 'must', intervalKm: 40000, intervalMonth: 48, note: '涡轮增压机型（1.6T/1.8T）铂金/铱金火花塞约 3-4 万公里；自然吸气机型可达 6-8 万公里。' },
    { itemKey: 'fuel_filter', name: '汽油滤清器', category: 'engine', necessity: 'must', intervalKm: 60000, intervalMonth: 60, note: '内置式约 6-8 万公里；老款外置式可 2-3 万公里检查后更换。' },
    { itemKey: 'brake_fluid', name: '刹车油', category: 'safety', necessity: 'conditional', intervalKm: 30000, intervalMonth: 24, note: '手册标注约 3 万公里节点；实际按含水量检测更换，超过 3% 才需更换。' },
    { itemKey: 'brake_pad', name: '刹车片', category: 'safety', necessity: 'conditional', intervalKm: 40000, intervalMonth: null, conditionFactor: { urban: 0.6 }, note: '按厚度判断，磨到钢背警示线需更换；刹车盘磨损极限一般为 2mm。' },
    { itemKey: 'coolant', name: '防冻液', category: 'engine', necessity: 'must', intervalKm: 60000, intervalMonth: 48, note: '手册约 3-6 万公里，法系专用规格不可与其他品牌混加。' },
    { itemKey: 'transmission_oil', name: '变速箱油', category: 'transmission', necessity: 'conditional', intervalKm: 90000, intervalMonth: 96, note: '自动变速箱约 9 万公里，手动变速箱约 6 万公里。周期较长，不必提前更换。' },
    { itemKey: 'battery', name: '蓄电池（EFB/AGM）', category: 'electrical', necessity: 'conditional', intervalKm: null, intervalMonth: 48, note: '一般 3-5 年。带自动启停车型必须用 EFB/AGM 规格，普通电瓶无法替代，换错会频繁亏电。' },
    { itemKey: 'tire', name: '轮胎', category: 'safety', necessity: 'conditional', intervalKm: 60000, intervalMonth: null, note: '花纹低于 1.6mm 或使用超过 5 年须更换；建议每 1-1.5 万公里前后交叉换位，缓解偏磨。' },
    ...upsellFuel(),
  ],
};

// ---------------- 特斯拉（Model 3 / Model Y） ----------------
// 依据：特斯拉官方车主手册「维修服务间隔」章节（tesla.cn ownersmanual / service.tesla.com）
// 关键：官方保养表中【没有】减速器齿轮油、电池冷却液的定期更换项，制动液是「4 年检查」而非定期更换。
const RULESET_TESLA = {
  _id: 'ruleset_tesla',
  name: '特斯拉保养规则（Model 3 / Model Y）',
  version: 1,
  updatedAt: '2026-08-03',
  source: '特斯拉官方车主手册「维修服务间隔」（tesla.cn 简体中文版）',
  manual: {
    title: '特斯拉官方车主手册 · 维修服务间隔',
    scope: '适用：特斯拉 Model 3 / Model Y（Model S / X 周期相近可参考）',
    note: '本页周期直接对照特斯拉官方车主手册。特斯拉官方保养项目极少，且明确说明「车辆应根据需要进行维修」——凡是官方清单之外的定期更换项目，都值得你多问一句为什么。',
  },
  items: [
    { itemKey: 'cabin_filter', name: '座舱空调滤清器', category: 'comfort', necessity: 'must', intervalKm: null, intervalMonth: 24, conditionFactor: { dusty: 0.5 }, note: '官方周期：每 2 年更换一次。若为 HEPA + 活性炭滤清器配置，官方标注每 3 年更换，但【中国市场明确要求每年更换一次】。这是特斯拉少数几个固定周期项目之一。' },
    { itemKey: 'brake_fluid', name: '制动液（检查为主）', category: 'safety', necessity: 'conditional', intervalKm: null, intervalMonth: 48, note: '官方原文是「每 4 年检查一次制动液状况，必要时更换」——注意是检查，不是到期必换。若门店按 2 年周期直接给你换刹车油，可要求先做含水量检测。经常拖车、长下坡或湿热环境激烈驾驶的车辆需提高检查频率。' },
    { itemKey: 'brake_caliper', name: '制动钳清洁与润滑', category: 'safety', necessity: 'conditional', intervalKm: 20000, intervalMonth: 12, note: '官方项目，但有前提条件：仅【冬季道路撒盐地区】需要每年或每 2 万公里清洁润滑一次。南方无融雪盐的地区不必按此周期执行，属于可以省下的项目。' },
    { itemKey: 'wiper', name: '雨刮片', category: 'comfort', necessity: 'must', intervalKm: null, intervalMonth: 12, note: '官方建议每年更换一次。属于易损件，自行更换成本极低。' },
    { itemKey: 'tire_rotation', name: '轮胎换位', category: 'safety', necessity: 'must', intervalKm: 10000, intervalMonth: null, note: '官方周期：每行驶 1 万公里，或前后胎纹深度差达到 1.5mm 时（以先到者为准）进行换位。电车扭矩大、车重高，不做换位会明显偏磨，这项比换什么油都实在。' },
    { itemKey: 'ac_desiccant', name: '空调干燥剂（干燥包）', category: 'comfort', necessity: 'conditional', intervalKm: null, intervalMonth: 72, note: '仅适用于约 2021 年之前生产的车辆，官方标注每 6 年更换一次。较新年款车型无此项目。' },
    { itemKey: 'brake_pad', name: '刹车片', category: 'safety', necessity: 'conditional', intervalKm: 100000, intervalMonth: null, note: '官方未设固定更换周期，按厚度判断即可。特斯拉动能回收介入极强，刹车片实际磨损远低于燃油车，很多车 10 万公里仍未更换。' },
    { itemKey: 'tire', name: '轮胎', category: 'safety', necessity: 'conditional', intervalKm: 50000, intervalMonth: null, note: '按磨损与老化判断，胎纹低于 1.6mm 需更换。整车较重且加速快，磨损通常快于同级燃油车。' },
    { itemKey: 'battery', name: '动力电池健康检测', category: 'electrical', necessity: 'optional', intervalKm: null, intervalMonth: 12, note: '官方保养清单未强制要求定期检测。可通过车机与充电记录自行观察续航衰减，异常时再进店；无需付费做所谓「电池深度检测」。' },
    { itemKey: 'gear_oil', name: '减速器齿轮油', category: 'transmission', necessity: 'unnecessary', note: '特斯拉官方车主手册的维修服务间隔中【没有】减速器齿轮油更换项目，设计为终身免维护。第三方门店推荐的「电车也要换齿轮油」缺乏官方依据，属于典型的过度保养。' },
    { itemKey: 'coolant', name: '电池冷却液', category: 'electrical', necessity: 'unnecessary', note: '官方保养清单中【没有】冷却液定期更换项，并明确警告：擅自打开电池冷却液储液罐造成的任何损坏均不在保修范围内。请勿让非官方门店私自开盖更换。' },
    ...upsellEv(),
  ],
};

module.exports = {
  ruleset_porsche: RULESET_PORSCHE,
  ruleset_jlr: RULESET_JLR,
  ruleset_jeep: RULESET_JEEP,
  ruleset_psa: RULESET_PSA,
  ruleset_tesla: RULESET_TESLA,
};

