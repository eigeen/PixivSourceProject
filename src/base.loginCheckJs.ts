/// <reference path="./types/globals.d.ts" />

import {
  dateFormat,
  getAjaxJson,
  isHtmlString,
  isJsonString,
  sleepToast,
  timeFormat,
  urlCoverUrl,
  urlMessageThreadLatest,
  urlNovelDetailed,
  urlSeriesDetailed,
  urlSeriesNovels,
} from "./base.jsLib";
import { objStringify } from "./common";
import type { Settings } from "./settings";
import type { Util } from "./types/Util";

var util: Util = {} as Util;

function isBackupSource() {
  let isBackupSource = source.bookSourceName.includes("备用");
  cache.put("isBackupSource", isBackupSource);
  return isBackupSource;
}

// 检测 源阅
// 可用 java.ajax() 不可用 java.webview() java.ajaxAll()
// 可用 java.getCookie() cache.put() cache.get() 默认值为 undefined
// 可用 java.startBrowser() 不可用 java.startBrowserAwaitAwait
// 可用 source.bookSourceName source.getVariable() 等
// java.getUserAgent() java.getWebViewUA() 目前返回内容相同
// 不能读写源变量
function isSourceRead() {
  let isSourceReadStatus = java.getUserAgent() === java.getWebViewUA();
  cache.put("isSourceRead", isSourceReadStatus);
  return isSourceReadStatus;
}

function sleepToastWithDefault(msg: string, duration: number = 0) {
  sleepToast(msg, duration);
}

/** TODO: 此方法疑似已经无用，暂时保留 */
function checkMessageThread(checkTimes?: number | null) {
  if (checkTimes === undefined) {
    checkTimes = Number(cache.get("checkTimes"));
  }
  if (checkTimes === 0 && util.isLogin()) {
    let latestMsg = getAjaxJson(urlMessageThreadLatest(5));
    if (latestMsg.error === true) {
      java.log(JSON.stringify(latestMsg));
    } else if (latestMsg.body.total >= 1) {
      let msg = latestMsg.body.message_threads.filter(
        (item: any) => item.thread_name === "pixiv事務局"
      )[0];
      if (
        msg !== undefined &&
        new Date().getTime() - 1000 * msg.modified_at <= 3 * 24 * 60 * 60 * 1000
      ) {
        // 3天内进行提示
        sleepToastWithDefault(
          `您于 ${timeFormat(1000 * msg.modified_at)} 触发 Pixiv 【过度访问】，请修改密码并重新登录。\n如已修改请忽略`,
          3
        );
        sleepToastWithDefault(`${msg.latest_content}`, 5);
        java.startBrowser("https://accounts.pixiv.net/password/change", "修改密码");
      }
    }
  }
  cache.put("checkTimes", (checkTimes ?? 0) + 1, 4 * 60 * 60); // 缓存4h，每4h提醒一次
  // cache.put("checkTimes", checkTimes + 1, 60)  // 测试用，缓存60s，每分钟提醒一次
  // java.log(checkTimes + 1)
}

// 获取请求的user id方便其他ajax请求构造
function getPixivUid() {
  let uid = java.getResponse().headers().get("x-userid");
  if (uid != null) {
    cache.put("pixiv:uid", String(uid));
  } else {
    cache.delete("pixiv:uid");
  }
}

export function getWebViewUA() {
  let userAgent = cache.get("userAgent");
  if (userAgent === undefined || userAgent === null) {
    if (isSourceRead()) {
      userAgent =
        "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Mobile Safari/537.36";
    } else {
      userAgent = String(java.getUserAgent());
    }
    java.log(userAgent);
    cache.put("userAgent", userAgent);
  }
  return String(userAgent);
}

