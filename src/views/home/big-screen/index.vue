<template>
  <div class="big-screen">
    <div class="relative big-screen-header">
      <div class="time-str absolute">{{ timeStr }}</div>
      <span class="absolute header-title">数据治理平台监控首页</span>
      <div class="flex-y-center justify-end absolute exit-fullscreen">
        <img
          src="@/assets/images/exitfullscreen.png"
          class="w-20px mr-10px cursor-pointer"
          alt=""
          @click="exitFullScreen"
        />
        <span class="cursor-pointer" @click="exitFullScreen">退出全屏</span>
      </div>
      <canvas id="headerPag"></canvas>
    </div>
    <div class="main-content flex-y-center overflow-y-hidden p-26px pt-0px">
      <div class="main-content-left flex-col h-full w-23.6%">
        <div class="left-one flex-shrink-0 h-33.3% flex-col">
          <bs-common-title title="数据采集量" unit="万条"><span class="title-right">近7天</span></bs-common-title>
          <bs-no-data v-if="!barItem.seriesData?.length || !sum(barItem.seriesData)" class="flex-1"></bs-no-data>
          <bar-echarts v-else :bar-item="barItem" class="flex-1"></bar-echarts>
        </div>
        <div class="left-two flex-shrink-0 flex-col h-35.08%">
          <bs-common-title title="日数据增长" unit="万条"><span class="title-right">近7天</span></bs-common-title>
          <bs-no-data v-if="!barItemTwo.seriesData?.length || !sum(barItemTwo.seriesData)" class="flex-1"></bs-no-data>
          <bar-echarts v-else :bar-item="barItemTwo" class="flex-1"></bar-echarts>
        </div>
        <div class="left-three flex-shrink-0 flex-col flex-1">
          <bs-common-title title="任务运行情况" unit="万条"><span class="title-right">近7天</span></bs-common-title>
          <bs-no-data
            v-if="
              (!lineItem.seriesData[0]?.data?.length || !sum(lineItem.seriesData[0].data)) &&
              (!lineItem.seriesData[1]?.data?.length || !sum(lineItem.seriesData[1].data))
            "
            class="flex-1"
          ></bs-no-data>
          <line-echarts v-else :line-item="lineItem" class="flex-1"></line-echarts>
        </div>
      </div>
      <div class="main-content-center h-full flex-1">
        <div class="center-top h-18.067% flex">
          <div
            v-for="(item, index) in centerOneList"
            :key="item.title"
            :style="{ width: item.width }"
            class=""
            :class="[index === 0 || index === 3 ? 'flex-col-center' : 'text-center', `center-top-item${index + 1}`]"
          >
            <div>{{ item.title }}</div>
            <div class="mt-10px flex-x-center flex-items-end">
              <!-- <span :class="['value', `value${index + 1}`]">
                {{
                  statisticInfoObj[item.key]
                    ? getThousand(
                        item.key === 'tableRows'
                          ? getHandleWarnNum(Number(statisticInfoObj[item.key].toFixed(0)))
                          : Number(statisticInfoObj[item.key].toFixed(0))
                      )
                    : 0
                }}
              </span> -->
              <number-count
                :key="item.title"
                :num-value="Number(statisticInfoObj[item.key]?.toFixed(0))"
                :is-unit-handle="item.key === 'tableRows' ? true : false"
                class="number-count"
              />
              <span v-if="item.unit" class="unit ml-4px">
                {{
                  item.key === 'tableRows' &&
                  statisticInfoObj[item.key] &&
                  Number(statisticInfoObj[item.key]?.toFixed(0)) >= 10000
                    ? '万'
                    : ''
                }}{{ item.unit }}
              </span>
            </div>
          </div>
        </div>
        <div class="center-bottom h-81.933%">
          <img ref="imggif" src="@/assets/images/bgscreencenter.gif" alt="" class="cirle w-600px" />
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
              <div class="pl-18.34px mt-7px">
                表名称：
                <span class="db-item-value">{{ item.dbZhName }}</span>
              </div>
              <div class="pl-18.34px mt-7px">
                数据量：
                <span class="db-item-value">{{ item.tableDataLength }}GB</span>
              </div>
              <div class="pl-18.34px mt-7px">
                数据表：
                <span class="db-item-value">{{ item.tableNum }}</span>
              </div>
            </div>
          </div>
          <img src="@/assets/images/light.png" alt="" class="light w-600px" />
        </div>
      </div>
      <div class="main-content-right flex-col h-full w-23.6%">
        <div class="right-one flex-shrink-0 flex-col h-29.62%">
          <bs-common-title title="数据集统计" unit="个"></bs-common-title>
          <div class="right-one-contain flex flex-wrap flex-1">
            <div v-for="(item, index) in rightOneList" :key="item.title" class="w-50% h-50% flex-y-center">
              <img :src="getImageUrl(rightOneImgs[index])" alt="" class="w-95px" />
              <div>
                <div>{{ item.title }}</div>
                <div class="value">
                  {{ modelStaObj[item.key] ? getThousand(modelStaObj[item.key]) : 0 }}
                  <!-- <span class="unit">{{ modelStaObj[item.key] < 10000 ? '' : '万' }}个</span> -->
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="right-two flex-shrink-0 flex-col h-27.52%">
          <bs-common-title title="数据字典统计" unit="个"></bs-common-title>
          <div class="right-two-contain flex-1 flex-y-center">
            <div v-for="(item, index) in rightTwoList" :key="item.title" class="right-two-item flex-col-center">
              <img :src="getImageUrl(rightTwoImgs[index])" alt="" class="h-40px" />
              <div class="value">
                {{ modelStaObj[item.key] ? getThousand(modelStaObj[item.key]) : 0 }}
                <!-- <span class="unit">{{ modelStaObj[item.key] < 10000 ? '' : '万' }}</span> -->
              </div>
              <div>{{ item.title }}</div>
            </div>
          </div>
        </div>
        <div class="right-three flex-shrink-0 flex-col flex-1">
          <bs-common-title title="告警信息"></bs-common-title>
          <bs-no-data v-if="!warnList.length" class="flex-1"></bs-no-data>
          <div v-else class="flex-1">
            <div v-for="(item, index) in warnList" :key="item.title" class="flex-y-center right-three-item">
              <img :src="getImageUrl(`bgscreenwarn${index + 1}`)" alt="" class="w-34px mr-10px" />
              <div class="flex-1 overflow-hidden">
                <div class="flex-between-center">
                  <span class="title">{{ item.title }}</span>
                  <span class="time">{{ dayjs(item.updateDate).format('MM-DD HH:mm:ss') }}</span>
                </div>
                <div class="value mt-10px">{{ item.content }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onBeforeUnmount, toRaw } from 'vue';
