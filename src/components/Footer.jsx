const GitHubMark = ({ className, ...props }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
    {...props}
  >
    <rect x="4" y="4" width="16" height="16" rx="5" />
    <path d="M10 9 L7 12 L10 15" />
    <path d="M14 9 L17 12 L14 15" />
  </svg>
);

const socialLinks = [
  {
    label: "GitHub",
    href: "https://github.com/gyanshankar1708/BreezeNow",
    icon: GitHubMark,
  },
];

const quickLinks = [
  { label: "Home", href: "#top" },
  { label: "Forecast", href: "#forecast" },
  { label: "Maps", href: "#weather" },
  { label: "About Us", href: "#about" },
];

const resources = [
  { label: "Weather API", href: "https://www.weatherapi.com/" },
  { label: "Documentation", href: "https://www.weatherapi.com/docs/" },
  { label: "Privacy Policy", href: "#privacy" },
  { label: "Terms of Service", href: "#terms" },
];

export function Footer() {
  return (
    <footer
      className="mx-auto mt-12 w-[min(1180px,calc(100%-2rem))] rounded-[28px] border border-[var(--border)] bg-[var(--surface)] px-6 py-8 text-[var(--text)] shadow-[var(--shadow)] backdrop-blur-xl sm:px-8 lg:px-10"
      aria-label="Global footer"
    >
      <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-4">
        <div className="space-y-5 xl:pr-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(242,138,43,0.16)] bg-[rgba(242,138,43,0.1)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--accent)]">
              BreezeNow
            </div>
            <p className="mt-4 max-w-sm text-sm leading-6 text-[var(--muted)]">
              Your personal weather companion for real-time updates and
              accurate forecasts.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {socialLinks.map((link) => {
              const SocialIcon = link.icon;

              return (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={link.label}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface-strong)] text-[var(--text)] transition duration-200 hover:-translate-y-0.5 hover:border-[rgba(242,138,43,0.3)] hover:bg-[rgba(242,138,43,0.08)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(242,138,43,0.25)]"
                >
                  <SocialIcon className="h-5 w-5" />
                </a>
              );
            })}
          </div>
        </div>

        <nav className="space-y-4" aria-label="Quick links">
          <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--text)]">
            Quick Links
          </h2>
          <ul className="space-y-3">
            {quickLinks.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  className="text-sm text-[var(--muted)] transition hover:text-[var(--accent)] focus-visible:outline-none focus-visible:text-[var(--accent)]"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <nav className="space-y-4" aria-label="Resources">
          <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--text)]">
            Resources
          </h2>
          <ul className="space-y-3">
            {resources.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  target={link.href.startsWith("http") ? "_blank" : undefined}
                  rel={link.href.startsWith("http") ? "noreferrer" : undefined}
                  className="text-sm text-[var(--muted)] transition hover:text-[var(--accent)] focus-visible:outline-none focus-visible:text-[var(--accent)]"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--text)]">
            Newsletter
          </h2>
          <p className="max-w-sm text-sm leading-6 text-[var(--muted)]">
            Stay updated with the latest forecasts, weather tips, and product
            updates.
          </p>

          <form
            className="space-y-3"
            onSubmit={(event) => event.preventDefault()}
          >
            <label htmlFor="footer-email" className="sr-only">
              Email address
            </label>
            <input
              id="footer-email"
              type="email"
              name="email"
              placeholder="Enter your email"
              className="h-12 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-strong)] px-4 text-sm text-[var(--text)] outline-none transition placeholder:text-[var(--muted)] focus:border-[rgba(242,138,43,0.35)] focus:bg-[var(--surface-strong)] focus:ring-2 focus:ring-[rgba(242,138,43,0.16)]"
            />
            <button
              type="submit"
              className="inline-flex h-12 w-full items-center justify-center rounded-2xl !border !border-[rgba(255,255,255,0.18)] !bg-[var(--accent)] px-5 text-sm font-semibold !text-white shadow-[0_10px_24px_rgba(242,138,43,0.22)] transition duration-200 hover:-translate-y-0.5 hover:!bg-[var(--accent-strong)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(242,138,43,0.28)]"
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>

      <div className="mt-8 border-t border-[var(--border)] pt-5">
        <p className="text-center text-xs leading-6 text-[var(--muted)] sm:text-sm">
          © 2026 BreezeNow. Created by GyanShankar Singh. Powered by Weather
          API.
        </p>
      </div>
    </footer>
  );
}