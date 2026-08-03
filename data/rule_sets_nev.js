// data/rule_sets_nev.js —— 新能源品牌专属保养规则集（第四轮拆分：纯电 + 增程）
// 由 data/rule_sets.js 统一 require 并合并导出，对外仍以 rule_sets.js 为单一出口。
//
// 背景：第三轮拆完自主燃油通用桶后，全库最大的兜底桶变成了纯电通用 ruleset_ev（22 款车型）
// 与增程通用 ruleset_range_ext（6 款车型），manual 仍标注「非专属手册」。
// 本文件按各品牌官方保养手册 / 官方保养计划表把这两个桶拆成 17 套品牌专属规则集。
//
// 纯电（14 套）：
//   ruleset_nio         蔚来（ES6 / ET5）
//   ruleset_xpeng       小鹏（P7 / G9）
//   ruleset_zeekr       极氪（001）
//   ruleset_xiaomi      小米（SU7）
//   ruleset_leapmotor   零跑（C11 / T03）
//   ruleset_wuling_ev   五菱纯电（宏光MINIEV / 缤果）
//   ruleset_gac_ev      广汽埃安（AION S / AION Y / 合创 Z03）
//   ruleset_gwm_ev      欧拉（好猫）
//   ruleset_changan_ev  长安纯电（糯玉米）
//   ruleset_geely_ev    吉利几何（几何A）
//   ruleset_hongqi_ev   红旗纯电（E-QM5 / E-HS9）
//   ruleset_neta        哪吒（哪吒S / 哪吒V）
//   ruleset_im_ev       智己（L7）
//   ruleset_hiphi       高合（HiPhi X）
// 增程（3 套）：
//   ruleset_lixiang     理想（L7 / L8 / L9）
//   ruleset_aito        问界（M5 / M7）
//   ruleset_deepal      深蓝（SL03 增程版）
//
// 数据口径：以品牌官方保养手册 / 官方 App 维护时间表为第一优先，其次为官方保养计划整理稿。
// 纯电车型的共性：没有机油机滤、火花塞、变速箱油，真正的定期项目只有「空调滤芯 + 刹车油 +
// 减速器齿轮油 + 三电冷却液 + 三电检测」五类。本产品据此把「机油类、燃油系统类」项目
// 全部标为 unnecessary，避免门店按燃油车思路推销。
const { upsellEv, upsellFuel } = require('./rule_set_common.js');

// 纯电共用：三电检测 + 刹车片 + 轮胎（各品牌差异极小，抽出来避免重复）
function evCommonTail(opts) {
  const o = opts || {};
  return [
    { itemKey: 'brake_pad', name: '刹车片', category: 'safety', necessity: 'conditional', intervalKm: o.padKm || 80000, intervalMonth: null, note: o.padNote || '动能回收承担了大部分减速任务，纯电车刹车片寿命普遍是燃油车的 2 倍以上。按厚度判断，剩余小于 3mm 才需更换，不要按里程盲换。' },
    { itemKey: 'battery', name: '动力电池健康检测', category: 'electrical', necessity: 'conditional', intervalKm: o.batteryKm || 20000, intervalMonth: 12, note: o.batteryNote || '随常规保养做一次电池健康度与高压线束检测，属于检测项而非更换项。容量衰减超出质保阈值可走三电质保。' },
    { itemKey: 'tire', name: '轮胎', category: 'safety', necessity: 'conditional', intervalKm: o.tireKm || 60000, intervalMonth: null, note: o.tireNote || '按磨损与老化判断。纯电车整备质量大、起步扭矩高，轮胎磨损普遍快于同级燃油车，建议每 1 万公里做一次四轮换位。' },
  ];
}

// ---------------- 蔚来（ES6 / ET5） ----------------
// 依据：蔚来官方保养手册周期表（首保 5000km/3 个月，常规保养 20000km/12 个月）
const RULESET_NIO = {
  _id: 'ruleset_nio',
  name: '蔚来保养规则（ES6 / ET5）',
  version: 1,
  updatedAt: '2026-08-03',
  source: '蔚来官方《保修/保养手册》周期表 + 蔚来官方保养政策',
  manual: {
    title: '蔚来汽车保修/保养手册',
    scope: '适用：蔚来 ES6 / ET5 等全系纯电车型',
    note: '蔚来官方常规保养间隔为 20000 公里或 12 个月（以先到者为准），首保为 5000 公里或 3 个月。若已购买「服务无忧」套餐，下列常规项目通常已包含在套餐内，到店无需另行付费，请勿被额外加项。',
  },
  items: [
    { itemKey: 'cabin_filter', name: '空调滤芯', category: 'comfort', necessity: 'optional', intervalKm: 20000, intervalMonth: 12, conditionFactor: { dusty: 0.5 }, note: '官方建议每 20000 公里更换。原厂件参考价 200 元出头，第三方品牌件百元内，属于可自行更换的项目。' },
    { itemKey: 'brake_fluid', name: '刹车油', category: 'safety', necessity: 'conditional', intervalKm: 60000, intervalMonth: 24, note: '官方手册标注每 60000 公里更换（部分口径为 4 万公里/2 年）。实际以含水量检测为准，超过 3% 必须更换，未超标时按里程强制更换属于过度保养。' },
    { itemKey: 'coolant', name: '防冻液（三电冷却）', category: 'electrical', necessity: 'must', intervalKm: 80000, intervalMonth: 48, note: '用于电池包与电驱系统散热，规格特殊、不可与燃油车冷却液混加，必须使用原厂指定型号。' },
    { itemKey: 'gear_oil', name: '驱动电机齿轮油', category: 'transmission', necessity: 'conditional', intervalKm: 60000, intervalMonth: 48, note: '官方建议每 60000 公里更换。纯电减速器只有一组固定齿比齿轮，油量少、工况温和，未到里程无需更换。' },
    { itemKey: 'wiper', name: '雨刮片', category: 'comfort', necessity: 'optional', intervalKm: null, intervalMonth: 12, note: '按刮拭效果判断，出现条纹或异响再换即可，无需按里程更换。' },
    ...evCommonTail({ padNote: 'ES6 官方参考更换周期约 40000 公里，但这只是设计寿命参考值，实际以厚度为准。动能回收强度调高的车主，10 万公里未换刹车片的情况很常见。' }),
    ...upsellEv(),
  ],
};

