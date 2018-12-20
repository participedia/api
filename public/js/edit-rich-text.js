import { EditorState } from "prosemirror-state";
import { DOMParser } from "prosemirror-model";
import { EditorView } from "prosemirror-view";
import { exampleSetup } from "prosemirror-example-setup";

import footnoteSchema from "./edit-rich-text-footnote-schema.js";
import FootnoteView from "./edit-rich-text-footnote-view.js";
import menu from "./edit-rich-text-menu.js";

const editRichText = {
  init() {
    const editorEl = document.querySelector("#case-edit-rich-text-editor");
    const contentEl = document.querySelector("#case-edit-rich-text-content");
    window.view = new EditorView(editorEl, {
      state: EditorState.create({
        doc: DOMParser.fromSchema(footnoteSchema).parse(contentEl),
        plugins: exampleSetup({
          schema: footnoteSchema,
          menuContent: menu.fullMenu
        })
      }),
      nodeViews: {
        footnote(node, view, getPos) { return new FootnoteView(node, view, getPos) }
      }
    })
  }
};

export default editRichText;
