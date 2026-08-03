// utils/privacy.js —— 隐私授权管理器
// WeChat 自 2023 起要求小程序在收集个人信息前完成隐私授权。
// 职责：
//   1) 启动时通过 wx.getPrivacySetting 检测是否需授权；
//   2) 注册 wx.onNeedPrivacyAuthorize，拦截任何需要隐私授权的接口；
//   3) 通过全局事件总线，让任意页面里的 privacy-modal 弹出/收起；
//   4) 统一处理「同意 / 拒绝」。
// 基础库不支持这些接口时静默降级，绝不阻塞主链路。

let shown = false;
let resolveFn = null;
const listeners = new Set();

function notify() {
  listeners.forEach((cb) => {
    try {
      cb(shown, resolveFn);
    } catch (e) {
      console.warn('[privacy] listener error', e);
    }
  });
}

function setShown(s) {
  shown = s;
  notify();
}

// 页面组件订阅当前状态；订阅时立即回传一次，保证冷启动时弹窗状态对齐
function onPrivacyShow(cb) {
  listeners.add(cb);
  cb(shown, resolveFn);
  return () => listeners.delete(cb);
}

function initPrivacy() {
  try {
    // 拦截路径：任何需要隐私授权的接口被调用时，平台会先触发此回调
    if (typeof wx.onNeedPrivacyAuthorize === 'function') {
      wx.onNeedPrivacyAuthorize((resolve) => {
        resolveFn = resolve;
        setShown(true);
      });
    }
    // 启动路径：用户尚未同意过隐私政策
    if (typeof wx.getPrivacySetting === 'function') {
      wx.getPrivacySetting({
        success: (res) => {
          if (res && res.needAuthorization) {
            // 启动态授权由按钮 open-type 自动完成平台登记，这里无需保存 resolve
            resolveFn = null;
            setShown(true);
          }
        },
        fail: () => {},
      });
    }
  } catch (e) {
    console.warn('[privacy] 初始化失败（已降级）', e);
  }
}

// 用户点击「同意并继续」：先解决平台拦截回调，再收起弹层
function agree() {
  if (resolveFn) {
    try {
      resolveFn({ event: 'agree' });
    } catch (e) {
      console.warn('[privacy] resolve 失败', e);
    }
    resolveFn = null;
  }
  setShown(false);
}

// 用户点击「暂不使用」：仅收起弹层（不调用平台 resolve，保留未授权态）
function reject() {
  setShown(false);
}

module.exports = { initPrivacy, onPrivacyShow, agree, reject };