// ---------------- 小鹏（P7 / G9） ----------------
// 依据：小鹏汽车官网《保修/保养手册》+ 官方保养指南（首年 5000km/6 个月，之后 1 万公里/12 个月）
const RULESET_XPENG = {
  _id: 'ruleset_xpeng',
  name: '小鹏保养规则（P7 / G9）',
  version: 1,
  updatedAt: '2026-08-03',
  source: '小鹏汽车官网《保修/保养手册》与官方保养指南（xiaopeng.com/help/baoxiu.html）',
  manual: {
    title: '小鹏汽车保修/保养手册',
    scope: '适用：小鹏 P7 / P7i / G9 / G6 等纯电车型',
    note: '小鹏官方节奏：首年每 5000 公里或 6 个月保养一次（共两次），第二年起改为每 10000 公里或 12 个月一次。可在小鹏 App「服务-预约维保-保养项目」查看每个零件的健康状态（绿/黄/红三色），红色才是必须更换。',
  },
  items: [
    { itemKey: 'cabin_filter', name: '空调滤芯', category: 'comfort', necessity: 'optional', intervalKm: 10000, intervalMonth: 12, conditionFactor: { dusty: 0.5 }, note: '官方建议每 12 个月或 10000 公里更换，是小鹏最主要的定期更换件。可自行购买原厂规格滤芯更换，不影响质保。' },
    { itemKey: 'brake_fluid', name: '刹车油', category: 'safety', necessity: 'conditional', intervalKm: 40000, intervalMonth: 24, note: '官方标注每 24 个月或 40000 公里更换。建议先做含水量检测，超过 3% 再换。' },
    { itemKey: 'gear_oil', name: '减速器油', category: 'transmission', necessity: 'conditional', intervalKm: 40000, intervalMonth: 24, note: '官方与刹车油同节点（24 个月或 40000 公里）。必须使用原厂规格，混用油品可能影响三电质保。' },
    { itemKey: 'coolant', name: '防冻液（三电冷却）', category: 'electrical', necessity: 'must', intervalKm: 80000, intervalMonth: 48, note: '官方建议每 48 个月或 80000 公里更换，用于电池与电驱散热回路。' },
    { itemKey: 'wiper', name: '雨刮片', category: 'comfort', necessity: 'optional', intervalKm: 10000, intervalMonth: 12, note: 'P7 官方把雨刮片与空调滤芯列在同一节点（12 个月或 1 万公里），但实际按刮拭效果判断即可。' },
    ...evCommonTail(),
    ...upsellEv(),
  ],
};

// ---------------- 极氪（001） ----------------
// 依据：极氪官方保养手册（首保 3000km/6 个月，常规 20000km/12 个月）
const RULESET_ZEEKR = {
  _id: 'ruleset_zeekr',
  name: '极氪保养规则（001）',
  version: 1,
  updatedAt: '2026-08-03',
  source: '极氪官方保养手册周期表 + 极氪 App 维保项目说明',
  manual: {
    title: '极氪汽车保养手册',
    scope: '适用：极氪 001 等纯电车型',
    note: '极氪官方常规保养为「2 万公里或 1 年，以先到者为准」，首保为 3000 公里或 6 个月。官方明确里程可略微超出（2 万公里节点上限约 +2000 公里），但时间节点须严格执行，否则可能影响终身质保权益。每年赠送的基础保养券可直接抵扣基础保养费用。',
  },
  items: [
    { itemKey: 'cabin_filter', name: '空调滤芯', category: 'comfort', necessity: 'optional', intervalKm: 20000, intervalMonth: 12, conditionFactor: { dusty: 0.5 }, note: '官方基础保养的核心更换件（CN95 规格），2 万公里/1 年一次。基础保养券通常已覆盖此项费用。' },
    { itemKey: 'brake_fluid', name: '刹车油', category: 'safety', necessity: 'conditional', intervalKm: 60000, intervalMonth: 24, note: '官方在 4 万公里节点安排「检查」、满 2 年或 6 万公里安排更换。以含水量检测结论为准，不要在 2 万公里保养时被顺带加项。' },
    { itemKey: 'gear_oil', name: '减速器（齿轮箱）油', category: 'transmission', necessity: 'conditional', intervalKm: 40000, intervalMonth: 48, note: '官方在 4 万公里保养时更换减速器油与油螺塞垫圈。低于此里程属于加项。' },
    { itemKey: 'coolant', name: '防冻液（三电冷却）', category: 'electrical', necessity: 'must', intervalKm: 80000, intervalMonth: 48, note: '三电冷却回路专用长效冷却液，不可与燃油车冷却液混加。' },
    { itemKey: 'air_suspension', name: '空气悬架检查', category: 'chassis', necessity: 'conditional', intervalKm: 20000, intervalMonth: 12, note: '仅配备空气悬架的车型适用：随常规保养检查气密性与高度传感器标定。属于检查项，无故障不需要做任何「保养套餐」。' },
    ...evCommonTail({ tireNote: '001 车重较大且多为 20–22 寸大轮毂，轮胎属于主要消耗成本。按胎纹深度与老化判断，不要按里程盲换。' }),
    ...upsellEv(),
  ],
};

// ---------------- 小米（SU7） ----------------
// 依据：小米汽车官方保养计划（首保 5000km/3 个月，常规 20000km/12 个月）
const RULESET_XIAOMI = {
  _id: 'ruleset_xiaomi',
  name: '小米汽车保养规则（SU7）',
  version: 1,
  updatedAt: '2026-08-03',
  source: '小米汽车《用户手册》保养计划 + 小米汽车官方售后服务承诺（xiaomiev.com/sales-services）',
  manual: {
    title: '小米汽车用户手册（保养计划）',
    scope: '适用：小米 SU7 全系（标准版 / Pro / Max / Ultra）',
    note: '小米官方统一保养周期为「1 年或 2 万公里，以先到者为准」，首保为 5000 公里或 3 个月且全系免费。官方明确首保只做三电检测、底盘螺栓紧固、刹车片厚度检查、轮胎换位与 OTA 升级，不含任何付费养护套餐——门店推荐的养护套餐可以直接拒绝。',
  },
  items: [
    { itemKey: 'cabin_filter', name: '空调滤芯（HEPA）', category: 'comfort', necessity: 'optional', intervalKm: 20000, intervalMonth: 12, conditionFactor: { dusty: 0.5 }, note: '官方基础保养的主要更换件。原厂 HEPA 滤芯含工时约 128 元，自行网购原厂规格更换几十元即可，不影响质保。' },
    { itemKey: 'air_filter', name: '空气滤清器（座舱进风）', category: 'comfort', necessity: 'optional', intervalKm: 40000, intervalMonth: 24, note: '官方在 4 万公里节点与减速器油一并更换。纯电车没有发动机进气滤，此项仅为座舱/电池进风过滤。' },
    { itemKey: 'brake_fluid', name: '刹车油', category: 'safety', necessity: 'conditional', intervalKm: 60000, intervalMonth: 24, note: '官方安排：2 万公里保养时「检测」，6 万公里时「更换」。检测合格就不用换，这是官方口径，不是省钱技巧。' },
    { itemKey: 'gear_oil', name: '减速器油', category: 'transmission', necessity: 'conditional', intervalKm: 40000, intervalMonth: 48, note: '官方 4 万公里节点更换。必须使用原厂规格，第三方修理厂混用油品会影响三电质保。' },
    { itemKey: 'coolant', name: '电池冷却液', category: 'electrical', necessity: 'must', intervalKm: 80000, intervalMonth: 48, note: '官方 8 万公里节点更换，用于动力电池热管理回路。' },
    { itemKey: 'air_suspension', name: '空气悬架气密性检测', category: 'chassis', necessity: 'conditional', intervalKm: 20000, intervalMonth: 12, note: '仅 Max / Ultra 双腔空气悬架车型适用，官方说明此项已包含在常规保养内、不额外收费。' },
    ...evCommonTail({ padKm: 100000, padNote: '官方与车主实测均显示：辅助驾驶占比高的车辆刹车片磨损极小，行驶 20 万公里仍剩 8mm 的案例存在。低于 3mm 才需更换。' }),
    ...upsellEv(),
  ],
};

