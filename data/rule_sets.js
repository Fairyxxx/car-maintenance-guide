// data/rule_sets.js —— 保养规则集库（单一数据源）
// 导出各品牌/平台/动力类型的真实保养规则集，每套均带 manual（手册依据）。
//
// 设计原则：
// 1. 按「发动机/平台家族」组织规则集——这正是汽车保养手册的组织方式
//    （如「大众 EA211 保养手册」覆盖所有 EA211 车型），而非逐车型穷举。
// 2. 周期整理自各厂商随车保养手册与公开官方标准（已用 WebSearch 校验），
//    并遵循「以先到者为准、工况恶劣缩短、检测优先于盲换」的保守口径。
// 3. manual 如实标注来源与适用范围，正式更换周期以用户随车手册为准
//    （免责声明已在体检页/单项详情动态引用 manual.title）。
// 4. ruleset_generic 为最后兜底（仅用于暂无专属手册的车型/品牌）；纯电/增程原兜底桶
//    ruleset_ev / ruleset_range_ext 已拆分为 17 套新能源品牌专属规则集（见 data/rule_sets_nev.js）。
//
// 本地加载：本模块由 utils/engine.js 在端上直接 require，作为判定算法的规则源，
// 无需任何服务器或云环境。若日后接入云数据库，可把每个规则集作为一篇文档写入
// rule_sets 集合，_id 即规则集 id（如 ruleset_toyota），vehicle.ruleSetId 指向之即可。

// ---------------- 公共：过度保养项目（unnecessary，产品差异化核心） ----------------
// 已抽取到 data/rule_set_common.js，与扩展包 rule_sets_ext.js 共用同一份定义。
const { upsellFuel, upsellEv } = require('./rule_set_common.js');
const EXT_RULESETS = require('./rule_sets_ext.js');
// 自主品牌专属包（长城 / 长安 / 奇瑞 / 传祺 / 上汽 / 红旗），由 ruleset_domestic 拆分而来
const CN_RULESETS = require('./rule_sets_cn.js');
// 新能源品牌专属包（纯电 14 套 + 增程 3 套），由 ruleset_ev / ruleset_range_ext 拆分而来，
// 彻底消灭最后两个「非专属手册」兜底桶（见 data/rule_sets_nev.js）
const NEV_RULESETS = require('./rule_sets_nev.js');
// 第五轮扩充包：品牌拆分（沃尔沃 / 斯巴鲁 / 三菱 / 铃木，此前挂在同源或「日系其他」桶里）
// + 新增在售品牌（名爵 MG 燃油与纯电 / 捷达 JETTA / 捷途 / 岚图纯电与增程），见 data/rule_sets_v2.js
const V2_RULESETS = require('./rule_sets_v2.js');
// 第六轮扩充包：补齐仍缺失的在售品牌——大众 ID. 家族（合资纯电此前完全空白）、吉利银河、
// 长安启源、阿维塔（纯电/增程分列）、极狐 ARCFOX、北京越野 BJ、江淮瑞风，见 data/rule_sets_v3.js
const V3_RULESETS = require('./rule_sets_v3.js');
// 第七轮拆分包：消灭最后三个「一份手册管一堆车」的通用大桶——
// 雷克萨斯与丰田双擎从 ruleset_toyota 独立，凯迪拉克与雪佛兰从 ruleset_buick_gm 独立，
// 奥迪横置平台与斯柯达从 ruleset_vw_ea211 独立，见 data/rule_sets_v4.js
const V4_RULESETS = require('./rule_sets_v4.js');

// ---------------- 大众 EA211（1.2T/1.4T/1.5L 自然吸气+涡轮） ----------------
const RULESET_VW_EA211 = {
  _id: 'ruleset_vw_ea211',
  name: '大众 EA211 系列保养规则（大众品牌）',
  version: 2,
  updatedAt: '2026-08-03',
  source: '上汽大众 / 一汽-大众 EA211 平台随车保养手册',
  manual: {
    title: '大众品牌 EA211 平台随车保养手册',
    scope: '适用：大众 速腾 / 朗逸 / 宝来 / 探歌 / 途岳 / 高尔夫 / Polo / 桑塔纳 / 途铠 等 EA211 平台（1.2T/1.4T/1.5L）车型',
    note: '本页周期依据大众品牌随车保养手册。EA211 涡轮机型需用符合 VW 504 00 规格的全合成机油。注意：同平台的奥迪（A3/Q2L/Q3）与斯柯达（明锐等）虽共用发动机，但**官方保养周期表各自独立**，已在本产品中单列，不要互相套用。',
  },
  items: [
    { itemKey: 'engine_oil', name: '机油', category: 'engine', necessity: 'must', intervalKm: 10000, intervalMonth: 12, conditionFactor: { urban: 0.7, shortTrip: 0.6, dusty: 0.8 }, note: '全合成机油按 1 万公里或 1 年；半合成建议缩短至 7500 公里。频繁短途行驶机油劣化更快。' },
    { itemKey: 'oil_filter', name: '机油滤清器', category: 'engine', necessity: 'must', intervalKm: 10000, intervalMonth: 12, conditionFactor: { urban: 0.7, shortTrip: 0.6 }, note: '随机油同步更换，不建议只换油不换滤。' },
    { itemKey: 'air_filter', name: '空气滤清器', category: 'engine', necessity: 'must', intervalKm: 20000, intervalMonth: 24, conditionFactor: { dusty: 0.5 }, note: '北方多尘地区或长期工地路段行驶需缩短一半周期。' },
    { itemKey: 'cabin_filter', name: '空调滤芯', category: 'comfort', necessity: 'optional', intervalKm: 20000, intervalMonth: 12, conditionFactor: { dusty: 0.5 }, note: '不影响车辆安全，主要影响车内空气质量。自己动手更换成本不足 4S 店三分之一。' },
    { itemKey: 'fuel_filter', name: '汽油滤清器', category: 'engine', necessity: 'must', intervalKm: 60000, intervalMonth: 72, note: '外置式可单独更换；内置于油泵总成的车型更换成本较高，无异常可按上限执行。' },
    { itemKey: 'spark_plug', name: '火花塞', category: 'engine', necessity: 'must', intervalKm: 60000, intervalMonth: 72, note: 'EA211 涡轮机型原厂火花塞约 6 万公里更换；具体寿命取决于材质（镍合金/铱金）。' },
    { itemKey: 'brake_fluid', name: '刹车油', category: 'safety', necessity: 'conditional', intervalKm: null, intervalMonth: 24, note: '应按含水量检测结果更换，超过 3% 才需更换。南方潮湿地区吸水更快。不要仅凭年限盲目更换。' },
    { itemKey: 'brake_pad', name: '刹车片', category: 'safety', necessity: 'conditional', intervalKm: 40000, intervalMonth: null, conditionFactor: { urban: 0.6 }, note: '按厚度判断，剩余小于 3mm 需更换。市区拥堵路况磨损明显更快，以实际检测为准。' },
    { itemKey: 'coolant', name: '防冻液', category: 'engine', necessity: 'must', intervalKm: 100000, intervalMonth: 60, note: '长效型可按 10 万公里或 5 年，注意不同颜色规格不可混加。' },
    { itemKey: 'transmission_oil', name: '变速箱油（DSG 干式）', category: 'transmission', necessity: 'conditional', intervalKm: 60000, intervalMonth: 72, note: 'EA211 多配 7 速干式双离合，按 6 万公里更换专用油。请先确认自己车型变速箱类型。' },
    { itemKey: 'battery', name: '蓄电池', category: 'electrical', necessity: 'conditional', intervalKm: null, intervalMonth: 48, note: '按启动性能和电压检测判断，一般 3-5 年。突然启动无力是主要更换信号。' },
    { itemKey: 'tire', name: '轮胎', category: 'safety', necessity: 'conditional', intervalKm: 60000, intervalMonth: null, note: '按磨损与老化判断，胎纹低于 1.6mm 或出现龟裂、鼓包需及时更换。' },
    ...upsellFuel(),
  ],
};

