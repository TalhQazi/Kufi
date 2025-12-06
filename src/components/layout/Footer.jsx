import React from 'react'
import '../../App.css'

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-column footer-brand">
          <div className="footer-logo-row mb-4">
            <div className="h-12 w-20 sm:h-[66px] sm:w-28 block">
              <img
                src="/assets/navbar.png"
                alt="Kufi Travel"
                className="w-full h-full object-contain"
                style={{ filter: 'brightness(0) invert(1)' }}
              />
            </div>
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

          <div className="flex gap-3 mt-6 items-center">
            {/* VISA - External Asset (White via filter) */}
            <div className="h-3 w-auto">
              <img
                src="/assets/visa.svg"
                alt="Visa"
                className="h-full w-auto"
                style={{ filter: 'brightness(0) invert(1)' }}
              />
            </div>

            {/* Mastercard - External Asset */}
            <div className="h-4 w-auto">
              <img
                src="/assets/mastercard.svg"
                alt="Mastercard"
                className="h-full w-auto"
              />
            </div>

            {/* PayPal - External Asset */}
            <div className="bg-white rounded px-1.5 py-0.5 flex items-center h-4">
              <img
                src="/assets/paypal.svg"
                alt="PayPal"
                className="h-2.5 w-auto"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        © Copyright lorem ipsum amet dolor All Rights Reserved.
      </div>
    </footer>
  )
}
