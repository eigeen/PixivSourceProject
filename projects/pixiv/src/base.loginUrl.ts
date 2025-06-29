import { type Settings, SETTINGS_NAME } from "./settings";
import {
  getAjaxJson,
  isJsonString,
  sleepToast,
  urlNovelBookmarkData,
  urlNovelComments,
  urlNovelDetailed,
  urlNovelUrl,
  urlSearchNovel,
  urlSeriesUrl,
  urlUserUrl,
} from "./base.jsLib";

export function getFromCache(key: string): any | null {
  const data = cache.get(key);
  if (data) {
    return JSON.parse(data);
  }
  return null;
}

export function getWebViewUA(): string {
  let userAgent = String(java.getWebViewUA());
  if (userAgent.includes("Windows NT 10.0; Win64; x64")) {
    userAgent =
      "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Mobile Safari/537.36";
  }
  return userAgent;
}

export function getNovel(): Record<string, string> | null {
  let novel = source.getLoginInfoMap();
  if (!novel) {
    novel = getFromCache("novel");
  }
  return novel;
}

export function isLogin(): boolean {
  let cookie = String(java.getCookie("https://www.pixiv.net/", null));
  return cookie.includes("first_visit_datetime");
}

export function login(): boolean {
  sleepToastWithDefault("🔄 正在检测登陆状态，请稍候");
  if (isLogin()) {
    sleepToastWithDefault("✅ 已经登录过账号了\n\n可以点击【🔙 退出账号】来切换账号");
    return false;
  }

  let resp = java.startBrowserAwait(
    `https://accounts.pixiv.net/login,
  {"headers": {"User-Agent": ${getWebViewUA()}}}`,
    "登录账号",
    false
  );
  if (resp.code() === 200) {
    getCookie();
    getCsrfToken();
    return true;
  } else {
    java.log(resp.code());
    sleepToastWithDefault("⚠️ 登录失败");
    return false;
  }
}

export function logout() {
  removeCookie();
  java.startBrowser("https://www.pixiv.net/logout.php", "退出账号");
  removeCookie();
  sleepToastWithDefault(
    `✅ 已退出当前账号\n\n退出后请点击右上角的 ✔️ 退出\n\n登录请点击【登录账号】进行登录`
  );
}

export function removeCookie() {
  cookie.removeCookie("https://www.pixiv.net");
  cookie.removeCookie("https://accounts.pixiv.net");
  cookie.removeCookie("https://accounts.google.com");
  cookie.removeCookie("https://api.weibo.com");
  cache.delete("pixivCookie");
  cache.delete("csrfToken"); // 与登录设备有关
  cache.delete("headers");
}

// 获取 Csrf Token，以便进行收藏等请求
// 获取方法来自脚本 Pixiv Previewer
// https://github.com/Ocrosoft/PixivPreviewer
// https://greasyfork.org/zh-CN/scripts/30766-pixiv-previewer/code
export function getCsrfToken(): string | null {
  let csrfToken;
  let html = java.webView(undefined, "https://www.pixiv.net/", undefined);
  try {
    csrfToken = html?.match(/token\\":\\"([a-z0-9]{32})/)?.[1] || null;
  } catch (e) {
    csrfToken = null;
  }
  // java.log(csrfToken)
  cache.put("csrfToken", csrfToken); // 与登录设备有关
  return csrfToken;
}

export function getCookie(): string | null {
  let pixivCookie = String(java.getCookie("https://www.pixiv.net/", null));
  if (pixivCookie.includes("first_visit_datetime")) {
    // java.log(pixivCookie)
    cache.put("pixivCookie", pixivCookie, 60 * 60);
    return pixivCookie;
  } else {
    cache.delete("pixivCookie");
    sleepToastWithDefault("未登录账号(pixivCookie)");
    return null;
  }
}

