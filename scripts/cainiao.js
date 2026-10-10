/**
 * 菜鸟 App 响应体净化脚本
 * 适用: Egern / Surge / Loon / Quantumult X
 * Repository: https://github.com/ReLIFE-1/egern-modules
 */
const url = $request.url;
let body = $response.body;

if (body) {
  try {
    let obj = JSON.parse(body);

    // 1. 首页协议配置接口（过滤大横幅与待办营销卡片）
    if (url.includes("mtop.cainiao.nbpresentation.protocol.homepage.get.cn")) {
      if (obj.data?.result?.dataList?.length > 0) {
        obj.data.result.dataList = obj.data.result.dataList.filter(
          item => !["big_banner_area_v870", "todo_list_v860"].includes(item.type)
        );
      }
    }
    // 2. 首页聚合接口（多区域数据流广告过滤）
    else if (url.includes("mtop.cainiao.nbpresentation.homepage.merge.get.cn")) {
      for (let i = 0; i < 6; i++) {
        let key = `mtop.cainiao.nbpresentation.protocol.homepage.get.cn@${i}`;
        if (obj.data?.[key]?.data?.result?.dataList?.length > 0) {
          obj.data[key].data.result.dataList = obj.data[key].data.result.dataList.filter(
            item => !["big_banner_area_v870", "todo_list_v860"].includes(item.type)
          );
        }
      }
    }
    // 3. 个人中心与端到端页面（移除资产推荐、会员推广、横幅、钱包广告等）
    else if (url.includes("mtop.cainiao.app.e2e.engine")) {
      const adKeys = ["banner", "activity", "asset", "vip", "wallet"];
      for (let key of adKeys) {
        if (obj.data?.data?.[key]) {
          delete obj.data.data[key];
        }
      }
      if (obj.data?.data?.data?.operationList) {
        delete obj.data.data.data.operationList;
      }
      if (obj.data?.data?.data?.mainSearch?.bizData?.searchContents) {
        delete obj.data.data.data.mainSearch.bizData.searchContents;
      }
    }
    // 4. 流量广告位兜底
    else if (url.includes("mtop.cainiao.guoguo.nbnetflow.ads.mshow")) {
      if (obj.data) {
        delete obj.data["1308"];
        delete obj.data["1275"];
        delete obj.data["205"];
      }
    }
    // 5. 广告索引兜底
    else if (url.includes("mtop.cainiao.guoguo.nbnetflow.ads.index.cn")) {
      if (obj.data?.result) {
        obj.data.result = [{}];
      }
    }
    // 6. 搜索栏热词兜底
    else if (url.includes("mtop.cainiao.adkeyword")) {
      if (obj.data?.result?.adHotKeywords) {
        obj.data.result.adHotKeywords = [];
      }
    }

    body = JSON.stringify(obj);
  } catch (err) {
    // 保持原始数据，避免影响正常查件
  }
}

$done({ body });
