<template>
  <div>
    <div style="padding: 10px 20px 20px;">
      <a-row :gutter="[20,20]">
        <a-col :md="8" :sm="24">
          <div class="data_card" style="background: linear-gradient(90deg,#3ac9a8 2%, #4de1bf);">
            <div class="content">
              <div>
                <div class="title">数据源总量</div>
                <div><span class="index">{{dataModel.totalDataNum}}</span><span class="unit">{{ dataModel.totalDataUnit }}</span></div>
              </div>
              <div><img src="~@/assets/full_data_pic_1.svg"></div>
            </div>
          </div>
        </a-col>
        <a-col :md="8" :sm="24">
          <div class="data_card" style="background: linear-gradient(90deg,#1c95ff 2%, #24bee8);">
            <div class="content">
              <div>
                <div class="title">接入数据表</div>
                <div><span class="index">{{dataModel.totalTableNum}}</span><span class="unit">张</span></div>
              </div>
              <div><img src="~@/assets/full_data_pic_2.svg"></div>
            </div>
          </div>
        </a-col>
        <a-col :md="8" :sm="24">
          <div class="data_card" style="background:linear-gradient(90deg,#216df3 2%, #5b96fd);">
            <div class="content">
              <div>
                <div class="title">对接数据对象总数</div>
                <div><span class="index">{{dataModel.totalTableNum}}</span><span class="unit">个</span></div>
              </div>
              <div><img src="~@/assets/full_data_pic_3.svg"></div>
            </div>
          </div>
        </a-col>
      </a-row>
    </div>
    <a-card :bordered="false" class="card-area echarts_card">
      <div>
        <div style="width: 1400px;">
          <div style="display: flex;justify-content: space-between;height: 30px;align-items: center;">
            <div style="">
              <span
                style="padding-left: 10px;padding-top:2px;padding-bottom:2px;border-left: 4px #198EEB solid">日数据量评估</span>
            </div>
            <div>
              <label>
                选择日期：
                <a-date-picker placeholder="请选择日期"
                               v-decorator="[ 'name', {rules: [{ required: true, message: '请选择日期', whitespace: true}]} ]"/>
              </label>
            </div>
          </div>
          <div class="day_data">
            <div class="index">
              <div><img src="~@/assets/full_data_pic_4.svg"></div>
              <div style="margin-top: 10px;"><span class="number">{{dataModel.dailyDataEvaluation.offlineTotalDataSize}}</span><span class="unit">{{dataModel.dailyDataEvaluation.offlineTotalDataSizeUnit}}</span></div>
              <div><span class="desc">当日离线数据总量</span></div>
            </div>
            <div class="index">
              <div><img src="~@/assets/full_data_pic_5.svg"></div>
              <div style="margin-top: 10px;"><span class="number">{{dataModel.dailyDataEvaluation.offlineTableNum}}</span><span class="unit">张</span></div>
              <div><span class="desc">当日离线数据表数</span></div>
            </div>
            <div class="index">
              <div><img src="~@/assets/full_data_pic_6.svg"></div>
              <div style="margin-top: 10px;"><span class="number">{{dataModel.dailyDataEvaluation.offlineAddDataSize}}</span><span class="unit">{{dataModel.dailyDataEvaluation.offlineAddDataSizeUnit}}</span></div>
              <div><span class="desc">日离线新增数据</span></div>
            </div>
            <div class="index">
              <div><img src="~@/assets/full_data_pic_7.svg"></div>
              <div style="margin-top: 10px;"><span class="number">{{dataModel.dailyDataEvaluation.onlineTotalDataSize}}</span><span class="unit">{{dataModel.dailyDataEvaluation.onlineTotalDataSizeUnit}}</span></div>
              <div><span class="desc">实时数据总量</span></div>
            </div>
            <div class="index">
              <div><img src="~@/assets/full_data_pic_8.svg"></div>
              <div style="margin-top: 10px;"><span class="number">{{dataModel.dailyDataEvaluation.onlineTableNum}}</span><span class="unit">张</span></div>
              <div><span class="desc">实时数据表数</span></div>
            </div>
            <div class="index" style="border-right: none">
              <div><img src="~@/assets/full_data_pic_9.svg"></div>
              <div style="margin-top: 10px;"><span class="number">{{dataModel.dailyDataEvaluation.onlineAddDataSize}}</span><span class="unit">{{dataModel.dailyDataEvaluation.onlineAddDataSizeUnit}}</span></div>
              <div><span class="desc">日实时新增数据</span></div>
            </div>
          </div>
        </div>
      </div>
    </a-card>
    <a-card :bordered="false" class="card-area echarts_card">
      <div class="echarts_area">
        <div style="width: 1500px">
          <area-charts :line-item="addDataItem" style="width: 100%;height: 100%"></area-charts>
        </div>
      </div>
    </a-card>
  </div>


</template>

