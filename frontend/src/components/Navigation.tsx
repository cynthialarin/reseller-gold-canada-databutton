import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

export function Navigation() {
  const location = useLocation();

  const links = [
    { href: "/", label: "Home" },
    { href: "/Inventory", label: "Inventory" },
    { href: "/Analytics", label: "Analytics" },
  ];

  return (
    <nav className="flex space-x-4 px-4 py-2 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {links.map((link) => (
        <Link
          key={link.href}
          to={link.href}
          className={cn(
            "text-sm font-medium transition-colors hover:text-primary",
            location.pathname === link.href
              ? "text-foreground"
              : "text-foreground/60"
          )}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
