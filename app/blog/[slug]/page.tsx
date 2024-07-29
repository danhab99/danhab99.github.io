import fs from "fs/promises";
import { notFound } from "next/navigation";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { dracula } from "react-syntax-highlighter/dist/cjs/styles/prism";
import { Blog, MD_BASEDIR, listBlogs, readBlog } from "@/blog";

type BlogPageProps = {
  params: { slug: string };
};

export default async function BlogPage({ params }: BlogPageProps) {
  const name = params.slug;
  var blog: Blog;

  try {
    blog = await readBlog(name);
  } catch (error) {
    notFound();
  }

  return (
    <div className="center items-center">
      <article className="center-wide">
        <div className="py-8">
          <h1 className="text-6xl text-center underline text-shadow">
            {blog.title}
          </h1>
        </div>

        <Markdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw]}
          components={{
            code({ node, inline, className, children, ...props }: any) {
              const match = /language-(\w+)/.exec(className || "");

              return !inline && match ? (
                <SyntaxHighlighter
                  style={dracula}
                  PreTag="div"
                  language={match[1]}
                  {...props}
                >
                  {String(children).replace(/\n$/, "")}
                </SyntaxHighlighter>
              ) : (
                <code className={className} {...props}>
                  {children}
                </code>
              );
            },
          }}
        >
          {blog.markdown}
        </Markdown>
      </article>
    </div>
  );
}

export async function generateStaticParams() {
  const dirs = await listBlogs();

  return dirs.map((slug) => ({ slug }));
}