// ---------------- 零跑（C11 / T03） ----------------
// 依据：零跑官方保养手册（首保 3000km/3 个月，常规 10000km/12 个月）
const RULESET_LEAPMOTOR = {
  _id: 'ruleset_leapmotor',
  name: '零跑保养规则（C11 / T03）',
  version: 1,
  updatedAt: '2026-08-03',
  source: '零跑汽车官方保养手册周期表（C11 / B01 等车型保养计划）',
  manual: {
    title: '零跑汽车保养手册',
    scope: '适用：零跑 C11 / T03 等纯电车型',
    note: '零跑官方节奏：首保 3000 公里或 3 个月（以常规检查为主），之后每 10000 公里或 12 个月做一次常规检查，涵盖电池、电机、底盘、轮胎与制动系统。',
  },
  items: [
    { itemKey: 'cabin_filter', name: '空调滤芯', category: 'comfort', necessity: 'optional', intervalKm: 10000, intervalMonth: 12, conditionFactor: { dusty: 0.5 }, note: '官方口径为首次 13000 公里更换、之后每 10000 公里一次。可自行更换，成本极低。' },
    { itemKey: 'brake_fluid', name: '刹车油', category: 'safety', necessity: 'conditional', intervalKm: 40000, intervalMonth: 24, note: '官方在首保完成后每 40000 公里更换（部分新车型为 3 万公里）。以含水量检测为准。' },
    { itemKey: 'gear_oil', name: '减速器齿轮油', category: 'transmission', necessity: 'conditional', intervalKm: 40000, intervalMonth: 48, note: '官方与刹车油同节点（首保后每 40000 公里）。' },
    { itemKey: 'coolant', name: '防冻液（三电冷却）', category: 'electrical', necessity: 'must', intervalKm: 60000, intervalMonth: 48, note: '官方每 60000 公里更换，用于电池与电驱冷却回路。' },
    { itemKey: 'air_filter', name: '空气滤清器（座舱进风）', category: 'comfort', necessity: 'optional', intervalKm: 60000, intervalMonth: 48, note: '官方 60000 公里节点。纯电车无发动机进气，此项周期很长，无需按燃油车节奏更换。' },
    ...evCommonTail(),
    ...upsellEv(),
  ],
};

// ---------------- 五菱纯电（宏光MINIEV / 缤果） ----------------
// 依据：五菱官方保养手册（首保 5000km/6 个月，常规 10000km/12 个月）
const RULESET_WULING_EV = {
  _id: 'ruleset_wuling_ev',
  name: '五菱纯电保养规则（宏光MINIEV / 缤果）',
  version: 1,
  updatedAt: '2026-08-03',
  source: '上汽通用五菱官方保养手册（宏光MINIEV 全版本保养周期一致）',
  manual: {
    title: '五菱新能源保养手册（宏光MINIEV / 缤果）',
    scope: '适用：五菱宏光MINIEV（基础款 / 马卡龙 / GAMEBOY）、缤果等微型纯电车',
    note: '官方全版本保养标准统一：首保 5000 公里或 6 个月（免费），之后每 10000 公里或 12 个月做一次基础保养（三电检测 + 底盘检查 + 车机调试）。官方特别说明：长期多尘路段或每天行驶不足 5 公里的超短途通勤，建议缩短至 8000 公里/8 个月。',
  },
  items: [
    { itemKey: 'cabin_filter', name: '空调滤芯', category: 'comfort', necessity: 'optional', intervalKm: 20000, intervalMonth: 18, conditionFactor: { dusty: 0.5 }, note: '官方建议每 20000 公里或 18 个月更换。原厂件 59 元，自行更换十分钟搞定，不必在店里付工时费。' },
    { itemKey: 'brake_fluid', name: '刹车油', category: 'safety', necessity: 'conditional', intervalKm: null, intervalMonth: 24, note: '官方在 1.5 万公里节点安排更换，但微型代步车制动负荷极低，实际以含水量检测为准、通常按 2 年执行即可。' },
    { itemKey: 'gear_oil', name: '减速器（单速变速箱）齿轮油', category: 'transmission', necessity: 'conditional', intervalKm: 20000, intervalMonth: 24, note: '官方节点为 20000 公里或 24 个月，是微型纯电车里少见的偏短周期（多数品牌为 4–6 万公里）。原厂油 40 元/L、用量 4L，属于正常厂商要求，但可对比工时报价。' },
    { itemKey: 'coolant', name: '防冻液（三电冷却）', category: 'electrical', necessity: 'must', intervalKm: 60000, intervalMonth: 48, note: '部分基础版车型采用风冷电池、无冷却液回路，保养时可先确认自己车型是否有此项。' },
    ...evCommonTail({ padKm: 40000, padNote: '微型车整备质量轻，制动负荷小。官方建议 4 万公里检查制动片、制动盘磨损，按厚度更换。', tireKm: 50000, tireNote: '车重轻、轮胎规格小，更换成本低。按胎纹与老化判断。' }),
    ...upsellEv(),
  ],
};

