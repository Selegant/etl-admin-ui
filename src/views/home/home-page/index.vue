<template>
  <div class="home-page flex-col h-full overflow-y-hidden">
    <div class="flex-y-center">
      <div class="w-25.9% time-str">{{ timeStr }}</div>
      <span class="flex-1 text-center header-title">数据治理平台监控首页</span>
      <div class="w-25.9% text-right">
        <n-button type="primary" ghost class="w-84px h-32px" @click="clickHandle">投屏</n-button>
      </div>
    </div>
    <div class="flex-1 mt-15px flex overflow-y-hidden">
      <div class="w-25.9% flex-col left-content">
        <div class="item-common flex-col">
          <home-common-title title="数据采集量" unit="万条">
            <span>近7天</span>
          </home-common-title>
          <no-data v-if="!barItem.seriesData?.length || !sum(barItem.seriesData)" class="flex-1"></no-data>
          <bar-echarts v-else :bar-item="barItem" class="flex-1"></bar-echarts>
        </div>
        <div class="item-common mt-16px flex-col">
          <home-common-title title="日数据增长" unit="万条">
            <span>近7天</span>
          </home-common-title>
          <no-data v-if="!barItemTwo.seriesData?.length || !sum(barItemTwo.seriesData)" class="flex-1"></no-data>
          <bar-echarts v-else :bar-item="barItemTwo" class="flex-1"></bar-echarts>
        </div>
        <div class="item-common mt-16px flex-col">
          <home-common-title title="任务运行情况"><span>近7天</span></home-common-title>
          <no-data
            v-if="
              (!lineItem.seriesData[0]?.data?.length || !sum(lineItem.seriesData[0].data)) &&
              (!lineItem.seriesData[1]?.data?.length || !sum(lineItem.seriesData[1].data))
            "
            class="flex-1"
          ></no-data>
          <line-echarts v-else :line-item="lineItem"></line-echarts>
        </div>
      </div>
      <div class="flex-1 center-content">
        <div class="center-content-top h-16.4% flex">
          <div
            v-for="(item, index) in centerOneList"
            :key="item.title"
            :style="{ width: item.width }"
            class=""
            :class="[index === 0 || index === 3 ? 'flex-col-center' : 'text-center', `center-top-item${index + 1}`]"
          >
            <div>{{ item.title }}</div>
            <div class="mt-10px">
              <span :class="['value', `value${index + 1}`]">
                {{
                  statisticInfoObj[item.key]
                    ? getThousand(
                        item.key === 'tableRows'
                          ? getHandleWarnNum(Number(statisticInfoObj[item.key].toFixed(0)))
                          : Number(statisticInfoObj[item.key].toFixed(0))
                      )
                    : 0
                }}
              </span>
              <span v-if="item.unit" class="unit ml-4px">
                {{
                  item.key === 'tableRows' &&
                  statisticInfoObj[item.key] &&
                  Number(statisticInfoObj[item.key].toFixed(0)) >= 10000
                    ? '万'
                    : ''
                }}{{ item.unit }}
              </span>
            </div>
          </div>
        </div>
        <div class="center-content-bottom h-83.6%">
          <img ref="imggif" src="@/assets/images/center.gif" alt="" class="cirle w-500px" />
          <div
            v-for="(item, index) in dbList"
            :id="`db-item${index}`"
            :key="item.dbKey"
            class="db-item"
            :style="{
              top: tlList[index]?.top,
              left: tlList[index]?.left,
              right: tlList[index]?.right,
              transform: `translateX(${tlList[index]?.left === '50%' ? '-50%' : '0'})`
            }"
          >
            <div class="db-item-content p-10px">
              <div class="flex-y-center db-item-one pb-6px">
                <img src="@/assets/images/jiantou.png" class="w-13px mr-8px" alt="" />
                <span class="flex-1 db-key">{{ item.dbZhName }}</span>
                <span class="ml-8px">{{ getThousand(getHandleWarnNum(item.tableRows)) }}</span>
                <span class="unit">{{ item.tableRows < 10000 ? '' : '万' }}条</span>
              </div>
              <div class="pl-18.34px mt-9px">
                数据库名称：
                <span>{{ item.dbKey }}</span>
              </div>
              <div class="pl-18.34px mt-9px">
                数据量：
                <span>{{ item.tableDataLength }}GB</span>
              </div>
              <div class="pl-18.34px mt-9px">
                数据表：
                <span>{{ item.tableNum }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="w-25.9% flex-col right-content">
        <div class="item-common right-one flex-col">
          <home-common-title title="数据集统计"></home-common-title>
          <div class="right-one-contain flex flex-wrap flex-1">
            <div v-for="item in rightOneList" :key="item.title" class="w-50% h-50% flex-y-center">
              <img :src="getImageUrl(item.imgUrl)" alt="" class="w-62px" />
              <div>
                <div class="value">
                  {{ modelStaObj[item.key] ? getThousand(getHandleWarnNum(modelStaObj[item.key], 1)) : 0 }}
                  <span class="unit">{{ modelStaObj[item.key] < 10000 ? '' : '万' }}个</span>
                </div>
                <div>{{ item.title }}</div>
              </div>
            </div>
          </div>
        </div>
        <div class="item-common mt-16px right-two flex-col">
          <home-common-title title="数据字典统计"></home-common-title>
          <div class="flex-1 flex-y-center">
            <div v-for="item in rightTwoList" :key="item.title" class="w-33.3333% flex-col-center">
              <img :src="getImageUrl(item.imgUrl)" alt="" class="h-40px" />
              <div class="value">
                {{ modelStaObj[item.key] ? getThousand(getHandleWarnNum(modelStaObj[item.key], 1)) : 0 }}
                <span class="unit">{{ modelStaObj[item.key] < 10000 ? '' : '万' }}</span>
              </div>
              <div>{{ item.title }}</div>
            </div>
          </div>
        </div>
        <div class="item-common mt-16px right-three flex-col">
          <home-common-title title="告警信息" :num="warnList.length"></home-common-title>
          <no-data v-if="!warnList.length" class="flex-1"></no-data>
          <div v-else class="flex-1 mt-2px">
            <div v-for="(item, index) in warnList" :key="item.title" class="flex-y-center right-three-item">
              <img :src="getImageUrl(`warn${index + 1}`)" alt="" class="w-34px mr-10px" />
              <div class="flex-1 overflow-hidden">
                <div class="flex-between-center">
                  <span class="title">{{ item.title }}</span>
                  <span class="time">{{ dayjs(item.updateDate).format('MM-DD HH:mm:ss') }}</span>
                </div>
                <div class="value mt-5px">{{ item.content }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from 'vue';
import dayjs from 'dayjs';
const imggif = ref();
import { useHomePage, useRouterPush } from '@/composables';
import { getThousand, getHandleWarnNum, sum, getImageUrl } from '@/utils/common';
const { routerPush } = useRouterPush();
const {
  timeStr,
  lineItem,
  barItem,
  barItemTwo,
  centerOneList,
  statisticInfoObj,
  dbList,
  tlList,
  rightOneList,
  modelStaObj,
  rightTwoList,
  warnList,
  dataRefrehTimer,
  timeStrTimer,
  getData,
  getTimeStr,
  clear
} = useHomePage(imggif);
onMounted(() => {
  const linelegend = ['运行成功', '运行失败'];
  const colors = ['#3AC9A8', '#FA8383'];
  lineItem.value.seriesData = linelegend.map((v, i) => {
    return {
      name: v,
      type: 'line',
      smooth: false,
      color: colors[i],
      // stack: 'run',
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            {
              offset: 0,
              color: i === 0 ? 'rgba(58,201,168,0.20)' : 'rgba(250,131,131,0.20)' // 0% 处的颜色
            },
            {
              offset: 1,
              color: i === 0 ? 'rgba(58,201,168,0.00)' : 'rgba(250,131,131,0.00)' // 100% 处的颜色
            }
          ],
          global: false // 缺省为 false
        },
        opacity: 1
      },
      data: []
      // data: i === 0 ? [4, 4, 4, 4, 4, 4, 4] : [5, 5, 5, 5, 5, 5, 5]
    };
  });
  // 定时刷新数据
  dataRefrehTimer();
  timeStrTimer();
  getData();
  getTimeStr();
});
onUnmounted(() => {
  clear();
});
function clickHandle() {
  routerPush({
    name: `home_big-screen`
  });
}
</script>

