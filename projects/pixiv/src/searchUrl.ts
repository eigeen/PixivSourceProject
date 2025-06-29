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
  keyword = keyword.slice(1);
  java.log(`👤 搜索作者：${keyword}`);
} else if (keyword.startsWith("#") || keyword.startsWith("＃")) {
  keyword = keyword.slice(1);
  java.log(`#️⃣ 搜索标签：${keyword}`);
} else {
  java.log(`🔍 搜索内容：${keyword}`);
}
urlSearchSeries(keyword, page);
