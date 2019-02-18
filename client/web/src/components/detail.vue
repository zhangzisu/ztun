<template>
  <v-card dark :color="info.status === 'Idle' ? 'grey' : 'success'" hover @click="$emit('update:value', !value)">
    <v-list dense class="transparent">
      <v-list-tile>
        <v-list-tile-content><pre>{{ info.id }}</pre></v-list-tile-content>
        <v-list-tile-content class="align-end">{{ info.status }}</v-list-tile-content>
      </v-list-tile>
      <v-slide-y-transition group>
        <template v-if="value">
          <v-list-tile :key="0">
            <v-list-tile-content>Total uploaded</v-list-tile-content>
            <v-list-tile-content class="align-end">{{ formatData(info.outbound.total) }}</v-list-tile-content>
          </v-list-tile>
          <v-list-tile :key="1">
            <v-list-tile-content>Total downloaded</v-list-tile-content>
            <v-list-tile-content class="align-end">{{ formatData(info.inbound.total) }}</v-list-tile-content>
          </v-list-tile>
          <v-list-tile :key="2">
            <v-list-tile-content>Upload speed</v-list-tile-content>
            <v-list-tile-content class="align-end">{{ formatData(info.outbound.speed) }} / S</v-list-tile-content>
          </v-list-tile>
          <v-list-tile :key="3">
            <v-list-tile-content>Download speed</v-list-tile-content>
            <v-list-tile-content class="align-end">{{ formatData(info.inbound.speed) }} / S</v-list-tile-content>
          </v-list-tile>
          <v-list-tile :key="4">
            <v-list-tile-content>Active connections</v-list-tile-content>
            <v-list-tile-content class="align-end">{{ info.connections }}</v-list-tile-content>
          </v-list-tile>
          <v-list-tile :key="5">
            <v-list-tile-content>Duration</v-list-tile-content>
            <v-list-tile-content class="align-end">{{ info.duration }}</v-list-tile-content>
          </v-list-tile>
          <v-list-tile :key="6">
            <v-list-tile-content>Remote Address</v-list-tile-content>
            <v-list-tile-content class="align-end"><a :href="info.address" class="white--text">{{ info.address }}</a></v-list-tile-content>
          </v-list-tile>
        </template>
      </v-slide-y-transition>
    </v-list>
  </v-card>
</template>

<script>
import { formatData } from '../util'

export default {
  name: 'detail',
  props: ['info', 'value'],
  model: {
    prop: 'value',
    event: 'update:value'
  },
  methods: {
    formatData
  }
}
</script>
