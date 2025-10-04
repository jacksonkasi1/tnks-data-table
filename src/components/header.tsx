"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "./ui/theme-toggle";
import { UserAvatar } from "./user-avatar";

export function Header() {
  const pathname = usePathname();
  
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center justify-between px-6 ">
        <div className="flex items-center gap-2 md:gap-4">
          <Link href="/" className="flex items-center space-x-2">
            <span className="hidden font-bold sm:inline-block">
              DataTable
            </span>
          </Link>
          <nav className="flex items-center gap-4 sm:gap-6">
            <Link
              href="/"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                pathname === "/" ? "text-primary font-semibold" : ""
              }`}
            >
              Users (snake_case)
              <span className="ml-1 text-xs opacity-60">API</span>
            </Link>
            <Link
              href="/example/users-camel-case"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                pathname === "/example/users-camel-case" ? "text-primary font-semibold" : ""
              }`}
            >
              User CamelCase
              <span className="ml-1 text-xs opacity-60">API</span>
            </Link>
            <Link
              href="/example/orders"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                pathname === "/example/orders" ? "text-primary font-semibold" : ""
              }`}
            >
              Orders
              <span className="ml-1 text-xs opacity-60">Subrows</span>
            </Link>
            <Link
              href="/example/bookings"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                pathname === "/example/bookings" ? "text-primary font-semibold" : ""
              }`}
            >
              Bookings
              <span className="ml-1 text-xs opacity-60">Subrows</span>
            </Link>
            <Link
              href="/example/tickets"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                pathname === "/example/tickets" ? "text-primary font-semibold" : ""
              }`}
            >
              Tickets
              <span className="ml-1 text-xs opacity-60">Subrows</span>
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <UserAvatar />
        </div>
      </div>
    </header>
  );
}