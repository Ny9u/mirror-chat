import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import { NaiveUiResolver } from "unplugin-vue-components/resolvers";
import Icons from "unplugin-icons/vite";
import IconsResolver from "unplugin-icons/resolver";
import compression from "vite-plugin-compression";
import { visualizer } from "rollup-plugin-visualizer";

/**
 * 开发环境配置
 * - optimizeDeps: 依赖预构建优化，加速冷启动
 */
const devConfig = {
  optimizeDeps: {
    // 核心依赖预构建（仅首屏必需）
    include: [
      "vue",
      "vue-router",
      "pinia",
      "axios",
      // naive-ui 首屏核心组件
      "naive-ui/es/button",
      "naive-ui/es/input",
      "naive-ui/es/message",
      "naive-ui/es/popover",
      "naive-ui/es/config-provider",
      "naive-ui/es/icon",
      "naive-ui/es/spin",
      "naive-ui/es/dialog",
      // unplugin-icons 核心
      "unplugin-icons",
    ],
    // 按需预构建，减少冷启动时间
    force: false,
  },
  server: {
    port: 5174,
    strictPort: false,
    proxy: {
      "/api": {
        target: "http://127.0.0.1:3000",
        changeOrigin: true,
      },
    },
    // 开发时启用 HMR
    hmr: true,
    // 优化开发时冷启动
    warmup: {
      clientFiles: ["./src/main.js", "./src/App.vue"],
    },
  },
};

/**
 * 生产环境配置
 * - Rollup Tree Shaking + Chunk 策略
 * - 代码压缩、分割、优化
 */
const prodConfig = {
  build: {
    // Rollup 打包配置
    rollupOptions: {
      output: {
        // 手动分块策略 - 细粒度代码分割
        manualChunks: (id) => {
          if (id.includes("node_modules")) {
            // ===== 首屏核心依赖=====
            if (
              id.includes("vue/dist") ||
              id.includes("vue/index") ||
              id.includes("@vue/") ||
              id.includes("vue-router") ||
              id.includes("pinia") ||
              id.includes("axios")
            ) {
              return "core";
            }

            if (id.includes("naive-ui")) {
              return "naive-ui";
            }

            if (id.includes("@vicons") || id.includes("unplugin-icons")) {
              return "icons";
            }

            // ===== 非首屏功能（懒加载）=====
            // 代码高亮 - 核心库 + 样式
            if (
              id.includes("highlight.js/lib/core") ||
              id.includes("highlight.js/styles")
            ) {
              return "highlight-base";
            }
            // 代码高亮 - 语言文件单独打包，实现按需加载
            if (id.includes("highlight.js/lib/languages")) {
              // 每个语言单独一个 chunk，例如: highlight-lang-java
              const langMatch = id.match(/languages\/(\w+)/);
              if (langMatch) {
                return `highlight-lang-${langMatch[1]}`;
              }
              return "highlight-langs";
            }
            // Markdown 解析
            if (id.includes("markdown-it")) {
              return "markdown";
            }
            // 日期处理
            if (id.includes("date-fns")) {
              return "date-fns";
            }
            // 截图功能
            if (id.includes("modern-screenshot")) {
              return "screenshot";
            }
            // 其他第三方库
            return "vendor";
          }

          // ===== 业务代码分块 =====
          if (id.includes("/src/views/")) {
            // 非首屏页面拆分为独立 chunk
            if (id.includes("/views/setting/")) {
              return "page-setting"; // 设置页
            }
            if (id.includes("/views/collection/")) {
              return "page-collection"; // 收藏页
            }
            if (id.includes("/views/knowledge/")) {
              return "page-knowledge"; // 知识库页
            }
            if (id.includes("/views/auth/")) {
              return "page-auth"; // 登录页
            }
            // 聊天相关保持在一起
            if (id.includes("/views/chat/")) {
              return "page-chat"; // 聊天页
            }
          }

          // 工具函数分块
          if (id.includes("/src/utils/")) {
            if (id.includes("highlight.js") || id.includes("markdown")) {
              return "util-markdown"; // Markdown 相关工具
            }
          }

          // Services 分块
          if (id.includes("/src/services/")) {
            return "services";
          }
        },
        // 输出文件命名
        chunkFileNames: "assets/js/[name]-[hash].js",
        entryFileNames: "assets/js/[name]-[hash].js",
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split(".");
          const ext = info[info.length - 1];
          if (/\.(css|less|scss)$/i.test(ext)) {
            return "assets/css/[name]-[hash][extname]";
          }
          if (/\.(png|jpe?g|gif|svg|webp|ico)$/i.test(ext)) {
            return "assets/images/[name]-[hash][extname]";
          }
          if (/\.(woff2?|ttf|otf|eot)$/i.test(ext)) {
            return "assets/fonts/[name]-[hash][extname]";
          }
          return "assets/[ext]/[name]-[hash][extname]";
        },
      },
      // Tree Shaking - 消除未使用代码
      treeshake: {
        moduleSideEffects: false,
        propertyReadSideEffects: false,
        tryCatchDeoptimization: false,
      },
    },
    // 代码分割警告阈值
    chunkSizeWarningLimit: 500,
    // CSS 代码分割
    cssCodeSplit: true,
    // 目标浏览器
    target: "es2018",
    // 代码压缩
    minify: "esbuild",
    esbuildOptions: {
      drop: ["console", "debugger"],
      legalComments: "none",
      treeShaking: true,
      minifyWhitespace: true,
      minifyIdentifiers: true,
      minifySyntax: true,
    },
    // 禁用 source map
    sourcemap: false,
    // 资源内联阈值
    assetsInlineLimit: 4096,
    // 报告压缩后大小
    reportCompressedSize: true,
    // CSS 压缩
    cssMinify: true,
    // 模块预加载
    modulePreload: {
      polyfill: true,
    },
    // 清空输出目录
    emptyOutDir: true,
  },
  optimizeDeps: undefined,
};

