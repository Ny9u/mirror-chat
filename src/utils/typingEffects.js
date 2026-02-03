/**
 * 打字效果工具类
 * 提供多种动画效果
 */

class TypingEffects {
  constructor(element, text, options = {}) {
    this.element = element;
    this.text = text;
    this.options = {
      onComplete: options.onComplete || null,
      duration: options.duration || 2000,
    };
    this.isDestroyed = false;
  }

  /**
   * 随机选择一个效果并执行
   */
  static random(element, text, options = {}) {
    const effects = ["typewriter", "fadeIn", "slideUp", "wave"];

    const randomEffect = effects[Math.floor(Math.random() * effects.length)];
    const instance = new TypingEffects(element, text, options);

    return instance[randomEffect]();
  }

  /**
   * 效果1: 经典打字机效果
   * 支持HTML标签，保留样式和类名
   */
  typewriter() {
    const speed = 40; // 更快的速度
    this.element.innerHTML = "";
    this.element.style.opacity = "1";

    // 创建临时容器解析HTML
    const tempContainer = document.createElement("div");
    tempContainer.innerHTML = this.text;

    // 收集所有需要显示的节点（标签和文本）
    const nodes = [];
    const collectNodes = (node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        // 保留所有文本，包括空白字符
        nodes.push({ type: "text", content: node.textContent });
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        // 保存开始标签
        nodes.push({ type: "tag-open", element: node.cloneNode(false) });

        // 递归处理子节点
        Array.from(node.childNodes).forEach(collectNodes);

        // 保存结束标签
        nodes.push({ type: "tag-close", element: node });
      }
    };

    Array.from(tempContainer.childNodes).forEach(collectNodes);

    let nodeIndex = 0;
    const elementStack = [];
    let currentContainer = this.element;

    const type = () => {
      if (this.isDestroyed) return;

      if (nodeIndex >= nodes.length) {
        // 动画完成，不再重置innerHTML，保持已构建的DOM结构
        this.complete();
        return;
      }

      const node = nodes[nodeIndex];

      if (node.type === "tag-open") {
        // 处理开始标签
        const element = node.element;
        currentContainer.appendChild(element);
        elementStack.push({ element, parent: currentContainer });
        currentContainer = element;
        nodeIndex++;
        setTimeout(type, 5); // 标签渲染更快
      } else if (node.type === "text") {
        // 处理文本节点
        const text = node.content;

        // 如果文本只包含空白字符，直接添加并跳过
        if (!text.trim() && text.length > 0) {
          currentContainer.appendChild(document.createTextNode(text));
          nodeIndex++;
          setTimeout(type, 5);
          return;
        }

        const span = document.createElement("span");
        span.className = "typing-text";
        currentContainer.appendChild(span);

        let charIndex = 0;
        const typeChar = () => {
          if (this.isDestroyed || charIndex >= text.length) {
            // 文本打字完成，移除span包裹，直接显示文本
            if (span.parentNode) {
              span.parentNode.replaceChild(document.createTextNode(text), span);
            }
            nodeIndex++;
            setTimeout(type, speed);
            return;
          }

          span.textContent += text[charIndex];
          charIndex++;

          const variation = Math.random() * 30 - 15;
          setTimeout(typeChar, speed + variation);
        };

        typeChar();
      } else if (node.type === "tag-close") {
        // 处理结束标签
        const stackItem = elementStack.pop();
        if (stackItem) {
          currentContainer = stackItem.parent;
        }
        nodeIndex++;
        setTimeout(type, 5);
      }
    };

