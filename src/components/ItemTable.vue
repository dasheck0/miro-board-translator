<template>
  <div class="item-table">
    <div class="item-row" v-for="(item, index) in items" :key="index">
      <div>{{ snakeCaseToSentenceCase(item[0].type) }}</div>
      <div>{{ item.length }} items</div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from "vue";
import groupBy from "lodash.groupby";

export default defineComponent({
  props: {
    items: Array as () => any[],
  },
  setup(props) {
    const items = computed(() =>
      Object.values(groupBy(props.items, "type")).sort((left, right) => {
        const difference = right.length - left.length;

        if (difference === 0) {
          return left[0].type.localeCompare(right[0].type);
        }

        return difference;
      })
    );

    return {
      items,
    };
  },
  methods: {
    snakeCaseToSentenceCase(snakeCase: string): string {
      return snakeCase
        .split("_")
        .map((comp) => `${comp[0].toUpperCase()}${comp.slice(1).toLowerCase()}`)
        .join(" ");
    },
  },
});
</script>

<style lang="scss" scoped>
.item-table {
  .item-row {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
}
</style>
