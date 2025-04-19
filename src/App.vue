<template>
	<n-config-provider :theme="theme">
		<div class="main">
			<Header/>
			<Chat/>
		</div>
	</n-config-provider>
</template>

<script setup>
import { ref } from 'vue'
import { darkTheme } from 'naive-ui'
import { NConfigProvider } from 'naive-ui'
import Header from './components/header.vue';
import Chat from './components/chat.vue';

const theme = ref(darkTheme)

</script>

<style lang="less" scoped>
.main{
	width: 100%;
	height: 100vh;
	display: flex;
	flex-direction: column;
}
</style>
