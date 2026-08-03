// utils/models.js —— 车型预设库
// 覆盖中国市面主流品牌与主力车系（内置扁平库，可搜索、可按品牌分组）。
//
// 规则集映射说明（2026-08-02 升级）：
// 此前除大众 EA211 外，其余车型统一挂 ruleset_generic 通用兜底（manual 标注"非专属手册"）。
// 现按「品牌/平台/动力类型」映射到 data/rule_sets.js 中的真实厂商规则集：
//   vw_ea211       大众 1.2T/1.4T/1.5L（含奥迪 1.4T、斯柯达明锐）
//   vw_ea888       大众/奥迪 2.0T（EA888 平台）
//   toyota          丰田 / 雷克萨斯同源
//   honda           本田 / 讴歌同源
//   nissan          日产
//   mazda           马自达
//   jpn_others      三菱 / 斯巴鲁
//   byd_dmi         比亚迪 DM-i 超级混动
//   byd_ev          比亚迪纯电
//   buick_gm        别克 / 雪佛兰 / 凯迪拉克（通用系）
//   ford            福特
//   bmw             宝马
//   benz            奔驰
//   hyundai_kia     现代 / 起亚
//   geely_lynk      吉利 / 领克 / 沃尔沃（CMA 同源）
//   domestic        自主品牌燃油通用（2026-08-03 第三轮已按品牌拆分，当前无车型占用，仅留作兜底）
//   range_ext       增程混动（理想/问界/深蓝）
//   ev              纯电通用（特斯拉/蔚来/小鹏/极氪/埃安/哪吒/零跑/智己/高合/小米/欧拉/几何等）
//   generic         燃油车通用兜底（保时捷/捷豹路虎/英菲尼迪/标致雪铁龙/铃木等暂无专属手册者）
//
// 2026-08-03 第二轮升级：新增 5 套专属规则集，原先回落 generic 的 10 款车型已全部接入专属手册：
//   porsche  保时捷 Macan / Cayenne（官方定期保养时间表，三级保养体系）
//   jlr      捷豹路虎 Ingenium 平台（路虎中国官方保养间隔 + STJLR 机油规格）
//   jeep     Jeep 指南者 / 自由光（官方保养周期表，汽油滤终身免换）
//   psa      标致 408 / 雪铁龙 C4L（PSA 平台，含湿式正时皮带安全项）
//   tesla    特斯拉 Model 3 / Model Y（官方车主手册维修服务间隔，自纯电通用规则拆出）
// 另：英菲尼迪 QX50 并入 nissan（VC-Turbo 为日产自研），铃木雨燕并入 jpn_others。
// 至此全部车型均挂载与其平台匹配的规则集，generic 兜底当前已无车型占用。
//
// 2026-08-03 第三轮升级：拆分最大的通用桶 ruleset_domestic（原一套覆盖 27 款自主燃油车型），
// 按厂商官方保养信息表新增 6 套品牌专属规则集（见 data/rule_sets_cn.js）：
//   gwm      长城 哈弗 / WEY / 坦克（官方保养表：首保 5000、之后每 6000 公里；7DCT 变速箱油 4.8 万必换）
//   changan  长安 蓝鲸动力（官方 5000–7500 公里/6 个月；火花塞与 8AT 变速箱油随 6 万公里大保养）
//   chery    奇瑞 瑞虎 / 艾瑞泽（官方 5000 公里/6 个月；正时链条免维护，无固定更换里程）
//   gac      广汽传祺（首保 5000/3 个月，之后 1 万公里；汽滤 1 万公里为厂商偏短口径）
//   saic     上汽 荣威 / 五菱燃油（首保 3000、之后每 7500 公里，节奏区别于同级）
//   hongqi   红旗燃油（1 万公里/1 年常规 + 2 万深度 + 6 万大保养；四驱含分动箱油）
// 至此 ruleset_domestic 与 ruleset_generic 均已无车型占用，全部 173 款车型都挂在品牌/平台专属手册上。
//
// 2026-08-03 第四轮升级：拆分最后两个兜底桶 ruleset_ev（22 款纯电）与 ruleset_range_ext（6 款增程），
// 按各品牌官方保养手册 / 官方维护时间表新增 17 套新能源品牌专属规则集（见 data/rule_sets_nev.js）：
//   nio / xpeng / zeekr / xiaomi / leapmotor 零跑 / wuling_ev 五菱纯电 / gac_ev 埃安+合创
//   gwm_ev 欧拉 / changan_ev 长安纯电 / geely_ev 几何 / hongqi_ev 红旗纯电 / neta 哪吒
//   im_ev 智己 / hiphi 高合 / lixiang 理想 / aito 问界 / deepal 深蓝
// 拆分后 ruleset_ev 与 ruleset_range_ext 亦无任何车型占用，实现「每款车型都有符合它的专属保养计划」。
//
// 2026-08-03 第五轮升级：修正「挂错手册」+ 补齐缺失品牌（见 data/rule_sets_v2.js）：
//   volvo       沃尔沃 Drive-E —— 此前并入吉利/领克 CMA 同源桶，实际官方为 1 万公里/12 个月，
//               且汽油滤 3 万公里为官方正式项目，与吉利口径差异明显，本轮独立建库
//   subaru      斯巴鲁 —— 此前在「日系其他」桶，实际官方 5000 公里/6 个月，
//               且全时四驱有「前后差速器油 6 万公里」这一同级没有的必做项
//   mitsubishi  三菱 —— 官方机油 5000 公里、机滤 1 万公里（隔次），与「每次必换机滤」的门店口径不同
//   suzuki      铃木 —— 已退出中国市场，仍按随车手册周期，出保后可在正规连锁店保养
//   mg / mg_ev  名爵 MG 燃油与纯电（纯电取自 MG 官方 EV Service Schedule）
//   jetta       捷达 JETTA —— EA211 动力但火花塞官方 2 万公里，短于大众同平台 6 万公里口径
//   jetour      捷途 —— 官方 5000 公里，但手册同时写明全合成机油可放宽到 1 万公里
//   voyah / voyah_reev  岚图纯电与增程 —— 取自岚图官方在线用户手册《定期保养》章节，
//               增程车型官方明确区分「发动机工作里程」与「车辆总行驶里程」两套计量
// 同轮补充林肯（并入福特）、星途（并入奇瑞）、宝骏（并入上汽/五菱纯电）、方程豹与腾势（并入比亚迪）、
// smart（并入吉利纯电），以及理想 L6 / 问界 M9 / 蔚来 ES8 / 极氪 007 等主销车系。
// 至此「日系其他」桶（ruleset_jpn_others）亦实现 0 车型占用。

