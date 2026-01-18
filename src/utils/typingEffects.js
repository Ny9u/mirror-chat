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
    const effects = [
      "typewriter",
      "fadeIn",
      "slideUp",
      "wave",
      "glitch",
      "reveal",
    ];

    const randomEffect = effects[Math.floor(Math.random() * effects.length)];
    const instance = new TypingEffects(element, text, options);

    return instance[randomEffect]();
  }

  /**
   * 效果1: 经典打字机效果
   */
  typewriter() {
    let index = 0;
    const speed = 40; // 更快的速度
    this.element.textContent = "";
    this.element.style.opacity = "1";

    const type = () => {
      if (this.isDestroyed) return;

      if (index < this.text.length) {
        this.element.textContent += this.text.charAt(index);
        index++;

        const variation = Math.random() * 30 - 15;
        setTimeout(type, speed + variation);
      } else {
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
    this.element.textContent = this.text;
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
    this.element.textContent = this.text;
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
   */
  wave() {
    this.element.innerHTML = "";

    const segments = Array.from(this.text);

    segments.forEach((segment, index) => {
      const span = document.createElement("span");
      span.textContent = segment;
      span.style.display = "inline-block";
      span.style.opacity = "0";
      span.style.transform = "translateY(20px)";
      span.style.transition = "all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)";
      span.style.whiteSpace = "pre"; // 保留空格
      this.element.appendChild(span);

      setTimeout(() => {
        if (this.isDestroyed) return;
        span.style.opacity = "1";
        span.style.transform = "translateY(0)";
      }, index * 30);
    });

    setTimeout(() => this.complete(), segments.length * 30 + 500);
    return this;
  }

  /**
   * 效果5: 故障风格
   */
  glitch() {
    this.element.textContent = this.text;
    this.element.style.opacity = "0";

    const glitchSequence = [0.3, 0, 0.7, 0.2, 1];
    let step = 0;

    const animate = () => {
      if (this.isDestroyed) return;

      if (step < glitchSequence.length) {
        this.element.style.opacity = glitchSequence[step];
        this.element.style.transform = `translateX(${
          (Math.random() - 0.5) * 4
        }px)`;
        step++;
        setTimeout(animate, 80);
      } else {
        this.element.style.opacity = "1";
        this.element.style.transform = "translateX(0)";
        this.complete();
      }
    };

    animate();
    return this;
  }

  /**
   * 效果6: 遮罩揭示效果
   */
  reveal() {
    this.element.textContent = this.text;
    this.element.style.position = "relative";
    this.element.style.overflow = "hidden";

    // 创建遮罩层
    const mask = document.createElement("div");
    mask.style.position = "absolute";
    mask.style.top = "0";
    mask.style.left = "0";
    mask.style.width = "100%";
    mask.style.height = "100%";
    mask.style.background = "var(--bg-color)";
    mask.style.transform = "translateX(0)";
    mask.style.transition = "transform 1.2s cubic-bezier(0.65, 0, 0.35, 1)";

    this.element.appendChild(mask);

    setTimeout(() => {
      if (this.isDestroyed) return;
      mask.style.transform = "translateX(100%)";
      setTimeout(() => {
        if (mask.parentNode) {
          mask.remove();
        }
        this.complete();
      }, 1200);
    }, 100);

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
