<template>
  <div class="auth-container">
    <div class="logo">
      <img src="@/assets/logo_dark.svg" alt="Mirror Logo" />
    </div>
    <div class="auth-card">
      <div class="title">
        <h1 ref="titleElement">
          {{
            activeTab === "login"
              ? "登录到Mirror 💚"
              : activeTab === "reset"
                ? "重置密码 🔑"
                : "注册Mirror 👏"
          }}
        </h1>
      </div>

      <!-- 登录表单 -->
      <div v-show="activeTab === 'login'" class="form-container">
        <n-form :model="loginForm" :rules="loginRules" ref="loginFormRef">
          <div class="input-group">
            <n-form-item path="email" label="电子邮箱">
              <n-input
                v-model:value="loginForm.email"
                placeholder="请输入您的电子邮箱"
                size="large"
              >
                <template #prefix>
                  <n-icon :component="Mail" />
                </template>
              </n-input>
            </n-form-item>
            <n-form-item
              path="password"
              label="密码"
              style="margin-bottom: 0px"
            >
              <n-input
                v-model:value="loginForm.password"
                type="password"
                placeholder="请输入您的密码"
                show-password-on="click"
                size="large"
              >
                <template #prefix>
                  <n-icon :component="Lock" />
                </template>
              </n-input>
            </n-form-item>
            <div class="forget-password">
              <n-button type="primary" text @click="activeTab = 'reset'"
                >忘记密码？</n-button
              >
            </div>
          </div>
          <n-form-item>
            <n-button
              type="primary"
              style="font-size: 16px"
              @click="handleLogin"
              :loading="loginLoading"
              :disabled="!isLoginFormValid"
              block
            >
              登录
            </n-button>
          </n-form-item>
        </n-form>

        <div class="auth-footer">
          <span>没有账号？</span>
          <n-button type="primary" text @click="activeTab = 'register'"
            >立即注册</n-button
          >
        </div>
      </div>

      <!-- 注册表单 -->
      <div v-show="activeTab === 'register'" class="form-container">
        <n-form
          :model="registerForm"
          :rules="registerRules"
          ref="registerFormRef"
        >
          <div class="input-group">
            <n-form-item path="username" label="用户名">
              <n-input
                v-model:value="registerForm.username"
                placeholder="请输入您的用户名"
                size="large"
              >
                <template #prefix>
                  <n-icon :component="User" />
                </template>
              </n-input>
            </n-form-item>
            <n-form-item path="email" label="电子邮箱">
              <n-input
                v-model:value="registerForm.email"
                placeholder="请输入您的电子邮箱"
                size="large"
              >
                <template #prefix>
                  <n-icon :component="Mail" />
                </template>
              </n-input>
            </n-form-item>
            <n-form-item path="password" label="密码">
              <n-input
                v-model:value="registerForm.password"
                type="password"
                placeholder="请输入您的密码"
                show-password-on="click"
                size="large"
              >
                <template #prefix>
                  <n-icon :component="Lock" />
                </template>
              </n-input>
            </n-form-item>
            <n-form-item path="verifyCode" label="验证码">
              <n-input
                v-model:value="registerForm.verificationCode"
                placeholder="请输入验证码"
                show-password-on="click"
                size="large"
              >
                <template #prefix>
                  <n-icon :component="Lock" />
                </template>
              </n-input>
              <n-button
                type="primary"
                style="margin-left: 1.5rem; height: 2.8rem"
                @click="getVerifyCode"
                :disabled="countdown > 0"
              >
                {{ verifyCodeButtonText }}
              </n-button>
            </n-form-item>
          </div>
        </n-form>

        <n-form-item>
          <n-button
            type="primary"
            style="font-size: 16px"
            @click="handleRegister"
            :loading="registerLoading"
            :disabled="!isRegisterFormValid"
            block
          >
            注册
          </n-button>
        </n-form-item>

        <div class="auth-footer">
          <span>已有账户？</span>
          <n-button type="primary" text @click="activeTab = 'login'"
            >立即登录</n-button
          >
        </div>
      </div>

      <!-- 重置表单 -->
      <div v-show="activeTab === 'reset'" class="form-container">
        <!-- 验证邮箱 -->
        <div v-if="resetStep === 1">
          <n-form
            :model="emailVerificationForm"
            :rules="emailVerificationRules"
            ref="emailVerificationFormRef"
          >
            <div class="input-group">
              <n-form-item path="email" label="电子邮箱">
                <n-input
                  v-model:value="emailVerificationForm.email"
                  placeholder="请输入您的电子邮箱"
                  size="large"
                >
                  <template #prefix>
                    <n-icon :component="Mail" />
                  </template>
                </n-input>
              </n-form-item>
              <n-form-item path="verificationCode" label="验证码">
                <n-input
                  v-model:value="emailVerificationForm.verificationCode"
                  placeholder="请输入验证码"
                  size="large"
                >
                  <template #prefix>
                    <n-icon :component="Lock" />
                  </template>
                </n-input>
                <n-button
                  type="primary"
                  style="margin-left: 1.5rem; height: 2.8rem"
                  @click="getResetVerifyCode"
                  :disabled="countdown > 0"
                >
                  {{ verifyCodeButtonText }}
                </n-button>
              </n-form-item>
            </div>
          </n-form>

          <n-form-item>
            <n-button
              type="primary"
              style="font-size: 16px"
              @click="handleVerifyEmail"
              :loading="resetLoading"
              :disabled="!isEmailVerificationFormValid"
              block
            >
              验证
            </n-button>
          </n-form-item>
        </div>

        <!-- 设置新密码 -->
        <div v-if="resetStep === 2">
          <n-form
            :model="passwordResetForm"
            :rules="passwordResetRules"
            ref="passwordResetFormRef"
          >
            <div class="input-group">
              <n-form-item path="newPassword" label="新密码">
                <n-input
                  v-model:value="passwordResetForm.newPassword"
                  type="password"
                  placeholder="请输入新密码"
                  show-password-on="click"
                  size="large"
                >
                  <template #prefix>
                    <n-icon :component="Lock" />
                  </template>
                </n-input>
              </n-form-item>
              <n-form-item path="confirmPassword" label="确认密码">
                <n-input
                  v-model:value="passwordResetForm.confirmPassword"
                  type="password"
                  placeholder="请再次输入新密码"
                  show-password-on="click"
                  size="large"
                >
                  <template #prefix>
                    <n-icon :component="Lock" />
                  </template>
                </n-input>
              </n-form-item>
            </div>
          </n-form>

          <n-form-item>
            <n-button
              type="primary"
              @click="handleResetPassword"
              :loading="resetLoading"
              :disabled="!isPasswordResetFormValid"
              block
            >
              重置密码
            </n-button>
          </n-form-item>
        </div>

        <div class="auth-footer">
          <span>记得你的密码？</span>
          <n-button type="primary" text @click="backToLogin">登录</n-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
  useMessage,
  NForm,
  NFormItem,
  NInput,
  NCheckbox,
  NButton,
  NIcon,
} from "naive-ui";
import { User, Mail, Lock } from "@vicons/tabler";
import {
  login,
  register,
  sendVerificationCode,
  verifyCode,
  resetPassword,
} from "@/services/user";
import { useConfigStore } from "@/stores/configStore";
import { encrypt } from "@/utils/encryption";

