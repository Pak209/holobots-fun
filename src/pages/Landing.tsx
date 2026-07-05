import { Link } from "react-router-dom";

const navItems = [
  { label: "Download", href: "#download" },
  { label: "Legal", href: "#legal" },
  { label: "Contact", href: "#contact" },
];

const appHighlights = [
  "Mobile-first Holobot collection and progression",
  "Fitness-aware Sync systems for supported builds",
  "Arena and account progress managed in the mobile app",
];

const legalLinks = [
  {
    title: "Privacy Policy",
    body: "How Holobots handles account, gameplay, device, and optional fitness data.",
    to: "/privacy",
  },
  {
    title: "Terms of Use",
    body: "Rules for using Holobots, testing builds, virtual items, and fair play.",
    to: "/terms",
  },
  {
    title: "Delete Account",
    body: "Request deletion of your Holobots account and associated app data.",
    to: "/delete-account",
  },
];

const Landing = () => {
  return (
    <div className="site-shell">
      <header className="site-header">
        <Link to="/" className="brand-mark" aria-label="Holobots home">
          <span className="brand-emblem">H</span>
          <span>Holobots</span>
        </Link>

        <nav className="site-nav" aria-label="Primary navigation">
          {navItems.map((item) => (
            <a key={item.href} href={item.href}>
              {item.label}
            </a>
          ))}
        </nav>
      </header>

      <main>
        <section className="hero-section">
          <div className="hero-copy">
            <h1>Holobots</h1>
            <p className="hero-lede">
              The public home for the Holobots mobile app. Get launch updates,
              app access links, legal policies, and business contact details in
              one lightweight hub.
            </p>
            <div className="hero-actions">
              <a className="button-primary" href="#download">
                Get app updates
              </a>
              <a className="button-secondary" href="mailto:support@holobots.fun">
                Contact support
              </a>
            </div>
          </div>

          <div className="phone-showcase" aria-label="Holobots mobile app preview">
            <div className="phone-frame">
              <div className="phone-screen">
                <img src="/og-image.png" alt="Holobots artwork preview" />
                <div className="phone-caption">
                  <span>Mobile app</span>
                  <strong>Coming soon</strong>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="content-band">
          <div className="section-heading">
            <h2>Built For Mobile</h2>
            <p>
              Holobots.fun is now the front door. Gameplay development and the
              active app experience live in HolobotsMobile.
            </p>
          </div>

          <div className="highlight-list">
            {appHighlights.map((item) => (
              <div className="highlight-row" key={item}>
                <span aria-hidden>+</span>
                <p>{item}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="download" className="download-section">
          <div>
            <h2>Download Access</h2>
            <p>
              App Store, TestFlight, and Android testing links will appear here
              when the next public build is ready.
            </p>
          </div>

          <div className="download-grid">
            <a className="download-card" href="mailto:support@holobots.fun?subject=Holobots%20TestFlight%20Request">
              <span>iOS</span>
              <strong>Request TestFlight</strong>
            </a>
            <a className="download-card" href="mailto:support@holobots.fun?subject=Holobots%20Android%20Testing%20Request">
              <span>Android</span>
              <strong>Testing waitlist</strong>
            </a>
            <a className="download-card" href="https://github.com/Pak209/holobots-fun">
              <span>GitHub</span>
              <strong>Web hub repo</strong>
            </a>
          </div>
        </section>

        <section id="legal" className="legal-section">
          <div className="section-heading">
            <h2>Policies And Account Help</h2>
            <p>
              Store review, tester onboarding, and account support links stay
              available here even while the mobile app evolves.
            </p>
          </div>

          <div className="legal-grid">
            {legalLinks.map((link) => (
              <Link className="legal-card" key={link.to} to={link.to}>
                <h3>{link.title}</h3>
                <p>{link.body}</p>
              </Link>
            ))}
          </div>
        </section>

        <section id="contact" className="contact-section">
          <div>
            <h2>Contact</h2>
            <p>
              For business inquiries, app testing access, account support, or
              platform review questions, reach the Holobots team by email.
            </p>
          </div>
          <div className="contact-actions">
            <a href="mailto:support@holobots.fun">support@holobots.fun</a>
            <a href="mailto:support@holobots.fun?subject=Holobots%20Business%20Inquiry">
              Business inquiry
            </a>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <span>© 2026 Holobots</span>
        <div>
          <Link to="/privacy">Privacy</Link>
          <Link to="/terms">Terms</Link>
          <Link to="/delete-account">Delete account</Link>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
