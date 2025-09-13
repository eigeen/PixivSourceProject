import typescript from "@rollup/plugin-typescript";

// 自定义插件：移除 import 和 export 语句
function removeImportExports() {
    return {
        name: "remove-exports",
        renderChunk(code) {
            return code
                .replace(/^\s*export\s*{[^}]*};\s*$/gm, "") // 移除整个 export { xxx } 行
                .replace(/^\s*import\s*{[^}]*}.*$/gm, "") // 移除整个 import { xxx } from 'xxx' 行
                .replace(/^\s*\/\/\/ <reference.*$/gm, ""); // 移除整个 /// <reference ... /> 行
        },
    };
}

function getOutputFile(input) {
    return input.replace("src/", "dist/").replace(".ts", ".js");
}

const INPUT_FILES = [
    "src/base.jsLib.ts",
    "src/base.loginUrl.ts",
    "src/base.loginCheckJs.ts",
    "src/catalog.ts",
    "src/content.ts",
    "src/detail.ts",
    "src/discover_address.ts",
    "src/discover.ts",
    "src/search.ts",
    "src/searchUrl.ts",
];

export default INPUT_FILES.map(input => ({
    input,
    output: {
        file: getOutputFile(input),
        format: "esm",
        sourcemap: true,
    },
    // 将jsLib标记为外部依赖，防止内联打包
    external: ["./base.jsLib"],
    plugins: [typescript(), removeImportExports()],
}));
