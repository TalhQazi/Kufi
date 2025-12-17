import React from 'react'

export default function Footer() {
  return (
    <footer className="bg-[#a66e32] text-[#f9fafb]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-20 py-8 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 sm:gap-8">
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="mb-4">
              <div className="h-12 w-20 sm:h-[66px] sm:w-28 block">
                <img
                  src="/assets/navbar.png"
                  alt="Kufi Travel"
                  className="w-full h-full object-contain"
                  style={{ filter: 'brightness(0) invert(1)' }}
                />
              </div>
            </div>
            <p className="text-sm text-[#f9fafb]/90 mb-4 leading-relaxed">
              Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem ipsum
              has been the industry&apos;s standard dummy text ever.
            </p>
            <div className="text-xs font-semibold mb-3 uppercase tracking-wide">Connect with us</div>
            <div className="flex gap-3">
              <span className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold cursor-pointer hover:bg-white/30 transition-colors">f</span>
              <span className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold cursor-pointer hover:bg-white/30 transition-colors">in</span>
              <span className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold cursor-pointer hover:bg-white/30 transition-colors">ig</span>
              <span className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold cursor-pointer hover:bg-white/30 transition-colors">tw</span>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-4">Our Services</h4>
            <ul className="space-y-2 text-sm text-[#f9fafb]/80">
              <li className="cursor-pointer hover:text-white transition-colors">Home</li>
              <li className="cursor-pointer hover:text-white transition-colors">About</li>
              <li className="cursor-pointer hover:text-white transition-colors">Destination</li>
              <li className="cursor-pointer hover:text-white transition-colors">Book Tour</li>
              <li className="cursor-pointer hover:text-white transition-colors">Blog</li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-4">Quick Link</h4>
            <ul className="space-y-2 text-sm text-[#f9fafb]/80">
              <li className="cursor-pointer hover:text-white transition-colors">FAQ&apos;s</li>
              <li className="cursor-pointer hover:text-white transition-colors">Privacy Policy</li>
              <li className="cursor-pointer hover:text-white transition-colors">Term &amp; Conditions</li>
              <li className="cursor-pointer hover:text-white transition-colors">Support</li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-4">Quick contact</h4>
            <ul className="space-y-3 text-sm text-[#f9fafb]/80">
              <li className="flex items-start gap-2">
                <span className="text-base mt-0.5">●</span>
                <span>Lorem ipsum dolor sit amet consectetuer.</span>
              </li>
              <li className="flex items-center gap-2">
                <span>☎</span>
                <span>123 456 7890</span>
              </li>
              <li className="flex items-center gap-2">
                <span>✉</span>
                <span>info@loremipsum.com</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-4">Become a member</h4>
            <div className="flex gap-2 mb-6">
              <input
                className="flex-1 px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-white/60 text-sm focus:outline-none focus:border-white/40"
                type="email"
                placeholder="Enter your email"
              />
              <button className="px-4 py-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors text-white font-bold">➤</button>
            </div>

            <div className="flex gap-3 items-center">
              <div className="h-3 w-auto">
                <img
                  src="/assets/visa.svg"
                  alt="Visa"
                  className="h-full w-auto"
                  style={{ filter: 'brightness(0) invert(1)' }}
                />
              </div>
              <div className="h-4 w-auto">
                <img
                  src="/assets/mastercard.svg"
                  alt="Mastercard"
                  className="h-full w-auto"
                />
              </div>
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
      </div>

      <div className="border-t border-white/20 px-4 sm:px-6 lg:px-20 py-4 text-center text-sm text-[#f9fafb]/80">
        © Copyright lorem ipsum amet dolor All Rights Reserved.
      </div>
    </footer>
  )
}