// ---------------- 大众 / 奥迪 EA888（2.0T/1.8T 涡轮直喷） ----------------
const RULESET_VW_EA888 = {
  _id: 'ruleset_vw_ea888',
  name: '大众/奥迪 EA888 系列保养规则',
  version: 1,
  updatedAt: '2026-08-02',
  source: '大众/奥迪 EA888 平台随车保养手册整理（三代 EA888）',
  manual: {
    title: '大众·奥迪 EA888 系列随车保养手册',
    scope: '适用：大众 帕萨特 / 迈腾 / 途观L / CC / 揽巡 / 探岳(2.0T)，奥迪 A4L / A6L / Q5L(2.0T) 等 EA888 平台车型',
    note: '本页各项周期整理自上述厂商保养手册。EA888 为涡轮直喷发动机，机油需用 VW 认证全合成，火花塞更换周期较自吸更短。',
  },
  items: [
    { itemKey: 'engine_oil', name: '机油', category: 'engine', necessity: 'must', intervalKm: 10000, intervalMonth: 12, conditionFactor: { urban: 0.7, shortTrip: 0.6, dusty: 0.8 }, note: '官方基础周期 1 万公里/1 年；拥堵、短途工况建议缩短至 7500 公里。须用 VW 认证全合成机油。' },
    { itemKey: 'oil_filter', name: '机油滤清器', category: 'engine', necessity: 'must', intervalKm: 10000, intervalMonth: 12, conditionFactor: { urban: 0.7, shortTrip: 0.6 }, note: '随机油同步更换。' },
    { itemKey: 'air_filter', name: '空气滤清器', category: 'engine', necessity: 'must', intervalKm: 20000, intervalMonth: 24, conditionFactor: { dusty: 0.5 }, note: '多尘环境可缩短至 1 万公里。' },
    { itemKey: 'cabin_filter', name: '空调滤芯', category: 'comfort', necessity: 'optional', intervalKm: 10000, intervalMonth: 12, conditionFactor: { dusty: 0.5 }, note: '建议每年或 1 万公里更换，可自行更换。' },
    { itemKey: 'fuel_filter', name: '汽油滤清器', category: 'engine', necessity: 'must', intervalKm: 60000, intervalMonth: 72, note: '外置式可单独更换；内置油泵总成的车型无异常可按上限执行。' },
    { itemKey: 'spark_plug', name: '火花塞', category: 'engine', necessity: 'must', intervalKm: 20000, intervalMonth: 24, note: '三代 EA888 原厂双铂金火花塞官方周期 2 万公里；升级铱铂金且满足良好工况可延至 3-4 万。' },
    { itemKey: 'brake_fluid', name: '刹车油', category: 'safety', necessity: 'conditional', intervalKm: null, intervalMonth: 24, note: '首次 3 年、后续每 2 年更换，按含水量检测为准。' },
    { itemKey: 'brake_pad', name: '刹车片', category: 'safety', necessity: 'conditional', intervalKm: 40000, intervalMonth: null, conditionFactor: { urban: 0.6 }, note: '按厚度判断，剩余小于 3mm 需更换。' },
    { itemKey: 'coolant', name: '防冻液', category: 'engine', necessity: 'must', intervalKm: 100000, intervalMonth: 60, note: '长效型可按 10 万公里或 5 年，不同颜色规格不可混加。' },
    { itemKey: 'transmission_oil', name: '变速箱油（DSG 湿式）', category: 'transmission', necessity: 'conditional', intervalKm: 40000, intervalMonth: 48, note: '2.0T 多配 7 速湿式双离合，按 4 万公里换油+滤芯；干式双离合按 6 万公里。厂商标注的免维护多为营销口径，建议按时更换。' },
    { itemKey: 'battery', name: '蓄电池', category: 'electrical', necessity: 'conditional', intervalKm: null, intervalMonth: 48, note: '按启动性能和电压检测判断，一般 3-5 年。' },
    { itemKey: 'tire', name: '轮胎', category: 'safety', necessity: 'conditional', intervalKm: 60000, intervalMonth: null, note: '按磨损与老化判断，胎纹低于 1.6mm 或龟裂、鼓包需及时更换。' },
    ...upsellFuel(),
  ],
};

// ---------------- 丰田（TNGA / 自然吸气 / 混动通用） ----------------
const RULESET_TOYOTA = {
  _id: 'ruleset_toyota',
  name: '丰田燃油车型保养规则（TNGA 自吸 / 涡轮）',
  version: 2,
  updatedAt: '2026-08-03',
  source: '广汽丰田 / 一汽丰田随车保养手册（卡罗拉/雷凌/凯美瑞/RAV4/汉兰达/威驰/致炫/亚洲龙等燃油版）',
  manual: {
    title: '丰田随车保养手册（燃油车型）',
    scope: '适用：丰田 卡罗拉 / 雷凌 / 凯美瑞 / RAV4荣放 / 威兰达 / 锋兰达 / 汉兰达 / 亚洲龙 / 威驰 / 致炫 / 逸致 等燃油版车型',
    note: '本页周期依据丰田官方标准，基础保养 1 万公里或 12 个月；涡轮增压机型（如 1.2T、2.0T）火花塞建议 6 万公里，自吸铱金塞可达 10 万公里。**双擎（THS 混动）车型请使用「丰田双擎」专属手册**——它有燃油版没有的电池散热滤网与逆变器冷却液，冷却液周期也完全不同。雷克萨斯同样已单独建库。',
  },
  items: [
    { itemKey: 'engine_oil', name: '机油', category: 'engine', necessity: 'must', intervalKm: 10000, intervalMonth: 12, conditionFactor: { urban: 0.7, shortTrip: 0.6, dusty: 0.8 }, note: 'TNGA 官方标准 1 万公里或 12 个月，用原厂指定 0W-20 全合成。长期短途、拥堵可缩短至 5000 公里。' },
    { itemKey: 'oil_filter', name: '机油滤清器', category: 'engine', necessity: 'must', intervalKm: 10000, intervalMonth: 12, note: '随机油同步更换。' },
    { itemKey: 'air_filter', name: '空气滤清器', category: 'engine', necessity: 'must', intervalKm: 40000, intervalMonth: 24, conditionFactor: { dusty: 0.5 }, note: '正常路况 4 万公里；多尘城市 2 万公里检查，脏了再换。' },
    { itemKey: 'cabin_filter', name: '空调滤芯', category: 'comfort', necessity: 'optional', intervalKm: 20000, intervalMonth: 12, note: '每 1 万公里检查、换季更换，可自行更换。' },
    { itemKey: 'fuel_filter', name: '汽油滤清器', category: 'engine', necessity: 'must', intervalKm: 80000, intervalMonth: 96, note: '直喷车型建议不超过 6 万公里。' },
    { itemKey: 'spark_plug', name: '火花塞', category: 'engine', necessity: 'must', intervalKm: 60000, intervalMonth: 72, note: '自吸/双擎铱金火花塞可达 10 万公里；涡轮增压（如 1.2T）建议 6 万公里。' },
    { itemKey: 'brake_fluid', name: '刹车油', category: 'safety', necessity: 'conditional', intervalKm: 40000, intervalMonth: 24, note: '每 2 年或 4 万公里检测含水量，超过 3% 才换，不要仅凭年限盲目更换。' },
    { itemKey: 'brake_pad', name: '刹车片', category: 'safety', necessity: 'conditional', intervalKm: 40000, intervalMonth: null, conditionFactor: { urban: 0.6 }, note: '按厚度判断，剩余小于 3mm 需更换。' },
    { itemKey: 'coolant', name: '防冻液', category: 'engine', necessity: 'must', intervalKm: 100000, intervalMonth: 60, note: '原厂长效防冻液首次约 16 万公里，之后每 8 万公里；日常观察液位、缺了补同型号，严禁混加。' },
    { itemKey: 'transmission_oil', name: '变速箱油', category: 'transmission', necessity: 'conditional', intervalKm: 80000, intervalMonth: 96, note: 'CVT 约 8 万公里；8AT 约 6 万公里；双擎 E-CVT 无固定强制周期，10 万公里以上按需检查。不要采纳循环机换油方案。' },
    { itemKey: 'battery', name: '蓄电池', category: 'electrical', necessity: 'conditional', intervalKm: null, intervalMonth: 48, note: '按启动性能和电压检测判断，一般 3-5 年。' },
    { itemKey: 'tire', name: '轮胎', category: 'safety', necessity: 'conditional', intervalKm: 60000, intervalMonth: null, note: '按磨损与老化判断，胎纹低于 1.6mm 或出现龟裂需更换。' },
    ...upsellFuel(),
  ],
};

// ---------------- 本田（Earth Dreams 地球梦） ----------------
const RULESET_HONDA = {
  _id: 'ruleset_honda',
  name: '本田保养规则（地球梦）',
  version: 1,
  updatedAt: '2026-08-02',
  source: '本田随车保养手册整理（思域/雅阁/CR-V/XR-V/飞度/奥德赛/冠道等）',
  manual: {
    title: '本田随车保养手册（地球梦系列）',
    scope: '适用：本田 思域 / 雅阁 / CR-V / XR-V / 飞度 / 奥德赛 / 冠道 等',
    note: '本页各项周期整理自本田官方手册。机油机滤基础周期为 5000 公里或 6 个月（手册标准）；CVT 变速箱油约 4 万公里。',
  },
  items: [
    { itemKey: 'engine_oil', name: '机油', category: 'engine', necessity: 'must', intervalKm: 5000, intervalMonth: 6, conditionFactor: { urban: 0.7, shortTrip: 0.6, dusty: 0.8 }, note: '本田手册标准 5000 公里或 6 个月；用原厂指定 0W-20 全合成。使用全合成且路况好可适当延长，但勿超过 1 万。' },
    { itemKey: 'oil_filter', name: '机油滤清器', category: 'engine', necessity: 'must', intervalKm: 10000, intervalMonth: 6, note: '手册中机滤约为机油周期的 2 倍（1 万公里），但每次换油同步更换更稳妥。' },
    { itemKey: 'air_filter', name: '空气滤清器', category: 'engine', necessity: 'must', intervalKm: 20000, intervalMonth: 24, conditionFactor: { dusty: 0.5 }, note: '每 2 万公里更换，非多尘地区可用到 2 万。' },
    { itemKey: 'cabin_filter', name: '空调滤芯', category: 'comfort', necessity: 'optional', intervalKm: 10000, intervalMonth: 12, note: '每 1 万公里或 12 个月更换，可自行更换。' },
    { itemKey: 'fuel_filter', name: '汽油滤清器', category: 'engine', necessity: 'must', intervalKm: 80000, intervalMonth: 96, note: '正规加油、供油正常可延长，异常再换。' },
    { itemKey: 'spark_plug', name: '火花塞', category: 'engine', necessity: 'must', intervalKm: 100000, intervalMonth: 120, note: '原厂火花塞约 10 万公里；材质（镍合金/铂金/铱金）决定实际寿命。' },
    { itemKey: 'brake_fluid', name: '刹车油', category: 'safety', necessity: 'conditional', intervalKm: null, intervalMonth: 36, note: '每 3 年更换，按含水量检测为准。' },
    { itemKey: 'brake_pad', name: '刹车片', category: 'safety', necessity: 'conditional', intervalKm: 40000, intervalMonth: null, conditionFactor: { urban: 0.6 }, note: '按厚度判断，剩余小于 3mm 需更换。' },
    { itemKey: 'coolant', name: '防冻液', category: 'engine', necessity: 'must', intervalKm: 100000, intervalMonth: 120, note: '手册首换约 20 万公里/10 年，之后每 10 万公里；日常观察液位即可。' },
    { itemKey: 'transmission_oil', name: '变速箱油（CVT）', category: 'transmission', necessity: 'conditional', intervalKm: 40000, intervalMonth: 24, note: 'CVT 车型约 4 万公里更换，用 Honda HCF-2 专用油；MT 车型约 6 万公里。' },
    { itemKey: 'battery', name: '蓄电池', category: 'electrical', necessity: 'conditional', intervalKm: null, intervalMonth: 48, note: '按启动性能和电压检测判断，一般 3-4 年。' },
    { itemKey: 'tire', name: '轮胎', category: 'safety', necessity: 'conditional', intervalKm: 60000, intervalMonth: null, note: '按磨损与老化判断，胎纹低于 1.6mm 或出现龟裂需更换。' },
    ...upsellFuel(),
  ],
};

