<template>
  <div>
    <div class="tabs">
      <div class="tabs-header-list">
        <div
          v-for="(tab, index) in tabs"
          :key="tab"
          :tabIndex="index"
          class="tab"
          :class="tabActive === index ? 'tab-active' : ''"
          @click="() => (tabActive = index)"
        >
          <div class="tab-text tab-badge">
            {{ tab }}
          </div>
        </div>
      </div>
    </div>

    <div v-if="tabActive === 0">
      <div class="grid">
        <div class="cs1 ce12" style="margin-top: var(--space-medium)">
          <button
            className="button button-primary button-small"
            @click="translate"
            :disabled="!selection || selection.length === 0"
          >
            Translate selection
          </button>
        </div>
        <div class="cs11 ce12" style="margin-top: var(--space-medium)" v-if="false">
          <button
            class="button-icon icon-refresh"
            type="button"
            @click="fetchCurrentSelection"
          ></button>
        </div>
        <div class="cs1 ce12">
          <div class="p-medium selection-header">
            <div><strong>Current selection</strong></div>
            <div>
              <strong
                >{{ selection?.length || 0 }}
                {{ pluralize(selection?.length || 0) }}</strong
              >
            </div>
          </div>
          <div class="p-medium" v-if="selection && selection.length > 0">
            <ItemTable :items="selection" />
          </div>
          <p class="p-medium" v-else>Nothing selected</p>
        </div>
      </div>
    </div>
    <div v-else>
      <div className="cs1 e12" style="margin-top: var(--space-medium)">
        <div class="header">Target Language</div>
        <select className="select" v-model="targetLanguage">
          <option v-for="language in availableLanguages" :value="language">
            {{ getLanguageName(language) }}
          </option>
        </select>
      </div>

      <div className="cs1 e12">
        <div class="header">Auth key</div>
        <input type="password" className="input" v-model="authKey" />
      </div>
      <div class="cs1 ce12" style="margin-top: var(--space-medium)">
        <button className="button button-primary button-small" @click="saveSettings">
          Save
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {
  Item,
  StickyNote,
  Shape,
  Text,
  Frame,
  Card,
  TableText,
} from "@mirohq/websdk-types";
import translate, { DeeplLanguages } from "deepl";
import { defineComponent } from "vue";
import SelectionDebugComponent from "./components/SelectionDebugComponent.vue";
import { groupBy } from "lodash.groupby";
import ItemTable from "./components/ItemTable.vue";
import {
  pluralizeItems,
  availableLanguages,
  getFullLanguagesNameFromShortHandle,
} from "./utils";

export default defineComponent({
  components: { SelectionDebugComponent, ItemTable },
  data() {
    return {
      tabActive: 0,
      tabs: ["Plugin", "Settings"],
      targetLanguage: localStorage.getItem("mbt_target_language") || "EN",
      availableLanguages,
      authKey: localStorage.getItem("mbt_auth_key") || "",
      selection: null,
      polling: null,
    };
  },
  mounted() {
    this.polling = setInterval(() => {
      this.fetchCurrentSelection();
    }, 500);
  },
  computed: {
    translateButtonEnabled(): boolean {
      return (
        !!localStorage.getItem("mbt_auth_key") &&
        !!localStorage.getItem("mbt_target_language")
      );
    },
  },
  methods: {
    async fetchCurrentSelection() {
      this.selection = await miro.board.getSelection();
    },
    async translate() {
      const getRelevanteItemTypes = ["sticky_note", "shape", "text", "card", "frame"];
      const selection = await miro.board.getSelection();

      await Promise.all(
        selection.map(async (item) => {
          if (getRelevanteItemTypes.includes(item.type)) {
            const text = this.getTextFromItem(item);
            const translatedText = await this.translateText(text);

            this.setItemToText(item, translatedText);
            await item.sync();
          }
        })
      );
    },
    async translateText(text: string): Promise<string> {
      try {
        const { data } = await translate({
          free_api: true,
          text,
          target_lang:
            (localStorage.getItem("mbt_target_language") as DeeplLanguages) || "EN",
          auth_key: localStorage.getItem("mbt_auth_key") || "",
        });

        return data.translations[0].text;
      } catch (error) {
        console.error(error);
        return text;
      }
    },
    getTextFromItem(item: Item): string {
      switch (item.type) {
        case "sticky_note":
          return (item as StickyNote).content;

        case "shape":
          return (item as Shape).content;

        case "text":
          return (item as Text).content;

        case "card":
          return (item as Card).title;

        case "frame":
          return (item as Frame).title;

        default:
          return "";
      }
    },
    async setItemToText(item: Item, text: string) {
      switch (item.type) {
        case "sticky_note":
          (item as StickyNote).content = text;
          break;

        case "shape":
          (item as Shape).content = text;
          break;

        case "text":
          (item as Text).content = text;
          break;

        case "card":
          (item as Card).title = text;
          break;

        case "frame":
          (item as Frame).title = text;
          break;
      }
    },
    saveSettings() {
      localStorage.setItem("mbt_auth_key", this.authKey);
      localStorage.setItem("mbt_target_language", this.targetLanguage);
    },
    pluralize(count: number) {
      return pluralizeItems(count);
    },
    getLanguageName(language: string) {
      return getFullLanguagesNameFromShortHandle(language);
    },
  },
});
</script>

<style>
.selection-debug-component {
  margin-bottom: var(--space-medium);
}

.selection-header {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-top: var(--space-medium);
  margin-bottom: var(--space-xsmall);
}

.header {
  margin: var(--space-xsmall) 0;
}
</style>
