import Link from "next/link";
import { CATEGORIES } from "@/lib/constants";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-[#181B2E]/80 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-slate-100">
            Austin&apos;s{" "}
            <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
              Alz
            </span>
            News
          </Link>
          <nav className="hidden gap-6 md:flex">
            {CATEGORIES.map((category) => (
              <Link
                key={category.slug}
                href={`/category/${category.slug}`}
                className="relative text-sm text-[#9094B0] transition-colors hover:text-slate-100 after:absolute after:bottom-[-4px] after:left-0 after:h-[2px] after:w-0 after:bg-gradient-to-r after:from-indigo-400 after:to-violet-400 after:transition-all after:duration-300 hover:after:w-full"
              >
                {category.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>
      {/* Bottom gradient border */}
      <div className="h-px bg-gradient-to-r from-transparent via-[#2A2D45] to-transparent" />
    </header>
  );
}