// ---------------- 广汽埃安（AION S / AION Y / 合创 Z03） ----------------
// 依据：广汽埃安官方《定期保养表》（首保 5000km/3 个月，常规 10000km/12 个月）
const RULESET_GAC_EV = {
  _id: 'ruleset_gac_ev',
  name: '埃安保养规则（AION S / AION Y / 合创）',
  version: 1,
  updatedAt: '2026-08-03',
  source: '广汽埃安官方保养手册「定期保养表」+ 埃安官方售后答疑',
  manual: {
    title: '广汽埃安保养手册（定期保养表）',
    scope: '适用：广汽埃安 AION S / AION Y，以及同平台的合创 Z03',
    note: '埃安官方：首保 5000 公里或 3 个月（免费，以检查清洁为主），之后每 10000 公里或 12 个月做一次常规保养。官方售后明确说明「油液更换看车辆状态、行驶里程或使用期限判断」，不是每次保养都要换油液。',
  },
  items: [
    { itemKey: 'cabin_filter', name: '空调滤芯', category: 'comfort', necessity: 'optional', intervalKm: 20000, intervalMonth: 12, conditionFactor: { dusty: 0.5 }, note: '官方每 20000 公里或 12 个月更换，原厂件参考价 210 元。可自行更换，官方明确不影响质保。' },
    { itemKey: 'brake_fluid', name: '刹车油', category: 'safety', necessity: 'conditional', intervalKm: 40000, intervalMonth: 24, note: '官方每 40000 公里或 24 个月更换。以含水量检测为准。' },
    { itemKey: 'coolant', name: '防冻液（三电冷却）', category: 'electrical', necessity: 'must', intervalKm: 40000, intervalMonth: 24, note: '官方每 40000 公里或 24 个月更换，用于电池与集成电驱总成散热。' },
    { itemKey: 'gear_oil', name: '差速器（减速器）齿轮油', category: 'transmission', necessity: 'conditional', intervalKm: 60000, intervalMonth: 36, note: '官方每 60000 公里或 36 个月更换，参考价 500 元/支。未到里程无需更换。' },
    ...evCommonTail({ batteryNote: '官方常规检查包含冷却系统管路与连接部位、集成电力驱动总成安装支架、高压线束检查，属于检测项，工时费约 300 元。' }),
    ...upsellEv(),
  ],
};

// ---------------- 欧拉（好猫） ----------------
// 依据：欧拉官方保养政策（oraev.com/keep：首保 6 个月/5000km，间隔 12 个月/1 万公里）
const RULESET_GWM_EV = {
  _id: 'ruleset_gwm_ev',
  name: '欧拉保养规则（好猫）',
  version: 1,
  updatedAt: '2026-08-03',
  source: '欧拉汽车官网保养服务政策（oraev.com/keep）+ 长城新能源保养口径',
  manual: {
    title: '欧拉保养服务政策（长城新能源）',
    scope: '适用：欧拉好猫 / 芭蕾猫 等欧拉品牌纯电车型',
    note: '欧拉官方明示：全系提供一次免费保养，首保 6 个月或 5000 公里，之后保养间隔为 12 个月或 10000 公里。保养提醒会通过车联网与长城汽车 App 推送，配件价格可在官网查询，可据此核对门店报价。',
  },
  items: [
    { itemKey: 'cabin_filter', name: '空调滤芯', category: 'comfort', necessity: 'optional', intervalKm: 10000, intervalMonth: 12, conditionFactor: { dusty: 0.5 }, note: '随常规保养节点更换，是欧拉最主要的定期更换件。官网可查原厂件价格，避免门店溢价。' },
    { itemKey: 'brake_fluid', name: '刹车油', category: 'safety', necessity: 'conditional', intervalKm: 40000, intervalMonth: 24, note: '按含水量检测更换，超过 3% 才需更换。' },
    { itemKey: 'gear_oil', name: '减速器齿轮油', category: 'transmission', necessity: 'conditional', intervalKm: 60000, intervalMonth: 48, note: '长城新能源口径约 6 万公里更换，未到里程无需更换。' },
    { itemKey: 'coolant', name: '防冻液（三电冷却）', category: 'electrical', necessity: 'must', intervalKm: 60000, intervalMonth: 48, note: '电池与电驱冷却回路专用，不可与燃油车冷却液混加。' },
    ...evCommonTail({ tireKm: 50000 }),
    ...upsellEv(),
  ],
};

// ---------------- 长安纯电（糯玉米 / Lumin） ----------------
// 依据：长安新能源官方维护时间表（首保 5000km/3 个月换减速器油，例保 1 万公里/12 个月）
const RULESET_CHANGAN_EV = {
  _id: 'ruleset_changan_ev',
  name: '长安纯电保养规则（糯玉米 / Lumin）',
  version: 1,
  updatedAt: '2026-08-03',
  source: '长安新能源官方 App「用车指南-维护及自助」维护时间表（与深蓝纯电版同源口径）',
  manual: {
    title: '长安新能源维护时间表',
    scope: '适用：长安糯玉米（Lumin）等长安纯电车型',
    note: '长安新能源官方：首保 3 个月或 5000 公里（检查车身、底盘及三电系统，并更换减速器油），例保为每 12 个月或 10000 公里。注意长安冷却液口径明显短于同行（2 万公里），属厂商偏保守要求。',
  },
  items: [
    { itemKey: 'cabin_filter', name: '空调滤芯', category: 'comfort', necessity: 'optional', intervalKm: 15000, intervalMonth: 12, conditionFactor: { dusty: 0.5 }, note: '官方首次在 15000 公里节点更换，之后按年更换即可。微型代步车用车环境简单，可按实际气味与灰尘判断。' },
    { itemKey: 'brake_fluid', name: '刹车油', category: 'safety', necessity: 'conditional', intervalKm: 40000, intervalMonth: 24, note: '官方建议每 40000 公里更换，以含水量检测为准。' },
    { itemKey: 'gear_oil', name: '减速器油', category: 'transmission', necessity: 'conditional', intervalKm: 60000, intervalMonth: 48, note: '官方首保时更换一次（新车磨合铁屑），之后每 60000 公里更换。这是长安体系的特有安排，不是门店加项。' },
    { itemKey: 'coolant', name: '防冻液（三电冷却）', category: 'electrical', necessity: 'must', intervalKm: 20000, intervalMonth: 24, note: '长安官方口径为每 20000 公里更换，明显短于行业普遍的 6–8 万公里。质保期内建议遵循，出保后可结合冰点与 pH 检测判断。' },
    ...evCommonTail({ padKm: 50000, tireKm: 50000 }),
    ...upsellEv(),
  ],
};

