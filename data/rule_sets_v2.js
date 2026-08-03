// data/rule_sets_v2.js —— 第五轮扩充：新增品牌专属保养规则集（2026-08-03）
//
// 本轮解决两类问题：
//   1) 「挂错手册」——沃尔沃此前并入吉利/领克 CMA 同源规则集，斯巴鲁/三菱/铃木并入「日系其他」通用桶。
//      三者官方保养周期与项目其实差异很大（沃尔沃 1 万公里、斯巴鲁 5000 公里且有四驱差速器油），
//      沿用同源规则集会给出偏离官方手册的结论。本轮各自拆出专属规则集。
//   2) 「品牌缺失」——名爵 MG、捷达 JETTA、捷途、岚图等在售主流品牌此前车型库里没有，
//      用户找不到自己的车。本轮补齐品牌规则集，配套车型见 utils/models.js。
//
// 数据来源均为厂商官方渠道（官网保养项目表 / 官方用户手册 / 官方技术规范），
// 无法取得逐款官方手册的，在 manual.note 中如实标注口径来源，不冒充专属手册。

const { upsellFuel, upsellEv } = require('./rule_set_common.js');

// 共用尾部：磨损件按检测判断，不按里程强推
function wearItems(opts) {
  const o = opts || {};
  return [
    {
      itemKey: 'brake_pad',
      name: '刹车片',
      category: 'safety',
      necessity: 'conditional',
      intervalKm: o.brakePadKm || 60000,
      intervalMonth: null,
      note: o.brakePadNote || '磨损件，按厚度检测判断，不按固定里程更换。低于 3mm 需更换，门店以「快到里程了」为由推荐更换属于过度保养。',
    },
    {
      itemKey: 'tire',
      name: '轮胎',
      category: 'safety',
      necessity: 'conditional',
      intervalKm: o.tireKm || 60000,
      intervalMonth: null,
      note: o.tireNote || '按花纹深度与老化判断。低于 1.6mm 磨损标记或出现明显龟裂需更换，建议每 1 万公里做一次四轮换位。',
    },
  ];
}

