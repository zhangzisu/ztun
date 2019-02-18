<template>
  <v-container grid-list-md fluid>
    <v-layout row wrap>
      <v-flex xs12 md4 lg2>
        <general :info="info.general" class="fill-height"/>
      </v-flex>
      <v-flex xs12 md8 lg10>
        <statistics :info="statistics" class="fill-height"/>
      </v-flex>
    </v-layout>
    <v-layout>
      <v-flex xs12>
        <v-data-iterator :rows-per-page-items="[-1]" :items="info.details" content-tag="v-layout" row wrap>
          <v-flex slot="item" slot-scope="props" xs12 md6 lg4 xl3>
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
import statistics from '../components/statistics.vue'

const len = 60
const updateInterval = 2 * 1000

export default {
  name: 'home',
  components: {
    general,
    detail,
    statistics
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
          const time = (new Date()).toLocaleTimeString('en', { hour12: false })
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
