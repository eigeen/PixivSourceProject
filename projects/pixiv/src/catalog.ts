import {
  cacheSaveSeconds,
  getAjaxJson,
  timeTextFormat,
  urlNovelDetailed,
  urlNovelUrl,
  urlSeriesNovels,
  urlSeriesNovelsTitles,
} from "./base.jsLib";

import { getUtil } from "./common";

const util = getUtil();

function urlNovel(novelId: string | number) {
  if (util.settings.SHOW_ORIGINAL_LINK) {
    return urlNovelUrl(novelId);
  } else {
    return urlNovelDetailed(novelId);
  }
}

function oneShotHandler(res: any) {
  res.textCount = res.userNovels[`${res.id}`].textCount;
  res.createDate = timeTextFormat(res.createDate);
  return [
    {
      title: res.title.replace(RegExp(/^\s+|\s+$/g), ""),
      chapterUrl: urlNovel(res.id),
      chapterInfo: `${res.createDate}　　${res.textCount}字`,
    },
  ];
}

function seriesHandler(res: any) {
  const limit = 30;
  let returnList: any[] = [];
  let novelIds: any[] = [];
  let seriesID = res.id,
    allChaptersCount = res.total;
  util.debugFunc(() => {
    java.log(`本系列 ${seriesID} 一共有${allChaptersCount}章`);
  });

  //发送请求获得相应数量的目录列表
  function sendAjaxForGetChapters(lastIndex: number) {
    const resp = getAjaxJson(urlSeriesNovels(seriesID, limit, lastIndex), true);
    const res = resp.body.thumbnails.novel;
    // res = resp.body.page.seriesContents
    res.forEach((v: any) => {
      v.title = v.title.replace(RegExp(/^\s+|\s+$/g), "").replace(RegExp(/（|）|-/g), "");
      v.chapterUrl = urlNovel(v.id);
      novelIds.push(v.id);
      if (v.updateDate !== undefined) {
        v.updateDate = timeTextFormat(v.createDate);
        v.chapterInfo = `${v.updateDate}　　${v.textCount}字`;
      } else {
        v.updateDate = java.timeFormat(v.uploadTimestamp);
        v.chapterInfo = `${v.updateDate}　　${v.textLength}字`;
      }
      util.debugFunc(() => {
        java.log(`${v.title}`);
      });
    });
    return res;
  }

  if (!util.settings.SHOW_UPDATE_TIME) {
    returnList = getAjaxJson(urlSeriesNovelsTitles(seriesID), true).body;
    returnList.forEach((v) => {
      v.title = v.title.replace(RegExp(/^\s+|\s+$/g), "").replace(RegExp(/（|）|-/g), "");
      v.chapterUrl = urlNovel(v.id);
      novelIds.push(v.id);
    });
  } else {
    //逻辑控制者 也就是使用上面定义的两个函数来做对应功能
    //要爬取的总次数
    let max = allChaptersCount / limit + 1;
    for (let i = 0; i < max; i++) {
      //java.log("i的值:"+i)
      let list = sendAjaxForGetChapters(i * limit);
      //取出每个值
      returnList = returnList.concat(list);
    }
  }
  // 放入信息以便登陆界面使用
  cache.put(`novelIds${seriesID}`, JSON.stringify(novelIds), cacheSaveSeconds);
  // java.log(JSON.stringify(returnList))
  return returnList;
}

(function () {
  java.log("[DEBUG] load catalog");

  const res = util.getNovelResSeries(result);
  if (res.firstNovelId === undefined || res.seriesNavData === null) {
    return oneShotHandler(res);
  } else {
    return seriesHandler(res);
  }
})();
