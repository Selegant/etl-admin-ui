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
        :rules="Type === 3 ? {} : rules"
        :disabled="Type === 3"
        label-placement="left"
        require-mark-placement="right-hanging"
        size="medium"
      >
        <n-grid class="pl-24px mt-14px border-style border-b" x-gap="20">
          <n-form-item-gi :span="8" label="数据集名称" path="datatableCaptioon">
            <n-input v-model:value="model.datatableCaptioon" />
          </n-form-item-gi>
          <n-form-item-gi :span="8" label="数据集表名称" path="datatableName">
            <n-input v-model:value="model.datatableName" />
          </n-form-item-gi>
          <n-form-item-gi :span="8" label="一级类目代码" path="firstLevelCode">
            <n-input v-model:value="model.firstLevelCode" />
          </n-form-item-gi>
          <n-form-item-gi :span="8" label="二级类目代码" path="secondLevelCode">
            <n-input v-model:value="model.secondLevelCode" />
          </n-form-item-gi>
          <n-form-item-gi :span="8" label="三级类目代码" path="thirdLevelCode">
            <n-input v-model:value="model.thirdLevelCode" />
          </n-form-item-gi>
          <n-form-item-gi :span="8" label="模版类型代码" path="businessCode">
            <n-input v-model:value="model.businessCode" />
          </n-form-item-gi>
          <n-form-item-gi :span="8" label="HL7通用阀" path="hl7area">
            <n-input v-model:value="model.hl7area" />
          </n-form-item-gi>
          <n-form-item-gi :span="8" label="HL7模型" path="hl7modal">
            <n-input v-model:value="model.hl7modal" />
          </n-form-item-gi>
        </n-grid>
        <div class="flex">
          <div class="mt-24px flex-1">
            <common-title :title="Type === 3 ? '数据元' : '已选择数据元'"></common-title>
            <n-space class="mt-14px" :class="Type === 3 ? 'pl-24px' : ''">
              <n-input v-model:value="queryKey" placeholder="输入关键字查询" />
              <n-button class="mb-14px" strong secondary type="primary" @click="getLeftData(1)">
                <n-icon size="16"><svg-icon local-icon="search"></svg-icon></n-icon>
                查询
              </n-button>
              <n-button class="mb-14px" strong secondary type="tertiary" @click="resetLeftClick">
                <n-icon size="16"><svg-icon local-icon="delete"></svg-icon></n-icon>
                重置
              </n-button>
            </n-space>
            <n-data-table
              v-model:checked-row-keys="checkedRowKeys"
              :class="Type === 3 ? 'pl-24px' : ''"
              :loading="tableLoading"
              remote
              :max-height="250"
              :columns="columns"
              :data="model.metaList"
              :pagination="pagination"
              :row-class-name="tableRowClassName"
              :row-props="rowProps"
              :row-key="row => row.incrementId"
            />
          </div>
          <div v-if="Type !== 3" class="ml-10px mr-10px flex-col">
            <div class="h-112px"></div>
            <div class="flex-col-center flex-1">
              <svg-icon local-icon="right" class="w-40px cursor-pointer" @click="insertUnSelect" />
              <svg-icon local-icon="left" class="w-40px mt-15px cursor-pointer" @click="insertSelect" />
            </div>
          </div>
          <div v-if="Type !== 3" class="mt-24px flex-1">
            <common-title title="未选择数据元"></common-title>
            <n-space class="mt-14px">
              <n-input v-model:value="rightQueryKey" placeholder="输入关键字查询" />
              <n-button class="mb-14px" strong secondary type="primary" @click="getRightData(1)">
                <n-icon size="16"><svg-icon local-icon="search"></svg-icon></n-icon>
                查询
              </n-button>
              <n-button class="mb-14px" strong secondary type="tertiary" @click="resetRightClick">
                <n-icon size="16"><svg-icon local-icon="delete"></svg-icon></n-icon>
                重置
              </n-button>
            </n-space>
            <n-data-table
              v-model:checked-row-keys="checkedRowKeysTwo"
              :loading="tabletwoLoading"
              remote
              :max-height="250"
              :columns="columns"
              :data="rightTableList"
              :row-key="row => row.incrementId"
              :pagination="rightpagination"
              :row-class-name="tabletwoRowClassName"
              :row-props="rowPropstwo"
            />
          </div>
        </div>
      </n-form>
      <template v-if="Type !== 3" #action>
        <div class="flex-center w-full">
          <n-button type="primary" class="mr-16px min-w-100px" :loading="submitloading" @click="handleSumbit">
            确定
          </n-button>
        </div>
      </template>
    </n-card>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import type { FormRules, DataTableColumns, DataTableRowKey } from 'naive-ui';
