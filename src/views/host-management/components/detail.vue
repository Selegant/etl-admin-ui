<template>
  <div class="h-full overflow-hidden">
    <n-card ref="cardRef" class="h-full shadow-sm rounded-16px overflow-auto" content-style="background:#f0f2f5;">
      <n-space justify="space-between">
        <n-space>
          <div
            v-for="item in tabList"
            :key="item.value"
            class="tab-item flex-center"
            :class="tabActive === item.value ? 'tab-active' : ''"
            @click="tabChange(item.value)"
          >
            <svg-icon :icon="item.icon" class="mr-12px"></svg-icon>
            {{ item.name }}
          </div>
        </n-space>
        <n-space>
          <n-dropdown trigger="hover" :options="dropdownOptions" @select="handleDropSelect">
            <n-button v-if="deadline > 0">{{ `自动刷新${countDownTime}秒` }}</n-button>
            <n-button v-if="deadline <= 0">关闭自动刷新</n-button>
          </n-dropdown>
          <n-button class="ml--9px" strong type="primary" @click="refresh">
            <template #icon>
              <n-icon>
                <svg-icon icon="iconamoon:synchronize"></svg-icon>
              </n-icon>
            </template>
          </n-button>
        </n-space>
      </n-space>
      <div class="mt-14px flex flex-wrap">
        <div v-if="tabActive === 1" class="h-400px data-item">
          <n-card
            class="h-full"
            title="监控任务信息"
            header-style="font-size:small;border-bottom:1px solid #f0f0f0;"
            content-style="padding:24px;"
          >
            <div v-for="item in baseInfoKey" :key="item" class="flex-y-center base-item mb-10px">
              <div class="w-33.33% text-right mr-16px">{{ t(`monitors.detail.${item}`) }}</div>
              <div v-if="item !== 'status'">
                {{
                  item === 'gmtCreate' || item === 'gmtUpdate'
                    ? dayjs(baseInfoObj[item]).format('YYYY-MM-DD HH:mm:ss')
                    : baseInfoObj[item]
                }}{{ item === 'intervals' ? 's' : '' }}
              </div>
              <n-tag
                v-else
                size="small"
                :color="
                  baseInfoObj.status === 2
                    ? { color: '#f45a3a', textColor: '#fff' }
                    : baseInfoObj.status === 1
                    ? { color: '#f6ffed', textColor: '#52c41a', borderColor: '#b7eb8f' }
                    : baseInfoObj.status === 0
                    ? { color: '#1890ff', textColor: '#fff' }
                    : { color: 'transparent', textColor: 'transparent' }
                "
              >
                {{ t(`status.${stateOptions.find(v => v.value === baseInfoObj.status)?.label}`) }}
              </n-tag>
            </div>
          </n-card>
        </div>
        <div
          v-for="item in tabActive === 1 ? dataList : echartsList"
          :key="tabActive === 1 ? item.title : item.titleText"
          class="data-item"
          :class="[tabActive === 1 ? 'h-400px' : 'h-500px']"
        >
          <n-card
            v-if="tabActive === 1"
            class="h-full overflow-auto"
            header-style="border-bottom:1px solid #f0f0f0;padding:16px 4px 10px;"
            content-style="padding:24px;"
          >
            <template #header>
              <p class="text-center mb-3px card-title">{{ item.title }}</p>
              <div class="flex-y-center time">
                <svg-icon
                  icon="material-symbols:nest-clock-farsight-analog-outline"
                  class="mr-3px"
                  style="color: #3f51b5"
                ></svg-icon>
                <i>{{ item.time }}</i>
              </div>
            </template>
            <n-data-table size="small" :bordered="false" :columns="item.columns" :data="item.tableData" />
          </n-card>
          <n-card v-else class="h-full" content-style="padding:24px;">
            <line-echarts :line-item="item.lineItem"></line-echarts>
          </n-card>
        </div>
      </div>
    </n-card>
  </div>
</template>