const V2_RULESETS = {
  /* ================= 沃尔沃（Drive-E 平台，自吉利/领克规则集拆出） ================= */
  ruleset_volvo: {
    _id: 'ruleset_volvo',
    name: '沃尔沃 Drive-E（S60 / S90 / XC40 / XC60 / XC90）',
    version: 1,
    updatedAt: '2026-08-03',
    source: '沃尔沃汽车中国官网「基础保养服务」逐年保养项目表 + 官方《用户手册》保养间隔说明',
    manual: {
      title: '沃尔沃汽车中国官方保养项目表（Drive-E 全系）',
      scope: '适用：沃尔沃 S60 / S90 / XC40 / XC60 / XC90 等 Drive-E 动力车型（含 RECHARGE 插混的燃油部分）',
      note: '官方口径：自购车之日起每 1 万公里或 12 个月为一个保养周期（先到者为准），官方允许 ±1250 公里 / ±1 个月浮动。此前本产品把沃尔沃并入吉利/领克 CMA 同源规则集，本轮已按沃尔沃官方保养表单独建库。',
    },
    items: [
      {
        itemKey: 'engine_oil',
        name: '机油',
        category: 'engine',
        necessity: 'must',
        intervalKm: 10000,
        intervalMonth: 12,
        conditionFactor: { urban: 0.8, shortTrip: 0.7, dusty: 0.8 },
        note: '官方每 1 万公里或 12 个月，须使用 0W-20 / 0W-30 认证机油。官方明确给出 ±1250 公里的浮动区间，略微超出并不需要紧张。',
      },
      { itemKey: 'oil_filter', name: '机油滤清器', category: 'engine', necessity: 'must', intervalKm: 10000, intervalMonth: 12, note: '随机油同步更换。沃尔沃保养表把油底壳放油螺塞垫片也列为每次更换件，属于官方正式项目而非门店加项。' },
      { itemKey: 'cabin_filter', name: '空调滤芯', category: 'comfort', necessity: 'must', intervalKm: 20000, intervalMonth: 24, conditionFactor: { dusty: 0.5 }, note: '官方在第 2 / 4 / 6 年（2 万 / 4 万 / 6 万公里）更换，即每两个保养周期一次。' },
      { itemKey: 'air_filter', name: '空气滤清器', category: 'engine', necessity: 'must', intervalKm: 30000, intervalMonth: 36, conditionFactor: { dusty: 0.5 }, note: '官方在第 3 / 6 / 9 年（3 万 / 6 万 / 9 万公里）更换，与汽油滤清器同一节点。' },
      { itemKey: 'fuel_filter', name: '汽油滤清器', category: 'engine', necessity: 'must', intervalKm: 30000, intervalMonth: 36, note: '沃尔沃把汽油滤清器列为每 3 万公里的正式更换项，区别于多数日系车型的「终身免换」。这一项被推荐时不属于过度保养。' },
      { itemKey: 'spark_plug', name: '火花塞', category: 'engine', necessity: 'must', intervalKm: 40000, intervalMonth: 48, note: '官方在第 4 / 8 年（4 万 / 8 万公里）更换。' },
      { itemKey: 'brake_fluid', name: '刹车油', category: 'safety', necessity: 'must', intervalKm: null, intervalMonth: 36, note: '按年限执行，官方约 3 年更换一次（保养表以检测为准）。可先做含水量检测，超过 3% 必须更换。' },
      { itemKey: 'coolant', name: '防冻液', category: 'engine', necessity: 'conditional', intervalKm: 120000, intervalMonth: 120, note: '沃尔沃官方基础保养表未把冷却液列入固定更换周期，属长效冷却液。按冰点与液位检测判断，未见异常时无需按里程更换。' },
      { itemKey: 'transmission_oil', name: '变速箱油', category: 'transmission', necessity: 'conditional', intervalKm: 80000, intervalMonth: 96, note: '爱信 8AT 官方标注长效使用，官方保养表未列固定更换周期。中国城市路况建议 8 万公里做一次油质检测后再决定，不必到店就换。' },
      { itemKey: 'timing_belt', name: '正时皮带', category: 'engine', necessity: 'conditional', intervalKm: 120000, intervalMonth: 144, note: '仅部分带正时皮带的机型（官方表列于第 12 年 / 12 万公里，与辅助皮带同步）。多数在售 Drive-E 为正时链条，无固定更换周期，请先确认自己车辆的配置。' },
      ...wearItems({ brakePadKm: 60000 }),
      ...upsellFuel(),
    ],
  },

  /* ================= 斯巴鲁（水平对置 + 左右对称全时四驱） ================= */
  ruleset_subaru: {
    _id: 'ruleset_subaru',
    name: '斯巴鲁（森林人 / XV / 傲虎 / 力狮）',
    version: 1,
    updatedAt: '2026-08-03',
    source: '斯巴鲁中国官方技术规范（首保 5000 公里/3 个月，之后 5000 公里/6 个月）+ 官方 5 年 7.5 万公里免费基础保养政策',
    manual: {
      title: '斯巴鲁中国官方保养技术规范',
      scope: '适用：斯巴鲁 森林人 / XV / 傲虎 / 力狮 等水平对置发动机 + 左右对称全时四驱车型',
      note: '官方口径：首保 5000 公里或 3 个月，之后每 5000 公里或 6 个月（先到者为准）。周期短于多数同级是斯巴鲁的官方设定，不是门店加码。2020 年 10 月后购车官方提供 5 年 / 7.5 万公里 15 次免费基础保养，机油机滤基本不用自己花钱。',
    },
    items: [
      {
        itemKey: 'engine_oil',
        name: '机油',
        category: 'engine',
        necessity: 'must',
        intervalKm: 5000,
        intervalMonth: 6,
        conditionFactor: { urban: 0.8, shortTrip: 0.7, dusty: 0.8 },
        note: '官方规范每 5000 公里或 6 个月。水平对置发动机气缸横置、机油分布与消耗特性不同于直列机，官方周期本就偏短，不必再自行缩短。',
      },
      { itemKey: 'oil_filter', name: '机油滤清器', category: 'engine', necessity: 'must', intervalKm: 5000, intervalMonth: 6, note: '随机油同步更换，免费基础保养已包含。' },
      { itemKey: 'cabin_filter', name: '空调滤芯', category: 'comfort', necessity: 'must', intervalKm: 10000, intervalMonth: 12, conditionFactor: { dusty: 0.5 }, note: '官方在 1 万公里保养节点更换，属于免费保养范围外的自费项目。' },
      { itemKey: 'air_filter', name: '空气滤清器', category: 'engine', necessity: 'must', intervalKm: 30000, intervalMonth: 36, conditionFactor: { dusty: 0.5 }, note: '每 3 万公里更换；多尘或非铺装路面占比高时提前。' },
      { itemKey: 'fuel_filter', name: '汽油滤清器', category: 'engine', necessity: 'must', intervalKm: 60000, intervalMonth: 72, note: '随 6 万公里大保养更换。' },
      { itemKey: 'spark_plug', name: '火花塞', category: 'engine', necessity: 'must', intervalKm: 60000, intervalMonth: 72, note: '随 6 万公里大保养更换。原厂铱金塞实际寿命可达 10 万公里，出保后可结合缸压与点火状态判断。' },
      { itemKey: 'transmission_oil', name: '变速箱油（林根 CVT）', category: 'transmission', necessity: 'must', intervalKm: 60000, intervalMonth: 72, note: '斯巴鲁 Lineartronic CVT 官方在 6 万公里大保养更换。CVT 对油品衰减敏感，这一项不建议拖。' },
      { itemKey: 'transfer_oil', name: '前后差速器油', category: 'transmission', necessity: 'must', intervalKm: 60000, intervalMonth: 72, note: '左右对称全时四驱特有项目，官方随 6 万公里大保养更换。这是斯巴鲁区别于两驱车的必做项，被推荐时不属于过度保养。' },
      { itemKey: 'brake_fluid', name: '刹车油', category: 'safety', necessity: 'must', intervalKm: null, intervalMonth: 24, note: '按年限每 2 年更换。可先做含水量检测，超过 3% 必须更换。' },
      { itemKey: 'coolant', name: '防冻液', category: 'engine', necessity: 'conditional', intervalKm: 100000, intervalMonth: 96, note: '斯巴鲁超级冷却液（Super Coolant）为长效型，官方无短周期更换要求。按冰点检测判断即可。' },
      { itemKey: 'timing_chain', name: '正时链条', category: 'engine', necessity: 'conditional', intervalKm: null, intervalMonth: null, note: 'FB 系列水平对置发动机为正时链条，正常使用免维护、无固定更换里程。仅 2012 年前的 EJ 系列为正时皮带，需在 8 万公里更换——请先确认自己车辆的发动机型号。' },
      ...wearItems({ brakePadKm: 60000, tireKm: 60000 }),
      ...upsellFuel(),
    ],
  },

  /* ================= 三菱 ================= */
  ruleset_mitsubishi: {
    _id: 'ruleset_mitsubishi',
    name: '三菱（欧蓝德 / 劲炫 ASX）',
    version: 1,
    updatedAt: '2026-08-03',
    source: '三菱汽车官方「メンテナンスサイクル」行驶里程保养周期表 + 国内广汽三菱首保/常规保养口径',
    manual: {
      title: '三菱汽车官方保养周期表',
      scope: '适用：三菱 欧蓝德 / 劲炫 ASX 等 4J / 4B 系列发动机车型',
      note: '官方里程表：机油每 5000 公里，机油滤清器每 1 万公里（即隔次更换）。国内首保为 5000 公里或 6 个月。此前本产品把三菱并入「日系其他」通用桶，本轮按三菱官方保养周期表单独建库。',
    },
    items: [
      { itemKey: 'engine_oil', name: '机油', category: 'engine', necessity: 'must', intervalKm: 5000, intervalMonth: 6, conditionFactor: { urban: 0.8, shortTrip: 0.7, dusty: 0.8 }, note: '官方里程表每 5000 公里更换。使用全合成机油且以中长途为主时，可结合油品说明书适度延长。' },
      { itemKey: 'oil_filter', name: '机油滤清器', category: 'engine', necessity: 'must', intervalKm: 10000, intervalMonth: 12, note: '官方里程表为每 1 万公里，即每两次换机油时更换一次机滤。门店坚持「每次必换机滤」超出了三菱官方要求。' },
      { itemKey: 'cabin_filter', name: '空调滤芯', category: 'comfort', necessity: 'must', intervalKm: 10000, intervalMonth: 12, conditionFactor: { dusty: 0.5 }, note: '官方每 1 万公里更换。' },
      { itemKey: 'air_filter', name: '空气滤清器', category: 'engine', necessity: 'must', intervalKm: 30000, intervalMonth: 36, conditionFactor: { dusty: 0.5 }, note: '官方每 3 万公里更换，同节点还会检查辅助皮带。' },
      { itemKey: 'fuel_filter', name: '汽油滤清器', category: 'engine', necessity: 'must', intervalKm: 40000, intervalMonth: 48, note: '官方每 4 万公里更换。' },
      { itemKey: 'spark_plug', name: '火花塞', category: 'engine', necessity: 'must', intervalKm: 40000, intervalMonth: 48, note: '官方对普通镍合金塞为 2 万公里、铱金/铂金塞为 9 万公里。国内在售车型多为长寿命塞，本产品取 4 万公里作为提醒节点，实际请以随车手册标注的火花塞类型为准。' },
      { itemKey: 'transmission_oil', name: '变速箱油（CVT）', category: 'transmission', necessity: 'must', intervalKm: 40000, intervalMonth: 48, note: '官方在 4 万公里节点更换 A/T 或 CVT 油液。' },
      { itemKey: 'transfer_oil', name: '分动箱 / 差速器油', category: 'transmission', necessity: 'must', intervalKm: 40000, intervalMonth: 48, note: '仅四驱车型需要。官方与变速箱油同节点（4 万公里）更换。两驱车型没有这一项，被推荐时可以直接拒绝。' },
      { itemKey: 'brake_fluid', name: '刹车油', category: 'safety', necessity: 'must', intervalKm: null, intervalMonth: 24, note: '官方按年限，每 2 年更换。' },
      { itemKey: 'coolant', name: '防冻液', category: 'engine', necessity: 'must', intervalKm: null, intervalMonth: 48, note: '官方 LLC 首次 4 年更换，之后每 2 年。日常按冰点检测判断即可。' },
      { itemKey: 'timing_belt', name: '正时皮带', category: 'engine', necessity: 'conditional', intervalKm: 90000, intervalMonth: null, note: '官方里程表把正时皮带列在 9 万公里，但这只适用于皮带机型。国内在售 4J / 4B 系列多为正时链条，免维护——更换前务必确认发动机型号，这是最容易被误导消费的一项。' },
      ...wearItems({ brakePadKm: 60000 }),
      ...upsellFuel(),
    ],
  },

  /* ================= 铃木 ================= */
  ruleset_suzuki: {
    _id: 'ruleset_suzuki',
    name: '铃木（雨燕等小排量自吸）',
    version: 1,
    updatedAt: '2026-08-03',
    source: '长安铃木官方保养手册常规周期（首保 5000 公里，之后 5000 公里/6 个月）',
    manual: {
      title: '铃木随车保养手册（国内在售期口径）',
      scope: '适用：铃木 雨燕 等小排量自然吸气车型',
      note: '铃木已退出中国市场，官方售后网络收缩，但保养周期仍以随车手册为准：机油 5000 公里或 6 个月。小排量自吸结构简单，配件通用性好，出保后在正规连锁店按手册周期保养即可，无需迷信「专修」溢价。',
    },
    items: [
      { itemKey: 'engine_oil', name: '机油', category: 'engine', necessity: 'must', intervalKm: 5000, intervalMonth: 6, conditionFactor: { urban: 0.8, shortTrip: 0.7, dusty: 0.8 }, note: '手册周期 5000 公里或 6 个月。自然吸气发动机机油工况温和，使用全合成机油时可按 7500 公里执行。' },
      { itemKey: 'oil_filter', name: '机油滤清器', category: 'engine', necessity: 'must', intervalKm: 5000, intervalMonth: 6, note: '随机油同步更换。' },
      { itemKey: 'cabin_filter', name: '空调滤芯', category: 'comfort', necessity: 'must', intervalKm: 10000, intervalMonth: 12, conditionFactor: { dusty: 0.5 }, note: '每 1 万公里更换，配件通用件价格低廉，可自行更换。' },
      { itemKey: 'air_filter', name: '空气滤清器', category: 'engine', necessity: 'must', intervalKm: 20000, intervalMonth: 24, conditionFactor: { dusty: 0.5 }, note: '每 2 万公里更换。' },
      { itemKey: 'spark_plug', name: '火花塞', category: 'engine', necessity: 'must', intervalKm: 40000, intervalMonth: 48, note: '自吸机型点火负荷低，约 4 万公里更换一次即可。' },
      { itemKey: 'fuel_filter', name: '汽油滤清器', category: 'engine', necessity: 'conditional', intervalKm: 60000, intervalMonth: 72, note: '雨燕汽油滤为油箱内置式，正常用车条件下无需按里程强制更换，仅在出现供油不畅、抖动时检查。' },
      { itemKey: 'brake_fluid', name: '刹车油', category: 'safety', necessity: 'must', intervalKm: null, intervalMonth: 24, note: '按年限每 2 年更换。' },
      { itemKey: 'coolant', name: '防冻液', category: 'engine', necessity: 'must', intervalKm: 40000, intervalMonth: 48, note: '每 4 万公里或 4 年更换。' },
      { itemKey: 'transmission_oil', name: '变速箱油', category: 'transmission', necessity: 'conditional', intervalKm: 60000, intervalMonth: 72, note: '手动挡与 4AT 结构简单，6 万公里检测油质后决定是否更换。' },
      { itemKey: 'timing_chain', name: '正时链条', category: 'engine', necessity: 'conditional', intervalKm: null, intervalMonth: null, note: 'K 系列发动机为正时链条，设计免维护，无固定更换里程。' },
      ...wearItems({ brakePadKm: 60000 }),
      ...upsellFuel(),
    ],
  },

  /* ================= 名爵 MG（上汽，燃油/混动） ================= */
  ruleset_mg: {
    _id: 'ruleset_mg',
    name: '名爵 MG 燃油 / 混动（MG5 / MG6 / MG7 / ZS / HS）',
    version: 1,
    updatedAt: '2026-08-03',
    source: '上汽 MG 官方保养政策（国内首保 5000 公里，之后 1 万公里/1 年）+ MG 海外官方 Service Schedule（1 年/1.5 万公里）',
    manual: {
      title: '名爵 MG 随车保养手册（上汽乘用车口径）',
      scope: '适用：MG5 / MG6 / MG7 / MG ZS / MG HS 等燃油与油电混动车型',
      note: '国内官方口径：首保 5000 公里或 3 个月，之后使用原厂全合成机油按 1 万公里或 12 个月执行。同代车型在欧洲市场官方间隔为 1 年 / 1.5 万公里（部分车型 2.4 万公里），说明 1 万公里已留有相当余量，门店建议 5000 公里就换机油缺乏官方依据。',
    },
    items: [
      { itemKey: 'engine_oil', name: '机油', category: 'engine', necessity: 'must', intervalKm: 10000, intervalMonth: 12, conditionFactor: { urban: 0.7, shortTrip: 0.6, dusty: 0.8 }, note: '官方 1 万公里或 12 个月，须使用符合规格的全合成机油。首保为 5000 公里或 3 个月，通常免费。' },
      { itemKey: 'oil_filter', name: '机油滤清器', category: 'engine', necessity: 'must', intervalKm: 10000, intervalMonth: 12, note: '随机油同步更换。' },
      { itemKey: 'cabin_filter', name: '空调滤芯', category: 'comfort', necessity: 'must', intervalKm: 20000, intervalMonth: 24, conditionFactor: { dusty: 0.5 }, note: '每 2 万公里或 2 年更换，海外官方保养表同为「每两次保养一次」。' },
      { itemKey: 'air_filter', name: '空气滤清器', category: 'engine', necessity: 'must', intervalKm: 20000, intervalMonth: 24, conditionFactor: { dusty: 0.5 }, note: '每 2 万公里更换。' },
      { itemKey: 'fuel_filter', name: '汽油滤清器', category: 'engine', necessity: 'must', intervalKm: 40000, intervalMonth: 48, note: '每 4 万公里更换。' },
      { itemKey: 'spark_plug', name: '火花塞', category: 'engine', necessity: 'must', intervalKm: 40000, intervalMonth: 48, note: '涡轮机型约 4 万公里，自吸机型可延至 6 万公里。' },
      { itemKey: 'brake_fluid', name: '刹车油', category: 'safety', necessity: 'must', intervalKm: null, intervalMonth: 24, note: '官方按年限每 2 年更换，海外保养表同样为每 2 年。' },
      { itemKey: 'coolant', name: '防冻液', category: 'engine', necessity: 'must', intervalKm: 60000, intervalMonth: 60, note: '约 6 万公里或 5 年更换。' },
      { itemKey: 'transmission_oil', name: '变速箱油', category: 'transmission', necessity: 'must', intervalKm: 60000, intervalMonth: 72, note: '7 速湿式双离合需按里程更换并同步更换滤芯；CVT / AT 车型可先检测油质。' },
      { itemKey: 'timing_chain', name: '正时链条', category: 'engine', necessity: 'conditional', intervalKm: null, intervalMonth: null, note: '上汽蓝芯系列发动机为正时链条，设计免维护、无固定更换里程。' },
      ...wearItems({ brakePadKm: 60000 }),
      ...upsellFuel(),
    ],
  },

  /* ================= 名爵 MG 纯电 ================= */
  ruleset_mg_ev: {
    _id: 'ruleset_mg_ev',
    name: '名爵 MG 纯电（MG4 EV / ES5 / Cyberster）',
    version: 1,
    updatedAt: '2026-08-03',
    source: 'MG 官方 EV Service Schedule（1 年 / 1.5 万公里保养计划，含滤芯、制动液、减速器油、冷却液节点）',
    manual: {
      title: 'MG 纯电车型官方保养计划表',
      scope: '适用：MG4 EV / MG ES5 / MG Cyberster 等上汽纯电平台车型',
      note: '官方保养计划以「1 年 / 1.5 万公里，先到者为准」为一个周期，且大部分周期只做检查、不换件：空调滤芯与制动液每 2 个周期，减速器油第 4 周期，冷却液第 5 周期。纯电车真正需要花钱的项目远少于门店保养套餐里列的条目。',
    },
    items: [
      { itemKey: 'battery', name: '三电系统检查', category: 'electrical', necessity: 'must', intervalKm: 15000, intervalMonth: 12, note: '官方每 1 年或 1.5 万公里做一次整车检查，包含高压系统、电池状态与软件更新，多数周期只检查不换件。' },
      { itemKey: 'cabin_filter', name: '空调滤芯', category: 'comfort', necessity: 'must', intervalKm: 30000, intervalMonth: 24, conditionFactor: { dusty: 0.5 }, note: '官方每 2 个保养周期（约 2 年 / 3 万公里）更换。' },
      { itemKey: 'brake_fluid', name: '刹车油', category: 'safety', necessity: 'must', intervalKm: null, intervalMonth: 24, note: '官方每 2 年更换。纯电车动能回收多、机械制动使用少，但刹车油吸水与行驶方式无关，仍需按年限更换。' },
      { itemKey: 'gear_oil', name: '减速器齿轮油', category: 'transmission', necessity: 'conditional', intervalKm: 90000, intervalMonth: 48, note: '官方安排在第 4 个保养周期（约 6 万英里 / 9 万余公里）。里程未到时更换属于过度保养。' },
      { itemKey: 'coolant', name: '电池 / 电驱冷却液', category: 'engine', necessity: 'conditional', intervalKm: 120000, intervalMonth: 60, note: '官方安排在第 5 个保养周期（约 5 年）。日常只需检查液位与冰点。' },
      ...wearItems({ brakePadKm: 80000, brakePadNote: '纯电车动能回收承担大部分减速，刹车片实际寿命普遍远长于燃油车，8 万至 10 万公里未更换很常见。按厚度检测判断即可。', tireKm: 50000, tireNote: '纯电车整备质量大、起步扭矩高，轮胎磨损快于同级燃油车，建议每 1 万公里做一次四轮换位。' }),
      ...upsellEv(),
    ],
  },

  /* ================= 捷达 JETTA（一汽-大众独立品牌） ================= */
  ruleset_jetta: {
    _id: 'ruleset_jetta',
    name: '捷达 JETTA（VS5 / VS7 / VA3）',
    version: 1,
    updatedAt: '2026-08-03',
    source: '一汽-大众捷达品牌官方保养手册（首保 5000 公里/6 个月，之后全合成 1 万公里/12 个月）',
    manual: {
      title: '捷达品牌随车保养手册（一汽-大众）',
      scope: '适用：捷达 VS5 / VS7 / VA3（EA211 1.4T / 1.5L）',
      note: '官方口径：首保 5000 公里或 6 个月且免费，之后使用原厂全合成机油按 1 万公里或 12 个月执行；若使用矿物质或半合成机油则需缩短到 5000 / 7500 公里。捷达虽为独立品牌，动力总成仍为大众 EA211，保养项目与大众同源但工时与配件价格更低。',
    },
    items: [
      { itemKey: 'engine_oil', name: '机油', category: 'engine', necessity: 'must', intervalKm: 10000, intervalMonth: 12, conditionFactor: { urban: 0.7, shortTrip: 0.6, dusty: 0.8 }, note: '全合成机油按 1 万公里或 12 个月。门店按 5000 公里劝换的前提是矿物质机油，请先确认上次加的是什么油。' },
      { itemKey: 'oil_filter', name: '机油滤清器', category: 'engine', necessity: 'must', intervalKm: 10000, intervalMonth: 12, note: '随机油同步更换，含油底壳螺栓与垫圈。' },
      { itemKey: 'cabin_filter', name: '空调滤芯', category: 'comfort', necessity: 'must', intervalKm: 10000, intervalMonth: 12, conditionFactor: { dusty: 0.5 }, note: '官方每 1 万公里更换，配件价格约 50 元，属低价高频项。' },
      { itemKey: 'air_filter', name: '空气滤清器', category: 'engine', necessity: 'must', intervalKm: 20000, intervalMonth: 24, conditionFactor: { dusty: 0.5 }, note: '官方每 2 万公里更换。' },
      { itemKey: 'spark_plug', name: '火花塞', category: 'engine', necessity: 'must', intervalKm: 20000, intervalMonth: 24, note: 'EA211 涡轮机型官方为 2 万公里更换，周期短于同平台大众车型的 6 万公里口径，是捷达车主容易漏做的一项。' },
      { itemKey: 'fuel_filter', name: '汽油滤清器', category: 'engine', necessity: 'must', intervalKm: 60000, intervalMonth: 72, note: '官方随 6 万公里大保养更换。' },
      { itemKey: 'transmission_oil', name: '变速箱油', category: 'transmission', necessity: 'must', intervalKm: 60000, intervalMonth: 72, note: 'AQ250 6AT 与 DQ200 干式双离合官方均为 6 万公里更换。' },
      { itemKey: 'brake_fluid', name: '刹车油', category: 'safety', necessity: 'must', intervalKm: null, intervalMonth: 24, note: '官方按年限每 2 年更换。' },
      { itemKey: 'coolant', name: '防冻液', category: 'engine', necessity: 'must', intervalKm: 60000, intervalMonth: 60, note: '官方随大保养节点检查更换，日常按液位与冰点判断。' },
      { itemKey: 'timing_belt', name: '正时皮带', category: 'engine', necessity: 'conditional', intervalKm: 120000, intervalMonth: 144, note: 'EA211 采用免维护型正时皮带，官方未给出固定更换里程。仅在出现异响、渗油污染皮带时才需检查更换，门店按 6 万公里推荐更换缺乏官方依据。' },
      ...wearItems({ brakePadKm: 60000 }),
      ...upsellFuel(),
    ],
  },

  /* ================= 捷途（奇瑞 T1X / M3X 平台） ================= */
  ruleset_jetour: {
    _id: 'ruleset_jetour',
    name: '捷途（X70 系列 / 旅行者 / 山海）',
    version: 1,
    updatedAt: '2026-08-03',
    source: '捷途官方保养手册周期表（首保 5000 公里，之后 5000 公里/6 个月；三滤、火花塞、变速箱油节点）',
    manual: {
      title: '捷途随车保养手册（奇瑞捷途）',
      scope: '适用：捷途 X70 PLUS / X90 PLUS / 旅行者 / 山海 等燃油与混动车型',
      note: '官方口径：首保 5000 公里或 6 个月（免费），之后机油机滤每 5000 公里。官方同时说明：使用半合成可放宽至 7500 公里 / 9 个月，全合成可放宽至 1 万公里 / 12 个月——这一条常被门店略过不提。',
    },
    items: [
      { itemKey: 'engine_oil', name: '机油', category: 'engine', necessity: 'must', intervalKm: 5000, intervalMonth: 6, conditionFactor: { urban: 0.8, shortTrip: 0.7, dusty: 0.8 }, note: '官方原厂全合成 SN 5W-30 建议每 5000 公里；官方亦明确全合成机油可执行 1 万公里 / 12 个月。按自己实际用油等级选择，不必一刀切 5000。' },
      { itemKey: 'oil_filter', name: '机油滤清器', category: 'engine', necessity: 'must', intervalKm: 5000, intervalMonth: 6, note: '随机油同步更换。' },
      { itemKey: 'air_filter', name: '空气滤清器', category: 'engine', necessity: 'must', intervalKm: 10000, intervalMonth: 12, conditionFactor: { dusty: 0.5 }, note: '官方每 1 万公里更换。' },
      { itemKey: 'fuel_filter', name: '汽油滤清器', category: 'engine', necessity: 'must', intervalKm: 10000, intervalMonth: 12, note: '官方每 1 万公里更换，这是厂商偏短的口径（多数品牌为 3 万至 6 万公里）。若加油渠道稳定，出保后可按 2 万至 3 万公里执行。' },
      { itemKey: 'cabin_filter', name: '空调滤芯', category: 'comfort', necessity: 'must', intervalKm: 20000, intervalMonth: 24, conditionFactor: { dusty: 0.5 }, note: '官方每 2 万公里更换。' },
      { itemKey: 'spark_plug', name: '火花塞', category: 'engine', necessity: 'must', intervalKm: 30000, intervalMonth: 36, note: '官方每 3 万公里更换。' },
      { itemKey: 'brake_fluid', name: '刹车油', category: 'safety', necessity: 'must', intervalKm: 30000, intervalMonth: 24, note: '官方每 3 万公里或 2 年更换。' },
      { itemKey: 'coolant', name: '防冻液', category: 'engine', necessity: 'must', intervalKm: 30000, intervalMonth: 36, note: '官方每 3 万公里更换，周期偏短。出保后可先做冰点检测再决定。' },
      { itemKey: 'transmission_oil', name: '变速箱油', category: 'transmission', necessity: 'must', intervalKm: 40000, intervalMonth: 48, note: '官方 6 速干式双离合与 7 速湿式双离合均为 4 万公里；湿式双离合需同步更换变速箱油滤芯。' },
      { itemKey: 'timing_chain', name: '正时链条', category: 'engine', necessity: 'conditional', intervalKm: null, intervalMonth: null, note: '奇瑞系发动机为正时链条，官方标注一般免维护，无固定更换里程。仅在冷启动异响、报正时相关故障码时检查。' },
      ...wearItems({ brakePadKm: 40000, brakePadNote: '官方给出的 4 万公里只是参考寿命，实际以厚度检测为准，低于 3mm 再换。', tireKm: 60000 }),
      ...upsellFuel(),
    ],
  },

  /* ================= 岚图 纯电（官方用户手册） ================= */
  ruleset_voyah: {
    _id: 'ruleset_voyah',
    name: '岚图 纯电（追光 / 知音 / 梦想家 EV）',
    version: 1,
    updatedAt: '2026-08-03',
    source: '岚图汽车官方在线用户手册《定期保养》章节 —— 纯电车型保养间隔表',
    manual: {
      title: '岚图汽车官方用户手册 · 定期保养（纯电车型）',
      scope: '适用：岚图 追光 / 知音 / FREE 纯电版 / 梦想家 EV',
      note: '官方保养间隔表原文：磨合保养 6 个月或 5000 公里（免费）；之后 1 年或 1 万公里定期保养；空调滤芯 1 年或 2 万公里；制动液 3 年或 4 万公里；驱动电机齿轮润滑油 4 年或 8 万公里；冷却液 4 年或 8 万公里。表内没有的项目，就是官方不要求做的项目。',
    },
    items: [
      { itemKey: 'battery', name: '三电系统定期检查', category: 'electrical', necessity: 'must', intervalKm: 10000, intervalMonth: 12, note: '官方定期保养间隔为 1 年或 1 万公里（先到者为准），内容是全车检查与三电状态诊断，不涉及更换件。首次为 6 个月 / 5000 公里的免费磨合保养。' },
      { itemKey: 'cabin_filter', name: '空调滤芯', category: 'comfort', necessity: 'must', intervalKm: 20000, intervalMonth: 12, conditionFactor: { dusty: 0.5 }, note: '官方手册：1 年或 2 万公里。这是纯电岚图为数不多需要按周期更换的耗材。' },
      { itemKey: 'brake_fluid', name: '制动液', category: 'safety', necessity: 'must', intervalKm: 40000, intervalMonth: 36, note: '官方手册：3 年或 4 万公里。不满 3 年被推荐更换时可要求先做含水量检测。' },
      { itemKey: 'gear_oil', name: '驱动电机齿轮润滑油', category: 'transmission', necessity: 'must', intervalKm: 80000, intervalMonth: 48, note: '官方手册：4 年或 8 万公里。周期很长，5 万公里内被推荐更换属于过度保养。' },
      { itemKey: 'coolant', name: '冷却液', category: 'engine', necessity: 'must', intervalKm: 80000, intervalMonth: 48, note: '官方手册：4 年或 8 万公里。' },
      ...wearItems({ brakePadKm: 80000, brakePadNote: '官方把刹车片列为检查项而非周期更换项。纯电车动能回收承担大部分减速，刹车片寿命普遍很长，按厚度判断即可。', tireKm: 50000, tireNote: '纯电车整备质量大，轮胎磨损快于同级燃油车，建议每 1 万公里做一次四轮换位。' }),
      ...upsellEv(),
    ],
  },

  /* ================= 岚图 增程 / 混动（官方用户手册） ================= */
  ruleset_voyah_reev: {
    _id: 'ruleset_voyah_reev',
    name: '岚图 增程 / 混动（FREE 增程 / 梦想家增程）',
    version: 1,
    updatedAt: '2026-08-03',
    source: '岚图汽车官方在线用户手册《定期保养》章节 —— 混动车型保养间隔表（动力部分按发动机工作里程）',
    manual: {
      title: '岚图汽车官方用户手册 · 定期保养（混动 / 增程车型）',
      scope: '适用：岚图 FREE 增程版 / 梦想家增程版 等增程式车型',
      note: '官方明确区分两套里程：动力部分（机油、空滤、火花塞）按「发动机工作里程」计算，其他部分（空调滤、制动液、齿轮油、冷却液）按「车辆总行驶里程」计算。日常用电为主的车主，增程器里程远低于总里程，机油完全不必按总里程更换——这是增程车最容易被多收钱的地方。',
    },
    items: [
      { itemKey: 'engine_oil', name: '机油（按增程器工作里程）', category: 'engine', necessity: 'must', intervalKm: 10000, intervalMonth: 12, conditionFactor: { urban: 0.9, shortTrip: 0.8, dusty: 0.9 }, note: '官方：1 年或发动机工作 1 万公里。注意是增程器的工作里程，不是车辆总里程。以纯电通勤为主的车主，往往一年只需按时间做一次。' },
      { itemKey: 'oil_filter', name: '机油滤清器', category: 'engine', necessity: 'must', intervalKm: 10000, intervalMonth: 12, note: '随机油同步更换。' },
      { itemKey: 'air_filter', name: '空气滤清器', category: 'engine', necessity: 'must', intervalKm: 20000, intervalMonth: 12, conditionFactor: { dusty: 0.5 }, note: '官方：1 年或发动机工作 2 万公里。手册另注明每次换机油机滤时需同步清洁空气滤芯（清洁不等于更换）。' },
      { itemKey: 'spark_plug', name: '火花塞', category: 'engine', necessity: 'must', intervalKm: 30000, intervalMonth: null, note: '官方只按发动机工作里程 3 万公里，不设时间要求。增程器工作里程少的车主可以放心不做。' },
      { itemKey: 'cabin_filter', name: '空调滤芯', category: 'comfort', necessity: 'must', intervalKm: 20000, intervalMonth: 12, conditionFactor: { dusty: 0.5 }, note: '官方：1 年或车辆总里程 2 万公里。' },
      { itemKey: 'brake_fluid', name: '制动液', category: 'safety', necessity: 'must', intervalKm: 40000, intervalMonth: 36, note: '官方：3 年或车辆总里程 4 万公里。' },
      { itemKey: 'gear_oil', name: '驱动电机齿轮润滑油', category: 'transmission', necessity: 'must', intervalKm: 80000, intervalMonth: 48, note: '官方：4 年或车辆总里程 8 万公里。' },
      { itemKey: 'coolant', name: '冷却液', category: 'engine', necessity: 'must', intervalKm: 80000, intervalMonth: 48, note: '官方：4 年或车辆总里程 8 万公里。' },
      { itemKey: 'transmission_oil', name: '多模减速器润滑油', category: 'transmission', necessity: 'unnecessary', note: '岚图官方保养间隔表对该项的标注是「免维护」。被推荐更换「变速箱油 / 减速器油」时，可直接对照手册拒绝。' },
      ...wearItems({ brakePadKm: 80000, brakePadNote: '增程车同样以动能回收为主要减速方式，刹车片寿命长于纯燃油车。官方按检查处理，不设固定更换里程。', tireKm: 50000 }),
      ...upsellFuel(),
    ],
  },
};

module.exports = V2_RULESETS;
