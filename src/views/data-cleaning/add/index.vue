<template>
  <div class="h-full overflow-hidden">
    <n-card ref="cardRef" :title="(route.query.metaTitle as string)" class="h-full shadow-sm rounded-16px">
      <template #header>
        <child-card-title @back="close"></child-card-title>
      </template>
      <common-title title="基础信息"></common-title>
      <n-form
        ref="form"
        :model="model"
        :rules="Type === 4 ? {} : rules"
        :disabled="formDisabled"
        label-placement="left"
        require-mark-placement="right-hanging"
        size="medium"
      >
        <n-grid class="pl-24px mt-14px" x-gap="20">
          <n-form-item-gi v-if="Type !== 4" :span="8" label="任务名称" path="name">
            <n-input v-model:value="model.name" />
          </n-form-item-gi>
          <n-form-item-gi v-if="Type !== 4" :span="8" label="任务描述" path="description">
            <n-input v-model:value="model.description" />
          </n-form-item-gi>
          <n-form-item-gi :span="8" label="所属项目" path="projectCode">
            <n-select v-model:value="model.projectCode" :options="projectList" label-field="name" value-field="code" />
          </n-form-item-gi>
        </n-grid>
        <n-grid :class="['border-style', Type !== 4 ? 'border-y' : 'border-b']">
          <n-gi :span="12" class="b-r border-style" :class="[Type !== 4 ? 'pt-24px' : 'pt-4px']">
            <common-title title="清洗数据源配置"></common-title>
            <n-form-item label="源头库" path="originalDbKey" class="pl-24px mt-14px" style="width: 60%">
              <n-select v-model:value="model.originalDbKey" :options="originalList" @update:value="updateOriginal" />
            </n-form-item>
            <div v-if="Type !== 4" class="flex">
              <n-form-item
                v-if="!originalTableTypeSql"
                label="源头表"
                path="originalTable"
                class="pl-24px"
                style="width: 60%"
              >
                <n-select
                  v-model:value="model.originalTable"
                  filterable
                  :filter="filterOption"
                  :options="originalTableList"
                  @update:value="confirmOriginalTable"
                />
              </n-form-item>
              <n-form-item v-else label="源头表" path="querySql" class="pl-24px" style="width: 60%">
                <n-input
                  v-model:value="model.querySql"
                  type="textarea"
                  show-count
                  :autosize="{ minRows: 4, maxRows: 6 }"
                  @blur="confirmOriginalTable"
                />
              </n-form-item>
              <div v-if="Type !== 3">
                <n-button v-if="!originalTableTypeSql" class="ml-20px" type="primary" @click="originalTableTypeChange">
                  切换自定义SQL
                </n-button>
                <div v-else class="flex-col ml-20px">
                  <n-button type="primary" class="mb-20px" @click="originalTableTypeChange">切换单表</n-button>
                  <n-button type="primary" @click="reviewData">预览数据</n-button>
                </div>
              </div>
            </div>
          </n-gi>
          <n-gi :span="12" class="pl-32px" :class="[Type !== 4 ? 'pt-24px' : 'pt-4px']">
            <common-title title="目标数据配置"></common-title>
            <n-form-item label="目标库" path="targetDbKey" class="pl-24px mt-14px">
              <n-select
                v-model:value="model.targetDbKey"
                :options="originalList"
                style="width: 60%"
                @update:value="updateTarget"
              />
            </n-form-item>
            <n-form-item v-if="Type !== 4" label="目标表" path="targetTable" class="pl-24px">
              <n-select
                v-model:value="model.targetTable"
                filterable
                :filter="filterOption"
                :options="targetTableList"
                style="width: 60%"
                @update:value="confirmTargetTable"
              />
            </n-form-item>
          </n-gi>
        </n-grid>
        <common-title class="mt-24px" title="更新类型"></common-title>
        <n-grid>
          <n-gi :span="8">
            <n-form-item label="更新类型" path="writeMode" class="pl-24px mt-14px">
              <n-select
                v-model:value="model.writeMode"
                placeholder="请选择"
                :options="writeModeOptions"
                @update:value="writeModeChange"
              />
            </n-form-item>
          </n-gi>
          <n-gi v-if="model.writeMode === 'update' || model.writeMode === 'replace'" :span="8">
            <n-form-item label="更新字段" path="uniqueColumn" class="pl-24px mt-14px">
              <n-select
                v-if="Type !== 4"
                v-model:value="model.uniqueColumn"
                label-field="fieldName"
                value-field="fieldName"
                multiple
                filterable
                :filter="otherfilterOption"
                :options="targetTableColumns"
              />
              <n-input v-else v-model:value="model.uniqueColumn"></n-input>
            </n-form-item>
          </n-gi>
        </n-grid>
        <n-grid class="border-y border-style">
          <n-gi :span="8">
            <common-title class="mt-24px" title="数据清洗类型"></common-title>
            <n-form-item label="数据清洗类型" path="isIncrement" class="pl-24px mt-14px" style="width: 80%">
              <n-select
                v-model:value="model.isIncrement"
                placeholder="请选择"
                :options="collectOptions"
                @update:value="isIncrementChange"
              />
            </n-form-item>
          </n-gi>
          <n-gi v-if="model.isIncrement === 1" :span="8">
            <common-title class="mt-24px" title="增量清洗字段"></common-title>
            <n-form-item label="增量字段" path="incColumn" class="pl-24px mt-14px" style="width: 80%">
              <n-select
                v-if="Type !== 4"
                v-model:value="model.incColumn"
                label-field="fieldName"
                value-field="fieldName"
                filterable
                :filter="otherfilterOption"
                :options="incColumnTableColumns"
              />
              <n-input v-else v-model:value="model.incColumn"></n-input>
            </n-form-item>
          </n-gi>
          <n-gi v-if="model.isIncrement === 1" :span="8">
            <common-title class="mt-24px" title="增量时间"></common-title>
            <n-form-item label="增量时间" path="incStartTime" class="pl-24px mt-14px" style="width: 80%">
              <n-date-picker
                v-model:formatted-value="model.incStartTime"
                value-format="yyyy-MM-dd HH:mm:ss"
                format="yyyy-MM-dd HH:mm:ss"
                placeholder="yyyy-MM-dd HH:mm:ss"
                type="datetime"
              />
            </n-form-item>
          </n-gi>
        </n-grid>
        <common-title v-if="Type !== 4" class="mt-24px" title="清洗字段配置"></common-title>
        <n-data-table
          v-if="Type !== 4"
          class="mt-14px mb-14px pl-24px pb-24px border-b border-style"
          :columns="filedColumns"
          :data="model.cleanColumns"
          :pagination="false"
          :scroll-x="1500"
        />
        <common-title v-if="Type === 4" title="表映射" class="mt-24px"></common-title>
        <n-grid v-if="Type === 4" x-gap="40" class="mt-24px pb-24px border-b border-style">
          <n-gi :span="6" class="border" style="border-color: #ebe7e7">
            <div class="h-40px font-medium text-center" style="line-height: 40px; background: #ecf6ff">源头数据</div>
            <div class="h-300px overflow-y-auto">
              <div
                v-for="(item, index) in originalTableList"
                :key="index"
                :class="{ checked: index === originalColumnIndex }"
                class="cursor-pointer table-item"
                @click="clickOriginalColumn(index)"
              >
                <div v-if="item.show !== 0" class="text-center pt-4px pb-4px border-rd-4px">
                  {{ item.tableName }}
                </div>
              </div>
            </div>
          </n-gi>
          <n-gi :span="6" class="border" style="border-color: #ebe7e7">
            <div class="h-40px font-medium text-center" style="line-height: 40px; background: #ecf6ff">目标数据</div>
            <div class="h-300px overflow-y-auto">
              <div
                v-for="(item, index) in targetTableList"
                :key="index"
                :class="{ checked: index === targetColumnIndex }"
                class="cursor-pointer table-item"
                @click="clickTargetColumn(index)"
                @dblclick="confirmMapping"
              >
                <div v-if="item.show !== 0" class="text-center pt-4px pb-4px border-rd-4px">
                  {{ item.tableName }}
                </div>
              </div>
            </div>
          </n-gi>
          <n-gi :span="3" class="flex-center">
            <n-button v-if="Type !== 3" type="primary" @click="autoMatch">自动映射</n-button>
          </n-gi>
          <n-gi :span="9" class="border" style="border-color: #ebe7e7">
            <div class="h-40px font-medium text-center" style="line-height: 40px; background: #ecf6ff">表映射</div>
            <div class="h-300px overflow-y-auto">
              <div
                v-for="(item, index) in mappingColumns"
                :key="index"
                :class="{ checked: index === mappingColumnIndex }"
                class="cursor-pointer table-item flex-y-center pt-4px pb-4px border-rd-4px"
                @click="clickMappingColumn(index)"
              >
                <div class="text-center" style="width: 50%">{{ item.originalColumn }}</div>
                <div class="text-center flex-1">{{ item.targetColumn }}</div>
                <div class="ml-10px mr-10px" @click="cancelMapping(index)">
                  <svg-icon v-if="Type !== 3" local-icon="indeterminate-circle-line" style="color: red"></svg-icon>
                </div>
              </div>
            </div>
          </n-gi>
        </n-grid>
        <common-title
          v-if="dbType === 'STARROCKS' && Type !== 4"
          title="数据分割符号"
          :is-change="true"
          :is-open="fengeIsOpen"
          class="mt-24px"
          @click="fengeIsOpen = !fengeIsOpen"
        ></common-title>
        <template v-if="dbType === 'STARROCKS' && Type !== 4">
          <div v-show="fengeIsOpen">
            <n-grid class="pl-24px mt-14px" x-gap="20">
              <n-form-item-gi :span="8" :show-feedback="false" label="行分割符" path="rowDelimiter">
                <n-input v-model:value="model.rowDelimiter" />
              </n-form-item-gi>
              <n-form-item-gi :span="8" :show-feedback="false" label="列分割符" path="columnSeparator">
                <n-input v-model:value="model.columnSeparator" />
              </n-form-item-gi>
            </n-grid>
          </div>
        </template>
        <common-title
          v-if="Type !== 4"
          title="容脏配置"
          :is-change="true"
          :is-open="rongzangIsOpen"
          class="mt-24px"
          @click="rongzangIsOpen = !rongzangIsOpen"
        ></common-title>
        <div v-show="rongzangIsOpen && Type !== 4">
          <n-switch
            v-model:value="switchType"
            :checked-value="1"
            :unchecked-value="0"
            :rail-style="railStyle"
            class="pl-24px mt-14px"
            @update:value="switchTypeChange"
          >
            <template #checked>容脏比例</template>
            <template #unchecked>容脏条数</template>
          </n-switch>
          <n-grid class="pl-24px mt-14px" x-gap="20">
            <n-form-item-gi v-if="switchType === 0" :span="8" :show-feedback="false" label="容脏条数" path="record">
              <n-input-number v-model:value="model.record" :min="0" :precision="0" :show-button="false" />
            </n-form-item-gi>
            <n-form-item-gi v-if="switchType === 1" :span="8" :show-feedback="false" label="容脏比例" path="percentage">
              <n-input-number
                v-model:value="model.percentage"
                :min="0"
                :max="100"
                :precision="0"
                :show-button="false"
              />
            </n-form-item-gi>
            <n-form-item-gi :span="8" :show-feedback="false" label="脏数据最大存储条数" path="maxNum">
              <n-input-number v-model:value="model.maxNum" :show-button="false" />
            </n-form-item-gi>
          </n-grid>
        </div>
        <common-title
          v-if="Type !== 4"
          title="配置额外参数"
          :is-change="true"
          :is-open="ewaiIsOpen"
          class="mt-24px"
          @click="ewaiIsOpen = !ewaiIsOpen"
        ></common-title>
        <div v-show="ewaiIsOpen && Type !== 4" class="mt-14px pl-24px">
          <div>任务开始前执行SQL</div>
          <m-statement-list
            ref="refPreStatements"
            :type="Type"
            :statement-list="model.preSql"
            @on-statement-list="onPreStatements"
          ></m-statement-list>
        </div>
        <div v-show="ewaiIsOpen && Type !== 4" class="pl-24px">
          <div>任务结束执行SQL</div>
          <m-statement-list
            ref="refPostStatements"
            :type="Type"
            :statement-list="model.postSql"
            @on-statement-list="onPostStatements"
          ></m-statement-list>
        </div>

        <common-title
          v-if="Type !== 4"
          title="高级任务参数"
          :is-change="true"
          :is-open="gaojiIsOpen"
          class="mt-24px"
          @click="gaojiIsOpen = !gaojiIsOpen"
        ></common-title>
        <div v-show="gaojiIsOpen && Type !== 4">
          <n-grid class="pl-24px mt-14px" x-gap="20">
            <n-form-item-gi :span="8" label="清洗分割主键" :label-width="108" path="splitPk">
              <n-input v-model:value="model.splitPk" placeholder="请输入清洗分割主键仅可以设置一个字段" />
            </n-form-item-gi>
            <n-form-item-gi :span="8" label="清洗渠道数" path="channel">
              <n-input-number v-model:value="model.channel" :show-button="false" class="w-100%" />
            </n-form-item-gi>
            <n-form-item-gi :span="8" label="批量提交数" path="batchSize">
              <n-input-number v-model:value="model.batchSize" :show-button="false" class="w-100%" />
            </n-form-item-gi>
            <n-form-item-gi :span="8" :show-feedback="false" label="JVM参数" :label-width="108" path="jvmParams">
              <n-input v-model:value="model.jvmParams" placeholder="如 -Xmx2G -Xms2G" />
            </n-form-item-gi>
          </n-grid>
        </div>
        <template v-if="Type === 4">
          <common-title class="mt-24px" title="任务列表"></common-title>
          <n-data-table
            class="mt-14px pl-24px"
            :columns="columns"
            :data="model.jobsInfo"
            :pagination="false"
            :scroll-x="2000"
          />
        </template>
      </n-form>
      <review-data-modal ref="reviewDataRef"></review-data-modal>
      <template v-if="Type !== 3" #action>
        <div class="flex-center w-full">
          <n-button type="primary" class="mr-16px min-w-100px" :loading="submitloading" @click="handleSubmit">
            确定
          </n-button>
        </div>
      </template>
    </n-card>
  </div>
