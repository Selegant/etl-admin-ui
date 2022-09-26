<template>
  <div>
    <div style="color: #333333;font-weight: bolder;font-size: 16px">计划名称</div>
    <div class="plan">
      <div v-for="(item,index) in record">
        <span>{{ item.jobName }}</span>
      </div>
    </div>
    <div style="color: #333333;font-weight: bolder;font-size: 16px">清洗模式</div>
    <div style="padding: 20px">
      <a-radio-group v-model="cleanMode">
        <a-radio-button :value="0">全量</a-radio-button>
        <a-radio-button :value="1">自定义时间全量</a-radio-button>
        <a-radio-button :value="2">增量</a-radio-button>
      </a-radio-group>
    </div>
    <div v-if="cleanMode===1" style="padding: 0px 20px 20px 20px">
      <a-date-picker  v-model="incCleanTime" :show-time="{ format: 'HH:mm' }" format="YYYY-MM-DD HH:mm" valueFormat="YYYY-MM-DD HH:mm:ss">
      </a-date-picker>
    </div>
    <div v-if="cleanMode===2" style="padding: 0px 20px 20px 20px">
      <a-input-number  v-model="cleanDays" :min="0" :max="100"></a-input-number>
    </div>
    <div class="submit">
      <a-button type="text" @click="close()"> {{ $t('Cancel') }} </a-button>
      <a-button type="primary" round :loading="spinnerLoading" @click="ok()"
      >{{ spinnerLoading ? '修改中...' : '修改' }}
      </a-button>
    </div>
  </div>
</template>

<script>
import {cleanJobBatchEdit} from "@api/api";

export default {
  name: "StartBatchJobModal",
  props: {
    spinnerLoading: false,
    record: Array
  },
  data() {
    return {
      cleanMode: 0,
      cleanDays: 10,
      incCleanTime: ''
    }
  },
  methods:{
    ok(){
      const job = {
        jobs: this.record,
        incCleanTime: this.incCleanTime,
        cleanDays: this.cleanDays,
        cleanMode: this.cleanMode
      }
      this.spinnerLoading = true
      cleanJobBatchEdit(job).then((res)=>{
        this.spinnerLoading = false
        if(res.success){
          this.$emit('close')
        }
      })
    },
    close(){
      this.$emit('close')
    }
  }
}
</script>

<style lang="less" scoped>
.plan {
  padding: 10px;
  display: flex;

  div {
    margin: 10px;
  }
}

.submit {
  text-align: right;
  padding-right: 30px;
  padding-top: 10px;
  padding-bottom: 30px;
  button + button {
    margin-left: 10px;
  }
}
</style>