// ---------------- 日产 ----------------
const RULESET_NISSAN = {
  _id: 'ruleset_nissan',
  name: '日产保养规则',
  version: 1,
  updatedAt: '2026-08-02',
  source: '日产随车保养手册整理（轩逸/天籁/逍客/奇骏/骊威等）',
  manual: {
    title: '日产随车保养手册',
    scope: '适用：日产 轩逸 / 天籁 / 逍客 / 奇骏 / 骊威 等',
    note: '本页各项周期整理自日产官方手册。机油机滤基础周期 5000 公里或 6 个月；CVT 变速箱油约 10 万公里。',
  },
  items: [
    { itemKey: 'engine_oil', name: '机油', category: 'engine', necessity: 'must', intervalKm: 5000, intervalMonth: 6, conditionFactor: { urban: 0.7, shortTrip: 0.6, dusty: 0.8 }, note: '日产手册标准 5000 公里或 6 个月；用 SN 级 0W-20 全合成。' },
    { itemKey: 'oil_filter', name: '机油滤清器', category: 'engine', necessity: 'must', intervalKm: 5000, intervalMonth: 6, note: '随机油同步更换。' },
    { itemKey: 'air_filter', name: '空气滤清器', category: 'engine', necessity: 'must', intervalKm: 20000, intervalMonth: 24, conditionFactor: { dusty: 0.5 }, note: '每 2 万公里更换，多尘环境缩短。' },
    { itemKey: 'cabin_filter', name: '空调滤芯', category: 'comfort', necessity: 'optional', intervalKm: 20000, intervalMonth: 12, note: '每 1 万公里检查、2 万公里更换，可自行更换。' },
    { itemKey: 'fuel_filter', name: '汽油滤清器', category: 'engine', necessity: 'must', intervalKm: 50000, intervalMonth: 60, note: '部分车型无独立汽油滤（集成油泵总成），异常才整体更换。' },
    { itemKey: 'spark_plug', name: '火花塞', category: 'engine', necessity: 'must', intervalKm: 100000, intervalMonth: 120, note: '原厂火花塞约 10 万公里。' },
    { itemKey: 'brake_fluid', name: '刹车油', category: 'safety', necessity: 'conditional', intervalKm: 40000, intervalMonth: 24, note: '每 4 万公里或 2 年检测含水量更换。' },
    { itemKey: 'brake_pad', name: '刹车片', category: 'safety', necessity: 'conditional', intervalKm: 40000, intervalMonth: null, conditionFactor: { urban: 0.6 }, note: '按厚度判断，剩余小于 3mm 需更换。' },
    { itemKey: 'coolant', name: '防冻液', category: 'engine', necessity: 'must', intervalKm: 60000, intervalMonth: 48, note: '约 6 万公里或 4 年更换，注意规格不可混加。' },
    { itemKey: 'transmission_oil', name: '变速箱油（CVT）', category: 'transmission', necessity: 'conditional', intervalKm: 100000, intervalMonth: 120, note: 'CVT 变速箱油约 10 万公里，建议每 2 万公里检查油质。' },
    { itemKey: 'battery', name: '蓄电池', category: 'electrical', necessity: 'conditional', intervalKm: null, intervalMonth: 48, note: '按启动性能和电压检测判断，一般 3-4 年。' },
    { itemKey: 'tire', name: '轮胎', category: 'safety', necessity: 'conditional', intervalKm: 60000, intervalMonth: null, note: '按磨损与老化判断，胎纹低于 1.6mm 或出现龟裂需更换。' },
    ...upsellFuel(),
  ],
};

// ---------------- 马自达（创驰蓝天 Skyactiv） ----------------
const RULESET_MAZDA = {
  _id: 'ruleset_mazda',
  name: '马自达保养规则（创驰蓝天）',
  version: 1,
  updatedAt: '2026-08-02',
  source: '马自达随车保养手册整理（昂克赛拉/阿特兹/CX-4/CX-5等）',
  manual: {
    title: '马自达随车保养手册（Skyactiv 创驰蓝天）',
    scope: '适用：马自达 昂克赛拉 / 阿特兹 / CX-4 / CX-5 等',
    note: '本页各项周期整理自马自达官方手册。基础保养约 1 万公里或 1 年；火花塞约 4 万公里检查更换。',
  },
  items: [
    { itemKey: 'engine_oil', name: '机油', category: 'engine', necessity: 'must', intervalKm: 10000, intervalMonth: 12, conditionFactor: { urban: 0.7, shortTrip: 0.6, dusty: 0.8 }, note: '创驰蓝天机型用全合成机油，约 1 万公里或 1 年。' },
    { itemKey: 'oil_filter', name: '机油滤清器', category: 'engine', necessity: 'must', intervalKm: 10000, intervalMonth: 12, note: '随机油同步更换。' },
    { itemKey: 'air_filter', name: '空气滤清器', category: 'engine', necessity: 'must', intervalKm: 20000, intervalMonth: 24, conditionFactor: { dusty: 0.5 }, note: '每 2 万公里更换。' },
    { itemKey: 'cabin_filter', name: '空调滤芯', category: 'comfort', necessity: 'optional', intervalKm: 20000, intervalMonth: 12, note: '每 1-2 万公里更换，可自行更换。' },
    { itemKey: 'fuel_filter', name: '汽油滤清器', category: 'engine', necessity: 'must', intervalKm: 60000, intervalMonth: 72, note: '外置式可单独更换。' },
    { itemKey: 'spark_plug', name: '火花塞', category: 'engine', necessity: 'must', intervalKm: 40000, intervalMonth: 48, note: '创驰蓝天火花塞约 4 万公里检查更换。' },
    { itemKey: 'brake_fluid', name: '刹车油', category: 'safety', necessity: 'conditional', intervalKm: null, intervalMonth: 24, note: '每 2 年检测含水量更换。' },
    { itemKey: 'brake_pad', name: '刹车片', category: 'safety', necessity: 'conditional', intervalKm: 40000, intervalMonth: null, conditionFactor: { urban: 0.6 }, note: '按厚度判断，剩余小于 3mm 需更换。' },
    { itemKey: 'coolant', name: '防冻液', category: 'engine', necessity: 'must', intervalKm: 100000, intervalMonth: 60, note: '长效防冻液约 10 万公里/5 年，注意规格不可混加。' },
    { itemKey: 'transmission_oil', name: '变速箱油', category: 'transmission', necessity: 'conditional', intervalKm: 60000, intervalMonth: 72, note: '6AT/创驰蓝天变速箱建议 6-8 万公里更换；厂商标注免维护多为营销口径。' },
    { itemKey: 'battery', name: '蓄电池', category: 'electrical', necessity: 'conditional', intervalKm: null, intervalMonth: 48, note: '按启动性能和电压检测判断，一般 3-5 年。' },
    { itemKey: 'tire', name: '轮胎', category: 'safety', necessity: 'conditional', intervalKm: 60000, intervalMonth: null, note: '按磨损与老化判断，胎纹低于 1.6mm 或出现龟裂需更换。' },
    ...upsellFuel(),
  ],
};