export function getPostBody(
  url: string,
  body: string,
  headers: Record<string, string> = getFromCache("headers") || {}
): { error: boolean; [key: string]: any } {
  if (isJsonString(body)) {
    headers["content-type"] = "application/json; charset=utf-8";
  } else if (typeof body == "string") {
    headers["content-type"] = "application/x-www-form-urlencoded; charset=utf-8";
  }
  try {
    return JSON.parse(java.post(url, body, headers).body());
  } catch (e) {
    // sleepToastWithDefault(e)
    // sleepToastWithDefault(JSON.stringify(headers))
    if (String(e).includes("400")) sleepToastWithDefault(`⚠️ 缺少 headers`, 1);
    else if (String(e).includes("403")) sleepToastWithDefault(`⚠️ 缺少 cookie 或 cookie 过期`, 1);
    else if (String(e).includes("404")) sleepToastWithDefault(`⚠️ 404`, 1);
    else if (String(e).includes("422")) sleepToastWithDefault(`⚠️ 请求信息有误`, 1);
    return { error: true };
  }
}

export function novelBookmarkAdd(restrict = 0) {
  let novel = getNovel();
  if (!novel) {
    return sleepToastWithDefault("⚠️ 无法获取小说信息");
  }

  let resp = getPostBody(
    "https://www.pixiv.net/ajax/novels/bookmarks/add",
    JSON.stringify({ novel_id: novel["id"], restrict: restrict, comment: "", tags: [] })
  );
  if (resp.error === true) sleepToastWithDefault(`⚠️ 收藏【${novel["title"]}】失败`);
  else if (resp["body"] === null) sleepToastWithDefault(`✅ 已经收藏【${novel["title"]}】了`);
  else {
    cache.put(`collect${novel["id"]}`, resp["body"]);
    sleepToastWithDefault(`✅ 已收藏【${novel["title"]}】`);

    let likeNovels = getFromCache("likeNovels");
    likeNovels.push(novel["id"]);
    cache.put("likeNovels", JSON.stringify(likeNovels));
  }
}

export function getNovelBookmarkId(novelId: string | number): string | number {
  let bookmarkId = getFromCache(`collect${novelId}`);
  if (bookmarkId === null) {
    bookmarkId = getAjaxJson(urlNovelBookmarkData(novelId), true).body.bookmarkData.id;
    cache.put(`collect${novelId}`, bookmarkId);
  }
  return bookmarkId;
}

export function novelBookmarkDelete() {
  let novel = getNovel();
  if (!novel) {
    return sleepToastWithDefault("⚠️ 无法获取小说信息");
  }

  let resp = getPostBody(
    "https://www.pixiv.net/ajax/novels/bookmarks/delete",
    `del=1&book_id=${getNovelBookmarkId(novel["id"]!)}`
  );
  if (resp.error === true) sleepToastWithDefault(`⚠️ 取消收藏【${novel["title"]}】失败`);
  else {
    cache.delete(`collect${novel["id"]}`);
    sleepToastWithDefault(`✅ 已取消收藏【${novel["title"]}】`);

    // TODO: 更好的类型标注
    let likeNovels = getFromCache("likeNovels");
    likeNovels = likeNovels.filter((item: any) => item !== Number(novel["id"]));
    cache.put("likeNovels", JSON.stringify(likeNovels));
  }
}

export function novelsBookmarkDelete(novelIds: (string | number)[]) {
  let bookmarkIds: (string | number)[] = [];
  novelIds.forEach((novelId) => {
    bookmarkIds.push(getNovelBookmarkId(novelId));
  });
  let resp = getPostBody(
    "https://www.pixiv.net/ajax/novels/bookmarks/remove",
    JSON.stringify({ bookmarkIds })
  );
  if (resp.error === true) sleepToastWithDefault("⚠️ 取消收藏失败", 1);
  else {
    sleepToastWithDefault("✅ 已取消收藏");
    novelIds.forEach((novelId) => {
      cache.delete(`collect${novelId}`);
    });
  }
}

export function novelBookmarkFactory(code: number) {
  let novel = getNovel();
  if (!novel) {
    return sleepToastWithDefault("⚠️ 无法获取小说信息");
  }

  let collectId = getFromCache(`collect${novel["id"]}`);
  if (collectId >= 1) code = 0;

  if (code === 0) novelBookmarkDelete();
  else if (code === 1) novelBookmarkAdd(0);
  else if (code === 2) novelBookmarkAdd(1);
}

