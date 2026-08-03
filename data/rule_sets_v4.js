// data/rule_sets_v4.js —— 第七轮：拆掉「通用大桶」，让每款车拿到真正属于它的手册（2026-08-03）
// 由 data/rule_sets.js 统一 require 并合并导出，对外仍以 rule_sets.js 为单一出口。
//
// 本轮解决的问题：前六轮把品牌补齐了，但仍有 4 个规则集在「一份手册管一堆车」——
// 它们的 manual.title 里明晃晃写着「通用」，等于告诉用户「这不是你的车的计划」：
//
//   ruleset_toyota     17 款：丰田燃油 + 丰田双擎 + 雷克萨斯挤在一起
//   ruleset_buick_gm   14 款：别克 + 雪佛兰 + 凯迪拉克挤在一起
//   ruleset_vw_ea211   13 款：大众 + 奥迪 + 斯柯达挤在一起
//
// 这三家的差异是**实打实的**，不是措辞问题：
//   · 雷克萨斯常规 1 万公里且有 4 年/10 万（混动 6 年/15 万）免费保养，很多项目根本不该自费；
//   · 丰田双擎有燃油版完全没有的「混动电池散热滤网」，而冷却液首次高达 16 万公里；
//   · 凯迪拉克是 7500 公里/6 个月，别克是 5000 公里/6 个月，差了 50%；
//   · 奥迪首保就是 1 万公里/12 个月，比大众 EA211 的口径更长。
//
// 本轮新增 6 套专属规则集：
//   ruleset_lexus          雷克萨斯（含免费保养权益，避免车主为已含项目重复付费）
//   ruleset_toyota_hybrid  丰田双擎 THS（混动专属项目 + 双擎特有过度保养话术）
//   ruleset_cadillac       凯迪拉克
//   ruleset_chevrolet      雪佛兰
//   ruleset_audi_ea211     奥迪横置平台（A3 / Q2L / Q3）
//   ruleset_skoda          斯柯达
//
// 数据口径：厂商官方保养手册/官方保养周期表 > 品牌官网服务页 > 官方渠道公开的周期表。
// 本轮一个重要产品判断（已写进 note）：双擎车主是过度保养的重灾区——
// 门店常见组合「发动机积碳清洗 + 电池均衡养护 + E-CVT 深度换油 + 全车护理」四项合计数千元，
// 而丰田官方手册对这四项均无周期要求。本产品把它们如实标为「无需理会」。

const { upsellFuel } = require('./rule_set_common.js');

// 燃油共用尾部：刹车片 + 轮胎（与 v3 保持一致的口径）
function fuelTail(opts) {
  const o = opts || {};
  return [
    { itemKey: 'brake_pad', name: '刹车片', category: 'safety', necessity: 'conditional', intervalKm: o.padKm || 60000, intervalMonth: null, conditionFactor: { urban: 0.6 }, note: o.padNote || '磨损件，按厚度检测判断，不按固定里程更换。低于 3mm 需更换，门店以「快到里程了」为由推荐更换属于过度保养。' },
    { itemKey: 'tire', name: '轮胎', category: 'safety', necessity: 'conditional', intervalKm: o.tireKm || 60000, intervalMonth: null, note: o.tireNote || '按花纹深度与老化判断：花纹低于 1.6mm 或胎侧出现裂纹、鼓包时更换，与行驶里程没有固定对应关系。' },
    { itemKey: 'battery', name: '蓄电池', category: 'electrical', necessity: 'conditional', intervalKm: null, intervalMonth: 48, note: '按启动性能和电压检测判断，一般 3-5 年。不要仅凭年限更换，做一次蓄电池检测即可确认。' },
  ];
}

