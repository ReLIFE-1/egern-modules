# 📦 Egern Modules

个人自用的 Egern 远程模块集合仓库。

---

## 📌 模块列表

### 1. 菜鸟 App 去广告净化 (`cainiao.sgmodule`)

<img src="https://fastly.jsdelivr.net/gh/zirawell/R-Store@main/Res/Icon/App/cainiao.png" width="48" height="48" alt="菜鸟" />

* **模块说明**：去除菜鸟 App 开屏广告、首页大横幅与瀑布流、搜索栏热词、个人中心营销推广、问卷弹窗等，完整保留包裹查询与取件码功能。
* **作者**：`ReLIFE-1`
* **CDN 订阅链接（推荐）**：
  ```text
  https://fastly.jsdelivr.net/gh/ReLIFE-1/egern-modules@main/cainiao.sgmodule
  ```
* **GitHub 原始链接**：
  ```text
  https://raw.githubusercontent.com/ReLIFE-1/egern-modules/main/cainiao.sgmodule
  ```
* **一键安装链接**：
  [📱 在 iOS Safari 中点击一键导入 Egern](egern:/modules/new?url=https%3A%2F%2Ffastly.jsdelivr.net%2Fgh%2FReLIFE-1%2Fegern-modules%40main%2Fcainiao.sgmodule)

---

### 2. 京东 App 去广告与比价 (`jingdong.sgmodule`)

<img src="https://fastly.jsdelivr.net/gh/sooyaaabo/IconLibrary@main/App/JingDong.png" width="48" height="48" alt="京东" />

* **模块说明**：过滤京东开屏广告、首页营销与通栏推广、订单中心广告、个人中心横幅与红点，并支持商品历史价格比价（表格图/折线图）。
* **作者**：`ReLIFE-1`
* **比价说明**：首次使用前请先打开【慢慢买】App，提示获取 Cookie 成功后即可正常比价；默认预设启用表格图嵌入比价。
* **CDN 订阅链接（推荐）**：
  ```text
  https://fastly.jsdelivr.net/gh/ReLIFE-1/egern-modules@main/jingdong.sgmodule
  ```
* **GitHub 原始链接**：
  ```text
  https://raw.githubusercontent.com/ReLIFE-1/egern-modules/main/jingdong.sgmodule
  ```
* **一键安装链接**：
  [📱 在 iOS Safari 中点击一键导入 Egern](egern:/modules/new?url=https%3A%2F%2Ffastly.jsdelivr.net%2Fgh%2FReLIFE-1%2Fegern-modules%40main%2Fjingdong.sgmodule)

---

## ⚙️ 使用说明

1. 确保 Egern 已生成并安装 CA 证书，在 iOS **设置 -> 通用 -> 关于本机 -> 证书信任设置** 中开启完全信任。
2. 复制上方 CDN 链接，在 Egern 中点击 **工具 -> 模块 -> + -> 从 URL 安装** 即可添加并启用。
3. 初次使用请彻底杀掉对应 App 后台并重新打开以刷新本地缓存。

---

## 📖 开发与编写规范

本项目的所有模块均严格遵循 [Egern 模块编写规范与注意事项](SPECIFICATION.md)，包含模块格式选型、反 HTTPDNS 策略、轻量化重写与防御性脚本编写标准。
