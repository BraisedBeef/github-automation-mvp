<template>
  <div class="practice">
    <div class="box" :style="{ width: 50 * LINE + 'px' }">
      <div v-for="row in Math.ceil(seats.length / LINE)" :key="row" class="row">
        <div v-for="s in LINE" :key="s" class="seat">
          {{ (row - 1) * 10 + s }}
          {{ seats[(row - 1) * 10 + s - 1].isVip ? 'vip' : '' }}
          {{ seats[(row - 1) * 10 + s - 1].isSubVip ? 'sub' : '' }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const seats = ref<any>([])

const LINE = 10 // 一排10个
const COLUMN = 10 // 排数

const VIP = [34, 35, 36, 37, 44, 45, 46, 47, 54, 55, 56, 57, 64, 65, 66, 67]
const SUB_VIP = [33, 38, 43, 48, 53, 58, 63, 68]
const HIDE = [11, 21, 31, 41, 51, 20, 30, 40, 50]

for (let i = 0; i < LINE * COLUMN; i++) {
  seats.value.push({
    id: i,
    isVip: VIP.includes(i + 1),
    isSubVip: SUB_VIP.includes(i + 1),
    isHide: HIDE.includes(i + 1),
  })
}
</script>

<style scoped lang="scss">
.box {
  width: auto;
  margin: 200px auto;

  .row {
    display: flex;

    .seat {
      width: 50px;
      height: 50px;
      border: 1px solid red;
    }
  }
}
</style>