/* ================= 雷克萨斯 ================= */
// 依据：雷克萨斯中国官方保养政策（首保 5000 公里/半年，常规 1 万公里）
//      + LEXUS 官方零件更换周期说明（机油 1 万、空气滤 4 万、汽油滤 8 万）
const RULESET_LEXUS = {
  _id: 'ruleset_lexus',
  name: '雷克萨斯（ES / NX / RX / UX / IS）',
  version: 1,
  updatedAt: '2026-08-03',
  source: '雷克萨斯中国官方保养政策与免费保养权益说明 + LEXUS 官方认证零件建议更换周期',
  manual: {
    title: '雷克萨斯随车保养手册与官方免费保养权益',
    scope: '适用：雷克萨斯 ES / NX / RX / UX / IS / LS 等在售车型（含智能电混双擎版本）',
    note: '官方口径：首保 5000 公里或半年，之后常规保养间隔 1 万公里。**关键权益**：汽油车型 4 年或 10 万公里内共 10 次免费保养，智能电混（混动）车型 6 年或 15 万公里内共 15 次——免费范围已覆盖机油、机滤、空气滤、汽油滤、制动液、火花塞、刹车片、雨刮、差速器油及 48 项检测。也就是说，本页大部分项目在保养权益期内**不该由你自费**。免费保养默认半合成机油，升级全合成只需补差价；带「清洗」字样的项目、轮胎、四轮定位不在免费范围内。',
  },
  items: [
    { itemKey: 'engine_oil', name: '机油', category: 'engine', necessity: 'must', intervalKm: 10000, intervalMonth: 6, conditionFactor: { urban: 0.7, shortTrip: 0.6, dusty: 0.8 }, note: '官方：首保 5000 公里/半年，之后每 1 万公里或半年（汽油车官方免费保养按 5 个月/1 万公里排期，混动按 6 个月/1 万公里）。原厂 0W-20 全合成。低频用车按半年走，不必凑里程。' },
    { itemKey: 'oil_filter', name: '机油滤清器', category: 'engine', necessity: 'must', intervalKm: 10000, intervalMonth: 6, note: '随机油同步更换，官方免费保养已包含。' },
    { itemKey: 'air_filter', name: '空气滤清器', category: 'engine', necessity: 'must', intervalKm: 40000, intervalMonth: 48, conditionFactor: { dusty: 0.5 }, note: '官方周期为每 4 万公里（或 4 年）。这一项常被门店按 2 万公里推荐，与官方口径差一倍——多尘环境可提前检查，但脏了再换即可。' },
    { itemKey: 'cabin_filter', name: '空调滤芯', category: 'comfort', necessity: 'must', intervalKm: 30000, intervalMonth: 24, conditionFactor: { dusty: 0.5 }, note: '官方周期每 3 万公里。属于免费保养覆盖项，也可自行更换，配件几十元、五分钟搞定。' },
    { itemKey: 'fuel_filter', name: '汽油滤清器', category: 'engine', necessity: 'must', intervalKm: 80000, intervalMonth: 96, note: '官方周期每 8 万公里（或 8 年），且在免费保养覆盖范围内。被提前推荐时可直接要求对照官方周期表。' },
    { itemKey: 'spark_plug', name: '火花塞', category: 'engine', necessity: 'must', intervalKm: 100000, intervalMonth: 120, note: '官方周期 10 万公里（原厂铱金）。混动车型发动机介入少，实际状态往往更好。任何 4 万、6 万公里就推荐更换火花塞的说法都缺乏官方依据。' },
    { itemKey: 'brake_fluid', name: '刹车油', category: 'safety', necessity: 'must', intervalKm: 40000, intervalMonth: 36, note: '官方周期每 4 万公里，免费保养覆盖。可先做含水量检测，超过 3% 必须更换。' },
    { itemKey: 'coolant', name: '防冻液', category: 'engine', necessity: 'conditional', intervalKm: 160000, intervalMonth: 120, note: '丰田/雷克萨斯原厂超长效冷却液首次更换约 16 万公里，之后每 8 万公里。日常只需观察液位，缺了补同型号，严禁与其他颜色混加。按 4 万公里推荐更换防冻液属于典型过度保养。' },
    { itemKey: 'transmission_oil', name: '变速箱油', category: 'transmission', necessity: 'conditional', intervalKm: 80000, intervalMonth: 96, note: '传统 AT（如 8AT/10AT）约 8 万公里；混动车型 E-CVT 官方无固定强制周期，10 万公里以上按状态检查即可。不要采纳「循环机深度换油」方案，原厂推荐重力换油。' },
    { itemKey: 'diff_oil', name: '差速器油（四驱车型）', category: 'transmission', necessity: 'conditional', intervalKm: 80000, intervalMonth: 96, note: '仅四驱车型需要，且在官方免费保养覆盖项内。两驱车型被推荐这一项时直接拒绝。' },
    ...fuelTail({ padKm: 70000, padNote: '雷克萨斯刹车片属于免费保养覆盖的易损件（达到磨损阈值时更换），按厚度判断即可，剩余小于 3mm 才需更换。混动车型有能量回收，刹车片寿命普遍更长。' }),
    ...upsellFuel(),
  ],
};

