import React from 'react';
import './AboutUs.css';

const AboutUs = () => {
  return (
    <div className="aboutus-container">
      <header className="aboutus-header">
        <h1>About Rise Underdog</h1>
        <p>Your Ultimate eSports Destination</p>
      </header>
      
      <section className="aboutus-section">
        <h2>Our Mission</h2>
        <p>At Rise Underdog, our mission is to revolutionize the eSports experience by offering a platform that is both competitive and user-centric. We strive to bring gamers from all corners of the globe together through exhilarating tournaments and a vibrant community.</p>
      </section>

      <section className="aboutus-section">
        <h2>Our Vision</h2>
        <p>We envision a world where every gamer has the opportunity to showcase their talents and compete at the highest level. Our platform is built to empower gamers of all skill levels, fostering an inclusive and dynamic eSports ecosystem.</p>
      </section>

      <section className="aboutus-section">
        <h2>Platform Features</h2>
        <ul>
          <li><strong>Competitive Tournaments:</strong> Engage in diverse tournaments with enticing entry fees and rewards.</li>
          <li><strong>Real-Time Leaderboards:</strong> Monitor your performance and see where you stand against others.</li>
          <li><strong>Effortless Matchmaking:</strong> Join games seamlessly with our advanced matchmaking technology.</li>
          <li><strong>Secure Transactions:</strong> Experience worry-free transactions with our secure payment gateway.</li>
          <li><strong>Community Interaction:</strong> Connect with gamers through forums, live chats, and exciting events.</li>
        </ul>
      </section>

      <section className="aboutus-section">
        <h2>Meet the Team</h2>
        <p>Our team at Rise Underdog consists of dedicated gamers and seasoned professionals who are passionate about advancing the eSports landscape. We leverage our collective expertise to ensure that Rise Underdog remains a leader in the eSports arena.</p>
      </section>
    </div>
  );
};

export default AboutUs;