const route = useRoute();
const router = useRouter();
const message = useMessage();
const configStore = useConfigStore();
const loginFormRef = ref(null);
const registerFormRef = ref(null);
const emailVerificationFormRef = ref(null);
const passwordResetFormRef = ref(null);
const titleElement = ref(null);
const activeTab = ref(route.query.action === "register" ? "register" : "login");
const resetStep = ref(1); // 重置密码步骤：1-验证邮箱，2-设置新密码

const loginForm = reactive({
  email: "",
  password: "",
});

const registerForm = reactive({
  username: "",
  email: "",
  password: "",
  verificationCode: "",
});

const emailVerificationForm = reactive({
  email: "",
  verificationCode: "",
});

const passwordResetForm = reactive({
  newPassword: "",
  confirmPassword: "",
});

const loginLoading = ref(false);
const registerLoading = ref(false);
const resetLoading = ref(false);
const countdown = ref(0);

const isLoginFormValid = computed(() => {
  return loginForm.email.trim() !== "" && loginForm.password.trim() !== "";
});

const isRegisterFormValid = computed(() => {
  return (
    registerForm.username.trim() !== "" &&
    registerForm.email.trim() !== "" &&
    registerForm.password.trim() !== "" &&
    registerForm.verificationCode.trim() !== ""
  );
});