/* ================= 丰田双擎 THS 混动 ================= */
// 依据：丰田中国 2026 版保养手册（双擎 1 万公里/12 个月基础保养）
//      + 官方混动车型专项：电池散热滤网、逆变器冷却液
const RULESET_TOYOTA_HYBRID = {
  _id: 'ruleset_toyota_hybrid',
  name: '丰田双擎 THS 混动（凯美瑞/雷凌/卡罗拉/RAV4/赛那/皇冠陆放 双擎版）',
  version: 1,
  updatedAt: '2026-08-03',
  source: '丰田中国 2026 版保养手册双擎章节 + 广汽丰田/一汽丰田官方混动保养口径',
  manual: {
    title: '丰田双擎（THS 混动）随车保养手册',
    scope: '适用：丰田 凯美瑞双擎 / 雷凌双擎 / 卡罗拉双擎 / RAV4 双擎 / 威兰达双擎 / 亚洲龙双擎 / 赛那 / 皇冠陆放双擎 等 THS 混动车型',
    note: '官方口径：基础保养 1 万公里或 12 个月（先到者为准），项目就是全合成机油 + 机滤 + 三电检测与常规检查，仅此而已。双擎车主是过度保养的重灾区——「发动机积碳清洗 / 电池均衡养护 / E-CVT 深度换油 / 全车四合一护理」这套组合在官方手册里**一项都没有**。混动系统低负荷下由电机驱动、发动机启停平顺，机油衰减比燃油车更慢，把周期折半到 5000 公里没有依据。',
  },
  items: [
    { itemKey: 'engine_oil', name: '机油', category: 'engine', necessity: 'must', intervalKm: 10000, intervalMonth: 12, conditionFactor: { urban: 0.8, shortTrip: 0.7, dusty: 0.8 }, note: '官方 1 万公里或 12 个月，原厂 0W-20 全合成。注意：门店常以「双擎启停多、机油易变质」为由要求 5000 公里一换——恰恰相反，THS 的发动机是在高效区间平顺介入，不存在传统启停频繁冷启动的工况，官方周期就是 1 万公里。' },
    { itemKey: 'oil_filter', name: '机油滤清器', category: 'engine', necessity: 'must', intervalKm: 10000, intervalMonth: 12, note: '随机油同步更换。' },
    { itemKey: 'hv_battery_filter', name: '混动电池散热滤网', category: 'electrical', necessity: 'must', intervalKm: 30000, intervalMonth: 36, conditionFactor: { dusty: 0.6 }, note: '**双擎专属项目，燃油版没有**。位于后排座椅侧下方的电池进气口滤网，每 3 万公里左右清洁或更换（部分车型口径为 4 万公里）。堵塞会直接影响动力电池散热效率，是双擎少数真正必须做、却最容易被漏做的项目——注意它跟门店推销的「电池深度养护 / 电池均衡」完全是两回事。' },
    { itemKey: 'air_filter', name: '空气滤清器', category: 'engine', necessity: 'must', intervalKm: 20000, intervalMonth: 24, conditionFactor: { dusty: 0.5 }, note: '官方每 2 万公里更换；长期多尘路段可缩短至 1 万公里检查，脏了再换。' },
    { itemKey: 'cabin_filter', name: '空调滤芯', category: 'comfort', necessity: 'optional', intervalKm: 20000, intervalMonth: 12, note: '官方每 2 万公里，实际按换季与空气质量决定。可自行更换，无需在门店支付工时。' },
    { itemKey: 'spark_plug', name: '火花塞', category: 'engine', necessity: 'must', intervalKm: 100000, intervalMonth: 120, note: '双擎为自然吸气发动机配原厂铱金火花塞，官方周期 10 万公里。混动发动机运行时间远少于同里程燃油车，实际磨损更小，提前更换没有意义。' },
    { itemKey: 'brake_fluid', name: '刹车油', category: 'safety', necessity: 'conditional', intervalKm: 40000, intervalMonth: 36, note: '官方 4 万公里检测；官方同时说明含水量无明显衰减可延至 8 万公里。先做含水量检测（免费或几十元），超过 3% 再换。' },
    { itemKey: 'coolant', name: '发动机冷却液', category: 'engine', necessity: 'conditional', intervalKm: 160000, intervalMonth: 120, note: '官方超长效冷却液首次更换周期为 **16 万公里**，之后每 8 万公里。这是双擎最容易被误导的项目之一——按 4 万或 6 万公里推荐更换防冻液，与官方手册差了三四倍。' },
    { itemKey: 'inverter_coolant', name: '动力控制单元（逆变器）冷却液', category: 'electrical', necessity: 'conditional', intervalKm: 240000, intervalMonth: 120, note: '**双擎专属**，与发动机冷却液是两套独立循环。官方首次更换周期为 24 万公里，之后按手册周期。绝大多数车主在整个用车周期内都不会碰到这一项。' },
    { itemKey: 'transmission_oil', name: 'E-CVT 变速箱油', category: 'transmission', necessity: 'optional', intervalKm: 100000, intervalMonth: 120, note: 'E-CVT 是行星齿轮结构，没有传统 CVT 的钢带与液力变矩器，官方将其视为长寿命部件，多数车型口径为 10 万公里以上按状态检查、部分官方资料直接标注为免维护。门店报价 1000-1700 元的「E-CVT 深度/循环机换油」在官方手册中没有对应周期，2 万、4 万公里就被推荐时可直接拒绝。' },
    ...fuelTail({ padKm: 80000, padNote: '双擎有动能回收参与减速，刹车片磨损速度比燃油车慢 30%-50%，官方与实测口径普遍可达 6-8 万公里。务必按厚度判断，不要按里程盲换。' }),
    ...upsellFuel(),
    { itemKey: 'hv_battery_balance', name: '动力电池均衡养护 / 电池深度养护', category: 'upsell', necessity: 'unnecessary', note: '丰田官方保养手册中没有这一项目。THS 的电池管理系统（BMS）在车辆日常运行中自动完成均衡，门店提供的所谓「均衡养护」既无官方周期、也无标准工艺。真正需要做的是清洁「混动电池散热滤网」（本页已单列），两者不要混淆。' },
    { itemKey: 'hybrid_full_care', name: '全车「四合一」护理套餐', category: 'upsell', necessity: 'unnecessary', note: '打包的清洗类项目（发动机内部清洗、油路清洗、进气道清洗、空调护理等）不属于厂商保养项目。双擎发动机长期工作在高效区间，积碳产生速度低于同排量燃油车，无症状情况下无需清洗。' },
  ],
};

