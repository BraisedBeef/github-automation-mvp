<template>
  <div class="swiper-wrap">
    <div class="swiper">
      <!-- 轮播图 -->
      <div
        v-if="swiperList[0]"
        ref="self_swiper"
        class="swiper-ul"
        :style="{ transform: `translateX(${translateX}px)` }"
      >
        <div
          v-for="(item, index) in swiperList"
          :key="item.value"
          class="swiper-item"
          :class="{ active: currentSwiper === index }"
        >
          {{ item.label }}
        </div>
      </div>
      <!-- 空 -->
      <div v-else class="swiper-empty">空空如也</div>

      <!-- 上一张(按钮点击) -->
      <div class="pre-btn btn" @click="handlePre">pre</div>
      <!-- 下一张(按钮点击) -->
      <div class="next-btn btn" @click="handleNext">next</div>
    </div>
    <!-- 上一张虚幻图 -->
    <Transition name="left">
      <div
        v-show="shadowShow"
        class="pre-swiper shadow-swiper swiper-item"
        :style="{
          width: swiperInfo.w + 'px',
          height: swiperInfo.h + 'px',
          top: swiperInfo.top + 'px',
          left: swiperInfo.left - swiperInfo.w + 'px',
        }"
      >
        {{ preSwiperShadow()?.label }}
      </div>
    </Transition>
    <!-- 下一张虚幻图 -->
    <Transition name="right">
      <div
        v-show="shadowShow"
        class="next-swiper shadow-swiper swiper-item"
        :style="{
          width: swiperInfo.w + 'px',
          height: swiperInfo.h + 'px',
          top: swiperInfo.top + 'px',
          left: swiperInfo.left + swiperInfo.w + 'px',
        }"
      >
        {{ nextSwiperShadow()?.label }}
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
// 自己导入节流函数
const _throttle = (func: Function, wait = 800) => {
  let previous = 0 // 初始的时间点，也是关键的时间点
  return (...args: any[]) => {
    const now = +new Date()
    if (now - previous > wait) {
      func.apply(this, args)
      previous = now
    }
  }
}
const props = withDefaults(
  defineProps<{
    swiperList?: { [x: string]: number | string }[]
    interval?: number
    active?: number
    autoPlay?: boolean
  }>(),
  {
    swiperList: () => [
      { label: '1', value: 1 },
      { label: '2', value: 2 },
      { label: '3', value: 3 },
      { label: '4', value: 4 },
      { label: '5', value: 5 },
    ],
    interval: 500, // 每次切换的间隙 默认500毫秒
    active: 0, // 设置默认活跃项
    autoPlay: true, // 自动轮播
  },
)
const emit = defineEmits<{
  (event: 'update:active', active: number): void
}>()

const currentSwiper = ref(0) // 记录当前活跃项
const translateX = ref<number>(0) // 移动的距离
const self_swiper = ref() // swiper平移元素的实例
const swiperListLen = computed(() => props.swiperList.length) // 传入的列表长度
const swiperInfo = ref({
  w: 0,
  h: 0,
  left: -9999,
  top: -9999,
}) // 获取轮播图的信息
const shadowShow = ref(true) // 触发Transition的变量
const swiperTimer = ref<any>(null) // 自动轮播的定时器变量

// 计算移动距离
const setTranslateX = (noAnimate?: boolean, current?: number) => {
  const el = animationDom()
  if (noAnimate) {
    el.style.transition = 'none'
  } else {
    el.style.transition = 'transform 0.25s'
  }
  if (typeof current === 'number' && current + '') {
    translateX.value = current * swiperInfo.value.w
  } else {
    translateX.value = 0 - currentSwiper.value * swiperInfo.value.w
  }
}

// 获取进行平移的元素
const animationDom = () => {
  return self_swiper.value
}

// 移除头部或者尾部元素
const removeChild = (isLast?: boolean /*是末尾还是头部*/) => {
  const el = animationDom()
  const child = el.children[isLast ? el.children.length - 1 : 0]
  el.removeChild(child)
}
// 往末尾增添一个元素
const addLast = () => {
  const el = animationDom()
  const children = el.querySelectorAll('.swiper-item')
  const cloneChild = children![0].cloneNode(true) // 克隆最后一个元素
  el.append(cloneChild)
}
// 往头部添加一个元素
const addFirst = () => {
  const el = animationDom()
  const children = el.querySelectorAll('.swiper-item')
  const cloneChild = children![children.length - 1].cloneNode(true) // 克隆第一个元素
  el.prepend(cloneChild)
}
// 下一张
const handleNext = _throttle(() => {
  if (currentSwiper.value === swiperListLen.value - 1 /*边界点*/) {
    addLast() // 往后面增添一个元素
    currentSwiper.value += 1 // 移动到最后一个copy元素上
    setTranslateX() // 触发动画
    setTimeout(() => {
      currentSwiper.value = 0 // 悄悄地移到第一个上
      setTranslateX(true)
      removeChild(true) // 移除最后一个元素
    }, props.interval)
  } else {
    currentSwiper.value += 1
    setTranslateX()
  }
}, props.interval)
// 上一张
const handlePre = _throttle(() => {
  if (currentSwiper.value === 0 /*边界点*/) {
    addFirst() // 头部添加一个元素
    currentSwiper.value -= 1
    setTranslateX() // 触发动画
    setTimeout(() => {
      const el = animationDom()
      currentSwiper.value = swiperListLen.value - 1 // 悄悄地移到最后一个元素
      setTranslateX(true)
      removeChild() // 移除最后一个元素
    }, props.interval)
  } else {
    currentSwiper.value -= 1
    setTranslateX()
  }
}, props.interval)

