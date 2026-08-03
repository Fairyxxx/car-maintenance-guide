// data/rule_sets_cn.js —— 自主品牌专属保养规则集（第三轮拆分）
// 由 data/rule_sets.js 统一 require 并合并导出，对外仍以 rule_sets.js 为单一出口。
//
// 背景：原 ruleset_domestic「自主品牌燃油通用」一桶覆盖 27 款车型，manual 只能标注
// 「非专属手册」，与「每款车型都有符合它的保养计划」的产品目标不符。
// 本文件按厂商官方保养信息表 / 随车保养手册把它拆成 6 套品牌专属规则集：
//   ruleset_gwm      长城系（哈弗 / WEY / 坦克）
//   ruleset_changan  长安（蓝鲸动力）
//   ruleset_chery    奇瑞（瑞虎 / 艾瑞泽 / 欧萌达）
//   ruleset_gac      广汽传祺
//   ruleset_saic     上汽（荣威 / 五菱燃油）
//   ruleset_hongqi   红旗（燃油）
//
// 数据口径：以厂商公布的「保养信息表」为第一优先（●更换 / ○检查 的里程节点），
// 其次为品牌官方保养手册整理稿。自主品牌官方周期普遍短于合资（多为 5000–7500 公里），
// 本产品如实呈现官方周期，并在 note 中说明「质保期内建议遵循，出保后可按油品与工况调整」，
// 既不替厂商放宽，也不替门店加码。
const { upsellFuel } = require('./rule_set_common.js');

// ---------------- 长城系（哈弗 / WEY / 坦克） ----------------
// 依据：长城汽车官方保养信息表（哈弗 H6 第三代 1.5T，5000/10000/16000/22000… 里程节点表）
const RULESET_GWM = {
  _id: 'ruleset_gwm',
  name: '长城保养规则（哈弗 / WEY / 坦克）',
  version: 1,
  updatedAt: '2026-08-03',
  source: '长城汽车官方保养信息表（哈弗 H6 1.5T/2.0T 里程节点表）+ 坦克四驱车型油液周期',
  manual: {
    title: '长城汽车保养信息表（哈弗 / WEY / 坦克）',
    scope: '适用：哈弗 H6 / 大狗 / F7，WEY VV6 / 蓝山（燃油版），坦克 300 等长城系燃油车型',
    note: '长城官方保养表以「首保 5000 公里，之后每 6000 公里或 6 个月」为基准节点，周期短于多数合资品牌。质保期内（3 年/10 万公里）建议按此执行以免影响索赔；出保后可结合机油品质与用车工况适当调整。',
  },
  items: [
    { itemKey: 'engine_oil', name: '机油', category: 'engine', necessity: 'must', intervalKm: 6000, intervalMonth: 6, conditionFactor: { urban: 0.7, shortTrip: 0.6, dusty: 0.8 }, note: '官方节点：首保 5000 公里/6 个月，之后每 6000 公里/6 个月。1.5T/2.0T 直喷涡轮机建议全合成机油。周期偏保守，但质保期内不建议自行延长。' },
    { itemKey: 'oil_filter', name: '机油滤清器', category: 'engine', necessity: 'must', intervalKm: 6000, intervalMonth: 6, note: '随机油同步更换，官方表每次保养均为「●更换」。' },
    { itemKey: 'air_filter', name: '空气滤清器', category: 'engine', necessity: 'must', intervalKm: 12000, intervalMonth: 12, conditionFactor: { dusty: 0.5 }, note: '官方表每 12000 公里/12 个月更换（10000、22000、34000… 节点）。多尘或土路通勤缩短一半。' },
    { itemKey: 'cabin_filter', name: '空调滤芯', category: 'comfort', necessity: 'optional', intervalKm: 12000, intervalMonth: 12, note: '官方与空气滤同节点更换。属于舒适性项目，可自行购买更换，几十元即可搞定。' },
    { itemKey: 'fuel_filter', name: '汽油滤清器', category: 'engine', necessity: 'must', intervalKm: 12000, intervalMonth: 12, note: '长城官方表把汽滤放在 12000 公里节点，周期明显短于多数品牌。长期在正规加油站加油、无供油不畅症状的，出保后可按 2 万公里执行。' },
    { itemKey: 'spark_plug', name: '火花塞', category: 'engine', necessity: 'must', intervalKm: 18000, intervalMonth: 18, note: '官方表节点为 16000、34000、52000…（约每 18000 公里更换），直喷涡轮机火花塞工况苛刻，属正常偏短周期。' },
    { itemKey: 'brake_fluid', name: '刹车油', category: 'safety', necessity: 'conditional', intervalKm: 24000, intervalMonth: 24, note: '官方节点为 22000 公里/24 个月。实际以含水量检测为准，超过 3% 才必须更换，不要仅凭年限盲换。' },
    { itemKey: 'brake_pad', name: '刹车片', category: 'safety', necessity: 'conditional', intervalKm: 40000, intervalMonth: null, conditionFactor: { urban: 0.6 }, note: '无固定更换周期，按厚度判断，剩余小于 3mm 需更换。城市拥堵路况磨损更快。' },
    { itemKey: 'coolant', name: '防冻液', category: 'engine', necessity: 'must', intervalKm: 24000, intervalMonth: 24, note: '官方节点 22000 公里/24 个月，周期偏短。若使用原厂长效冷却液且冰点、pH 检测正常，出保后可延后，但不可混加不同规格。' },
    { itemKey: 'transmission_oil', name: '变速箱油（7DCT 湿式双离合）', category: 'transmission', necessity: 'must', intervalKm: 48000, intervalMonth: 48, note: '官方表在 46000、94000 公里节点标注「●更换」。湿式双离合与油液共用，绝不是终身免维护，按期更换可显著降低顿挫与离合器片磨损。' },
    { itemKey: 'transfer_oil', name: '分动箱油 / 前后桥齿轮油', category: 'transmission', necessity: 'conditional', intervalKm: 60000, intervalMonth: 60, note: '仅四驱车型适用（坦克 300、哈弗 2.0T 四驱等）。非承载式四驱越野后建议提前检查是否进水乳化；两驱车型无此项目，可直接忽略。' },
    { itemKey: 'battery', name: '蓄电池', category: 'electrical', necessity: 'conditional', intervalKm: null, intervalMonth: 48, note: '按启动性能与电压检测判断，一般 3–5 年。带自动启停的车型使用 AGM/EFB 电池，更换时不可用普通电池替代。' },
    { itemKey: 'tire', name: '轮胎', category: 'safety', necessity: 'conditional', intervalKm: 60000, intervalMonth: null, note: '按磨损与老化判断，胎纹低于 1.6mm 或胎侧出现龟裂需更换。' },
    ...upsellFuel(),
  ],
};

