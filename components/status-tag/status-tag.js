// components/status-tag/status-tag.js
Component({
  properties: {
    status: { type: String, value: '' },   // overdue | soon | ok | skip
    label: { type: String, value: '' },      // 可覆盖默认文案
    size: { type: String, value: 'normal' }, // normal | small
  },
  data: {
    map: {
      overdue: { text: '立即更换', cls: 'overdue' },
      soon: { text: '建议关注', cls: 'soon' },
      ok: { text: '暂不用换', cls: 'ok' },
      skip: { text: '无需理会', cls: 'skip' },
    },
  },
});
