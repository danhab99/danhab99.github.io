import { GetStaticPaths, GetStaticProps } from "next";
import Markdown from "react-markdown";
import fs from "fs/promises";
import { basename } from "path";

type SlugPageProps = {
  markdown: string;
};

export default function Slug(props: SlugPageProps) {
  return (
    <div>
      <article>
        <Markdown>{props.markdown}</Markdown>
      </article>
    </div>
  );
}

const root = "."

export const getStaticPaths = (async () => {
  const blogFiles = await fs.readdir(`${root}/blog`);

  const paths = blogFiles.map((name) => ({
    params: {
      slug: basename(name),
    }
  }));

  return {
    fallback: false,
    paths: paths,
  };
}) satisfies GetStaticPaths<{
  slug: string;
}>;

export const getStaticProps = (async (context) => {
  const slug = context.params?.["slug"] as string;
  const content = await fs.readFile(`${root}/blog/${slug}`);

  return {
    props: {
      markdown: content.toString(),
    }
  };
}) satisfies GetStaticProps<SlugPageProps>;
