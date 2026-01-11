<template>
  <div class="profile-container">
    <div class="profile-header">
      <n-icon
        class="back-icon"
        :component="ArrowLeft"
        @click="goBack"
        size="1.5rem"
      />
      <h1>个人资料</h1>
    </div>

    <div class="profile-content">
      <div class="avatar-section">
        <n-upload
          ref="uploadRef"
          :action="uploadUrl"
          :headers="uploadHeaders"
          :show-file-list="false"
          @finish="handleUploadFinish"
        >
          <div class="avatar-wrapper">
            <n-avatar
              round
              :src="configStore.avatar"
              class="user-avatar"
              :size="128"
            >
              <span
                v-if="!configStore.avatar"
                style="
                  user-select: none;
                  -webkit-user-select: none;
                  font-weight: bold;
                "
                >{{ Global.getInitials(configStore.name) }}</span
              >
            </n-avatar>
            <div class="camera-icon">
              <n-icon :component="Plus" size="1.5rem" />
            </div>
          </div>
        </n-upload>
      </div>

      <div class="form-section">
        <div class="form-item">
          <label>昵称</label>
          <n-input
            v-model:value="profileData.name"
            size="large"
            placeholder="请输入昵称"
          />
        </div>
      </div>

      <div class="form-actions">
        <n-button type="primary" @click="saveProfile" :loading="saving" block>
          完成
        </n-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from "vue";
import { useConfigStore } from "@/stores/configStore";
import { useRouter } from "vue-router";
import { useMessage, NIcon, NAvatar, NButton, NInput, NUpload } from "naive-ui";
import { ArrowLeft, Plus } from "@vicons/tabler";
import { uploadAvatar, updateInfo } from "@/services/user";
import Global from "@/utils/global";
import api from "@/config/api";

const configStore = useConfigStore();
const router = useRouter();
const message = useMessage();
const uploadRef = ref(null);
const saving = ref(false);

const uploadUrl = api.uploadAvatar;
const uploadHeaders = {
  Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
};

const profileData = reactive({
  name: configStore.name || "",
});

const goBack = () => {
  router.back();
};

const handleUploadFinish = ({ file, event }) => {
  try {
    const res = JSON.parse(event.target.response);
    if (res.code === 201) {
      configStore.setAvatar(res.data.avatarUrl);
      message.success("上传成功！");
    } else {
      message.error(res.message || "上传失败，请稍后再试 ⬆️");
    }
  } catch (error) {
    message.error("上传失败，请稍后再试 ⬆️");
  }
  return file;
};

const saveProfile = async () => {
  saving.value = true;
  try {
    const res = await updateInfo({
      username: profileData.name,
    });
    if (res.code === 200) {
      configStore.setName(profileData.name);
      router.push("/setting");
    } else {
      message.error(res.message || "更新失败，请稍后再试");
    }
  } catch (error) {
    message.error("更新失败，请稍后再试");
  } finally {
    saving.value = false;
  }
};
</script>

<style lang="less" scoped>
.profile-container {
  min-height: 100vh;
  background-color: var(--background-color);
  padding: 1.25rem;
  box-sizing: border-box;
  position: relative;

  .profile-header {
    height: 4rem;
    margin-bottom: 1.5rem;
    position: relative;
    text-align: center;

    .back-icon {
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      cursor: pointer;
      color: var(--text-color);
      transition: all 0.3s ease;
      border-radius: 0.625rem;
      padding: 0.5rem;

      &:hover {
        background-color: rgba(0, 0, 0, 0.1);
      }
    }

    h1 {
      color: var(--text-color);
      font-size: 1.5rem;
      margin: 0;
    }
  }

  .profile-content {
    max-width: 800px;
    margin: 0 auto;

    .avatar-section {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      margin-bottom: 5rem;

      :deep(.n-upload) {
        width: auto;
      }

      .avatar-wrapper {
        position: relative;
        cursor: pointer;

        .user-avatar {
          width: 8rem;
          height: 8rem;
        }

        .camera-icon {
          position: absolute;
          bottom: 0;
          right: 0;
          background-color: var(--text-color);
          border-radius: 50%;
          width: 2rem;
          height: 2rem;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }
      }

      .avatar-tip {
        margin-top: 0.5rem;
        color: var(--text-color-light);
        font-size: 0.875rem;
      }
    }

    .form-section {
      border-radius: 0.625rem;
      padding: 1.25rem;
      margin-bottom: 1.25rem;
      display: flex;
      flex-direction: column;
      align-items: center;

      .form-item {
        margin-bottom: 1.25rem;
        width: 25rem;

        &:last-child {
          margin-bottom: 0;
        }

        label {
          display: block;
          margin-bottom: 0.5rem;
          color: var(--text-color);
          font-size: 1rem;
          font-weight: 500;
        }

        .n-input {
          width: 100%;
          height: 2.8rem;
          border-radius: 0.5rem;
          font-size: 1rem;
        }
      }
    }

    .form-actions {
      display: flex;
      justify-content: center;

      .n-button {
        height: 3.5rem;
        font-size: 1.1rem;
        width: 25rem;
        border-radius: 0.75rem;
      }
    }
  }
}
</style>
