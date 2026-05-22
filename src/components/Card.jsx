export function Card({ icon, title, text, badge, subtle = false }) {
  return (
    <article className={`feature-card${subtle ? " feature-card-subtle" : ""}`}>
      {icon ? <div className="feature-card-icon">{icon}</div> : null}

      <div className="feature-card-content">
        {badge ? <span className="feature-card-badge">{badge}</span> : null}
        <h3>{title}</h3>
        <p>{text}</p>
      </div>
    </article>
  );
}
