import React from 'react'
import '../../App.css'
export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-column footer-brand">
          <div className="footer-logo-row">
            <img src="/assets/footer.jpeg" alt="Kufi Travel" className="footer-logo-img" />
            {/* <div className="footer-logo-text">
              <p className="footer-logo-name">Kufi</p>
              <p className="footer-logo-sub">Travel</p>
            </div> */}
          </div>
          <p className="footer-description">
            Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem ipsum
            has been the industry&apos;s standard dummy text ever.
          </p>
          <div className="footer-connect-label">Connect with us</div>
          <div className="footer-social-row">
            <span className="footer-social-circle">f</span>
            <span className="footer-social-circle">in</span>
            <span className="footer-social-circle">ig</span>
            <span className="footer-social-circle">tw</span>
          </div>
        </div>

        <div className="footer-column footer-links">
          <h4 className="footer-column-title">Our Services</h4>
          <ul className="footer-link-list">
            <li>Home</li>
            <li>About</li>
            <li>Destination</li>
            <li>Book Tour</li>
            <li>Blog</li>
          </ul>
        </div>

        <div className="footer-column footer-links">
          <h4 className="footer-column-title">Quick Link</h4>
          <ul className="footer-link-list">
            <li>FAQ&apos;s</li>
            <li>Privacy Policy</li>
            <li>Term &amp; Conditions</li>
            <li>Support</li>
          </ul>
        </div>

        <div className="footer-column footer-contact">
          <h4 className="footer-column-title">Quick contact</h4>
          <ul className="footer-contact-list">
            <li>
              <span className="footer-contact-icon">●</span>
              <span>Lorem ipsum dolor sit amet consectetuer.</span>
            </li>
            <li>
              <span className="footer-contact-icon">☎</span>
              <span>123 456 7890</span>
            </li>
            <li>
              <span className="footer-contact-icon">✉</span>
              <span>info@loremipsum.com</span>
            </li>
          </ul>
        </div>

        <div className="footer-column footer-member">
          <h4 className="footer-column-title">Become a member</h4>
          <div className="footer-email-wrap">
            <input
              className="footer-email-input"
              type="email"
              placeholder="Enter your email"
            />
            <button className="footer-email-btn">➤</button>
          </div>
          <div className="footer-cards-row">
            <span className="footer-card-pill">VISA</span>
            <span className="footer-card-pill">Mastercard</span>
            <span className="footer-card-pill">PayPal</span>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        © Copyright lorem ipsum amet dolor All Rights Reserved.
      </div>
    </footer>
  )
}