import {
  standTableInfoDetail,
  standTableInfoSave,
  standTableInfoMateMeta,
  standTableInfoNotMateMeta,
  countryTableInfoDetail,
  countryTableInfoSave,
  countryTableInfoMateMeta,
  countryTableInfoNotMateMeta
} from '@/service';
import { useRouterPush } from '@/composables';
const { routerBack } = useRouterPush();
const route = useRoute();
const activeName = ref('1');
const Type = ref();
const form = ref();
const queryKey = ref('');
const rightQueryKey = ref('');
const tableLoading = ref(false);
const tabletwoLoading = ref(false);
const submitloading = ref(false);
// const leftTableList = ref([]);
const originMetaList = ref([]);
const rightTableList = ref([]);
const checkedRowKeys = ref([]);
const checkedRowKeysTwo = ref([]);
const pagination = reactive({
  page: 1,
  pageSize: 10,
  itemCount: 0,
  showSizePicker: true,
  pageSizes: [10, 20, 50],
  onChange: (page: number) => {
    pagination.page = page;
    // 获取左侧列表
    getLeftData();
  },
  onUpdatePageSize: (pageSize: number) => {
    pagination.pageSize = pageSize;
    pagination.page = 1;
    // 获取左侧列表
    getLeftData();
  }
});
const rightpagination = reactive({
  page: 1,
  pageSize: 10,
  itemCount: 0,
  showSizePicker: true,
  pageSizes: [10, 20, 50],
  onChange: (page: number) => {
    rightpagination.page = page;
    // 获取左侧列表
    getRightData();
  },
  onUpdatePageSize: (pageSize: number) => {
    rightpagination.pageSize = pageSize;
    rightpagination.page = 1;
    // 获取右侧列表
    getRightData();
  }
});
const createFormData = () => ({
  datatableCaptioon: '',
  datatableName: '',
  firstLevelCode: '',
  secondLevelCode: '',
  thirdLevelCode: '',
  businessCode: '',
  hl7area: '',
  hl7modal: '',
  metaList: []
});
const model = reactive(createFormData());
const rules = reactive<FormRules>({
  datatableCaptioon: [{ required: true, trigger: 'blur', message: '请输入数据集名称' }],
  datatableName: [{ required: true, trigger: 'blur', message: '请输入数据集表名称' }]
});