<script lang="ts" setup>
import { log } from 'console';
import { h, onMounted, ref, reactive, onBeforeUnmount } from 'vue';
import { useRoute } from 'vue-router';
import { NTag } from 'naive-ui';
import dayjs from 'dayjs';
import { getMonitor, getMetricsData, queryAppDefine, getMetricHistoryData } from '@/service';
import { t } from '@/locales';
const route = useRoute();
const stateOptions = [
  { label: 'unmonitored', value: 0 },
  { label: 'available', value: 1 },
  { label: 'unavailable', value: 2 }
];
const tabList = [
  { name: '监控实时数据详情', value: 1, icon: 'majesticons:checkbox-list-detail-line' },
  { name: '监控历史图表详情', value: 2, icon: 'ph:chart-line' }
];
const commonColumns = [
  {
    title: '指标名',
    key: 'name'
  },
  {
    title: '指标值',
    key: 'value',
    render: rowData => {
      return h('div', { class: 'flex-y-center flex-wrap' }, [
        rowData.value,
        rowData.unit
          ? h(
              NTag,
              {
                size: 'small',
                class: 'ml-5px',
                color: { color: '#f6ffed', textColor: '#52c41a', borderColor: '#b7eb8f' }
              },
              {
                default: () => rowData.unit
              }
            )
          : ''
      ]);
    }
  }
];
const color = '#516EC5';
const colors = ['#5470c7', '#91cc75', '#fac858', '#ee6665', '#74c0de', '#3aa172', '#f78453', '#9a61b4', '#eb7dcc'];
const commonLineItem = {
  showSymbol: false,
  xAxisType: 'time',
  toolboxShow: true,
  seriesData: [],
  gridRight: '8%',
  myPeriodClick: (metricFull: string, history: string, index: number, interval: any) => {
    metricHistoryData(metricFull, history, index, interval);
  }
};
const interval = ref();
const deadline = ref(30);
const countDownTime = ref();
const dropdownOptions = [
  {
    label: '设置10秒自动刷新',
    key: 10
  },
  {
    label: '设置30秒自动刷新',
    key: 30
  },
  {
    label: '设置60秒自动刷新',
    key: 60
  },
  {
    label: '设置300秒自动刷新',
    key: 300
  },
  {
    label: '关闭自动刷新',
    key: -1
  }
];
const history = ref('6h');
const echartsArr: any = ref([]);
const echartsList = ref([]);
const dataList = ref([]);
const baseInfoKey = ref(['id', 'name', 'host', 'port', 'description', 'status', 'intervals', 'gmtCreate', 'gmtUpdate']);
const baseInfoObj = ref({});
const tabActive = ref(1);
function tabChange(val: number) {
  tabActive.value = val;
  getData();
}
const metrics: any = ref([]);
async function getMonitorInfo() {
  const { data } = await getMonitor({ id: route.query.id });
  metrics.value = data && data.data.metrics ? [...data.data.metrics] : [];
  const obj: any = {};
  if (data.data.params) {
    data.data.params.forEach((v: any) => {
      obj[v.field] = v.value;
    });
  }
  baseInfoObj.value = data && data.data.monitor ? { ...data.data.monitor, ...obj } : { ...obj };
  dataList.value = metrics.value.map((v: any) => {
    return {
      title: t(`monitor.app.${route.query.app}.metrics.${v}.${v}`),
      time: '',
      columns: v === 'basic' || v === 'cpu' || v === 'memory' || v === 'disk' || v === 'system' ? commonColumns : [],
      tableData: []
    };
  });
  metrics.value.forEach((v: string, i: number) => {
    getmetricsMetricsData(v, i);
  });
}
async function getmetricsMetricsData(metric: string, index: number) {
  const { data } = await getMetricsData({ monitorId: route.query.id, metrics: metric });
  dataList.value[index].time = dayjs(data.data.time).format('YYYY-MM-DD HH:mm:ss');
  if (metric === 'basic' || metric === 'cpu' || metric === 'memory' || metric === 'disk' || metric === 'system') {
    dataList.value[index].tableData =
      data && data.data.fields
        ? data.data.fields.map((v: any, i: number) => {
            return {
              name: t(`monitor.app.${route.query.app}.metrics.${metric}.metric.${v.name}`),
              unit: v.unit,
              value: data.data.valueRows[0].values[i].origin
            };
          })
        : [];
  } else {
    dataList.value[index].columns =
      data && data.data.fields
        ? data.data.fields.map((v: any, i: number) => {
            return {
              title: t(`monitor.app.${route.query.app}.metrics.${metric}.metric.${v.name}`),
              key: v.name,
              width:
                (metric === 'disk_free' && v.name !== 'mounted') || (metric === 'stats' && v.name !== 'name')
                  ? 150
                  : (metric === 'containers' && (v.name === 'name' || v.name === 'command')) ||
                    (metric === 'stats' && v.name === 'name')
                  ? 300
                  : metric === 'containers' && (v.name === 'state' || v.name === 'status')
                  ? 80
                  : '',
              cellProps: () => {
                return (metric === 'disk_free' && v.name === 'mounted') ||
                  (metric === 'containers' && (v.name === 'id' || v.name === 'image'))
                  ? {
                      style: 'white-space: nowrap;'
                    }
                  : {};
              },
              render: (rowData: any) => {
                return h('div', { class: 'flex-y-center flex-wrap' }, [
                  rowData[v.name],
                  v.unit && rowData[v.name]
                    ? h(
                        NTag,
                        {
                          size: 'small',
                          class: 'ml-5px',
                          color: { color: '#f6ffed', textColor: '#52c41a', borderColor: '#b7eb8f' }
                        },
                        {
                          default: () => v.unit
                        }
                      )
                    : ''
                ]);
              }
            };
          })
        : [];
    const arr = data.data.fields.map((v: any) => v.name);
    dataList.value[index].tableData =
      data && data.data.valueRows
        ? data.data.valueRows.map((v: any) => {
            const obj: any = {};
            arr.forEach((q: string, qindex: number) => {
              obj[q] = v.values[qindex].origin;
            });
            return obj;
          })
        : [];
  }
}
async function getqueryAppDefine() {
  echartsArr.value = [];
  const { data } = await queryAppDefine({ app: route.query.app });
  if (data && data.data.metrics) {
    data.data.metrics.forEach((metricItem: any) => {
      metricItem.fields.forEach((v: any) => {
        if (v.type === 0) {
          echartsArr.value.push({
            title: `${metricItem.i18n['zh-CN']}/${v.i18n['zh-CN']}`,
            metricFull: `${route.query.app}.${metricItem.name}.${v.field}`,
            unit: v.unit ? `单位 ${v.unit}` : ''
          });
        }
      });
    });
    echartsList.value = echartsArr.value.map((v: any, i: number) => {
      return {
        lineItem: {
          ...commonLineItem,
          // color,
          titleText: v.title,
          metricFull: v.metricFull,
          index: i,
          yAxisName: v.unit
        }
      };
    });
    echartsArr.value.forEach((v: string, i: number) => {
      metricHistoryData(v.metricFull, '1h', i);
    });
  }
}
async function metricHistoryData(metricFull: string, history: any, index: number, interval?: any) {
  const params = {
    monitorId: route.query.id,
    metricFull,
    history,
    interval: interval || false
  };
  const { data } = await getMetricHistoryData(params);
  if (data && data.data.values) {
    const arr = Object.keys(data.data.values);
    if (arr.length === 0) {
      echartsList.value[index].lineItem.seriesData = [];
    } else if (arr.length === 1) {
      echartsList.value[index].lineItem.color = color;
      echartsList.value[index].lineItem.seriesData = data.data.values[''].map(v => {
        return {
          value: [v.time, v.origin]
        };
      });
    } else {
      echartsList.value[index].lineItem.moreSeries = true;
      echartsList.value[index].lineItem.seriesData = arr.map(v => {
        return {
          name: v,
          type: 'line',
          smooth: false,
          stack: 'commonStack',
          data: data.data.values[v].map(valueitem => {
            return {
              value: [valueitem.time, valueitem.origin]
            };
          }),
          showSymbol: false,
          areaStyle: {
            color: colors[index]
          },
          color: colors[index]
        };
      });
    }
  }
}
function handleDropSelect(key: number) {
  deadline.value = key;
  countDownTime.value = deadline.value;
}
function getData() {
  if (tabActive.value === 1) {
    // 监控任务信息
    getMonitorInfo();
  } else {
    // 获取标题定义
    getqueryAppDefine();
  }
}
function refresh() {
  getData();
  countDownTime.value = deadline.value;
}
function countDown() {
  if (deadline.value > 0) {
    countDownTime.value = Math.max(0, countDownTime.value - 1);
    if (countDownTime.value === 0) {
      getData();
      countDownTime.value = deadline.value;
    }
  }
}
onMounted(() => {
  countDownTime.value = deadline.value;
  interval.value = setInterval(countDown, 1000);
  getData();
});
onBeforeUnmount(() => {
  clearInterval(interval.value);
  interval.value = null;
});
</script>

<style lang="scss" scoped>
.tab-item {
  padding: 8px 16px;
  background: #fafafa;
  border: 1px solid #f0f0f0;
  border-radius: 2px 2px 0 0;
  border-bottom-color: #fff;
  color: #000000d9;
  cursor: pointer;
  &:hover,
  &.tab-active {
    color: #3f51b5;
  }
}
.data-item {
  width: calc(50% - 5px);
  margin-bottom: 6px;
  &:nth-child(odd) {
    margin-right: 10px;
  }
  .card-title {
    font-size: small;
  }
  .time {
    i {
      color: rgba(112, 112, 112, 0.89);
      font-size: 13px;
      line-height: 13px;
    }
  }
  .base-item {
    font-size: xx-small;
    color: #000000d9;
  }
}
</style>
