// utils/favorites.js —— 避坑文章收藏（纯前端，本机 wx.storage）
// 数据只存本机，不上传任何服务器；与车辆/花费台账解耦，单独一个 key 管理。
// typeof wx 守卫：Node 测试环境下降级为内存数组，不影响主链路。

const KEY = 'baoyang_fav_articles';

function read() {
  try {
    if (typeof wx !== 'undefined' && wx.getStorageSync) {
      const v = wx.getStorageSync(KEY);
      return Array.isArray(v) ? v : [];
    }
  } catch (e) {}
  return [];
}

function write(list) {
  try {
    if (typeof wx !== 'undefined' && wx.setStorageSync) {
      wx.setStorageSync(KEY, list);
    }
  } catch (e) {}
}

function getIds() {
  return read();
}

function isFav(id) {
  return read().indexOf(id) !== -1;
}

// 切换收藏状态，返回切换后的布尔值（true=已收藏），便于调用方即时反馈
function toggle(id) {
  const list = read();
  const i = list.indexOf(id);
  let now;
  if (i === -1) {
    list.push(id);
    now = true;
  } else {
    list.splice(i, 1);
    now = false;
  }
  write(list);
  return now;
}

module.exports = { getIds, isFav, toggle };
