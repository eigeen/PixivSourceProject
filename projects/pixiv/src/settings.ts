export interface Settings {
    SEARCH_AUTHOR: boolean;
    CONVERT_CHINESE: boolean;
    SHOW_LIKE_NOVELS: boolean;
    SHOW_UPDATE_TIME: boolean;
    SHOW_ORIGINAL_LINK: boolean;
    SHOW_COMMENTS: boolean;
    MORE_INFORMATION: boolean;
    REPLACE_TITLE_MARKS: boolean;
    SHOW_CAPTIONS: boolean;
    SHOW_WATCHED_SERIES: boolean;
    FAST: boolean;
    DEBUG: boolean;
    IS_LEGADO: boolean;
    IS_SOURCE_READ: boolean;
    IS_BACKUP_SOURCE: boolean;
    // HIDE_AI_WORKS: boolean;
    // SENSITIVE_VIEW: number;
    // USER_X_RESTRICT: number;
    // READING_STATUS: boolean;
}

export const SETTINGS_NAME: Record<string, string> = {
    SEARCH_AUTHOR: "🔍 搜索作者",
    CONVERT_CHINESE: "🀄️ 繁简通搜",
    SHOW_LIKE_NOVELS: "❤️ 显示收藏",
    SHOW_UPDATE_TIME: "📅 更新时间",
    SHOW_ORIGINAL_LINK: "🔗 原始链接",
    SHOW_COMMENTS: "💬 显示评论",
    MORE_INFORMATION: "📖 更多简介",
    REPLACE_TITLE_MARKS: "📚 恢复《》",
    SHOW_CAPTIONS: "🖼️ 显示描述",
    SHOW_WATCHED_SERIES: "📃 显示追更",
    FAST: "⏩ 快速模式",
    DEBUG: "🐞 调试模式",
};

export enum MaxPageConfigKey {
    SERIES_MAX_PAGES = "seriesMaxPages",
    NOVELS_MAX_PAGES = "novelsMaxPages",
}

export const MAX_PAGE_CONFIG_NAME: Record<MaxPageConfigKey, string> = {
    [MaxPageConfigKey.SERIES_MAX_PAGES]: "系列最大页码",
    [MaxPageConfigKey.NOVELS_MAX_PAGES]: "单篇最大页码",
};

// export const SETTINGS_DEFAULT: Settings = {
//   SEARCH_AUTHOR: true,
//   CONVERT_CHINESE: true,
//   SHOW_LIKE_NOVELS: true,
//   SHOW_WATCHED_SERIES: true,
//   MORE_INFORMATION: false,
//   SHOW_UPDATE_TIME: true,
//   SHOW_ORIGINAL_LINK: true,
//   REPLACE_TITLE_MARKS: true,
//   SHOW_CAPTIONS: true,
//   SHOW_COMMENTS: true,
//   FAST: false,
//   DEBUG: false,
// };
