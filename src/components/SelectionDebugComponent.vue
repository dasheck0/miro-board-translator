<template>
  <div class="selection-debug-component grid">
    <div class="cs1 ce4 header" >Property</div>
    <div class="cs5 ce12 header">Value</div>

    <div class="cs1 ce12" v-for="property in getPropertiesBasedOnType" :key="property">
      <div class="grid">
        <div class="cs1 ce4">{{ property }}</div>
        <div class="cs5 ce12">{{ getPropertyValue(property) }}</div>
      </div>
    </div>

    {{ component }}
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  props: {
    component: {
      required: true,
      type: Object as () => Item,
    },
  },
  data() {
    return {
      defaultProperties: [
        "id",
        "type",
        "parentId",
        "x",
        "y",
        "width",
        "height",
        "origin",
      ],
    };
  },
  computed: {
    getPropertiesBasedOnType(): string[] {
      return {
        ...this.defaultProperties,
      };
    },
  },
  methods: {
    getPropertyValue(property) {
      console.log("Hfjdhfdjk", property);
      return this.component[property];
    },
  },
});
</script>

<style scoped>
.header {
    font-weight: bold;
}

</style>
