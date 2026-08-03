# Car Maintenance Guide Mini Program

A zero-backend WeChat Mini Program for car maintenance reminders and maintenance-cost awareness. The app runs its rule engine on-device and stores user-entered vehicle data in local WeChat storage.

## Features

- Vehicle profile creation and maintenance checklist generation
- On-device rule engine, no cloud functions or external server required
- Local storage only for vehicles, mileage, maintenance records, and favorites
- Maintenance item detail pages with status, evidence, and disclaimer text
- Articles about common maintenance pitfalls
- Privacy page and privacy authorization component for WeChat review flow

## Getting Started

1. Open WeChat DevTools.
2. Import this repository as a Mini Program project.
3. Use `touristappid` for local preview, or replace the `appid` in `project.config.json` with your own Mini Program AppID before uploading.
4. Compile and preview in WeChat DevTools.

## Privacy

This open-source version has the original AppID and local development settings removed. The app is designed to run without a backend and does not include server credentials, cloud environment IDs, or API tokens.

Before publishing your own version, review:

- `project.config.json`
- `privacy.json`
- `pages/privacy/privacy.*`
- WeChat public platform privacy settings

## Repository Hygiene

The following files are intentionally not included or ignored:

- `.workbuddy/`: local task and agent history
- `.vscode/`: local editor settings
- `project.private.config.json`: WeChat DevTools personal settings
- `.env*`, private keys, and temporary verification scripts

## License

MIT