// ---------------- 比亚迪 DM-i 超级混动 ----------------
const RULESET_BYD_DMI = {
  _id: 'ruleset_byd_dmi',
  name: '比亚迪 DM-i 超级混动保养规则',
  version: 1,
  updatedAt: '2026-08-02',
  source: '比亚迪 DM-i 官方保养手册整理（秦PLUS/宋PLUS/唐/护卫舰07/腾势D9等）',
  manual: {
    title: '比亚迪 DM-i 超级混动保养手册',
    scope: '适用：比亚迪 DM-i 车型 秦PLUS / 宋PLUS / 唐 / 护卫舰07 / 腾势D9 等（HEV 混动发动机）',
    note: '本页各项周期整理自比亚迪官方标准。发动机机油按 HEV 里程 5000 公里或 12 个月（先用完为准），整车检查按总里程 7500 公里或 12 个月；大保养 4 万公里。',
  },
  items: [
    { itemKey: 'engine_oil', name: '发动机机油', category: 'engine', necessity: 'must', intervalKm: 7500, intervalMonth: 12, conditionFactor: { urban: 0.7, shortTrip: 0.6, dusty: 0.8 }, note: '按总里程约 7500 公里或 12 个月；发动机专项实际按 HEV 里程 5000 公里或 12 个月（先用完为准）。须用 0W-20 C5 低灰分机油。' },
    { itemKey: 'oil_filter', name: '机油滤清器', category: 'engine', necessity: 'must', intervalKm: 7500, intervalMonth: 12, note: '随机油同步更换。' },
    { itemKey: 'air_filter', name: '空气滤清器', category: 'engine', necessity: 'must', intervalKm: 20000, intervalMonth: 12, conditionFactor: { dusty: 0.5 }, note: '约 2 万公里或 1 年更换。' },
    { itemKey: 'cabin_filter', name: '空调滤芯', category: 'comfort', necessity: 'optional', intervalKm: 20000, intervalMonth: 12, note: '约 2 万公里更换，可自行更换。' },
    { itemKey: 'fuel_filter', name: '汽油滤清器', category: 'engine', necessity: 'must', intervalKm: 40000, intervalMonth: 48, note: '内置油箱总成，异常再换；大保养时检查。' },
    { itemKey: 'spark_plug', name: '火花塞', category: 'engine', necessity: 'must', intervalKm: 40000, intervalMonth: 48, note: '大保养（约 4 万公里）更换。' },
    { itemKey: 'brake_fluid', name: '刹车油', category: 'safety', necessity: 'conditional', intervalKm: 40000, intervalMonth: 24, note: '约 4 万公里或 2 年更换，高温地区提前。' },
    { itemKey: 'brake_pad', name: '刹车片', category: 'safety', necessity: 'conditional', intervalKm: 40000, intervalMonth: null, conditionFactor: { urban: 0.6 }, note: '按厚度判断，剩余小于 3mm 需更换。' },
    { itemKey: 'coolant', name: '防冻液（含电机/电池冷却）', category: 'engine', necessity: 'must', intervalKm: 40000, intervalMonth: 48, note: '约 4 万公里更换，不同回路（发动机/三电）规格不同，不可混加。' },
    { itemKey: 'transmission_oil', name: '变速箱油（EHS 电混）', category: 'transmission', necessity: 'conditional', intervalKm: 40000, intervalMonth: 48, note: 'EHS 电混系统变速箱油约 4 万公里（大保养）更换。' },
    { itemKey: 'battery', name: '三电系统检测', category: 'electrical', necessity: 'conditional', intervalKm: 20000, intervalMonth: 12, note: '整车保养（约 1.2 万公里/年）时检测电池/电机/电控；建议每 6 个月满充满放一次校准电池。' },
    { itemKey: 'tire', name: '轮胎', category: 'safety', necessity: 'conditional', intervalKm: 60000, intervalMonth: null, note: '按磨损与老化判断，约 2 万公里检查磨损。' },
    ...upsellFuel(),
  ],
};

// ---------------- 比亚迪纯电 ----------------
const RULESET_BYD_EV = {
  _id: 'ruleset_byd_ev',
  name: '比亚迪纯电保养规则',
  version: 1,
  updatedAt: '2026-08-02',
  source: '比亚迪 EV 官方保养手册整理（汉EV/元PLUS/海豚/海豹/e2等）',
  manual: {
    title: '比亚迪纯电车型保养手册',
    scope: '适用：比亚迪 汉EV / 元PLUS / 海豚 / 海豹 / e2 等纯电车型',
    note: '本页各项周期整理自比亚迪官方标准。纯电无发动机保养，常规保养约 1 万公里/年，核心是三电检测与易损件。',
  },
  items: [
    { itemKey: 'cabin_filter', name: '空调滤芯', category: 'comfort', necessity: 'optional', intervalKm: 20000, intervalMonth: 12, conditionFactor: { dusty: 0.5 }, note: '约 2 万公里更换，可自行更换。' },
    { itemKey: 'brake_fluid', name: '刹车油', category: 'safety', necessity: 'conditional', intervalKm: 40000, intervalMonth: 24, note: '约 4 万公里或 2 年；频繁动能回收可缩短 20%。按含水量检测为准。' },
    { itemKey: 'brake_pad', name: '刹车片', category: 'safety', necessity: 'conditional', intervalKm: 80000, intervalMonth: null, note: '动能回收大幅降低刹车片磨损，按厚度判断，普遍比燃油车耐用。' },
    { itemKey: 'coolant', name: '防冻液（三电冷却）', category: 'electrical', necessity: 'must', intervalKm: 40000, intervalMonth: 48, note: '三电冷却防冻液约 4 万公里更换，不可混加。' },
    { itemKey: 'gear_oil', name: '减速器齿轮油', category: 'transmission', necessity: 'conditional', intervalKm: 60000, intervalMonth: 48, note: '减速器齿轮油约 6 万公里更换。' },
    { itemKey: 'battery', name: '三电系统检测', category: 'electrical', necessity: 'conditional', intervalKm: 20000, intervalMonth: 12, note: '常规保养（约 1 万公里/年）检测电池/电机/电控；容量低于 70% 可走质保。建议每 6 个月满充满放校准。' },
    { itemKey: 'tire', name: '轮胎', category: 'safety', necessity: 'conditional', intervalKm: 60000, intervalMonth: null, note: '纯电车扭矩大、车重，轮胎磨损可能更快，按磨损与老化判断。' },
    ...upsellEv(),
  ],
};

// ---------------- 别克 / 通用（雪佛兰 / 凯迪拉克） ----------------
const RULESET_BUICK_GM = {
  _id: 'ruleset_buick_gm',
  name: '别克保养规则（英朗/威朗/君威/君越/昂科威/GL8）',
  version: 2,
  updatedAt: '2026-08-03',
  source: '上汽通用别克随车保养手册（英朗/威朗/君威/君越/昂科威/昂科威Plus/GL8）',
  manual: {
    title: '上汽通用别克随车保养手册',
    scope: '适用：别克 英朗 / 威朗 / 君威 / 君越 / 昂科威 / 昂科威Plus / GL8 / 昂科拉 等在售燃油车型',
    note: '别克官方基础保养为 5000 公里或 6 个月（使用全合成机油且用车强度低可延长至 1 万公里），并以车机机油寿命监测提示为准。注意：同集团的凯迪拉克是 7500 公里、雪佛兰是 7500 公里，三个品牌周期各不相同，本产品已分别建库，不要用别克口径去催其他两个品牌的保养。',
  },
  items: [
    { itemKey: 'engine_oil', name: '机油', category: 'engine', necessity: 'must', intervalKm: 5000, intervalMonth: 6, conditionFactor: { urban: 0.7, shortTrip: 0.6, dusty: 0.8 }, note: '官方标准 5000 公里或 6 个月；用全合成机油且跑得少可延长至 1 万。' },
    { itemKey: 'oil_filter', name: '机油滤清器', category: 'engine', necessity: 'must', intervalKm: 5000, intervalMonth: 6, note: '随机油同步更换。' },
    { itemKey: 'air_filter', name: '空气滤清器', category: 'engine', necessity: 'must', intervalKm: 20000, intervalMonth: 12, conditionFactor: { dusty: 0.5 }, note: '每 2 万公里更换。' },
    { itemKey: 'cabin_filter', name: '空调滤芯', category: 'comfort', necessity: 'optional', intervalKm: 10000, intervalMonth: 12, note: '约 1 万公里或 1 年更换，可自行更换。' },
    { itemKey: 'fuel_filter', name: '汽油滤清器', category: 'engine', necessity: 'must', intervalKm: 30000, intervalMonth: 12, note: '约 3 万公里更换。' },
    { itemKey: 'spark_plug', name: '火花塞', category: 'engine', necessity: 'must', intervalKm: 40000, intervalMonth: 48, note: '约 4 万公里更换（部分车型可达 6 万）。' },
    { itemKey: 'brake_fluid', name: '刹车油', category: 'safety', necessity: 'conditional', intervalKm: 30000, intervalMonth: 24, note: '约 3 万公里或 2 年检测含水量更换。' },
    { itemKey: 'brake_pad', name: '刹车片', category: 'safety', necessity: 'conditional', intervalKm: 40000, intervalMonth: null, conditionFactor: { urban: 0.6 }, note: '按厚度判断，剩余小于 3mm 需更换。' },
    { itemKey: 'coolant', name: '防冻液', category: 'engine', necessity: 'must', intervalKm: 100000, intervalMonth: 60, note: '长效防冻液约 10 万公里/5 年，注意规格不可混加。' },
    { itemKey: 'transmission_oil', name: '变速箱油（AT）', category: 'transmission', necessity: 'conditional', intervalKm: 80000, intervalMonth: 96, note: '自动变速箱油约 8 万公里更换。' },
    { itemKey: 'battery', name: '蓄电池', category: 'electrical', necessity: 'conditional', intervalKm: null, intervalMonth: 48, note: '按启动性能和电压检测判断，一般 3-5 年。' },
    { itemKey: 'tire', name: '轮胎', category: 'safety', necessity: 'conditional', intervalKm: 60000, intervalMonth: null, note: '按磨损与老化判断，胎纹低于 1.6mm 或出现龟裂需更换。' },
    ...upsellFuel(),
  ],
};

