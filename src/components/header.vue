<template>
  <div class="header">
    <div class="info">
      <div class="logo"></div>
      <div class="title">Mirror-Chat</div>
    </div>
    <n-avatar
      round
      :src="imgUrl"
      class="avatar"
    />
  </div>
</template>

<script setup>
import { NAvatar } from 'naive-ui';
import imgUrl from '../assets/avatar.jpg';
</script>

<style lang="less" scoped>
.header { 
  width: 100vw;
  height: 54px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: fixed;
  top: 0;
  background: #2b2b31 no-repeat center;
  .info{
    display: flex;
    align-items: center;
    .logo{
      width: 48px;
      height: 48px;
      margin: 0 16px;
      background: url('@/assets/logo.svg') no-repeat center;
    }
    .title{
      width: 152px;
      height: 32px;
      font-size: 22px;
      font-weight: 800;
      color: #fff;
    }
  }
  .avatar{
    width: 40px;
    height: 40px;
    margin: 0 16px;
  }
}
</style>