// ---------------- 吉利几何（几何A） ----------------
// 依据：吉利几何《保养手册》（首保 5000km/3 个月，常规 1 万公里/12 个月）
const RULESET_GEELY_EV = {
  _id: 'ruleset_geely_ev',
  name: '几何保养规则（几何A）',
  version: 1,
  updatedAt: '2026-08-03',
  source: '吉利几何《保养手册》保修与定期保养条款 + 官方配件更换周期表',
  manual: {
    title: '吉利几何保养手册',
    scope: '适用：几何 A / 几何 C 等吉利几何品牌纯电车型',
    note: '几何官方：首保 5000 公里或 3 个月（厂家免费，逾期转为有偿），之后每 12 个月或 10000 公里保养一次。整车包修 4 年或 15 万公里，三电核心零部件 8 年或 15 万公里。',
  },
  items: [
    { itemKey: 'cabin_filter', name: '空调滤芯', category: 'comfort', necessity: 'optional', intervalKm: 10000, intervalMonth: 12, conditionFactor: { dusty: 0.5 }, note: '官方每 10000 公里更换，原厂件参考价 169 元。属于可自行更换的舒适性项目。' },
    { itemKey: 'brake_fluid', name: '刹车油', category: 'safety', necessity: 'conditional', intervalKm: 30000, intervalMonth: 24, note: '官方每 30000 公里或 2 年更换，参考价 160 元。以含水量检测为准。' },
    { itemKey: 'coolant', name: '防冻液（电池冷却）', category: 'electrical', necessity: 'must', intervalKm: 30000, intervalMonth: 36, note: '官方每 30000 公里更换（部分资料标注电池冷却液 2 万公里），参考价约 200 元。' },
    { itemKey: 'gear_oil', name: '主减速器齿轮油', category: 'transmission', necessity: 'conditional', intervalKm: 50000, intervalMonth: 48, note: '官方口径：首次约 10000 公里更换（新车磨合），之后每 50000 公里，参考价 353 元。首次更换属于厂商安排，非门店加项。' },
    ...evCommonTail({ tireKm: 50000 }),
    ...upsellEv(),
  ],
};

// ---------------- 红旗纯电（E-QM5 / E-HS9） ----------------
// 依据：一汽红旗新能源官方保养周期（每 1 万公里/12 个月基础保养）
const RULESET_HONGQI_EV = {
  _id: 'ruleset_hongqi_ev',
  name: '红旗纯电保养规则（E-QM5 / E-HS9）',
  version: 1,
  updatedAt: '2026-08-03',
  source: '一汽红旗新能源官方保养周期表（E-QM5 / E-HS9 保养项目与配件周期）',
  manual: {
    title: '一汽红旗新能源保养手册',
    scope: '适用：红旗 E-QM5 / E-HS9 等红旗纯电车型',
    note: '红旗官方：首保 5000 公里或 3 个月（免费），之后每 10000 公里或 12 个月做一次基础保养，主要为三电与底盘检测，工时费约 120 元。部分购车政策含 4 年/10 万公里内多次免费保养，去店前先确认自己的权益，避免重复付费。',
  },
  items: [
    { itemKey: 'cabin_filter', name: '空调滤芯', category: 'comfort', necessity: 'optional', intervalKm: 20000, intervalMonth: 12, conditionFactor: { dusty: 0.5 }, note: '官方每 20000 公里更换（部分口径 1 万公里），与齿轮油同节点计费约 403 元。属于可自行更换项目。' },
    { itemKey: 'brake_fluid', name: '刹车油', category: 'safety', necessity: 'conditional', intervalKm: 30000, intervalMonth: 24, note: '官方每 30000 公里更换，参考价 258 元。以含水量检测为准。' },
    { itemKey: 'gear_oil', name: '减速器齿轮油', category: 'transmission', necessity: 'conditional', intervalKm: 20000, intervalMonth: 36, note: '红旗官方把齿轮油放在 20000 公里节点，周期短于多数纯电品牌（普遍 6 万公里）。质保期内建议遵循，出保后可与技师确认油品状态再决定。' },
    { itemKey: 'coolant', name: '防冻液（三电冷却）', category: 'electrical', necessity: 'must', intervalKm: 60000, intervalMonth: 48, note: '官方每 60000 公里更换，参考价 178 元。' },
    ...evCommonTail({ tireNote: 'E-HS9 为大型 SUV、整备质量大，轮胎与制动件磨损快于 E-QM5，按实际磨损判断。' }),
    ...upsellEv(),
  ],
};

// ---------------- 哪吒（哪吒S / 哪吒V） ----------------
// 依据：哪吒汽车官方保养手册（纯电每 1 万公里常规检查，2 万公里换减速器齿轮油）
const RULESET_NETA = {
  _id: 'ruleset_neta',
  name: '哪吒保养规则（哪吒S / 哪吒V）',
  version: 1,
  updatedAt: '2026-08-03',
  source: '哪吒汽车官方保养手册周期与项目表（纯电车型）',
  manual: {
    title: '哪吒汽车保养手册',
    scope: '适用：哪吒 S / 哪吒 V / 哪吒 U 等纯电车型',
    note: '哪吒官方：首保 5000 公里或 3 个月，之后每 10000 公里做一次常规检查（三电系统诊断、高压接插件检测、底盘紧固）。官方明确空调滤芯、空气滤芯、玻璃水等易损件可自行更换，不影响质保。',
  },
  items: [
    { itemKey: 'cabin_filter', name: '空调滤芯', category: 'comfort', necessity: 'optional', intervalKm: 20000, intervalMonth: 12, conditionFactor: { dusty: 0.5 }, note: '官方每 20000 公里更换。原厂件约 80 元，自行更换可省下约 50 元工时费。' },
    { itemKey: 'gear_oil', name: '减速器齿轮油', category: 'transmission', necessity: 'conditional', intervalKm: 20000, intervalMonth: 36, note: '官方在 20000 公里节点更换（约 200 元），周期偏短于行业平均，属厂商保守口径。' },
    { itemKey: 'brake_fluid', name: '刹车油', category: 'safety', necessity: 'conditional', intervalKm: 40000, intervalMonth: 24, note: '按含水量检测更换，超过 3% 才需更换。' },
    { itemKey: 'coolant', name: '防冻液（三电冷却）', category: 'electrical', necessity: 'must', intervalKm: 60000, intervalMonth: 48, note: '电池与电驱冷却回路专用，按官方周期更换、不可混加。' },
    ...evCommonTail({ batteryKm: 40000, batteryNote: '官方在 40000 公里节点安排电池均衡性检查；日常可用 FOTA 远程诊断解决多数软件问题，减少无谓进店。' }),
    ...upsellEv(),
  ],
};