// ---------------- 长安（蓝鲸动力） ----------------
// 依据：长安汽车官方保养建议（CS75 PLUS / UNI-V 蓝鲸 1.5T、2.0T 保养周期与大保养节点）
const RULESET_CHANGAN = {
  _id: 'ruleset_changan',
  name: '长安保养规则（蓝鲸动力）',
  version: 1,
  updatedAt: '2026-08-03',
  source: '长安汽车官方保养周期（蓝鲸 1.5T JL473ZQD / 2.0T JL486ZQ5，含 8AT 大保养节点）',
  manual: {
    title: '长安汽车保养手册（蓝鲸动力车型）',
    scope: '适用：长安 CS55 PLUS / CS75 PLUS / UNI-V / 逸动 等蓝鲸系列燃油车型',
    note: '长安官方建议周期为 5000–7500 公里或 6 个月（以先到者为准），首保 5000 公里免费。1.5T 用 5W-30 全合成、2.0T 用 5W-40 或 0W-40 全合成，大保养节点在 6 万公里。',
  },
  items: [
    { itemKey: 'engine_oil', name: '机油', category: 'engine', necessity: 'must', intervalKm: 7500, intervalMonth: 6, conditionFactor: { urban: 0.7, shortTrip: 0.6, dusty: 0.8 }, note: '官方区间 5000–7500 公里/6 个月。首保 5000 公里；使用原厂规格全合成机油、以中长途为主可取上限 7500 公里，频繁短途拥堵取下限。' },
    { itemKey: 'oil_filter', name: '机油滤清器', category: 'engine', necessity: 'must', intervalKm: 7500, intervalMonth: 6, note: '随机油同步更换，不存在「只换油不换滤」的省钱做法。' },
    { itemKey: 'air_filter', name: '空气滤清器', category: 'engine', necessity: 'must', intervalKm: 20000, intervalMonth: 24, conditionFactor: { dusty: 0.5 }, note: '官方每 2 万公里更换。可自行操作，成本低于门店工时费。' },
    { itemKey: 'cabin_filter', name: '空调滤芯', category: 'comfort', necessity: 'optional', intervalKm: 10000, intervalMonth: 12, note: '官方每 1 万公里更换。属于舒适性项目，自行更换难度很低。' },
    { itemKey: 'fuel_filter', name: '汽油滤清器', category: 'engine', necessity: 'conditional', intervalKm: 60000, intervalMonth: 72, note: '蓝鲸机型汽滤多为油箱内置，更换工时较高。官方按大保养节点执行，无供油不畅、抖动症状时不必提前更换。' },
    { itemKey: 'spark_plug', name: '火花塞', category: 'engine', necessity: 'must', intervalKm: 60000, intervalMonth: 72, note: '官方随 6 万公里大保养更换（1.5T 约 400 元、2.0T 约 500 元）。若门店建议 2–3 万公里就换，属于明显提前。' },
    { itemKey: 'brake_fluid', name: '刹车油', category: 'safety', necessity: 'conditional', intervalKm: 40000, intervalMonth: 24, note: '按含水量检测更换，超过 3% 才需更换。检测只需几分钟，不要仅凭年限盲换。' },
    { itemKey: 'brake_pad', name: '刹车片', category: 'safety', necessity: 'conditional', intervalKm: 40000, intervalMonth: null, conditionFactor: { urban: 0.6 }, note: '按厚度判断，剩余小于 3mm 需更换。' },
    { itemKey: 'coolant', name: '防冻液', category: 'engine', necessity: 'must', intervalKm: 60000, intervalMonth: 48, note: '随 6 万公里大保养更换，注意不同规格不可混加。' },
    { itemKey: 'transmission_oil', name: '变速箱油（8AT / 7DCT）', category: 'transmission', necessity: 'must', intervalKm: 60000, intervalMonth: 72, note: '官方大保养节点更换（8AT 约 1000 元）。爱信 8AT 与湿式双离合都需要按期更换，不要相信「终身免维护」的说法。' },
    { itemKey: 'battery', name: '蓄电池', category: 'electrical', necessity: 'conditional', intervalKm: null, intervalMonth: 48, note: '按启动性能与电压检测判断，一般 3–5 年。' },
    { itemKey: 'tire', name: '轮胎', category: 'safety', necessity: 'conditional', intervalKm: 60000, intervalMonth: null, note: '按磨损与老化判断，胎纹低于 1.6mm 或出现龟裂需更换。' },
    ...upsellFuel(),
  ],
};

