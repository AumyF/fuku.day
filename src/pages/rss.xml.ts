import rss from "@astrojs/rss";
import { type APIContext } from "astro";
import { getCollection } from "astro:content";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { loadRenderers } from "astro:container";
import { getContainerRenderer } from "@astrojs/mdx";

function pubDate(slug: string) {
  const [yyyy, mm, dd] = slug.split("-");
  return new Date([yyyy, mm, dd].join("-"));
}

export async function GET(context: APIContext) {
  if (!context.site) {
    throw new TypeError("context.site falsy");
  }

  const container = await AstroContainer.create({
    renderers: await loadRenderers([getContainerRenderer()]),
  });

  const blog = await getCollection("blog");

  blog.reverse();

  return rss({
    title: "fuku.day/blog",
    description: "AumyF's blog",
    site: context.site,
    items: await Promise.all(
      blog.map(async (post) => ({
        title: post.data.title,
        description: post.data.description,
        link: `/blog/${post.slug}`,
        pubDate: pubDate(post.slug),
        content: await container.renderToString((await post.render()).Content),
      }))
    ),
  });
}