<script>
import AreaCharts from "@comp/VueChart/AreaCharts";
import dayjs from "dayjs";
import {getfullData} from "@api/api";

const data = [
  {
    "time": "2022-03-15",
    "num": 213,
    "size": "213条"
  },
  {
    "time": "2022-03-16",
    "num": 235,
    "size": "235条"
  },
  {
    "time": "2022-03-17",
    "num": 254,
    "size": "254条"
  },
  {
    "time": "2022-03-18",
    "num": 354,
    "size": "354条"
  },
  {
    "time": "2022-03-19",
    "num": 378,
    "size": "378条"
  },
  {
    "time": "2022-03-20",
    "num": 323,
    "size": "323条"
  },
  {
    "time": "2022-03-21",
    "num": 265,
    "size": "265条"
  },
  {
    "time": "2022-03-22",
    "num": 201,
    "size": "201条"
  },
  {
    "time": "2022-03-23",
    "num": 246,
    "size": "246条"
  },
  {
    "time": "2022-03-24",
    "num": 268,
    "size": "268条"
  },
  {
    "time": "2022-03-25",
    "num": 294,
    "size": "294条"
  },
  {
    "time": "2022-03-26",
    "num": 306,
    "size": "306条"
  },
  {
    "time": "2022-03-27",
    "num": 309,
    "size": "309条"
  },
  {
    "time": "2022-03-28",
    "num": 311,
    "size": "311条"
  },
  {
    "time": "2022-03-29",
    "num": 301,
    "size": "301条"
  },
  {
    "time": "2022-03-27",
    "num": 309,
    "size": "309条"
  },
  {
    "time": "2022-03-28",
    "num": 311,
    "size": "311条"
  },
  {
    "time": "2022-03-29",
    "num": 301,
    "size": "301条"
  }]
export default {
  name: "DataAggregation",
  components: {AreaCharts},
  data() {
    return {
      dataModel:{},
      addDataItem: {
        title: '离线数据存储量趋势',
        color: '#24BEE8',
        areaTopColor: 'rgba(36,190,232,0.2)',
        areaBottomColor: 'rgba(36,190,232,0.04)',
        xAxisName: '时间',
        yAxisName: '',
        seriesLength: 1,
        gridTop: '15',
        gridBottom: '1',
        gridLeft: '1',
        gridRight: '2%',
        data: [],
        xAxisData: [],
        loading: false,
        xAxisLabelRotate: 50,
        yAxisFormatter: '{value}MB'
      },
    }
  },
  mounted() {
    getfullData().then((res)=>{
      if(res.success){
        this.dataModel = res.result
        const chartData = this.dataModel.offlineDataStorageTrends
        this.addDataItem.xAxisData = chartData && chartData.length ? chartData.map(v => dayjs(v.statisticsTime).format('MM-DD')) : []
        this.addDataItem.data = chartData && chartData.length ? chartData.map(v => v.dataTotalSize) : []
      }
    })

  }
}
</script>

<style lang="less" scoped>
.data_card {
  height: 160px;
  border-radius: 3px;
  box-shadow: 0px 1px 4px 0px rgba(202, 202, 202, 0.50);

  .content {
    display: flex;
    justify-content: space-around;
    align-items: center;
    height: 160px;

    .title {
      margin-bottom: 20px;
      font-size: 20px;
      font-family: PingFangSC, PingFangSC-Regular;
      font-weight: 400;
      text-align: left;
      color: #ffffff;
      line-height: 14px;
    }

    .index {
      font-size: 36px;
      font-family: MicrosoftYaHei, MicrosoftYaHei-Bold;
      font-weight: 700;
      text-align: left;
      color: #ffffff;
      line-height: 24px;
    }

    .unit {
      margin-left: 10px;
      font-size: 20px;
      font-family: PingFangSC, PingFangSC-Regular;
      font-weight: 400;
      text-align: left;
      color: #ffffff;
      line-height: 14px;
    }
  }

}

.echarts_card {
  height: 100%;
  margin: 0px 20px 20px;

  .echarts_area {
    //margin-top: 5px;
    height: 260px;
    display: flex;
    justify-content: center;
  }
}

.day_data {
  margin-top: 15px;
  display: flex;
  justify-content: center;
  padding: 10px 0px;

  .index {
    height: 120px;
    width: 250px;
    border-right: 1px solid #CCCCCC;
    text-align: center;

    .number {
      font-size: 20px;
      font-family: MicrosoftYaHei, MicrosoftYaHei-Bold;
      font-weight: 700;
      text-align: left;
      color: #333333;
    }

    .unit {
      margin-left: 10px;
      font-size: 14px;
      font-family: PingFangSC, PingFangSC-Regular;
      font-weight: 400;
      text-align: left;
      color: #333333;
    }

    .desc {
      font-size: 14px;
      font-family: PingFangSC, PingFangSC-Regular;
      font-weight: 400;
      text-align: left;
      color: #666666;
    }
  }

}
</style>