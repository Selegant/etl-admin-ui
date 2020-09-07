<template>
  <a-modal
    :title="okText"
    :width="840"
    :visible="visible"
    :confirm-loading="confirmLoading"
    @ok="handleSubmit"
    @cancel="visible = false"
    :ok-text="okText"
  >
    <div style="text-align: center">
      <a-spin v-if="displayLoading" size="large" />
    </div>
    <a-tree
      v-model="checkedKeys"
      :show-line="true"
      checkable
      :expanded-keys="expandedKeys"
      :auto-expand-parent="autoExpandParent"
      :selected-keys="selectedKeys"
      :tree-data="treeData"
      @expand="onExpand"
      @select="onSelect" />
  </a-modal>
</template>

<script>
import { getKettleResourceList, syncJobAndTrans } from '@/api/kettle'

export default {
  name: 'KettleResourceForm',
  data () {
    return {
      displayLoading: true,
      confirmLoading: false,
      visible: false,
      expandedKeys: [],
      autoExpandParent: true,
      checkedKeys: [],
      selectedKeys: [],
      treeData: [],
      okText: '',
      objectType: ''
    }
  },
  watch: {
    checkedKeys (val) {
      console.log('onCheck', val)
      this.selectedKeys = val
    }
  },
  methods: {
    open (objectType) {
      this.objectType = objectType
      if (objectType === 2) {
        this.okText = '同步作业'
      } else {
        this.okText = '同步转换'
      }
      this.visible = true
      const that = this
      that.displayLoading = true
      that.treeData = []
      getKettleResourceList(objectType)
        .then(res => {
          if (res.code === 200) {
            that.displayLoading = false
            that.treeData = res.data.trees
            that.checkedKeys = res.data.selectedKeys
            that.expandedKeys = res.data.expandedKeys
            that.visible = true
          } else {
          }
        })
    },
    onExpand (expandedKeys) {
      console.log('onExpand', expandedKeys)
      // if not set autoExpandParent to false, if children expanded, parent can not collapse.
      // or, you can remove all expanded children keys.
      this.expandedKeys = expandedKeys
      this.autoExpandParent = false
    },
    onCheck (checkedKeys) {
      console.log('onCheck', checkedKeys)
      this.checkedKeys = checkedKeys
    },
    onSelect (selectedKeys, info) {
      console.log('onSelect', info)
      this.selectedKeys = selectedKeys
    },
    handleSubmit () {
      const that = this
      const data = {
        'objectType': this.objectType,
        'objectIds': this.selectedKeys
      }
      that.confirmLoading = true
      syncJobAndTrans(data)
        .then(res => {
          if (res.code === 200) {
            that.$message.success(that.okText + '成功')
            that.$emit('ok')
            that.confirmLoading = false
            that.visible = false
          } else {
            that.$message.error(res.msg)
          }
        })
    }
  }
}
</script>
