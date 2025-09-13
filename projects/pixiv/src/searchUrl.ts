import { urlSearchSeries } from "./base.jsLib";

// 标注一些变量来自外部
declare const key: string;
declare const page: number;

// @js:
java.put("key", key);
java.put("page", page);
let keywordSplit = key.split(" ");
let keyword = "";
let limitedTextCount;
if (key.includes("字数") || key.includes("字數")) {
    limitedTextCount = keywordSplit.pop();
    keyword = keywordSplit.join(" ");
} else {
    limitedTextCount = "";
    keyword = key;
}
java.put("keyword", keyword);
java.put("limitedTextCount", limitedTextCount);

if (keyword.startsWith("@") || keyword.startsWith("＠")) {
    if (keyword.includes("#") || keyword.includes("＃")) {
        let author = keyword.split(" ")[0];
        let tags = keyword.replace(author, "").trim().slice(1);
        java.put("keyword", author);
        java.put("inputTags", tags);
        java.log(
            `👤 搜索作者：${author} #️⃣ 过滤标签：${tags.replace(" ", "、")}`,
        );
    } else {
        java.put("keyword", keyword);
        java.log(`👤 搜索作者：${keyword.slice(1)}`);
    }
} else if (keyword.startsWith("#") || keyword.startsWith("＃")) {
    keyword = keyword.slice(1);
    if (keyword.includes("@") || keyword.includes("＠")) {
        const author = keyword.match(new RegExp(/[@＠](.*)/));
        if (author) {
            keyword = keyword.replace(author[0], "").trim();
            java.put("inputAuthor", author[1]);
            java.log(`#️⃣ 搜索标签：${keyword} 👤 过滤作者：${author[1]}`);
        } else {
            java.log(`#️⃣ 搜索标签：${keyword}`);
        }
    } else {
        java.log(`#️⃣ 搜索标签：${keyword}`);
    }
    java.put("keyword", `#${keyword}`);
} else {
    java.log(`🔍 搜索内容：${keyword}`);
}
urlSearchSeries(keyword, page);

// 同时搜索多个链接的搜索结果
// let li = [
//     urlSearchSeries(keyword, page),
//     urlSearchNovel(keyword, page)
// ]
// // resp = getAjaxAllJson(li)
// // resp = resp.map(res => JSON.stringify(res)).join(",")
// resp = java.ajaxAll(li).map(resp => resp.body()).join(",")
// resp = `[${resp}]`
