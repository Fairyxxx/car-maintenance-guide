# 保养指南小程序

[English](README.md) | [简体中文](README.zh-CN.md)

一个零后端的微信小程序，用于帮助车主记录车辆信息、生成保养建议清单，并了解常见保养避坑知识。规则引擎在小程序端本地运行，用户填写的车辆、里程、保养记录等数据仅保存在微信本地存储中。

## 功能特性

- 车辆档案创建与保养体检清单生成
- 端上规则引擎，无需云函数、服务器或数据库
- 车辆、里程、保养记录、收藏等数据仅本地存储
- 单项保养详情页，展示状态、判断依据和免责声明
- 常见保养项目避坑文章
- 内置隐私页和微信隐私授权组件，方便提审配置

## 快速开始

1. 打开微信开发者工具。
2. 导入本仓库目录。
3. 本地预览可使用 `touristappid`；正式上传前，请将 `project.config.json` 中的 `appid` 替换为你自己的小程序 AppID。
4. 点击编译并在开发者工具或真机中预览。

## 隐私与脱敏

本开源版本已经移除原始 AppID 和本地开发者工具私有配置。项目设计为零后端运行，不包含服务器密钥、云环境 ID、API Token 或数据库连接信息。

正式发布你自己的版本前，建议检查：

- `project.config.json`
- `privacy.json`
- `pages/privacy/privacy.*`
- 微信公众平台中的用户隐私保护指引

## 目录结构

```text
.
├── app.js / app.json / app.wxss
├── project.config.json
├── privacy.json
├── assets/
├── components/
├── data/
├── pages/
├── subpackages/
└── utils/
```

## 仓库清理策略

以下内容不会进入开源仓库，或已在 `.gitignore` 中忽略：

- `.workbuddy/`：本地任务和代理历史
- `.vscode/`：本地编辑器配置
- `project.private.config.json`：微信开发者工具个人配置
- `.env*`、私钥和临时校验脚本

## 发布前检查

- 将 `touristappid` 替换为自己的小程序 AppID
- 在微信公众平台配置隐私保护指引
- 使用微信开发者工具编译并真机预览
- 确认没有提交本地私有配置、密钥或临时文件

## License

MIT
