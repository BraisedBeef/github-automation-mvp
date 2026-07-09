<template>
  <Transition name="slide-fade">
    <div v-show="tempStore.prodSlider" class="cat-productions" @mouseleave="prodLeave" @mouseenter="prodEnter">
      <div class="left">
        <el-menu
          id="prod-menu"
          :default-active="prodSelectKey"
          :collapse-transition="false"
          popper-effect="light"
          unique-opened
          @click.stop
        >
          <el-menu-item index="All">
            <SvgIcon name="menu-service-cdn" class="menu-icon" pointer />
            <template #title>
              <span class="menu-title">
                <div>{{ t('model.product') }}</div>
              </span>
            </template>
          </el-menu-item>
        </el-menu>
      </div>
      <div class="right">
        <!-- 全部云产品 -->
        <div class="all-productions" @click.stop>
          <!-- <div class="header">
            <SvgIcon name="dialog-close" pointer @click.stop="prodLeave"></SvgIcon>
          </div> -->
          <div class="content">
            <div v-if="baseStore.accessHistory[userId()]" class="lately">
              <div class="lately-title">
                {{ t('model.latelyProduct') }}
              </div>
              <ul class="lately-list">
                <div
                  v-for="(item, index) in baseStore.accessHistory[userId()]"
                  :key="index"
                  class="lately-item"
                  :title="getRouteModel(item.path)?.title"
                  @click="latelyClick(item)"
                >
                  {{ getRouteModel(item.path)?.title }}
                </div>
              </ul>
            </div>
            <div class="list">
              <div
                v-for="(item, index) in products"
                :key="index"
                class="list-wrap"
                :style="{ 'grid-row-end': `span ${item.children?.length || '0'}` }"
              >
                <div class="list-title df ac">
                  <SvgIcon
                    v-if="item.meta?.leftIcon"
                    :name="item.meta?.leftIcon"
                    class="mr8"
                    style="width: 20px; height: 20px"
                  />
                  <span :title="item.meta?.title">{{ item.meta?.title }}</span>
                </div>
                <div
                  v-for="(citem, cindex) in item.children"
                  :key="cindex"
                  class="list-items"
                  @click.stop="modelChange(citem)"
                >
                  <div v-if="citem.meta?.title" class="list-item">
                    <span :class="citem.meta?.rightIcon ? 'list-item_icon_span' : ''" :title="citem.meta?.title">{{
                      citem.meta?.title
                    }}</span>
                    <SvgIcon
                      v-if="citem.meta?.rightIcon"
                      :name="citem.meta?.rightIcon"
                      class="ml8"
                      style="width: 14px; height: 14px"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- 后续可能会添加其它 -->
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import t from '@/utils/i18n'
import { modelRoutes, getRouteModel } from '@/router/map'
import { useBaseStore, useTempStore, useUserStore } from '@/store'
import { userId } from '@/store/user'
import { _deepClone } from '@/utils/collection-utils'
import { pushRoute } from '@/utils/router-jump'

/**
 * 同时设置 meta.notNav = false && meta.notMenu = true 仅显示在导航栏，但不会显示在菜单栏
 * // TIPS 注意：与 单独设置notMenu 不兼容，待优化
 */
const getOnlineProduct = (_routes: any[]) => {
  const routes = _deepClone(_routes)
  const filterRoutes = routes.filter(item => {
    if (item.children && !item.meta?.notNav) {
      item.children = getOnlineProduct(item.children)
      if (item.children.length === 0) {
        delete item.children
      }
      return item
    } else {
      return (
        (item.meta?.notNav === false && item.meta?.notMenu === true) ||
        (item.meta?.notNav === undefined && !item.meta?.notMenu)
      )
    }
  })
  return filterRoutes
}
const products = getOnlineProduct(modelRoutes)

const prodSelectKey = 'All'

const baseStore = useBaseStore()
const tempStore = useTempStore()
const userStore = useUserStore()
const router = useRouter()

//最近
const latelyClick = item => {
  const route = getRouteModel(item.path).routes[0]
  console.log(route)

  prodLeave()
  pushRoute(route.path)
}
// 列表
const modelChange = route => {
  const nextPath = route.redirect || route.path || route.children[0].path // 有重定向 跳转重定向
  prodLeave()
  pushRoute(nextPath)
}

const prodEnter = () => {
  tempStore.setProdSlider(true)
}

const prodLeave = () => {
  useTempStore().setProdSlider(false)
}

const bodHideProd = () => {
  tempStore.setProdSlider(false)
}

onMounted(() => {
  document.body.addEventListener('click', bodHideProd)
})

onUnmounted(() => {
  document.body.removeEventListener('click', bodHideProd)
})
</script>

