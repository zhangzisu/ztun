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
    </v-card-text>
  </v-card>
</template>

<script>
import { formatData } from '../util'

export default {
  name: 'general',
  props: ['info'],
  methods: {
    formatData
  }
}
</script>
