import MarkdownIt from "markdown-it";
import hljs, { loadLanguage, isLanguageRegistered } from "@/utils/highlight.js";

// 单例模式 - 只创建一个 MarkdownIt 实例
let markdownInstance = null;

// 缓存已处理过的代码块语言
const processedLanguages = new Set();

// 语言加载完成后的回调队列
const languageLoadCallbacks = new Map();

const getMarkdownInstance = () => {
  if (!markdownInstance) {
    markdownInstance = new MarkdownIt({
      html: true,
      linkify: true,
      typographer: true,
      highlight: (str, lang) => {
        if (!lang) {
          return (
            '<pre class="hljs"><code>' +
            markdownInstance.utils.escapeHtml(str) +
            "</code></pre>"
          );
        }

        const langLower = lang.toLowerCase();

        // 已注册的语言，直接高亮
        if (isLanguageRegistered(langLower)) {
          try {
            const result = hljs.highlight(str, { language: langLower }).value;
            return `<pre class="hljs"><code class="language-${langLower}">${result}</code></pre>`;
          } catch (e) {
            return `<pre class="hljs"><code class="language-${langLower}">${markdownInstance.utils.escapeHtml(
              str
            )}</code></pre>`;
          }
        }

        // 未注册的语言，尝试异步加载
        if (!processedLanguages.has(langLower)) {
          processedLanguages.add(langLower);
          // 异步加载语言，加载完成后触发重新高亮
          loadLanguage(langLower).then((success) => {
            if (success) {
              console.log(`[markdown] 语言 ${langLower} 已加载，触发高亮`);
              // 触发该语言的所有待处理回调
              const callbacks = languageLoadCallbacks.get(langLower);
              if (callbacks) {
                callbacks.forEach((cb) => cb());
                languageLoadCallbacks.delete(langLower);
              }
            }
          });
        }

        // 返回未高亮的代码
        return (
          '<pre class="hljs"><code class="language-' +
          langLower +
          '">' +
          markdownInstance.utils.escapeHtml(str) +
          "</code></pre>"
        );
      },
    });
  }
  return markdownInstance;
};

/**
 * 预加载代码块中使用的语言
 * @param {string} content - Markdown 内容
 * @returns {Promise<boolean>} - 是否有新语言被加载
 */
export async function preloadMarkdownLanguages(content) {
  const codeBlockRegex = /```(\w+)/g;
  const languages = new Set();
  let match;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    languages.add(match[1].toLowerCase());
  }

  // 过滤掉已注册的语言
  const newLanguages = Array.from(languages).filter(
    (lang) => !isLanguageRegistered(lang)
  );

  if (newLanguages.length === 0) {
    return false;
  }

  // 批量加载所有需要的语言
  await Promise.all(newLanguages.map((lang) => loadLanguage(lang)));

  console.log("[markdown] 预加载完成:", newLanguages);
  return true;
}

/**
 * 重新高亮所有代码块
 */
export function rehighlightAll() {
  // 使用 nextTick 确保 DOM 已更新
  setTimeout(() => {
    document.querySelectorAll("pre code").forEach((block) => {
      // 如果已经高亮过，清除高亮标记
      block.classList.remove("hljs");
      block.removeAttribute("data-highlighted");
      // 重新高亮
      hljs.highlightElement(block);
    });
    console.log("[markdown] 代码块已重新高亮");
  }, 0);
}

/**
 * 注册语言加载完成回调
 * @param {string} lang - 语言名称
 * @param {Function} callback - 回调函数
 */
export function onLanguageLoaded(lang, callback) {
  const langLower = lang.toLowerCase();
  if (isLanguageRegistered(langLower)) {
    callback();
    return;
  }
  if (!languageLoadCallbacks.has(langLower)) {
    languageLoadCallbacks.set(langLower, []);
  }
  languageLoadCallbacks.get(langLower).push(callback);
}

/**
 * 渲染 Markdown 并自动处理语言加载和高亮
 * @param {string} content - Markdown 内容
 * @returns {Promise<string>} - HTML 字符串
 */
export async function renderMarkdownWithHighlight(content) {
  // 先预加载所有需要的语言
  await preloadMarkdownLanguages(content);

  // 语言加载完成后再渲染
  const html = md.render(content);
  return html;
}

export const md = getMarkdownInstance();
export default getMarkdownInstance;