// ---------------- 福特 ----------------
const RULESET_FORD = {
  _id: 'ruleset_ford',
  name: '福特保养规则（EcoBoost）',
  version: 1,
  updatedAt: '2026-08-02',
  source: '福特随车保养手册整理（福克斯/蒙迪欧/锐际/EVOS等）',
  manual: {
    title: '福特随车保养手册',
    scope: '适用：福特 福克斯 / 蒙迪欧 / 锐际 / EVOS 等',
    note: '本页各项周期整理自福特官方手册。基础保养约 1 万公里或 1 年；火花塞约 4 万公里。',
  },
  items: [
    { itemKey: 'engine_oil', name: '机油', category: 'engine', necessity: 'must', intervalKm: 10000, intervalMonth: 12, conditionFactor: { urban: 0.7, shortTrip: 0.6, dusty: 0.8 }, note: 'EcoBoost 机型用全合成机油，约 1 万公里或 1 年。' },
    { itemKey: 'oil_filter', name: '机油滤清器', category: 'engine', necessity: 'must', intervalKm: 10000, intervalMonth: 12, note: '随机油同步更换。' },
    { itemKey: 'air_filter', name: '空气滤清器', category: 'engine', necessity: 'must', intervalKm: 20000, intervalMonth: 24, conditionFactor: { dusty: 0.5 }, note: '每 2 万公里更换。' },
    { itemKey: 'cabin_filter', name: '空调滤芯', category: 'comfort', necessity: 'optional', intervalKm: 20000, intervalMonth: 12, note: '约 2 万公里更换，可自行更换。' },
    { itemKey: 'fuel_filter', name: '汽油滤清器', category: 'engine', necessity: 'must', intervalKm: 60000, intervalMonth: 72, note: '约 6 万公里更换。' },
    { itemKey: 'spark_plug', name: '火花塞', category: 'engine', necessity: 'must', intervalKm: 40000, intervalMonth: 48, note: 'EcoBoost 涡轮机型火花塞约 4 万公里更换。' },
    { itemKey: 'brake_fluid', name: '刹车油', category: 'safety', necessity: 'conditional', intervalKm: null, intervalMonth: 24, note: '每 2 年检测含水量更换。' },
    { itemKey: 'brake_pad', name: '刹车片', category: 'safety', necessity: 'conditional', intervalKm: 40000, intervalMonth: null, conditionFactor: { urban: 0.6 }, note: '按厚度判断，剩余小于 3mm 需更换。' },
    { itemKey: 'coolant', name: '防冻液', category: 'engine', necessity: 'must', intervalKm: 100000, intervalMonth: 60, note: '长效防冻液约 10 万公里/5 年，注意规格不可混加。' },
    { itemKey: 'transmission_oil', name: '变速箱油', category: 'transmission', necessity: 'conditional', intervalKm: 60000, intervalMonth: 72, note: 'AT/双离合约 6 万公里更换。' },
    { itemKey: 'battery', name: '蓄电池', category: 'electrical', necessity: 'conditional', intervalKm: null, intervalMonth: 48, note: '按启动性能和电压检测判断，一般 3-5 年。' },
    { itemKey: 'tire', name: '轮胎', category: 'safety', necessity: 'conditional', intervalKm: 60000, intervalMonth: null, note: '按磨损与老化判断，胎纹低于 1.6mm 或出现龟裂需更换。' },
    ...upsellFuel(),
  ],
};

// ---------------- 宝马 ----------------
const RULESET_BMW = {
  _id: 'ruleset_bmw',
  name: '宝马保养规则（B48/B58）',
  version: 1,
  updatedAt: '2026-08-02',
  source: '宝马随车保养手册整理（1系/3系/5系/X1/X3/X5等）',
  manual: {
    title: '宝马随车保养手册（Longlife 标准）',
    scope: '适用：宝马 1系 / 3系 / 5系 / X1 / X3 / X5 等',
    note: '本页各项周期整理自宝马官方 Longlife 标准。机油约 1 万公里或 1 年；火花塞约 4 万公里；变速箱厂商标注终身免维护但建议 8 万公里检查更换。',
  },
  items: [
    { itemKey: 'engine_oil', name: '机油', category: 'engine', necessity: 'must', intervalKm: 10000, intervalMonth: 12, conditionFactor: { urban: 0.7, shortTrip: 0.6, dusty: 0.8 }, note: 'Longlife 标准约 1 万公里或 1 年，用 BMWLonMLife 认证机油。' },
    { itemKey: 'oil_filter', name: '机油滤清器', category: 'engine', necessity: 'must', intervalKm: 10000, intervalMonth: 12, note: '随机油同步更换。' },
    { itemKey: 'air_filter', name: '空气滤清器', category: 'engine', necessity: 'must', intervalKm: 20000, intervalMonth: 24, conditionFactor: { dusty: 0.5 }, note: '每 2 万公里更换。' },
    { itemKey: 'cabin_filter', name: '空调滤芯', category: 'comfort', necessity: 'optional', intervalKm: 20000, intervalMonth: 12, note: '约 2 万公里/年更换，可自行更换。' },
    { itemKey: 'fuel_filter', name: '汽油滤清器', category: 'engine', necessity: 'must', intervalKm: 60000, intervalMonth: 72, note: '约 6 万公里更换（部分集成于油泵）。' },
    { itemKey: 'spark_plug', name: '火花塞', category: 'engine', necessity: 'must', intervalKm: 40000, intervalMonth: 48, note: '宝马官方约 4 万公里或 4 年（每两次机油保养）更换。' },
    { itemKey: 'brake_fluid', name: '刹车油', category: 'safety', necessity: 'conditional', intervalKm: null, intervalMonth: 24, note: '每 2 年更换，按含水量检测为准。' },
    { itemKey: 'brake_pad', name: '刹车片', category: 'safety', necessity: 'conditional', intervalKm: 40000, intervalMonth: null, conditionFactor: { urban: 0.6 }, note: '按厚度判断，剩余小于 3mm 需更换（宝马带磨损传感器提示）。' },
    { itemKey: 'coolant', name: '防冻液', category: 'engine', necessity: 'must', intervalKm: 100000, intervalMonth: 60, note: '长效防冻液约 10 万公里/5 年，注意规格不可混加。' },
    { itemKey: 'transmission_oil', name: '变速箱油', category: 'transmission', necessity: 'conditional', intervalKm: 80000, intervalMonth: 96, note: '厂商标注终身免维护，但实际建议 8 万公里左右检查更换。' },
    { itemKey: 'battery', name: '蓄电池', category: 'electrical', necessity: 'conditional', intervalKm: null, intervalMonth: 48, note: '按启动性能和电压检测判断，一般 3-5 年。' },
    { itemKey: 'tire', name: '轮胎', category: 'safety', necessity: 'conditional', intervalKm: 60000, intervalMonth: null, note: '按磨损与老化判断，胎纹低于 1.6mm 或出现龟裂、鼓包需及时更换。' },
    ...upsellFuel(),
  ],
};

// ---------------- 奔驰 ----------------
const RULESET_BENZ = {
  _id: 'ruleset_benz',
  name: '奔驰保养规则（M264/M254）',
  version: 1,
  updatedAt: '2026-08-02',
  source: '奔驰随车保养手册整理（A级/C级/E级/GLA/GLC等）',
  manual: {
    title: '奔驰随车保养手册',
    scope: '适用：奔驰 A级 / C级 / E级 / GLA / GLC 等',
    note: '本页各项周期整理自奔驰官方手册。基础保养约 1 万公里或 1 年；火花塞约 4 万公里；变速箱厂商标注终身免维护但建议 6 万公里检查更换。',
  },
  items: [
    { itemKey: 'engine_oil', name: '机油', category: 'engine', necessity: 'must', intervalKm: 10000, intervalMonth: 12, conditionFactor: { urban: 0.7, shortTrip: 0.6, dusty: 0.8 }, note: '奔驰标准约 1 万公里或 1 年，用 MB 认证全合成机油。' },
    { itemKey: 'oil_filter', name: '机油滤清器', category: 'engine', necessity: 'must', intervalKm: 10000, intervalMonth: 12, note: '随机油同步更换。' },
    { itemKey: 'air_filter', name: '空气滤清器', category: 'engine', necessity: 'must', intervalKm: 20000, intervalMonth: 24, conditionFactor: { dusty: 0.5 }, note: '每 2 万公里更换。' },
    { itemKey: 'cabin_filter', name: '空调滤芯', category: 'comfort', necessity: 'optional', intervalKm: 20000, intervalMonth: 12, note: '约 2 万公里/年更换，可自行更换。' },
    { itemKey: 'fuel_filter', name: '汽油滤清器', category: 'engine', necessity: 'must', intervalKm: 60000, intervalMonth: 72, note: '部分集成于油泵总成，异常再换。' },
    { itemKey: 'spark_plug', name: '火花塞', category: 'engine', necessity: 'must', intervalKm: 40000, intervalMonth: 48, note: '奔驰官方约 4 万公里或 4 年更换。' },
    { itemKey: 'brake_fluid', name: '刹车油', category: 'safety', necessity: 'conditional', intervalKm: null, intervalMonth: 24, note: '每 2 年检测含水量更换。' },
    { itemKey: 'brake_pad', name: '刹车片', category: 'safety', necessity: 'conditional', intervalKm: 40000, intervalMonth: null, conditionFactor: { urban: 0.6 }, note: '按厚度判断，剩余小于 3mm 需更换。' },
    { itemKey: 'coolant', name: '防冻液', category: 'engine', necessity: 'must', intervalKm: 100000, intervalMonth: 60, note: '长效防冻液约 10 万公里/5 年，注意规格不可混加。' },
    { itemKey: 'transmission_oil', name: '变速箱油', category: 'transmission', necessity: 'conditional', intervalKm: 60000, intervalMonth: 72, note: '7G/9G 变速箱厂商标注终身免维护，但实际建议 6 万公里左右检查更换。' },
    { itemKey: 'battery', name: '蓄电池', category: 'electrical', necessity: 'conditional', intervalKm: null, intervalMonth: 48, note: '按启动性能和电压检测判断，一般 3-5 年。' },
    { itemKey: 'tire', name: '轮胎', category: 'safety', necessity: 'conditional', intervalKm: 60000, intervalMonth: null, note: '按磨损与老化判断，胎纹低于 1.6mm 或出现龟裂需更换。' },
    ...upsellFuel(),
  ],
};

