import type { APIRoute, GetStaticPaths } from "astro";
import { getCollection } from "astro:content";
import { extractBodyText } from "../../og/extract.ts";
import { generateOgImage } from "../../og/image.ts";

export const getStaticPaths = (async () => {
  const blog = await getCollection("blog");
  return blog.map((entry) => ({ params: { id: entry.id }, props: { entry } }));
}) satisfies GetStaticPaths;

export const GET: APIRoute = async ({ props }) => {
  const { entry } = props;
  const bodyText = extractBodyText(entry);

  const png = await generateOgImage({
    title: entry.data.title,
    bodyText,
  });

  return new Response(new Uint8Array(png), {
    headers: { "Content-Type": "image/png" },
  });
};
