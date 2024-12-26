<template>
  <div class="wrapper">
    <div class="header">jsontots在线工具</div>
    <div class="content">
      <div class="cl">
        <div class="action">
          <tiny-button type="primary" @click="jsonToTs">转换</tiny-button>
          <tiny-button type="primary" @click="modal.visible = true">编辑</tiny-button>
        </div>
        <div id="editor1" ref="editorRef" class="editor"></div>
      </div>
      <div class="cr">
        <div class="action">
          <tiny-button type="primary" @click="copyToClipboard(editorTs.getCode())">复制</tiny-button>
        </div>
        <div id="editor2" ref="editorRef" class="editor"></div>
      </div>
    </div>
  </div>
  <tiny-modal v-model="modal.visible" title="配置">
    <template #default>
      <tiny-form :disabled="false" label-position="right" ref="createData" label-width="70px">
        <tiny-form-item label="ts名称:">
          <tiny-input v-model="tsData.name" placeholder="请输入要生成对应的名称"></tiny-input>
        </tiny-form-item>
        <tiny-form-item>
          <tiny-button type="primary" @click="submitClick">确定</tiny-button>
        </tiny-form-item>
      </tiny-form>
    </template>
  </tiny-modal>
</template>

<script lang="ts" setup>
import "@/utils/rain/index";
import { Json2Ts } from "@/utils/json2ts/index";
import useMonaco from "@/hooks/use-monaco";
import { reactive } from "vue";
import { Modal } from "@opentiny/vue";
const json2ts = new Json2Ts();

const modal = reactive({
  visible: false,
});

const tsData = reactive({
  name: "",
});

const editorJson = useMonaco("#editor1");
const editorTs = useMonaco("#editor2", {
  language: "typescript",
  theme: "vs-dark",
});

console.log("editor", editorJson, editorTs);

const jsonToTs = () => {
  // 清空 editorTs
  editorTs.setCode("");
  const json = editorJson.getCode();
  let ts = "";
  if (tsData.name.trim().length == 0) {
    ts = json2ts.convert(json);
  } else {
    ts = json2ts.convert(json, tsData.name);
  }
  editorTs.setCode(ts);
};

const submitClick = () => {
  modal.visible = false;
};
const copyToClipboard = (text: string) => {
  if (navigator.clipboard && navigator.permissions) {
    navigator.clipboard.writeText(text).then(() => {
      Modal.message({
        status: "success",
        message: "复制成功",
      });
    });
  } else {
    var textarea = document.createElement("textarea");
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    Modal.message({
      status: "success",
      message: "复制成功",
    });
    document.body.removeChild(textarea);
  }
};
</script>

<style lang="scss">
.wrapper {
  width: 100%;
  height: 100%;
  background: url("./assets/banner.jpg")
    no-repeat top center;
  background-size: cover;
  background-color: rgba(0, 0, 0, 0.9);
}

.content {
  display: flex;
  height: 780px;
  .cl {
    flex: 1;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.1);
    .editor {
      width: 100%;
      height: 100%;
    }
  }
  .cr {
    flex: 1;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.1);
    .editor {
      width: 100%;
      height: 100%;
    }
  }
}
.header {
  height: 80px;
  background-color: rgba(0, 0, 0, 0.1);
  color: #fff;
  font-family: "Gill Sans", "Gill Sans MT", Calibri, "Trebuchet MS", sans-serif;
  padding-left: 24px;
  font-size: 34px;
}

.monaco-editor .margin {
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.1) !important;
}

.monaco-editor-background,
.monaco-editor {
  background-color: rgba(0, 0, 0, 0.4) !important;
}
</style>