export function novelMarker(page = 1) {
  let novel = getNovel();
  if (!novel) {
    return sleepToastWithDefault("⚠️ 无法获取小说信息");
  }

  let lastMarker = getFromCache(`marker${novel["id"]}`);
  if (lastMarker === true) {
    page = 0;
  }

  let resp = getPostBody(
    "https://www.pixiv.net/novel/rpc_marker.php",
    `mode=save&i_id=${novel["id"]}&u_id=${getFromCache("pixiv:uid")}&page=${page}`
  );
  java.log(`mode=save&i_id=${novel["id"]}&u_id=${getFromCache("pixiv:uid")}&page=${page}`);
  if (resp.error === true) {
    sleepToastWithDefault("⚠️ 操作失败", 1);
  } else if (lastMarker === true) {
    cache.put(`marker${novel["id"]}`, false);
    sleepToastWithDefault(`✅ 已删除书签`);
  } else {
    cache.put(`marker${novel["id"]}`, true);
    sleepToastWithDefault(`✅ 已加入书签`);
  }
}

export function seriesWatch() {
  let novel = getNovel();
  if (!novel) {
    return sleepToastWithDefault("⚠️ 无法获取小说信息");
  }

  let resp = getPostBody(
    `https://www.pixiv.net/ajax/novel/series/${novel["seriesId"]}/watch`,
    "{}"
  );
  if (resp.error === true) sleepToastWithDefault(`⚠️ 追更【${novel["seriesTitle"]}】失败`, 1);
  else {
    cache.put(`watch${novel["seriesId"]}`, true);
    sleepToastWithDefault(`✅ 已追更【${novel["seriesTitle"]}】`);

    let watchedSeries = getFromCache("watchedSeries");
    watchedSeries.push(novel["seriesId"]);
    cache.put("watchedSeries", JSON.stringify(watchedSeries));
  }
}

export function seriesUnWatch() {
  let novel = getNovel();
  if (!novel) {
    return sleepToastWithDefault("⚠️ 无法获取小说信息");
  }

  let resp = getPostBody(
    `https://www.pixiv.net/ajax/novel/series/${novel["seriesId"]}/unwatch`,
    "{}"
  );
  if (resp.error === true) sleepToastWithDefault(`⚠️ 取消追更【${novel["seriesTitle"]}】失败`, 1);
  else {
    cache.delete(`watch${novel["seriesId"]}`);
    sleepToastWithDefault(`✅ 已取消追更【${novel["seriesTitle"]}】`);

    let watchedSeries = getFromCache("watchedSeries");
    // TODO: 更好的类型标注
    watchedSeries = watchedSeries.filter((item: any) => item !== Number(novel["seriesId"]));
    cache.put("watchedSeries", JSON.stringify(watchedSeries));
  }
}

export function seriesWatchFactory(code = 1) {
  let novel = getNovel();
  if (!novel) {
    return sleepToastWithDefault("⚠️ 无法获取小说信息");
  }

  if (!novel["seriesId"]) {
    return sleepToastWithDefault(`⚠️ 【${novel["title"]}】非系列小说，无法加入追更列表`);
  }

  let lastStatus = getFromCache(`watch${novel["seriesId"]}`);
  if (lastStatus === true) code = 0;
  if (code === 0) seriesUnWatch();
  else if (code === 1) seriesWatch();
}

export function userFollow(restrict = 0) {
  let novel = getNovel();
  if (!novel) {
    return sleepToastWithDefault("⚠️ 无法获取小说信息");
  }

  let resp = getPostBody(
    "https://www.pixiv.net/bookmark_add.php",
    `mode=add&type=user&user_id=${novel["userId"]}&tag=""&restrict=${restrict}&format=json`
  );
  if (resp.error === true) sleepToastWithDefault(`⚠️ 关注【${novel["userName"]}】失败`, 1);
  else {
    sleepToastWithDefault(`✅ 已关注【${novel["userName"]}】`);
    cache.put(`follow${novel["userId"]}`, true);
  }
}

