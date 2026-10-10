// 京东比价（折线图嵌入版）
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
    console.log(`[京东比价折线图] ${title} | ${subtitle}: ${body}`);
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
              else resolve({ status: resp?.status || resp?.statusCode, headers: resp?.headers, body: body });
            });
            return;
          }
          if (typeof $task !== "undefined" && $task.fetch) {
            $task.fetch({ method: "POST", ...options }).then(
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

  // 纯 JavaScript MD5
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
    string = utf8Encode(string);
    x = convertToWordArray(string);
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
      a = addUnsigned(a, AA); b = addUnsigned(b, BB); c = addUnsigned(c, CC); d = addUnsigned(d, DD);
    }
    var r = wordToHex(a) + wordToHex(b) + wordToHex(c) + wordToHex(d);
    return r.toLowerCase();
  }

  function jsonToQueryString(jsonObject) {
    return Object.keys(jsonObject)
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(jsonObject[key])}`)
      .join('&');
  }

  function jsonToCustomString(jsonObject) {
    return Object.keys(jsonObject)
      .filter(key => jsonObject[key] !== '' && key.toLowerCase() !== 'token')
      .sort()
      .map(key => `${key.toUpperCase()}${String(jsonObject[key]).toUpperCase()}`)
      .join('');
  }

const JdLine = (data) => {
  return `