<style scoped lang="scss">
$menu-collapsed-h: 54px; // 收缩按钮的高度
$grid-columns: 3;

.cat-productions {
  position: fixed;
  top: var(--header-h);
  left: 0;
  z-index: 9999;

  // transition: all 0.2s;
  display: flex;

  // background-color: rgba(0, 0, 0, 0.5); // 蒙版
  // width: 100vw;
  height: 100vh;
  box-shadow: 0 0 5px 0 rgb(165 196 239 / 52%);

  .left {
    flex-shrink: 0;
    width: var(--menu-w);
    background-color: #fff;

    .menu-icon {
      position: absolute;
      top: 50%;
      width: var(--menu-icon-size);
      height: var(--menu-icon-size);
      transform: translateY(-50%);
    }

    .menu-title {
      position: absolute;
      top: 50%;
      width: var(--menu-title-w);
      height: var(--menu-item-h);
      font-family: 'PingFang SC-Regular', 'PingFang SC';
      font-size: 14px;
      font-weight: 400;
      color: var(--primary-text);
      user-select: none;
      transform: translateY(-50%);

      @include flex(flex-start);

      &.has-children {
        width: var(--menu-title-with-children);
      }

      div {
        display: -webkit-box;
        overflow: hidden;
        line-height: 20px;
        text-overflow: ellipsis;
        -webkit-line-clamp: 2;
        word-break: break-all;
        white-space: normal;
        -webkit-box-orient: vertical;
      }
    }

    #prod-menu {
      width: 100%;
      height: calc(100% - $menu-collapsed-h); // 留给收缩按钮的
      overflow: hidden auto;
      transition: all 0.25s;

      // 无子项
      .el-menu-item {
        width: 100%;
        height: var(--menu-item-h);
        padding: 0;
        background-color: #fff;

        .menu-icon {
          left: var(--menu-icon-left);
        }

        .menu-title {
          left: var(--menu-title-left);
        }

        //   选中
        &.is-active {
          position: relative;
          background: var(--menu-active-bg);

          &::before {
            position: absolute;
            top: 0;
            right: 0;
            display: inline-block;
            width: 2px;
            height: 100%;
            content: '';
            background-color: var(--primary-color);
          }

          .menu-title {
            color: var(--primary-color);
          }

          .menu-icon {
            color: var(--primary-color);
          }
        }

        &:hover {
          background: var(--menu-active-bg);

          .menu-title {
            color: var(--primary-color);
          }

          .menu-icon {
            color: var(--primary-color);
          }
        }
      }

      // 有子项
      .el-sub-menu {
        .el-sub-menu__title {
          position: relative;
          height: var(--menu-item-h);
          padding: 0;

          .menu-icon {
            left: var(--menu-icon-left);
            flex-shrink: 0;
          }

          .menu-title {
            left: var(--menu-title-left);
          }

          .el-sub-menu__icon-arrow {
            color: #555;
          }
        }

        .el-menu {
          .el-menu-item-group {
            .el-menu-item-group__title {
              display: none;
            }
          }
        }

        // 打开子项
        &.is-opened {
          .el-sub-menu__title {
            .menu-title {
              color: var(--primary-color);
            }

            .menu-icon {
              color: var(--primary-color);
            }

            .el-sub-menu__icon-arrow {
              color: var(--primary-color);
            }
          }
        }
      }

      // 收缩状态
      &.collapsed {
        width: var(--menu-w-collapsed);

        .menu-icon {
          top: 50%;
          left: 50% !important;
          transform: translate(-50%, -50%) !important;
        }

        .el-menu-item {
          background-color: #fff !important;

          &.is-active {
            background-color: var(--primary-color) !important;

            &::before {
              display: none;
            }

            .menu-icon {
              color: #fff;
            }
          }
        }

        .el-sub-menu {
          &.is-active {
            .el-sub-menu__title {
              background-color: var(--primary-color);
            }

            .menu-icon {
              color: #fff;
            }
          }
        }
      }
    }
  }

  .right {
    /* width: 964px; */

    .all-productions {
      /* width: 964px; */
      width: 710px;
      height: 100%;
      padding: 20px 38px 0 40px;
      font-family: PingFangSC, 'PingFang SC';
      font-size: 14px;
      font-weight: 400;
      color: #555;
      background-color: #fff;
      background-image: url('@/assets/images/common/productions-bg.png');
      background-repeat: no-repeat;
      background-position: bottom;
      background-size: contain;

      .header {
        position: relative;
        display: flex;
        justify-content: flex-end;
        height: 24px;

        svg {
          position: absolute;
          right: 0;
          width: 16px;
          height: 16px;
          color: #999;
        }
      }

      .content {
        width: 100%;
        height: calc(100% - 24px);
        overflow-y: auto;

        .lately {
          width: 100%;
          margin-bottom: 32px;

          .lately-title {
            margin-bottom: 20px;
            font-weight: bold;
            line-height: 1;
            color: #000;
            text-align: left;
            cursor: initial;
          }

          .lately-list {
            display: grid;
            grid-template-columns: repeat($grid-columns, 1fr);
            column-gap: 16px;

            .lately-item {
              position: relative;
              align-self: baseline;
              width: 200px;
              min-height: 34px;
              padding: 0 20px;
              margin-bottom: 8px;
              overflow: hidden; /* 确保超出容器的文本被隐藏 */

              // display: flex;
              // align-items: center;
              line-height: 34px;
              color: #000;
              text-align: left;
              text-overflow: ellipsis; /* 超出部分显示省略号 */
              white-space: nowrap; /* 防止文本换行 */
              background-color: #f9fafc;
              transition: all 0.2s;

              &:hover {
                color: var(--primary-color);
              }
            }
          }
        }

        .list {
          display: grid;
          grid-template-columns: repeat($grid-columns, 1fr);
          column-gap: 16px;

          .list-wrap {
            width: 200px;
            margin-bottom: 40px;

            .list-title {
              position: relative;
              width: 100%;
              padding-bottom: 8px;
              margin-bottom: 12px;
              font-size: 14px;
              font-weight: bold;

              // color: var(--primary-color);
              color: #000;
              text-align: left;
              cursor: initial;

              > span {
                display: inline-block;
                width: calc(100% - 28px);
                overflow: hidden; /* 确保超出容器的文本被隐藏 */
                text-overflow: ellipsis; /* 超出部分显示省略号 */
                white-space: nowrap; /* 防止文本换行 */
              }

              &::before {
                position: absolute;
                bottom: 0;
                left: 0;
                display: inline-block;
                width: 100%;
                height: 1px;
                content: '';
                background-color: var(--border-c);
              }
            }

            .list-items {
              .list-item {
                // height: 32px;
                // padding: 5px 0;
                display: flex;
                align-items: center;
                margin-top: 16px;
                color: #000;
                text-align: left;

                // padding-left: 20px;
                transition: all 0.2s;

                > span {
                  display: inline-block;
                  max-width: 100%;
                  overflow: hidden; /* 确保超出容器的文本被隐藏 */
                  text-overflow: ellipsis; /* 超出部分显示省略号 */
                  white-space: nowrap; /* 防止文本换行 */
                }

                > .list-item_icon_span {
                  max-width: calc(100% - 22px);
                }

                &:hover {
                  color: var(--primary-color);
                }
              }
            }

            // 有子项
            .el-sub-menu {
              .el-sub-menu__title {
                position: relative;
                height: var(--menu-item-h);
                padding: 0;

                .menu-icon {
                  left: var(--menu-icon-left);
                  flex-shrink: 0;
                }

                .menu-title {
                  left: var(--menu-title-left);
                }

                .el-sub-menu__icon-arrow {
                  color: #555;
                }
              }

              .el-menu {
                .el-menu-item-group {
                  .el-menu-item-group__title {
                    display: none;
                  }
                }
              }

              // 打开子项
              &.is-opened {
                .el-sub-menu__title {
                  .menu-title {
                    color: var(--primary-color);
                  }

                  .menu-icon {
                    color: var(--primary-color);
                  }

                  .el-sub-menu__icon-arrow {
                    color: var(--primary-color);
                  }
                }
              }
            }

            // 收缩状态
            &.collapsed {
              width: var(--menu-w-collapsed);

              .menu-icon {
                top: 50%;
                left: 50% !important;
                transform: translate(-50%, -50%) !important;
              }

              .el-menu-item {
                background-color: #fff !important;

                &.is-active {
                  background-color: var(--primary-color) !important;

                  &::before {
                    display: none;
                  }

                  .menu-icon {
                    color: #fff;
                  }
                }
              }

              .el-sub-menu {
                &.is-active {
                  .el-sub-menu__title {
                    background-color: var(--primary-color);
                  }

                  .menu-icon {
                    color: #fff;
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}

/*
  进入和离开动画可以使用不同
  持续时间和速度曲线。
*/
.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.8s cubic-bezier(1, 0.5, 0.8, 1);
  transition: all 0.3s ease-out;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  opacity: 0;
  transform: translateX(20px);
}

.mr8 {
  margin-right: 8px;
}

.ml8 {
  margin-left: 8px;
}
</style>

<style lang="scss">
.el-menu-item-group__title {
  display: none;
}
</style>
