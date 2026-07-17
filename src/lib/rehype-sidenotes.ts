import type { Element, ElementContent, Root } from "hast";
import { defineHastPlugin } from "satteri";

const isElement = (node: ElementContent | Root): node is Element =>
  node.type === "element";

const hasClass = (node: Element, className: string) => {
  const classes = node.properties.className;
  return Array.isArray(classes) && classes.includes(className);
};

const cloneWithoutBackrefs = (nodes: ElementContent[]): ElementContent[] => {
  const cloned: ElementContent[] = [];

  for (const node of structuredClone(nodes)) {
    if (!isElement(node)) {
      cloned.push(node);
      continue;
    }
    if (
      node.properties.dataFootnoteBackref !== undefined ||
      hasClass(node, "data-footnote-backref")
    ) {
      continue;
    }

    delete node.properties.id;
    node.children = cloneWithoutBackrefs(node.children);
    cloned.push(node);
  }

  return cloned;
};

const footnoteIdFromHref = (href: unknown) =>
  typeof href === "string" && href.startsWith("#")
    ? href.slice(1)
    : undefined;

const createSidenotesPlugin = () => {
  const references = new Map<string, { id: string; number: string }>();

  return defineHastPlugin({
    name: "fuku-day-sidenotes",
    element: [
      {
        filter: ["a"],
        visit(node, context) {
          if (node.properties.dataFootnoteRef === undefined) return;

          const footnoteId = footnoteIdFromHref(node.properties.href);
          if (!footnoteId) return;

          const id =
            typeof node.properties.id === "string"
              ? node.properties.id
              : `footnote-reference-${footnoteId}`;
          const number = context.textContent(node);

          context.setProperty(node, "dataFootnoteId", footnoteId);
          context.setProperty(node, "ariaLabel", `脚注 ${number} を読む`);
          context.setProperty(node, "ariaDescribedBy", null);
          references.set(footnoteId, { id, number });
        },
      },
      {
        filter: ["section"],
        visit(footnotes, context) {
          if (footnotes.properties.dataFootnotes === undefined) return;

          const list = footnotes.children.find(
            (node): node is Element =>
              isElement(node) && node.tagName === "ol",
          );
          if (!list) return;

          const sidenotes: Element[] = [];
          for (const item of list.children) {
            if (!isElement(item) || item.tagName !== "li") continue;
            const footnoteId =
              typeof item.properties.id === "string"
                ? item.properties.id
                : undefined;
            if (!footnoteId) continue;

            const reference = references.get(footnoteId);
            if (!reference) continue;

            sidenotes.push({
              type: "element",
              tagName: "aside",
              properties: {
                id: `sidenote-${footnoteId}`,
                className: ["sidenote"],
                dataSidenote: true,
                dataFootnoteId: footnoteId,
                dataFor: reference.id,
                role: "note",
                ariaLabel: `脚注 ${reference.number}`,
              },
              children: [
                {
                  type: "element",
                  tagName: "span",
                  properties: {
                    className: ["sidenote-number"],
                    ariaHidden: "true",
                  },
                  children: [{ type: "text", value: reference.number }],
                },
                {
                  type: "element",
                  tagName: "div",
                  properties: { className: ["sidenote-body"] },
                  children: cloneWithoutBackrefs(item.children),
                },
              ],
            });
          }

          if (sidenotes.length === 0) return;
          context.insertBefore(footnotes, {
            type: "element",
            tagName: "div",
            properties: {
              className: ["sidenotes"],
              dataSidenotes: true,
            },
            children: sidenotes,
          });
        },
      },
    ],
  });
};

export default createSidenotesPlugin;
