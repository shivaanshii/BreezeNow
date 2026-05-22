export function Hero({ kicker, headline, description, actions, children }) {
  return (
    <section className="hero-section">
      <div className="hero-copy">
        <p className="section-kicker">{kicker}</p>
        <h1>{headline}</h1>
        <p className="hero-description">{description}</p>
        <div className="hero-actions">{actions}</div>
      </div>

      <div className="hero-visual">{children}</div>
    </section>
  );
}
