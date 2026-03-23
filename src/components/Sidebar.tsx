"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "@/components/ThemeToggle";
import { UserButton, useUser } from "@clerk/nextjs";

const links = [
  { href: "/", label: "Dashboard" },
  { href: "/create-request", label: "Create Request" },
  { href: "/requests", label: "Requests" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useUser();
  const role = user?.publicMetadata?.role as string | undefined;

  return (
    <aside className="w-full border-b bg-white dark:border-gray-800 dark:bg-gray-900 md:min-h-screen md:w-64 md:border-b-0 md:border-r">
      <div className="border-b px-6 py-5 dark:border-gray-800">
        <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">
          DocuFlow
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Document management app
        </p>
      </div>

      <nav className="flex gap-2 overflow-x-auto px-4 py-4 md:block md:space-y-2">
        {links.map((link) => {
          const isActive = pathname === link.href;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`block rounded-lg px-4 py-3 text-sm font-medium transition ${
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-4 pb-4 md:pt-4">
        <ThemeToggle />
      </div>
        <div className="mt-6 border-t border-gray-200 pt-4 dark:border-gray-800">
            <div className="rounded-xl border border-gray-200 p-3 dark:border-gray-800">
            <div className="flex items-center gap-3">
            <UserButton />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-gray-800 dark:text-gray-100">
                {user?.fullName || user?.primaryEmailAddress?.emailAddress || "User"}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Role: {role || "employee"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}