<style lang="scss" scoped>
@media screen and (max-width: 1919px) {
  .cirle {
    width: 360px;
  }
}
@keyframes beat {
  0% {
    bottom: 4%;
  }

  100% {
    bottom: 0%;
  }
}
.home-page {
  background: url('@/assets/images/homepageback.png') no-repeat;
  background-size: 100% 100%;
  .time-str {
    font-size: 14px;
    color: #666;
    line-height: 14px;
  }
  .header-title {
    font-size: 24px;
    line-height: 24px;
    color: #333;
    font-weight: 500;
  }
  .left-content {
    .item-common {
      height: calc((100% - 32px) / 3);
    }
  }
  .item-common {
    background: #fff;
    border-radius: 3px;
    box-shadow: 0px 1px 4px 0px rgba(202, 202, 202, 0.5);
    padding: 16px;
    flex-shrink: 0;
  }
  .center-content {
    &-top {
      background: url('@/assets/images/centertopback.png') no-repeat;
      background-size: 100% 100%;
      font-size: 18px;
      color: #666;
      line-height: 18px;
      .center-top-item2,
      .center-top-item3 {
        padding-top: 20px;
      }
      .value {
        font-family: OPPOSans, OPPOSans-Regular;
        color: transparent;
      }
      .value1,
      .value4 {
        background: linear-gradient(180deg, #446ba4 25%, #253e63 100%);
        background-clip: text;
        font-size: 30px;
        line-height: 30px;
      }
      .value2,
      .value3 {
        background: linear-gradient(180deg, #309bff 24%, #0047be);
        background-clip: text;
        font-size: 46px;
        line-height: 46px;
      }
      .unit {
        background: linear-gradient(180deg, #309bff 0%, #0047be);
        background-clip: text;
        color: transparent;
        font-size: 18px;
        line-height: 18px;
      }
    }
    &-bottom {
      position: relative;
      .db-item {
        width: 250px;
        height: 104px;
        position: absolute;
        z-index: 2;
        // transform: translateX(-50%);
        font-size: 12px;
        font-family: Microsoft YaHei, Microsoft YaHei-Regular;
        font-weight: 400;
        color: #666666;
        line-height: 12px;
        &-content {
          width: 100%;
          background: #ffffff;
          border-radius: 6px;
          box-shadow: 0px 4px 14px 0px rgba(164, 187, 194, 0.3);
          position: absolute;
          animation-name: beat;
          animation-timing-function: linear;
          /*速度曲线*/
          animation-iteration-count: infinite;
          /*播放次数*/
          animation-direction: alternate;
          /*逆向播放*/
          animation-play-state: running;
          animation-duration: 0.5s;
        }
        .db-item-one {
          font-size: 14px;
          font-family: OPPOSans, OPPOSans-Regular;
          line-height: 14px;
          color: #333333;
          border-bottom: 1px solid #ccc;
          .db-key {
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          .unit {
            font-family: Microsoft YaHei, Microsoft YaHei-Regular;
          }
        }
      }
      .cirle {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
      }
    }
  }
  .right-content {
    .right-one,
    .right-two {
      padding-bottom: 0px;
      line-height: 14px;
      color: #666;
      .value {
        background: linear-gradient(180deg, #446ba4 25%, #253e63 100%);
        background-clip: text;
        font-size: 24px;
        font-family: OPPOSans, OPPOSans-Regular;
        color: transparent;
        line-height: 24px;
        margin-bottom: 10px;
        .unit {
          font-size: 14px;
          font-family: Microsoft YaHei, Microsoft YaHei-Regular;
          color: #666;
        }
      }
    }
    .right-one {
      height: calc(30.112% - 16px);
    }
    .right-two {
      height: calc(24.494% - 16px);
      .value {
        margin-top: 16px;
      }
    }
    .right-three {
      height: 45.394%;
      line-height: 14px;
      &-item {
        &:not(:last-child) {
          border-bottom: 1px solid #ccc;
        }
        padding: 10px 0;
      }
      .title {
        font-weight: 500;
        color: #333;
      }
      .time {
        font-size: 12px;
        color: #999;
        line-height: 12px;
      }
      .value {
        color: #666;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }
  }
}
</style>
