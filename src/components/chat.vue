<template>
  <div class="chat">
    <div class="content">
      <div class="record">
        <messageList></messageList>
      </div>
      <div class="input">
        <n-input
          placeholder="有什么我能帮您的吗?"
          type="textarea"
          size="tiny"
          :value="inputValue"
          :autosize="{
            minRows: 4,
            maxRows: 4,
          }"
          @input="handleInput"
          class="textarea"
        />
        <div class="tool">
          <n-button text style="font-size: 24px">
            <div class="upload"></div>
          </n-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { NInput } from 'naive-ui';
import messageList from './messageList.vue';

const inputValue = ref('');
const handleInput = (value) => {
  inputValue.value = value;
}

</script>

<style lang="less" scoped>
.chat{
  width:100vw;
  height:100%;
  margin-top: 54px;
  display:flex;
  justify-content: center;
  background: #2b2b31 no-repeat center;
  .content{
    width: 70vw;
    height: 100vh;
    display:flex;
    flex-direction: column;
    .record{
      height: 70vh;
      margin-bottom: 50px;
    }
    .input{
      display: flex;
      flex-direction: column;
      .textarea{
        font-size: 20px;
      }
      .tool{
        height: 60px;
        padding: 10px 0;
        display: flex;
        flex-direction: row-reverse;
        .upload{
          width: 48px;
          height: 48px;
          background: url('@/assets/upload.png') no-repeat center;
        }
      }
    }
  }
}
</style>