// ---------------- 奇瑞（瑞虎 / 艾瑞泽 / 欧萌达） ----------------
// 依据：奇瑞随车保养手册整理（瑞虎 8 保养周期表：首保 5000 公里，之后每 5000 公里）
const RULESET_CHERY = {
  _id: 'ruleset_chery',
  name: '奇瑞保养规则（瑞虎 / 艾瑞泽）',
  version: 1,
  updatedAt: '2026-08-03',
  source: '奇瑞随车保养手册整理（瑞虎 8 / 瑞虎 7 / 艾瑞泽系列保养周期表）',
  manual: {
    title: '奇瑞汽车保养手册（瑞虎 / 艾瑞泽系列）',
    scope: '适用：奇瑞 瑞虎 8 / 瑞虎 7 / 艾瑞泽 5 / 欧萌达 等燃油车型（1.5L / 1.5T / 1.6T）',
    note: '奇瑞官方常规保养周期为 5000 公里或 6 个月（以先到者为准），首保 5000 公里免费，原厂机油为 5W-40 全合成。大保养节点在 4 万公里/48 个月。',
  },
  items: [
    { itemKey: 'engine_oil', name: '机油', category: 'engine', necessity: 'must', intervalKm: 5000, intervalMonth: 6, conditionFactor: { urban: 0.7, shortTrip: 0.6, dusty: 0.8 }, note: '官方 5000 公里/6 个月。这是全行业偏保守的周期，原厂已配 5W-40 全合成；质保期内建议遵循，出保后以中长途为主的车主可结合机油品质适当延长。' },
    { itemKey: 'oil_filter', name: '机油滤清器', category: 'engine', necessity: 'must', intervalKm: 5000, intervalMonth: 6, note: '随机油同步更换。' },
    { itemKey: 'air_filter', name: '空气滤清器', category: 'engine', necessity: 'must', intervalKm: 10000, intervalMonth: 12, conditionFactor: { dusty: 0.5 }, note: '官方每 1 万公里更换。多尘环境缩短周期。' },
    { itemKey: 'cabin_filter', name: '空调滤芯', category: 'comfort', necessity: 'optional', intervalKm: 10000, intervalMonth: 12, note: '官方每 1 万公里更换，原厂件约 60 元，自行更换可省工时费。' },
    { itemKey: 'fuel_filter', name: '汽油滤清器', category: 'engine', necessity: 'conditional', intervalKm: 20000, intervalMonth: 24, note: '手册列 1–2 万公里，实际更换取决于油品与车况。长期在正规加油站加油且无供油不畅，可在 2 万公里以上再更换。' },
    { itemKey: 'spark_plug', name: '火花塞', category: 'engine', necessity: 'must', intervalKm: 30000, intervalMonth: 36, note: '官方每 3 万公里更换（原厂约 26 元/个）。' },
    { itemKey: 'brake_fluid', name: '刹车油', category: 'safety', necessity: 'conditional', intervalKm: 40000, intervalMonth: 24, note: '官方 4 万公里节点。实际按含水量检测更换，超过 3% 才必须换。' },
    { itemKey: 'brake_pad', name: '刹车片', category: 'safety', necessity: 'conditional', intervalKm: 40000, intervalMonth: null, conditionFactor: { urban: 0.6 }, note: '按厚度判断，剩余小于 3mm 需更换。' },
    { itemKey: 'coolant', name: '防冻液', category: 'engine', necessity: 'must', intervalKm: 40000, intervalMonth: 48, note: '官方 4 万公里更换，不同颜色规格不可混加。' },
    { itemKey: 'transmission_oil', name: '变速箱油', category: 'transmission', necessity: 'must', intervalKm: 60000, intervalMonth: 72, note: '官方 6 万公里更换（原厂约 90 元/2L）。CVT 与双离合均需按期更换。' },
    { itemKey: 'timing_chain', name: '正时链条', category: 'engine', necessity: 'conditional', intervalKm: null, intervalMonth: null, note: '奇瑞明确正时链条一般免维护，无固定更换里程。仅在冷启动异响、拉长报故障码时才需检查更换，门店按里程主动推荐更换属于过度保养。' },
    { itemKey: 'battery', name: '蓄电池', category: 'electrical', necessity: 'conditional', intervalKm: null, intervalMonth: 48, note: '按启动性能与电压检测判断，一般 3–5 年。' },
    { itemKey: 'tire', name: '轮胎', category: 'safety', necessity: 'conditional', intervalKm: 60000, intervalMonth: null, note: '按磨损与老化判断，胎纹低于 1.6mm 或出现龟裂需更换。' },
    ...upsellFuel(),
  ],
};

