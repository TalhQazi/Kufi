import React from 'react'
import { Facebook, Instagram, Linkedin, MessageCircle, MapPin, Phone, Mail, SendHorizonal } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-[#a67c52] text-[#f9fafb] font-sans">
      <div className="max-w-[1240px] mx-auto px-6 pt-10 pb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-6">

          {/* Brand Section */}
          <div className="lg:col-span-1 flex flex-col items-start">
            <div className="mb-4">
              <div className="h-12 w-20 sm:h-[60px] sm:w-28 block">
                <img
                  src="/assets/navbar.png"
                  alt="Kufi Travel"
                  className="w-full h-full object-contain brightness-0 invert"
                />
              </div>
            </div>
            <p className="text-[14px] text-white/90 mb-6 leading-relaxed max-w-[280px]">
              Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever.
            </p>
            <div>
              <p className="text-[14px] font-medium mb-3">Connect with us</p>
              <div className="flex gap-2.5">
                {[
                  { icon: Facebook, label: 'Facebook' },
                  { icon: MessageCircle, label: 'WhatsApp' },
                  { icon: Instagram, label: 'Instagram' },
                  { icon: Linkedin, label: 'LinkedIn' }
                ].map((social, idx) => (
                  <a key={idx} href="#" className="w-7 h-7 rounded-full bg-white text-[#a67c52] flex items-center justify-center hover:bg-white/90 transition-all hover:scale-110">
                    <social.icon size={14} fill={social.label === 'Facebook' ? 'currentColor' : 'none'} />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Our Services */}
          <div className="lg:pl-8">
            <h4 className="text-base font-bold mb-6">Our Services</h4>
            <ul className="space-y-2.5 text-[14px] text-white/90">
              {['Home', 'About', 'Destination', 'Book Tour', 'Blog'].map((item) => (
                <li key={item}>
                  <a href="#" className="hover:text-white transition-colors">{item}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Link */}
          <div className="lg:pl-4">
            <h4 className="text-base font-bold mb-6">Quick Link</h4>
            <ul className="space-y-2.5 text-[14px] text-white/90">
              {["FAQ's", 'Privacy Policy', 'Term & Conditions', 'Support'].map((item) => (
                <li key={item}>
                  <a href="#" className="hover:text-white transition-colors">{item}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick contact */}
          <div>
            <h4 className="text-base font-bold mb-6">Quick contact</h4>
            <ul className="space-y-4 text-[14px] text-white/90">
              <li className="flex items-start gap-2.5">
                <MapPin size={18} className="mt-0.5 shrink-0 opacity-80" />
                <span>Lorem ipsum dolor sit amet consectetur.</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone size={18} className="shrink-0 opacity-80" />
                <span>123 456 7890</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail size={18} className="shrink-0 opacity-80" />
                <span>info@loremipsum.com</span>
              </li>
            </ul>
          </div>

          {/* Become a member */}
          <div className="lg:pl-4">
            <h4 className="text-base font-bold mb-6">Become a member</h4>
            <div className="relative mb-6">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full bg-white rounded-full py-2.5 px-5 text-gray-800 text-[14px] placeholder:text-gray-400 focus:outline-none pr-12 shadow-sm"
              />
              <button className="absolute right-1 top-1 bottom-1 w-9 h-9 bg-[#a67c52] rounded-full flex items-center justify-center text-white hover:bg-[#8f643e] transition-colors shadow-sm">
                <SendHorizonal size={16} />
              </button>
            </div>
            <div className="flex gap-3 items-center pl-1">
              <img src="/assets/visa.svg" alt="Visa" className="h-3 brightness-0 invert opacity-90" />
              <img src="/assets/mastercard.svg" alt="Mastercard" className="h-6" />
              <img src="/assets/paypal.svg" alt="PayPal" className="h-4 bg-white px-1 py-0.5 rounded shadow-sm" />
            </div>
          </div>

        </div>

        <div className="mt-10 pt-6 border-t border-white/20 text-center text-[13px] text-white/70">
          <p>© Copyright lorem ipsum amet dolor All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  )
}