</template>

<script lang="ts" setup>
import { h, watch, onMounted, reactive, ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import type { FormRules, DataTableColumns } from 'naive-ui';
import { NSelect, NInput, NCheckbox, NCascader, NDatePicker } from 'naive-ui';
import {
  getDblist,
  getTableList,
  getDbmetaColumns,
  getColumnsBySql,
  cleanJobSave,
  cleanJobDetail,
  getProjectList,
  datasourceDbInfo,
  offCollectionSaveAll
} from '@/service';
import { useRouterPush } from '@/composables';
import { getDictType } from '@/utils';
import standard from '@/service/api/standard';
// import OfflineCollectionAdd from '@/components/common/offline-collection-add.vue';
const { routerPush } = useRouterPush();
import mStatementList from '@/views/project-management/task/add/components/statementList.vue';
import CommonTitle from '@/components/common/common-title.vue';
import SvgIcon from '@/components/custom/svg-icon.vue';
import ReviewDataModal from '@/views/offline-collection/component/review-data-modal.vue';
const switchType = ref(0);
const Type = ref();
const railStyle = ({ focused, checked }: { focused: boolean; checked: boolean }) => {
  const style = {};
  if (checked) {
    style.background = '#40DE5A';
    if (focused) {
      style.boxShadow = '0 0 0 2px #40DE5A40';
    }
  } else {
    style.background = '#2080f0';
    if (focused) {
      style.boxShadow = '0 0 0 2px #2080f040';
    }
  }
  return style;
};
const rongzangIsOpen = ref(false);
const ewaiIsOpen = ref(false);
const gaojiIsOpen = ref(false);
const fengeIsOpen = ref(false);
const createFormData = () => ({
  code: null,
  name: '',
  description: '',
  originalDbKey: null,
  originalTable: null,
  targetDbKey: null,
  targetTable: null,
  uniqueColumn: Type.value === 4 ? '' : [],
  writeMode: '',
  isIncrement: null,
  incColumn: null,
  incStartTime: null,
  mappingColumns: [],
  cleanColumns: [],
  querySql: '',
  projectCode: null,
  record: 0,
  percentage: null,
  maxNum: 200,
  preSql: [],
  postSql: [],
  splitPk: '',
  channel: 1,
  batchSize: 1024,
  jvmParams: '',
  rowDelimiter: '',
  columnSeparator: '',
  jobsInfo: []
});
const model = reactive(createFormData());
const formDisabled = ref<boolean>(false);
const dbType = ref('');
const rules = reactive<FormRules>({
  name: [{ required: true, trigger: 'blur', message: '请输入任务名称' }],
  taskName: [{ required: true, trigger: 'blur', message: '请输入节点名称' }],
  originalDbKey: [{ required: true, trigger: 'blur', message: '请选择源头库' }],
  originalTable: [{ required: true, trigger: 'blur', message: '请选择源头表' }],
  targetDbKey: [{ required: true, trigger: 'blur', message: '请选择目标库' }],
  targetTable: [{ required: true, trigger: 'blur', message: '请选择目标表' }],
  querySql: [{ required: true, trigger: 'blur', message: '请输入sql' }],
  uniqueColumn: [
    {
      type: 'array',
      required: true,
      trigger: 'blur',
      message: `请选择更新字段`
    }
  ],
  writeMode: [{ required: true, trigger: 'blur', message: '请选择更新类型' }],
  isIncrement: [{ required: true, type: 'number', trigger: 'blur', message: '请选择清洗类型' }],
  incColumn: [{ required: true, trigger: 'blur', message: `请选择增量字段` }],
  incStartTime: [{ required: true, trigger: 'blur', message: '请选择增量时间' }],
  // description: [{ required: true, trigger: 'blur', message: '请输入任务描述' }],
  projectCode: [{ required: true, trigger: 'blur', message: '请选择所属项目' }]
});
const originalTableTypeSql = ref(false);
const collectOptions = [
  { label: '全量', value: 0 },
  { label: '增量', value: 1 }
];
const writeModeOptions = [
  { label: '更新', value: 'update' },
  { label: '删除并更新', value: 'replace' },
  { label: '不更新', value: 'insert' }
];
const originalColumnIndex = ref<string | number>(0);
const targetColumnIndex = ref<string | number>(0);
const mappingColumnIndex = ref(0);
const originalTableList = ref([]);
const originalList = ref([]);
const targetTableList = ref([]);
const targetTableColumns = ref([]);
// 增量字段需要过滤掉除时间类型外其他的数据类型
const originalTableColumns = ref([]);
const incColumnTableColumns = computed(() => {
  if (originalTableColumns.value.length) {
    return originalTableColumns.value.filter(
      item =>
        item.fieldTypeName.toUpperCase().indexOf('DATE') !== -1 ||
        item.fieldTypeName.toUpperCase().indexOf('TIME') !== -1
    );
  }
  return [];
});
const mappingColumns = ref([]);
const projectList = ref([]);
watch(
  [
    () => mappingColumns.value,
    () => model.projectCode,
    () => model.writeMode,
    () => model.uniqueColumn,
    () => model.isIncrement,
    () => model.incColumn,
    () => model.incStartTime
  ],
  (newValue, oldValue) => {
    console.log(newValue, 'newValue');

    if (Type.value === 4) {
      if (newValue[0].length) {
        const arr = newValue[0].map(async v => {
          const updateColumns = await getColumnsSelect(model.targetDbKey, v.targetColumn);
          console.log(updateColumns, 'updateColumns');
          const incColumns = await getColumnsSelect(model.originalDbKey, v.originalColumn);
          console.log(updateColumns, incColumns, 'updateColumns, incColumns');
          const uniqueColumnIndex = updateColumns.findIndex(v => v.fieldName === model.uniqueColumn);
          const incColumnIndex = incColumns.findIndex(v => v.fieldName === model.incColumn);
          return {
            originalDbKey: model.originalDbKey,
            originalTable: v.originalColumn,
            projectCode: model.projectCode,
            name: v.originalColumn,
            description: v.originalColumn,
            targetDbKey: model.targetDbKey,
            targetTable: v.targetColumn,
            writeMode: model.writeMode,
            uniqueColumn: model.uniqueColumn && uniqueColumnIndex !== -1 ? [model.uniqueColumn] : [],
            isIncrement: model.isIncrement,
            incColumn: incColumnIndex !== -1 ? model.incColumn : '',
            incStartTime: model.incStartTime,
            updateColumns,
            incColumns
          };
        });
        model.jobsInfo = [];
        arr.forEach((item, index) => {
          item.then(res => {
            model.jobsInfo[index] = { ...res };
          });
        });
      } else {
        model.jobsInfo = [];
      }
      console.log(model.jobsInfo, 'model.jobsInfo');

      if (newValue[1] && model.jobsInfo.length) {
        model.jobsInfo = model.jobsInfo.map(v => {
          return {
            ...v,
            projectCode: newValue[1]
          };
        });
      }
      if (newValue[2] && model.jobsInfo.length) {
        model.jobsInfo = model.jobsInfo.map(v => {
          return {
            ...v,
            writeMode: newValue[2],
            uniqueColumn: model.uniqueColumn ? [model.uniqueColumn] : []
          };
        });
      }
      if (newValue[3] && model.jobsInfo.length) {
        model.jobsInfo = model.jobsInfo.map(v => {
          return {
            ...v,
            uniqueColumn:
              v.writeMode === 'update' || v.writeMode === 'replace' ? (newValue[3] ? [newValue[3]] : []) : []
          };
        });
      }
      if (newValue[4] && model.jobsInfo.length) {
        model.jobsInfo = model.jobsInfo.map(v => {
          return {
            ...v,
            isIncrement: newValue[4],
            incColumn: model.incColumn,
            incStartTime: model.incStartTime
          };
        });
      }
      if (newValue[5] && model.jobsInfo.length) {
        model.jobsInfo = model.jobsInfo.map(v => {
          return {
            ...v,
            incColumn: v.isIncrement === 1 ? newValue[5] : ''
          };
        });
      }
      if (newValue[6] && model.jobsInfo.length) {
        model.jobsInfo = model.jobsInfo.map(v => {
          return {
            ...v,
            incStartTime: v.isIncrement === 1 ? newValue[6] : null
          };
        });
      }
    }
  },
  {
    immediate: true,
    deep: true
  }
);
const reviewDataRef = ref();
const form = ref();
const offlineCollectionAddRef = ref();
const route = useRoute();
const submitloading = ref<boolean>(false);
const platformpublicDictList = ref([]);
const orgpublicDictList = ref([]);
const createFieldColumns = (): DataTableColumns => {
  return [
    {
      title: '字段名称',
      key: 'columnName',
      width: 150
    },
    {
      title: '字段类型',
      key: 'fieldTypeName',
      width: 150
    },
    {
      title: '字段说明',
      key: 'remarks',
      width: 200
    },
    {
      title: '是否清洗',
      key: 'cleanFlag',
      width: 100,
      render: row => {
        return h(NCheckbox, {
          checked: row.cleanFlag === '1',
          disabled: Type.value === 3,
          'on-update:checked': (val: any) => {
            row.cleanFlag = val ? '1' : '0';
          }
        });
      }
    },
    {
      title: '清洗规则',
      key: 'cleanType',
      width: 230,
      render: row => {
        if (row.cleanFlag === '1') {
          return h(NSelect, {
            options: getDictType('clean_range_type'),
            value: row.cleanType,
            clearable: true,
            filterable: true,
            disabled: Type.value === 3,
            'on-update:value': (val: any) => {
              row.cleanType = val;
              row.sourceCode = '';
            }
          });
        }
        return '';
      }
    },
    {
      title: '清洗模版',
      key: 'sourceCode',
      width: 230,
      render: row => {
        if (row.cleanFlag === '1' && (row.cleanType === 'ab_standard2country' || row.cleanType === 'ab_org2country')) {
          return h(NSelect, {
            options: getDictType('template'),
            value: row.sourceCode,
            clearable: true,
            filterable: true,
            disabled: Type.value === 3,
            'on-update:value': (val: any) => {
              row.sourceCode = val;
            }
          });
        }
        return '';
      }
    },
    {
      title: '值域类别',
      key: 'rangeType',
      width: 230,
      render: row => {
        if (row.cleanFlag === '1') {
          return h(NSelect, {
            options: getDictType('range_type'),
            value: row.rangeType,
            clearable: true,
            filterable: true,
            disabled: Type.value === 3,
            'on-update:value': (val: any) => {
              row.rangeType = val;
              row.parentDictId = '';
            }
          });
        }
        return '';
      }
    },
    {
      title: '值域范围',
      key: 'parentDictId',
      width: 350,
      render: row => {
        if (row.cleanFlag === '1') {
          return h(NCascader, {
            options:
              row.rangeType === 'publicdict'
                ? row.cleanType === 'ab_standard2country'
                  ? platformpublicDictList.value
                  : orgpublicDictList.value
                : [{ label: '全部', value: '*' }],
            value: row.parentDictId,
            clearable: true,
            filterable: true,
            'show-path': false,
            disabled: Type.value === 3,
            'on-update:value': (val: any) => {
              row.parentDictId = val;
            }
          });
        }
        return '';
      }
    }
  ];
};
const filedColumns = reactive(createFieldColumns());

const createColumns = (): DataTableColumns => {
  return [
    {
      title: '源头库',
      key: 'originalDbKey',
      minWidth: 150,
      ellipsis: {
        tooltip: true
      }
    },
    {
      title: '源头表',
      key: 'originalTable',
      minWidth: 150,
      ellipsis: {
        tooltip: true
      }
    },
    {
      title: '所属项目',
      key: 'projectCode',
      width: 150,
      render: row => {
        return h(NSelect, {
          options: projectList.value,
          value: row.projectCode,
          'label-field': 'name',
          'value-field': 'code',
          'on-update:value': (val: any) => {
            row.projectCode = val;
          }
        });
      }
    },
    {
      title: '任务名称',
      key: 'name',
      width: 150,
      ellipsis: {
        tooltip: true
      },
      render: row => {
        return h(NInput, {
          value: row.name,
          'on-update:value': (val: any) => {
            row.name = val;
          }
        });
      }
    },
    {
      title: '任务名称',
      key: 'description',
      width: 150,
      ellipsis: {
        tooltip: true
      },
      render: row => {
        return h(NInput, {
          value: row.description,
          'on-update:value': (val: any) => {
            row.description = val;
          }
        });
      }
    },
    {
      title: '目标库',
      key: 'targetDbKey',
      minWidth: 150,
      ellipsis: {
        tooltip: true
      }
    },
    {
      title: '目标表',
      key: 'targetTable',
      minWidth: 150,
      ellipsis: {
        tooltip: true
      }
    },
    {
      title: '更新类型',
      key: 'writeMode',
      width: 300,
      render: row => {
        return h('div', { class: 'flex' }, [
          h(NSelect, {
            style: { width: '150px' },
            options: writeModeOptions,
            value: row.writeMode,
            'on-update:value': (val: any) => {
              row.writeMode = val;
              row.uniqueColumn = [];
            }
          }),
          row.writeMode === 'update' || row.writeMode === 'replace'
            ? h(NSelect, {
                style: { marginLeft: '20px', width: '150px' },
                value: row.uniqueColumn,
                'label-field': 'fieldName',
                'value-field': 'fieldName',
                multiple: true,
                filterable: true,
                filter: otherfilterOption,
                options: row.updateColumns,
                placeholder: '请选择更新字段',
                'on-update:value': (val: any) => {
                  row.uniqueColumn = val;
                }
              })
            : ''
        ]);
      }
    },
    {
      title: '清洗类型',
      key: 'isIncrement',
      width: 450,
      render: row => {
        return h('div', { class: 'flex' }, [
          h(NSelect, {
            style: { width: '150px' },
            options: collectOptions,
            value: row.isIncrement,
            'on-update:value': (val: any) => {
              row.isIncrement = val;
              row.incColumn = '';
              row.incStartTime = null;
            }
          }),
          row.isIncrement === 1
            ? h(NSelect, {
                style: { marginLeft: '20px', width: '150px' },
                value: row.incColumn,
                'label-field': 'fieldName',
                'value-field': 'fieldName',
                filterable: true,
                filter: otherfilterOption,
                options: row.incColumns,
                placeholder: '请选择增量字段',
                'on-update:value': (val: any) => {
                  row.incColumn = val;
                }
              })
            : '',
          row.isIncrement === 1
            ? h(NDatePicker, {
                style: { marginLeft: '20px', width: '150px' },
                placeholder: '请输入增量时间yyyy-MM-dd HH:mm:ss',
                'formatted-value': row.incStartTime,
                'value-format': 'yyyy-MM-dd HH:mm:ss',
                format: 'yyyy-MM-dd HH:mm:ss',
                type: 'datetime',
                'on-confirm': (val: any, formattedValue) => {
                  row.incStartTime = formattedValue;
                }
              })
            : ''
        ]);
      }
    }
  ];
};
const columns = reactive(createColumns());
function getplatfordict() {
  standard.getPlatformDictAllList().then(res => {
    console.log(res, 'platdictall');
    if (res.data && res.data.list && res.data.list.length) {
      platformpublicDictList.value = handleDictResult(res.data.list);
    }
  });
}
function getorgdict() {
  standard.getOrgDictAllList().then(res => {
    console.log(res, 'orgdictall');
    if (res.data && res.data.list && res.data.list.length) {
      orgpublicDictList.value = handleDictResult(res.data.list);
    }
  });
}
function handleDictResult(data: any) {
  const arr =
    data && data.length
      ? data.map((v: any) => {
          const obj = {
            ...v,
            label: v.dictName,
            value: v.dictId,
            children: v.children && v.children.length ? handleDictResult(v.children) : []
          };
          if (!obj.children.length) {
            delete obj.children;
          }
          return obj;
        })
      : [];

  return arr;
}
function switchTypeChange(val) {
  if (val === 1) {
    model.record = null;
    model.percentage = 0;
  } else {
    model.record = 0;
    model.percentage = null;
  }
}
function onPreStatements(a: any) {
  model.preSql = a;
}
function onPostStatements(a: any) {
  model.postSql = a;
}
function isIncrementChange() {
  model.incColumn = null;
  model.incStartTime = null;
}
function writeModeChange() {
  model.uniqueColumn = Type.value === 4 ? '' : [];
}
function reviewData() {
  if (!model.originalDbKey) {
    window.$message?.warning('请选择源头库');
    return;
  }
  if (!model.querySql) {
    window.$message?.warning('请输入源头表sql');
    return;
  }
  reviewDataRef.value.open({ dbKey: model.originalDbKey, sql: model.querySql });
}
async function updateOriginal(v: string) {
  cancelCollectionType();
  model.originalTable = null;
  originalTableColumns.value = [];
  model.cleanColumns = [];
  // 取消映射表并重新请求数据源表或者目标端表
  mappingColumns.value = [];
  resetTable();
  getOriTableRequest();
  if (Type.value === 4 && model.targetDbKey) {
    getTarTableRequest();
  }
}
function resetTable() {
  if (model.originalTable) {
    getDbmetaColumns({ dbKey: model.originalDbKey, tableName: model.originalTable }).then(res => {
      if (res.data && (res.data as any).length) {
        originalTableColumns.value = res.data as any;
      } else {
        originalTableColumns.value = [];
      }
    });
  }
  if (model.querySql) {
    getColumnsBySql({ dbKey: model.originalDbKey, sql: model.querySql }).then(res => {
      if (res.data && (res.data as any).length) {
        originalTableColumns.value = res.data as any;
      } else {
        originalTableColumns.value = [];
      }
    });
  }
  if (model.targetTable) {
    getDbmetaColumns({ dbKey: model.targetDbKey, tableName: model.targetTable }).then(res => {
      if (res.data && (res.data as any).length) {
        targetTableColumns.value = res.data as any;
      } else {
        targetTableColumns.value = [];
      }
    });
  }
}
// 当数据源或者数据源视图改变时重置全量增量相关配置
function cancelCollectionType() {
  model.isIncrement = null;
  model.incColumn = null;
  model.incStartTime = null;
}
async function confirmOriginalTable() {
  mappingColumns.value = [];
  cancelCollectionType();
  await initOriginalTable();
  model.cleanColumns = originalTableColumns.value.length
    ? originalTableColumns.value.map((v: any, index: number) => {
        return {
          // columnType: v.fieldType,
          fieldTypeName: v.fieldTypeName,
          columnName: v.fieldName,
          remarks: v.remarks,
          cleanFlag: '',
          cleanType: '',
          sourceCode: '',
          rangeType: '',
          parentDictId: '',
          columnIndex: index.toString()
        };
      })
    : [];
}
async function updateTarget(v: string) {
  model.targetTable = null;
  targetTableColumns.value = [];
  mappingColumns.value = [];
  resetTable();
  model.writeMode = '';
  model.uniqueColumn = Type.value === 4 ? '' : [];
  getTarTableRequest();
  if (Type.value === 4 && model.originalDbKey) {
    getOriTableRequest();
  }
  getDatasourceDbInfo();
}
async function getDatasourceDbInfo() {
  const { data } = await datasourceDbInfo({ dbKey: model.targetDbKey });
  dbType.value = data ? data[0].dbType : '';
  if (dbType.value !== 'STARROCKS') {
    model.rowDelimiter = '';
    model.columnSeparator = '';
  } else {
    model.rowDelimiter = `\\\\x02`;
    model.columnSeparator = '\\\\x01';
  }
}
function confirmTargetTable() {
  model.uniqueColumn = [];
  mappingColumns.value = [];
  resetTable();
}
function filterOption(input: any, option: any) {
  return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
}
function otherfilterOption(input: any, option: any) {
  return option.fieldName.toLowerCase().indexOf(input.toLowerCase()) >= 0;
}
function originalTableTypeChange() {
  originalTableTypeSql.value = !originalTableTypeSql.value;
  model.originalTable = null;
  model.querySql = '';
  originalTableColumns.value = [];
  confirmOriginalTable();
}
function clickOriginalColumn(index: number) {
  originalColumnIndex.value = index;
}
function clickTargetColumn(index: number) {
  targetColumnIndex.value = index;
}
function clickMappingColumn(index: number) {
  mappingColumnIndex.value = index;
}
function confirmMapping() {
  if (Type.value !== 3) {
    console.log('双击目标表字段');
    if (originalColumnIndex.value === '') {
      window.$message?.warning('请选择源头数据');
      return;
    }
    if (targetColumnIndex.value === '') {
      window.$message?.warning('请选择目标数据');
      return;
    }
    const mapping = {
      originalColumn: originalTableList.value[originalColumnIndex.value].tableName,
      targetColumn: targetTableList.value[targetColumnIndex.value].tableName,
      originalColumnIndex: originalColumnIndex.value,
      targetColumnIndex: targetColumnIndex.value
    };
    originalTableList.value[originalColumnIndex.value].show = 0;
    targetTableList.value[targetColumnIndex.value].show = 0;
    originalColumnIndex.value = '';
    targetColumnIndex.value = '';
    mappingColumns.value.push(mapping);
  }
}
function cancelMapping(index: number) {
  console.log(index);
  const mapping = mappingColumns.value[index];
  const originalindex = originalTableList.value.findIndex(v => v.tableName === mapping.originalColumn);
  const targetindex = targetTableList.value.findIndex(v => v.tableName === mapping.targetColumn);
  originalTableList.value[originalindex].show = 1;
  targetTableList.value[targetindex].show = 1;
  mappingColumns.value.splice(index, 1);
}
async function autoMatch() {
  if (mappingColumns.value.length) {
    const arr = [...mappingColumns.value];
    arr.forEach((v, i) => {
      const originalindex = originalTableList.value.findIndex(org => org.tableName === v.originalColumn);
      const targetindex = targetTableList.value.findIndex(tar => tar.tableName === v.targetColumn);
      originalTableList.value[originalindex].show = 1;
      targetTableList.value[targetindex].show = 1;
    });
    mappingColumns.value = [];
  }
  await handleAuto();
}
function handleAuto() {
  let count = 0;
  originalTableList.value.forEach((original, originalIndex) => {
    targetTableList.value.forEach((target, targetIndex) => {
      if (original.tableName.toLowerCase() === target.tableName.toLowerCase()) {
        const mapping = {
          originalColumn: original.tableName,
          targetColumn: target.tableName,
          originalColumnIndex: originalIndex,
          targetColumnIndex: targetIndex
        };
        original.show = 0;
        target.show = 0;
        if (originalColumnIndex.value === originalIndex) {
          originalColumnIndex.value = '';
        }
        if (targetColumnIndex.value === targetIndex) {
          targetColumnIndex.value = '';
        }
        mappingColumns.value.push(mapping);
        count += 1;
      }
    });
  });
  if (count === 0) {
    window.$message?.warning('无匹配字段请手动匹配');
  }
}
function handleSubmit() {
  if (Type.value !== 4) {
    form.value?.validate((errors: any) => {
      if (!errors) {
        submitloading.value = true;
        const params = {
          ...model,
          preSql: model.preSql && model.preSql.length ? model.preSql : null,
          postSql: model.postSql && model.postSql.length ? model.postSql : null,
          rowDelimiter: model.rowDelimiter ? model.rowDelimiter.replace(/\\\\/g, '\\') : '',
          columnSeparator: model.columnSeparator ? model.columnSeparator.replace(/\\\\/g, '\\') : '',
          uniqueColumn: model.uniqueColumn.join(',')
        };
        cleanJobSave(params)
          .then(res => {
            if (!res.error) {
              window.$message?.success('提交成功');
              close();
            }
          })
          .finally(() => {
            submitloading.value = false;
          });
      }
    });
  } else {
    if (!model.jobsInfo.length) {
      window.$message?.warning('任务列表不能为空');
      return;
    }
    let flag = true;
    for (let i = 0; i < model.jobsInfo.length; i++) {
      const item = model.jobsInfo[i];
      if (!item.projectCode) {
        flag = false;
        window.$message?.warning(`任务列表第${i}行的所属项目不能为空`);
        break;
      }
      if (!item.name) {
        flag = false;
        window.$message?.warning(`任务列表第${i}行的任务名称不能为空`);
        break;
      }
      if (!item.description) {
        flag = false;
        window.$message?.warning(`任务列表第${i}行的任务描述不能为空`);
        break;
      }
      if (!item.writeMode) {
        flag = false;
        window.$message?.warning(`任务列表第${i}行的更新类型不能为空`);
        break;
      }
      if ((item.writeMode === 'update' || item.writeMode === 'replace') && !item.uniqueColumn) {
        flag = false;
        window.$message?.warning(`任务列表第${i}行的更新字段不能为空`);
        break;
      }
      if (!item.isIncrement && item.isIncrement !== 0) {
        flag = false;
        window.$message?.warning(`任务列表第${i}行的清洗类型不能为空`);
        break;
      }
      if (item.isIncrement === 1 && !item.incColumn) {
        flag = false;
        window.$message?.warning(`任务列表第${i}行的增量字段不能为空`);
        break;
      }
      if (item.isIncrement === 1 && !item.incStartTime) {
        flag = false;
        window.$message?.warning(`任务列表第${i}行的增量时间不能为空`);
        break;
      }
    }
    if (flag) {
      submitloading.value = true;
      const arr = model.jobsInfo.map(v => {
        return {
          ...v,
          uniqueColumn: v.uniqueColumn.join(',')
        };
      });
      offCollectionSaveAll({ jobsInfo: arr })
        .then(res => {
          if (!res.error) {
            window.$message?.success('批量创建成功');
            close();
          }
        })
        .finally(() => {
          submitloading.value = false;
        });
    }
  }
}
function close() {
  Object.keys(model).forEach(key => {
    delete model[key];
  });
  cleanColumns();
  routerPush({ name: 'data-cleaning' });
}
function cleanColumns() {
  originalTableColumns.value = [];
  targetTableColumns.value = [];
  mappingColumns.value = [];
}
async function init() {
  const { data } = await getDblist();
  if (data) {
    originalList.value = (data as any)?.map((v: string) => {
      return { label: v, value: v };
    });
  }
}
function getOriTableRequest() {
  getTableList({ dbKey: model.originalDbKey }).then(res => {
    if (res.data && res.data.length) {
      originalTableList.value = (res.data as any).map((item: any) => {
        return { label: item.tableName, value: item.tableName, ...item };
      });
      if (Type.value === 4) {
        if (mappingColumns.value.length > 0) {
          mappingColumns.value.forEach(v => {
            const originalindex = originalTableList.value.findIndex(orginal => orginal.tableName === v.originalColumn);
            originalTableList.value[originalindex].show = 0;
          });
        }
      }
    } else {
      originalTableList.value = [];
    }
  });
}
function getTarTableRequest() {
  getTableList({ dbKey: model.targetDbKey }).then(res => {
    if (res.data && res.data.length) {
      targetTableList.value = (res.data as any).map((item: any) => {
        return { label: item.tableName, value: item.tableName, ...item };
      });
      if (Type.value === 4) {
        if (mappingColumns.value.length > 0) {
          mappingColumns.value.forEach(v => {
            targetTableList.value[v.targetColumnIndex].show = 0;
          });
        }
      }
    } else {
      targetTableList.value = [];
    }
  });
}
async function initOriginalTable() {
  let arr = [];
  if (originalTableTypeSql.value) {
    const { data } = await getColumnsBySql({ dbKey: model.originalDbKey, sql: model.querySql });
    arr = data as any[];
  } else {
    const { data } = await getDbmetaColumns({ dbKey: model.originalDbKey, tableName: model.originalTable });
    arr = data as any[];
  }
  // getDbmetaColumns({ dbKey: model.originalDbKey, tableName: model.originalTable }).then(res => {
  if (arr && (arr as any).length) {
    originalTableColumns.value = arr as any;
  } else {
    originalTableColumns.value = [];
  }
  // });
}
async function getColumnsSelect(dbKey: any, tableName: any) {
  let arr = [];
  const { data } = await getDbmetaColumns({ dbKey, tableName });
  arr = data && (data as any).length ? (data as any) : [];
  return arr;
}
function initTargetTable() {
  getDbmetaColumns({ dbKey: model.targetDbKey, tableName: model.targetTable }).then(res => {
    if (res.data && (res.data as any).length) {
      targetTableColumns.value = res.data as any;
    } else {
      targetTableColumns.value = [];
    }
  });
}
async function edit() {
  let obj = {};
  const res = await cleanJobDetail(model.code);
  obj = res.data ? { ...res.data } : {};
  obj.cleanColumns = obj.cleanColumns ? JSON.parse(obj.cleanColumns) : [];
  // mappingColumns.value = JSON.parse(data.mappingColumns);
  Object.assign(model, obj);
  if (model.targetDbKey) {
    const { data } = await datasourceDbInfo({ dbKey: model.targetDbKey });
    dbType.value = data ? data[0].dbType : '';
  }
  console.log(model, 'model');
  switchType.value = !model.record && model.record !== 0 && (model.percentage || model.percentage === 0) ? 1 : 0;
  model.preSql = model.preSql && model.preSql.length ? JSON.parse(model.preSql) : [];
  model.postSql = model.postSql && model.postSql.length ? JSON.parse(model.postSql) : [];
  model.rowDelimiter = model.rowDelimiter ? model.rowDelimiter.replace(/\\/g, '\\\\') : '';
  model.columnSeparator = model.columnSeparator ? model.columnSeparator.replace(/\\/g, '\\\\') : '';
  model.uniqueColumn = model.uniqueColumn ? model.uniqueColumn.split(',') : [];
  originalTableTypeSql.value = model.originalTable ? false : Boolean(model.querySql);
  // model.cleanColumns = model.cleanColumns ? JSON.parse(model.cleanColumns) : [];
  console.log(model.cleanColumns, 'model.cleanColumns');
  getOriTableRequest();
  getTarTableRequest();
  initOriginalTable();
  initTargetTable();
}

async function getProjectLists() {
  const { data } = await getProjectList();
  projectList.value = data && data.list ? data.list : [];
}
onMounted(() => {
  const type = route.query.type ? Number(route.query.type) : 1;
  Type.value = type;
  formDisabled.value = type === 3;
  model.code = route.query.code ? route.query.code : null;
  init();
  getplatfordict();
  getorgdict();
  getProjectLists();
  if (type === 2 || type === 3) {
    edit();
  }
});
</script>

<style lang="scss" scoped>
:deep(.n-card__content) {
  height: 100% !important;
  overflow: auto;
}
</style>