// ---------------- 广汽传祺 ----------------
// 依据：广汽传祺随车保养手册整理（GS4 保养周期表：首保 5000 公里/3 个月，之后 1 万公里/6 个月）
const RULESET_GAC = {
  _id: 'ruleset_gac',
  name: '广汽传祺保养规则',
  version: 1,
  updatedAt: '2026-08-03',
  source: '广汽传祺随车保养手册整理（GS4 / M6 / M8 保养周期与里程节点表）',
  manual: {
    title: '广汽传祺保养手册（GS4 / M6 / M8）',
    scope: '适用：广汽传祺 GS4 / M6 / M8 等燃油车型（1.5T / 2.0T）',
    note: '传祺首保为 3 个月或 5000 公里（免费，超期视为脱保），之后每 1 万公里或 6 个月保养一次。传祺手册的汽油滤周期明显短于同级，属于厂商口径。',
  },
  items: [
    { itemKey: 'engine_oil', name: '机油', category: 'engine', necessity: 'must', intervalKm: 10000, intervalMonth: 6, conditionFactor: { urban: 0.7, shortTrip: 0.6, dusty: 0.8 }, note: '首保 5000 公里/3 个月（免费，务必按时做，否则可能失去三包权利）；之后每 1 万公里或 6 个月。' },
    { itemKey: 'oil_filter', name: '机油滤清器', category: 'engine', necessity: 'must', intervalKm: 10000, intervalMonth: 6, note: '随机油同步更换。' },
    { itemKey: 'air_filter', name: '空气滤清器', category: 'engine', necessity: 'must', intervalKm: 20000, intervalMonth: 24, conditionFactor: { dusty: 0.5 }, note: '官方每 2 万公里更换。' },
    { itemKey: 'cabin_filter', name: '空调滤芯', category: 'comfort', necessity: 'optional', intervalKm: 20000, intervalMonth: 12, note: '官方每 2 万公里更换。异味明显或多尘地区可提前，属于自选项目。' },
    { itemKey: 'fuel_filter', name: '汽油滤清器', category: 'engine', necessity: 'must', intervalKm: 10000, intervalMonth: 12, note: '传祺手册标注每 1 万公里或 1 年更换，周期明显短于多数品牌。这是厂商口径而非门店加项，质保期内建议遵循。' },
    { itemKey: 'spark_plug', name: '火花塞', category: 'engine', necessity: 'must', intervalKm: 50000, intervalMonth: 60, note: '官方每 5 万公里更换。若在 2–3 万公里就被建议更换，可要求先做点火状态检测。' },
    { itemKey: 'brake_fluid', name: '刹车油', category: 'safety', necessity: 'conditional', intervalKm: 40000, intervalMonth: 24, note: '官方 4 万公里节点，实际按含水量检测，超过 3% 才需更换。' },
    { itemKey: 'brake_pad', name: '刹车片', category: 'safety', necessity: 'conditional', intervalKm: 40000, intervalMonth: null, conditionFactor: { urban: 0.6 }, note: '按厚度判断，剩余小于 3mm 需更换。' },
    { itemKey: 'coolant', name: '防冻液', category: 'engine', necessity: 'must', intervalKm: 60000, intervalMonth: 24, note: '传祺手册以时间为主（约每 2 年更换）。切勿在冷却液中兑水，会产生水垢堵塞水道。' },
    { itemKey: 'transmission_oil', name: '变速箱油', category: 'transmission', necessity: 'must', intervalKm: 60000, intervalMonth: 72, note: '自动挡首次 6 万公里更换，之后约每 4 万公里；手动挡约 5–10 万公里。' },
    { itemKey: 'timing_chain', name: '正时链条', category: 'engine', necessity: 'conditional', intervalKm: 80000, intervalMonth: null, note: '传祺手册罕见地为正时链条标注了 8 万公里节点。实际仍应以检测为准：无异响、无拉长报警时不必到点就换，可在 8 万公里后每次保养要求检查张紧器状态。' },
    { itemKey: 'battery', name: '蓄电池', category: 'electrical', necessity: 'conditional', intervalKm: null, intervalMonth: 48, note: '按启动性能与电压检测判断，一般 3–5 年。' },
    { itemKey: 'tire', name: '轮胎', category: 'safety', necessity: 'conditional', intervalKm: 60000, intervalMonth: null, note: '按磨损与老化判断，胎纹低于 1.6mm 或出现龟裂需更换。' },
    ...upsellFuel(),
  ],
};