// ---------------- 智己（L7） ----------------
// 依据：智己官方保养手册（1 年或 2 万公里，首保 6 个月/5000km 仅换空调滤芯）
const RULESET_IM_EV = {
  _id: 'ruleset_im_ev',
  name: '智己保养规则（L7）',
  version: 1,
  updatedAt: '2026-08-03',
  source: '智己汽车官方保养手册周期表 + 智己 App 保养明细',
  manual: {
    title: '智己汽车保养手册',
    scope: '适用：智己 L7 / LS7 等智己纯电车型',
    note: '智己官方保养间隔为「1 年或 2 万公里，以先到者为准」，并允许提前 3 个月或 5000 公里进行。官方手册明确首保（6 个月或 5000 公里）只需更换空调滤芯，费用约 190 元——如果门店在首保时推荐其他项目，可对照手册拒绝。',
  },
  items: [
    { itemKey: 'cabin_filter', name: '空调滤芯（花粉过滤器）', category: 'comfort', necessity: 'optional', intervalKm: 20000, intervalMonth: 12, conditionFactor: { dusty: 0.5 }, note: '官方首保与每次常规保养的唯一固定更换件。可选符合原厂标准的第三方配件自行更换，成本可降低约一半。' },
    { itemKey: 'gear_oil', name: '减速器（齿轮）油', category: 'transmission', necessity: 'conditional', intervalKm: 40000, intervalMonth: 24, note: '官方每 40000 公里或 2 年更换。智己为固定齿比减速器，无复杂机械结构，未到节点无需更换。' },
    { itemKey: 'brake_fluid', name: '刹车油', category: 'safety', necessity: 'conditional', intervalKm: null, intervalMonth: 24, note: '官方按 2 年周期要求。实际以含水量检测为准，未超标可延后。' },
    { itemKey: 'coolant', name: '防冻液（三电冷却）', category: 'electrical', necessity: 'must', intervalKm: 40000, intervalMonth: 48, note: '官方要求每 2 年或 4 万公里更换电池冷却液，用于上汽时代电芯的液冷回路。' },
    ...evCommonTail({ padNote: '智己采用双叉臂+多连杆悬挂并配热泵空调，官方称磨损件更换周期较燃油车延长 30% 以上。刹车片按厚度判断即可。' }),
    ...upsellEv(),
  ],
};

// ---------------- 高合（HiPhi X） ----------------
const RULESET_HIPHI = {
  _id: 'ruleset_hiphi',
  name: '高合保养规则（HiPhi X）',
  version: 1,
  updatedAt: '2026-08-03',
  source: '高合汽车保养周期整理（豪华纯电平台，1 年或 2 万公里口径）',
  manual: {
    title: '高合汽车保养参考（品牌服务网络已收缩）',
    scope: '适用：高合 HiPhi X / HiPhi Z',
    note: '高合品牌经营已发生重大变化、官方服务网络大幅收缩，官方保养手册获取困难。本页按高端纯电平台通行周期（1 年或 2 万公里）整理，仅作参考。建议优先联系尚在运营的授权服务点或专修厂确认；空气悬架、主动式车门等特有部件请务必找有原厂诊断设备的门店，不要在普通快修店拆装。',
  },
  items: [
    { itemKey: 'cabin_filter', name: '空调滤芯', category: 'comfort', necessity: 'optional', intervalKm: 20000, intervalMonth: 12, conditionFactor: { dusty: 0.5 }, note: '高端纯电通行周期，可自行更换或由专修厂代换。' },
    { itemKey: 'brake_fluid', name: '刹车油', category: 'safety', necessity: 'conditional', intervalKm: 40000, intervalMonth: 24, note: '以含水量检测为准，超过 3% 必须更换。' },
    { itemKey: 'gear_oil', name: '减速器齿轮油', category: 'transmission', necessity: 'conditional', intervalKm: 60000, intervalMonth: 48, note: '纯电减速器通行周期约 6 万公里。' },
    { itemKey: 'coolant', name: '防冻液（三电冷却）', category: 'electrical', necessity: 'must', intervalKm: 60000, intervalMonth: 48, note: '电池与电驱冷却回路，需使用原厂规格。备件供应紧张时应提前预约。' },
    { itemKey: 'air_suspension', name: '空气悬架检查', category: 'chassis', necessity: 'conditional', intervalKm: 20000, intervalMonth: 12, note: 'HiPhi X 标配空气悬架，建议随年检做一次气密性与高度传感器检查。此项属检查，无异常不需更换部件。' },
    ...evCommonTail({ tireNote: 'HiPhi X 车重超过 2.5 吨且轮毂尺寸大，轮胎属主要消耗成本，注意胎压与磨损均匀度。' }),
    ...upsellEv(),
  ],
};

// ---------------- 理想（L7 / L8 / L9，增程） ----------------
// 依据：理想汽车官方保养说明（增程器小保养 1 年/1 万公里，大保养 2 年/2 万公里）
const RULESET_LIXIANG = {
  _id: 'ruleset_lixiang',
  name: '理想保养规则（L7 / L8 / L9）',
  version: 1,
  updatedAt: '2026-08-03',
  source: '理想汽车官方社区保养说明（lixiang.com 官方问答：增程器大/小保养周期定义）',
  manual: {
    title: '理想汽车保养手册（增程器大/小保养）',
    scope: '适用：理想 L7 / L8 / L9 / ONE 等增程车型',
    note: '理想官方把保养分成两级：增程器小保养 = 更换机油、机滤，每 1 年或增程器工作 10000 公里；增程器大保养 = 机油、机滤 + 空气滤芯，每 2 年或增程器工作 20000 公里。官方明确「第一年做小保养、第二年做大保养，不需要重复做」。注意周期按增程器工作里程计，纯电通勤为主的车主实际到店频率更低。',
  },
  items: [
    { itemKey: 'engine_oil', name: '增程器机油', category: 'engine', necessity: 'must', intervalKm: 10000, intervalMonth: 12, conditionFactor: { urban: 0.85, shortTrip: 0.8 }, note: '官方小保养项目：每 1 年或增程器工作 10000 公里。若你长期用电、增程器很少启动，按时间（1 年）执行即可，不必按整车总里程提前更换。' },
    { itemKey: 'oil_filter', name: '机油滤清器', category: 'engine', necessity: 'must', intervalKm: 10000, intervalMonth: 12, note: '与机油同步更换，官方小保养已包含。' },
    { itemKey: 'air_filter', name: '空气滤清器', category: 'engine', necessity: 'must', intervalKm: 20000, intervalMonth: 24, conditionFactor: { dusty: 0.5 }, note: '官方大保养项目：每 2 年或增程器工作 20000 公里，与机油机滤一并更换。小保养年份不需要单独换。' },
    { itemKey: 'cabin_filter', name: '空调滤芯', category: 'comfort', necessity: 'optional', intervalKm: 20000, intervalMonth: 12, note: '按整车行驶里程计，与增程器工作里程无关。属于可自行更换的舒适性项目。' },
    { itemKey: 'brake_fluid', name: '刹车油', category: 'safety', necessity: 'conditional', intervalKm: 60000, intervalMonth: 36, note: '增程车动能回收强，制动系统负荷低。以含水量检测为准，不要按年限盲换。' },
    { itemKey: 'coolant', name: '防冻液（增程器 + 三电）', category: 'engine', necessity: 'must', intervalKm: 100000, intervalMonth: 48, note: '增程器回路与三电回路规格不同、不可混加，必须使用原厂指定型号。' },
    { itemKey: 'spark_plug', name: '火花塞', category: 'engine', necessity: 'must', intervalKm: 40000, intervalMonth: 48, note: '按增程器工作里程计。增程器多在高效稳定转速区间运行，火花塞工况优于普通燃油车。' },
    { itemKey: 'gear_oil', name: '减速器油', category: 'transmission', necessity: 'conditional', intervalKm: 100000, intervalMonth: 60, note: '增程车无传统变速箱，前后电机减速器齿轮油周期很长，未到节点无需更换。' },
    { itemKey: 'brake_pad', name: '刹车片', category: 'safety', necessity: 'conditional', intervalKm: 60000, intervalMonth: null, note: '动能回收承担大部分减速，磨损远低于同尺寸燃油 SUV。按厚度判断。' },
    { itemKey: 'battery', name: '三电系统检测', category: 'electrical', necessity: 'conditional', intervalKm: 20000, intervalMonth: 12, note: '随年度保养检测电池、电机、电控状态，属于检测项。' },
    { itemKey: 'tire', name: '轮胎', category: 'safety', necessity: 'conditional', intervalKm: 60000, intervalMonth: null, note: '理想 L 系列整备质量普遍超过 2.3 吨，轮胎磨损快于同尺寸燃油 SUV，建议定期做四轮换位。' },
    { itemKey: 'fuel_filter', name: '汽油滤清器', category: 'engine', necessity: 'conditional', intervalKm: 100000, intervalMonth: 96, note: '增程器油耗低、燃油系统负荷小，官方未列入常规更换节点。出现供油异常再检查即可。' },
    ...upsellFuel(),
  ],
};

