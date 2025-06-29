/**
 * 阅读3.0 JavaScript环境全局类型定义
 * @link https://github.com/gedoor/legado/blob/master/app/src/main/assets/web/help/md/jsHelp.md
 */

import { BookSource } from "./BookSource";

// 全局变量声明
declare global {
  /** 网络响应类型 */
  interface StrResponse {
    /** 响应体 */
    body(): string;
    /** 状态码 */
    code(): number;
    /** 响应消息 */
    message(): string;
    /** 响应头 */
    headers(): Record<string, string>;
    /** 原始响应 */
    raw(): any;
    /** 转换为字符串 */
    toString(): string;
  }

  /** 连接响应类型 */
  interface ConnectionResponse {
    body(): string;
    statusCode(): number;
    statusMessage(): string;
    headers(): Record<string, string>;
  }

  /** 加密算法类型 */
  interface SymmetricCrypto {
    /** 解密为ByteArray */
    decrypt(data: string | ArrayBuffer): ArrayBuffer;
    /** 解密为字符串 */
    decryptStr(data: string | ArrayBuffer): string;
    /** 加密为ByteArray */
    encrypt(data: string | ArrayBuffer): ArrayBuffer;
    /** 加密为Base64字符串 */
    encryptBase64(data: string | ArrayBuffer): string;
    /** 加密为HEX字符串 */
    encryptHex(data: string | ArrayBuffer): string;
  }

  /** 非对称加密算法类型 */
  interface AsymmetricCrypto {
    /** 设置公钥 */
    setPublicKey(key: string | ArrayBuffer): AsymmetricCrypto;
    /** 设置私钥 */
    setPrivateKey(key: string | ArrayBuffer): AsymmetricCrypto;
    /** 解密为ByteArray */
    decrypt(data: string | ArrayBuffer, usePublicKey?: boolean): ArrayBuffer;
    /** 解密为字符串 */
    decryptStr(data: string | ArrayBuffer, usePublicKey?: boolean): string;
    /** 加密为ByteArray */
    encrypt(data: string | ArrayBuffer, usePublicKey?: boolean): ArrayBuffer;
    /** 加密为Base64字符串 */
    encryptBase64(data: string | ArrayBuffer, usePublicKey?: boolean): string;
    /** 加密为HEX字符串 */
    encryptHex(data: string | ArrayBuffer, usePublicKey?: boolean): string;
  }

  /** 签名算法类型 */
  interface SignAlgorithm {
    /** 设置公钥 */
    setPublicKey(key: string | ArrayBuffer): SignAlgorithm;
    /** 设置私钥 */
    setPrivateKey(key: string | ArrayBuffer): SignAlgorithm;
    /** 签名输出ByteArray */
    sign(data: string | ArrayBuffer): ArrayBuffer;
    /** 签名输出HEX字符串 */
    signHex(data: string | ArrayBuffer): string;
  }

  /** URL解析类型 */
  interface JsURL {
    href: string;
    protocol: string;
    host: string;
    hostname: string;
    port: string;
    pathname: string;
    search: string;
    hash: string;
  }

  /** 书籍对象类型 */
  interface Book {
    /** 详情页URL */
    bookUrl: string;
    /** 目录页URL */
    tocUrl: string;
    /** 书源URL */
    origin: string;
    /** 书源名称 */
    originName: string;
    /** 书籍名称 */
    name: string;
    /** 作者名称 */
    author: string;
    /** 分类信息 */
    kind: string;
    /** 自定义分类 */
    customTag: string;
    /** 封面URL */
    coverUrl: string;
    /** 自定义封面URL */
    customCoverUrl: string;
    /** 简介内容 */
    intro: string;
    /** 自定义简介 */
    customIntro: string;
    /** 字符集 */
    charset: string;
    /** 类型 0:文本 1:音频 */
    type: number;
    /** 自定义分组 */
    group: number;
    /** 最新章节标题 */
    latestChapterTitle: string;
    /** 最新章节时间 */
    latestChapterTime: number;
    /** 最后检查时间 */
    lastCheckTime: number;
    /** 最后检查新章节数量 */
    lastCheckCount: number;
    /** 总章节数 */
    totalChapterNum: number;
    /** 当前章节标题 */
    durChapterTitle: string;
    /** 当前章节索引 */
    durChapterIndex: number;
    /** 当前阅读位置 */
    durChapterPos: number;
    /** 最近阅读时间 */
    durChapterTime: number;
    /** 是否可更新 */
    canUpdate: boolean;
    /** 手动排序 */
    order: number;
    /** 书源排序 */
    originOrder: number;
    /** 自定义变量 */
    variable: string;
  }

  /** 章节对象类型 */
  interface Chapter {
    /** 章节地址 */
    url: string;
    /** 章节标题 */
    title: string;
    /** 基础URL */
    baseUrl: string;
    /** 书籍地址 */
    bookUrl: string;
    /** 章节序号 */
    index: number;
    /** 音频真实URL */
    resourceUrl: string;
    /** 标签 */
    tag: string;
    /** 章节起始位置 */
    start: number;
    /** 章节终止位置 */
    end: number;
    /** 变量 */
    variable: string;
  }

  /** RSS文章对象类型 */
  interface RssArticle {
    /** 文章标题 */
    title: string;
    /** 文章链接 */
    link: string;
    /** 文章描述 */
    description: string;
    /** 发布日期 */
    pubDate: string;
    /** GUID */
    guid: string;
    /** 作者 */
    author: string;
    /** 内容 */
    content: string;
    /** 图片 */
    image: string;
  }

  /** 书源对象类型 */
  interface Source extends BookSource {
    /** 获取书源key */
    getKey(): string;
    /** 设置变量 */
    setVariable(variable: string): void;
    /** 获取变量 */
    getVariable(): string;
    /** 获取登录头 */
    getLoginHeader(): string;
    /** 获取登录头映射 */
    getLoginHeaderMap(): Record<string, string>;
    /** 保存登录头 */
    putLoginHeader(header: string): void;
    /** 清除登录头 */
    removeLoginHeader(): void;
    /** 获取登录信息 */
    getLoginInfo(): string;
    /** 获取登录信息映射 */
    getLoginInfoMap(): Record<string, string>;
    /** 保存用户信息,aes加密 */
    putLoginInfo(info: string): boolean;
    /** 清除登录信息 */
    removeLoginInfo(): void;
  }

  /** Cookie操作类型 */
  interface CookieStore {
    /** 获取全部cookie */
    getCookie(url: string): string;
    /** 获取cookie键值 */
    getKey(url: string, key: string): string;
    /** 设置cookie */
    setCookie(url: string, cookie: string): void;
    /** 替换cookie */
    replaceCookie(url: string, cookie: string): void;
    /** 删除cookie */
    removeCookie(url: string): void;
  }

  /** 缓存管理器类型 */
  interface CacheManager {
    /** 保存到数据库 */
    put(key: string, value: any, saveTime?: number): void;
    /** 从数据库读取 */
    get(key: string): string | null;
    /** 删除 */
    delete(key: string): void;
    /** 缓存文件内容 */
    putFile(key: string, value: string, saveTime?: number): void;
    /** 读取文件内容 */
    getFile(key: string): string | null;
    /** 保存到内存 */
    putMemory(key: string, value: any): void;
    /** 从内存读取 */
    getFromMemory(key: string): any | null;
    /** 删除内存 */
    deleteMemory(key: string): void;
  }

  /** 解析规则类型 */
  interface AnalyzeRule {
    /** 获取字符串 */
    getString(ruleStr: string, mContent?: any, isUrl?: boolean): string;
    /** 获取字符串列表 */
    getStringList(ruleStr: string, mContent?: any, isUrl?: boolean): string[];
    /** 设置解析内容 */
    setContent(content: any, baseUrl?: string): void;
    /** 获取元素 */
    getElement(ruleStr: string): any;
    /** 获取元素列表 */
    getElements(ruleStr: string): any[];
    /** 重新获取书籍 */
    reGetBook(): void;
    /** 刷新目录URL */
    refreshTocUrl(): void;
    /** 获取变量 */
    get(key: string): any;
    /** 设置变量 */
    put(key: string, value: any): void;
  }

  /**
   * 解析URL类型
   * js中通过java.调用,只在登录检查JS规则中有效
   * 此处只定义了部分可能有用的方法, 具体请参考源码
   * @link https://github.com/gedoor/legado/blob/master/app/src/main/java/io/legado/app/data/entities/BookSource.kt
   */
  interface AnalyzeUrl {
    /**
     * 处理url
     * fun initUrl() {
     *    ruleUrl = mUrl
     *    //执行@js,<js></js>
     *    analyzeJs()
     *    //替换参数
     *    replaceKeyPageJs()
     *    //处理URL
     *    analyzeUrl()
     * }
     */
    initUrl(): void;
    getUserAgent(): string;
    isPost(): boolean;
    /** 获取头部映射 */
    getHeaderMap(): Record<string, any>;
    /** 获取字符串响应 */
    getStrResponse(jsStr?: string, sourceRegex?: string): string;
    /** 获取响应 */
    getResponse(): any;
  }

  /** RSS JavaScript扩展类型 */
  interface RssJsExtensions {
    /** 调用阅读搜索 */
    searchBook(bookName: string): void;
    /** 添加书架 */
    addBook(bookUrl: string): void;
  }

  interface JavaExtensions {
    /** URL解析 */
    toURL(url: string, baseUrl?: string): JsURL;
    /** 获取WebView User-Agent */
    getWebViewUA(): string;
    /** AJAX请求 */
    ajax(urlStr: string): string;
    /** 批量AJAX请求 */
    ajaxAll(urlList: string[]): StrResponse[];
    /** 连接请求 */
    connect(urlStr: string): StrResponse;
    /** POST请求 */
    post(url: string, body: string, headerMap: Record<string, string>): ConnectionResponse;
    /** GET请求 */
    get(url: string, headerMap: Record<string, string>): ConnectionResponse;
    /** HEAD请求 */
    head(url: string, headerMap: Record<string, string>): ConnectionResponse;
    /**
     * 使用webView访问网络
     * @param html 直接用webView载入的html, 如果html为空直接访问url
     * @param url html内如果有相对路径的资源不传入url访问不了
     * @param js 用来取返回值的js语句, 没有就返回整个源代码
     * @return 返回js获取的内容
     */
    webView(html?: string | null, url?: string | null, js?: string | null): string | null;
    /** WebView获取跳转URL */
    webViewGetOverrideUrl(
      html?: string,
      url?: string,
      js?: string,
      overrideUrlRegex?: string
    ): string | null;
    /** WebView获取资源URL */
    webViewGetSource(html?: string, url?: string, js?: string, sourceRegex?: string): string | null;
    /** 启动浏览器 */
    startBrowser(url: string, title: string): void;
    /** 启动浏览器并等待结果 */
    startBrowserAwait(url: string, title: string, refetchAfterSuccess?: boolean): StrResponse;
    /** 日志输出 */
    log(msg: any): void;
    /** 类型日志 */
    logType(variable: any): void;
    /** 获取验证码 */
    getVerificationCode(imageUrl: string): string;
    /** 长时间提示 */
    longToast(msg: any): void;
    /** 短时间提示 */
    toast(msg: any): void;
    /** 导入脚本 */
    importScript(path: string): string;
    /** 缓存文件 */
    cacheFile(url: string, saveTime?: number): string;
    /** 获取压缩文件字符串内容 */
    getZipStringContent(url: string, path: string, charsetName?: string): string;
    /** 获取压缩文件字节内容 */
    getZipByteArrayContent(url: string, path: string): ArrayBuffer | null;
    /** URI编码 */
    encodeURI(str: string, enc?: string): string;
    /** Base64解码 */
    base64Decode(str: string, charset?: string): string;
    /** Base64解码为字节数组 */
    base64DecodeToByteArray(str: string, flags?: number): ArrayBuffer;
    /** Base64编码 */
    base64Encode(str: string, flags?: number): string;
    /** 字符串转字节 */
    strToBytes(str: string, charset?: string): ArrayBuffer;
    /** 字节转字符串 */
    bytesToStr(bytes: ArrayBuffer, charset?: string): string;
    /** HEX解码为字节数组 */
    hexDecodeToByteArray(hex: string): ArrayBuffer;
    /** HEX解码为字符串 */
    hexDecodeToString(hex: string): string;
    /** HEX编码为字符串 */
    hexEncodeToString(utf8: string): string;
    /** 随机UUID */
    randomUUID(): string;
    /** Android ID */
    androidId(): string;
    /** 繁体转简体 */
    t2s(text: string): string;
    /** 简体转繁体 */
    s2t(text: string): string;
    /** UTC时间格式化 */
    timeFormatUTC(time: number, format: string, sh: number): string | null;
    /** 时间格式化 */
    timeFormat(time: number): string;
    /** HTML格式化 */
    htmlFormat(str: string): string;
    /** 下载文件 */
    downloadFile(url: string): string;
    /** 解压文件 */
    unArchiveFile(zipPath: string): string;
    /** 解压ZIP */
    unzipFile(zipPath: string): string;
    /** 解压RAR */
    unrarFile(zipPath: string): string;
    /** 解压7Z */
    un7zFile(zipPath: string): string;
    /** 获取文件夹内所有文本 */
    getTxtInFolder(unzipPath: string): string;
    /** 读取文本文件 */
    readTxtFile(path: string): string;
    /** 删除文件 */
    deleteFile(path: string): void;
    /** 创建对称加密 */
    createSymmetricCrypto(
      transformation: string,
      key: string | ArrayBuffer,
      iv?: string | ArrayBuffer
    ): SymmetricCrypto;
    /** 创建非对称加密 */
    createAsymmetricCrypto(transformation: string): AsymmetricCrypto;
    /** 创建签名 */
    createSign(algorithm: string): SignAlgorithm;
    /** 摘要HEX */
    digestHex(data: string, algorithm: string): string | null;
    /** 摘要Base64 */
    digestBase64Str(data: string, algorithm: string): string | null;
    /** MD5编码 */
    md5Encode(str: string): string;
    /** MD5编码16位 */
    md5Encode16(str: string): string;
    /** HMac HEX */
    HMacHex(data: string, algorithm: string, key: string): string;
    /** HMac Base64 */
    HMacBase64(data: string, algorithm: string, key: string): string;
    /** 打开URL */
    openUrl(url: string, mimeType?: string): void;
    /** 获取Cookie (不推荐) */
    getCookie(url: string, key?: string | null): string;
  }

  /** Java扩展类型 */
  type JavaExt = JavaExtensions & AnalyzeRule & RssJsExtensions & AnalyzeUrl;

  /** Java扩展对象 */
  const java: JavaExt;
  /** 当前URL */
  const baseUrl: string;
  /** 上一步的结果 */
  const result: any;
  /** 书籍对象 */
  const book: Book;
  /** RSS文章对象 */
  const rssArticle: RssArticle;
  /** 章节对象 */
  const chapter: Chapter;
  /** 书源对象 */
  const source: Source;
  /** Cookie操作对象 */
  const cookie: CookieStore;
  /** 缓存操作对象 */
  const cache: CacheManager;
  /** 章节当前标题 */
  const title: string;
  /** 请求返回的源码 */
  const src: string;
  /** 下一章节URL */
  const nextChapterUrl: string;

  /** Rhino JavaScript导入器 */
  const JavaImporter: any;
  /** 导入类 */
  const importClass: (clazz: any) => void;
  /** 导入包 */
  const importPackage: (pkg: any) => void;
  /** 获取类 */
  const getClass: (name: string) => any;
  /** Java包 */
  const Packages: any;
  /** Java适配器 */
  const JavaAdapter: any;
}

export {};