// ---------------- 上汽（荣威 / 五菱燃油） ----------------
// 依据：上汽官方保养周期表（荣威 RX5：首保 3000 公里，之后每 7500 公里）
const RULESET_SAIC = {
  _id: 'ruleset_saic',
  name: '上汽保养规则（荣威 / 五菱燃油）',
  version: 1,
  updatedAt: '2026-08-03',
  source: '上汽官方保养周期表整理（荣威 RX5 / i5 保养节点，五菱燃油车型同体系参考）',
  manual: {
    title: '上汽保养手册（荣威 / 五菱燃油车型）',
    scope: '适用：荣威 i5 / RX5，五菱 星辰 等上汽体系燃油车型',
    note: '上汽体系首保为 3000 公里，之后保养间隔 7500 公里，与多数品牌的 5000 或 10000 公里节奏不同，按手册执行即可，不必被门店改成 5000 公里。',
  },
  items: [
    { itemKey: 'engine_oil', name: '机油', category: 'engine', necessity: 'must', intervalKm: 7500, intervalMonth: 12, conditionFactor: { urban: 0.7, shortTrip: 0.6, dusty: 0.8 }, note: '官方：首保 3000 公里，之后每 7500 公里。原厂为 SN 级 5W-30 全合成机油，1.5T 机型加注量约 6L。' },
    { itemKey: 'oil_filter', name: '机油滤清器', category: 'engine', necessity: 'must', intervalKm: 7500, intervalMonth: 12, note: '随机油同步更换，官方节点一致。' },
    { itemKey: 'air_filter', name: '空气滤清器', category: 'engine', necessity: 'must', intervalKm: 15000, intervalMonth: 24, conditionFactor: { dusty: 0.5 }, note: '官方每 1.5 万公里更换。' },
    { itemKey: 'cabin_filter', name: '空调滤芯', category: 'comfort', necessity: 'optional', intervalKm: 15000, intervalMonth: 12, note: '官方每 1.5 万公里更换，原厂件约 58 元，自行更换即可省下工时费。' },
    { itemKey: 'fuel_filter', name: '汽油滤清器', category: 'engine', necessity: 'must', intervalKm: 30000, intervalMonth: 36, note: '官方每 3 万公里更换（原厂约 62 元/套）。' },
    { itemKey: 'spark_plug', name: '火花塞', category: 'engine', necessity: 'must', intervalKm: 40000, intervalMonth: 48, note: '官方每 4 万公里更换（原厂约 58 元/个，4 个）。' },
    { itemKey: 'brake_fluid', name: '刹车油', category: 'safety', necessity: 'conditional', intervalKm: 40000, intervalMonth: 24, note: '官方 4 万公里节点，实际按含水量检测更换。' },
    { itemKey: 'brake_pad', name: '刹车片', category: 'safety', necessity: 'conditional', intervalKm: 40000, intervalMonth: null, conditionFactor: { urban: 0.6 }, note: '按厚度判断，剩余小于 3mm 需更换。' },
    { itemKey: 'coolant', name: '防冻液', category: 'engine', necessity: 'must', intervalKm: 45000, intervalMonth: 48, note: '官方约 4.5 万公里更换，注意规格不可混加。' },
    { itemKey: 'transmission_oil', name: '变速箱油', category: 'transmission', necessity: 'conditional', intervalKm: 60000, intervalMonth: 72, note: '荣威部分手动变速箱原厂标注「免维护」，自动挡建议 6 万公里检测油质后决定。标注免维护不等于永不更换，高负荷用车仍建议检测。' },
    { itemKey: 'battery', name: '蓄电池', category: 'electrical', necessity: 'conditional', intervalKm: null, intervalMonth: 48, note: '按启动性能与电压检测判断，一般 3–5 年。' },
    { itemKey: 'tire', name: '轮胎', category: 'safety', necessity: 'conditional', intervalKm: 60000, intervalMonth: null, note: '按磨损与老化判断，胎纹低于 1.6mm 或出现龟裂需更换。' },
    ...upsellFuel(),
  ],
};