const selectRow = ref({});
const selectRowtwo = ref({});
// watch(
//   () => model.datatableName,
//   newVal => {
//     model.metaList = [];
//     rightTableList.value = [];
//     checkedRowKeys.value = [];
//     checkedRowKeysTwo.value = [];
//     selectRowtwo.value = {};
//     selectRow.value = {};
//     if (newVal) {
//       getLeftData(1);
//       if (Type.value !== 3) {
//         getRightData(1);
//       }
//     }
//   },
//   {
//     immediate: true
//   }
// );
function handleSumbit() {
  form.value?.validate(async (errors: any) => {
    if (!errors) {
      if (!originMetaList.value.length) {
        window.$message?.warning('请选择数据元');
        return;
      }
      const params = {
        ...model,
        metaList: [...originMetaList.value]
      };
      submitloading.value = true;
      const { error } = await (activeName.value === '1' ? standTableInfoSave : countryTableInfoSave)(params);
      submitloading.value = false;
      if (!error) {
        window.$message?.success('保存成功');
        close();
      }
    }
  });
}
function tableRowClassName(row) {
  if (row.incrementId && row.incrementId === selectRow.value.incrementId) {
    return 'table-row-select';
  }
  return '';
}
function tabletwoRowClassName(row) {
  if (row.incrementId && row.incrementId === selectRowtwo.value.incrementId) {
    return 'table-row-select';
  }
  return '';
}
function rowProps(row: any) {
  return {
    style: 'cursor: pointer;',
    onClick: e => {
      e.stopPropagation();
      if (Type.value !== 3) {
        selectRow.value = row;
        const index = checkedRowKeys.value.findIndex(v => v === row.incrementId);
        if (index !== -1) {
          checkedRowKeys.value.splice(index, 1);
        } else {
          checkedRowKeys.value.push(row.incrementId);
        }
      }
    }
  };
}
function rowPropstwo(row: any) {
  return {
    style: 'cursor: pointer;',
    onClick: e => {
      e.stopPropagation();
      if (Type.value !== 3) {
        selectRowtwo.value = row;
        const index = checkedRowKeysTwo.value.findIndex(v => v === row.incrementId);
        if (index !== -1) {
          checkedRowKeysTwo.value.splice(index, 1);
        } else {
          checkedRowKeysTwo.value.push(row.incrementId);
        }
      }
    }
  };
}
function insertUnSelect() {
  if (checkedRowKeys.value.length === 0) {
    window.$message?.error('请勾选已选择数据元');
  } else {
    checkedRowKeys.value.forEach(v => {
      const index = model.metaList.findIndex(q => q.incrementId === v);
      const originIndex = originMetaList.value.findIndex(q => q.incrementId === v);
      if (index !== -1) {
        rightTableList.value.push(model.metaList[index]);
        model.metaList.splice(index, 1);
        if (originIndex !== -1) {
          originMetaList.value.splice(originIndex, 1);
        }
      }
    });
    getLeftData();
    getRightData();
  }
}
async function insertSelect() {
  if (checkedRowKeysTwo.value.length === 0) {
    window.$message?.error('请勾选未选择数据元');
  } else {
    checkedRowKeysTwo.value.forEach(v => {
      const index = rightTableList.value.findIndex(q => q.incrementId === v);
      if (index !== -1) {
        model.metaList.push(rightTableList.value[index]);
        if (originMetaList.value.findIndex(q => q.incrementId === v) === -1) {
          originMetaList.value.push(rightTableList.value[index]);
        }
        rightTableList.value.splice(index, 1);
      }
    });
    getLeftData();
    getRightData();
  }

  // const params = {
  //   datatableName: model.datatableName
  // };
  // const { error } = await standTableInfoSaveMeta();
}
function close() {
  Object.keys(model).forEach(key => {
    delete model[key];
  });
  routerBack();
}
async function getLeftData(arg?: number) {
  if (arg === 1) {
    pagination.page = 1;
  }
  selectRow.value = {};
  checkedRowKeys.value = [];
  tableLoading.value = true;
  console.log(originMetaList.value, 'originMetaList.value');
  const params = {
    page: pagination.page,
    size: pagination.pageSize,
    queryKey: queryKey.value,
    metaList: [...originMetaList.value]
  };
  const { data } = await (activeName.value === '1' ? standTableInfoMateMeta : countryTableInfoMateMeta)(params);
  tableLoading.value = false;
  pagination.itemCount = data ? data.total : 0;
  model.metaList = data && data.list ? data.list : [];
  // if (!queryKey.value) {
  //   originMetaList.value = [...model.metaList];
  // }
}
function resetLeftClick() {
  queryKey.value = '';
  getLeftData(1);
}
async function getRightData(arg?: number) {
  if (arg === 1) {
    rightpagination.page = 1;
  }
  selectRowtwo.value = {};
  checkedRowKeysTwo.value = [];
  tabletwoLoading.value = true;
  const params = {
    page: rightpagination.page,
    size: rightpagination.pageSize,
    queryKey: rightQueryKey.value,
    metaList: [...originMetaList.value]
  };
  const { data } = await (activeName.value === '1' ? standTableInfoNotMateMeta : countryTableInfoNotMateMeta)(params);
  tabletwoLoading.value = false;
  rightpagination.itemCount = data ? data.total : 0;
  rightTableList.value = data && data.list ? data.list : [];
}
function resetRightClick() {
  rightQueryKey.value = '';
  getRightData(1);
}
const recordObj = ref({});
async function edit() {
  const { error, data } = await (activeName.value === '1' ? standTableInfoDetail : countryTableInfoDetail)({
    incrementId: model.incrementId
  });
  if (!error) {
    data.metaList = JSON.parse(data.metaList);
    Object.assign(model, data);
    originMetaList.value = [...model.metaList];
    getLeftData();
    if (Type.value !== 3) {
      getRightData();
    }
  }
}
let columns: any = [];
onMounted(() => {
  const type = route.query.type ? Number(route.query.type) : 1;
  model.incrementId = route.query.incrementId ? Number(route.query.incrementId) : null;
  // const currentItem = route.query.record ? JSON.parse(route.query.record as string) : {};
  activeName.value = route.query.activeName ? route.query.activeName : '1';
  Type.value = type;
  const createColumns = (): DataTableColumns => {
    const columnsList = [
      {
        title: '序号',
        key: 'key',
        width: 60,
        render: (_, index) => {
          return `${index + 1}`;
        }
      },
      {
        title: '中文名',
        key: 'metadataCaptioon',
        ellipsis: {
          tooltip: true
        }
      },
      {
        title: '英文名',
        key: 'fieldName',
        ellipsis: {
          tooltip: true
        }
      },
      {
        title: '脱敏规则',
        key: 'ruleCaptioon',
        ellipsis: {
          tooltip: true
        }
      },
      {
        title: '值域',
        key: 'rangeSourceCode',
        ellipsis: {
          tooltip: true
        }
      }
    ];
    console.log(Type.value, 'Type.value');

    if (Type.value !== 3) {
      return [
        {
          type: 'selection',
          fixed: 'left'
        },
        ...columnsList
      ];
    }
    return columnsList;
  };
  columns = createColumns();
  if (Type.value === 3 || Type.value === 2) {
    edit();
  } else {
    getLeftData();
    getRightData();
  }
});
</script>

<style lang="scss" scoped>
:deep(.n-card__content) {
  overflow: auto;
}
</style>