import { useHomePage, useRouterPush } from '@/composables';
import { getThousand, getHandleWarnNum, initPag, sum, getImageUrl } from '@/utils/common';
import '@/utils/flexible.js';
import { PAGInit } from 'libpag';
import dayjs from 'dayjs';
const { routerPush } = useRouterPush();
const rightOneImgs = ['bgscreenrightone', 'bgscreenrighttwo', 'bgscreenrightthree', 'bgscreenrightfour'];
const rightTwoImgs = ['bgscreenrightfive', 'bgscreenrightsix', 'bgscreenrightseven'];
const imggif = ref();
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
} = useHomePage(imggif, true);
const newBarItem = {
  xAxisRotate: 0,
  xAxisLabelColor: '#4B8DBE',
  yAxisColor: '#4B8DBE',
  xAxisLineColor: '#42A1F1',
  yAxisSplitLineColor: 'rgba(255,255,255,0.14)',
  labelColor: '#fff',
  iscylinder: true,
  borderColor: {
    type: 'linear',
    x: 0,
    y: 0,
    x2: 0,
    y2: 1,
    colorStops: [
      {
        offset: 0,
        color: 'rgba(36,190,232,0.00)' // 0% 处的颜色
      },
      {
        offset: 1,
        color: '#1afff3' // 100% 处的颜色
      }
    ],
    global: false // 缺省为 false
  }
};
barItem.value = { ...barItem.value, ...newBarItem };
barItem.value.color.colorStops = [
  {
    offset: 0,
    color: 'rgba(0,145,255,0.30)' // 0% 处的颜色
  },
  {
    offset: 1,
    color: '#24bee8' // 100% 处的颜色
  }
];
const newBarItemTwo = {
  xAxisLabelColor: '#4B8DBE',
  yAxisColor: '#4B8DBE',
  yAxisLineColor: '#42A1F1',
  xAxisSplitLineColor: 'rgba(255,255,255,0.14)',
  showBack: false,
  isbattery: true,
  labelColor: '#fff'
};
barItemTwo.value = { ...barItemTwo.value, ...newBarItemTwo };
barItemTwo.value.color.colorStops = [
  {
    offset: 0,
    color: '#FF9D32' // 0% 处的颜色
  },
  {
    offset: 1,
    color: '#00CBC1' // 100% 处的颜色
  }
];
const newLineItem = {
  xAxisLabelColor: '#4B8DBE',
  xAxisLineColor: '#42A1F1',
  xAxisRotate: 0,
  yAxisLabelColor: '#4B8DBE',
  yAxisSplitColor: 'rgba(255,255,255,0.14)',
  gridBottom: 32,
  legendTextColor: '#8CCEFF',
  legendItemWidth: 20,
  legendItemHeight: 10
};
lineItem.value = { ...lineItem.value, ...newLineItem };
function exitFullScreen() {
  routerPush({
    name: `home_home-page`
  });
}
const pagViews: any = ref([]);
onMounted(() => {
  PAGInit({ locateFile: file => '/libpag.wasm' }).then(async PAG => {
    console.log(PAG, 'PAG');
    const pagView = await initPag(PAG, '/headerPag.pag', 'headerPag');
    pagViews.value.push(pagView);
  });
  const linelegend = ['运行成功', '运行失败'];
  const colors = ['#3AC9A8', '#FA8383'];
  lineItem.value.seriesData = linelegend.map((v, i) => {
    return {
      name: v,
      type: 'line',
      smooth: false,
      color: colors[i],
      symbolSize: 8,
      symbol: 'circle',
      itemStyle: {
        borderColor: '#0B194C',
        borderWidth: 2
      },
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
              color: i === 0 ? 'rgba(69,248,205,0.30)' : 'rgba(238,66,99,0.30)' // 0% 处的颜色
            },
            {
              offset: 1,
              color: i === 0 ? 'rgba(69,248,205,0.10)' : 'rgba(238,66,99,0.10)' // 100% 处的颜色
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
onBeforeUnmount(() => {
  clear();
  toRaw(pagViews.value).forEach((v: any) => {
    v.destroy();
  });
  pagViews.value = [];
});
</script>

<style lang="scss" scoped>
:deep(.center-top-item2),
:deep(.center-top-item3) {
  .number-item > span > .num,
  .mark-item > span {
    color: #ffe36a;
    font-size: 46px;
    /* prettier-ignore */
    line-height:30PX;
  }
  .number-item {
    width: 30px;
    height: 45px;
  }
  .mark-item {
    height: 45px;
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
.big-screen {
  width: 100%;
  height: 100%;
  background: url('@/assets/images/bigscreenback.png') no-repeat;
  background-size: 100% 100%;
  .title-right {
    color: #80cfff;
    font-weight: 600;
  }
  .main-content {
    height: calc(100% - 102px);
    &-left {
    }
    &-center {
      .center-bottom {
        position: relative;
        .db-item {
          width: 220px;
          height: 104px;
          position: absolute;
          z-index: 2;
          // transform: translateX(-50%);
          font-size: 12px;
          font-family: Microsoft YaHei, Microsoft YaHei-Regular;
          font-weight: 400;
          color: #80cfff;
          /* prettier-ignore */
          line-height: 12PX;
          &-content {
            width: 100%;
            background: url('@/assets/images/bgscreencenterbottomitemback.png');
            background-size: 100% 100%;
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
            .db-item-value {
              background: linear-gradient(180deg, #ffffff 25%, #0dcaf5);
              font-family: OPPOSans, OPPOSans-Regular;
              background-clip: text;
              color: transparent;
            }
          }
          .db-item-one {
            font-size: 14px;
            font-family: OPPOSans, OPPOSans-Regular;
            /* prettier-ignore */
            line-height: 14PX;
            color: #6dffc2;
            // border-bottom: 1px solid #ccc;
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
        .cirle,
        .light {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }
        .light {
          top: 44.5%;
          left: 50.5%;
        }
      }
      .center-top {
        margin: 0 100px;
        background: url('@/assets/images/bgscreencentertopback.png');
        background-size: 100% 100%;
        font-size: 18px;
        color: #fff;

        /* prettier-ignore */
        line-height: 18PX;
        .center-top-item2,
        .center-top-item3 {
          padding-top: 32px;
        }
        .unit {
          // background: #ffe36a;
          // background-clip: text;
          color: #ffe36a;
          font-size: 18px;
          /* prettier-ignore */
          line-height: 18PX;
        }
      }
    }
    &-right {
      .right-one,
      .right-two {
        /* prettier-ignore */
        line-height: 14PX;
        color: #80cfff;
        .value {
          background: linear-gradient(180deg, #ffffff 25%, #0dcaf5);
          background-clip: text;
          font-size: 24px;
          font-family: OPPOSans, OPPOSans-Regular;
          color: transparent;
          /* prettier-ignore */
          line-height: 24PX;
          margin-top: 10px;
          // .unit {
          //   font-size: 14px;
          //   font-family: Microsoft YaHei, Microsoft YaHei-Regular;
          //   color: #666;
          // }
        }
      }
      .right-two {
        .right-two-contain {
          padding: 17px 1px 22px 0;
        }
        .right-two-item {
          background: url('@/assets/images/righttwoback.png');
          background-size: 100% 100%;
          width: calc(33.3333% - 11.3333px);
          height: 100%;
          &:not(:last-child) {
            margin-right: 17px;
          }
        }
        .value {
          margin: 16px 0 10px;
        }
      }
      .right-three {
        &-item {
          /* prettier-ignore */
          line-height: 14PX;
          &:not(:last-child) {
            border-bottom: 1px solid rgba(255, 255, 255, 0.14);
          }
          padding: 14px 0;
        }
        .title {
          font-weight: 500;
          color: #fff;
        }
        .time {
          font-size: 12px;
          color: #3e7698;
          /* prettier-ignore */
          line-height: 12PX;
        }
        .value {
          color: #80cfff;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      }
    }
  }
  &-header {
    background: url('@/assets/images/bigscreenheaderback.png') no-repeat;
    background-size: 100% 100%;
    width: 100%;
    height: 102px;
    font-size: 18px;
    color: #80cfff;
    #headerPag {
      width: 1920px !important;
      height: 120px !important;
      position: relative;
      top: -10px;
    }
    .time-str,
    .header-title {
      font-weight: bold;
      z-index: 1;
    }
    .header-title {
      background: linear-gradient(180deg, #ffffff, #72c5ff);
      -webkit-background-clip: text;
      color: transparent;
      font-size: 40px;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }
    .time-str {
      top: 20px;
      left: 20px;
    }
    .exit-fullscreen {
      top: 20px;
      right: 20px;
      z-index: 1;
    }
  }
}
</style>
