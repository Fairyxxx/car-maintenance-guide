# Car Maintenance Guide Mini Program

[English](README.md) | [简体中文](README.zh-CN.md)

A native WeChat Mini Program that helps car owners understand routine maintenance timing, track vehicle records, and avoid unnecessary maintenance upsells. It runs entirely on the client side, with an on-device rule engine and local WeChat storage.

## Features

- Create vehicle profiles with model, mileage, and usage conditions
- Generate maintenance checklists from built-in rule sets
- View maintenance item status, reasoning, and reference notes
- Record maintenance history and cost entries locally
- Browse practical articles about common maintenance pitfalls
- Use without a backend server, cloud functions, or database

## Tech Stack

- WeChat Mini Program native framework
- JavaScript
- WXML
- WXSS
- WeChat local storage through `wx.storage`
- Client-side rule engine in `utils/engine.js`

## Getting Started

1. Install and open WeChat DevTools.
2. Import this repository as a Mini Program project.
3. Use `touristappid` for local development, or replace the `appid` in `project.config.json` with your own Mini Program AppID.
4. Click Compile in WeChat DevTools.
5. Preview the app in the simulator or on a real device.

## Project Structure

```text
.
├── app.js / app.json / app.wxss
├── assets/
├── components/
├── data/
├── pages/
├── subpackages/
└── utils/
```

## Notes

This project is designed as a zero-backend Mini Program. Vehicle data, mileage, maintenance records, and favorites are stored on the user's device through WeChat local storage.

## License

MIT
