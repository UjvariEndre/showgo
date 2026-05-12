import { Github, Instagram, Twitter } from "lucide-react";

const links = [
  { href: "#home", label: "Home" },
  { href: "#events", label: "Events" },
  { href: "#about", label: "About" },
];

const socials = [
  { href: "#", label: "ShowGo on Instagram", Icon: Instagram },
  { href: "#", label: "ShowGo on Twitter", Icon: Twitter },
  { href: "#", label: "ShowGo on GitHub", Icon: Github },
];

export function Footer() {
  return (
    <footer
      id="about"
      className="border-t border-white/5 bg-bg-raised/40"
      aria-label="Site footer"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10 sm:flex-row sm:items-center sm:justify-between">
        <a
          href="#home"
          className="focus-ring rounded-md text-base font-semibold tracking-tight"
          aria-label="ShowGo home"
        >
          <span className="bg-accent-gradient bg-clip-text text-transparent">
            Show
          </span>
          <span className="text-white">Go</span>
        </a>

        <ul className="flex flex-wrap items-center gap-1 text-sm">
          {links.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className="focus-ring rounded-md px-3 py-2 text-white/55 transition-colors hover:text-white"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <ul className="flex items-center gap-1">
          {socials.map(({ href, label, Icon }) => (
            <li key={label}>
              <a
                href={href}
                aria-label={label}
                className="focus-ring flex h-9 w-9 items-center justify-center rounded-md text-white/55 transition-colors hover:bg-white/5 hover:text-white"
              >
                <Icon size={16} />
              </a>
            </li>
          ))}
        </ul>
      </div>

      <div className="border-t border-white/5">
        <p className="mx-auto max-w-6xl px-6 py-4 text-xs text-white/35">
          &copy; {new Date().getFullYear()} ShowGo. Built for music fans.
        </p>
      </div>
    </footer>
  );
}
