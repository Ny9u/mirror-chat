<template>
  <div class="auth-container">
    <div class="logo">
      <img src="@/assets/logo_dark.svg" alt="Mirror Logo" />
    </div>
    <div class="auth-card">
      <div class="title">
        <h1>{{ activeTab === "login" ? "登录到Mirror" : "注册Mirror" }}</h1>
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
            <n-form-item path="password" label="密码">
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
          </div>
          <n-form-item>
            <n-button
              type="primary"
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
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from "vue";
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
import { login, register, sendVerificationCode } from "@/services/user";
import { useConfigStore } from "@/stores/configStore";
import { encrypt } from "@/utils/encryption";

const route = useRoute();
const router = useRouter();
const message = useMessage();
const configStore = useConfigStore();
const loginFormRef = ref(null);
const registerFormRef = ref(null);
const activeTab = ref(route.query.action === "register" ? "register" : "login");

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

const loginLoading = ref(false);
const registerLoading = ref(false);
const countdown = ref(0);

//检查登录表单是否完整填写
const isLoginFormValid = computed(() => {
  return loginForm.email.trim() !== "" && loginForm.password.trim() !== "";
});

//检查注册表单是否完整填写
const isRegisterFormValid = computed(() => {
  return (
    registerForm.username.trim() !== "" &&
    registerForm.email.trim() !== "" &&
    registerForm.password.trim() !== "" &&
    registerForm.verificationCode.trim() !== ""
  );
});

const verifyCodeButtonText = computed(() => {
  return countdown.value > 0 ? `${countdown.value}秒后重新获取` : "获取验证码";
});

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
          message.success("登录成功");
          configStore.setUserId(res.data.user.id);
          configStore.setName(res.data.user.username);
          configStore.setAvatar(res.data.user.avatar);
          if (res.data && res.data.token) {
            localStorage.setItem("jwtToken", res.data.token);
            localStorage.setItem("refreshToken", res.data.refreshToken);
            localStorage.setItem("isLoggedIn", "true");
            sessionStorage.setItem("skipValidation", "true");
          }
          router.push("/");
        } else {
          message.error(res.message || "登录失败");
        }
      } catch (err) {
        loginLoading.value = false;
        if (err.response && err.response.data && err.response.data.message) {
          message.error(err.response.data.message);
        } else {
          message.error(err.message || "登录失败");
        }
      }
    } else {
      if (errors.length > 0) {
        message.error(errors[0][0].message);
      } else {
        message.error("请检查密码填写是否正确");
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
          message.success("注册成功，请登录");
        } else {
          message.error(res.message || "注册失败");
        }
      } catch (err) {
        registerLoading.value = false;
        if (err.response && err.response.data && err.response.data.message) {
          message.error(err.response.data.message);
        } else {
          message.error(err.message || "注册失败");
        }
      }
    } else {
      if (errors.length > 0) {
        message.error(errors[0][0].message);
      } else {
        message.error("请检查表单填写是否正确");
      }
    }
  });
};

let countdownTimer = null;
const getVerifyCode = async (e) => {
  e.preventDefault();
  if (!registerForm.email) {
    message.error("请输入电子邮箱");
    return;
  }
  try {
    const res = await sendVerificationCode({
      email: registerForm.email,
    });

    if (res.code === 200) {
      message.success("验证码发送成功");
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
      message.error(res.message || "验证码发送失败");
    }
  } catch (err) {
    if (err.response && err.response.data && err.response.data.message) {
      message.error(err.response.data.message);
    } else {
      message.error(err.message || "验证码发送失败");
    }
  }
};
</script>

<style scoped lang="less">
.auth-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f5f6f7;
  position: relative;

  .logo {
    position: absolute;
    top: 1.25rem;
    left: 1.25rem;
    width: 3rem;
    height: 3rem;

    img {
      width: 100%;
      height: 100%;
    }
  }

  .auth-card {
    width: 28rem;
    padding: 4rem 2.5rem 2.5rem 2.5rem;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);

    .title {
      text-align: center;
      margin-bottom: 1.875rem;
    }

    :deep(.n-form-item) {
      margin-bottom: 1.25rem;

      // 隐藏表单错误提示信息
      .n-form-item-feedback-wrapper {
        display: none !important;
      }

      // 隐藏必填红点
      .n-form-item-label .n-form-item-label__asterisk {
        display: none !important;
      }
    }

    :deep(.n-button) {
      height: 3rem;
      border-radius: 0.5rem;
    }

    .input-group {
      border: 1px solid #e0e0e0;
      border-radius: 0.625rem;
      padding: 1.25rem;
      margin-bottom: 1.25rem;

      :deep(.n-form-item) {
        margin-bottom: 1.25rem;

        .n-form-item-label__text {
          font-size: 1rem;
        }

        // 隐藏表单错误提示信息
        .n-form-item-feedback-wrapper {
          display: none !important;
        }

        // 隐藏必填红点
        .n-form-item-label .n-form-item-label__asterisk {
          display: none !important;
        }

        &:last-child {
          margin-bottom: 0;
        }
      }
    }

    .auth-footer {
      text-align: center;
      margin-top: 20px;
      padding-top: 20px;
      border-top: 1px solid #eee;

      span {
        color: #666;
        margin-right: 5px;
      }
    }
  }
}
</style>
