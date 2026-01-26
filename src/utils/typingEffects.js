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
   */
  typewriter() {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = this.text;
    const plainText = tempDiv.textContent || tempDiv.innerText || "";

    let index = 0;
    const speed = 40; // 更快的速度
    this.element.innerHTML = "";
    this.element.style.opacity = "1";

    const type = () => {
      if (this.isDestroyed) return;

      if (index < plainText.length) {
        // 逐字添加，但保持HTML结构
        const currentText = plainText.substring(0, index + 1);
        // 重新构建带HTML标签的文本
        this.element.innerHTML = this.text.replace(plainText, currentText);
        index++;

        const variation = Math.random() * 30 - 15;
        setTimeout(type, speed + variation);
      } else {
        this.element.innerHTML = this.text;
        this.complete();
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
   * 支持HTML内容渲染
   */
  wave() {
    // 先将HTML内容设置到元素中
    this.element.innerHTML = this.text;

    // 获取所有文本节点并包裹每个字符
    const wrapTextNodes = (node) => {
      const textNodes = [];
      const walker = document.createTreeWalker(
        node,
        NodeFilter.SHOW_TEXT,
        null,
        false,
      );

      let currentNode;
      while ((currentNode = walker.nextNode())) {
        textNodes.push(currentNode);
      }

      return textNodes;
    };

    const textNodes = wrapTextNodes(this.element);
    let charIndex = 0;
    const allSpans = [];

    textNodes.forEach((textNode) => {
      const text = textNode.textContent;
      const fragment = document.createDocumentFragment();

      Array.from(text).forEach((char) => {
        const span = document.createElement("span");
        span.textContent = char;
        span.style.display = "inline-block";
        span.style.opacity = "0";
        span.style.transform = "translateY(20px)";
        span.style.transition = "all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)";
        span.style.whiteSpace = "pre"; // 保留空格
        span.dataset.charIndex = charIndex;
        fragment.appendChild(span);
        allSpans.push({ span, index: charIndex });
        charIndex++;
      });

      // 替换原文本节点
      textNode.parentNode.replaceChild(fragment, textNode);
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
