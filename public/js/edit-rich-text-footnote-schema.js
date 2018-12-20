import { schema } from "prosemirror-schema-basic";
import { Schema } from "prosemirror-model";

const footnoteSpec = {
  group: "inline",
  content: "inline*",
  inline: true,
  draggable: true,
  // This makes the view treat the node as a leaf, even though it
  // technically has content
  atom: true,
  toDOM: () => ["footnote", 0],
  parseDOM: [{tag: "footnote"}],
};

const footnoteSchema = new Schema({
  nodes: schema.spec.nodes.addBefore("image", "footnote", footnoteSpec),
  marks: schema.spec.marks,
});

export default footnoteSchema;