// ---------------- 问界（M5 / M7，增程） ----------------
// 依据：AITO 问界官方保养周期表（首保 3 个月/增程器 3000km/总里程 5000km）
const RULESET_AITO = {
  _id: 'ruleset_aito',
  name: '问界保养规则（M5 / M7）',
  version: 1,
  updatedAt: '2026-08-03',
  source: 'AITO 问界官方保养周期表（增程器机油、火花塞、制动液、减速器油等分项周期）',
  manual: {
    title: 'AITO 问界保养手册',
    scope: '适用：问界 M5 / M7 增程版',
    note: '问界官方把项目拆成「按整车里程」与「按增程器工作里程」两套口径：整车保养为每 1 年或行驶 10000 公里；增程器机油机滤为每 1 年或增程器工作 10000 公里。以电为主的用户，增程器项目实际会明显延后，不要按整车里程被提前叫去换机油。',
  },
  items: [
    { itemKey: 'engine_oil', name: '增程器机油', category: 'engine', necessity: 'must', intervalKm: 10000, intervalMonth: 12, conditionFactor: { urban: 0.85, shortTrip: 0.8 }, note: '官方：首保在提车 3 个月/增程器工作 3000 公里/总里程 5000 公里（先到为准），之后每 1 年或增程器工作 10000 公里。机油规格为 API SN 及以上、0W-20 / 5W-30。' },
    { itemKey: 'oil_filter', name: '机油滤清器', category: 'engine', necessity: 'must', intervalKm: 10000, intervalMonth: 12, note: '与机油同步更换，官方每次机油保养必换。' },
    { itemKey: 'air_filter', name: '空气滤清器', category: 'engine', necessity: 'must', intervalKm: 20000, intervalMonth: 24, conditionFactor: { dusty: 0.5 }, note: '官方：每 1 年或增程器工作 1 万公里「检查清洁」，每 2 年或增程器工作 2 万公里才「更换」。清洁节点被当成更换来收费是常见加项。' },
    { itemKey: 'cabin_filter', name: '空调滤芯', category: 'comfort', necessity: 'optional', intervalKm: 20000, intervalMonth: 12, note: '官方每 1 年或行驶 20000 公里更换（按整车里程），单次含工时约 450 元的保养里主要就是这一项。' },
    { itemKey: 'spark_plug', name: '火花塞', category: 'engine', necessity: 'must', intervalKm: 30000, intervalMonth: 36, note: '官方每 3 年或增程器工作 30000 公里更换。' },
    { itemKey: 'brake_fluid', name: '制动液', category: 'safety', necessity: 'conditional', intervalKm: 60000, intervalMonth: 36, note: '官方每 3 年或行驶 60000 公里更换（30000 公里保养含此项的报价属提前安排）。以含水量检测为准。' },
    { itemKey: 'coolant', name: '防冻液（增程器 + 电池）', category: 'engine', necessity: 'must', intervalKm: 100000, intervalMonth: 48, note: '官方：增程器冷却液与动力电池冷却液均为每 4 年或行驶 100000 公里更换。两套回路规格不同，不可混加。' },
    { itemKey: 'gear_oil', name: '减速器润滑油', category: 'transmission', necessity: 'conditional', intervalKm: 100000, intervalMonth: 60, note: '官方每 5 年或行驶 100000 公里更换。远早于此的更换建议属过度保养。' },
    { itemKey: 'brake_pad', name: '刹车片', category: 'safety', necessity: 'conditional', intervalKm: 60000, intervalMonth: null, note: '按厚度判断，动能回收使实际寿命远长于燃油车。' },
    { itemKey: 'battery', name: '三电系统检测', category: 'electrical', necessity: 'conditional', intervalKm: 20000, intervalMonth: 12, note: '随年度常规维护检查电池、电机、电控与高压线束。三电质保为 8 年或 16 万公里。' },
    { itemKey: 'tire', name: '轮胎', category: 'safety', necessity: 'conditional', intervalKm: 60000, intervalMonth: null, note: '按磨损与老化判断，M7 车重较大，注意四轮磨损均匀度。' },
    { itemKey: 'fuel_filter', name: '汽油滤清器', category: 'engine', necessity: 'conditional', intervalKm: 100000, intervalMonth: 96, note: '增程器燃油系统负荷低，官方未列入常规更换节点，出现供油异常再检查。' },
    { itemKey: 'wiper', name: '雨刮片', category: 'comfort', necessity: 'optional', intervalKm: null, intervalMonth: 12, note: '官方标注每 1 年或橡胶损坏时更换，按刮拭效果判断即可。' },
    ...upsellFuel(),
  ],
};

