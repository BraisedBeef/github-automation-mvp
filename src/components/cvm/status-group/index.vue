<template>
  <div v-for="(item, index) in list" :key="index" class="status-wrap">
    <div v-if="value === item.value" class="df ac">
      <div
        v-if="dot"
        class="dot"
        :style="{
          background: item.color,
        }"
      />
      <span>{{ item.text }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
interface StatusType {
  text: string
  color: string
  value: string | number
}

interface PropType {
  list: StatusType[]
  value?: string | number
  dot?: boolean
}

const props = withDefaults(defineProps<PropType>(), {
  list: () => [],
  value: '',
  dot: true,
})
</script>

<style lang="scss" scoped>
.status-wrap {
  .dot {
    width: 6px;
    height: 6px;
    margin-right: 4px;
    border-radius: 50%;
  }
}
</style>
