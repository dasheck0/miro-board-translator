<template>
  <div class="app">
    <div class="content">
      <div class="tabs">
        <div class="tabs-header-list">
          <div
            v-for="(tab, index) in tabs"
            :key="tab"
            :tabIndex="index"
            class="tab"
            :class="tabActive === index ? 'tab-active' : ''"
            @click="
              () => {
                onTabChange(index, tabActive);
                tabActive = index;
              }
            "
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
            <button class="button-icon icon-refresh" type="button" @click="fetchCurrentSelection"></button>
          </div>
          <div class="cs1 ce12">
            <div class="p-medium selection-header">
              <div><strong>Current selection</strong></div>
              <div>
                <strong>{{ selection?.length || 0 }} {{ pluralizeItems(selection?.length || 0) }}</strong>
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
          <select className="select select-small" v-model="targetLanguage" @change="() => (dirtySettings = true)">
            <option v-for="language in availableLanguages" :value="language" :key="language">
              {{ getFullLanguagesNameFromShortHandle(language) }}
            </option>
          </select>
        </div>

        <div className="cs1 e12">
          <div class="header">Auth key</div>
          <input
            type="password"
            className="input input-small"
            v-model="authKey"
            @change="() => (dirtySettings = true)"
          />
          <div class="hint">
            Don't have an auth key yet? Get one
            <a
              class="link link-primary"
              href="https://www.deepl.com/docs-api/accessing-the-api/authentication/"
              target="_blank"
            >
              here</a
            >!
          </div>
        </div>
        <div class="cs1 ce12" style="margin-top: var(--space-medium)">
          <button className="button button-primary button-small" @click="saveSettings">Save</button>
        </div>
      </div>
    </div>

    <div class="footer">
      <div class="message">
        {{ notificationText }}
      </div>
      <div class="version">Version: {{ version }}</div>
    </div>
  </div>
</template>

<script lang="ts">
import { Item, StickyNote, Shape, Text, Frame, Card } from '@mirohq/websdk-types';
import translate, { DeeplLanguages } from 'deepl';
import { defineComponent } from 'vue';
import SelectionDebugComponent from './components/SelectionDebugComponent.vue';
import ItemTable from './components/ItemTable.vue';
import { pluralizeItems, availableLanguages, getFullLanguagesNameFromShortHandle } from './utils';
import { version } from '../package.json';

enum NotificationType {
  NEUTRAL = 0,
  SUCCESS = 1,
  ERROR = 2,
}

interface AppData {
  tabActive: number;
  tabs: string[];
  targetLanguage: string;
  availableLanguages: string[];
  authKey: string;
  selection: Item[] | null;
  polling: NodeJS.Timer | null;
  version: string;
  pluralizeItems(count: number): string;
  getFullLanguagesNameFromShortHandle(language: string): string;
  notificationText: string;
  notificationType: NotificationType;
  notificationTimer: NodeJS.Timer | null;
  dirtySettings: boolean;
}

export default defineComponent({
  components: { SelectionDebugComponent, ItemTable },
  data(): AppData {
    return {
      tabActive: 0,
      tabs: ['Plugin', 'Settings'],
      targetLanguage: localStorage.getItem('mbt_target_language') || 'EN',
      availableLanguages,
      authKey: localStorage.getItem('mbt_auth_key') || '',
      selection: null,
      polling: null,
      version,
      pluralizeItems,
      getFullLanguagesNameFromShortHandle,
      notificationText: '',
      notificationType: NotificationType.NEUTRAL,
      notificationTimer: null,
      dirtySettings: false,
    };
  },
  mounted() {
    this.polling = setInterval(() => {
      this.fetchCurrentSelection();
    }, 500);
  },
  computed: {
    translateButtonEnabled(): boolean {
      return !!localStorage.getItem('mbt_auth_key') && !!localStorage.getItem('mbt_target_language');
    },
    notificationColor(): string {
      switch (this.notificationType) {
        case NotificationType.NEUTRAL:
          return '#b2b2b2';

        case NotificationType.SUCCESS:
          return 'green';

        case NotificationType.ERROR:
          return '#c83c33';
      }
    },
  },
  methods: {
    onTabChange(newTab: number, oldTab: number) {
      console.log('Tabs', newTab, oldTab);

      if (oldTab === 1 && this.dirtySettings) {
        this.logError('You have unsaved changes');
      }
    },
    log(message: string, type: NotificationType = NotificationType.NEUTRAL) {
      this.notificationText = message;
      this.notificationType = type;

      if (this.notificationTimer) {
        clearInterval(this.notificationTimer);
      }

      this.notificationTimer = setInterval(() => {
        this.notificationText = '';
      }, 3000);
    },
    logSuccess(message: string) {
      this.log(message, NotificationType.SUCCESS);
    },
    logError(message: string) {
      this.log(message, NotificationType.ERROR);
    },
    async fetchCurrentSelection() {
      this.selection = await miro.board.getSelection();
    },
    async translate() {
      this.log("Starting translation ...");

      const getRelevanteItemTypes = ['sticky_note', 'shape', 'text', 'card', 'frame'];
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

      this.logSuccess('Successfully translated your content');
    },
    async translateText(text: string): Promise<string> {
      try {
        const { data } = await translate({
          free_api: true,
          text,
          target_lang: (localStorage.getItem('mbt_target_language') as DeeplLanguages) || 'EN',
          auth_key: localStorage.getItem('mbt_auth_key') || '',
        });

        return data.translations[0].text;
      } catch (error) {
        console.error(error);
        this.logError('There was an error while translating your content');
        return text;
      }
    },
    getTextFromItem(item: Item): string {
      switch (item.type) {
        case 'sticky_note':
          return (item as StickyNote).content;

        case 'shape':
          return (item as Shape).content;

        case 'text':
          return (item as Text).content;

        case 'card':
          return (item as Card).title;

        case 'frame':
          return (item as Frame).title;

        default:
          return '';
      }
    },
    async setItemToText(item: Item, text: string) {
      switch (item.type) {
        case 'sticky_note':
          (item as StickyNote).content = text;
          break;

        case 'shape':
          (item as Shape).content = text;
          break;

        case 'text':
          (item as Text).content = text;
          break;

        case 'card':
          (item as Card).title = text;
          break;

        case 'frame':
          (item as Frame).title = text;
          break;
      }
    },
    saveSettings() {
      localStorage.setItem('mbt_auth_key', this.authKey);
      localStorage.setItem('mbt_target_language', this.targetLanguage);

      this.dirtySettings = false;
      this.logSuccess('Settings were saved');
    },
  },
});
</script>

<style lang="scss" scoped>
.app {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: space-between;
  height: calc(100vh - 3rem);

  .content {
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

    .select-small {
      padding: var(--space-xsmall) 12px var(--space-xsmall);
      font-size: var(--font-soze-medium);
      height: 36px;
    }

    .hint {
      font-size: 0.8rem;
      margin-top: var(--space-xsmall);
      color: #666;
    }
  }

  .footer {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: flex-end;
    font-size: 0.8rem;

    .message {
      color: v-bind(notificationColor);
    }

    .version {
      min-width: 30%;
      text-align: right;
      color: #b2b2b2;
    }
  }
}
</style>
