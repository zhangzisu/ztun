<template>
  <v-container grid-list-md>
    <v-layout row>
      <v-flex xs12>
        <general :info="info.general" :statistics="statistics"/>
      </v-flex>
    </v-layout>
    <v-layout>
      <v-flex xs12>
        <v-data-iterator :rows-per-page-items="[-1]" :items="info.details" content-tag="v-layout" row wrap>
          <v-flex slot="item" slot-scope="props" xs12 md6 lg4>
            <detail :info="props.item" v-model="showDetails"/>
          </v-flex>
        </v-data-iterator>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import { formatData } from '../util'
import general from '../components/general.vue'
import detail from '../components/detail.vue'

const len = 60
const updateInterval = 2 * 1000

export default {
  name: 'home',
  components: {
    general,
    detail
  },
  data: () => ({
    info: {
      general: {
        inbound: {
          total: 0,
          speed: 0
        },
        outbound: {
          total: 0,
          speed: 0
        },
        sessions: {
          active: 0,
          total: 0
        }
      },
      details: []
    },
    statistics: {
      inbound: [...Array(len).keys()].map(i => [`-${len - i}`, 0]),
      outbound: [...Array(len).keys()].map(i => [`-${len - i}`, 0]),
      xAxis: [...Array(len).keys()].map(i => `-${len - i}`)
    },
    updateId: undefined,
    showDetails: false
  }),
  created () {
    this.updateId = setInterval(() => {
      this.load()
    }, updateInterval)
  },
  beforeDestroy () {
    clearInterval(this.updateId)
  },
  methods: {
    load () {
      fetch('/api/info')
        .then(res => res.json())
        .then(json => {
          this.info = json
          document.title = `Ztun ↑${this.formatData(this.info.general.outbound.speed)}/S ↓${this.formatData(this.info.general.inbound.speed)}/S`
          const now = new Date()
          const time = `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`
          this.statistics.inbound.shift()
          this.statistics.inbound.push([time, this.info.general.inbound.speed])
          this.statistics.outbound.shift()
          this.statistics.outbound.push([time, this.info.general.outbound.speed])
          this.statistics.xAxis.shift()
          this.statistics.xAxis.push(time)
        })
    },
    formatData
  }
}
</script>
