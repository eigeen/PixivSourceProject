// @js:
import {
    urlNovelDetailed,
    urlNovelUrl,
    urlSeriesDetailed,
    urlSeriesUrl,
} from "./base.jsLib";
import { getUtil } from "./common";

const util = getUtil();

function novelHandler(novel: any) {
    novel = util.formatNovels(util.handNovels([novel]))[0];
    if (novel.seriesId === undefined || novel.seriesId === null) {
        book.bookUrl = novel.detailedUrl = urlNovelUrl(novel.id);
        book.tocUrl = novel.catalogUrl = urlNovelDetailed(novel.id);
    } else {
        book.bookUrl = novel.detailedUrl = urlSeriesUrl(novel.seriesId);
        book.tocUrl = novel.catalogUrl = urlSeriesDetailed(novel.seriesId);
    }
    // 放入信息以便登陆界面使用
    source.putLoginInfo(JSON.stringify(novel));
    cache.put("novel", JSON.stringify(novel));
    return novel;
}

(() => {
    java.log("[DEBUG] load detail.ts");

    return novelHandler(util.getNovelRes(result));
})();