const RULE_VW = 'ruleset_vw_ea211';
const RULE_VW2 = 'ruleset_vw_ea888';
const RULE_TOYOTA = 'ruleset_toyota';
const RULE_HONDA = 'ruleset_honda';
const RULE_NISSAN = 'ruleset_nissan';
const RULE_MAZDA = 'ruleset_mazda';
const RULE_JPN = 'ruleset_jpn_others';
const RULE_BYD_DMI = 'ruleset_byd_dmi';
const RULE_BYD_EV = 'ruleset_byd_ev';
const RULE_GM = 'ruleset_buick_gm';
const RULE_FORD = 'ruleset_ford';
const RULE_BMW = 'ruleset_bmw';
const RULE_BENZ = 'ruleset_benz';
const RULE_HK = 'ruleset_hyundai_kia';
const RULE_GL = 'ruleset_geely_lynk';
const RULE_DOM = 'ruleset_domestic';
const RULE_RANGE = 'ruleset_range_ext';
const RULE_EV = 'ruleset_ev';
const RULE_GEN = 'ruleset_generic';
// 2026-08-03 新增专属规则集，消灭原先回落 generic 的车型
const RULE_PORSCHE = 'ruleset_porsche';
const RULE_JLR = 'ruleset_jlr';
const RULE_JEEP = 'ruleset_jeep';
const RULE_PSA = 'ruleset_psa';
const RULE_TESLA = 'ruleset_tesla';
// 2026-08-03 第三轮：拆分 ruleset_domestic「自主品牌通用」为 6 套品牌专属规则集
const RULE_GWM = 'ruleset_gwm';           // 长城：哈弗 / WEY / 坦克
const RULE_CHANGAN = 'ruleset_changan';   // 长安：蓝鲸动力
const RULE_CHERY = 'ruleset_chery';       // 奇瑞：瑞虎 / 艾瑞泽 / 欧萌达
const RULE_GAC = 'ruleset_gac';           // 广汽传祺
const RULE_SAIC = 'ruleset_saic';         // 上汽：荣威 / 五菱燃油
const RULE_HONGQI = 'ruleset_hongqi';     // 红旗燃油
// 2026-08-03 第四轮：拆分 ruleset_ev（纯电通用）与 ruleset_range_ext（增程通用）为 17 套新能源品牌专属规则集
const RULE_NIO = 'ruleset_nio';               // 蔚来 ES6 / ET5
const RULE_XPENG = 'ruleset_xpeng';           // 小鹏 P7 / G9
const RULE_ZEEKR = 'ruleset_zeekr';           // 极氪 001
const RULE_XIAOMI = 'ruleset_xiaomi';         // 小米 SU7
const RULE_LEAPMOTOR = 'ruleset_leapmotor';   // 零跑 C11 / T03
const RULE_WULING_EV = 'ruleset_wuling_ev';   // 五菱纯电：宏光MINIEV / 缤果
const RULE_GAC_EV = 'ruleset_gac_ev';         // 广汽埃安 AION S/Y + 合创 Z03
const RULE_GWM_EV = 'ruleset_gwm_ev';         // 欧拉 好猫
const RULE_CHANGAN_EV = 'ruleset_changan_ev'; // 长安纯电：糯玉米
const RULE_GEELY_EV = 'ruleset_geely_ev';     // 几何 A
const RULE_HONGQI_EV = 'ruleset_hongqi_ev';   // 红旗纯电：E-QM5 / E-HS9
const RULE_NETA = 'ruleset_neta';             // 哪吒 S / V
const RULE_IM_EV = 'ruleset_im_ev';           // 智己 L7
const RULE_HIPHI = 'ruleset_hiphi';           // 高合 HiPhi X
const RULE_LIXIANG = 'ruleset_lixiang';       // 理想 L7 / L8 / L9
const RULE_AITO = 'ruleset_aito';             // 问界 M5 / M7
const RULE_DEEPAL = 'ruleset_deepal';         // 深蓝 SL03 增程

// 第五轮（2026-08-03）：品牌拆分 + 新增在售品牌，见 data/rule_sets_v2.js
const RULE_VOLVO = 'ruleset_volvo';           // 沃尔沃 Drive-E（自 CMA 同源桶拆出）
const RULE_SUBARU = 'ruleset_subaru';         // 斯巴鲁（自「日系其他」桶拆出）
const RULE_MITSU = 'ruleset_mitsubishi';      // 三菱（自「日系其他」桶拆出）
const RULE_SUZUKI = 'ruleset_suzuki';         // 铃木（自「日系其他」桶拆出）
const RULE_MG = 'ruleset_mg';                 // 名爵 MG 燃油 / 混动
const RULE_MG_EV = 'ruleset_mg_ev';           // 名爵 MG 纯电
const RULE_JETTA = 'ruleset_jetta';           // 捷达 JETTA（一汽-大众独立品牌）
const RULE_JETOUR = 'ruleset_jetour';         // 捷途（奇瑞）
const RULE_VOYAH = 'ruleset_voyah';           // 岚图纯电
const RULE_VOYAH_REEV = 'ruleset_voyah_reev'; // 岚图增程

// 第六轮（2026-08-03）：补齐仍缺失的在售品牌，见 data/rule_sets_v3.js
const RULE_VW_EV = 'ruleset_vw_ev';               // 大众 ID. 家族 + 奥迪 Q4 e-tron（合资纯电此前完全空白）
const RULE_GALAXY = 'ruleset_geely_galaxy';       // 吉利银河（雷神 EM-i / EM-P）+ 同源的领克 08
const RULE_QIYUAN = 'ruleset_changan_qiyuan';     // 长安启源（增程 / 插混）
const RULE_AVATR = 'ruleset_avatr';               // 阿维塔纯电版
const RULE_AVATR_REEV = 'ruleset_avatr_reev';     // 阿维塔增程版（计量口径与纯电版不同，单独建库）
const RULE_ARCFOX = 'ruleset_arcfox';             // 极狐 ARCFOX（北汽新能源）
const RULE_BAIC = 'ruleset_baic';                 // 北京汽车 BJ 系列硬派越野
const RULE_JAC = 'ruleset_jac';                   // 江淮 瑞风 / 思皓