/* ================= 凯迪拉克 ================= */
// 依据：凯迪拉克官方保养手册（首保 5000/6 个月，常规 7500 公里/6 个月）
const RULESET_CADILLAC = {
  _id: 'ruleset_cadillac',
  name: '凯迪拉克（CT4 / CT5 / CT6 / XT4 / XT5 / XT6）',
  version: 1,
  updatedAt: '2026-08-03',
  source: '凯迪拉克随车保养手册周期表（XT4/XT5 7500 公里口径，CT6 1 万公里口径）',
  manual: {
    title: '凯迪拉克随车保养手册',
    scope: '适用：凯迪拉克 CT4 / CT5 / CT6 / XT4 / XT5 / XT6 等在售燃油车型（2.0T LSY + 8AT/9AT/10AT）',
    note: '官方口径：首保 5000 公里或 6 个月；之后常规保养每 7500 公里或 6 个月（CT6 等搭载 10AT 的大车型口径为 1 万公里或 12 个月）。注意凯迪拉克与同集团的别克并**不同周期**——别克是 5000 公里，凯迪拉克是 7500 公里，被按别克口径催保养时可要求对照本车手册。',
  },
  items: [
    { itemKey: 'engine_oil', name: '机油', category: 'engine', necessity: 'must', intervalKm: 7500, intervalMonth: 6, conditionFactor: { urban: 0.7, shortTrip: 0.6, dusty: 0.8 }, note: '官方：首保 5000 公里，之后每 7500 公里或 6 个月，原厂 5W-30 全合成。车机的机油寿命监测系统（Oil Life）提示优先于固定里程——提示未到 0% 时不必提前进店。' },
    { itemKey: 'oil_filter', name: '机油滤清器', category: 'engine', necessity: 'must', intervalKm: 7500, intervalMonth: 6, note: '随机油同步更换。' },
    { itemKey: 'air_filter', name: '空气滤清器', category: 'engine', necessity: 'must', intervalKm: 20000, intervalMonth: 12, conditionFactor: { dusty: 0.5 }, note: '官方每 2 万公里或 1 年更换。' },
    { itemKey: 'cabin_filter', name: '空调滤芯', category: 'comfort', necessity: 'must', intervalKm: 20000, intervalMonth: 12, note: '官方每 2 万公里或 1 年。可自行更换，滤芯位于副驾手套箱后方。' },
    { itemKey: 'fuel_filter', name: '汽油滤清器', category: 'engine', necessity: 'must', intervalKm: 20000, intervalMonth: 12, note: '官方每 2 万公里或 1 年更换，这是凯迪拉克周期偏短的项目，属于厂商口径，如实呈现。' },
    { itemKey: 'spark_plug', name: '火花塞', category: 'engine', necessity: 'must', intervalKm: 60000, intervalMonth: 72, note: '2.0T 涡轮增压机型官方口径 6 万公里（XT4 手册标注 5.75 万公里节点）。建议使用原厂铱金火花塞。' },
    { itemKey: 'brake_fluid', name: '刹车油', category: 'safety', necessity: 'must', intervalKm: 30000, intervalMonth: 24, note: '官方每 3 万公里或 2 年。可先做含水量检测，超过 3% 必须更换。' },
    { itemKey: 'coolant', name: '防冻液', category: 'engine', necessity: 'must', intervalKm: 100000, intervalMonth: 60, note: 'DEX-COOL 长效冷却液约 10 万公里或 5 年更换，规格不可与其他类型混加。' },
    { itemKey: 'transmission_oil', name: '变速箱油（8AT / 9AT / 10AT）', category: 'transmission', necessity: 'must', intervalKm: 80000, intervalMonth: 72, note: '官方每 8 万公里或 6 年更换。通用系纵置 10AT 对油品规格敏感，务必用符合 DEXRON-HP 规格的原厂油。' },
    { itemKey: 'transfer_oil', name: '分动箱油 / 后差速器油（四驱车型）', category: 'transmission', necessity: 'conditional', intervalKm: 80000, intervalMonth: 96, note: '仅四驱车型需要，约 8 万公里。两驱车型不存在此项目，被推荐时直接拒绝。' },
    ...fuelTail({ padKm: 50000, padNote: '凯迪拉克整备质量偏大、制动负荷高，刹车片实际寿命略短于日系同级，但仍需按厚度判断（低于 3mm 更换），不按里程盲换。' }),
    ...upsellFuel(),
  ],
};

