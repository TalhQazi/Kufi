import React from 'react'

export default function Footer() {
  return (
    <footer className="bg-[#a66e32] text-[#f9fafb]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-20 py-10 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10 sm:gap-8 lg:gap-12">
          {/* Brand Section */}
          <div className="sm:col-span-2 lg:col-span-2 flex flex-col items-center sm:items-start text-center sm:text-left">
            <div className="mb-6">
              <div className="h-14 w-24 sm:h-[66px] sm:w-28 block">
                <img
                  src="/assets/navbar.png"
                  alt="Kufi Travel"
                  className="w-full h-full object-contain"
                  style={{ filter: 'brightness(0) invert(1)' }}
                />
              </div>
            </div>
            <p className="text-sm sm:text-base text-[#f9fafb]/90 mb-6 leading-relaxed max-w-sm">
              Discover extraordinary travel experiences with Kufi Travel. We provide premium tours and accommodations tailored to your unique journey.
            </p>
            <div className="text-xs font-bold mb-4 uppercase tracking-[0.1em] opacity-80">Connect with us</div>
            <div className="flex gap-4">
              {['f', 'in', 'ig', 'tw'].map((social) => (
                <span key={social} className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center text-sm font-medium cursor-pointer transition-all hover:-translate-y-1">
                  {social}
                </span>
              ))}
            </div>
          </div>

          {/* Services Section */}
          <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
            <h4 className="text-sm font-bold mb-6 uppercase tracking-wider">Our Services</h4>
            <ul className="space-y-3 text-sm text-[#f9fafb]/80">
              {['Home', 'About', 'Destination', 'Book Tour', 'Blog'].map((item) => (
                <li key={item} className="cursor-pointer hover:text-white transition-colors">{item}</li>
              ))}
            </ul>
          </div>

          {/* Quick Links Section */}
          <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
            <h4 className="text-sm font-bold mb-6 uppercase tracking-wider">Quick Links</h4>
            <ul className="space-y-3 text-sm text-[#f9fafb]/80">
              {["FAQ's", 'Privacy Policy', 'Term & Conditions', 'Support'].map((item) => (
                <li key={item} className="cursor-pointer hover:text-white transition-colors">{item}</li>
              ))}
            </ul>
          </div>

          {/* Contact & Newsletter Section */}
          <div className="sm:col-span-2 lg:col-span-2 flex flex-col items-center sm:items-start text-center sm:text-left lg:mt-0 sm:mt-4">
            <h4 className="text-sm font-bold mb-6 uppercase tracking-wider">Newsletter</h4>
            <div className="w-full max-w-sm">
              <p className="text-xs text-[#f9fafb]/70 mb-4 italic">Subscribe to get the latest travel updates.</p>
              <div className="flex gap-2 group">
                <input
                  className="flex-1 px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/50 text-sm focus:outline-none focus:ring-2 focus:ring-white/30 transition-all"
                  type="email"
                  placeholder="Enter your email"
                />
                <button className="px-5 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 active:scale-95 transition-all text-white font-bold">
                  ➤
                </button>
              </div>
            </div>

            <div className="mt-8 flex flex-col items-center sm:items-start">
              <h4 className="text-sm font-bold mb-4 uppercase tracking-wider">Payment Methods</h4>
              <div className="flex gap-4 items-center flex-wrap justify-center sm:justify-start">
                <div className="h-4 w-auto brightness-0 invert opacity-80">
                  <img src="/assets/visa.svg" alt="Visa" className="h-full w-auto" />
                </div>
                <div className="h-5 w-auto opacity-90">
                  <img src="/assets/mastercard.svg" alt="Mastercard" className="h-full w-auto" />
                </div>
                <div className="bg-white/90 rounded px-2 py-1 flex items-center h-5">
                  <img src="/assets/paypal.svg" alt="PayPal" className="h-3 w-auto" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 px-4 sm:px-6 lg:px-20 py-6 text-center text-xs sm:text-sm text-[#f9fafb]/60">
        <p>© {new Date().getFullYear()} Kufi Travel. All Rights Reserved. Designed with passion for travel.</p>
      </div>
    </footer>
  )
}