const MODELS = [
  // ---------------- 德系 ----------------
  // 大众
  { id: 'vw_sagitar', brand: '大众', series: '速腾', engine: '1.4T', ruleSetId: RULE_VW },
  { id: 'vw_lavida', brand: '大众', series: '朗逸', engine: '1.5L', ruleSetId: RULE_VW },
  { id: 'vw_bora', brand: '大众', series: '宝来', engine: '1.2T', ruleSetId: RULE_VW },
  { id: 'vw_troc', brand: '大众', series: '探歌', engine: '1.4T', ruleSetId: RULE_VW },
  { id: 'vw_tharu', brand: '大众', series: '途岳', engine: '1.4T', ruleSetId: RULE_VW },
  { id: 'vw_tiguan', brand: '大众', series: '途观L', engine: '2.0T', ruleSetId: RULE_VW2 },
  { id: 'vw_passat', brand: '大众', series: '帕萨特', engine: '2.0T', ruleSetId: RULE_VW2 },
  { id: 'vw_magotan', brand: '大众', series: '迈腾', engine: '2.0T', ruleSetId: RULE_VW2 },
  { id: 'vw_polo', brand: '大众', series: 'Polo', engine: '1.5L', ruleSetId: RULE_VW },
  { id: 'vw_golf', brand: '大众', series: '高尔夫', engine: '1.4T', ruleSetId: RULE_VW },
  { id: 'vw_cc', brand: '大众', series: 'CC', engine: '2.0T', ruleSetId: RULE_VW2 },
  { id: 'vw_talagon', brand: '大众', series: '揽巡', engine: '2.0T', ruleSetId: RULE_VW2 },
  { id: 'vw_teramont', brand: '大众', series: '途昂', engine: '2.0T', ruleSetId: RULE_VW2 },
  { id: 'vw_santana', brand: '大众', series: '桑塔纳', engine: '1.5L', ruleSetId: RULE_VW },
  // 捷达 JETTA（一汽-大众独立品牌，EA211 动力但火花塞等周期与大众不同）
  { id: 'jetta_vs5', brand: '捷达', series: 'VS5', engine: '1.4T', ruleSetId: RULE_JETTA },
  { id: 'jetta_vs7', brand: '捷达', series: 'VS7', engine: '1.4T', ruleSetId: RULE_JETTA },
  { id: 'jetta_va3', brand: '捷达', series: 'VA3', engine: '1.5L', ruleSetId: RULE_JETTA },
  // 奥迪（A3/Q2L/Q3 为 EA211 1.4T，A4L/A6L/Q5L 为 EA888 2.0T）
  { id: 'audi_a3', brand: '奥迪', series: 'A3', engine: '1.4T', ruleSetId: RULE_VW },
  { id: 'audi_a4l', brand: '奥迪', series: 'A4L', engine: '2.0T', ruleSetId: RULE_VW2 },
  { id: 'audi_a6l', brand: '奥迪', series: 'A6L', engine: '2.0T', ruleSetId: RULE_VW2 },
  { id: 'audi_q2l', brand: '奥迪', series: 'Q2L', engine: '1.4T', ruleSetId: RULE_VW },
  { id: 'audi_q3', brand: '奥迪', series: 'Q3', engine: '1.4T', ruleSetId: RULE_VW },
  { id: 'audi_q5l', brand: '奥迪', series: 'Q5L', engine: '2.0T', ruleSetId: RULE_VW2 },
  // 宝马
  { id: 'bmw_1', brand: '宝马', series: '1系', engine: '1.5T', ruleSetId: RULE_BMW },
  { id: 'bmw_3', brand: '宝马', series: '3系', engine: '2.0T', ruleSetId: RULE_BMW },
  { id: 'bmw_5', brand: '宝马', series: '5系', engine: '2.0T', ruleSetId: RULE_BMW },
  { id: 'bmw_x1', brand: '宝马', series: 'X1', engine: '1.5T', ruleSetId: RULE_BMW },
  { id: 'bmw_x3', brand: '宝马', series: 'X3', engine: '2.0T', ruleSetId: RULE_BMW },
  { id: 'bmw_x5', brand: '宝马', series: 'X5', engine: '2.0T', ruleSetId: RULE_BMW },
  // 奔驰
  { id: 'mb_a', brand: '奔驰', series: 'A级', engine: '1.3T', ruleSetId: RULE_BENZ },
  { id: 'mb_c', brand: '奔驰', series: 'C级', engine: '1.5T', ruleSetId: RULE_BENZ },
  { id: 'mb_e', brand: '奔驰', series: 'E级', engine: '2.0T', ruleSetId: RULE_BENZ },
  { id: 'mb_gla', brand: '奔驰', series: 'GLA', engine: '1.3T', ruleSetId: RULE_BENZ },
  { id: 'mb_glc', brand: '奔驰', series: 'GLC', engine: '2.0T', ruleSetId: RULE_BENZ },
  // 保时捷（官方定期保养时间表）
  { id: 'porsche_macan', brand: '保时捷', series: 'Macan', engine: '2.0T', ruleSetId: RULE_PORSCHE },
  { id: 'porsche_cayenne', brand: '保时捷', series: 'Cayenne', engine: '3.0T', ruleSetId: RULE_PORSCHE },

  // ---------------- 日系 ----------------
  // 丰田 / 雷克萨斯同源
  { id: 'toyota_corolla', brand: '丰田', series: '卡罗拉', engine: '1.2T', ruleSetId: RULE_TOYOTA },
  { id: 'toyota_levin', brand: '丰田', series: '雷凌', engine: '1.2T', ruleSetId: RULE_TOYOTA },
  { id: 'toyota_camry', brand: '丰田', series: '凯美瑞', engine: '2.0L', ruleSetId: RULE_TOYOTA },
  { id: 'toyota_rav4', brand: '丰田', series: 'RAV4荣放', engine: '2.0L', ruleSetId: RULE_TOYOTA },
  { id: 'toyota_highlander', brand: '丰田', series: '汉兰达', engine: '2.0T', ruleSetId: RULE_TOYOTA },
  { id: 'toyota_vios', brand: '丰田', series: '威驰', engine: '1.5L', ruleSetId: RULE_TOYOTA },
  { id: 'toyota_yaris', brand: '丰田', series: '致炫', engine: '1.5L', ruleSetId: RULE_TOYOTA },
  { id: 'toyota_crown', brand: '丰田', series: '皇冠陆放', engine: '2.5L混动', ruleSetId: RULE_TOYOTA },
  { id: 'toyota_iza', brand: '丰田', series: '逸致', engine: '1.8L', ruleSetId: RULE_TOYOTA },
  { id: 'lexus_es', brand: '雷克萨斯', series: 'ES', engine: '2.0L', ruleSetId: RULE_TOYOTA },
  { id: 'lexus_nx', brand: '雷克萨斯', series: 'NX', engine: '2.0T', ruleSetId: RULE_TOYOTA },
  { id: 'lexus_rx', brand: '雷克萨斯', series: 'RX', engine: '2.0T', ruleSetId: RULE_TOYOTA },
  // 本田 / 讴歌同源
  { id: 'honda_civic', brand: '本田', series: '思域', engine: '1.5T', ruleSetId: RULE_HONDA },
  { id: 'honda_accord', brand: '本田', series: '雅阁', engine: '1.5T', ruleSetId: RULE_HONDA },
  { id: 'honda_crvan', brand: '本田', series: 'CR-V', engine: '1.5T', ruleSetId: RULE_HONDA },
  { id: 'honda_xrv', brand: '本田', series: 'XR-V', engine: '1.5L', ruleSetId: RULE_HONDA },
  { id: 'honda_fit', brand: '本田', series: '飞度', engine: '1.5L', ruleSetId: RULE_HONDA },
  { id: 'honda_odyssey', brand: '本田', series: '奥德赛', engine: '2.0L混动', ruleSetId: RULE_HONDA },
  { id: 'honda_avancier', brand: '本田', series: '冠道', engine: '1.5T', ruleSetId: RULE_HONDA },
  { id: 'acura_cdx', brand: '讴歌', series: 'CDX', engine: '1.5T', ruleSetId: RULE_HONDA },
  // 日产
  { id: 'nissan_sylphy', brand: '日产', series: '轩逸', engine: '1.6L', ruleSetId: RULE_NISSAN },
  { id: 'nissan_teana', brand: '日产', series: '天籁', engine: '2.0L', ruleSetId: RULE_NISSAN },
  { id: 'nissan_xv', brand: '日产', series: '逍客', engine: '2.0L', ruleSetId: RULE_NISSAN },
  { id: 'nissan_xtrail', brand: '日产', series: '奇骏', engine: '2.0L', ruleSetId: RULE_NISSAN },
  { id: 'nissan_livina', brand: '日产', series: '骊威', engine: '1.6L', ruleSetId: RULE_NISSAN },
  // 马自达
  { id: 'mazda_axela', brand: '马自达', series: '昂克赛拉', engine: '1.5L', ruleSetId: RULE_MAZDA },
  { id: 'mazda_cx4', brand: '马自达', series: 'CX-4', engine: '2.0L', ruleSetId: RULE_MAZDA },
  { id: 'mazda_cx5', brand: '马自达', series: 'CX-5', engine: '2.0L', ruleSetId: RULE_MAZDA },
  { id: 'mazda_6', brand: '马自达', series: '阿特兹', engine: '2.0L', ruleSetId: RULE_MAZDA },
  // 三菱（官方保养周期表：机油 5000km、机滤 1 万 km 隔次更换）
  { id: 'mitsu_outlander', brand: '三菱', series: '欧蓝德', engine: '2.0L', ruleSetId: RULE_MITSU },
  { id: 'mitsu_epsi', brand: '三菱', series: '劲炫ASX', engine: '1.6L', ruleSetId: RULE_MITSU },
  // 斯巴鲁（水平对置 + 左右对称全时四驱，官方 5000km/6 个月且有差速器油项目）
  { id: 'subaru_xv', brand: '斯巴鲁', series: 'XV', engine: '2.0L', ruleSetId: RULE_SUBARU },
  { id: 'subaru_forester', brand: '斯巴鲁', series: '森林人', engine: '2.0L', ruleSetId: RULE_SUBARU },
  { id: 'subaru_outback', brand: '斯巴鲁', series: '傲虎', engine: '2.5L', ruleSetId: RULE_SUBARU },
  { id: 'subaru_legacy', brand: '斯巴鲁', series: '力狮', engine: '2.5L', ruleSetId: RULE_SUBARU },
  // 英菲尼迪（VC-Turbo 为日产自研发动机，与日产同源）
  { id: 'infiniti_qx50', brand: '英菲尼迪', series: 'QX50', engine: '2.0T', ruleSetId: RULE_NISSAN },
  // 铃木（已退出中国市场，仍按随车手册周期）
  { id: 'suzuki_swift', brand: '铃木', series: '雨燕', engine: '1.5L', ruleSetId: RULE_SUZUKI },

  // ---------------- 美系 ----------------
  // 别克 / 雪佛兰 / 凯迪拉克（通用系）
  { id: 'buick_excelle', brand: '别克', series: '英朗', engine: '1.5L', ruleSetId: RULE_GM },
  { id: 'buick_verano', brand: '别克', series: '威朗', engine: '1.5T', ruleSetId: RULE_GM },
  { id: 'buick_regal', brand: '别克', series: '君威', engine: '1.5T', ruleSetId: RULE_GM },
  { id: 'buick_lacrosse', brand: '别克', series: '君越', engine: '2.0T', ruleSetId: RULE_GM },
  { id: 'buick_envisi', brand: '别克', series: '昂科威', engine: '1.5T', ruleSetId: RULE_GM },
  { id: 'buick_gl8', brand: '别克', series: 'GL8', engine: '2.0T', ruleSetId: RULE_GM },
  { id: 'chev_cruze', brand: '雪佛兰', series: '科鲁泽', engine: '1.5L', ruleSetId: RULE_GM },
  { id: 'chev_malibu', brand: '雪佛兰', series: '迈锐宝XL', engine: '1.5T', ruleSetId: RULE_GM },
  { id: 'chev_equinox', brand: '雪佛兰', series: '探界者', engine: '1.5T', ruleSetId: RULE_GM },
  { id: 'cad_ct4', brand: '凯迪拉克', series: 'CT4', engine: '2.0T', ruleSetId: RULE_GM },
  { id: 'cad_xt4', brand: '凯迪拉克', series: 'XT4', engine: '2.0T', ruleSetId: RULE_GM },
  { id: 'cad_xt5', brand: '凯迪拉克', series: 'XT5', engine: '2.0T', ruleSetId: RULE_GM },
  // 福特
  { id: 'ford_focus', brand: '福特', series: '福克斯', engine: '1.5T', ruleSetId: RULE_FORD },
  { id: 'ford_mondeo', brand: '福特', series: '蒙迪欧', engine: '2.0T', ruleSetId: RULE_FORD },
  { id: 'ford_escape', brand: '福特', series: '锐际', engine: '2.0T', ruleSetId: RULE_FORD },
  { id: 'ford_evos', brand: '福特', series: 'EVOS', engine: '2.0T', ruleSetId: RULE_FORD },
  // 林肯（长安福特，与福特同平台同保养口径）
  { id: 'lincoln_corsair', brand: '林肯', series: '冒险家', engine: '2.0T', ruleSetId: RULE_FORD },
  { id: 'lincoln_nautilus', brand: '林肯', series: '航海家', engine: '2.0T', ruleSetId: RULE_FORD },
  // Jeep（官方保养周期表）
  { id: 'jeep_compass', brand: 'Jeep', series: '指南者', engine: '1.3T', ruleSetId: RULE_JEEP },
  { id: 'jeep_cherokee', brand: 'Jeep', series: '自由光', engine: '2.0T', ruleSetId: RULE_JEEP },
  // 特斯拉（官方车主手册维修服务间隔）
  { id: 'tesla_model3', brand: '特斯拉', series: 'Model 3', engine: '纯电', ruleSetId: RULE_TESLA },
  { id: 'tesla_modely', brand: '特斯拉', series: 'Model Y', engine: '纯电', ruleSetId: RULE_TESLA },

  // ---------------- 韩系 ----------------
  // 现代 / 起亚
  { id: 'hyundai_elantra', brand: '现代', series: '伊兰特', engine: '1.5L', ruleSetId: RULE_HK },
  { id: 'hyundai_sonata', brand: '现代', series: '索纳塔', engine: '1.5T', ruleSetId: RULE_HK },
  { id: 'hyundai_tucson', brand: '现代', series: '途胜', engine: '1.5T', ruleSetId: RULE_HK },
  { id: 'hyundai_ix35', brand: '现代', series: 'ix35', engine: '2.0L', ruleSetId: RULE_HK },
  { id: 'kia_k3', brand: '起亚', series: 'K3', engine: '1.5L', ruleSetId: RULE_HK },
  { id: 'kia_k5', brand: '起亚', series: 'K5', engine: '1.5T', ruleSetId: RULE_HK },
  { id: 'kia_sportage', brand: '起亚', series: '智跑', engine: '2.0L', ruleSetId: RULE_HK },

  // ---------------- 自主品牌 ----------------
  // 比亚迪 DM-i / EV
  { id: 'byd_qin', brand: '比亚迪', series: '秦PLUS', engine: 'DM-i', ruleSetId: RULE_BYD_DMI },
  { id: 'byd_song', brand: '比亚迪', series: '宋PLUS', engine: 'DM-i', ruleSetId: RULE_BYD_DMI },
  { id: 'byd_han', brand: '比亚迪', series: '汉', engine: 'EV', ruleSetId: RULE_BYD_EV },
  { id: 'byd_tang', brand: '比亚迪', series: '唐', engine: 'DM-i', ruleSetId: RULE_BYD_DMI },
  { id: 'byd_yuan', brand: '比亚迪', series: '元PLUS', engine: 'EV', ruleSetId: RULE_BYD_EV },
  { id: 'byd_dolphin', brand: '比亚迪', series: '海豚', engine: 'EV', ruleSetId: RULE_BYD_EV },
  { id: 'byd_seal', brand: '比亚迪', series: '海豹', engine: 'EV', ruleSetId: RULE_BYD_EV },
  { id: 'byd_e2', brand: '比亚迪', series: 'e2', engine: 'EV', ruleSetId: RULE_BYD_EV },
  { id: 'byd_frigate', brand: '比亚迪', series: '护卫舰07', engine: 'DM-i', ruleSetId: RULE_BYD_DMI },
  // 吉利 / 领克 / 沃尔沃（CMA 同源）
  { id: 'geely_xingyue', brand: '吉利', series: '星越L', engine: '2.0T', ruleSetId: RULE_GL },
  { id: 'geely_emon', brand: '吉利', series: '帝豪', engine: '1.5L', ruleSetId: RULE_GL },
  { id: 'geely_binrui', brand: '吉利', series: '缤越', engine: '1.5T', ruleSetId: RULE_GL },
  { id: 'geely_xingrui', brand: '吉利', series: '星瑞', engine: '2.0T', ruleSetId: RULE_GL },
  { id: 'geely_boyue', brand: '吉利', series: '博越', engine: '1.8T', ruleSetId: RULE_GL },
  { id: 'geely_yibing', brand: '吉利', series: '几何A', engine: 'EV', ruleSetId: RULE_GEELY_EV },
  { id: 'lynk_03', brand: '领克', series: '03', engine: '2.0T', ruleSetId: RULE_GL },
  { id: 'lynk_06', brand: '领克', series: '06', engine: '1.5T', ruleSetId: RULE_GL },
  // 沃尔沃（2026-08-03 第五轮：按沃尔沃中国官方保养项目表自 CMA 同源规则集拆出）
  { id: 'volvo_s60', brand: '沃尔沃', series: 'S60', engine: '2.0T', ruleSetId: RULE_VOLVO },
  { id: 'volvo_xc60', brand: '沃尔沃', series: 'XC60', engine: '2.0T', ruleSetId: RULE_VOLVO },
  { id: 'volvo_s90', brand: '沃尔沃', series: 'S90', engine: '2.0T', ruleSetId: RULE_VOLVO },
  { id: 'volvo_xc40', brand: '沃尔沃', series: 'XC40', engine: '2.0T', ruleSetId: RULE_VOLVO },
  { id: 'volvo_xc90', brand: '沃尔沃', series: 'XC90', engine: '2.0T', ruleSetId: RULE_VOLVO },
  // 哈弗 / WEY / 坦克 / 欧拉
  { id: 'haval_h6', brand: '哈弗', series: 'H6', engine: '1.5T', ruleSetId: RULE_GWM },
  { id: 'haval_dog', brand: '哈弗', series: '大狗', engine: '1.5T', ruleSetId: RULE_GWM },
  { id: 'haval_f7', brand: '哈弗', series: 'F7', engine: '1.5T', ruleSetId: RULE_GWM },
  { id: 'weyy_p8', brand: 'WEY', series: 'VV6', engine: '2.0T', ruleSetId: RULE_GWM },
  { id: 'greatwall_wey', brand: 'WEY', series: '蓝山', engine: '2.0T', ruleSetId: RULE_GWM },
  { id: 'tank_300', brand: '坦克', series: '300', engine: '2.0T', ruleSetId: RULE_GWM },
  { id: 'ora_goodcat', brand: '欧拉', series: '好猫', engine: 'EV', ruleSetId: RULE_GWM_EV },
  // 长安
  { id: 'changan_cs55', brand: '长安', series: 'CS55 PLUS', engine: '1.5T', ruleSetId: RULE_CHANGAN },
  { id: 'changan_cs75', brand: '长安', series: 'CS75 PLUS', engine: '1.5T', ruleSetId: RULE_CHANGAN },
  { id: 'changan_uni', brand: '长安', series: 'UNI-V', engine: '1.5T', ruleSetId: RULE_CHANGAN },
  { id: 'changan_emin', brand: '长安', series: '逸动', engine: '1.6L', ruleSetId: RULE_CHANGAN },
  { id: 'changan_cabao', brand: '长安', series: '糯玉米', engine: 'EV', ruleSetId: RULE_CHANGAN_EV },
  // 奇瑞
  { id: 'chery_tiggo8', brand: '奇瑞', series: '瑞虎8', engine: '1.6T', ruleSetId: RULE_CHERY },
  { id: 'chery_arrizo', brand: '奇瑞', series: '艾瑞泽5', engine: '1.5L', ruleSetId: RULE_CHERY },
  { id: 'chery_tiggo7', brand: '奇瑞', series: '瑞虎7', engine: '1.5T', ruleSetId: RULE_CHERY },
  { id: 'chery_omoda', brand: '奇瑞', series: '欧萌达', engine: '1.5T', ruleSetId: RULE_CHERY },
  // 星途（奇瑞高端序列，与奇瑞同平台同保养口径）
  { id: 'exeed_lanyue', brand: '星途', series: '揽月', engine: '2.0T', ruleSetId: RULE_CHERY },
  { id: 'exeed_lingyun', brand: '星途', series: '凌云', engine: '1.6T', ruleSetId: RULE_CHERY },
  // 捷途（奇瑞捷途官方保养手册，首保 5000、之后 5000 公里）
  { id: 'jetour_x70', brand: '捷途', series: 'X70 PLUS', engine: '1.5T', ruleSetId: RULE_JETOUR },
  { id: 'jetour_x90', brand: '捷途', series: 'X90 PLUS', engine: '1.6T', ruleSetId: RULE_JETOUR },
  { id: 'jetour_traveller', brand: '捷途', series: '旅行者', engine: '2.0T', ruleSetId: RULE_JETOUR },
  { id: 'jetour_shanhai', brand: '捷途', series: '山海T2', engine: '1.5T', ruleSetId: RULE_JETOUR },
  // 广汽传祺
  { id: 'gac_gs4', brand: '广汽传祺', series: 'GS4', engine: '1.5T', ruleSetId: RULE_GAC },
  { id: 'gac_m6', brand: '广汽传祺', series: 'M6', engine: '1.5T', ruleSetId: RULE_GAC },
  { id: 'gac_m8', brand: '广汽传祺', series: 'M8', engine: '2.0T', ruleSetId: RULE_GAC },
  // 上汽荣威
  { id: 'roewe_i5', brand: '荣威', series: 'i5', engine: '1.5L', ruleSetId: RULE_SAIC },
  { id: 'roewe_rx5', brand: '荣威', series: 'RX5', engine: '1.5T', ruleSetId: RULE_SAIC },
  // 名爵 MG（上汽，燃油/混动走 MG 官方口径，纯电走 MG 官方 EV Service Schedule）
  { id: 'mg_mg5', brand: '名爵', series: 'MG5', engine: '1.5L', ruleSetId: RULE_MG },
  { id: 'mg_mg6', brand: '名爵', series: 'MG6', engine: '1.5T', ruleSetId: RULE_MG },
  { id: 'mg_mg7', brand: '名爵', series: 'MG7', engine: '2.0T', ruleSetId: RULE_MG },
  { id: 'mg_zs', brand: '名爵', series: 'MG ZS', engine: '1.5L', ruleSetId: RULE_MG },
  { id: 'mg_hs', brand: '名爵', series: 'MG HS', engine: '1.5T', ruleSetId: RULE_MG },
  { id: 'mg_mg4', brand: '名爵', series: 'MG4 EV', engine: 'EV', ruleSetId: RULE_MG_EV },
  { id: 'mg_es5', brand: '名爵', series: 'MG ES5', engine: 'EV', ruleSetId: RULE_MG_EV },
  { id: 'mg_cyberster', brand: '名爵', series: 'Cyberster', engine: 'EV', ruleSetId: RULE_MG_EV },
  // 五菱
  { id: 'wuling_hongguang', brand: '五菱', series: '宏光MINIEV', engine: 'EV', ruleSetId: RULE_WULING_EV },
  { id: 'wuling_binguo', brand: '五菱', series: '缤果', engine: 'EV', ruleSetId: RULE_WULING_EV },
  { id: 'wuling_xingchen', brand: '五菱', series: '星辰', engine: '1.5T', ruleSetId: RULE_SAIC },
  // 宝骏（上汽通用五菱，燃油走上汽口径、纯电走五菱纯电口径）
  { id: 'baojun_530', brand: '宝骏', series: '530', engine: '1.5T', ruleSetId: RULE_SAIC },
  { id: 'baojun_valli', brand: '宝骏', series: 'Valli', engine: '1.5T', ruleSetId: RULE_SAIC },
  { id: 'baojun_yunduo', brand: '宝骏', series: '云朵', engine: 'EV', ruleSetId: RULE_WULING_EV },
  { id: 'baojun_yueye', brand: '宝骏', series: '悦也', engine: 'EV', ruleSetId: RULE_WULING_EV },
  // 红旗
  { id: 'hongqi_h5', brand: '红旗', series: 'H5', engine: '1.5T', ruleSetId: RULE_HONGQI },
  { id: 'hongqi_h6', brand: '红旗', series: 'H6', engine: '2.0T', ruleSetId: RULE_HONGQI },
  { id: 'hongqi_hs5', brand: '红旗', series: 'HS5', engine: '2.0T', ruleSetId: RULE_HONGQI },
  { id: 'hongqi_h7', brand: '红旗', series: 'H7', engine: '1.8T', ruleSetId: RULE_HONGQI },
  { id: 'hongqi_h9', brand: '红旗', series: 'H9', engine: '2.0T', ruleSetId: RULE_HONGQI },
  { id: 'hongqi_hs7', brand: '红旗', series: 'HS7', engine: '2.0T', ruleSetId: RULE_HONGQI },
  { id: 'hongqi_eqm5', brand: '红旗', series: 'E-QM5', engine: 'EV', ruleSetId: RULE_HONGQI_EV },
  { id: 'hongqi_ehs9', brand: '红旗', series: 'E-HS9', engine: 'EV', ruleSetId: RULE_HONGQI_EV },
  { id: 'hongqi_hq9', brand: '红旗', series: 'HQ9', engine: '2.0T', ruleSetId: RULE_HONGQI },

  // ---------------- 造车新势力 ----------------
  { id: 'li_l9', brand: '理想', series: 'L9', engine: '增程', ruleSetId: RULE_LIXIANG },
  { id: 'li_l8', brand: '理想', series: 'L8', engine: '增程', ruleSetId: RULE_LIXIANG },
  { id: 'li_l7', brand: '理想', series: 'L7', engine: '增程', ruleSetId: RULE_LIXIANG },
  { id: 'aito_m5', brand: '问界', series: 'M5', engine: '增程', ruleSetId: RULE_AITO },
  { id: 'aito_m7', brand: '问界', series: 'M7', engine: '增程', ruleSetId: RULE_AITO },
  { id: 'deepal_sl03', brand: '深蓝', series: 'SL03', engine: '增程', ruleSetId: RULE_DEEPAL },
  { id: 'tengshi_d9', brand: '腾势', series: 'D9', engine: 'DM-i', ruleSetId: RULE_BYD_DMI },
  { id: 'nio_es6', brand: '蔚来', series: 'ES6', engine: 'EV', ruleSetId: RULE_NIO },
  { id: 'nio_et5', brand: '蔚来', series: 'ET5', engine: 'EV', ruleSetId: RULE_NIO },
  { id: 'xpeng_p7', brand: '小鹏', series: 'P7', engine: 'EV', ruleSetId: RULE_XPENG },
  { id: 'xpeng_g9', brand: '小鹏', series: 'G9', engine: 'EV', ruleSetId: RULE_XPENG },
  { id: 'hetao_s', brand: '哪吒', series: '哪吒S', engine: 'EV', ruleSetId: RULE_NETA },
  { id: 'leta_c11', brand: '零跑', series: 'C11', engine: 'EV', ruleSetId: RULE_LEAPMOTOR },
  { id: 'gac_aion_s', brand: '广汽埃安', series: 'AION S', engine: 'EV', ruleSetId: RULE_GAC_EV },
  { id: 'gac_aion_y', brand: '广汽埃安', series: 'AION Y', engine: 'EV', ruleSetId: RULE_GAC_EV },
  { id: 'zeekr_001', brand: '极氪', series: '001', engine: 'EV', ruleSetId: RULE_ZEEKR },
  { id: 'gac_hycan', brand: '合创', series: 'Z03', engine: 'EV', ruleSetId: RULE_GAC_EV },
  { id: 'neta_v', brand: '哪吒', series: '哪吒V', engine: 'EV', ruleSetId: RULE_NETA },
  { id: 'lingpao_t03', brand: '零跑', series: 'T03', engine: 'EV', ruleSetId: RULE_LEAPMOTOR },
  { id: 'aochi_lux', brand: '高合', series: 'HiPhi X', engine: 'EV', ruleSetId: RULE_HIPHI },
  { id: 'zhiji_l7', brand: '智己', series: 'L7', engine: 'EV', ruleSetId: RULE_IM_EV },
  { id: 'xiaomi_su7', brand: '小米', series: 'SU7', engine: 'EV', ruleSetId: RULE_XIAOMI },
  // 2026-08-03 第五轮补充：主销车系此前缺失，用户在库里找不到自己的车
  { id: 'li_l6', brand: '理想', series: 'L6', engine: '增程', ruleSetId: RULE_LIXIANG },
  { id: 'aito_m9', brand: '问界', series: 'M9', engine: '增程', ruleSetId: RULE_AITO },
  { id: 'deepal_s7', brand: '深蓝', series: 'S7', engine: '增程', ruleSetId: RULE_DEEPAL },
  { id: 'nio_es8', brand: '蔚来', series: 'ES8', engine: 'EV', ruleSetId: RULE_NIO },
  { id: 'nio_et7', brand: '蔚来', series: 'ET7', engine: 'EV', ruleSetId: RULE_NIO },
  { id: 'xpeng_g6', brand: '小鹏', series: 'G6', engine: 'EV', ruleSetId: RULE_XPENG },
  { id: 'xpeng_x9', brand: '小鹏', series: 'X9', engine: 'EV', ruleSetId: RULE_XPENG },
  { id: 'zeekr_007', brand: '极氪', series: '007', engine: 'EV', ruleSetId: RULE_ZEEKR },
  { id: 'zeekr_x', brand: '极氪', series: 'X', engine: 'EV', ruleSetId: RULE_ZEEKR },
  { id: 'zeekr_009', brand: '极氪', series: '009', engine: 'EV', ruleSetId: RULE_ZEEKR },
  { id: 'gac_aion_v', brand: '广汽埃安', series: 'AION V', engine: 'EV', ruleSetId: RULE_GAC_EV },
  { id: 'leapmotor_c10', brand: '零跑', series: 'C10', engine: 'EV', ruleSetId: RULE_LEAPMOTOR },
  { id: 'tengshi_n7', brand: '腾势', series: 'N7', engine: 'EV', ruleSetId: RULE_BYD_EV },
  { id: 'fcb_bao5', brand: '方程豹', series: '豹5', engine: 'DM-O', ruleSetId: RULE_BYD_DMI },
  { id: 'fcb_ti3', brand: '方程豹', series: '钛3', engine: 'EV', ruleSetId: RULE_BYD_EV },
  { id: 'smart_1', brand: 'smart', series: '精灵#1', engine: 'EV', ruleSetId: RULE_GEELY_EV },
  // 岚图（东风高端，官方在线用户手册《定期保养》章节，纯电与增程两套周期）
  { id: 'voyah_zhuiguang', brand: '岚图', series: '追光', engine: 'EV', ruleSetId: RULE_VOYAH },
  { id: 'voyah_zhiyin', brand: '岚图', series: '知音', engine: 'EV', ruleSetId: RULE_VOYAH },
  { id: 'voyah_free', brand: '岚图', series: 'FREE 增程版', engine: '增程', ruleSetId: RULE_VOYAH_REEV },
  { id: 'voyah_dreamer', brand: '岚图', series: '梦想家', engine: '增程', ruleSetId: RULE_VOYAH_REEV },

  // ---------------- 更多品牌补充 ----------------
  // 沃尔沃（已归入吉利/领克同源）
  // 捷豹路虎（Ingenium 平台，路虎中国官方保养间隔）
  { id: 'jaguar_xfl', brand: '捷豹', series: 'XFL', engine: '2.0T', ruleSetId: RULE_JLR },
  { id: 'landrover_evoque', brand: '路虎', series: '揽胜极光', engine: '2.0T', ruleSetId: RULE_JLR },
  { id: 'landrover_dis', brand: '路虎', series: '发现运动', engine: '2.0T', ruleSetId: RULE_JLR },
  // 标致雪铁龙（PSA 平台）
  { id: 'peugeot_408', brand: '标致', series: '408', engine: '1.6T', ruleSetId: RULE_PSA },
  { id: 'citroen_c4', brand: '雪铁龙', series: 'C4L', engine: '1.6T', ruleSetId: RULE_PSA },
  // 斯柯达（明锐为 EA211 平台）
  { id: 'skoda_octavia', brand: '斯柯达', series: '明锐', engine: '1.4T', ruleSetId: RULE_VW },

  // ================= 第六轮补充（2026-08-03）：缺失的在售品牌 =================
  // 大众 ID. 家族 + 奥迪 Q4 e-tron（MEB 平台，依据上汽大众官方《ID.3 车型保养规范》）
  { id: 'vw_id3', brand: '大众', series: 'ID.3', engine: 'EV', ruleSetId: RULE_VW_EV },
  { id: 'vw_id4x', brand: '大众', series: 'ID.4 X', engine: 'EV', ruleSetId: RULE_VW_EV },
  { id: 'vw_id4c', brand: '大众', series: 'ID.4 CROZZ', engine: 'EV', ruleSetId: RULE_VW_EV },
  { id: 'vw_id6x', brand: '大众', series: 'ID.6 X', engine: 'EV', ruleSetId: RULE_VW_EV },
  { id: 'vw_id6c', brand: '大众', series: 'ID.6 CROZZ', engine: 'EV', ruleSetId: RULE_VW_EV },
  { id: 'audi_q4etron', brand: '奥迪', series: 'Q4 e-tron', engine: 'EV', ruleSetId: RULE_VW_EV },
  // 大众 / 奥迪燃油补充
  { id: 'vw_tayron', brand: '大众', series: '探岳', engine: '2.0T', ruleSetId: RULE_VW2 },
  { id: 'vw_tacqua', brand: '大众', series: '途铠', engine: '1.5L', ruleSetId: RULE_VW },
  { id: 'audi_a5l', brand: '奥迪', series: 'A5L', engine: '2.0T', ruleSetId: RULE_VW2 },
  // 吉利银河（雷神 EM-i / EM-P 电混与纯电）
  { id: 'galaxy_l7', brand: '吉利银河', series: 'L7', engine: 'EM-i', ruleSetId: RULE_GALAXY },
  { id: 'galaxy_l6', brand: '吉利银河', series: 'L6', engine: 'EM-i', ruleSetId: RULE_GALAXY },
  { id: 'galaxy_e5', brand: '吉利银河', series: 'E5', engine: 'EV', ruleSetId: RULE_GALAXY },
  { id: 'galaxy_xingyuan', brand: '吉利银河', series: '星愿', engine: 'EV', ruleSetId: RULE_GALAXY },
  { id: 'galaxy_starship7', brand: '吉利银河', series: '星舰7', engine: 'EM-i', ruleSetId: RULE_GALAXY },
  { id: 'galaxy_xingyao6', brand: '吉利银河', series: '星耀6', engine: 'EM-i', ruleSetId: RULE_GALAXY },
  { id: 'galaxy_m9', brand: '吉利银河', series: 'M9', engine: 'EM-P', ruleSetId: RULE_GALAXY },
  { id: 'lynk_08', brand: '领克', series: '08', engine: 'EM-P', ruleSetId: RULE_GALAXY },
  { id: 'lynk_09', brand: '领克', series: '09', engine: '2.0T', ruleSetId: RULE_GL },
  { id: 'geely_binrui', brand: '吉利', series: '缤瑞', engine: '1.4T', ruleSetId: RULE_GL },
  { id: 'geely_haoyue', brand: '吉利', series: '豪越', engine: '1.8T', ruleSetId: RULE_GL },
  // 长安启源（增程 / 插混）
  { id: 'qiyuan_a05', brand: '长安启源', series: 'A05', engine: '插混', ruleSetId: RULE_QIYUAN },
  { id: 'qiyuan_a07', brand: '长安启源', series: 'A07', engine: '增程', ruleSetId: RULE_QIYUAN },
  { id: 'qiyuan_q05', brand: '长安启源', series: 'Q05', engine: '插混', ruleSetId: RULE_QIYUAN },
  { id: 'qiyuan_e07', brand: '长安启源', series: 'E07', engine: '增程', ruleSetId: RULE_QIYUAN },
  // 阿维塔（CHN 平台：长安 + 华为 + 宁德时代；纯电与增程口径不同）
  { id: 'avatr_11', brand: '阿维塔', series: '阿维塔11', engine: 'EV', ruleSetId: RULE_AVATR },
  { id: 'avatr_12', brand: '阿维塔', series: '阿维塔12', engine: 'EV', ruleSetId: RULE_AVATR },
  { id: 'avatr_06', brand: '阿维塔', series: '阿维塔06', engine: 'EV', ruleSetId: RULE_AVATR },
  { id: 'avatr_12_reev', brand: '阿维塔', series: '阿维塔12 增程版', engine: '增程', ruleSetId: RULE_AVATR_REEV },
  { id: 'avatr_07', brand: '阿维塔', series: '阿维塔07', engine: '增程', ruleSetId: RULE_AVATR_REEV },
  // 极狐 ARCFOX（北汽新能源）
  { id: 'arcfox_alphas', brand: '极狐', series: '阿尔法S', engine: 'EV', ruleSetId: RULE_ARCFOX },
  { id: 'arcfox_alphat5', brand: '极狐', series: '阿尔法T5', engine: 'EV', ruleSetId: RULE_ARCFOX },
  { id: 'arcfox_alphas5', brand: '极狐', series: '阿尔法S5', engine: 'EV', ruleSetId: RULE_ARCFOX },
  { id: 'arcfox_koala', brand: '极狐', series: '考拉', engine: 'EV', ruleSetId: RULE_ARCFOX },
  // 北京汽车 BJ 系列（非承载式车身 + 分时四驱）
  { id: 'baic_bj40', brand: '北京汽车', series: 'BJ40', engine: '2.0T', ruleSetId: RULE_BAIC },
  { id: 'baic_bj60', brand: '北京汽车', series: 'BJ60', engine: '2.0T', ruleSetId: RULE_BAIC },
  { id: 'baic_bj80', brand: '北京汽车', series: 'BJ80', engine: '2.3T', ruleSetId: RULE_BAIC },
  // 江淮 瑞风 / 思皓
  { id: 'jac_s3', brand: '江淮', series: '瑞风S3', engine: '1.5L', ruleSetId: RULE_JAC },
  { id: 'jac_s4', brand: '江淮', series: '瑞风S4', engine: '1.5T', ruleSetId: RULE_JAC },
  { id: 'jac_m4', brand: '江淮', series: '瑞风M4', engine: '2.0L', ruleSetId: RULE_JAC },
  { id: 'jac_x8', brand: '江淮', series: '思皓X8', engine: '1.5T', ruleSetId: RULE_JAC },

  // ---------------- 第六轮补充：已有规则集下的热销车系 ----------------
  // 比亚迪
  { id: 'byd_seagull', brand: '比亚迪', series: '海鸥', engine: 'EV', ruleSetId: RULE_BYD_EV },
  { id: 'byd_songl', brand: '比亚迪', series: '宋L', engine: 'EV', ruleSetId: RULE_BYD_EV },
  { id: 'byd_sealion07', brand: '比亚迪', series: '海狮07', engine: 'EV', ruleSetId: RULE_BYD_EV },
  { id: 'byd_qinl', brand: '比亚迪', series: '秦L', engine: 'DM-i', ruleSetId: RULE_BYD_DMI },
  { id: 'byd_songpro', brand: '比亚迪', series: '宋Pro', engine: 'DM-i', ruleSetId: RULE_BYD_DMI },
  { id: 'byd_destroyer05', brand: '比亚迪', series: '驱逐舰05', engine: 'DM-i', ruleSetId: RULE_BYD_DMI },
  { id: 'byd_seal06', brand: '比亚迪', series: '海豹06', engine: 'DM-i', ruleSetId: RULE_BYD_DMI },
  // 丰田
  { id: 'toyota_frontlander', brand: '丰田', series: '锋兰达', engine: '2.0L', ruleSetId: RULE_TOYOTA },
  { id: 'toyota_corollacross', brand: '丰田', series: '卡罗拉锐放', engine: '2.0L', ruleSetId: RULE_TOYOTA },
  { id: 'toyota_wildlander', brand: '丰田', series: '威兰达', engine: '2.0L', ruleSetId: RULE_TOYOTA },
  { id: 'toyota_avalon', brand: '丰田', series: '亚洲龙', engine: '2.0L', ruleSetId: RULE_TOYOTA },
  { id: 'toyota_sienna', brand: '丰田', series: '赛那', engine: '2.5L 混动', ruleSetId: RULE_TOYOTA },
  // 本田
  { id: 'honda_breeze', brand: '本田', series: '皓影', engine: '1.5T', ruleSetId: RULE_HONDA },
  { id: 'honda_integra', brand: '本田', series: '型格', engine: '1.5T', ruleSetId: RULE_HONDA },
  { id: 'honda_zrv', brand: '本田', series: '致在', engine: '1.5T', ruleSetId: RULE_HONDA },
  { id: 'honda_inspire', brand: '本田', series: '英仕派', engine: '1.5T', ruleSetId: RULE_HONDA },
  // 日产
  { id: 'nissan_xtrail_ep', brand: '日产', series: '奇骏 超混电驱', engine: '混动', ruleSetId: RULE_NISSAN },
  { id: 'nissan_terra', brand: '日产', series: '途达', engine: '2.5L', ruleSetId: RULE_NISSAN },
  // 通用系
  { id: 'buick_envision_plus', brand: '别克', series: '昂科威Plus', engine: '2.0T', ruleSetId: RULE_GM },
  { id: 'cadillac_ct5', brand: '凯迪拉克', series: 'CT5', engine: '2.0T', ruleSetId: RULE_GM },
  // 长安 / 奇瑞 / 长城
  { id: 'changan_unik', brand: '长安', series: 'UNI-K', engine: '2.0T', ruleSetId: RULE_CHANGAN },
  { id: 'changan_cs35', brand: '长安', series: 'CS35 PLUS', engine: '1.6L', ruleSetId: RULE_CHANGAN },
  { id: 'chery_tiggo9', brand: '奇瑞', series: '瑞虎9', engine: '2.0T', ruleSetId: RULE_CHERY },
  { id: 'haval_dagou2', brand: '哈弗', series: '二代大狗', engine: '2.0T', ruleSetId: RULE_GWM },
  { id: 'tank_400', brand: '坦克', series: '400', engine: '3.0T', ruleSetId: RULE_GWM },
  { id: 'tank_500', brand: '坦克', series: '500', engine: '3.0T', ruleSetId: RULE_GWM },
  // 新势力热销补充
  { id: 'xpeng_mona', brand: '小鹏', series: 'MONA M03', engine: 'EV', ruleSetId: RULE_XPENG },
  { id: 'xpeng_p7plus', brand: '小鹏', series: 'P7+', engine: 'EV', ruleSetId: RULE_XPENG },
  { id: 'nio_et9', brand: '蔚来', series: 'ET9', engine: 'EV', ruleSetId: RULE_NIO },
  { id: 'zeekr_7x', brand: '极氪', series: '7X', engine: 'EV', ruleSetId: RULE_ZEEKR },
  { id: 'xiaomi_yu7', brand: '小米', series: 'YU7', engine: 'EV', ruleSetId: RULE_XIAOMI },
  { id: 'leapmotor_b10', brand: '零跑', series: 'B10', engine: 'EV', ruleSetId: RULE_LEAPMOTOR },
  { id: 'leapmotor_c16', brand: '零跑', series: 'C16', engine: 'EV', ruleSetId: RULE_LEAPMOTOR },
  { id: 'aito_m8', brand: '问界', series: 'M8', engine: '增程', ruleSetId: RULE_AITO },
  { id: 'deepal_s05', brand: '深蓝', series: 'S05', engine: '增程', ruleSetId: RULE_DEEPAL },
  { id: 'tesla_models', brand: '特斯拉', series: 'Model S', engine: 'EV', ruleSetId: RULE_TESLA },
  { id: 'tesla_modelx', brand: '特斯拉', series: 'Model X', engine: 'EV', ruleSetId: RULE_TESLA },
];

