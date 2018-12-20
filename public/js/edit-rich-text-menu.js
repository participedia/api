import { insertPoint } from "prosemirror-transform";
import { MenuItem } from "prosemirror-menu";
import { buildMenuItems } from "prosemirror-example-setup";
import { Fragment } from "prosemirror-model";
import footnoteSchema from "./edit-rich-text-footnote-schema.js";

const menu = buildMenuItems(footnoteSchema);

menu.insertMenu.content.push(new MenuItem({
  title: "Insert footnote",
  label: "Footnote",
  select(state) {
    return insertPoint(state.doc, state.selection.from, footnoteSchema.nodes.footnote) != null;
  },
  run(state, dispatch) {
    const { empty, $from, $to } = state.selection;
    let content = Fragment.empty;
    if (!empty && $from.sameParent($to) && $from.parent.inlineContent) {
      content = $from.parent.content.cut($from.parentOffset, $to.parentOffset);
    }
    dispatch(state.tr.replaceSelectionWith(footnoteSchema.nodes.footnote.create(null, content)))
  }
}))

export default menu;