    type();
    return this;
  }

  /**
   * 效果2: 柔和淡入效果
   */
  fadeIn() {
    this.element.innerHTML = this.text;
    this.element.style.opacity = "0";
    this.element.style.transform = "translateY(10px)";
    this.element.style.transition =
      "opacity 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94), transform 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)";

    setTimeout(() => {
      if (this.isDestroyed) return;
      this.element.style.opacity = "1";
      this.element.style.transform = "translateY(0)";
      setTimeout(() => this.complete(), 1200);
    }, 50);

    return this;
  }

  /**
   * 效果3: 从下往上滑入
   */
  slideUp() {
    this.element.innerHTML = this.text;
    this.element.style.opacity = "0";
    this.element.style.transform = "translateY(30px) scale(0.95)";
    this.element.style.transition = "all 1s cubic-bezier(0.34, 1.56, 0.64, 1)";

    setTimeout(() => {
      if (this.isDestroyed) return;
      this.element.style.opacity = "1";
      this.element.style.transform = "translateY(0) scale(1)";
      setTimeout(() => this.complete(), 1000);
    }, 50);

    return this;
  }

  /**
   * 效果4: 字符波浪效果
   * 支持HTML内容渲染，保留HTML结构
   */
  wave() {
    // 先将HTML内容设置到元素中
    this.element.innerHTML = this.text;

    // 获取所有文本节点并包裹每个字符
    // 注意：这个方法会保留HTML标签结构，只拆分最底层的文本节点
    const wrapTextNodes = (node) => {
      const textNodes = [];
      const walker = document.createTreeWalker(
        node,
        NodeFilter.SHOW_TEXT,
        null,
        false
      );

      let currentNode;
      while ((currentNode = walker.nextNode())) {
        // 只处理非空文本节点
        if (currentNode.textContent.trim().length > 0) {
          textNodes.push(currentNode);
        }
      }

      return textNodes;
    };

    const textNodes = wrapTextNodes(this.element);

    // 如果没有文本节点，直接完成
    if (textNodes.length === 0) {
      setTimeout(() => this.complete(), 500);
      return this;
    }

    let charIndex = 0;
    const allSpans = [];

    // 收集所有需要动画的节点，但先不修改DOM
    const nodesToAnimate = [];

    textNodes.forEach((textNode) => {
      const text = textNode.textContent;
      const chars = Array.from(text);

      nodesToAnimate.push({
        node: textNode,
        chars: chars,
        startIndex: charIndex,
        parentElement: textNode.parentElement,
      });

      charIndex += chars.length;
    });

    // 批量替换文本节点，减少DOM操作
    nodesToAnimate.forEach(({ node, chars, startIndex, parentElement }) => {
      const fragment = document.createDocumentFragment();
      const spans = [];

      // 检查父元素是否有渐变文字样式
      const hasGradientParent =
        parentElement && parentElement.classList.contains("username-text");

      chars.forEach((char, idx) => {
        const span = document.createElement("span");
        span.textContent = char;
        span.style.display = "inline-block";
        span.style.opacity = "0";
        span.style.transform = "translateY(20px)";
        span.style.transition = "all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)";
        span.style.whiteSpace = "pre"; // 保留空格

        // 如果父元素有渐变文字样式，让子元素继承
        if (hasGradientParent) {
          span.style.background = "inherit";
          span.style.backgroundSize = "inherit";
          span.style.backgroundClip = "text";
          span.style.webkitTextFillColor = "transparent";
        }

        fragment.appendChild(span);
        spans.push({ span, index: startIndex + idx });
      });

      // 替换原文本节点
      if (node.parentNode) {
        node.parentNode.replaceChild(fragment, node);
        allSpans.push(...spans);
      }
    });

    // 应用波浪动画
    allSpans.forEach(({ span, index }) => {
      setTimeout(() => {
        if (this.isDestroyed) return;
        span.style.opacity = "1";
        span.style.transform = "translateY(0)";
      }, index * 30);
    });

    setTimeout(() => this.complete(), allSpans.length * 30 + 500);
    return this;
  }

  /**
   * 完成回调
   */
  complete() {
    if (this.options.onComplete && !this.isDestroyed) {
      this.options.onComplete();
    }
  }

  /**
   * 销毁实例
   */
  destroy() {
    this.isDestroyed = true;

    // 清理元素样式
    if (this.element) {
      this.element.style.transition = "";
      this.element.style.transform = "";
    }
  }
}

export default TypingEffects;