function getModel(id) {
  return MODELS.find((m) => m.id === id) || null;
}

// 按品牌分组，保持 MODELS 中的出现顺序，便于按品牌分类渲染
function getBrandGroups() {
  const map = {};
  const order = [];
  MODELS.forEach((m) => {
    if (!map[m.brand]) {
      map[m.brand] = { brand: m.brand, items: [] };
      order.push(m.brand);
    }
    map[m.brand].items.push(m);
  });
  return order.map((b) => map[b]);
}

// 品牌拼音/英文别名，提升搜索命中率（如输入 byd / vw / tesla）
const BRAND_ALIAS = {
  比亚迪: ['byd'], 大众: ['vw', 'dazhong'], 特斯拉: ['tesla'],
  丰田: ['toyota'], 本田: ['honda'], 宝马: ['bmw'], 奔驰: ['benz', 'mercedes'],
  奥迪: ['audi'], 现代: ['hyundai'], 日产: ['nissan'], 别克: ['buick'],
  福特: ['ford'], 吉利: ['geely'], 长安: ['changan'], 奇瑞: ['chery'],
  小鹏: ['xpeng'], 蔚来: ['nio'], 理想: ['li'], 问界: ['aito'],
  极氪: ['zeekr'], 哈弗: ['haval'], 领克: ['lynk'], 沃尔沃: ['volvo'],
  路虎: ['landrover', 'lr'], 保时捷: ['porsche'], 雪佛兰: ['chevrolet'],
  红旗: ['hongqi'], 丰田雷克萨斯: ['lexus'], 讴歌: ['acura'],
  斯柯达: ['skoda'], 马自达: ['mazda'], 三菱: ['mitsubishi', 'mitsu'],
  斯巴鲁: ['subaru'], 起亚: ['kia'], 凯迪拉克: ['cadillac', 'cad'],
  雪铁龙: ['citroen'], 标致: ['peugeot'], 长城: ['haval', 'greatwall'],
  名爵: ['mg', 'mingjue'], 捷达: ['jetta'], 捷途: ['jetour'], 星途: ['exeed'],
  岚图: ['voyah'], 宝骏: ['baojun'], 林肯: ['lincoln'], 铃木: ['suzuki'],
  smart: ['smart'], 方程豹: ['fangchengbao', 'bao'], 腾势: ['denza'],
  零跑: ['leapmotor'], 深蓝: ['deepal'], 智己: ['im'], 高合: ['hiphi'],
  哪吒: ['neta'], 欧拉: ['ora'], 五菱: ['wuling'], 荣威: ['roewe'],
  广汽埃安: ['aion'], 小米: ['xiaomi', 'mi'], 英菲尼迪: ['infiniti'],
  // 第六轮新增品牌别名
  吉利银河: ['galaxy', 'yinhe', 'geely'], 长安启源: ['qiyuan', 'changan', 'nevo'],
  阿维塔: ['avatr', 'aweita'], 极狐: ['arcfox', 'jihu'],
  北京汽车: ['baic', 'bj', 'beijing'], 江淮: ['jac', 'jianghuai', 'ruifeng'],
};

// 关键词搜索（品牌 / 车系 / 动力类型 / 品牌别名），忽略空格
function searchModels(keyword) {
  const kw = (keyword || '').trim().toLowerCase().replace(/\s+/g, '');
  if (!kw) return MODELS;
  return MODELS.filter((m) => {
    const hay = [
      m.brand,
      m.series,
      m.engine,
      (BRAND_ALIAS[m.brand] || []).join(' '),
    ]
      .join(' ')
      .toLowerCase()
      .replace(/\s+/g, '');
    return hay.indexOf(kw) !== -1;
  });
}

// 编辑车辆时按「规则集 + 车系」反查车型，用于回显已选车型（找不到返回 null，由调用方保留原值）
function findModel(ruleSetId, series) {
  return MODELS.find((m) => m.ruleSetId === ruleSetId && m.series === series) || null;
}

module.exports = { MODELS, getModel, getBrandGroups, searchModels, findModel };