/* ================= 雪佛兰 ================= */
// 依据：上汽通用雪佛兰随车保养手册 + Chevrolet 官方 Oil Life System 口径
const RULESET_CHEVROLET = {
  _id: 'ruleset_chevrolet',
  name: '雪佛兰（科鲁泽 / 迈锐宝XL / 探界者 / 创酷 / 星迈罗）',
  version: 1,
  updatedAt: '2026-08-03',
  source: '上汽通用雪佛兰随车保养手册 + Chevrolet 官方维护计划说明（机油寿命监测系统）',
  manual: {
    title: '上汽通用雪佛兰随车保养手册',
    scope: '适用：雪佛兰 科鲁泽 / 迈锐宝XL / 探界者 / 创酷 / 沃兰多 / 星迈罗 等在售燃油车型',
    note: '官方口径：首保 5000 公里或 6 个月；之后常规保养每 7500 公里或 12 个月，并以车机「机油寿命监测系统（Oil Life）」的提示为准——这是通用系区别于日系的关键点：手册明确写的是「按 Oil Life 提示或 7500 公里，以先到者为准」，而不是一刀切的固定里程。',
  },
  items: [
    { itemKey: 'engine_oil', name: '机油', category: 'engine', necessity: 'must', intervalKm: 7500, intervalMonth: 12, conditionFactor: { urban: 0.7, shortTrip: 0.6, dusty: 0.8 }, note: '官方每 7500 公里或按车机机油寿命监测提示。用半合成建议按 5000 公里执行，全合成可跑满 7500。1.0T/1.3T 三缸机型建议不超过 7500 公里。' },
    { itemKey: 'oil_filter', name: '机油滤清器', category: 'engine', necessity: 'must', intervalKm: 7500, intervalMonth: 12, note: '随机油同步更换。' },
    { itemKey: 'air_filter', name: '空气滤清器', category: 'engine', necessity: 'must', intervalKm: 20000, intervalMonth: 24, conditionFactor: { dusty: 0.5 }, note: '官方每 2 万公里更换；多尘路段 1 万公里检查，脏了再换。' },
    { itemKey: 'cabin_filter', name: '空调滤芯', category: 'comfort', necessity: 'optional', intervalKm: 20000, intervalMonth: 12, note: '官方每 2 万公里或 1 年，实际按换季和空气质量决定。可自行更换。' },
    { itemKey: 'fuel_filter', name: '汽油滤清器', category: 'engine', necessity: 'must', intervalKm: 30000, intervalMonth: 24, note: '官方约 3 万公里更换。部分车型汽滤内置于油箱内，更换工时较高，务必确认是否真到周期。' },
    { itemKey: 'spark_plug', name: '火花塞', category: 'engine', necessity: 'must', intervalKm: 60000, intervalMonth: 72, note: '涡轮增压机型官方口径约 6 万公里（部分老款 1.5L 自吸为 4 万公里）。' },
    { itemKey: 'brake_fluid', name: '刹车油', category: 'safety', necessity: 'must', intervalKm: 30000, intervalMonth: 24, note: '官方每 3 万公里或 2 年。可先做含水量检测，超过 3% 必须更换。' },
    { itemKey: 'coolant', name: '防冻液', category: 'engine', necessity: 'must', intervalKm: 100000, intervalMonth: 60, note: 'DEX-COOL 长效冷却液约 10 万公里或 5 年，不可与其他类型混加。' },
    { itemKey: 'transmission_oil', name: '变速箱油', category: 'transmission', necessity: 'conditional', intervalKm: 80000, intervalMonth: 96, note: '自动变速箱油官方约 8 万公里；CVT 车型建议 6 万公里。严苛工况（长期拥堵、拖挂）可提前，正常家用无需在 4 万公里就换。' },
    ...fuelTail({ padKm: 50000 }),
    ...upsellFuel(),
  ],
};

