<template>
	<div class='h-full overflow-hidden'>
		<n-card class='h-full shadow-sm rounded-16px'>
			<n-space>
				<n-form
					ref="searchForm"
					inline
					:label-width="70"
					:model="searchModel"
					label-placement="left"
					label-width="auto"
					label-align = "left"
					size="medium"
				>
					<n-form-item label="菜单搜索" path="inputValue">
						<n-input v-model:value="searchModel.inputValue" placeholder="菜单名称、链接、权限标志" />
					</n-form-item>
				</n-form>
				<n-button strong secondary type="primary" @click="">
					<n-icon size='16'><svg-icon local-icon='search'></svg-icon></n-icon>
					搜索
				</n-button>
				<n-button strong secondary type="tertiary" @click="">
					<n-icon size='16'><svg-icon local-icon='delete'></svg-icon></n-icon>
					清空
				</n-button>
			</n-space>
			<n-space class="pb-12px" justify="space-between">
				<n-space>
					<n-button strong secondary type="primary" @click="()=>showModal=true">
						<n-icon size='22'><svg-icon local-icon='add'></svg-icon></n-icon>
						添加菜单
					</n-button>
				</n-space>
			</n-space>
			<loading-empty-wrapper class='h-480px' :loading='loading' :empty='empty'>
				<n-data-table :columns='columns' :data='dataSource' :row-key='rowKey' :flex-height='true' class='h-480px' />
			</loading-empty-wrapper>
		</n-card>
		<n-modal
			v-model:show="showModal"
			preset='dialog'
			:title="modalTitle"
			:show-icon=false
			positive-text='确认'
			negative-text='取消'
			:on-positive-click=submitFrom>
<!--			<n-card-->
<!--				style="width: 1000px"-->
<!--				:title="modalTitle"-->
<!--				:bordered="false"-->
<!--				size="huge"-->
<!--				role="dialog"-->
<!--				aria-modal="true"-->
<!--			>-->
				<n-form
					ref="menuForm"
					:label-width="80"
					:model="menuModel"
					label-placement="left"
					label-width="auto"
					label-align = "left"
					size="medium"
				>
					<n-form-item label="菜单类型" path="inputValue">
						<n-radio-group  size='small' v-model:value="menuModel.menuType">
							<n-radio-button value={0}>菜单</n-radio-button>
							<n-radio-button value={1}>按钮</n-radio-button>
						</n-radio-group>
					</n-form-item>
					<n-form-item label="上级菜单" path="inputValue">
						<n-tree-select
							:options="menuTree"
							label-field="name"
							key-field="id"
							children-field="children"
						/>
					</n-form-item>
					<n-form-item label="菜单名称" path="inputValue">
						<n-input v-model:value="menuModel.name" placeholder="菜单名称、链接、权限标志" />
					</n-form-item>
					<n-form-item label="菜单链接" path="inputValue">
						<n-input v-model:value="menuModel.url" placeholder="菜单名称、链接、权限标志" />
					</n-form-item>
					<n-form-item label="关联组件" path="inputValue">
						<n-input v-model:value="menuModel.componentName" placeholder="菜单名称、链接、权限标志" />
					</n-form-item>
					<n-form-item label="排序" path="inputValue">
						<n-input-number v-model:value="menuModel.sort" placeholder="菜单名称、链接、权限标志" />
					</n-form-item>
					<n-form-item label="选择图标" path="inputValue">
						<icon-select v-model:value="menuModel.icon" :icons="icons" />
					</n-form-item>
					<n-form-item label="菜单显示" path="inputValue">
						<n-radio-group  size='small' v-model:value="menuModel.isShow">
							<n-radio-button value={1}>显示</n-radio-button>
							<n-radio-button value={0}>不显示</n-radio-button>
						</n-radio-group>
					</n-form-item>
					<n-form-item label="路由缓存" path="inputValue">
						<n-radio-group  size='small' v-model:value="menuModel.keepAlive">
							<n-radio-button value={1}>缓存</n-radio-button>
							<n-radio-button value={0}>不缓存</n-radio-button>
						</n-radio-group>
					</n-form-item>
				</n-form>
<!--			</n-card>-->
		</n-modal>
	</div>
</template>

