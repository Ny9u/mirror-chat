import hljs from "highlight.js/lib/core";
import "highlight.js/styles/github.css";
import javascript from "highlight.js/lib/languages/javascript";
import python from "highlight.js/lib/languages/python";

// 注册核心语言
hljs.registerLanguage("javascript", javascript);
hljs.registerLanguage("js", javascript);
hljs.registerLanguage("python", python);
hljs.registerLanguage("py", python);

// ===== 按需加载 =====
const languageLoaders = {
  typescript: () => import("highlight.js/lib/languages/typescript"),
  ts: () => import("highlight.js/lib/languages/typescript"),
  css: () => import("highlight.js/lib/languages/css"),
  html: () => import("highlight.js/lib/languages/xml"),
  java: () => import("highlight.js/lib/languages/java"),
  cpp: () => import("highlight.js/lib/languages/cpp"),
  "c++": () => import("highlight.js/lib/languages/cpp"),
  c: () => import("highlight.js/lib/languages/cpp"),
  go: () => import("highlight.js/lib/languages/go"),
  rust: () => import("highlight.js/lib/languages/rust"),
  bash: () => import("highlight.js/lib/languages/bash"),
  shell: () => import("highlight.js/lib/languages/bash"),
  sh: () => import("highlight.js/lib/languages/bash"),
  sql: () => import("highlight.js/lib/languages/sql"),
  json: () => import("highlight.js/lib/languages/json"),
  yaml: () => import("highlight.js/lib/languages/yaml"),
  markdown: () => import("highlight.js/lib/languages/markdown"),
  md: () => import("highlight.js/lib/languages/markdown"),
};

// 已注册的语言集合
const registeredLanguages = new Set(["javascript", "js", "python", "py"]);

// 正在加载中的语言 Promise
const loadingLanguages = new Map();

/**
 * 动态注册语言
 * @param {string} lang
 * @returns {Promise<boolean>}
 */
export async function loadLanguage(lang) {
  if (registeredLanguages.has(lang)) {
    return true;
  }

  if (loadingLanguages.has(lang)) {
    return loadingLanguages.get(lang);
  }

  const langLower = lang?.toLowerCase();
  const loader = languageLoaders[langLower];
  if (!loader) {
    console.warn(`[highlight] 不支持的语言: ${lang}`);
    return false;
  }

  const loadPromise = loader()
    .then((module) => {
      const languageModule = module.default || module;
      hljs.registerLanguage(langLower, languageModule);
      registeredLanguages.add(langLower);
      loadingLanguages.delete(lang);
      console.log(`[highlight] 语言已加载: ${lang}`);
      return true;
    })
    .catch((error) => {
      console.error(`[highlight] 加载语言失败: ${lang}`, error);
      loadingLanguages.delete(lang);
      return false;
    });

  loadingLanguages.set(lang, loadPromise);
  return loadPromise;
}

/**
 * 批量预加载语言
 * @param {string[]} langs
 */
export async function preloadLanguages(langs) {
  await Promise.all(langs.map((lang) => loadLanguage(lang)));
}

/**
 * 检查语言是否已注册
 * @param {string} lang - 语言名称
 */
export function isLanguageRegistered(lang) {
  return registeredLanguages.has(lang?.toLowerCase());
}

export default hljs;
