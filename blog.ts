import path from "path";
import fs from "fs/promises";
import { parse } from "yaml";

export const MD_BASEDIR = path.join(process.cwd(), "blog");

export type Blog = {
  title: string;
  markdown: string;
  createdAt: string;
  description: string;
  edittedBy: string;
};

export type BlogHeader = Omit<Blog, "markdown">;

export async function readBlog(name: string): Promise<Blog> {
  const raw = await fs.readFile(path.join(MD_BASEDIR, name + ".md"), {
    encoding: "utf-8",
  });

  const split = raw.indexOf("---");

  const headerStr = raw.slice(0, split);
  const markdown = raw.slice(split);

  const header: BlogHeader = parse(headerStr);

  return {
    ...header,
    markdown,
  };
}

export async function listBlogs(): Promise<string[]> {
  const names = await fs.readdir(MD_BASEDIR);
  return names.map((x) => x.slice(0, x.length - 3));
}
