# PixivSource TypeScript 工程化版本

这是对 [PixivSource](https://github.com/windyhusky/PixivSource) 原仓库的工程化改造项目。

## 工程化改进

本项目对原始的 JavaScript 手工维护模式进行了现代化改造：

### 🛠 技术栈升级

- **TypeScript** - 将原始 JS 脚本迁移到 TypeScript，提供类型安全和更好的开发体验
- **TSX** - 使用 TSX 编译器，确保输出兼容低版本 JavaScript 特性
- **Rollup** - 自动化打包构建，替代手动文件合并
- **PNPM Workspace** - 多包管理，支持模块化开发

### 📁 项目结构

```
├── packages/
│   └── common/          # 共享类型定义和工具
├── projects/
│   └── pixiv/           # Pixiv 书源实现
│       ├── src/         # TypeScript 源码
│       ├── dist/        # 编译输出
│       └── rollup.config.js
├── scripts/
│   ├── build-pixiv.ts           # 自动构建最终 JSON
│   ├── pixiv_other_sources.json # 其他书源内容，由于未被项目化，暂时使用原始文件合并
│   └── pixiv_template.json      # 书源模板文件
└── dist/
    └── pixiv.json       # 最终生成的书源文件
```

### 🔧 自动化工具链

- **自动构建** - 一键编译所有 TypeScript 模块到兼容的 JavaScript
- **智能打包** - Rollup 自动移除 import/export 语句，生成纯净的脚本代码
- **JSON 生成** - 自动将编译后的脚本注入到书源模板，生成最终 JSON 文件

### 💡 开发体验改进

- **类型安全** - TypeScript 提供完整的类型检查和 IDE 支持
- **模块化** - 将大型脚本拆分为独立的功能模块
- **统一配置** - 集中管理编译和构建配置

## 快速开始

### 环境要求

- Node.js 18+
- PNPM 8+

### 安装依赖

```bash
# 如未安装pnpm，需安装
npm install -g pnpm

pnpm install
```

### 开发构建

```bash
# 格式化
pnpm run format

# 完整构建流程
pnpm run build:all

# 或分步执行
pnpm run build:pixiv    # 编译 TypeScript
pnpm run build-json     # 生成 JSON
```

### 输出文件

生成的书源文件位于 `dist/pixiv.json`，可直接导入到阅读软件使用。

## 开发指南

### 添加新功能

1. 在 `projects/pixiv/src/` 目录下修改对应的 TypeScript 文件
2. 运行 `pnpm run build:pixiv` 编译
3. 运行 `pnpm run build-json` 生成最终 JSON

### 修改书源配置

- 模板文件：`scripts/pixiv_template.json`
- 静态配置：`projects/pixiv/src/base.*` 文件

## 关于原项目

本项目是 [PixivSource](https://github.com/windyhusky/PixivSource) 的工程化版本，原项目仍然是主要的发布渠道。

- **原项目地址**：https://github.com/windyhusky/PixivSource
- **使用教程**：https://github.com/windyhusky/PixivSource/blob/main/doc/Pixiv.md
- **发布频道**：[兽人阅读频道](https://t.me/FurryReading)

## 许可证

ISC License
