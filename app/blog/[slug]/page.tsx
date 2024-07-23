import fs from "fs/promises";
import { notFound } from "next/navigation";
import * as path from "path";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { dracula } from "react-syntax-highlighter/dist/cjs/styles/prism";

const MD_BASEDIR = path.join(process.cwd(), "blog");

export default async function BlogPage({ params }) {
  const name = params.slug;
  let content;

  try {
    content = await fs.readFile(`${MD_BASEDIR}/${name}`, "utf8");
  } catch (error) {
    notFound();
  }

  console.log("BLOG", name, content);

  return (
    <div className="flex flex-row justify-center items-center">
      <article className="lg:w-2/3 w-9/10">
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
          {content}
        </Markdown>
      </article>
    </div>
  );
}

export async function generateStaticParams() {
  const dirs = await fs.readdir(MD_BASEDIR);

  console.log("list", dirs);

  return dirs.map((slug) => ({ slug }));
}
