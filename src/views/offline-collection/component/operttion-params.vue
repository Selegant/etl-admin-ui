<template>
  <n-modal
    v-model:show="visible"
    :show-icon="false"
    :mask-closable="false"
    preset="dialog"
    :title="title"
    :on-close="close"
    style="width: 60%"
  >
    <n-spin :show="logshow">
      <n-space v-if="title === '日志' || title === '告警详细日志'" align="center" class="mb-14px">
        <span>日志等级：</span>
        <n-select v-model:value="logLevel" :options="logLevelOptions" class="w-200px" @update:value="updateLogLevel" />
      </n-space>
      <div class="h-500px">
        <ace-editor :content="content" :ace-config="aceConfig"></ace-editor>
      </div>
    </n-spin>
    <template #action>
      <div class="flex-center w-full">
        <n-button type="primary" class="mr-16px min-w-100px" @click="updateLogLevel">刷新</n-button>
        <n-button strong secondary type="primary" class="mr-16px min-w-100px" @click="downloadLog">下载</n-button>
        <n-button ghost class="min-w-100px" @click="close">取消</n-button>
      </div>
    </template>
  </n-modal>
</template>
<script lang="ts" setup>
import { ref, reactive } from 'vue';
import { useRoute } from 'vue-router';
import dayjs from 'dayjs';
import { offCollectionLogs, orchestrationLogs, downloadFile, getExecuteParams } from '@/service';
import AceEditor from '@/components/common/ace-editor.vue';
const route = useRoute();

interface Emits {
  (e: 'close'): void;
}
const aceConfig = reactive({
  lang: 'html',
  theme: 'monokai',
  readOnly: false,
  options: {
    enableBasicAutocompletion: true,
    enableSnippets: true,
    enableLiveAutocompletion: true,
    tabSize: 2,
    showPrintMargin: false,
    fontSize: 13
  }
});
const emit = defineEmits<Emits>();
const content = ref('');
const title = ref('');
const logshow = ref(false);
const visible = ref<boolean>(false);
const submitloading = ref<boolean>(false);
const logLevel = ref('null');
const currentItem = ref({});
const logLevelOptions = [
  { label: '所有', value: 'null' },
  { label: 'INFO', value: 'INFO' },
  { label: 'ERROR', value: 'ERROR' },
  { label: 'WARN', value: 'WARN' },
  { label: 'DEBUG', value: 'DEBUG' }
];
function updateLogLevel() {
  content.value = '';
  getOffCollectionLog();
}
async function getOffCollectionLog() {
  const queryParams = {
    from: '0',
    size: '10000',
    params: {
      traceId: currentItem.value.instanceId,
      serverName: null,
      className: null,
      logLevel: logLevel.value === 'null' ? null : logLevel.value,
      env: null,
      appName: null
    },
    projectCode: route.query.projectCode || currentItem.value.projectCode,
    clientStartDate:
      currentItem.value.actualTriggerTime || currentItem.value.createDate
        ? dayjs(currentItem.value.actualTriggerTime || currentItem.value.createDate)
            .add(-1, 'day')
            .format('YYYY-MM-DD HH:mm:ss')
        : '',
    clientEndDate:
      currentItem.value.finishedTime || currentItem.value.updateDate
        ? dayjs(currentItem.value.finishedTime || currentItem.value.updateDate)
            .add(1, 'day')
            .format('YYYY-MM-DD HH:mm:ss')
        : ''
  };
  console.log(route.name, 'routename');
  let result = {};
  logshow.value = true;
  if (
    route.name === 'offline-collection_operation-records' ||
    route.name === 'warning_warning-list' ||
    route.name === 'data-comparison_operation-records'
  ) {
    const { data } = await offCollectionLogs(queryParams);
    result = data ? { ...data } : {};
  }
  if (route.name === 'project-management_task_operation-records' || route.name === 'data-cleaning_operation-records') {
    const { data } = await orchestrationLogs(queryParams);
    result = data ? { ...data } : {};
  }
  logshow.value = false;
  content.value = result.context ? result.context : '';
}
async function loadExecuteParams() {
	const queryParams = {
		from: '0',
		size: '10000',
		params: {
			traceId: currentItem.value.instanceId,
			serverName: null,
			className: null,
			logLevel: logLevel.value === 'null' ? null : logLevel.value,
			env: null,
			appName: null
		},
		projectCode: route.query.projectCode || currentItem.value.projectCode,
		clientStartDate:
			currentItem.value.actualTriggerTime || currentItem.value.createDate
				? dayjs(currentItem.value.actualTriggerTime || currentItem.value.createDate)
					.add(-1, 'day')
					.format('YYYY-MM-DD HH:mm:ss')
				: '',
		clientEndDate:
			currentItem.value.finishedTime || currentItem.value.updateDate
				? dayjs(currentItem.value.finishedTime || currentItem.value.updateDate)
					.add(1, 'day')
					.format('YYYY-MM-DD HH:mm:ss')
				: ''
	};
	console.log(route.name, 'routename');
	let result = {};
	logshow.value = true;
	if (
		route.name === 'offline-collection_operation-records' ||
		route.name === 'warning_warning-list' ||
		route.name === 'data-comparison_operation-records'
	) {
		const { data } = await getExecuteParams(queryParams);
		result = data ? { ...data } : {};
	}
	if (route.name === 'project-management_task_operation-records' || route.name === 'data-cleaning_operation-records') {
		const { data } = await orchestrationLogs(queryParams);
		result = data ? { ...data } : {};
	}
	logshow.value = false;
	content.value = result.context ? result.context : '';
}
function downloadLog() {
  const queryParams = {
    from: '0',
    size: '10000',
    params: {
      traceId: currentItem.value.instanceId,
      serverName: null,
      className: null,
      logLevel: logLevel.value === 'null' ? null : logLevel.value,
      env: null,
      appName: null
    },
    projectCode: route.query.projectCode || currentItem.value.projectCode,
    clientStartDate:
      currentItem.value.actualTriggerTime || currentItem.value.createDate
        ? dayjs(currentItem.value.actualTriggerTime || currentItem.value.createDate)
            .add(-1, 'day')
            .format('YYYY-MM-DD HH:mm:ss')
        : '',
    clientEndDate:
      currentItem.value.finishedTime || currentItem.value.updateDate
        ? dayjs(currentItem.value.finishedTime || currentItem.value.updateDate)
            .add(1, 'day')
            .format('YYYY-MM-DD HH:mm:ss')
        : ''
  };
  // if (route.name === 'project-management_task_operation-records' || route.name === 'data-cleaning_operation-records') {
  downloadFile('/data/orchestration/run/record/logs/download', new Date().getTime(), queryParams);
  // }
}
function open(name: string, record: any) {
  title.value = name;
  visible.value = true;
  currentItem.value = record;
  // content.value = JSON.stringify(value, null, 2);
	if (name === '日志' || name === '告警详细日志') {
		getOffCollectionLog();
	} else if (name === '运行参数') {
		loadExecuteParams();
	}
}
function close() {
  content.value = '';
  visible.value = false;
}
defineExpose({
  open
});
</script>

<style lang="scss" scoped></style>