// ---------------- 现代 / 起亚 ----------------
const RULESET_HYUNDAI_KIA = {
  _id: 'ruleset_hyundai_kia',
  name: '现代/起亚保养规则',
  version: 1,
  updatedAt: '2026-08-02',
  source: '现代/起亚随车保养手册整理（伊兰特/索纳塔/途胜/ix35/K3/K5/智跑等）',
  manual: {
    title: '现代·起亚随车保养手册',
    scope: '适用：现代 伊兰特 / 索纳塔 / 途胜 / ix35，起亚 K3 / K5 / 智跑 等',
    note: '本页各项周期整理自现代/起亚官方手册。基础保养约 5000 公里或 6 个月；火花塞（铱金）约 6 万公里。',
  },
  items: [
    { itemKey: 'engine_oil', name: '机油', category: 'engine', necessity: 'must', intervalKm: 5000, intervalMonth: 6, conditionFactor: { urban: 0.7, shortTrip: 0.6, dusty: 0.8 }, note: '官方标准 5000 公里或 6 个月；使用全合成且路况好可延长。' },
    { itemKey: 'oil_filter', name: '机油滤清器', category: 'engine', necessity: 'must', intervalKm: 5000, intervalMonth: 6, note: '随机油同步更换。' },
    { itemKey: 'air_filter', name: '空气滤清器', category: 'engine', necessity: 'must', intervalKm: 20000, intervalMonth: 24, conditionFactor: { dusty: 0.5 }, note: '每 2 万公里更换。' },
    { itemKey: 'cabin_filter', name: '空调滤芯', category: 'comfort', necessity: 'optional', intervalKm: 15000, intervalMonth: 12, note: '约 1.5 万公里或 1 年更换，可自行更换。' },
    { itemKey: 'fuel_filter', name: '汽油滤清器', category: 'engine', necessity: 'must', intervalKm: 60000, intervalMonth: 72, note: '约 6 万公里更换。' },
    { itemKey: 'spark_plug', name: '火花塞', category: 'engine', necessity: 'must', intervalKm: 60000, intervalMonth: 72, note: '铱金火花塞约 6 万公里更换。' },
    { itemKey: 'brake_fluid', name: '刹车油', category: 'safety', necessity: 'conditional', intervalKm: 40000, intervalMonth: 24, note: '约 4 万公里或 2 年检测含水量更换。' },
    { itemKey: 'brake_pad', name: '刹车片', category: 'safety', necessity: 'conditional', intervalKm: 40000, intervalMonth: null, conditionFactor: { urban: 0.6 }, note: '按厚度判断，剩余小于 3mm 需更换。' },
    { itemKey: 'coolant', name: '防冻液', category: 'engine', necessity: 'must', intervalKm: 100000, intervalMonth: 60, note: '长效防冻液约 10 万公里/5 年，注意规格不可混加。' },
    { itemKey: 'transmission_oil', name: '变速箱油', category: 'transmission', necessity: 'conditional', intervalKm: 60000, intervalMonth: 72, note: 'CVT/AT 约 6 万公里更换。' },
    { itemKey: 'battery', name: '蓄电池', category: 'electrical', necessity: 'conditional', intervalKm: null, intervalMonth: 48, note: '按启动性能和电压检测判断，一般 3-5 年。' },
    { itemKey: 'tire', name: '轮胎', category: 'safety', necessity: 'conditional', intervalKm: 60000, intervalMonth: null, note: '按磨损与老化判断，胎纹低于 1.6mm 或出现龟裂需更换。' },
    ...upsellFuel(),
  ],
};

// ---------------- 吉利 / 领克 / 沃尔沃（CMA 架构同源） ----------------
const RULESET_GEELY_LYNK = {
  _id: 'ruleset_geely_lynk',
  name: '吉利/领克/沃尔沃保养规则',
  version: 1,
  updatedAt: '2026-08-02',
  source: '吉利/领克/沃尔沃随车保养手册整理（星越L/星瑞/帝豪/缤越/博越/领克03/06/沃尔沃S60/XC60等）',
  manual: {
    title: '吉利·领克·沃尔沃随车保养手册（CMA 架构同源）',
    scope: '适用：吉利 星越L / 星瑞 / 帝豪 / 缤越 / 博越，领克 03 / 06，沃尔沃 S60 / XC60 等',
    note: '本页各项周期整理自吉利/领克/沃尔沃官方手册（CMA 架构同源，保养周期接近）。基础保养约 1 万公里或 1 年；火花塞约 4 万公里。',
  },
  items: [
    { itemKey: 'engine_oil', name: '机油', category: 'engine', necessity: 'must', intervalKm: 10000, intervalMonth: 12, conditionFactor: { urban: 0.7, shortTrip: 0.6, dusty: 0.8 }, note: '约 1 万公里或 1 年，用厂家认证全合成机油。' },
    { itemKey: 'oil_filter', name: '机油滤清器', category: 'engine', necessity: 'must', intervalKm: 10000, intervalMonth: 12, note: '随机油同步更换。' },
    { itemKey: 'air_filter', name: '空气滤清器', category: 'engine', necessity: 'must', intervalKm: 20000, intervalMonth: 24, conditionFactor: { dusty: 0.5 }, note: '每 2 万公里更换。' },
    { itemKey: 'cabin_filter', name: '空调滤芯', category: 'comfort', necessity: 'optional', intervalKm: 20000, intervalMonth: 12, note: '约 2 万公里/年更换，可自行更换。' },
    { itemKey: 'fuel_filter', name: '汽油滤清器', category: 'engine', necessity: 'must', intervalKm: 60000, intervalMonth: 72, note: '约 6 万公里更换。' },
    { itemKey: 'spark_plug', name: '火花塞', category: 'engine', necessity: 'must', intervalKm: 40000, intervalMonth: 48, note: '约 4 万公里或 4 年更换。' },
    { itemKey: 'brake_fluid', name: '刹车油', category: 'safety', necessity: 'conditional', intervalKm: null, intervalMonth: 24, note: '每 2 年检测含水量更换。' },
    { itemKey: 'brake_pad', name: '刹车片', category: 'safety', necessity: 'conditional', intervalKm: 40000, intervalMonth: null, conditionFactor: { urban: 0.6 }, note: '按厚度判断，剩余小于 3mm 需更换。' },
    { itemKey: 'coolant', name: '防冻液', category: 'engine', necessity: 'must', intervalKm: 100000, intervalMonth: 60, note: '长效防冻液约 10 万公里/5 年，注意规格不可混加。' },
    { itemKey: 'transmission_oil', name: '变速箱油', category: 'transmission', necessity: 'conditional', intervalKm: 60000, intervalMonth: 72, note: '7DCT 约 6 万公里更换。' },
    { itemKey: 'battery', name: '蓄电池', category: 'electrical', necessity: 'conditional', intervalKm: null, intervalMonth: 48, note: '按启动性能和电压检测判断，一般 3-5 年。' },
    { itemKey: 'tire', name: '轮胎', category: 'safety', necessity: 'conditional', intervalKm: 60000, intervalMonth: null, note: '按磨损与老化判断，胎纹低于 1.6mm 或出现龟裂需更换。' },
    ...upsellFuel(),
  ],
};

