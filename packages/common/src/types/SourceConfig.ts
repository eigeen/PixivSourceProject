// 书源配置类型定义

export interface SourceFile {
    /** 文件名 */
    filename: string;
    /** 文件内容 */
    content: string;
    /** 是否为JavaScript文件 */
    isJs?: boolean;
    /** 是否为JSON文件 */
    isJson?: boolean;
}

export interface SourceModule {
    /** 模块名称 */
    name: string;
    /** 源码目录路径 */
    sourceDir: string;
    /** 输出文件名 */
    outputFile: string;
    /** 基础配置文件映射 */
    baseFiles: {
        header?: string;
        jsLib?: string;
        loginUrl?: string;
        loginUI?: string;
        loginCheckJs?: string;
        variableComment?: string;
        bookUrlPattern?: string;
    };
    /** 功能文件映射 */
    functionFiles: {
        search?: string;
        searchUrl?: string;
        discover?: string;
        discoverAddress?: string;
        detail?: string;
        catalog?: string;
        content?: string;
    };
}

export interface BuildConfig {
    /** 输出目录 */
    outputDir: string;
    /** 源码根目录 */
    sourceRoot: string;
    /** 要构建的模块列表 */
    modules: SourceModule[];
    /** 是否压缩输出 */
    minify?: boolean;
    /** 是否生成sourcemap */
    sourcemap?: boolean;
}