const isEmailVerificationFormValid = computed(() => {
  return (
    emailVerificationForm.email.trim() !== "" &&
    emailVerificationForm.verificationCode.trim() !== ""
  );
});

const isPasswordResetFormValid = computed(() => {
  return (
    passwordResetForm.newPassword.trim() !== "" &&
    passwordResetForm.confirmPassword.trim() !== "" &&
    passwordResetForm.newPassword === passwordResetForm.confirmPassword
  );
});

const verifyCodeButtonText = computed(() => {
  return countdown.value > 0 ? `${countdown.value}秒后重新获取` : "获取验证码";
});

const createTextFloatAnimation = () => {
  if (!titleElement.value || !window.anime) return;

  // 清除之前的动画
  window.anime.remove(titleElement.value);

  // 获取标题文本
  const text = titleElement.value.innerText;

  // 使用Array.from正确处理Unicode字符（包括表情符号）
  const chars = Array.from(text).map((char, index) => {
    const span = document.createElement("span");
    span.innerText = char;
    span.style.display = "inline-block";
    span.style.transition = "all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)";
    span.style.cursor = "pointer";
    span.style.opacity = "0.9";
    span.style.fontWeight = "bold";
    return span;
  });

  titleElement.value.innerHTML = "";
  chars.forEach((char) => titleElement.value.appendChild(char));

  // 添加初始加载时的渐入动画
  window.anime
    .timeline({
      easing: "easeOutExpo",
      duration: 800,
    })
    .add({
      targets: chars,
      opacity: [0, 0.9],
      translateY: [20, 0],
      delay: window.anime.stagger(30),
    });

  // 添加呼吸效果
  window.anime({
    targets: titleElement.value,
    opacity: [0.9, 1],
    duration: 4000,
    easing: "easeInOutSine",
    direction: "alternate",
    loop: true,
  });

  // 鼠标移动时记录位置和方向
  let lastMouseX = 0;
  let mouseDirection = "right";

  // 为整个标题容器添加鼠标移动监听
  titleElement.value.addEventListener("mousemove", function (e) {
    const currentMouseX = e.clientX;
    if (currentMouseX > lastMouseX) {
      mouseDirection = "right";
    } else if (currentMouseX < lastMouseX) {
      mouseDirection = "left";
    }
    lastMouseX = currentMouseX;
  });

  // 为每个字符添加动画效果
  chars.forEach((charElement, index) => {
    charElement.addEventListener("mouseenter", function () {
      // 根据鼠标移动方向设置不同的效果
      const isMovingRight = mouseDirection === "right";
      const color = isMovingRight ? "#18a058" : "#000000";

      // 定义影响范围（中心字符 + 左右各2个字符 = 5个字符）
      const affectRange = 2;

      // 为影响范围内的所有字符应用效果（相同颜色，不同强度）
      for (let i = -affectRange; i <= affectRange; i++) {
        const targetIndex = index + i;
        if (targetIndex >= 0 && targetIndex < chars.length) {
          const distance = Math.abs(i);
          // 根据距离计算效果强度（中心最强，边缘最弱）
          const intensity = 1 - distance * 0.25;

          window.anime({
            targets: chars[targetIndex],
            translateY: -5 * intensity,
            opacity: 0.9 + 0.1 * intensity,
            color: color,
            duration: 300 + distance * 50,
            easing: "easeOutQuad",
          });
        }
      }
    });

    charElement.addEventListener("mouseleave", function () {
      // 定义影响范围
      const affectRange = 2;

      for (let i = -affectRange; i <= affectRange; i++) {
        const targetIndex = index + i;
        if (targetIndex >= 0 && targetIndex < chars.length) {
          const distance = Math.abs(i);

          window.anime({
            targets: chars[targetIndex],
            translateY: 0,
            scale: 1,
            opacity: 0.9,
            color: "",
            textShadow: "",
            duration: 400 + distance * 50,
            easing: "easeOutExpo",
          });
        }
      }
    });
  });
};