// 自动播放
const doAutoPlay = () => {}

// pre-shadow显示内容
const preSwiperShadow = () => {
  if (currentSwiper.value === 0) {
    return props.swiperList[props.swiperList.length - 1]
  } else {
    return props.swiperList[currentSwiper.value - 1]
  }
}
// next-shadow显示
const nextSwiperShadow = () => {
  if (currentSwiper.value === props.swiperList.length - 1) {
    return props.swiperList[0]
  } else {
    return props.swiperList[currentSwiper.value + 1]
  }
}

// shadow图片触发transition
const shadowShowChange = () => {
  shadowShow.value = false
  setTimeout(() => {
    shadowShow.value = true
  }, props.interval)
}

// 获取元素距左距上距离
const _getElClient2 = (el: any) => {
  return {
    top: el.getBoundingClientRect().top,
    left: el.getBoundingClientRect().left,
  }
}
// 设置轮播图的宽高和位置
const setSwiperInfo = () => {
  if (self_swiper.value) {
    const { top, left } = _getElClient2(self_swiper.value)
    swiperInfo.value = {
      left,
      top,
      w: self_swiper.value.offsetWidth,
      h: self_swiper.value.offsetHeight,
    }
  }
}

onMounted(() => {
  setSwiperInfo()
  window.addEventListener('resize', setSwiperInfo)
})

onUnmounted(() => {
  clearInterval(swiperTimer.value)
  window.removeEventListener('resize', setSwiperInfo)
})

watch(
  () => currentSwiper.value,
  () => {
    shadowShowChange()
  },
)

watch(
  () => props.active,
  (active: number) => {
    currentSwiper.value = active
  },
  { immediate: true },
)

watch(
  () => props.autoPlay,
  (auto: boolean) => {
    if (auto) {
      doAutoPlay()
    }
  },
  { immediate: true },
)
</script>

<style scoped lang="scss">
@mixin flex {
  display: flex;
  align-items: center;
  justify-content: center;
}

.swiper {
  position: relative;
  z-index: 2;
  width: 300px;
  height: 200px;
  margin: 0 auto;
  overflow: hidden;
  box-shadow: 0 0 4px #aaa;

  .swiper-ul {
    display: flex;
    height: 100%;
    transition: transform 0.25s;

    .swiper-item {
      position: static;
      z-index: inherit;
    }
  }

  .swiper-empty {
    position: absolute;
    inset: 0;
    z-index: 2;
    font-size: 16px;
    font-weight: bold;
    color: #333;

    @include flex;
  }

  .btn {
    position: absolute;
    top: 50%;
    width: 30px;
    height: 30px;
    font-size: 12px;
    cursor: pointer;
    user-select: none;
    background-color: rgb(0 0 0 / 50%);
    border-radius: 50%;
    transform: translateY(-50%);

    @include flex;

    &:active {
      color: #fff;
    }

    &.pre-btn {
      left: 12px;
    }

    &.next-btn {
      right: 12px;
    }
  }
}

.shadow-swiper {
  position: fixed;
  z-index: -1;
  cursor: pointer;

  &.pre-swiper {
    box-shadow: 0 0 4px #000 inset;
  }

  &.next-swiper {
    box-shadow: 0 0 4px #000 inset;
  }
}

.swiper-item {
  flex-shrink: 0;
  width: 100%;
  height: 100%;
  font-size: 20px;
  line-height: 200px;
  text-align: center;
  transition: transform 0.25s;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

// 元素开始进入的状态 | 元素离开结束的状态
.left-enter-from,
.left-leave-to {
  transform: rotateZ(30deg);
  transform-origin: top right;
}

// 元素进入结束的状态 ｜ 元素开始离开的状态。 这里不写也可以！！！！！！
.left-enter-to,
.left-leave-from {
  transform: rotateZ(0deg);
  transform-origin: top right;
}

// 元素进入 ｜ 结束时，过渡的效果
.left-enter-active,
.left-leave-active {
  // 过渡动画的使用
  transition: all 0.25s ease-in;
}

// 元素开始进入的状态 | 元素离开结束的状态
.right-enter-from,
.right-leave-to {
  transform: rotateZ(30deg);
  transform-origin: left bottom;
}

// 元素进入结束的状态 ｜ 元素开始离开的状态。 这里不写也可以！！！！！！
.right-enter-to,
.right-leave-from {
  transform: rotateZ(0deg);
  transform-origin: left bottom;
}

// 元素进入 ｜ 结束时，过渡的效果
.right-enter-active,
.right-leave-active {
  // 过渡动画的使用
  transition: all 0.25s ease-in;
}
</style>
