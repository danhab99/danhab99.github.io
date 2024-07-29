import { listBlogs, readBlog } from "@/blog";
import Link from "next/link";

export default async function BlogList() {
  const names = await listBlogs();

  const blogs = await Promise.all(
    names.map(async (name) => {
      const blog = await readBlog(name);

      return (
        <div className="py-2">
          <Link href={`/blog/${name}`}>
            <div className="card bg-gradient-to-br from-yellow-100 to-yellow-300">
              <div className="flex flex-row justify-between items-center">
                <h3 className="text-slate-900">{blog.title}</h3>
                <span className="text-slate-700 text-sm h-fit">
                  {blog.createdAt}
                </span>
              </div>
              <p className="pt-4 text-slate-900">{blog.description}</p>
            </div>
          </Link>
        </div>
      );
    }),
  );

  return (
    <div className="center">
      <div className="center-wide">
        <div className="py-6">
          <h1 className="text-center lg:text-8xl">Blogs</h1>
        </div>
        <main>{blogs}</main>
      </div>
    </div>
  );
}
