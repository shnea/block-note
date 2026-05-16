import { DOMSerializer } from "prosemirror-model";
import type { Fragment, Mark, Node as ProseMirrorNode } from "prosemirror-model";

type BlockNoteDOMSpec = {
  dom?: Node;
  contentDOM?: HTMLElement;
};

const PATCH_FLAG = "__shneaBlocknoteRenderSpecPatched";

type PatchedDOMSerializer = typeof DOMSerializer & {
  [PATCH_FLAG]?: boolean;
};

const serializer = DOMSerializer as PatchedDOMSerializer;

function getDocument(options?: { document?: Document }): Document {
  return options?.document ?? window.document;
}

export function patchProseMirrorRenderSpec(): void {
  if (serializer[PATCH_FLAG]) {
    return;
  }

  const originalRenderSpec = DOMSerializer.renderSpec.bind(DOMSerializer);

  DOMSerializer.renderSpec = ((doc: Document, structure: unknown, xmlNS?: string | null, blockArraysIn?: unknown) => {
    if (
      structure &&
      typeof structure === "object" &&
      "nodeType" in structure &&
      typeof structure.nodeType === "number"
    ) {
      return { dom: structure as Node };
    }

    const maybeBlockNoteSpec = structure as BlockNoteDOMSpec;

    if (
      maybeBlockNoteSpec &&
      typeof maybeBlockNoteSpec === "object" &&
      "dom" in maybeBlockNoteSpec &&
      maybeBlockNoteSpec.dom?.nodeType
    ) {
      return {
        dom: maybeBlockNoteSpec.dom,
        contentDOM: maybeBlockNoteSpec.contentDOM
      };
    }

    return (originalRenderSpec as (...args: unknown[]) => ReturnType<typeof DOMSerializer.renderSpec>)(
      doc,
      structure as Parameters<typeof DOMSerializer.renderSpec>[1],
      xmlNS,
      blockArraysIn
    );
  }) as typeof DOMSerializer.renderSpec;

  const prototype = DOMSerializer.prototype as DOMSerializer & {
    serializeNodeInner: (
      node: ProseMirrorNode,
      options?: { document?: Document }
    ) => globalThis.Node;
    serializeMark: (
      mark: Mark,
      inline: boolean,
      options?: { document?: Document }
    ) => { dom: globalThis.Node; contentDOM?: HTMLElement } | null;
    serializeFragment: (
      fragment: Fragment,
      options?: { document?: Document },
      target?: DocumentFragment | HTMLElement
    ) => DocumentFragment | HTMLElement;
  };

  prototype.serializeNodeInner = function serializeNodeInner(
    this: DOMSerializer,
    node: ProseMirrorNode,
    options: { document?: Document } = {}
  ) {
    const doc = getDocument(options);

    if (node.isText) {
      return doc.createTextNode(node.text ?? "");
    }

    const toDOM = this.nodes[node.type.name];
    const { dom, contentDOM } = (DOMSerializer.renderSpec as (...args: unknown[]) => {
      dom: globalThis.Node;
      contentDOM?: HTMLElement;
    })(
      doc,
      toDOM(node),
      null,
      node.attrs
    );

    if (contentDOM) {
      if (node.isLeaf) {
        throw new RangeError("Content hole not allowed in a leaf node spec");
      }
      this.serializeFragment(node.content, options, contentDOM);
    }

    return dom;
  };

  prototype.serializeMark = function serializeMark(
    this: DOMSerializer,
    mark: Mark,
    inline: boolean,
    options: { document?: Document } = {}
  ) {
    const toDOM = this.marks[mark.type.name];
    return toDOM
      ? (DOMSerializer.renderSpec as (...args: unknown[]) => {
          dom: globalThis.Node;
          contentDOM?: HTMLElement;
        })(getDocument(options), toDOM(mark, inline), null, mark.attrs)
      : null;
  };

  serializer[PATCH_FLAG] = true;
}
