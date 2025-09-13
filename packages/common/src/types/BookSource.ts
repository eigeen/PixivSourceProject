// 阅读3.0书源类型定义

export interface BookSourceRule {
    /** 作者 */
    author?: string;
    /** 书名 */
    name?: string;
    /** 封面 */
    coverUrl?: string;
    /** 简介 */
    intro?: string;
    /** 分类 */
    kind?: string;
    /** 最新章节 */
    lastChapter?: string;
    /** 字数 */
    wordCount?: string;
    /** 书籍详情页URL */
    bookUrl?: string;
    /** 目录页URL */
    tocUrl?: string;
    /** 是否可重命名 */
    canReName?: string;
    /** 初始化脚本 */
    init?: string;
}

export interface SearchRule extends BookSourceRule {
    /** 书本列表规则 */
    bookList: string;
    /** 校验关键字 */
    checkKeyWord?: string;
}

export interface ExploreRule extends BookSourceRule {
    /** 书本列表规则 */
    bookList: string;
}

export interface TocRule {
    /** 章节列表规则 */
    chapterList: string;
    /** 章节名称规则 */
    chapterName?: string;
    /** 章节链接规则 */
    chapterUrl?: string;
    /** 更新时间规则 */
    updateTime?: string;
    /** 是否付费 */
    isPay?: string;
    /** 是否VIP */
    isVip?: string;
    /** 下一页链接 */
    nextUrl?: string;
}

export interface ContentRule {
    /** 正文内容规则 */
    content: string;
    /** 下一页链接 */
    nextUrl?: string;
    /** 图片样式 */
    imageStyle?: "DEFAULT" | "FULL";
}

export interface BookSource {
    /** 书源名称 */
    bookSourceName: string;
    /** 书源URL */
    bookSourceUrl: string;
    /** 书源分组 */
    bookSourceGroup?: string;
    /** 书源类型 0-小说 1-漫画 */
    bookSourceType: 0 | 1;
    /** 书源注释 */
    bookSourceComment?: string;
    /** 是否启用 */
    enabled: boolean;
    /** 是否启用发现 */
    enabledExplore?: boolean;
    /** 是否启用Cookie */
    enabledCookieJar?: boolean;
    /** 并发频率 */
    concurrentRate?: string;
    /** 请求头 */
    header?: string;
    /** 书籍URL匹配模式 */
    bookUrlPattern?: string;
    /** 自定义顺序 */
    customOrder?: number;
    /** 权重 */
    weight?: number;
    /** 最后更新时间 */
    lastUpdateTime?: number;
    /** 响应时间 */
    respondTime?: number;
    /** JS库 */
    jsLib?: string;
    /** 登录URL */
    loginUrl?: string;
    /** 登录UI */
    loginUi?: string;
    /** 登录检查JS */
    loginCheckJs?: string;
    /** 搜索URL */
    searchUrl?: string;
    /** 发现URL */
    exploreUrl?: string;
    /** 变量说明 */
    variableComment?: string;
    /** 搜索规则 */
    ruleSearch?: SearchRule;
    /** 发现规则 */
    ruleExplore?: ExploreRule;
    /** 书籍信息规则 */
    ruleBookInfo?: BookSourceRule;
    /** 目录规则 */
    ruleToc?: TocRule;
    /** 正文规则 */
    ruleContent?: ContentRule;
}