/* ================= 奥迪 横置平台（EA211 / EA888 小排量） ================= */
// 依据：奥迪官方保养手册周期表（首保 1 万公里/12 个月，机油 1 万公里）
const RULESET_AUDI_EA211 = {
  _id: 'ruleset_audi_ea211',
  name: '奥迪 横置平台（A3 / Q2L / Q3 / Q3 Sportback）',
  version: 1,
  updatedAt: '2026-08-03',
  source: '奥迪随车保养手册周期表（一汽奥迪 A3/Q2L/Q3 官方保养口径）',
  manual: {
    title: '奥迪随车保养手册（横置平台车型）',
    scope: '适用：奥迪 A3 / A3 Sportback / Q2L / Q3 / Q3 Sportback 等横置平台车型（1.4T/1.5T/2.0T + 7 速湿式双离合）',
    note: '官方口径：首保 1 万公里或 12 个月（比大众品牌口径更长，不要被按 5000 公里催首保）；之后每 1 万公里或 12 个月更换机油机滤。奥迪的转向系统为电子助力，**没有转向助力油这个项目**，被推荐更换助力油时可直接拒绝。',
  },
  items: [
    { itemKey: 'engine_oil', name: '机油', category: 'engine', necessity: 'must', intervalKm: 10000, intervalMonth: 12, conditionFactor: { urban: 0.7, shortTrip: 0.6, dusty: 0.8 }, note: '官方每 1 万公里或 12 个月，需符合 VW 504 00 规格的全合成机油。高海拔、山区、长期恶劣路况可酌情缩短，官方手册对此有明确说明。' },
    { itemKey: 'oil_filter', name: '机油滤清器', category: 'engine', necessity: 'must', intervalKm: 10000, intervalMonth: 12, note: '随机油同步更换。' },
    { itemKey: 'air_filter', name: '空气滤清器', category: 'engine', necessity: 'must', intervalKm: 20000, intervalMonth: 24, conditionFactor: { dusty: 0.5 }, note: '官方每 2 万公里或 2 年更换。' },
    { itemKey: 'cabin_filter', name: '空调滤芯（花粉滤清器）', category: 'comfort', necessity: 'must', intervalKm: 20000, intervalMonth: 12, conditionFactor: { dusty: 0.5 }, note: '官方每 2 万公里或 1 年；多尘环境缩短。可自行更换。' },
    { itemKey: 'fuel_filter', name: '汽油滤清器', category: 'engine', necessity: 'must', intervalKm: 40000, intervalMonth: 48, note: '官方在 4 万公里节点更换。部分车型汽滤集成在油泵总成内，更换前先确认结构。' },
    { itemKey: 'spark_plug', name: '火花塞', category: 'engine', necessity: 'must', intervalKm: 60000, intervalMonth: 72, note: '官方周期表在 6 万公里节点更换（部分年款手册标注 2 万公里，对应的是早期镍合金塞；现款原厂为长寿命铱金/铂金塞）。以随车手册标注为准，被在 2 万公里推荐时先确认自己车的火花塞类型。' },
    { itemKey: 'brake_fluid', name: '刹车油', category: 'safety', necessity: 'must', intervalKm: null, intervalMonth: 24, note: '官方明确：**每 24 个月更换一次，与里程无关**。这是德系车少数按时间强制的项目，不要因为「里程没到」而拖延。' },
    { itemKey: 'coolant', name: '防冻液', category: 'engine', necessity: 'conditional', intervalKm: null, intervalMonth: null, note: '奥迪原厂 G12/G13 冷却液为终身型，官方无固定更换周期，只需检查液位与冰点。任何按里程推荐更换防冻液的建议都缺乏手册依据（维修放液后除外）。' },
    { itemKey: 'transmission_oil', name: '变速箱油（7 速湿式 DSG）', category: 'transmission', necessity: 'must', intervalKm: 60000, intervalMonth: 72, note: '湿式双离合官方每 6 万公里更换（含滤芯）。这一项不能拖——湿式 DSG 的油同时润滑离合器与齿轮，是德系双离合可靠性的关键。干式双离合车型则**无需更换**，先确认自己的变速箱类型。' },
    { itemKey: 'power_steering_oil', name: '转向助力油', category: 'upsell', necessity: 'unnecessary', note: '奥迪横置平台车型全系为电子助力转向（EPS），**结构上就没有助力油**。这一项被列进保养单时属于明显的无中生有。' },
    ...fuelTail({ padKm: 50000 }),
    ...upsellFuel(),
  ],
};