<script src="https://cdnjs.cloudflare.com/ajax/libs/echarts/5.4.3/echarts.min.js"></script>
    <style>
        /* 基础样式 */
        .price-trend {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px 2px;
            transition: background-color 0.3s;
        }

        .price-trend__chart {
            background-color: #fff;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            padding: 15px 2px;
            margin-bottom: 20px;
            transition: background-color 0.3s;
        }

        .price-trend__title {
            margin: 0 0 15px;
            text-align: left;
            color: #333;
            transition: color 0.3s;
            font-size: 1rem;
            font-weight: 600;
            padding-bottom: 8px;
            border-bottom: 2px solid #eaeaea;
            position: relative;
        }

        .price-trend--dark .price-trend__title {
            color: #fff;
            border-bottom-color: #333;
        }

        .price-trend__canvas {
            width: 100%;
            height: 400px;
        }

        /* 暗色主题 */
        .price-trend--dark {
            background-color: #1a1a1a;
            color: #fff;
        }

        .price-trend--dark .price-trend__chart {
            background-color: #242424;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        }

        .price-trend--dark .price-trend__title {
            color: #fff;
        }

        /* 移动端适配 */
        @media (max-width: 600px) {
            .price-trend {
                padding: 10px;
            }

            .price-trend__canvas {
                height: 400px;
            }
        }
    </style>

    <div class="price-trend">
        <div class="price-trend__chart">
            <h2 class="price-trend__title">价格走势</h2>
            <div class="price-trend__canvas" id="chart-container"></div>
        </div>
    </div>

    <script>
        const priceChart = document.querySelector('.price-trend');
        priceChart.classList.toggle('price-trend--dark', isDark);

        const chartDom = document.getElementById('chart-container');
        const myChart = echarts.init(chartDom);
        const eventInfo = document.getElementById('event-info');

        const {
            trendData: { info, currentPrice },
        } = ${JSON.stringify(data)};
        const DATA = info.reverse().slice(1);
        const uniquePrices = [...new Set(DATA.map(item => Math.floor(item.actualPrice)))].sort((a, b) => a - b);

        // 生成数据
        const generateData = (start) => {
            return DATA.slice(0, start).map(({ date, originalPrice, actualPrice, discounts }, i) => {
                const title = date.split(" ")[0] + "<br>现价: ¥" + currentPrice;
                const message = discounts
                    ? title + "<br>原价: ¥" + Math.floor(originalPrice) + "<br>售价: ¥" + Math.floor(actualPrice) + "<br>" + discounts
                    : title + "<br>售价: ¥" + Math.floor(actualPrice);

                return {
                    value: [++i, uniquePrices.indexOf(Math.floor(actualPrice)) + 1],
                    message,
                };
            });
        };

        const getDateRanges = (input) => {
            if (!isNaN(input)) return input;

            const map = {
                '618价': "06-18",
                '双11价': "11-11"
            }
            const day = DATA.findIndex(item => item.date.includes(map[input])) + 1;
            return day !== -1 && day;
        }

        const series = [360, 180, 60, 30, "618价", "双11价"].flatMap((input) => {
            const days = getDateRanges(input)

            return days ? [{
                name: isNaN(input) ? input : (days + "天"),
                type: 'line',
                data: generateData(days),
                smooth: true,
                symbolSize: 0,
                lineStyle: {
                    width: 1,
                    join: 'round'
                },
                itemStyle: {
                    borderWidth: 1,
                },
                emphasis: {
                    scale: true,
                    symbolSize: 1,
                    focus: 'series',
                    itemStyle: {
                        borderWidth: 6,
                    }
                },
                areaStyle: {
                    opacity: 0.1,
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        {
                            offset: 0,
                            color: isDark ? '#f4e925' : '#37A2DA'
                        },
                        {
                            offset: 1,
                            color: 'rgba(255,255,255,0.1)'
                        }
                    ])
                }
            }] : [];
        })

        // 配置项
        const option = {
            backgroundColor: isDark ? '#1a1a1a' : '#ffffff',
            color: isDark ?
                [
                    new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        { offset: 0, color: '#f4e925' },
                        { offset: 1, color: '#f4e92577' }
                    ]),
                    new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        { offset: 0, color: '#00ffb3' },
                        { offset: 1, color: '#00ffb377' }
                    ]),
                    new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        { offset: 0, color: '#00ffff' },
                        { offset: 1, color: '#00ffff77' }
                    ]),
                    new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        { offset: 0, color: '#ff7070' },
                        { offset: 1, color: '#ff707077' }
                    ]),
                    new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        { offset: 0, color: '#c23531' },
                        { offset: 1, color: '#c2353177' }
                    ]),
                    new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        { offset: 0, color: '#2f4554' },
                        { offset: 1, color: '#2f455477' }
                    ])
                ] :
                [
                    new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        { offset: 0, color: '#37A2DA' },
                        { offset: 1, color: '#37A2DA77' }
                    ]),
                    new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        { offset: 0, color: '#32C5E9' },
                        { offset: 1, color: '#32C5E977' }
                    ]),
                    new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        { offset: 0, color: '#67E0E3' },
                        { offset: 1, color: '#67E0E377' }
                    ]),
                    new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        { offset: 0, color: '#9FE6B8' },
                        { offset: 1, color: '#9FE6B877' }
                    ]),
                    new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        { offset: 0, color: '#FFDB5C' },
                        { offset: 1, color: '#FFDB5C77' }
                    ]),
                    new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        { offset: 0, color: '#ff9f7f' },
                        { offset: 1, color: '#ff9f7f77' }
                    ])
                ],
            tooltip: {
                trigger: 'axis',
                padding: [8, 12],
                backgroundColor: isDark ? 'rgba(50, 50, 50, 0.9)' : 'rgba(255, 255, 255, 0.9)',
                borderColor: isDark ? '#444' : '#eee',
                borderWidth: 1,
                textStyle: {
                    color: isDark ? '#fff' : '#333'
                },
                position(point, params, dom, rect, size) {
                    return [point[0] - size.contentSize[0] / 2, point[1] - size.contentSize[1] - 10];
                },
                formatter(params) {
                    return params.find(item => item.value)?.[0]?.data?.message;
                }
            },
            legend: {
                data: series.map(item => item.name),
                selected: series.reduce((acc, item, index) => {
                    acc[item.name] = index === 0;
                    return acc;
                }, {}),
                top: 0,
                right: '3%',
                itemWidth: 8,        
                itemHeight: 8,       
                itemGap: 15,  
                textStyle: {
                    color: isDark ? '#e0e0e0' : '#333',
                }
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '10%',
                top: '5%',
                containLabel: true
            },
            xAxis: {
                type: 'value',
                max({ max }) {
                    return max;
                },
                interval:  Math.ceil(series[0].data.length / 6),
                min: 1,
                axisLabel: {
                    color: isDark ? '#e0e0e0' : '#333',
                    fontSize: 9,
                    formatter(value) {
                        const { date } = DATA[value - 1]
                        return date.split(" ")[0].split("-").slice(1).join("-");
                    }
                },
                axisLine: {
                    lineStyle: {
                        color: isDark ? '#333' : '#ccc'
                    }
                },
                splitLine: {
                    lineStyle: {
                        color: isDark ? '#333' : '#eee'
                    }
                }
            },
            yAxis: {
                type: 'value',
                max() {
                  const { length } = uniquePrices;
                  return length <= 3 ? +length + 1 : length;
                },
                min: 0,
                interval: 1,
                axisPointer: {
                    show: false,
                },
                axisLabel: {
                    color: isDark ? '#e0e0e0' : '#333',
                    fontSize: 9,
                    formatter(value) {
                        return value && (uniquePrices[value - 1] ?? "MAX");
                    }
                },
                axisLine: {
                    lineStyle: {
                        color: isDark ? '#333' : '#ccc'
                    }
                },
                splitLine: {
                    lineStyle: {
                        color: isDark ? '#333' : '#eee'
                    }
                }
            },
            series,
        };

        // 应用配置项
        myChart.setOption(option);

        // 监听折线图切换
        myChart.on('legendselectchanged', ({ name }) => {
          const max = series.find(i => i.name === name).data.length;
          myChart.setOption({
            xAxis: {
                interval: Math.ceil(max / 6),
              },
          });
          throw "";
        });
    
        // 监听窗口大小变化，调整图表大小
        window.addEventListener('resize', function () {
            myChart.resize();

            // 根据窗口宽度调整X轴标签旋转角度
            if (window.innerWidth < 500) {
                myChart.setOption({
                    xAxis: {
                        axisLabel: {
                            rotate: 45
                        }
                    }
                });
            } else {
                myChart.setOption({
                    xAxis: {
                        axisLabel: {
                            rotate: 0
                        }
                    }
                });
            }
        });

        // 添加触摸事件支持
        chartDom.addEventListener('touchstart', function (e) {
            e.preventDefault();
        });
    </script>`;
};

  async function getMMdata(id) {
    const devId = Storage.get("慢慢买CK") || Storage.get("manmanbuy_val") || Storage.get("mmb_ck");
    if (!devId) {
      throw new Error("未检测到慢慢买凭证，请先打开【慢慢买】APP→我的");
    }

    function signBody(args) {
      const reqBody = {
        t: Date.now().toString(),
        c_appver: "4.8.3.1",
        c_mmbDevId: devId,
        ...args
      };
      reqBody.token = md5(
        encodeURIComponent(
          "3E41D1331F5DDAFCD0A38FE2D52FF66F" +
          jsonToCustomString(reqBody) +
          "3E41D1331F5DDAFCD0A38FE2D52FF66F"
        )
      ).toUpperCase();
      return jsonToQueryString(reqBody);
    }

    async function apiCall(url, postBody) {
      const resp = await HttpClient.post({
        url: url,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded; charset=utf-8",
          "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 - mmbWebBrowse - ios"
        },
        body: postBody
      });
      let json;
      try {
        json = typeof resp.body === "string" ? JSON.parse(resp.body) : resp.body;
      } catch (e) {
        throw new Error(`解析响应 JSON 失败: ${url}`);
      }
      return json;
    }

    // Step 1: 获取基本信息
    const step1 = await apiCall(
      "https://apapia-history-weblogic.manmanbuy.com/basic/getItemBasicInfo",
      signBody({
        methodName: "getHistoryInfoJava",
        searchKey: `https://item.jd.com/${id}.html`
      })
    );
    if (!step1 || step1.code !== 2000 || !step1.result) {
      throw new Error(`获取商品基础信息失败: ${step1?.msg || "未知原因"}`);
    }

    // Step 2: 获取分享 trend 链接
    const step2 = await apiCall(
      "https://apapia-history-weblogic.manmanbuy.com/app/share",
      signBody({
        methodName: "trendJava",
        spbh: step1.result.spbh,
        url: step1.result.url
      })
    );
    if (!step2 || !step2.data) {
      throw new Error(`获取历史价格走势地址失败: ${step2?.msg || "未知原因"}`);
    }

    // Step 3: 获取真实 trend 数据
    const queryString = step2.data.split("?")[1] || "";
    const step3 = await apiCall(
      "https://apapia-history-weblogic.manmanbuy.com/h5/share/trendData",
      queryString
    );
    return step3;
  }

  (async function main() {
    let respBody = typeof $response !== "undefined" && $response.body ? $response.body : "";
    let headers = typeof $response !== "undefined" && $response.headers ? $response.headers : {};
    try {
      const url = typeof $request !== "undefined" && $request.url ? $request.url : "";
      const idMatch = url.match(/\/product\/graphext\/(\d+)\.html/) || url.match(/(\d{6,})/);
      const skuId = idMatch ? idMatch[1] : null;

      if (!skuId) {
        return;
      }

      const devId = Storage.get("慢慢买CK") || Storage.get("manmanbuy_val") || Storage.get("mmb_ck");
      if (!devId) {
        const promptHtml = `
          <div style="max-width:92%;margin:16px auto;padding:14px 16px;background:#FFF2F0;border:1px solid #FFCCC7;border-radius:10px;font-size:13px;color:#CF1322;line-height:1.6;box-shadow:0 2px 8px rgba(0,0,0,0.04);font-family:-apple-system,BlinkMacSystemFont,'PingFang SC',sans-serif;">
            <div style="font-weight:bold;font-size:14px;margin-bottom:4px;">⚠️ 未检测到慢慢买比价凭证</div>
            <div>首次使用请先打开【慢慢买】App，点击底栏最右侧【我的】。<br>收到“🎉 慢慢买：获取CK成功”通知后，刷新此页即可查看历史价格走势图。</div>
          </div>
        `;
        if (respBody && /<body[^>]*>/i.test(respBody)) {
          respBody = respBody.replace(/<body[^>]*>/i, (m) => `${m}\n${promptHtml}`);
        } else {
          respBody = `${promptHtml}\n${respBody}`;
        }
        return;
      }

      const data = await getMMdata(skuId);
      if (data && data.code === 2000 && data.result) {
        const hour = new Date().getHours();
        const isDark = hour >= 20 || hour < 6;
        const chartHtml = `${JdLine(data.result)}\n<script>var isDark=${isDark};</script>`;

        if (respBody && /<body[^>]*>/i.test(respBody)) {
          respBody = respBody.replace(/<body[^>]*>/i, (m) => `${m}\n${chartHtml}`);
        } else {
          respBody = `${chartHtml}\n${respBody}`;
        }
      } else {
        console.log(`[京东比价折线图] 请求返回错误: ${data?.msg || "无数据"}`);
      }
    } catch (e) {
      console.log(`[京东比价折线图执行异常] ${e}`);
    } finally {
      if (typeof $done === "function") {
        $done({ body: respBody, headers: headers });
      }
    }
  })();
})();