<script setup lang='tsx'>
import { useLoadingEmpty } from '@/hooks';
import { DataTableColumns, FormInst, NButton, NIcon, NSpace, NSwitch } from 'naive-ui';
import { defineComponent, h, onMounted, ref } from 'vue';
import { request } from '@/service/request';
import { fetchUserList } from '@/service';
import SvgIcon from '@/components/custom/svg-icon.vue';
import ColumnSetting from '@/views/management/user/components/column-setting.vue';
import { icons } from '@/views/plugin/icon/icons';
const { loading, startLoading, endLoading, empty, setEmpty } = useLoadingEmpty();

type Menu = {
	id: string,
	name: string,
	title: string
	path: string
	permission: string
	icon: string
	sort: number
	isShow: number
	keepAlive: number,
	children:Menu[]
}


const rowKey = (menu: Menu) => menu.id;
const dataSource = ref<Menu[]>([]);
const menuTree = ref<Menu[]>([  {
	id: "0",
	name: "根节点",
	title: "根节点",
	path: "/",
	permission: "",
	icon: "",
	sort: 1,
	isShow: 1,
	keepAlive: 1,
	children:[]
},]);
const searchForm = ref<FormInst|null>(null)
const menuForm = ref<FormInst|null>(null)
const showModal=ref(false)
const modalTitle = ref('添加')
const searchModel = ref({
	inputValue: ''
})
const menuModel = ref({
	id: '',
	name: '',
	url: '',
	permission: '',
	sort: 0,
	descRibe: '',
	isShow: 0,
	pid: '',
	icon: '',
	keepAlive: 0,
	componentName: '',
})
const createColumns = ({
												 play
											 }: {
	play: (row: Menu) => void
}): DataTableColumns<Menu> => {
	return [
		{
			title: '菜单名称',
			key: 'name'
		},
		{
			title: '路径',
			key: 'url'
		},
		{
			title: '权限标志',
			key: 'permission'
		},
		{
			title: '图标',
			key: 'icon'
		},
		{
			title: '排序',
			key: 'sort'
		},
		{
			title: '是否显示',
			key: 'isShow',
			render: row => {
				return (
					<NSwitch size='small' checkedValue={1} uncheckedValue={0} value={row.isShow}></NSwitch>
				)
			}
		},
		{
			title: '是否缓存',
			key: 'keepAlive',
			render: row => {
				return (
					<NSwitch size='small' checkedValue={1} uncheckedValue={0} value={row.keepAlive}></NSwitch>
				)
			}
		},
		{
			title: '操作',
			key: 'actions',
			width: 250,
			render: row => {
				return (
					<div>
						<NButton size='tiny' quaternary='true'>
							{{
								icon: () => <NIcon size='16'><SvgIcon localIcon='add'></SvgIcon></NIcon> ,
								default: ()=> '添加下级菜单'
							}}
						</NButton>
						<NButton size='tiny' quaternary='true'>
							{{
								icon: () => <NIcon size='16'><SvgIcon localIcon='edit'></SvgIcon></NIcon> ,
								default: ()=> '编辑'
							}}
						</NButton>
						<NButton size='tiny' quaternary='true'>
							{{
								icon: () => <NIcon size='16'><SvgIcon localIcon='delete'></SvgIcon></NIcon> ,
								default: ()=> '删除'
							}}
						</NButton>
					</div>
				);
			}
		}
	];
};

const columns = createColumns({
	play(row: Menu) {
	}
});

function submitFrom(){
	menuForm.value?.validate((errors) => {
		if (!errors) {
			message.success('验证成功')
		} else {
			console.log(errors)
			message.error('验证失败')
		}
	})
}

function setTableData(data: Menu[]) {
	dataSource.value = data;
	menuTree.value[0].children.push(...data)
}

async function getTableData() {
	startLoading();
	const { data } = await request.get<Menu[]>('/system/menu/tree');
	console.log(data);
	if (data) {
		setTimeout(() => {
			setTableData(data);
			endLoading();
		}, 1000);
	}
}

function createDataSource(): Menu[] {
	let data = [];
	const list = request.get('/system/menu/tree').then(res => {
		data = res.data.list;
		console.log(data);
	});
	console.log(data);
	return data;
}

function getDataSource() {
	startLoading();
	setTimeout(() => {
		dataSource.value = createDataSource();
		endLoading();
		setEmpty(!dataSource.value.length);
	}, 1000);
}

function handleAddTable(){

}

onMounted(() => {
	getTableData();
});
</script>

<style scoped>

</style>