// ---------------- 深蓝（SL03 增程版） ----------------
// 依据：深蓝汽车 App「用车指南-维护及自助」官方维护时间表（增程版按发动机燃油里程计）
const RULESET_DEEPAL = {
  _id: 'ruleset_deepal',
  name: '深蓝保养规则（SL03 增程）',
  version: 1,
  updatedAt: '2026-08-03',
  source: '深蓝汽车 App「用车指南 → 维护及自助」官方维护时间表（增程版 / 纯电版分列）',
  manual: {
    title: '深蓝汽车维护时间表（增程版）',
    scope: '适用：深蓝 SL03 增程版（纯电版请对照官方纯电维护表）',
    note: '深蓝官方增程版口径非常明确：首保 3 个月或 5000 公里（更换减速器油 + 机油机滤）；例保每 12 个月或 10000 公里。关键区别是——机油、机滤、空气滤、火花塞、燃油滤全部按「发动机燃油里程」而非整车总里程计算。以电为主的车主，这些项目会比总里程节点晚很多，被按总里程叫去换机油就是加项。',
  },
  items: [
    { itemKey: 'engine_oil', name: '增程器机油', category: 'engine', necessity: 'must', intervalKm: 10000, intervalMonth: 12, conditionFactor: { urban: 0.85, shortTrip: 0.8 }, note: '官方：按发动机燃油里程每 10000 公里或每 12 个月更换（先到为准）。注意是燃油里程，不是整车总里程。' },
    { itemKey: 'oil_filter', name: '机油滤清器', category: 'engine', necessity: 'must', intervalKm: 10000, intervalMonth: 12, note: '与机油同步更换。' },
    { itemKey: 'air_filter', name: '空气滤清器芯体', category: 'engine', necessity: 'must', intervalKm: 15000, intervalMonth: 12, conditionFactor: { dusty: 0.5 }, note: '官方：按发动机燃油里程每 15000 公里或每 12 个月更换。' },
    { itemKey: 'cabin_filter', name: '空调滤芯', category: 'comfort', necessity: 'optional', intervalKm: 15000, intervalMonth: 12, note: '官方在 15000 公里/9 个月节点首次更换（按整车里程），属可自行更换项目。' },
    { itemKey: 'spark_plug', name: '火花塞', category: 'engine', necessity: 'must', intervalKm: 30000, intervalMonth: 36, note: '官方：发动机燃油里程 25000 公里首次更换，之后每 30000 公里或 36 个月。' },
    { itemKey: 'fuel_filter', name: '燃油滤清器', category: 'engine', necessity: 'must', intervalKm: 100000, intervalMonth: 48, note: '官方：按发动机燃油里程每 100000 公里或 48 个月更换。周期很长，提前更换属加项。' },
    { itemKey: 'brake_fluid', name: '制动液', category: 'safety', necessity: 'conditional', intervalKm: 40000, intervalMonth: 24, note: '官方建议每 40000 公里更换（35000 公里节点安排检查）。以含水量检测为准。' },
    { itemKey: 'coolant', name: '冷却液', category: 'engine', necessity: 'must', intervalKm: 20000, intervalMonth: 24, note: '深蓝官方口径为每 20000 公里更换，明显短于行业普遍水平（4–10 万公里），属厂商保守要求。质保期内建议遵循，出保后可结合冰点与 pH 检测判断。' },
    { itemKey: 'gear_oil', name: '减速器油', category: 'transmission', necessity: 'conditional', intervalKm: 60000, intervalMonth: 48, note: '官方：首保时更换一次（新车磨合铁屑），之后每 60000 公里更换。首保这次是厂商安排、不是门店加项。' },
    { itemKey: 'brake_pad', name: '刹车片', category: 'safety', necessity: 'conditional', intervalKm: 50000, intervalMonth: null, note: '按厚度判断，剩余小于 3mm 需更换。' },
    { itemKey: 'battery', name: '三电系统检测', category: 'electrical', necessity: 'conditional', intervalKm: 10000, intervalMonth: 12, note: '官方例保内容即为车身、底盘及三电系统检查，属于检测项。' },
    { itemKey: 'tire', name: '轮胎', category: 'safety', necessity: 'conditional', intervalKm: 60000, intervalMonth: null, note: '按磨损与老化判断。' },
    { itemKey: 'oil_additive', name: '燃油清净剂', category: 'upsell', necessity: 'optional', intervalKm: 15000, intervalMonth: 6, note: '特别说明：深蓝是少数把「燃油清净剂」写进官方维护表的品牌（建议燃油里程每 15000 公里或 6 个月添加一次）。因此对深蓝增程版而言这并非门店杜撰的项目，但仍属建议项、非强制，几十元的自购产品即可，不必接受高价套餐。' },
    { itemKey: 'engine_flush', name: '发动机内部养护 / 拆洗积碳', category: 'upsell', necessity: 'unnecessary', note: '官方维护表未列入。增程器长期在高效区间稳定运行，积碳生成量低于普通燃油车，无症状时无需清洗。' },
    { itemKey: 'throttle_clean', name: '节气门清洗', category: 'upsell', necessity: 'unnecessary', note: '非固定周期项目，仅在出现怠速不稳、抖动等症状时才需要清洗。' },
    { itemKey: 'ac_disinfect', name: '空调管道杀菌', category: 'upsell', necessity: 'unnecessary', note: '更换空调滤芯即可解决绝大部分异味问题，管道杀菌不在厂商维护表内。' },
  ],
};

module.exports = {
  ruleset_nio: RULESET_NIO,
  ruleset_xpeng: RULESET_XPENG,
  ruleset_zeekr: RULESET_ZEEKR,
  ruleset_xiaomi: RULESET_XIAOMI,
  ruleset_leapmotor: RULESET_LEAPMOTOR,
  ruleset_wuling_ev: RULESET_WULING_EV,
  ruleset_gac_ev: RULESET_GAC_EV,
  ruleset_gwm_ev: RULESET_GWM_EV,
  ruleset_changan_ev: RULESET_CHANGAN_EV,
  ruleset_geely_ev: RULESET_GEELY_EV,
  ruleset_hongqi_ev: RULESET_HONGQI_EV,
  ruleset_neta: RULESET_NETA,
  ruleset_im_ev: RULESET_IM_EV,
  ruleset_hiphi: RULESET_HIPHI,
  ruleset_lixiang: RULESET_LIXIANG,
  ruleset_aito: RULESET_AITO,
  ruleset_deepal: RULESET_DEEPAL,
};