function getHeaders() {
  let headers = {
    accept: "application/json",
    "accept-encoding": "gzip, deflate, br, zstd",
    "accept-language": "zh-CN",
    // "content-type": "application/json; charset=utf-8",
    // "content-type": "application/x-www-form-urlencoded; charset=utf-8",
    origin: "https//www.pixiv.net",
    referer: "https://www.pixiv.net/",
    // "sec-ch-ua": `"Not/A)Brand";v="8", "Chromium";v="132", "Google Chrome";v="132"`,
    // "sec-ch-ua-mobile": "?0",
    // "sec-ch-ua-platform": "Windows",
    // "sec-fetch-dest": "empty",
    // "sec-fetch-mode": "cors",
    // "sec-fetch-site": "same-origin",
    "user-agent": cache.get("userAgent"),
    "x-csrf-token": cache.get("csrfToken"),
    Cookie: cache.get("pixivCookie"),
  };
  cache.put("headers", JSON.stringify(headers));
  return headers;
}

function getBlockAuthorsFromSource() {
  let authors = [];
  try {
    authors = JSON.parse(`[${source.getVariable().replace("，", ",")}]`);
    // sleepToastWithDefault(JSON.stringify(authors))
  } catch (e) {
    sleepToastWithDefault(
      "🚫 屏蔽作者\n⚠️ 【书源】源变量设置有误\n输入作者ID，以英文逗号间隔，保存"
    );
  }
  return authors;
}

function syncBlockAuthorList() {
  let authors1 = JSON.parse(cache.get("blockAuthorList") || "[]");
  let authors2 = getBlockAuthorsFromSource();
  util.debugFunc(() => {
    java.log(`屏蔽作者：缓存　：${JSON.stringify(authors1)}`);
    java.log(`屏蔽作者：源变量：${JSON.stringify(authors2)}`);
  });
  cache.put("blockAuthorList", JSON.stringify(authors2));
  if (authors1 === undefined || authors1 === null || authors1.length !== authors2.length) {
    java.log("屏蔽作者：已将源变量同步至缓存");
  } else if (authors2.length === 0) {
    java.log("屏蔽作者：已清空屏蔽作者");
  }
}

