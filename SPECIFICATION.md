基于我们在上一轮为菜鸟 App 编写并调试模块的实操经验（以及在你的 GitHub 仓库 [`ReLIFE-1/egern-modules`](https://github.com/ReLIFE-1/egern-modules) 中的沉淀），为你全面梳理**编写 Egern 模块的规范、核心注意事项与标准工作流**。

这份规范可作为我们后续快速高效开发新模块的“开发手记”与标准参考。

---

### 一、 核心避坑：模块载体格式（`.sgmodule` vs `.yaml`）

> **⚠️ 最重要原则**：在 Egern 的 **“工具 (Tools) -> 模块 (Modules) -> 从 URL 安装”** 体系下，**必须使用 Surge 模块规范（`.sgmodule` 纯文本格式）**，不要使用 `.yaml`。

* **历史教训**：直接将 `.yaml` 文件作为远程模块 URL 导入 Egern 时，解析器第一行期待读到 `#!name=...`，遇到 `name: ...` 会直接抛出：
  > `发生错误，位于第一行第一列`
* **定位区分**：
  * **`.yaml`**：仅适用于 Egern 的**全局完整配置文件（Profile）**。
  * **`.sgmodule`**：用于独立、可插拔的**功能模块（Module）**，也是 Egern 官方生态（如 NutRepo 松果库）的标准格式。

---

### 二、 模块元数据规范（Header）

每个 `.sgmodule` 文件顶部必须声明规范的元信息，用于在 Egern 模块列表和详情页完美展示：

```ini
#!name=模块中文名称
#!desc=清晰描述该模块实现的功能、屏蔽的广告范围及保留的正常功能
#!author=ReLIFE-1
#!icon=https://fastly.jsdelivr.net/gh/.../icon.png
#!category=去广告
#!system=iOS
```

* **`#!icon` 规范**：
  * 优先使用公共仓库或自己仓库托管的高清透明 PNG 图标（推荐经过 CDN 加速的 URL，如 jsDelivr）。
  * 也可以使用 iOS 原生 SF Symbol 图标名称（如 `#!icon=shippingbox.fill`）。
* **`#!author`**：统一签署你的署名（如 `ReLIFE-1`）。

---

### 三、 模块核心段落与语法规范

标准模块按从轻到重的处理层级，依次划分以下段落：

#### 1. `[Rule]`（域名层级分流与防御）
* **核心任务**：拦截广告追踪打点，以及**强制击穿阿里/腾讯/字节等大厂的 HTTPDNS**。
* **反 HTTPDNS 关键点**：
  * 国内大厂 App 普遍通过自己的 HTTPDNS 接口（如阿里的 `amdc.m.taobao.com`、腾讯的 HTTPDNS 等）直接下发解析好的 IP，从而绕过系统的本地 DNS。这会导致 MITM HTTPS 解密失效，广告规则被绕过。
  * **必须将 HTTPDNS 域名设为 `REJECT`**，强制 App 回退到系统本地 DNS 解析，确保流量走 Egern 的代理与 MITM。
* **语法示例**：
  ```ini
  [Rule]
  # 阻止阿里 HTTPDNS，确保 MITM 解密生效
  DOMAIN,amdc.m.taobao.com,REJECT
  # 拦截全局数据打点与广告域名
  DOMAIN,adashx.m.taobao.com,REJECT
  DOMAIN,optimus-ads.amap.com,REJECT
  ```

#### 2. `[URL Rewrite]`（轻量级正则重写 / 拦截）
* **原则**：纯广告接口优先用 Rewrite 阻断，**不引入 JS 脚本**，省电且响应极快。
* **重写动作选型**：
  * `reject-dict`（推荐）：返回 `{}`。适用于大部分 JSON API，避免客户端因为拿到 404/网络中断而报错闪退。
  * `reject-200`：返回空内容的 HTTP 200。
  * `reject-img`：返回 1x1 透明像素 GIF。
  * `reject`：直接重置连接（仅在客户端不挑返回体时使用）。
* **语法示例**：
  ```ini
  [URL Rewrite]
  # 阻断开屏与信息流广告
  ^https?:\/\/cn-acs\.m\.cainiao\.com\/gw\/mtop\.cainiao\.guoguo\.nbnetflow\.ads\.(show|mshow) - reject-dict
  ```

#### 3. `[Script]`（深度响应体净化）
* **原则**：仅在“正常业务数据与广告数据混合在同一个接口”时使用（如首页包裹流同时携带活动 Banner）。
* **关键参数**：
  * `type=http-response`
  * `script-path=https://.../script.js`（指向自托管的脚本 URL）
  * `requires-body=true`（必须显式声明需要读取 Body）
  * `max-size=-1`（防止大数据包被截断）
  * `timeout=60`（超时保护）
* **语法示例**：
  ```ini
  [Script]
  cainiao_clean = type=http-response, pattern=^https?:\/\/cn-acs\.m\.cainiao\.com\/gw\/mtop\.cainiao\.homepage, script-path=https://fastly.jsdelivr.net/gh/ReLIFE-1/egern-modules@main/scripts/cainiao.js, requires-body=true, max-size=-1, timeout=60
  ```

#### 4. `[MITM]`（证书解密范围）
* **原则**：
  * 必须使用 `%APPEND%` 前缀（`hostname = %APPEND% ...`），这样模块在启用时只会追加域名，不会覆盖用户原本设置的 MITM 主机名。
  * 尽量只精确指定 App 的核心 API 域名，避免通配符范围过大导致不相干应用出现证书信任问题或增加解密负担。
* **语法示例**：
  ```ini
  [MITM]
  hostname = %APPEND% *.cainiao.com, guide-acs.m.taobao.com
  ```

---

### 四、 JavaScript 净化脚本编写规范

在编写 `scripts/*.js` 响应体修改脚本时，必须遵守以下健壮性准则：

1. **强容错与防御性编程**：
   * 网络响应可能为 HTML、空字符串、非标准 JSON。必须使用 `try-catch` 包裹。
   * JSON 属性访问必须使用可选链（Optional Chaining `?.`），防止 `TypeError: Cannot read properties of undefined` 导致脚本崩溃、App 白屏。
2. **无论成功失败，必须执行 `$done()`**：
   * 在 `catch` 块中必须调用 `$done({})` 或原样返回，否则网络请求会一直挂起直到超时。
3. **精准剔除，避免误杀正常业务**：
   * 采用精准过滤（Filter）或有针对性的 `delete obj.data.banner`，绝不粗暴清空整个 `data` 数组，确保核心功能（如包裹号、取件码、用户信息）完整无损。
4. **代码模板结构**：
   ```javascript
   const url = $request.url;
   let body = $response.body;

   if (body) {
     try {
       let obj = JSON.parse(body);

       // 业务判断与清洗
       if (url.includes("specific.api.endpoint")) {
         if (obj?.data?.items?.length > 0) {
           obj.data.items = obj.data.items.filter(item => !["ad", "marketing"].includes(item.type));
         }
       }

       $done({ body: JSON.stringify(obj) });
     } catch (e) {
       console.log("Purge error: " + e);
       $done({ body });
     }
   } else {
     $done({});
   }
   ```

---

### 五、 仓库托管与分发交付规范

为了确保模块在中国大陆网络环境下的即开即用与长期稳定性，遵循以下发布标准：

1. **100% 独立自托管（Self-Hosted）**：
   * 模块 `.sgmodule` 和其引用的所有 `.js` 脚本统一存放在你自己的仓库（[`ReLIFE-1/egern-modules`](https://github.com/ReLIFE-1/egern-modules)）中。
   * 坚决不直接引用第三方志愿者的 GitHub raw 链接，防止对方仓库删库、重命名或改版导致你的模块突然失效。
2. **国内 CDN 加速镜像**：
   * GitHub 的 `raw.githubusercontent.com` 在国内经常阻断，分发时推荐提供 **jsDelivr CDN 链接**：
     `https://fastly.jsdelivr.net/gh/ReLIFE-1/egern-modules@main/<filename>.sgmodule`
3. **URL Scheme 一键导入**：
   * 提供封装好的 Safari 一键唤醒导入链接：
     `egern:/modules/new?url=https%3A%2F%2Ffastly.jsdelivr.net%2Fgh%2FReLIFE-1%2Fegern-modules%40main%2F<filename>.sgmodule`

---

### 六、 后续模块编写的标准执行流程

以后只要你提出“帮我写一个 XX App 去广告/净化模块”：

1. **接口逆向与抓包分析**：
   * 梳理目标 App 的核心 API 域名、HTTPDNS 调度域名。
   * 区分纯广告接口（进 Rewrite）和混合接口（进 Script）。
2. **本地编写与封装**：
   * 编写清洗脚本 `scripts/<app>.js`。
   * 编写符合 Surge 模块规范的 `<app>.sgmodule`（配置好图标、描述、作者名）。
3. **自动同步至你的 GitHub 仓库**：
   * 提交到 `ReLIFE-1/egern-modules`。
   * 自动生成对应的 CDN 链接和 Safari 一键导入链接。
4. **清理缓存与测试引导**：
   * 提供清除 App 后台、开启 MITM 信任证书的标准排查指南。
