import { notFound } from "next/navigation";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { dracula } from "react-syntax-highlighter/dist/cjs/styles/prism";
import { Blog, listBlogs, readBlog } from "@/blog";
import { Metadata } from "next";

const SyntaxHighlighterComponent = SyntaxHighlighter as any;

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
                <SyntaxHighlighterComponent
                  style={dracula}
                  PreTag="div"
                  language={match[1]}
                  {...props}
                >
                  {String(children).replace(/\n$/, "")}
                </SyntaxHighlighterComponent>
              ) : (
                <code
                  className={[inline ? "" : "code-block", className].join("")}
                  {...props}
                >
                  {children}
                </code>
              );
            },
          }}
        >
          {blog.markdown}
        </Markdown>
        {blog.edittedBy ? (
          <span className="text-slate-400 text-xs italics">
            Editted by {blog.edittedBy}
          </span>
        ) : null}
      </article>
    </div>
  );
}

export async function generateStaticParams() {
  const dirs = await listBlogs();

  return dirs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: BlogPageProps): Promise<Metadata> {
  const blog = await readBlog(params.slug);

  return {
    title: blog.title,
    description: blog.description,
    authors: {
      name: "Dan Habot",
    },
    robots: "index",
    openGraph: {
      authors: ["Dan Habot"],
      description: blog.description,
      publishedTime: blog.createdAt,
      title: blog.title,
    },
  };
}
