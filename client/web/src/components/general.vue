<template>
  <v-card>
    <v-card-text>
      <v-list dense>
        <v-list-tile>
          <v-list-tile-content>Total uploaded</v-list-tile-content>
          <v-list-tile-content class="align-end">{{ formatData(info.outbound.total) }}</v-list-tile-content>
        </v-list-tile>
        <v-list-tile>
          <v-list-tile-content>Total downloaded</v-list-tile-content>
          <v-list-tile-content class="align-end">{{ formatData(info.inbound.total) }}</v-list-tile-content>
        </v-list-tile>
        <v-list-tile>
          <v-list-tile-content>Upload speed</v-list-tile-content>
          <v-list-tile-content class="align-end">{{ formatData(info.outbound.speed) }} / S</v-list-tile-content>
        </v-list-tile>
        <v-list-tile>
          <v-list-tile-content>Download speed</v-list-tile-content>
          <v-list-tile-content class="align-end">{{ formatData(info.inbound.speed) }} / S</v-list-tile-content>
        </v-list-tile>
        <v-list-tile>
          <v-list-tile-content>Active sessions</v-list-tile-content>
          <v-list-tile-content class="align-end">{{ info.sessions.active }} / {{ info.sessions.total }}</v-list-tile-content>
        </v-list-tile>
      </v-list>
      <e-charts :options="options" :autoresize="true"/>
    </v-card-text>
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
  name: 'general',
  props: ['info', 'statistics'],
  computed: {
    options () {
      return {
        title: {
          text: 'Speed info'
        },
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
          data: this.statistics.xAxis
        },
        yAxis: {
          type: 'value'
        },
        series: [
          {
            name: 'upload',
            type: 'line',
            data: this.statistics.outbound,
            showSymbol: false
          },
          {
            name: 'download',
            type: 'line',
            data: this.statistics.inbound,
            showSymbol: false
          }
        ]
      }
    }
  },
  components: {
    ECharts
  },
  methods: {
    formatData
  }
}
</script>

<style lang="stylus">
.echarts
  width 100%
</style>