const loginRules = {
  email: [
    {
      required: true,
      message: "请输入电子邮箱",
    },
    {
      type: "email",
      message: "请输入正确的邮箱格式",
    },
  ],
  password: [
    {
      required: true,
      message: "请输入密码",
    },
    {
      min: 6,
      message: "密码至少6位",
    },
  ],
};

const registerRules = {
  username: [
    {
      required: true,
      message: "请输入用户名",
    },
    {
      min: 1,
      max: 12,
      message: "用户名长度必须在1到12位之间",
    },
  ],
  email: [
    {
      required: true,
      message: "请输入电子邮箱",
    },
    {
      type: "email",
      message: "请输入正确的邮箱格式",
    },
  ],
  password: [
    {
      required: true,
      message: "请输入密码",
    },
    {
      min: 6,
      max: 14,
      message: "密码长度必须在6到14位之间",
    },
  ],
  verificationCode: [
    {
      required: true,
      message: "请输入验证码",
    },
  ],
};

const emailVerificationRules = {
  email: [
    {
      required: true,
      message: "请输入电子邮箱",
    },
    {
      type: "email",
      message: "请输入正确的邮箱格式",
    },
  ],
  verificationCode: [
    {
      required: true,
      message: "请输入验证码",
    },
  ],
};

const passwordResetRules = {
  newPassword: [
    {
      required: true,
      message: "请输入新密码",
    },
    {
      min: 6,
      max: 14,
      message: "密码长度必须在6到14位之间",
    },
  ],
  confirmPassword: [
    {
      required: true,
      message: "请确认新密码",
    },
    {
      validator: (rule, value) => {
        return value === passwordResetForm.newPassword;
      },
      message: "两次输入的密码不一致",
    },
  ],
};

const handleLogin = async (e) => {
  e.preventDefault();
  loginFormRef.value?.validate(async (errors) => {
    if (!errors) {
      loginLoading.value = true;
      try {
        const encryptedData = await encrypt({
          email: loginForm.email,
          password: loginForm.password,
        });
        const res = await login(encryptedData);

        loginLoading.value = false;
        if (res.code === 201) {
          message.success("登录成功！🎉");
          configStore.setUserId(res.data.user.id);
          configStore.setName(res.data.user.username);
          configStore.setAvatar(res.data.user.avatar);
          localStorage.setItem("isLoggedIn", "true");

          router.push("/");
        } else {
          message.error(res.message || "登录失败，请检查账号密码是否正确");
        }
      } catch (err) {
        loginLoading.value = false;
        if (err.response && err.response.data && err.response.data.message) {
          message.error(err.response.data.message);
        } else {
          message.error(err.message || "登录失败，请检查账号密码是否正确");
        }
      }
    } else {
      if (errors.length > 0) {
        message.error(errors[0][0].message);
      } else {
        message.error("账号密码填写有误，请检查 🔍");
      }
    }
  });
};

const handleRegister = async (e) => {
  e.preventDefault();
  registerFormRef.value?.validate(async (errors) => {
    if (!errors) {
      registerLoading.value = true;
      try {
        const encryptedData = await encrypt({
          username: registerForm.username,
          email: registerForm.email,
          password: registerForm.password,
          verificationCode: registerForm.verificationCode,
        });

        const res = await register(encryptedData);

        registerLoading.value = false;
        if (res.code === 201) {
          loginForm.email = registerForm.email;
          loginForm.password = registerForm.password;
          registerForm.username = "";
          registerForm.email = "";
          registerForm.password = "";
          registerForm.verificationCode = "";
          activeTab.value = "login";
          message.success("注册成功！欢迎加入 Mirror 👏");
        } else {
          message.error(res.message || "注册失败，请稍后再试 😅");
        }
      } catch (err) {
        registerLoading.value = false;
        if (err.response && err.response.data && err.response.data.message) {
          message.error(err.response.data.message);
        } else {
          message.error(err.message || "注册失败，请稍后再试 😅");
        }
      }
    } else {
      if (errors.length > 0) {
        message.error(errors[0][0].message);
      } else {
        message.error("请检查表单填写是否正确 📝");
      }
    }
  });
};

