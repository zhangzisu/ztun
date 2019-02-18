<template>
  <v-card>
    <e-charts :options="options" :autoresize="true"/>
  </v-card>
</template>

<script>
import ECharts from 'vue-echarts'
import 'echarts/lib/chart/line'
import 'echarts/lib/component/tooltip'
import 'echarts/lib/component/legend'
import 'echarts/lib/component/title'
import { formatData } from '../util'

export default {
  name: 'statistics',
  props: ['info'],
  computed: {
    options () {
      return {
        tooltip: {
          trigger: 'axis',
          formatter (params) {
            return `↑${formatData(params[0].data[1])} ↓${formatData(params[1].data[1])}`
          }
        },
        legend: {
          data: ['upload', 'download']
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: this.info.xAxis
        },
        yAxis: {
          type: 'value'
        },
        series: [
          {
            name: 'upload',
            type: 'line',
            data: this.info.outbound,
            showSymbol: false
          },
          {
            name: 'download',
            type: 'line',
            data: this.info.inbound,
            showSymbol: false
          }
        ]
      }
    }
  },
  components: {
    ECharts
  }
}
</script>

<style lang="stylus">
.echarts
  width 100%
</style>
