// data/rule_set_common.js —— 规则集公共片段（过度保养项）
// 由 rule_sets.js 与 rule_sets_ext.js 共用，保证「unnecessary→skip」差异化在所有规则集一致生效。
//
// 注意：以下为「多数车型通用」的过度保养项。若某品牌官方手册确实把该项列为正式保养项目
// （如保时捷把节气门清洗列入每 2 万公里），该品牌规则集须单独覆盖，不可一刀切标 unnecessary。

function upsellFuel() {
  return [
    { itemKey: 'engine_flush', name: '发动机内部养护 / 燃油宝', category: 'upsell', necessity: 'unnecessary', note: '厂商随车保养手册未列入此项目。使用合格标号燃油的车辆无需额外添加，正常保养周期内不会产生需要清洗的积碳量。' },
    { itemKey: 'throttle_clean', name: '节气门清洗', category: 'upsell', necessity: 'unnecessary', note: '非固定周期项目。仅在出现怠速不稳、抖动等症状时才需要清洗，无症状按里程强制清洗属于过度保养。' },
    { itemKey: 'ac_disinfect', name: '空调管道杀菌', category: 'upsell', necessity: 'unnecessary', note: '更换空调滤芯即可解决绝大部分异味问题。管道杀菌服务效果有限且不在厂商保养项目中。' },
    { itemKey: 'oil_additive', name: '机油添加剂 / 抗磨剂', category: 'upsell', necessity: 'unnecessary', note: '合格机油本身已含完整添加剂配方，额外添加可能破坏原有配比，主机厂普遍不推荐。' },
  ];
}

function upsellEv() {
  return [
    { itemKey: 'engine_flush', name: '发动机内部养护 / 燃油宝', category: 'upsell', necessity: 'unnecessary', note: '纯电动车无发动机，此类项目完全不适用。' },
    { itemKey: 'throttle_clean', name: '节气门清洗', category: 'upsell', necessity: 'unnecessary', note: '纯电动车无节气门，此类项目不适用。' },
    { itemKey: 'ac_disinfect', name: '空调管道杀菌', category: 'upsell', necessity: 'unnecessary', note: '更换空调滤芯即可解决绝大部分异味问题。' },
    { itemKey: 'oil_additive', name: '机油添加剂 / 抗磨剂', category: 'upsell', necessity: 'unnecessary', note: '纯电动车无发动机机油，此类项目不适用。' },
  ];
}

module.exports = { upsellFuel, upsellEv };