let countdownTimer = null;
const getVerifyCode = async (e) => {
  e.preventDefault();
  if (!registerForm.email) {
    message.error("请填写电子邮箱 📧");
    return;
  }
  try {
    const res = await sendVerificationCode({
      email: registerForm.email,
      type: "register",
    });

    if (res.code === 200) {
      message.success("验证码发送成功！请查收 ✉️");
      countdown.value = 60;
      if (countdownTimer) {
        clearInterval(countdownTimer);
      }
      countdownTimer = setInterval(() => {
        countdown.value--;
        if (countdown.value <= 0) {
          clearInterval(countdownTimer);
          countdownTimer = null;
        }
      }, 1000);
    } else {
      message.error(res.message || "验证码发送失败，请稍后重试 🔄");
    }
  } catch (err) {
    if (err.response && err.response.data && err.response.data.message) {
      message.error(err.response.data.message);
    } else {
      message.error(err.message || "验证码发送失败，请稍后重试 🔄");
    }
  }
};

const getResetVerifyCode = async (e) => {
  e.preventDefault();
  if (!emailVerificationForm.email) {
    message.error("请填写电子邮箱 📧");
    return;
  }
  try {
    const res = await sendVerificationCode({
      email: emailVerificationForm.email,
      type: "reset",
    });

    if (res.code === 200) {
      message.success("验证码发送成功！请查收 ✉️");
      countdown.value = 60;
      if (countdownTimer) {
        clearInterval(countdownTimer);
      }
      countdownTimer = setInterval(() => {
        countdown.value--;
        if (countdown.value <= 0) {
          clearInterval(countdownTimer);
          countdownTimer = null;
        }
      }, 1000);
    } else {
      message.error(res.message || "验证码发送失败，请重试 🔄");
    }
  } catch (err) {
    if (err.response && err.response.data && err.response.data.message) {
      message.error(err.response.data.message);
    } else {
      message.error(err.message || "验证码发送失败，请重试 🔄");
    }
  }
};

const handleVerifyEmail = async (e) => {
  e.preventDefault();
  emailVerificationFormRef.value?.validate(async (errors) => {
    if (!errors) {
      resetLoading.value = true;
      try {
        const res = await verifyCode({
          email: emailVerificationForm.email,
          verificationCode: emailVerificationForm.verificationCode,
        });

        if (res.code === 200) {
          resetStep.value = 2;
          resetLoading.value = false;
        } else {
          message.error(res.message || "邮箱验证失败");
          resetLoading.value = false;
        }
      } catch (err) {
        resetLoading.value = false;
        if (err.response && err.response.data && err.response.data.message) {
          message.error(err.response.data.message);
        } else {
          message.error(err.message || "邮箱验证失败");
        }
      }
    } else {
      if (errors.length > 0) {
        message.error(errors[0][0].message);
      } else {
        message.error("请检查表单填写是否正确 📝");
      }
    }
  });
};

const handleResetPassword = async (e) => {
  e.preventDefault();
  passwordResetFormRef.value?.validate(async (errors) => {
    if (!errors) {
      resetLoading.value = true;
      try {
        const encryptedData = await encrypt({
          email: emailVerificationForm.email,
          password: passwordResetForm.newPassword,
        });

        const res = await resetPassword(encryptedData);

        resetLoading.value = false;
        if (res.code === 200) {
          message.success("密码重置成功！请登录 🔐");
          emailVerificationForm.email = "";
          emailVerificationForm.verificationCode = "";
          passwordResetForm.newPassword = "";
          passwordResetForm.confirmPassword = "";
          resetStep.value = 1;
          activeTab.value = "login";
        } else {
          message.error(res.message || "密码重置失败，请稍后再试 ⚠️");
        }
      } catch (err) {
        resetLoading.value = false;
        if (err.response && err.response.data && err.response.data.message) {
          message.error(err.response.data.message);
        } else {
          message.error(err.message || "密码重置失败，请稍后再试 ⚠️");
        }
      }
    } else {
      if (errors.length > 0) {
        message.error(errors[0][0].message);
      } else {
        message.error("请检查表单填写是否正确 📝");
      }
    }
  });
};

const backToLogin = () => {
  emailVerificationForm.email = "";
  emailVerificationForm.verificationCode = "";
  passwordResetForm.newPassword = "";
  passwordResetForm.confirmPassword = "";
  resetStep.value = 1;
  activeTab.value = "login";
};

