import { createApp } from "vue";
import App from "./App.vue";

createApp(App).mount("#root");

async function init() {
  miro.board.ui.on("icon:click", async () => {
    await miro.board.ui.openPanel({ url: "index.html" });
  });
}

init();
