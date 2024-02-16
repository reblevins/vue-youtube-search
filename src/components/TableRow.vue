<template>
<tr>
  <td><img :src="thumbnail" /></td>
  <td><a :href="`https://www.youtube.com/watch?v=${videoId}`" target="_blank">{{ title }}</a></td>
  <td>{{ description }}</td>
  <td>{{ comments || "Comments disabled" }}</td>
</tr>
</template>

<script setup>
import { defineProps } from 'vue'

defineProps({
  thumbnail: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  videoId: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  comments: {
    type: Number || undefined,
  },
})
</script>

<style lang="scss" scoped>

</style>