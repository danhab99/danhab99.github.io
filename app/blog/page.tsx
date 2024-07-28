import { MD_BASEDIR } from "@/utils";
import fs from "fs/promises";
import Link from "next/link";

export default async function BlogList() {
  const names = await fs.readdir(MD_BASEDIR);

  const blogs = await Promise.all(
    names.map(async (name) => {
      const content = await fs.readFile(`${MD_BASEDIR}/${name}`, "utf8");

      const firstLineIndex = content.indexOf("\n\n");
      const secondLineIndex = content.indexOf("\n\n", firstLineIndex + 3);

      const title = content.slice(0, firstLineIndex);
      const firstLine = content.slice(firstLineIndex, secondLineIndex);

      return (
        <li className="py-2">
          <Link href={`/blog/${name}`}>
            <div className="card bg-gradient-to-br from-yellow-100 to-yellow-300">
              <h3 className="text-slate-900">{title.slice(2)}</h3>
              <p className="pt-4 text-slate-900">{firstLine}</p>
            </div>
          </Link>
        </li>
      );
    }),
  );

  return (
    <div className="center">
      <div className="center-wide">
        <div className="py-6">
          <h1 className="text-center lg:text-8xl">Blogs</h1>
        </div>
        <main>
          <ul>{blogs}</ul>
        </main>
      </div>
    </div>
  );
}