onMounted(() => {
  createTextFloatAnimation();
});

watch(activeTab, () => {
  setTimeout(() => {
    createTextFloatAnimation();
  }, 50);
});
</script>

<style scoped lang="less">
.auth-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f5f6f7;
  position: relative;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image:
      radial-gradient(
        circle at 20% 30%,
        rgba(46, 213, 115, 0.4) 0%,
        rgba(10, 31, 15, 0) 50%
      ),
      radial-gradient(
        circle at 80% 70%,
        rgba(0, 184, 148, 0.4) 0%,
        rgba(10, 31, 15, 0) 50%
      ),
      radial-gradient(
        circle at 40% 80%,
        rgba(72, 219, 151, 0.3) 0%,
        rgba(10, 31, 15, 0) 50%
      );
    animation: floatingParticles 20s ease-in-out infinite;
  }

  @keyframes floatingParticles {
    0%,
    100% {
      transform: translate(0, 0) scale(1);
      opacity: 0.8;
    }
    25% {
      transform: translate(-10px, -5px) scale(1.05);
      opacity: 0.9;
    }
    50% {
      transform: translate(5px, -10px) scale(1);
      opacity: 1;
    }
    75% {
      transform: translate(10px, 5px) scale(1.02);
      opacity: 0.9;
    }
  }

  .logo {
    position: absolute;
    top: 1.25rem;
    left: 1.25rem;
    width: 3rem;
    height: 3rem;
    z-index: 10;
    user-select: none;

    img {
      width: 100%;
      height: 100%;
    }
  }

  .auth-card {
    width: 28rem;
    padding: 4rem 2.5rem 2.5rem 2.5rem;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(20px);
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    animation: cardFloat 6s ease-in-out infinite;
    position: relative;
    z-index: 5;

    @keyframes cardFloat {
      0%,
      100% {
        transform: translateY(0);
      }
      50% {
        transform: translateY(-5px);
      }
    }

    &:hover {
      transform: translateY(-5px) scale(1.01);
      box-shadow:
        0 15px 45px rgba(0, 0, 0, 0.1),
        inset 0 1px 0 rgba(255, 255, 255, 0.2);
    }

    .title {
      text-align: center;
      margin-bottom: 2.5rem;
      user-select: none;
    }

    :deep(.n-form-item) {
      margin-bottom: 1.5rem;

      // 隐藏表单错误提示信息
      .n-form-item-feedback-wrapper {
        display: none !important;
      }

      // 隐藏必填红点
      .n-form-item-label .n-form-item-label__asterisk {
        display: none !important;
      }

      .n-form-item-label__text {
        color: #4a5568;
        font-size: 0.9rem;
        letter-spacing: 0.025em;
      }
    }

    :deep(.n-button) {
      height: 3.2rem;
      border-radius: 10px;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      position: relative;
      overflow: hidden;
      transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }

    .input-group {
      border: 2px solid rgba(226, 232, 240, 0.8);
      border-radius: 20px;
      padding: 1.5rem;
      margin-bottom: 1.5rem;
      background: rgba(248, 250, 252, 0.8);
      backdrop-filter: blur(10px);
      user-select: none;
      transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      position: relative;
      overflow: hidden;

      &:hover {
        background: rgba(248, 250, 252, 0.8);
      }

      :deep(.n-form-item) {
        margin-bottom: 1.5rem;

        .n-form-item-label__text {
          font-size: 0.95rem;
          color: #4a5568;
          font-weight: 600;
        }

        // 隐藏表单错误提示信息
        .n-form-item-feedback-wrapper {
          display: none !important;
        }

        // 隐藏必填红点
        .n-form-item-label .n-form-item-label__asterisk {
          display: none !important;
        }
      }

      .forget-password {
        height: 2.2rem;
        display: flex;
        align-items: flex-end;
        justify-content: flex-end;

        .n-button {
          font-size: 0.9rem;
          height: auto;
          padding: 0.3rem 0.8rem;
          background: none;
        }
      }
    }

    .auth-footer {
      text-align: center;
      padding-top: 2rem;
      border-top: 1px solid rgba(226, 232, 240, 0.5);
      position: relative;

      span {
        color: #718096;
        margin-right: 8px;
        font-weight: 500;
      }
    }
  }
}
</style>