export function userUnFollow() {
  let novel = getNovel();
  if (!novel) {
    return sleepToastWithDefault("⚠️ 无法获取小说信息");
  }

  let resp = getPostBody(
    "https://www.pixiv.net/rpc_group_setting.php",
    `mode=del&type=bookuser&id=${novel["userId"]}`
  );
  if (resp.error === true) sleepToastWithDefault(`⚠️ 取消关注【${novel["userName"]}】失败`, 1);
  else {
    sleepToastWithDefault(`✅ 已取消关注【${novel["userName"]}】`);
    cache.delete(`follow${novel["userId"]}`);
  }
}

export function userFollowFactory(code = 1) {
  let novel = getNovel();
  if (!novel) {
    return sleepToastWithDefault("⚠️ 无法获取小说信息");
  }

  let lastStatus = getFromCache(`follow${novel["userId"]}`);
  if (lastStatus === true) code = 0;

  if (code === 0) userUnFollow();
  else if (code === 1) userFollow();
}

export function userBlackList() {
  let action = "block"; // 拉黑作者，非屏蔽作者作品
  let novel = getNovel();
  if (!novel) {
    return sleepToastWithDefault("⚠️ 无法获取小说信息");
  }

  let lastStatus = getFromCache(`block${novel["userId"]}`);
  if (lastStatus === true) action = "unblock";

  let resp = getPostBody(
    `https://www.pixiv.net/ajax/block/save`,
    JSON.stringify({ user_id: novel["userId"], action: action })
  );
  // java.log(JSON.stringify({"user_id": novel.userId, "action": action}))
  if (resp.error === true) sleepToastWithDefault("⚠️ 操作失败", 1);
  else if (lastStatus === true) {
    cache.put(`block${novel["userId"]}`, false);
    sleepToastWithDefault(
      `✅ 已取消拉黑【${novel["userName"]}】\n\n已允许其点赞、评论、收藏、关注、私信等`
    );
  } else {
    cache.put(`block${novel["userId"]}`, true);
    sleepToastWithDefault(
      `✅ 已拉黑【${novel["userName"]}】(Pixiv)\n\n已禁止其点赞、评论、收藏、关注、私信等`
    );
  }
}

export function userBlock() {
  let authors = getFromCache("blockAuthorList");
  let novel = getNovel();
  if (!novel) {
    return sleepToastWithDefault("⚠️ 无法获取小说信息");
  }

  if (authors.includes(Number(novel["userId"]))) {
    // TODO: 更好的类型标注
    authors = authors.filter((author: any) => author !== Number(novel["userId"]));
    sleepToastWithDefault(`✅ 已取消屏蔽【${novel["userName"]}】\n\n现已恢复显示其小说`);
  } else if (novel["userId"] !== undefined && novel["userId"] !== null) {
    authors.push(Number(novel["userId"]));
    sleepToastWithDefault(`✅ 已屏蔽【${novel["userName"]}】(本地)\n\n今后不再显示其小说`);
  }
  cache.put("blockAuthorList", JSON.stringify(authors));
  source.setVariable(authors.toString());
  // sleepToastWithDefault(JSON.stringify(authors))
}

export function novelCommentAdd() {
  let userId = getFromCache("pixiv:uid");
  let novel = getNovel();
  if (!novel) {
    return sleepToastWithDefault("⚠️ 无法获取小说信息");
  }

  let novelId = novel["id"];
  let comment = String(result.get("发送评论")).trim();
  if (comment === "") {
    return sleepToastWithDefault("⚠️ 请输入需要发送的评论");
  }
  let resp = getPostBody(
    "https://www.pixiv.net/novel/rpc/post_comment.php",
    `type=comment&novel_id=${novelId}&author_user_id=${userId}&comment=${encodeURI(comment)}`
  );

  // let body = `type=comment&novel_id=${novelId}&author_user_id=${userId}`
  // if (comment.includes("；")) {
  //     let comment = comment.split("；")
  //     body += `&comment=${encodeURI(comment[0])}&parent_id=${comment[1]}`
  // } else body += `&comment=${encodeURI(comment)}`
  // let resp = getPostBody("https://www.pixiv.net/novel/rpc/post_comment.php", body)

  if (resp.error === true) sleepToastWithDefault("⚠️ 评论失败", 1);
  else sleepToastWithDefault(`✅ 已在【${novel["title"]}】发布评论：\n${comment}`);
}

