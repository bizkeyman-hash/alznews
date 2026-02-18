import Link from "next/link";
import { CATEGORIES } from "@/lib/constants";

export default function Footer() {
  return (
    <footer className="bg-[#181B2E]/80 backdrop-blur-xl py-10">
      {/* Top gradient divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-[#2A2D45] to-transparent" />
      <div className="mx-auto max-w-7xl px-4 pt-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          {/* Brand */}
          <div>
            <p className="text-lg font-bold text-slate-100">
              Austin&apos;s{" "}
              <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
                Alz
              </span>
              News
            </p>
            <p className="mt-1 text-sm text-[#636789]">
              알츠하이머 뉴스 & 리서치 허브
            </p>
          </div>
          {/* Category quick links */}
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            {CATEGORIES.map((category) => (
              <Link
                key={category.slug}
                href={`/category/${category.slug}`}
                className="text-sm text-[#636789] transition-colors hover:text-[#9094B0]"
              >
                {category.name}
              </Link>
            ))}
          </div>
        </div>
        <p className="mt-8 text-center text-xs text-[#4A4E6A]">
          &copy; 2026 Austin&apos;s AlzNews. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
