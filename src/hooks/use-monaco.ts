import * as monaco from 'monaco-editor';
import { onMounted, onUnmounted } from 'vue';

export default function useMonaco(
  selector: string,
  options?: monaco.editor.IStandaloneEditorConstructionOptions
) {
  const state = {
    editor: null as monaco.editor.IStandaloneCodeEditor | null,
    getCode: () => state.editor?.getValue() || '',
    setTheme: (theme: string) => state.editor?.updateOptions({ theme }),
    setCode: (code: string) => state.editor?.setValue(code),
  };

  onMounted(() => {
    state.editor = monaco.editor.create(
      document.querySelector(selector) as any,
      {
        value: '',
        language: 'json',
        tabSize: 2,
        theme: 'vs-dark',
        ...options,
      }
    );
  });

  onUnmounted(() => (state.editor = null));

  return state;
}