export function getNovelCommentID(novelId: string | number, comment: string): string[] {
  // TODO: 更好的类型标注
  let resp = getAjaxJson(urlNovelComments(novelId, 0, 50), true);
  let list = resp.body.comments.filter(
    (item: any) => item.userId === String(getFromCache("pixiv:uid")) && item.comment === comment
  );
  // java.log(JSON.stringify(list))
  // let commentID = list.map(item => item.id)
  // java.log(JSON.stringify(commentIDs))
  return list.map((item: any) => item.id);
}

export function novelCommentDelete() {
  let novel = getNovel();
  if (!novel) {
    return sleepToastWithDefault("⚠️ 无法获取小说信息");
  }

  let novelId = novel["id"]!;
  let comment = String(result.get("发送评论")).trim();
  if (comment === "") {
    return sleepToastWithDefault("⚠️ 请输入需要删除的评论");
  }

  let commentIDs = getNovelCommentID(novelId, comment);
  java.log(JSON.stringify(commentIDs));
  if (commentIDs.length === 0) {
    return sleepToastWithDefault(`⚠️ 未能找到这条评论\n请检查是否有错别字或标点符号是否一致`);
  }

  commentIDs.forEach((commentID) => {
    let resp = getPostBody(
      "https://www.pixiv.net/novel/rpc_delete_comment.php",
      `i_id=${novelId}&del_id=${commentID}`
    );
    // java.log(JSON.stringify(resp))
    if (resp.error === true) sleepToastWithDefault("⚠️ 评论删除失败", 1);
    else sleepToastWithDefault(`✅ 已在【${novel["title"]}】删除评论：\n${comment}`);
  });
}

export function startBrowser(url: string, title: string) {
  let headers = `{"headers": {"User-Agent":"${getWebViewUA()}"}}`;
  java.startBrowser(`${url}, ${headers}`, title);
}

export function shareFactory(type: string) {
  let novel = getNovel();
  if (!novel) {
    return sleepToastWithDefault("⚠️ 请在小说阅读页面，使用本功能");
  }

  if (type.includes("author")) {
    startBrowser(urlUserUrl(novel["userId"]!), novel["userName"]!);
  } else if (type.includes("novel") || !novel["seriesId"]) {
    startBrowser(urlNovelUrl(novel["id"]!), novel["title"]!);
  } else if (type.includes("series") && novel["seriesId"]) {
    startBrowser(urlSeriesUrl(novel["seriesId"]!), novel["seriesTitle"]!);
  }
}

export function startPixivSettings() {
  startBrowser("https://www.pixiv.net/settings/viewing", "账号设置");
}
export function startGithub() {
  sleepToastWithDefault("即将打开 Github\n请确认已开启代理", 0.01);
  startBrowser("https://github.com/windyhusky/PixivSource", "书源介绍");
}
export function startGithubIssue() {
  sleepToastWithDefault("即将打开 Github\n请确认已开启代理", 0.01);
  startBrowser("https://github.com/windyhusky/PixivSource/issues", "反馈问题");
}
export function startGithubReadme() {
  sleepToastWithDefault("即将打开 Github\n请确认已开启代理", 0.01);
  startBrowser("https://github.com/windyhusky/PixivSource/blob/main/doc/Pixiv.md", "使用指南");
}

export function charpterReading() {
  let novel = getNovel();
  if (!novel) {
    return sleepToastWithDefault("⚠️ 无法获取小说信息");
  }

  sleepToastWithDefault(`📌 当前章节\n
  系列：${novel["seriesTitle"]}
  章节：${novel["title"]}
  作者：${novel["userName"]}\n
  如非当前章节，请刷新正文`);
}

