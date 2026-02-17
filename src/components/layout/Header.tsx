import Link from "next/link";
import { CATEGORIES } from "@/lib/constants";

export default function Header() {
  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-gray-900">
            Austin&apos;s <span className="text-blue-600">Alz</span>News
          </Link>
          <nav className="hidden gap-6 md:flex">
            {CATEGORIES.map((category) => (
              <Link
                key={category.slug}
                href={`/category/${category.slug}`}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                {category.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}
