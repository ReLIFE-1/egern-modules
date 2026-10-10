// 京东比价（表格图嵌入版 & 标题嵌入版）
// 深度重构版：完美兼容 Egern / Loon / Surge / Shadowrocket / Quantumult X
// 具备完整异常防御、深浅色模式自适应与无凭证时友好页内引导

(function () {
  const Storage = {
    get: function (key) {
      try {
        if (typeof $persistentStore !== "undefined" && $persistentStore.read) {
          return $persistentStore.read(key);
        }
        if (typeof $prefs !== "undefined" && $prefs.valueForKey) {
          return $prefs.valueForKey(key);
        }
      } catch (_) {}
      return null;
    },
    set: function (key, val) {
      try {
        if (typeof $persistentStore !== "undefined" && $persistentStore.write) {
          return $persistentStore.write(String(val), key);
        }
        if (typeof $prefs !== "undefined" && $prefs.setValueForKey) {
          return $prefs.setValueForKey(String(val), key);
        }
      } catch (_) {}
      return false;
    }
  };

  const Notify = function (title, subtitle, body, opts) {
    console.log(`[京东比价] ${title} | ${subtitle}: ${body}`);
    try {
      if (typeof $notification !== "undefined" && typeof $notification.post === "function") {
        $notification.post(title, subtitle, body, opts || {});
        return;
      }
      if (typeof $notify === "function") {
        $notify(title, subtitle, body, opts || {});
        return;
      }
      if (typeof ctx !== "undefined" && typeof ctx.notify === "function") {
        ctx.notify({ title: title, subtitle: subtitle, body: body });
        return;
      }
    } catch (e) {
      console.log(`[通知发送失败] ${e}`);
    }
  };

  const HttpClient = {
    post: function (options) {
      return new Promise((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error("HTTP request timeout")), options.timeout || 12000);
        try {
          if (typeof $httpClient !== "undefined" && $httpClient.post) {
            $httpClient.post(options, (err, resp, body) => {
              clearTimeout(timer);
              if (err) reject(err);
              else resolve({ status: resp?.status || resp?.statusCode, headers: resp?.headers, body });
            });
            return;
          }
          if (typeof $task !== "undefined" && $task.fetch) {
            $task.fetch({ ...options, method: "POST" }).then(
              (resp) => {
                clearTimeout(timer);
                resolve({ status: resp.statusCode, headers: resp.headers, body: resp.body });
              },
              (err) => {
                clearTimeout(timer);
                reject(err);
              }
            );
            return;
          }
          clearTimeout(timer);
          reject(new Error("No supported HTTP client found"));
        } catch (e) {
          clearTimeout(timer);
          reject(e);
        }
      });
    }
  };

  // 纯 JavaScript 标准 MD5
  function md5(string) {
    function rotateLeft(lValue, iShiftBits) {
      return (lValue << iShiftBits) | (lValue >>> (32 - iShiftBits));
    }
    function addUnsigned(lX, lY) {
      var lX4, lY4, lX8, lY8, lResult;
      lX8 = lX & 0x80000000;
      lY8 = lY & 0x80000000;
      lX4 = lX & 0x40000000;
      lY4 = lY & 0x40000000;
      lResult = (lX & 0x3fffffff) + (lY & 0x3fffffff);
      if (lX4 & lY4) return lResult ^ 0x80000000 ^ lX8 ^ lY8;
      if (lX4 | lY4) {
        if (lResult & 0x40000000) return lResult ^ 0xc0000000 ^ lX8 ^ lY8;
        else return lResult ^ 0x40000000 ^ lX8 ^ lY8;
      } else return lResult ^ lX8 ^ lY8;
    }
    function F(x, y, z) { return (x & y) | (~x & z); }
    function G(x, y, z) { return (x & z) | (y & ~z); }
    function H(x, y, z) { return x ^ y ^ z; }
    function I(x, y, z) { return y ^ (x | ~z); }
    function FF(a, b, c, d, x, s, ac) {
      a = addUnsigned(a, addUnsigned(addUnsigned(F(b, c, d), x), ac));
      return addUnsigned(rotateLeft(a, s), b);
    }
    function GG(a, b, c, d, x, s, ac) {
      a = addUnsigned(a, addUnsigned(addUnsigned(G(b, c, d), x), ac));
      return addUnsigned(rotateLeft(a, s), b);
    }
    function HH(a, b, c, d, x, s, ac) {
      a = addUnsigned(a, addUnsigned(addUnsigned(H(b, c, d), x), ac));
      return addUnsigned(rotateLeft(a, s), b);
    }
    function II(a, b, c, d, x, s, ac) {
      a = addUnsigned(a, addUnsigned(addUnsigned(I(b, c, d), x), ac));
      return addUnsigned(rotateLeft(a, s), b);
    }
    function convertToWordArray(str) {
      var lWordCount;
      var lMessageLength = str.length;
      var lNumberOfWords_temp1 = lMessageLength + 8;
      var lNumberOfWords_temp2 = (lNumberOfWords_temp1 - (lNumberOfWords_temp1 % 64)) / 64;
      var lNumberOfWords = (lNumberOfWords_temp2 + 1) * 16;
      var lWordArray = Array(lNumberOfWords - 1);
      var lBytePosition = 0;
      var lByteCount = 0;
      while (lByteCount < lMessageLength) {
        lWordCount = (lByteCount - (lByteCount % 4)) / 4;
        lBytePosition = (lByteCount % 4) * 8;
        lWordArray[lWordCount] = lWordArray[lWordCount] | (str.charCodeAt(lByteCount) << lBytePosition);
        lByteCount++;
      }
      lWordCount = (lByteCount - (lByteCount % 4)) / 4;
      lBytePosition = (lByteCount % 4) * 8;
      lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80 << lBytePosition);
      lWordArray[lNumberOfWords - 2] = lMessageLength << 3;
      lWordArray[lNumberOfWords - 1] = lMessageLength >>> 29;
      return lWordArray;
    }
    function wordToHex(lValue) {
      var WordToHexValue = "", WordToHexValue_temp = "", lByte, lCount;
      for (lCount = 0; lCount <= 3; lCount++) {
        lByte = (lValue >>> (lCount * 8)) & 255;
        WordToHexValue_temp = "0" + lByte.toString(16);
        WordToHexValue = WordToHexValue + WordToHexValue_temp.substr(WordToHexValue_temp.length - 2, 2);
      }
      return WordToHexValue;
    }
    function utf8Encode(str) {
      str = str.replace(/\r\n/g, "\n");
      var utftext = "";
      for (var n = 0; n < str.length; n++) {
        var c = str.charCodeAt(n);
        if (c < 128) utftext += String.fromCharCode(c);
        else if (c > 127 && c < 2048) {
          utftext += String.fromCharCode((c >> 6) | 192);
          utftext += String.fromCharCode((c & 63) | 128);
        } else {
          utftext += String.fromCharCode((c >> 12) | 224);
          utftext += String.fromCharCode(((c >> 6) & 63) | 128);
          utftext += String.fromCharCode((c & 63) | 128);
        }
      }
      return utftext;
    }
    var x = Array();
    var k, AA, BB, CC, DD, a, b, c, d;
    var S11 = 7, S12 = 12, S13 = 17, S14 = 22;
    var S21 = 5, S22 = 9, S23 = 14, S24 = 20;
    var S31 = 4, S32 = 11, S33 = 16, S34 = 23;
    var S41 = 6, S42 = 10, S43 = 15, S44 = 21;
    str = utf8Encode(string);
    x = convertToWordArray(str);
    a = 0x67452301; b = 0xefcdab89; c = 0x98badcfe; d = 0x10325476;
    for (k = 0; k < x.length; k += 16) {
      AA = a; BB = b; CC = c; DD = d;
      a = FF(a, b, c, d, x[k + 0], S11, 0xd76aa478);
      d = FF(d, a, b, c, x[k + 1], S12, 0xe8c7b756);
      c = FF(c, d, a, b, x[k + 2], S13, 0x242070db);
      b = FF(b, c, d, a, x[k + 3], S14, 0xc1bdceee);
      a = FF(a, b, c, d, x[k + 4], S11, 0xf57c0faf);
      d = FF(d, a, b, c, x[k + 5], S12, 0x4787c62a);
      c = FF(c, d, a, b, x[k + 6], S13, 0xa8304613);
      b = FF(b, c, d, a, x[k + 7], S14, 0xfd469501);
      a = FF(a, b, c, d, x[k + 8], S11, 0x698098d8);
      d = FF(d, a, b, c, x[k + 9], S12, 0x8b44f7af);
      c = FF(c, d, a, b, x[k + 10], S13, 0xffff5bb1);
      b = FF(b, c, d, a, x[k + 11], S14, 0x895cd7be);
      a = FF(a, b, c, d, x[k + 12], S11, 0x6b901122);
      d = FF(d, a, b, c, x[k + 13], S12, 0xfd987193);
      c = FF(c, d, a, b, x[k + 14], S13, 0xa679438e);
      b = FF(b, c, d, a, x[k + 15], S14, 0x49b40821);
      a = GG(a, b, c, d, x[k + 1], S21, 0xf61e2562);
      d = GG(d, a, b, c, x[k + 6], S22, 0xc040b340);
      c = GG(c, d, a, b, x[k + 11], S23, 0x265e5a51);
      b = GG(b, c, d, a, x[k + 0], S24, 0xe9b6c7aa);
      a = GG(a, b, c, d, x[k + 5], S21, 0xd62f105d);
      d = GG(d, a, b, c, x[k + 10], S22, 0x2441453);
      c = GG(c, d, a, b, x[k + 15], S23, 0xd8a1e681);
      b = GG(b, c, d, a, x[k + 4], S24, 0xe7d3fbc8);
      a = GG(a, b, c, d, x[k + 9], S21, 0x21e1cde6);
      d = GG(d, a, b, c, x[k + 14], S22, 0xc33707d6);
      c = GG(c, d, a, b, x[k + 3], S23, 0xf4d50d87);
      b = GG(b, c, d, a, x[k + 8], S24, 0x455a14ed);
      a = GG(a, b, c, d, x[k + 13], S21, 0xa9e3e905);
      d = GG(d, a, b, c, x[k + 2], S22, 0xfcefa3f8);
      c = GG(c, d, a, b, x[k + 7], S23, 0x676f02d9);
      b = GG(b, c, d, a, x[k + 12], S24, 0x8d2a4c8a);
      a = HH(a, b, c, d, x[k + 5], S31, 0xfffa3942);
      d = HH(d, a, b, c, x[k + 8], S32, 0x8771f681);
      c = HH(c, d, a, b, x[k + 11], S33, 0x6d9d6122);
      b = HH(b, c, d, a, x[k + 14], S34, 0xfde5380c);
      a = HH(a, b, c, d, x[k + 1], S31, 0xa4beea44);
      d = HH(d, a, b, c, x[k + 4], S32, 0x4bdecfa9);
      c = HH(c, d, a, b, x[k + 7], S33, 0xf6bb4b60);
      b = HH(b, c, d, a, x[k + 10], S34, 0xbebfbc70);
      a = HH(a, b, c, d, x[k + 13], S31, 0x289b7ec6);
      d = HH(d, a, b, c, x[k + 0], S32, 0xeaa127fa);
      c = HH(c, d, a, b, x[k + 3], S33, 0xd4ef3085);
      b = HH(b, c, d, a, x[k + 6], S34, 0x4881d05);
      a = HH(a, b, c, d, x[k + 9], S31, 0xd9d4d039);
      d = HH(d, a, b, c, x[k + 12], S32, 0xe6db99e5);
      c = HH(c, d, a, b, x[k + 15], S33, 0x1fa27cf8);
      b = HH(b, c, d, a, x[k + 2], S34, 0xc4ac5665);
      a = II(a, b, c, d, x[k + 0], S41, 0xf4292244);
      d = II(d, a, b, c, x[k + 7], S42, 0x432aff97);
      c = II(c, d, a, b, x[k + 14], S43, 0xab9423a7);
      b = II(b, c, d, a, x[k + 5], S44, 0xfc93a039);
      a = II(a, b, c, d, x[k + 12], S41, 0x655b59c3);
      d = II(d, a, b, c, x[k + 3], S42, 0x8f0ccc92);
      c = II(c, d, a, b, x[k + 10], S43, 0xffeff47d);
      b = II(b, c, d, a, x[k + 1], S44, 0x85845dd1);
      a = II(a, b, c, d, x[k + 8], S41, 0x6fa87e4f);
      d = II(d, a, b, c, x[k + 15], S42, 0xfe2ce6e0);
      c = II(c, d, a, b, x[k + 6], S43, 0xa3014314);
      b = II(b, c, d, a, x[k + 13], S44, 0x4e0811a1);
      a = II(a, b, c, d, x[k + 4], S41, 0xf7537e82);
      d = II(d, a, b, c, x[k + 11], S42, 0xbd3af235);
      c = II(c, d, a, b, x[k + 2], S43, 0x2ad7d2bb);
      b = II(b, c, d, a, x[k + 9], S44, 0xeb86d391);
      a = addUnsigned(a, AA);
      b = addUnsigned(b, BB);
      c = addUnsigned(c, CC);
      d = addUnsigned(d, DD);
    }
    return (wordToHex(a) + wordToHex(b) + wordToHex(c) + wordToHex(d)).toLowerCase();
  }

  function jsonToCustomString(jsonObject) {
    return Object.keys(jsonObject)
      .filter((key) => jsonObject[key] !== "" && key.toLowerCase() !== "token")
      .sort()
      .map((key) => `${key.toUpperCase()}${String(jsonObject[key]).toUpperCase()}`)
      .join("");
  }

  function jsonToQueryString(jsonObject) {
    return Object.keys(jsonObject)
      .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(jsonObject[key])}`)
      .join("&");
  }

  const req = typeof $request !== "undefined" ? $request : null;
  const resp = typeof $response !== "undefined" ? $response : null;
  const url = req?.url || "";
  const reqBody = req?.body || "";
  let respBody = resp?.body || "";

  // 1. 慢慢买 Cookie 兜底捕获（如果用户只开启了此脚本）
  if (url.includes("/baoliao/center/menu") && reqBody) {
    try {
      let devId = null;
      try {
        const params = new URLSearchParams(reqBody);
        devId = params.get("c_mmbDevId") || params.get("c_mmbdevid");
      } catch (_) {}
      if (!devId) {
        const m = /c_mmbdevid=([^&"\s]+)/i.exec(reqBody);
        if (m) devId = m[1];
      }
      if (devId) {
        Storage.set("慢慢买CK", devId);
        Storage.set("manmanbuy_val", reqBody);
        Storage.set("mmb_ck", `c_mmbDevId=${devId}`);
        Notify("🎉 慢慢买：获取CK成功", `设备ID: ${devId}`, "凭证已成功保存，现在可以正常查看京东比价。");
      }
    } catch (e) {
      console.log(`[嵌入脚本捕获Cookie异常] ${e}`);
    }
    if (typeof $done === "function") $done({});
    return;
  }

  // 2. 京东详情页嵌入式比价（表格图版）
  const match = url.match(/product\/graphext\/(\d+)\.html/);
  if (match) {
    (async () => {
      try {
        const productId = match[1];
        const savedDevId = Storage.get("慢慢买CK");
        const savedVal = Storage.get("manmanbuy_val");

        // 未获取到 CK 时，在页面内注入温馨提示卡片，而不是空白或报错
        if (!savedDevId && !savedVal) {
          const promptHtml = `
            <div style="max-width:92%;margin:16px auto;padding:14px 16px;background:#FFF2F0;border:1px solid #FFCCC7;border-radius:10px;font-size:13px;color:#CF1322;line-height:1.6;box-shadow:0 2px 8px rgba(0,0,0,0.04);">
              <div style="font-weight:bold;font-size:14px;margin-bottom:4px;">⚠️ 未检测到慢慢买比价凭证</div>
              <div>首次使用请先打开【慢慢买】App，点击底栏最右侧【我的】。<br>收到“获取CK成功”通知后，刷新此页即可查看历史价格表格。</div>
            </div>
          `;
          respBody = respBody ? respBody.replace(/<body[^>]*>/i, (m) => `${m}\n${promptHtml}`) : promptHtml;
          return;
        }

        const devId = savedDevId || (new URLSearchParams(savedVal).get("c_mmbDevId"));
        const SECRET_KEY = "3E41D1331F5DDAFCD0A38FE2D52FF66F";

        const sendMmb = async (payload, apiPath) => {
          const reqObj = {
            ...payload,
            c_mmbDevId: devId,
            c_appver: "4.8.3.1",
            t: Date.now().toString()
          };
          delete reqObj.token;
          reqObj.token = md5(encodeURIComponent(SECRET_KEY + jsonToCustomString(reqObj) + SECRET_KEY)).toUpperCase();

          const res = await HttpClient.post({
            url: apiPath,
            headers: {
              "Content-Type": "application/x-www-form-urlencoded;charset=utf-8",
              "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 15_6_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 - mmbWebBrowse - ios"
            },
            body: jsonToQueryString(reqObj)
          });
          return JSON.parse(res.body || "{}");
        };

        const itemUrl = `https://item.jd.com/${productId}.html`;

        // 步骤 1：查询基本信息获取 spbh
        const basicRes = await sendMmb({
          methodName: "getHistoryInfoJava",
          searchKey: itemUrl,
          c_ctrl: "Tabs"
        }, "https://apapia-history-weblogic.manmanbuy.com/basic/getItemBasicInfo");

        const spbh = basicRes?.result?.spbh;
        const realItemUrl = basicRes?.result?.url || itemUrl;

        if (spbh) {
          // 步骤 2：获取历史价格趋势
          const trendRes = await sendMmb({
            methodName: "getHistoryTrend2021",
            url: realItemUrl,
            spbh: spbh,
            c_ctrl: "TrendDetailScene"
          }, "https://apapia-history-weblogic.manmanbuy.com/history/v2/getHistoryTrend");

          const jiagequshiyh = trendRes?.result?.trend;

          // 步骤 3：获取详细价格明细
          const remarkRes = await sendMmb({
            methodName: "priceRemarkJava",
            jiagequshiyh: jiagequshiyh || "",
            c_ctrl: "TrendDetailScene"
          }, "https://apapia-history-weblogic.manmanbuy.com/history/priceRemark");

          const priceDetails = remarkRes?.remark?.ListPriceDetail || [];
          if (priceDetails.length > 0) {
            const tableRows = priceDetails.map((item) => {
              const name = item.Name || "-";
              let date = item.Date || "-";
              const price = item.Price || "-";
              const diff = item.Difference || "";
              if (name === "当前到手价") {
                const nowD = new Date();
                date = `${nowD.getFullYear()}-${String(nowD.getMonth() + 1).padStart(2, "0")}-${String(nowD.getDate()).padStart(2, "0")}`;
              }
              let diffColor = "#666";
              if (diff.startsWith("↑")) diffColor = "#E1251B";
              else if (diff.startsWith("↓")) diffColor = "#00AA00";

              return `<tr>
                <td style="padding:10px 8px;border-bottom:1px solid #EEE;font-weight:600;">${name}</td>
                <td style="padding:10px 8px;border-bottom:1px solid #EEE;color:#888;">${date}</td>
                <td style="padding:10px 8px;border-bottom:1px solid #EEE;font-weight:700;color:#E1251B;">${price}</td>
                <td style="padding:10px 8px;border-bottom:1px solid #EEE;font-weight:600;color:${diffColor};">${diff || "-"}</td>
              </tr>`;
            }).join("");

            const tableHtml = `
              <div style="max-width:800px;margin:12px auto;padding:12px;font-family:-apple-system,BlinkMacSystemFont,'PingFang SC',sans-serif;background:#FFF9F9;border-radius:12px;box-shadow:0 2px 10px rgba(0,0,0,0.06);">
                <div style="font-size:14px;font-weight:bold;color:#E1251B;margin-bottom:8px;display:flex;align-items:center;">
                  <span>📊 京东商品历史价格明细 (慢慢买)</span>
                </div>
                <table style="width:100%;border-collapse:collapse;font-size:12px;text-align:left;">
                  <thead>
                    <tr style="background:#E1251B;color:#FFF;">
                      <th style="padding:8px;border-radius:6px 0 0 0;">类型</th>
                      <th style="padding:8px;">日期</th>
                      <th style="padding:8px;">价格</th>
                      <th style="padding:8px;border-radius:0 6px 0 0;">差价</th>
                    </tr>
                  </thead>
                  <tbody>${tableRows}</tbody>
                </table>
              </div>
            `;
            respBody = respBody.replace(/<body[^>]*>/i, (m) => `${m}\n${tableHtml}`);
          }
        }
      } catch (err) {
        console.log(`[京东比价表格版嵌入异常] ${err}`);
      } finally {
        if (typeof $done === "function") $done({ body: respBody });
      }
    })();
    return;
  }

  // 兜底返回
  if (typeof $done === "function") $done({ body: respBody });
})();