export function readMeLogin() {
  return sleepToastWithDefault(
    `🅿️ 登录界面功能\n
  使用收藏、追更、关注作者、评论等功能时，需要登录
  使用前请先刷新正文，获取当前章节信息\n
  点击【📌 当前章节】查看书源内部章节信息`,
    5
  );
}

export function readMeSearch() {
  return sleepToastWithDefault(
    `🔍 搜索说明\n
  标签之间需要以【空格】间隔
  👤 作者专搜：@搜索作者名称
  #️ 标签专搜：#标签1 标签2　
  ⏬ 字数筛选1：#标签1 标签2 字数3k5
  ⏬ 字数筛选2：@作者的名称 字数3w5`,
    5
  );
}

export function statusMsg(status: boolean): string {
  if (status === true) return "✅ 已开启";
  else return "🚫 已关闭";
}

// 检测快速模式修改的4个设置
export function getSettingStatus(mode = ""): string {
  let keys: string[] = [];
  let msgList: string[] = [];
  let settings = getFromCache("pixivSettings");

  if (mode !== "FAST") {
    keys = Object.keys(SETTINGS_NAME) as (keyof typeof SETTINGS_NAME)[];
  } else {
    keys = Object.keys(SETTINGS_NAME).slice(0, 5) as (keyof typeof SETTINGS_NAME)[];
  }

  for (let i in keys) {
    msgList.push(`${statusMsg(settings[keys[i]!])}　${SETTINGS_NAME[keys[i]!]}`);
  }
  return msgList.join("\n").trim();
}

export function showSettings() {
  sleepToastWithDefault(`⚙️ 当前设置\n\n${getSettingStatus()}`);
}

export function editSettings<K extends keyof Settings>(settingsKey: K) {
  let msg = "";
  let settings = getFromCache("pixivSettings") as Settings;
  let status: boolean;
  try {
    status = !settings[settingsKey];
    settings[settingsKey] = status;
  } catch (e) {
    status = true;
    settings[settingsKey] = status;
  }

  if (settingsKey !== "FAST") {
    msg = `${statusMsg(status)}　${SETTINGS_NAME[settingsKey]}`;
  } else {
    if (settings[settingsKey] === true) {
      cache.put("pixivLastSettings", JSON.stringify(settings));
      settings.CONVERT_CHINESE = false; // 搜索：繁简通搜
      settings.SEARCH_AUTHOR = false; // 搜索：默认搜索作者
      settings.SHOW_UPDATE_TIME = false; // 目录：显示章节更新时间
      settings.SHOW_ORIGINAL_LINK = false; // 目录：显示章节源链接
      settings.SHOW_COMMENTS = false; // 正文：显示评论
      cache.put("pixivSettings", JSON.stringify(settings));
      let message = getSettingStatus("FAST");
      msg = `\n${statusMsg(status)}　${SETTINGS_NAME[settingsKey]}\n\n${message}`;
    } else {
      settings = getFromCache("pixivLastSettings") as Settings;
      settings.SEARCH_AUTHOR = true;
      settings.FAST = false;
      cache.put("pixivSettings", JSON.stringify(settings));
      let message = getSettingStatus("FAST");
      msg = `已恢复原有设置\n\n${statusMsg(status)}　${SETTINGS_NAME[settingsKey]}\n${message}`;
    }
  }
  sleepToastWithDefault(msg);
  cache.put("pixivSettings", JSON.stringify(settings));
}

export function cleanCache() {
  let novel = getNovel();
  if (!novel) {
    return sleepToastWithDefault("⚠️ 无法获取小说信息");
  }

  cache.delete(`${urlNovelUrl(novel["id"]!)}`);
  cache.delete(`${urlNovelDetailed(novel["id"]!)}`);
  cache.delete(`${urlSearchNovel(novel["title"]!, 1)}`);
  sleepToastWithDefault(`🧹 清除缓存\n\n已清除本章正文缓存，刷新正文以更新`, 5);
}

export function sleepToastWithDefault(text: string, second: number = 0) {
  sleepToast(text, second);
}
