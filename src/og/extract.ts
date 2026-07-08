import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkMdx from "remark-mdx";
import { visit, SKIP } from "unist-util-visit";
import type { CollectionEntry } from "astro:content";

const TEXT_NODE_TYPES = new Set(["text", "inlineCode"]);
const SKIP_SUBTREE_TYPES = new Set(["code", "mdxjsEsm"]);

export function extractBodyText(entry: CollectionEntry<"blog">): string {
  const body = entry.body ?? "";
  const processor = entry.filePath?.endsWith(".mdx")
    ? unified().use(remarkParse).use(remarkMdx)
    : unified().use(remarkParse);
  const tree = processor.parse(body);

  const parts: string[] = [];
  visit(tree, (node) => {
    if (SKIP_SUBTREE_TYPES.has(node.type)) {
      return SKIP;
    }
    if (node.type === "mdxJsxFlowElement" || node.type === "mdxJsxTextElement") {
      // JSX attributes (e.g. caption="...") are not article prose; descend
      // into children only, where nested prose (e.g. inside <VideoContext>) lives.
      return;
    }
    if (TEXT_NODE_TYPES.has(node.type) && "value" in node && typeof node.value === "string") {
      parts.push(node.value);
    }
    return;
  });

  return parts.join(" ");
}