function ConstructUtil(): Util {
  // init settings
  // 输出书源信息
  java.log(`🅿️ ${source.bookSourceComment?.split("\n")[0]}`);
  java.log(`📌 ${source.bookSourceComment?.split("\n")[2]}`);
  if (isSourceRead()) {
    java.log(
      `📆 更新时间：${source.lastUpdateTime ? java.timeFormat(source.lastUpdateTime) : "未知"}`
    );
    java.log("📱 软件平台：🍎 源阅 SourceRead");
  } else {
    java.log(
      `📆 更新时间：${source.lastUpdateTime ? java.timeFormat(source.lastUpdateTime) : "未知"}`
    );
    java.log("📱 软件平台：🤖 开源阅读 Legado");
  }

  // 获取设置，备用书源使用旧版设置，书源从缓存获取设置
  let settings: Settings;
  if (isBackupSource() || isSourceRead()) {
    // regex不动，先保留
    // @ts-expect-error
    settings = JSON.parse(String(source.variableComment).match(RegExp(/{([\s\S]*?)}/gm)));
  } else {
    // cache.delete("pixivSettings")
    settings = JSON.parse(cache.get("pixivSettings") || "{}");
  }
  if (settings !== null) {
    java.log("⚙️ 使用自定义设置");
  } else {
    // settings is null，使用默认设置
    settings = {
      SEARCH_AUTHOR: true, // 搜索：默认搜索作者名称
      CONVERT_CHINESE: true, // 搜索：搜索时进行繁简转换
      SHOW_LIKE_NOVELS: true, // 搜索：搜索结果显示收藏小说
      SHOW_WATCHED_SERIES: true, // 搜索：搜索结果显示追整系列小说
      MORE_INFORMATION: false, // 详情：书籍简介显示更多信息
      SHOW_UPDATE_TIME: true, // 目录：显示更新时间，但会增加少许请求
      SHOW_ORIGINAL_LINK: true, // 目录：显示原始链接，但会增加大量请求
      REPLACE_TITLE_MARKS: true, // 正文：注音内容为汉字时，替换为书名号
      SHOW_CAPTIONS: true, // 正文：章首显示描述
      SHOW_COMMENTS: true, // 正文：章尾显示评论
      FAST: false, // 全局：快速模式
      DEBUG: false, // 全局：调试模式
      IS_LEGADO: !isSourceRead(),
      IS_SOURCE_READ: isSourceRead(),
      IS_BACKUP_SOURCE: isBackupSource(),
    };
    java.log("⚙️ 使用默认设置（无自定义设置 或 自定义设置有误）");
  }
  if (settings.FAST === true) {
    settings.SEARCH_AUTHOR = false; // 搜索：默认搜索作者名称
    settings.CONVERT_CHINESE = false; // 搜索：繁简通搜
    settings.SHOW_UPDATE_TIME = false; // 目录：显示章节更新时间
    settings.SHOW_ORIGINAL_LINK = false; // 目录：显示章节源链接
    settings.SHOW_COMMENTS = false; // 正文：显示评论
  }
  settings.IS_LEGADO = !isSourceRead();
  settings.IS_SOURCE_READ = isSourceRead();
  settings.IS_BACKUP_SOURCE = isBackupSource();

  const _t: Util = {
    settings: settings,
  } as Util;

  _t.debugFunc = (func: () => void) => {
    if (util.settings.DEBUG) {
      func();
    }
  };

  _t.isLogin = (): boolean => {
    let cookie = String(java.getCookie("https://www.pixiv.net/", null));
    return cookie.includes("first_visit_datetime");
  };

  _t.checkStatus = (status: boolean): string => {
    if (status) return "✅ 已";
    else return "❌ 未";
  };

  _t.login = () => {
    let resp = java.startBrowserAwait(
      `https://accounts.pixiv.net/login,
    {"headers": {"User-Agent": "${java.getWebViewUA()}"}}`,
      "登录账号",
      false
    );
    if (resp.code() === 200) {
      util.getCookie();
      util.getCsrfToken();
    } else {
      java.log(resp.code());
      sleepToastWithDefault("⚠️ 登录失败");
    }
  };

  _t.logout = () => {
    util.removeCookie();
    java.startBrowser("https://www.pixiv.net/logout.php", "退出账号");
    util.removeCookie();
    sleepToastWithDefault(
      `✅ 已退出当前账号\n\n退出后请点击右上角的 ✔️ 退出\n\n登录请点击【登录账号】进行登录`
    );
  };

  _t.getCookie = (): string | null => {
    let pixivCookie = String(java.getCookie("https://www.pixiv.net/", null));
    if (pixivCookie.includes("first_visit_datetime")) {
      // java.log(typeof pixivCookie)
      // java.log(pixivCookie)

      cache.put("pixivCookie", pixivCookie, 60 * 60);
      return pixivCookie;
    } else {
      cache.delete("pixivCookie");
      sleepToastWithDefault("未登录账号(pixivCookie)");
      return null;
    }
  };

  _t.removeCookie = () => {
    cookie.removeCookie("https://www.pixiv.net");
    cookie.removeCookie("https://accounts.pixiv.net");
    cookie.removeCookie("https://accounts.google.com");
    cookie.removeCookie("https://api.weibo.com");
    cache.delete("pixivCookie");
    cache.delete("csrfToken"); // 与登录设备有关
    cache.delete("headers");
  };

  /**
   * 获取 Csrf Token，以便进行收藏等请求
   * 获取方法来自脚本 Pixiv Previewer
   * https://github.com/Ocrosoft/PixivPreviewer
   * https://greasyfork.org/zh-CN/scripts/30766-pixiv-previewer/code
   */
  _t.getCsrfToken = (): string | null => {
    let csrfToken;
    let html = java.webView(null, "https://www.pixiv.net/", null);
    if (!html) {
      sleepToastWithDefault("无法获取网页内容(csrfToken)");
      return null;
    }

    csrfToken = html.match(/token\\":\\"([a-z0-9]{32})/)?.[1] || null;
    if (!csrfToken) {
      sleepToastWithDefault("未登录账号(csrfToken)");
    }

    java.log(typeof csrfToken);
    java.log(csrfToken);
    cache.put("csrfToken", csrfToken); // 与登录设备有关
    return csrfToken;
  };

  /**
   * 将多个长篇小说解析为一本书
   * @param novels 小说列表
   * @returns 解析后的小说列表
   */
  _t.combineNovels = (novels: any[]): any[] => {
    return novels.filter((novel) => {
      // 单本直接解析为一本书
      if (novel.seriesId === undefined || novel.seriesId === null) {
        return true;
      }
      // 集合中没有该系列解析为一本书
      // TODOL: seriesSet来自discover.ts和search.ts两个文件，具体使用哪个文件未知
      // @ts-expect-error
      if (!seriesSet.has(novel.seriesId)) {
        // @ts-expect-error
        seriesSet.add(novel.seriesId);
        return true;
      }
      return false;
    });
  };

  /**
   * 处理屏蔽作者
   * @param novels 小说列表
   * @returns 屏蔽作者后的小说列表
   */
  _t.authorFilter = (novels: any[]): any[] => {
    let authors = [];
    if (util.settings.IS_LEGADO) {
      authors = JSON.parse(cache.get("blockAuthorList") || "[]");
    } else if (util.settings.IS_SOURCE_READ) {
      // authors = cache.get("blockAuthorList")  // 源阅无数据返回 undefined
      // try {
      //     if (typeof authors !== "undefined") {
      //         authors = JSON.parse(authors)
      //         java.log(authors)
      //         java.log(typeof authors)
      //     } else authors = null
      // } catch (e) {
      //     authors = []
      //     java.log("屏蔽作者 JSON Parse Error")
      //     java.log(e)
      // }
    }

    if (authors && authors.length >= 0) {
      java.log(`🚫 屏蔽作者ID：${JSON.stringify(authors)}`);
      authors.forEach((author: string | number) => {
        novels = novels.filter((novel) => novel.userId !== String(author));
      });
    }
    return novels;
  };

  _t.novelFilter = (novels: any[]): any[] => {
    let likeNovels = [],
      watchedSeries = [];
    let novels0 = [],
      novels1 = [],
      novels2 = [];
    if (util.settings.IS_LEGADO) {
      likeNovels = JSON.parse(cache.get("likeNovels") || "[]");
      watchedSeries = JSON.parse(cache.get("watchedSeries") || "[]");
    }
    novels0 = novels.map((novel) => novel.id);

    let msg = util.checkStatus(util.settings.SHOW_LIKE_NOVELS).replace("未", "不");
    java.log(`${msg}显示收藏小说`);
    if (!util.settings.SHOW_LIKE_NOVELS) {
      novels = novels.filter((novel) => !likeNovels.includes(Number(novel.id)));
      novels1 = novels.map((novel) => novel.id);
    }

    msg = util.checkStatus(util.settings.SHOW_WATCHED_SERIES).replace("未", "不");
    java.log(`${msg}显示追更系列`);
    if (!util.settings.SHOW_WATCHED_SERIES) {
      novels = novels.filter((novel) => !watchedSeries.includes(Number(novel.seriesId)));
      novels2 = novels.map((novel) => novel.id);
    }

    if (!(util.settings.SHOW_LIKE_NOVELS && util.settings.SHOW_WATCHED_SERIES === true)) {
      java.log(`⏬ 过滤收藏/追更：过滤前${novels0.length}；过滤后${novels2.length}`);
    }
    util.debugFunc(() => {
      // java.log(JSON.stringify(novels0))
      java.log(JSON.stringify(novels0.length));
      // java.log(JSON.stringify(novels1))
      java.log(JSON.stringify(novels1.length));
      // java.log(JSON.stringify(novels2))
      java.log(JSON.stringify(novels2.length));
    });
    return novels;
  };

  /**
   * 收藏小说/追更系列 写入缓存
   * @param listInCacheName 缓存名称
   * @param list 列表
   */
  _t.saveNovels = (listInCacheName: string, list: any[]) => {
    let listInCache = JSON.parse(cache.get(listInCacheName) || "[]");
    if (listInCache === undefined || listInCache === null) listInCache = [];
    listInCache = listInCache.concat(list);
    listInCache = Array.from(new Set(listInCache));
    cache.put(listInCacheName, JSON.stringify(listInCache));
    if (listInCacheName === "likeNovels") listInCacheName = "❤️ 收藏小说ID";
    else if (listInCacheName === "watchedSeries") listInCacheName = "📃 追更系列ID";
    java.log(`${listInCacheName}：${JSON.stringify(listInCache)}`);
  };

  /**
   * 处理 novels 列表
   * @param novels 小说列表
   * @param detailed 是否详细
   */
  _t.handNovels = (novels: any[], detailed = false) => {
    const likeNovels: any[] = [];
    const watchedSeries: any[] = [];
    novels = util.authorFilter(novels);
    novels.forEach((novel) => {
      // novel.id = novel.id
      // novel.title = novel.title
      // novel.userName = novel.userName
      // novel.userId = novel.userId
      // novel.tags = novel.tags
      cache.put(`${novel.userName}`, novel.userId); // 加入缓存，便于搜索作者
      if (novel.tags === undefined || novel.tags === null) {
        novel.tags = [];
      }
      // 默认搜索
      if (novel.isOneshot === undefined) {
        // novel.seriesId = novel.seriesId
        // novel.seriesTitle = novel.seriesTitle
        // novel.textCount = novel.textCount
        // novel.description = novel.description
        novel.coverUrl = novel.url;
        // novel.createDate = novel.createDate
        // novel.updateDate = novel.updateDate
        novel.isBookmark = novel.bookmarkData !== undefined && novel.bookmarkData !== null;
        if (novel.isBookmark === true) {
          cache.put(`collect${novel.id}`, novel.bookmarkData.id);
          likeNovels.push(Number(novel.id));
        }
      } else {
        // 搜索系列
        if (novel.isOneshot === true) {
          novel.seriesId = undefined;
          novel.id = novel.novelId; // 获取真正的 novelId
          novel.seriesTitle = undefined;
        } else {
          novel.seriesId = novel.id;
          novel.id = novel.novelId = novel.latestEpisodeId; // 获取真正的 novelId
          novel.seriesTitle = novel.title;
          // novel.isWatched = novel.isWatched  // 搜索系列可获取
        }
        novel.textCount = novel.textLength;
        novel.description = novel.caption;
        novel.coverUrl = novel.cover.urls["480mw"];
        novel.createDate = novel.createDateTime;
        novel.updateDate = novel.updateDateTime;
      }

      // 正文详情页
      if (novel.content !== undefined) {
        novel.novelId = novel.id;
        novel.tags = novel.tags.tags.map((item: any) => item.tag);
        novel.textCount = novel.userNovels[`${novel.id}`].textCount;
        // novel.latestChapter = novel.title
        // novel.description = novel.description
        novel.coverUrl = novel.userNovels[`${novel.id}`].url;
        // novel.createDate = novel.createDate
        novel.updateDate = novel.uploadDate;
        novel.isBookmark = novel.bookmarkData !== undefined && novel.bookmarkData !== null;
        if (novel.isBookmark === true) {
          cache.put(`collect${novel.id}`, novel.bookmarkData.id);
          likeNovels.push(Number(novel.id));
        }
        if (novel.seriesNavData !== undefined && novel.seriesNavData !== null) {
          novel.seriesId = novel.seriesNavData.seriesId;
          novel.seriesTitle = novel.seriesNavData.title;
        }
      }
      // 系列详情
      if (novel.firstNovelId !== undefined) {
        novel.seriesId = novel.id;
        novel.id = novel.novelId = novel.firstNovelId;
        novel.seriesTitle = novel.title;
        novel.coverUrl = novel.cover.urls["480mw"];
        // novel.isWatched = novel.isWatched  // 搜索系列可获取
      }

      if (novel.seriesId === undefined || novel.seriesId === null) {
        // 单篇
        novel.tags.unshift("单本");
        novel.latestChapter = novel.title;
        novel.detailedUrl = urlNovelDetailed(novel.id);
        novel.total = 1;
      }
      if (novel.seriesId !== undefined && detailed === false) {
        novel.id = novel.seriesId;
        novel.firstNovelId = novel.novelId;
        novel.title = novel.seriesTitle;
        novel.tags.unshift("长篇");
        novel.detailedUrl = urlSeriesDetailed(novel.seriesId);
        // novel.seriesNavData = {}
        // novel.seriesNavData.seriesId = novel.seriesId
        // novel.seriesNavData.title = novel.seriesTitle
        if (novel.isWatched === true) {
          watchedSeries.push(Number(novel.seriesId));
        }
      }

      if (novel.seriesId !== undefined && detailed === true) {
        let series = getAjaxJson(urlSeriesDetailed(novel.seriesId)).body;
        novel.id = series.firstNovelId;
        novel.title = series.title;
        novel.tags = novel.tags.concat(series.tags);
        novel.tags.unshift("长篇");
        novel.textCount = series.publishedTotalCharacterCount;
        novel.description = series.caption;
        novel.coverUrl = series.cover.urls["480mw"];
        novel.createDate = series.createDate;
        novel.updateDate = series.updateDate;
        novel.total = series.publishedContentCount;
        novel.isWatched = series.isWatched;
        if (novel.isWatched === true) {
          watchedSeries.push(Number(novel.seriesId));
        }

        // 发送请求获取第一章 获取标签与简介
        let firstNovel = {} as any;
        try {
          firstNovel = getAjaxJson(urlNovelDetailed(series.firstNovelId)).body;
          novel.tags = novel.tags.concat(firstNovel.tags.tags.map((item: any) => item.tag));
          firstNovel.isBookmark =
            firstNovel.bookmarkData !== undefined && firstNovel.bookmarkData !== null;
          if (firstNovel.isBookmark === true) {
            cache.put(`collect${firstNovel.id}`, firstNovel.bookmarkData.id);
            likeNovels.push(Number(firstNovel.id));
          }
        } catch (e) {
          // 防止系列首篇无权限获取
          try {
            firstNovel = getAjaxJson(urlSeriesNovels(novel.seriesId, 30, 0)).body.thumbnails
              .novel[0];
            novel.id = novel.firstNovelId = firstNovel.id;
            novel.tags = novel.tags.concat(firstNovel.tags);
          } catch (e) {
            // 防止系列首篇无权限获取
            firstNovel = {};
            firstNovel.description = "";
          }
        }
        novel.tags.unshift("长篇");
        if (novel.description === "") {
          novel.description = firstNovel.description;
        }
      }
    });
    // 收藏小说/追更系列 写入缓存
    util.saveNovels("likeNovels", likeNovels);
    util.saveNovels("watchedSeries", watchedSeries);
    util.debugFunc(() => {
      java.log(`处理小说完成`);
    });
    return novels;
  };

  _t.formatNovels = (novels: any[]): any[] => {
    novels = util.novelFilter(novels);
    novels.forEach((novel) => {
      novel.title = novel.title.replace(RegExp(/^\s+|\s+$/g), "");
      novel.coverUrl = urlCoverUrl(novel.coverUrl);
      novel.readingTime = `${novel.readingTime / 60} 分钟`;
      novel.createDate = dateFormat(novel.createDate);
      novel.updateDate = dateFormat(novel.updateDate);

      novel.tags2 = [];
      for (let i in novel.tags) {
        let tag = novel.tags[i];
        if (tag.includes("/")) {
          let tags = tag.split("/");
          novel.tags2 = novel.tags2.concat(tags);
        } else {
          novel.tags2.push(tag);
        }
      }
      novel.tags = Array.from(new Set(novel.tags2));
      novel.tags = novel.tags.join(",");
      let collectMsg = "";
      if (novel.seriesId !== undefined) {
        collectMsg = `📃 追更：${util.checkStatus(novel.isWatched)}追更系列`;
      } else {
        collectMsg = `❤️ 收藏：${util.checkStatus(novel.isBookmark)}加入收藏`;
      }

      if (util.settings.MORE_INFORMATION) {
        novel.description = `\n🅿️ 登录：${util.checkStatus(util.isLogin())}登录账号
                ${collectMsg}\n📖 书名：${novel.title}\n👤 作者：${novel.userName}
                #️ 标签：${novel.tags}\n⬆️ 上传：${novel.createDate}
                🔄 更新：${novel.updateDate}\n📄 简介：${novel.description}`;
      } else {
        novel.description = `\n🅿️ 登录：${util.checkStatus(util.isLogin())}登录账号
                ${collectMsg}\n⬆️ 上传：${novel.createDate}\n🔄 更新：${novel.updateDate}
                📄 简介：${novel.description}`;
      }
    });
    return novels;
  };

  /**
   * 正文，详情，搜索：从网址获取id，返回单篇小说 res，系列返回首篇小说 res
   * pixiv 默认分享信息中有#号，不会被识别成链接，无法使用添加网址
   * @param novels 小说列表
   * @returns 首篇小说 res
   */
  _t.getNovelRes = (result: string): any => {
    let novelId = 0;
    let res = { body: {}, error: false };
    const isJson = isJsonString(result);
    const isHtml = isHtmlString(result);

    if (!isJson && isHtml) {
      let id = baseUrl.match(new RegExp("\\d+"))![0];
      let pattern = "(https?://)?(www\\.)?pixiv\\.net/novel/series/\\d+";
      let isSeries = baseUrl.match(new RegExp(pattern));
      if (isSeries) {
        java.log(`系列ID：${id}`);
        try {
          novelId = getAjaxJson(urlSeriesDetailed(id)).body.firstNovelId;
        } catch (e) {
          novelId = getAjaxJson(urlSeriesNovels(id, 30, 0)).body.thumbnails.novel[0].id;
        }
      } else {
        let pattern = "(https?://)?(www\\.)?pixiv\\.net/novel/(show\\.php\\?id=)?\\d+";
        let isNovel = baseUrl.match(new RegExp(pattern));
        if (isNovel) {
          novelId = Number(id);
        }
      }
    }
    if (isJson) {
      res = JSON.parse(result);
    }

    if (novelId) {
      java.log(`匹配小说ID：${novelId}`);
      res = getAjaxJson(urlNovelDetailed(novelId));
    }
    if (res.error === true) {
      java.log(`无法从 Pixiv 获取当前小说`);
      java.log(JSON.stringify(res));
    }
    return res.body;
  };

  /**
   * 目录：从网址获取id，尽可能返回系列 res，单篇小说返回小说 res
   */
  _t.getNovelResSeries = (result: string): any => {
    let seriesId = 0;
    let res = { body: {} as any, error: false };
    let isJson = isJsonString(result);
    let isHtml = isHtmlString(result);

    if (!isJson && isHtml) {
      let id = baseUrl.match(new RegExp("\\d+"))![0];
      let pattern = "(https?://)?(www\\.)?pixiv\\.net/novel/series/\\d+";
      let isSeries = baseUrl.match(new RegExp(pattern));
      if (isSeries) {
        seriesId = Number(id);
      } else {
        let pattern = "(https?://)?(www\\.)?pixiv\\.net/novel/(show\\.php\\?id=)?\\d+";
        let isNovel = baseUrl.match(new RegExp(pattern));
        if (isNovel) {
          java.log(`匹配小说ID：${id}`);
          res = getAjaxJson(urlNovelDetailed(id));
        }
      }
    }
    if (isJson) {
      res = JSON.parse(result);
    }

    if (
      res.body !== undefined &&
      res.body.seriesNavData !== undefined &&
      res.body.seriesNavData !== null
    ) {
      seriesId = res.body.seriesNavData.seriesId;
    }
    if (seriesId) {
      java.log(`系列ID：${seriesId}`);
      res = getAjaxJson(urlSeriesDetailed(seriesId));
    }
    if (res.error === true) {
      java.log(`无法从 Pixiv 获取当前小说`);
      java.log(JSON.stringify(res));
    }
    return res.body;
  };

  return _t;
}

java.log("[DEBUG] load base.loginCheckJS");

const u = ConstructUtil();
// 全局注册 util
util = u;
java.put("util", objStringify(util));

if (util.settings.IS_LEGADO) {
  syncBlockAuthorList();
}

if (result.code() === 200) {
  if (isBackupSource() && !util.isLogin) {
    util.getCsrfToken();
  }
  getPixivUid();
  getWebViewUA();
  util.getCookie();
  getHeaders();
  if (!util.settings.FAST) {
    checkMessageThread(); // 检测过度访问
  }
}

util.debugFunc(() => {
  java.log(`DEBUG = ${util.settings.DEBUG}\n`);
  java.log(JSON.stringify(util.settings, null, 4));
  java.log(`${getWebViewUA()}\n`);
  java.log(`${cache.get("csrfToken")}\n`);
  java.log(`${cache.get("pixivCookie")}\n`);
});

java.getStrResponse(undefined, undefined);
