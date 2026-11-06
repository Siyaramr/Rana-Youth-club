import type { ClubProfile } from '../data/clubProfile'

function About({
  profile,
  profileLoadError,
  boardImage,
}: {
  profile: ClubProfile
  profileLoadError: string
  boardImage: string
}) {
  return (
    <section className="about-section section-space" id="about" aria-labelledby="about-title">
      <div className="site-container club-profile">
        {profileLoadError && <p className="profile-load-error" role="alert">{profileLoadError}</p>}
        <div className="about-intro-grid">
          <div className="profile-introduction">
            <span className="section-kicker">हाम्रो परिचय</span>
            <h2 id="about-title">राना युथ क्लब</h2>
            <p>{profile.introduction}</p>
          </div>
          <figure className="rajpur-board-photo">
            <img src={boardImage} alt="राजपुर लेखिएको स्थानीय स्वागत बोर्ड" loading="lazy" />
            <figcaption>
              <a href="https://maps.app.goo.gl/N4PYtdzysmup5tjY8" target="_blank" rel="noopener noreferrer">
                राजपुर, नेपाल
              </a>
            </figcaption>
          </figure>
        </div>

        <div className="mission-vision-grid">
          <article className="profile-statement">
            <span className="profile-statement-icon" aria-hidden="true">
              <svg viewBox="0 0 32 32"><path d="M16 27s-10-6-10-14a5 5 0 0 1 10-1 5 5 0 0 1 10 1c0 8-10 14-10 14Z" /><path d="M11 16h3l2-4 3 8 2-4h3" /></svg>
            </span>
            <span className="section-kicker">हाम्रो मिशन</span>
            <h3>समुदायका लागि साझा पहल</h3>
            <p>{profile.mission}</p>
          </article>
          <article className="profile-statement">
            <span className="profile-statement-icon" aria-hidden="true">
              <svg viewBox="0 0 32 32"><circle cx="16" cy="16" r="11" /><circle cx="16" cy="16" r="6" /><circle cx="16" cy="16" r="1.5" /><path d="m20 12 7-7m-5 0h5v5" /></svg>
            </span>
            <span className="section-kicker">हाम्रो दृष्टि</span>
            <h3>सहभागी र सहयोगी राजपुर</h3>
            <p>{profile.vision}</p>
          </article>
        </div>

        <div className="goals-impact-grid">
          <section className="profile-goals" aria-labelledby="goals-title">
            <span className="section-kicker">हामी के गर्न चाहन्छौँ</span>
            <h3 id="goals-title">क्लबका लक्ष्यहरू</h3>
            <div className="goal-list">
              {profile.goals.map((goal, index) => (
                <article className="goal-item" key={goal.title}>
                  <span className="goal-number">{String(index + 1).padStart(2, '0')}</span>
                  <div>
                    <h4>{goal.title}</h4>
                    <p>{goal.description}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>
          <section className="profile-impact" aria-labelledby="impact-title">
            <span className="section-kicker">समुदायमा योगदान</span>
            <h3 id="impact-title">हाम्रो प्रभावको लक्ष्य</h3>
            <p className="impact-intro">
              यी क्लबका लक्षित योगदान हुन्; हासिल भइसकेका नतिजा वा गतिविधिको दाबी होइनन्।
            </p>
            <ul>
              {profile.communityImpact.map((impact) => (
                <li key={impact}><span aria-hidden="true">✓</span>{impact}</li>
              ))}
            </ul>
          </section>
        </div>

        <section className="committee-section" aria-labelledby="committee-title">
          <div className="committee-heading">
            <div>
              <span className="section-kicker">हाम्रो समूह</span>
              <h3 id="committee-title">क्लब समिति तथा सदस्यहरू</h3>
              <p>समिति सदस्यका प्रमाणित नाम, जिम्मेवारी र परिचय उपलब्ध भएपछि थपिनेछन्।</p>
            </div>
          </div>
          {profile.committeeMembers.length > 0 ? (
            <div className="team-grid">
              {profile.committeeMembers.map((member) => (
                <article className="team-card" key={`${member.name}-${member.role}`}>
                  {member.image ? (
                    <img src={member.image} alt={`${member.name} को तस्बिर`} loading="lazy" />
                  ) : (
                    <div className="team-avatar" aria-hidden="true">{member.name.slice(0, 1)}</div>
                  )}
                  <h4>{member.name}</h4>
                  <span>{member.role}</span>
                  <p>{member.bio}</p>
                </article>
              ))}
            </div>
          ) : (
            <div className="committee-empty" role="status">
              <span className="committee-empty-icon" aria-hidden="true">
                <svg viewBox="0 0 36 36"><circle cx="13" cy="12" r="5" /><circle cx="25" cy="13" r="4" /><path d="M3 30c.5-6 3.8-9 10-9s9.5 3 10 9m-1-8c5-.5 8.7 2.2 9 7" /></svg>
              </span>
              <p>समिति र सदस्यहरूको विवरण पुष्टि भएपछि यहाँ परिचय कार्डहरू देखिनेछन्।</p>
            </div>
          )}
        </section>
      </div>
    </section>
  )
}

export default About
