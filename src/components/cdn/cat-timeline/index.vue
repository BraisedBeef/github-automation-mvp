<template>
  <div class="timeline df">
    <div class="timeline-icon">
      <div
        class="icon"
        :style="{
          borderColor:
            parent.props.modelValue === 2 && props.index === 2 && parent.props.status === 'success'
              ? 'var(--el-color-success)'
              : parent.props.modelValue === 2 && props.index === 2 && parent.props.status === 'error'
                ? 'var(--el-color-error)'
                : parent.props.modelValue >= props.index
                  ? 'var(--el-color-primary)'
                  : '#DCDCDC',
        }"
      />
      <div class="line">
        <div class="line1" :style="{ height: parent.props.modelValue > props.index ? '100%' : '0%' }" />
      </div>
    </div>
    <div class="content">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  index: number
}>()

const parent = getCurrentInstance()?.parent as any

// const status = parent.props.status

const colorList = ['#DCDCDC', 'var(--el-color-primary)', '']
</script>

<style lang="scss" scoped>
.timeline {
  margin-bottom: 18px;
  font-size: 12px;

  .timeline-icon {
    margin-right: 10px;

    .icon {
      width: 10px;
      height: 10px;
      background-color: #fff;
      border-style: solid;
      border-width: 2px;
      border-radius: 100%;
    }

    .line {
      width: 2px;
      height: 100%;
      margin-top: 4px;
      margin-left: 4px;
      background-color: #dcdcdc;

      .line1 {
        width: 100%;
        background-color: var(--el-color-primary);
        transition: all 0.2s;
      }
    }
  }

  .content {
    transform: translateY(-4px);

    :deep(div) {
      line-height: 1.5;
    }
  }
}

.timeline:last-of-type {
  .line {
    background-color: transparent;

    .line1 {
      background-color: transparent;
    }
  }
}
</style>