// 生产环境插件
const prodPlugins = [
  // Gzip 压缩
  compression({
    algorithm: "gzip",
    ext: ".gz",
    threshold: 1024,
    deleteOriginFile: false,
  }),
  // Brotli 压缩
  compression({
    algorithm: "brotliCompress",
    ext: ".br",
    threshold: 1024,
    deleteOriginFile: false,
  }),
  // 打包分析
  visualizer({
    open: true, // 构建后自动打开浏览器
    gzipSize: true, // gzip 压缩后大小
    brotliSize: true, // brotli 压缩后大小
    filename: "stats.html",
  }),
];

// 开发环境插件
const devPlugins = [];

export default defineConfig(({ mode }) => {
  const isProd = mode === "production";
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [
      vue(),
      // 自动导入 API
      AutoImport({
        imports: [
          {
            "naive-ui": [
              "useDialog",
              "useMessage",
              "useNotification",
              "useLoadingBar",
            ],
          },
        ],
        dts: true,
      }),
      // 自动导入组件
      Components({
        resolvers: [
          NaiveUiResolver(),
          // 自动导入图标组件，格式：<i-tabler-[icon-name]>
          IconsResolver({
            prefix: false, // 关闭前缀，直接使用 tabler-icon-name
            enabledCollections: ["tabler"], // 只启用 tabler 图标集
          }),
        ],
        dts: true,
      }),
      // 图标按需加载
      Icons({
        autoInstall: true, // 自动安装图标集
        compiler: "vue3", // 编译为 Vue3 组件
        defaultClass: "icon", // 默认 CSS 类
        defaultStyle: "", // 默认样式
      }),
      // 根据环境加载不同插件
      ...(isProd ? prodPlugins : devPlugins),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    define: {
      "process.env": env,
      __DEV__: !isProd,
      __PROD__: isProd,
    },
    // 合并环境特定配置
    ...(isProd ? prodConfig : devConfig),
  };
});