/* ================= 斯柯达 ================= */
// 依据：上汽斯柯达随车保养手册（与大众同平台，但官方周期表独立）
const RULESET_SKODA = {
  _id: 'ruleset_skoda',
  name: '斯柯达（明锐 / 速派 / 柯米克 / 柯珞克 / 柯迪亚克）',
  version: 1,
  updatedAt: '2026-08-03',
  source: '上汽斯柯达随车保养手册周期表（EA211 1.5L/1.2T、EA888 2.0T 平台）',
  manual: {
    title: '斯柯达随车保养手册',
    scope: '适用：斯柯达 明锐 / 明锐PRO / 速派 / 柯米克 / 柯珞克 / 柯迪亚克 等在售车型',
    note: '官方口径：首保 5000 公里或 6 个月（免费）；之后每 1 万公里或 12 个月常规保养。斯柯达与大众共用 EA211/EA888 平台，但**保养工时与配件价格明显更低**，同平台项目按大众口径执行即可，被按「进口/豪华」标准报价时可对照大众同款车型价格。',
  },
  items: [
    { itemKey: 'engine_oil', name: '机油', category: 'engine', necessity: 'must', intervalKm: 10000, intervalMonth: 12, conditionFactor: { urban: 0.7, shortTrip: 0.6, dusty: 0.8 }, note: '官方每 1 万公里或 12 个月，需符合 VW 504 00 / 508 00 规格全合成机油。首保 5000 公里为免费项目，别错过。' },
    { itemKey: 'oil_filter', name: '机油滤清器', category: 'engine', necessity: 'must', intervalKm: 10000, intervalMonth: 12, note: '随机油同步更换。' },
    { itemKey: 'air_filter', name: '空气滤清器', category: 'engine', necessity: 'must', intervalKm: 20000, intervalMonth: 24, conditionFactor: { dusty: 0.5 }, note: '官方每 2 万公里更换。' },
    { itemKey: 'cabin_filter', name: '空调滤芯（花粉滤清器）', category: 'comfort', necessity: 'must', intervalKm: 20000, intervalMonth: 12, conditionFactor: { dusty: 0.5 }, note: '官方每 2 万公里或 1 年。斯柯达滤芯位置好拆，自行更换十分钟即可。' },
    { itemKey: 'fuel_filter', name: '汽油滤清器', category: 'engine', necessity: 'must', intervalKm: 60000, intervalMonth: 72, note: '官方约 6 万公里。多数车型为油箱内置式，非到周期不必更换。' },
    { itemKey: 'spark_plug', name: '火花塞', category: 'engine', necessity: 'must', intervalKm: 60000, intervalMonth: 72, note: '涡轮增压机型官方 6 万公里；1.5L 自吸机型可达 6-9 万公里，以随车手册为准。' },
    { itemKey: 'brake_fluid', name: '刹车油', category: 'safety', necessity: 'must', intervalKm: null, intervalMonth: 24, note: '德系统一口径：首次 3 年，之后每 2 年更换，与里程无关。可先测含水量，超过 3% 必须换。' },
    { itemKey: 'coolant', name: '防冻液', category: 'engine', necessity: 'conditional', intervalKm: null, intervalMonth: null, note: '原厂 G12/G13 为长效型，官方无固定更换周期，检查液位与冰点即可。' },
    { itemKey: 'transmission_oil', name: '变速箱油', category: 'transmission', necessity: 'conditional', intervalKm: 60000, intervalMonth: 72, note: '7 速湿式双离合（DQ381）官方每 6 万公里更换；**干式双离合（DQ200）官方为免维护，无需更换**；6AT 车型约 6 万公里。先确认变速箱型号再决定，这是最容易被多收一笔的项目。' },
    { itemKey: 'timing_belt', name: '正时皮带（1.4T EA211 部分批次）', category: 'engine', necessity: 'conditional', intervalKm: 120000, intervalMonth: 120, note: 'EA211 系列部分机型采用正时皮带（非链条），官方口径约 12 万公里检查/更换。先确认自己车的正时结构：链条版本无此项目。' },
    ...fuelTail({ padKm: 60000 }),
    ...upsellFuel(),
  ],
};

module.exports = {
  ruleset_lexus: RULESET_LEXUS,
  ruleset_toyota_hybrid: RULESET_TOYOTA_HYBRID,
  ruleset_cadillac: RULESET_CADILLAC,
  ruleset_chevrolet: RULESET_CHEVROLET,
  ruleset_audi_ea211: RULESET_AUDI_EA211,
  ruleset_skoda: RULESET_SKODA,
};