// ---------------- 自主品牌燃油通用（兜底） ----------------
// 2026-08-03：原覆盖的 27 款车型已按品牌拆分到 data/rule_sets_cn.js
// （长城 gwm / 长安 changan / 奇瑞 chery / 传祺 gac / 上汽 saic / 红旗 hongqi），
// 本规则集当前无车型占用，仅在出现尚未建库的自主燃油品牌时兜底。
const RULESET_DOMESTIC = {
  _id: 'ruleset_domestic',
  name: '自主品牌燃油车保养参考',
  version: 2,
  updatedAt: '2026-08-03',
  source: '主流自主品牌随车保养手册整理（兜底用，已建库品牌请见各品牌专属规则集）',
  manual: {
    title: '自主品牌燃油车保养参考（通用）',
    scope: '适用：尚未单独建库的自主燃油品牌。长城 / 长安 / 奇瑞 / 广汽传祺 / 荣威 / 五菱 / 红旗 均已有专属手册规则集，不再走此兜底',
    note: '这是主流自主品牌通用参考（非单一厂商手册），多数自主车型用全合成机油约 1 万公里或 1 年；正式周期请以你的随车保养手册为准。',
  },
  items: [
    { itemKey: 'engine_oil', name: '机油', category: 'engine', necessity: 'must', intervalKm: 10000, intervalMonth: 12, conditionFactor: { urban: 0.7, shortTrip: 0.6, dusty: 0.8 }, note: '通用参考：多数自主车型全合成机油约 1 万公里或 1 年。具体以你的随车保养手册为准，不同发动机周期差异较大。' },
    { itemKey: 'oil_filter', name: '机油滤清器', category: 'engine', necessity: 'must', intervalKm: 10000, intervalMonth: 12, note: '随机油同步更换。' },
    { itemKey: 'air_filter', name: '空气滤清器', category: 'engine', necessity: 'must', intervalKm: 20000, intervalMonth: 24, conditionFactor: { dusty: 0.5 }, note: '多尘地区缩短一半周期。' },
    { itemKey: 'cabin_filter', name: '空调滤芯', category: 'comfort', necessity: 'optional', intervalKm: 20000, intervalMonth: 12, note: '影响车内空气质量，可自行更换。' },
    { itemKey: 'fuel_filter', name: '汽油滤清器', category: 'engine', necessity: 'must', intervalKm: 40000, intervalMonth: 48, note: '通用参考周期，按车型不同差异较大。' },
    { itemKey: 'spark_plug', name: '火花塞', category: 'engine', necessity: 'must', intervalKm: 40000, intervalMonth: 48, note: '通用参考，具体寿命取决于材质（镍合金/铱金）。' },
    { itemKey: 'brake_fluid', name: '刹车油', category: 'safety', necessity: 'conditional', intervalKm: 40000, intervalMonth: 24, note: '按含水量检测更换，超过 3% 才需更换，不要仅凭年限盲目更换。' },
    { itemKey: 'brake_pad', name: '刹车片', category: 'safety', necessity: 'conditional', intervalKm: 40000, intervalMonth: null, conditionFactor: { urban: 0.6 }, note: '按厚度判断，剩余小于 3mm 需更换。' },
    { itemKey: 'coolant', name: '防冻液', category: 'engine', necessity: 'must', intervalKm: 60000, intervalMonth: 48, note: '通用参考周期，注意不同颜色规格不可混加。' },
    { itemKey: 'transmission_oil', name: '变速箱油', category: 'transmission', necessity: 'conditional', intervalKm: 60000, intervalMonth: 72, note: '部分变速箱标注终身免维护，请先确认车型类型。' },
    { itemKey: 'battery', name: '蓄电池', category: 'electrical', necessity: 'conditional', intervalKm: null, intervalMonth: 48, note: '按启动性能和电压检测判断，一般 3-5 年。' },
    { itemKey: 'tire', name: '轮胎', category: 'safety', necessity: 'conditional', intervalKm: 60000, intervalMonth: null, note: '按磨损与老化判断，胎纹低于 1.6mm 或出现龟裂需更换。' },
    ...upsellFuel(),
  ],
};

// ---------------- 日系其他（三菱 / 斯巴鲁） ----------------
const RULESET_JPN_OTHERS = {
  _id: 'ruleset_jpn_others',
  name: '日系其他品牌保养参考（三菱/斯巴鲁）',
  version: 1,
  updatedAt: '2026-08-02',
  source: '三菱/斯巴鲁随车保养手册整理（欧蓝德/劲炫ASX/森林人/XV等）',
  manual: {
    title: '日系其他品牌保养参考（三菱/斯巴鲁）',
    scope: '适用：三菱 欧蓝德 / 劲炫ASX，斯巴鲁 森林人 / XV 等暂无专属手册的日系车型',
    note: '这是日系小众品牌通用参考（非单一厂商手册）。斯巴鲁水平对置发动机建议 5000 公里或 6 个月；正式周期以随车手册为准。',
  },
  items: [
    { itemKey: 'engine_oil', name: '机油', category: 'engine', necessity: 'must', intervalKm: 5000, intervalMonth: 6, conditionFactor: { urban: 0.7, shortTrip: 0.6, dusty: 0.8 }, note: '斯巴鲁水平对置发动机官方建议 5000 公里或 6 个月；三菱类似。使用全合成可酌情延长。' },
    { itemKey: 'oil_filter', name: '机油滤清器', category: 'engine', necessity: 'must', intervalKm: 5000, intervalMonth: 6, note: '随机油同步更换。' },
    { itemKey: 'air_filter', name: '空气滤清器', category: 'engine', necessity: 'must', intervalKm: 20000, intervalMonth: 24, conditionFactor: { dusty: 0.5 }, note: '每 2 万公里更换。' },
    { itemKey: 'cabin_filter', name: '空调滤芯', category: 'comfort', necessity: 'optional', intervalKm: 20000, intervalMonth: 12, note: '约 2 万公里更换，可自行更换。' },
    { itemKey: 'fuel_filter', name: '汽油滤清器', category: 'engine', necessity: 'must', intervalKm: 60000, intervalMonth: 72, note: '约 6 万公里更换。' },
    { itemKey: 'spark_plug', name: '火花塞', category: 'engine', necessity: 'must', intervalKm: 40000, intervalMonth: 48, note: '约 4 万公里检查更换。' },
    { itemKey: 'brake_fluid', name: '刹车油', category: 'safety', necessity: 'conditional', intervalKm: null, intervalMonth: 24, note: '每 2 年检测含水量更换。' },
    { itemKey: 'brake_pad', name: '刹车片', category: 'safety', necessity: 'conditional', intervalKm: 40000, intervalMonth: null, conditionFactor: { urban: 0.6 }, note: '按厚度判断，剩余小于 3mm 需更换。' },
    { itemKey: 'coolant', name: '防冻液', category: 'engine', necessity: 'must', intervalKm: 100000, intervalMonth: 60, note: '长效防冻液约 10 万公里/5 年，注意规格不可混加。' },
    { itemKey: 'transmission_oil', name: '变速箱油', category: 'transmission', necessity: 'conditional', intervalKm: 60000, intervalMonth: 72, note: 'CVT/AT 约 6 万公里；斯巴鲁为纵置 CVT，注意专用油。' },
    { itemKey: 'battery', name: '蓄电池', category: 'electrical', necessity: 'conditional', intervalKm: null, intervalMonth: 48, note: '按启动性能和电压检测判断，一般 3-5 年。' },
    { itemKey: 'tire', name: '轮胎', category: 'safety', necessity: 'conditional', intervalKm: 60000, intervalMonth: null, note: '按磨损与老化判断，胎纹低于 1.6mm 或出现龟裂需更换。' },
    ...upsellFuel(),
  ],
};

// ---------------- 纯电动车通用（兜底，覆盖特斯拉/蔚来/小鹏/极氪/埃安/哪吒/零跑/智己/高合/小米/欧拉/几何 等） ----------------
const RULESET_EV = {
  _id: 'ruleset_ev',
  name: '纯电动车保养参考（通用）',
  version: 1,
  updatedAt: '2026-08-02',
  source: '纯电平台通用保养参考（适用于暂未单独建库的纯电车型）',
  manual: {
    title: '纯电通用保养参考（非专属手册）',
    scope: '适用：暂未单独建库的纯电车型（特斯拉/蔚来/小鹏/极氪/广汽埃安/哪吒/零跑/智己/高合/小米/欧拉/几何等），按纯电平台周期整理',
    note: '这是纯电平台通用参考，并非你车型的专属手册；正式周期请以随车保养手册为准。',
  },
  items: [
    { itemKey: 'cabin_filter', name: '空调滤芯', category: 'comfort', necessity: 'optional', intervalKm: 20000, intervalMonth: 12, conditionFactor: { dusty: 0.5 }, note: '纯电车无发动机保养，空调滤芯是主要定期项目，可自行更换。' },
    { itemKey: 'brake_fluid', name: '刹车油', category: 'safety', necessity: 'conditional', intervalKm: 40000, intervalMonth: 24, note: '纯电车多用动能回收，刹车片磨损慢，但刹车油仍需按含水量检测更换。' },
    { itemKey: 'brake_pad', name: '刹车片', category: 'safety', necessity: 'conditional', intervalKm: 80000, intervalMonth: null, note: '动能回收大幅降低刹车片磨损，可按厚度判断，普遍比燃油车耐用。' },
    { itemKey: 'coolant', name: '防冻液（三电冷却）', category: 'electrical', necessity: 'must', intervalKm: 60000, intervalMonth: 48, note: '纯电车冷却液用于电池与电机散热，按手册周期更换，不可混加。' },
    { itemKey: 'gear_oil', name: '减速器齿轮油', category: 'transmission', necessity: 'conditional', intervalKm: 60000, intervalMonth: 48, note: '减速器齿轮油约 6 万公里更换。' },
    { itemKey: 'battery', name: '动力电池检测', category: 'electrical', necessity: 'conditional', intervalKm: 20000, intervalMonth: 12, note: '建议每年做电池健康度检测，容量低于 70% 可走质保。' },
    { itemKey: 'tire', name: '轮胎', category: 'safety', necessity: 'conditional', intervalKm: 60000, intervalMonth: null, note: '按磨损与老化判断，纯电车扭矩大、车重，轮胎磨损可能更快。' },
    ...upsellEv(),
  ],
};

