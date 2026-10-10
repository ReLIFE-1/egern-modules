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
  https://cdn.jsdelivr.net/gh/ReLIFE-1/egern-modules@main/cainiao.sgmodule
  ```
* **GitHub 原始链接**：
  ```text
  https://raw.githubusercontent.com/ReLIFE-1/egern-modules/main/cainiao.sgmodule
  ```
* **一键安装链接**：
  [📱 在 iOS Safari 中点击一键导入 Egern](egern:/modules/new?url=https%3A%2F%2Fcdn.jsdelivr.net%2Fgh%2FReLIFE-1%2Fegern-modules%40main%2Fcainiao.sgmodule)

---

### 2. 京东 App 去广告与比价 (`jingdong.sgmodule` / `jingdong.plugin`)

<img src="https://cdn.jsdelivr.net/gh/sooyaaabo/IconLibrary@main/App/JingDong.png" width="48" height="48" alt="京东" />

* **模块说明**：过滤京东开屏广告、首页营销与通栏推广、订单中心广告、个人中心横幅与红点，支持商品历史价格比价（表格图 / 折线图 / 标题嵌入 / 通知版）。
* **作者**：`ReLIFE-1`
* **图形化开关支持**：支持在 Egern **编辑模块** 页面直接通过原生 UI 开关按需切换比价模式：
  * `[京东比价]获取慢慢买 Cookie`（默认开启）
  * `[京东比价]标题嵌入版`（默认关闭）
  * `[京东比价]详情通知版`（默认关闭）
  * `[京东比价]详情嵌入版（表格图）`（默认开启）
  * `[京东比价]详情嵌入版（折线图）`（默认关闭）
* **⚠️ 获取慢慢买 Cookie 详细步骤**：
  1. 必须确保 Egern CA 证书已在 iOS **设置 -> 通用 -> 关于本机 -> 证书信任设置** 中开启完全信任，且 Egern MITM 已启用。
  2. 彻底划掉杀掉后台的【慢慢买】App，重新打开慢慢买，打开时系统将弹出通知提示：
     > `🔔 慢慢买：已拦截请求，正在提取凭证...`（若弹出此通知，证明 Egern MITM 拦截成功生效！）
  3. 点击底栏最右侧的**【我的】**，系统将弹出通知提示：
     > `🔔 获取ck成功🎉 慢慢买凭证获取成功！设备ID: xxx`
  4. 提示成功后，直接打开京东 App 进入任意商品详情页即可正常比价。
* **CDN 订阅链接（推荐）**：
  ```text
  https://cdn.jsdelivr.net/gh/ReLIFE-1/egern-modules@main/jingdong.sgmodule
  ```
* **Loon Plugin 格式订阅（兼容 Egern）**：
  ```text
  https://cdn.jsdelivr.net/gh/ReLIFE-1/egern-modules@main/jingdong.plugin
  ```
* **GitHub 原始链接**：
  ```text
  https://raw.githubusercontent.com/ReLIFE-1/egern-modules/main/jingdong.sgmodule
  ```
* **一键安装链接**：
  [📱 在 iOS Safari 中点击一键导入 Egern](egern:/modules/new?url=https%3A%2F%2Fcdn.jsdelivr.net%2Fgh%2FReLIFE-1%2Fegern-modules%40main%2Fjingdong.sgmodule)

---

## ⚙️ 使用说明

1. 确保 Egern 已生成并安装 CA 证书，在 iOS **设置 -> 通用 -> 关于本机 -> 证书信任设置** 中开启完全信任。
2. 复制上方 CDN 链接，在 Egern 中点击 **工具 -> 模块 -> + -> 从 URL 安装** 即可添加并启用。
3. 初次使用请彻底杀掉对应 App 后台并重新打开以刷新本地缓存。

---

## 📖 开发与编写规范

本项目的所有模块均严格遵循 [Egern 模块编写规范与注意事项](SPECIFICATION.md)，包含模块格式选型、反 HTTPDNS 策略、轻量化重写与防御性脚本编写标准。
