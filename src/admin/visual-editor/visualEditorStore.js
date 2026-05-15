import {
  create,
} from "zustand";

const useVisualEditorStore =
  create(
    (
      set
    ) => ({

      editorState:
        {},

      selectedComponent:
        null,

      realtimePreview:
        null,

      setEditorState:
        (
          editorState
        ) => {

          set({
            editorState,
          });

        },

      setSelectedComponent:
        (
          selectedComponent
        ) => {

          set({
            selectedComponent,
          });

        },

      setRealtimePreview:
        (
          realtimePreview
        ) => {

          set({
            realtimePreview,
          });

        },

    })
  );

export default
  useVisualEditorStore;