// ---------------- 红旗（燃油） ----------------
// 依据：红旗官方保养周期（HS5 / H5：首保 5000 公里/3 个月，常规 1 万公里/1 年，6 万公里大保养）
const RULESET_HONGQI = {
  _id: 'ruleset_hongqi',
  name: '红旗保养规则（燃油车型）',
  version: 1,
  updatedAt: '2026-08-03',
  source: '红旗官方保养周期整理（HS5 / H5 / H9 保养节点，含 8AT 与四驱分动箱油）',
  manual: {
    title: '红旗保养手册（H 系 / HS 系燃油车型）',
    scope: '适用：红旗 H5 / H6 / H7 / H9 / HS5 / HS7 / HQ9 等燃油车型（1.5T / 1.8T / 2.0T）',
    note: '红旗官方节奏为「首保 5000 公里/3 个月 → 常规每 1 万公里/1 年 → 2 万公里深度保养 → 6 万公里大保养」。首任车主多享 4 年/10 万公里免费基础保养，首保超期可能影响质保权益。',
  },
  items: [
    { itemKey: 'engine_oil', name: '机油', category: 'engine', necessity: 'must', intervalKm: 10000, intervalMonth: 12, conditionFactor: { urban: 0.7, shortTrip: 0.6, dusty: 0.8 }, note: '官方常规周期 1 万公里/1 年（首保 5000 公里/3 个月）。推荐 ACEA C3 标准 5W-40 全合成机油，北方极寒地区可选 5W-30。频繁短途、拥堵通勤建议缩短 15%。' },
    { itemKey: 'oil_filter', name: '机油滤清器', category: 'engine', necessity: 'must', intervalKm: 10000, intervalMonth: 12, note: '每次换机油必须同步更换，避免旧滤芯污染新机油。' },
    { itemKey: 'air_filter', name: '空气滤清器', category: 'engine', necessity: 'must', intervalKm: 15000, intervalMonth: 24, conditionFactor: { dusty: 0.5 }, note: '官方建议每 1.5 万公里更换；多尘或沙尘路段可提前至 1.2 万公里。' },
    { itemKey: 'cabin_filter', name: '空调滤芯', category: 'comfort', necessity: 'optional', intervalKm: 15000, intervalMonth: 12, note: '官方每 1.5 万公里更换，建议选原厂活性炭滤芯。常载儿童可缩短周期，属于自选项目。' },
    { itemKey: 'fuel_filter', name: '汽油滤清器', category: 'engine', necessity: 'must', intervalKm: 45000, intervalMonth: 24, note: '官方随「深度养护」节点（约 4.5 万公里/2 年）与空气滤、空调滤一并更换。' },
    { itemKey: 'spark_plug', name: '火花塞', category: 'engine', necessity: 'must', intervalKm: 35000, intervalMonth: 48, note: '官方建议 3.5 万公里更换原厂铱金火花塞（2.0T CA4GC20TD）。' },
    { itemKey: 'brake_fluid', name: '刹车油', category: 'safety', necessity: 'conditional', intervalKm: null, intervalMonth: 24, note: '红旗手册按年限要求每 2 年更换。实际可先做含水量检测，超过 3% 必须更换；质保期内建议按手册执行。' },
    { itemKey: 'brake_pad', name: '刹车片', category: 'safety', necessity: 'conditional', intervalKm: 40000, intervalMonth: null, conditionFactor: { urban: 0.6 }, note: '按厚度判断，剩余小于 3mm 需更换；同时检查制动盘平整度。' },
    { itemKey: 'coolant', name: '防冻液', category: 'engine', necessity: 'must', intervalKm: 45000, intervalMonth: 24, note: '官方每 2 年或 4.5 万公里必换，需用红旗原厂长效冷却液，不可混加。' },
    { itemKey: 'transmission_oil', name: '变速箱油（8AT）', category: 'transmission', necessity: 'must', intervalKm: 60000, intervalMonth: 60, note: '官方 6 万公里大保养更换原厂 8AT 专用油。8AT 不存在终身免维护，按期更换可保障高负荷换挡平顺。' },
    { itemKey: 'transfer_oil', name: '分动箱油', category: 'transmission', necessity: 'conditional', intervalKm: 60000, intervalMonth: 60, note: '仅四驱车型适用（HS5 / HS7 四驱等），随 6 万公里大保养一并更换；两驱车型无此项目。' },
    { itemKey: 'battery', name: '蓄电池', category: 'electrical', necessity: 'conditional', intervalKm: null, intervalMonth: 48, note: '按启动性能与电压检测判断，一般 3–5 年。' },
    { itemKey: 'tire', name: '轮胎', category: 'safety', necessity: 'conditional', intervalKm: 60000, intervalMonth: null, note: '按磨损与老化判断；冷态胎压保持 2.3–2.5bar，每 1 万公里做一次轮胎交叉换位可延长寿命。' },
    ...upsellFuel(),
  ],
};

module.exports = {
  ruleset_gwm: RULESET_GWM,
  ruleset_changan: RULESET_CHANGAN,
  ruleset_chery: RULESET_CHERY,
  ruleset_gac: RULESET_GAC,
  ruleset_saic: RULESET_SAIC,
  ruleset_hongqi: RULESET_HONGQI,
};
