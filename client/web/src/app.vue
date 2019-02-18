<template>
  <v-app>
    <v-toolbar app>
      <v-toolbar-title class="headline">ZTUN Control Panel</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn flat href="https://github.com/ZhangZisu/ztun" target="_blank">Latest Release</v-btn>
    </v-toolbar>

    <v-content>
      <router-view/>
    </v-content>
  </v-app>
</template>

<script>
export default {
  name: 'app',
  data: () => ({})
}
</script>
