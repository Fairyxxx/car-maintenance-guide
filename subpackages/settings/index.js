// subpackages/settings/index.js —— 设置 / 隐私 / 关于
// 纯前端，零后端：所有数据存于本机 wx.storage，不上传任何服务器。

const { exportData, importData, reset } = require('../../utils/api');

Page({
  data: {
    privacy: [
      '我们仅收集你主动填写的车型、里程与保养记录，用于生成保养建议。',
      '所有数据默认仅保存在本机本地，不上传任何服务器。',
      '我们不收集车牌等可直接定位个人的信息。',
      '你可以随时在「我的车辆」中更新或删除数据。',
      '保养建议基于厂商保养手册整理，仅供参考，不构成维修指令。',
    ],
  },

  clearCache() {
    wx.showModal({
      title: '清空本地缓存',
      content: '将清除本机保存的车辆与保养记录，且无法恢复。如需保留，请先「备份我的数据」，换机后再「恢复备份数据」。',
      confirmText: '确认清空',
      confirmColor: '#ff4d6d',
      success: (r) => {
        if (r.confirm) {
          wx.clearStorageSync();
          reset(); // 同步重置引擎内存态，否则 reLaunch 后车辆会重新出现
          wx.showToast({ title: '已清空', icon: 'success' });
          setTimeout(() => wx.reLaunch({ url: '/pages/index/index' }), 600);
        }
      },
    });
  },

  // 从剪贴板恢复备份：把此前「备份我的数据」复制出来的文本粘贴回来，
  // 即可在新设备/重装后还原车辆与保养记录，补全零后端架构的数据安全闭环。
  restoreData() {
    wx.getClipboardData({
      success: (res) => {
        const text = (res.data || '').trim();
        if (!text) {
          wx.showToast({ title: '剪贴板为空', icon: 'none' });
          return;
        }
        wx.showModal({
          title: '恢复备份数据',
          content: '将用备份覆盖当前本机数据且无法撤销。建议先备份现有数据。确定继续？',
          confirmText: '恢复',
          confirmColor: '#00f0ff',
          success: (m) => {
            if (!m.confirm) return;
            importData(text)
              .then((r) => {
                wx.showToast({ title: '已恢复 ' + (r.data && r.data.count || 0) + ' 辆车', icon: 'success' });
                setTimeout(() => wx.reLaunch({ url: '/pages/index/index' }), 700);
              })
              .catch((e) => {
                wx.showToast({ title: (e && e.message) || '恢复失败', icon: 'none' });
              });
          },
        });
      },
      fail: () => {
        wx.showToast({ title: '读取剪贴板失败', icon: 'none' });
      },
    });
  },

  // 备份本机数据到剪贴板：零后端架构下数据只存本机，换机/卸载会丢，
  // 给用户一份可粘贴到备忘录的纯文本备份，是正式版该有的数据安全能力。
  async backupData() {
    try {
      const res = await exportData();
      const d = res && res.data;
      if (!d || !d.vehicles || !d.vehicles.length) {
        wx.showToast({ title: '暂无数据可备份', icon: 'none' });
        return;
      }
      wx.setClipboardData({
        data: JSON.stringify(d),
        success: () => {
          wx.showToast({ title: '已复制备份文本', icon: 'success' });
        },
        fail: () => {
          wx.showToast({ title: '复制失败，请重试', icon: 'none' });
        },
      });
    } catch (e) {
      wx.showToast({ title: '备份失败', icon: 'none' });
    }
  },

  openPrivacy() {
    wx.navigateTo({ url: '/pages/privacy/privacy' });
  },
});
