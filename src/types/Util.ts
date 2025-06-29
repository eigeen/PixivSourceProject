import type { Settings } from "../settings";

/**
 * Pixiv工具类接口定义
 * 包含所有用于处理Pixiv相关操作的工具方法
 */
export interface Util {
  /** 设置对象 */
  settings: Settings;

  /**
   * 调试函数，仅在DEBUG模式下执行
   * @param func 要执行的函数
   */
  debugFunc(func: () => void): void;

  /**
   * 检查是否已登录
   * @returns 是否已登录
   */
  isLogin(): boolean;

  /**
   * 检查状态并返回对应的状态文本
   * @param status 状态值
   * @returns 状态文本
   */
  checkStatus(status: boolean): string;

  /**
   * 登录账号
   */
  login(): void;

  /**
   * 退出账号
   */
  logout(): void;

  /**
   * 获取Cookie
   * @returns Cookie字符串或null
   */
  getCookie(): string | null;

  /**
   * 移除Cookie
   */
  removeCookie(): void;

  /**
   * 获取CSRF Token
   * @returns CSRF Token字符串或null
   */
  getCsrfToken(): string | null;

  /**
   * 将多个长篇小说解析为一本书
   * @param novels 小说列表
   * @returns 解析后的小说列表
   */
  combineNovels(novels: any[]): any[];

  /**
   * 处理屏蔽作者
   * @param novels 小说列表
   * @returns 屏蔽作者后的小说列表
   */
  authorFilter(novels: any[]): any[];

  /**
   * 过滤小说（收藏/追更）
   * @param novels 小说列表
   * @returns 过滤后的小说列表
   */
  novelFilter(novels: any[]): any[];

  /**
   * 收藏小说/追更系列 写入缓存
   * @param listInCacheName 缓存名称
   * @param list 列表
   */
  saveNovels(listInCacheName: string, list: any[]): void;

  /**
   * 处理 novels 列表
   * @param novels 小说列表
   * @param detailed 是否详细
   * @returns 处理后的 novels 列表
   */
  handNovels(novels: any[], detailed?: boolean): any[];

  /**
   * 格式化小说列表
   * @param novels 小说列表
   * @returns 格式化后的小说列表
   */
  formatNovels(novels: any[]): any[];

  /**
   * 正文，详情，搜索：从网址获取id，返回单篇小说 res，系列返回首篇小说 res
   * @param result 结果字符串
   * @returns 首篇小说 res
   */
  getNovelRes(result: string): any;

  /**
   * 目录：从网址获取id，尽可能返回系列 res，单篇小说返回小说 res
   * @param result 结果字符串
   * @returns 系列或小说 res
   */
  getNovelResSeries(result: string): any;
} 