// ---------------- 燃油车通用参考（兜底，仅用于暂无专属手册的燃油车型） ----------------
const RULESET_GENERIC = {
  _id: 'ruleset_generic',
  name: '燃油车通用保养参考',
  version: 1,
  updatedAt: '2026-08-02',
  source: '燃油车通用保养参考（适用于暂未单独建库的燃油车型）',
  manual: {
    title: '通用保养参考（非专属手册）',
    scope: '适用：暂未单独建库的燃油车，按常见家用车周期整理',
    note: '这是通用参考，并非你车型的专属手册；正式更换周期请以随车保养手册为准。',
  },
  items: [
    { itemKey: 'engine_oil', name: '机油', category: 'engine', necessity: 'must', intervalKm: 10000, intervalMonth: 12, conditionFactor: { urban: 0.7, shortTrip: 0.6, dusty: 0.8 }, note: '通用参考：全合成机油约 1 万公里或 1 年。具体以你的随车保养手册为准，不同发动机周期差异较大。' },
    { itemKey: 'oil_filter', name: '机油滤清器', category: 'engine', necessity: 'must', intervalKm: 10000, intervalMonth: 12, note: '随机油同步更换。' },
    { itemKey: 'air_filter', name: '空气滤清器', category: 'engine', necessity: 'must', intervalKm: 20000, intervalMonth: 24, conditionFactor: { dusty: 0.5 }, note: '多尘地区缩短一半周期。' },
    { itemKey: 'cabin_filter', name: '空调滤芯', category: 'comfort', necessity: 'optional', intervalKm: 20000, intervalMonth: 12, note: '影响车内空气质量，可自行更换。' },
    { itemKey: 'fuel_filter', name: '汽油滤清器', category: 'engine', necessity: 'must', intervalKm: 40000, intervalMonth: 48, note: '通用参考周期，按车型不同差异较大。' },
    { itemKey: 'spark_plug', name: '火花塞', category: 'engine', necessity: 'must', intervalKm: 40000, intervalMonth: 48, note: '通用参考，具体寿命取决于材质（镍合金/铱金）。' },
    { itemKey: 'brake_fluid', name: '刹车油', category: 'safety', necessity: 'conditional', intervalKm: null, intervalMonth: 24, note: '按含水量检测更换，超过 3% 才需更换，不要仅凭年限盲目更换。' },
    { itemKey: 'brake_pad', name: '刹车片', category: 'safety', necessity: 'conditional', intervalKm: 40000, intervalMonth: null, conditionFactor: { urban: 0.6 }, note: '按厚度判断，剩余小于 3mm 需更换。' },
    { itemKey: 'coolant', name: '防冻液', category: 'engine', necessity: 'must', intervalKm: 60000, intervalMonth: 48, note: '通用参考周期，注意不同颜色规格不可混加。' },
    { itemKey: 'transmission_oil', name: '变速箱油', category: 'transmission', necessity: 'conditional', intervalKm: 60000, intervalMonth: 72, note: '部分变速箱标注终身免维护，请先确认车型类型。' },
    { itemKey: 'battery', name: '蓄电池', category: 'electrical', necessity: 'conditional', intervalKm: null, intervalMonth: 48, note: '按启动性能和电压检测判断，一般 3-5 年。' },
    { itemKey: 'tire', name: '轮胎', category: 'safety', necessity: 'conditional', intervalKm: 60000, intervalMonth: null, note: '按磨损与老化判断，胎纹低于 1.6mm 或出现龟裂需更换。' },
    ...upsellFuel(),
  ],
};

// ---------------- 增程混动（理想 / 问界 / 深蓝 等） ----------------
const RULESET_RANGE_EXT = {
  _id: 'ruleset_range_ext',
  name: '增程混动保养规则',
  version: 1,
  updatedAt: '2026-08-02',
  source: '增程混动随车保养手册整理（理想 L系列 / 问界 M5·M7 / 深蓝 SL03 等）',
  manual: {
    title: '增程混动保养手册',
    scope: '适用：理想 L7 / L8 / L9，问界 M5 / M7，深蓝 SL03(增程) 等增程车型',
    note: '本页各项周期整理自增程车型官方手册。增程器（小发动机）保养按总里程约 1 万公里或 1 年；无传统变速箱，三电检测是核心。',
  },
  items: [
    { itemKey: 'engine_oil', name: '增程器机油', category: 'engine', necessity: 'must', intervalKm: 10000, intervalMonth: 12, conditionFactor: { urban: 0.7, shortTrip: 0.6, dusty: 0.8 }, note: '增程器机油约 1 万公里或 1 年（按总里程，以先到为准）；须用厂家指定低灰分机油。' },
    { itemKey: 'oil_filter', name: '机油滤清器', category: 'engine', necessity: 'must', intervalKm: 10000, intervalMonth: 12, note: '随机油同步更换。' },
    { itemKey: 'air_filter', name: '空气滤清器', category: 'engine', necessity: 'must', intervalKm: 20000, intervalMonth: 24, conditionFactor: { dusty: 0.5 }, note: '每 2 万公里更换。' },
    { itemKey: 'cabin_filter', name: '空调滤芯', category: 'comfort', necessity: 'optional', intervalKm: 20000, intervalMonth: 12, note: '约 2 万公里更换，可自行更换。' },
    { itemKey: 'fuel_filter', name: '汽油滤清器', category: 'engine', necessity: 'must', intervalKm: 40000, intervalMonth: 48, note: '增程车型带油箱，汽油滤约 4 万公里检查更换。' },
    { itemKey: 'spark_plug', name: '火花塞', category: 'engine', necessity: 'must', intervalKm: 40000, intervalMonth: 48, note: '增程器火花塞约 4 万公里更换。' },
    { itemKey: 'brake_fluid', name: '刹车油', category: 'safety', necessity: 'conditional', intervalKm: 40000, intervalMonth: 24, note: '约 4 万公里或 2 年检测含水量更换。' },
    { itemKey: 'brake_pad', name: '刹车片', category: 'safety', necessity: 'conditional', intervalKm: 40000, intervalMonth: null, conditionFactor: { urban: 0.6 }, note: '按厚度判断，剩余小于 3mm 需更换。' },
    { itemKey: 'coolant', name: '防冻液（含三电冷却）', category: 'engine', necessity: 'must', intervalKm: 40000, intervalMonth: 48, note: '含增程器与三电冷却回路，约 4 万公里更换，不同回路规格不可混加。' },
    { itemKey: 'battery', name: '三电系统检测', category: 'electrical', necessity: 'conditional', intervalKm: 20000, intervalMonth: 12, note: '常规保养（约 1 万公里/年）检测电池/电机/电控；容量低于 70% 可走质保。' },
    { itemKey: 'tire', name: '轮胎', category: 'safety', necessity: 'conditional', intervalKm: 60000, intervalMonth: null, note: '按磨损与老化判断，增程车车重，轮胎磨损可能更快。' },
    ...upsellFuel(),
  ],
};

module.exports = {
  ruleset_vw_ea211: RULESET_VW_EA211,
  ruleset_vw_ea888: RULESET_VW_EA888,
  ruleset_toyota: RULESET_TOYOTA,
  ruleset_honda: RULESET_HONDA,
  ruleset_nissan: RULESET_NISSAN,
  ruleset_mazda: RULESET_MAZDA,
  ruleset_byd_dmi: RULESET_BYD_DMI,
  ruleset_byd_ev: RULESET_BYD_EV,
  ruleset_buick_gm: RULESET_BUICK_GM,
  ruleset_ford: RULESET_FORD,
  ruleset_bmw: RULESET_BMW,
  ruleset_benz: RULESET_BENZ,
  ruleset_hyundai_kia: RULESET_HYUNDAI_KIA,
  ruleset_geely_lynk: RULESET_GEELY_LYNK,
  ruleset_domestic: RULESET_DOMESTIC,
  ruleset_jpn_others: RULESET_JPN_OTHERS,
  ruleset_range_ext: RULESET_RANGE_EXT,
  ruleset_ev: RULESET_EV,
  ruleset_generic: RULESET_GENERIC,
  // 专属手册扩展包（保时捷 / 捷豹路虎 / Jeep / 标致雪铁龙 / 特斯拉）
  ...EXT_RULESETS,
  // 自主品牌专属包（长城 / 长安 / 奇瑞 / 广汽传祺 / 上汽 / 红旗）
  ...CN_RULESETS,
  // 新能源品牌专属包（蔚来 / 小鹏 / 极氪 / 小米 / 零跑 / 五菱 / 埃安 / 欧拉 / 长安 / 几何 / 红旗 / 哪吒 / 智己 / 高合 / 理想 / 问界 / 深蓝）
  ...NEV_RULESETS,
  // 品牌拆分与新增品牌包（沃尔沃 / 斯巴鲁 / 三菱 / 铃木 / 名爵 / 名爵纯电 / 捷达 / 捷途 / 岚图 / 岚图增程）
  ...V2_RULESETS,
  // 补齐在售品牌包（大众 ID. 纯电 / 吉利银河 / 长安启源 / 阿维塔纯电 / 阿维塔增程 / 极狐 / 北京越野 / 江淮）
  ...V3_RULESETS,
  // 通用大桶拆分包（雷克萨斯 / 丰田双擎 / 凯迪拉克 / 雪佛兰 / 奥迪横置 / 斯柯达）
  ...V4_RULESETS,
};