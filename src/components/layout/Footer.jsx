import React, { useState, useEffect } from 'react'
import { Facebook, Instagram, Youtube, MapPin, Phone, Mail, Globe, Home, SendHorizonal, Loader2 } from 'lucide-react'
import api from '../../api'

const IconMap = {
    MapPin,
    Phone,
    Mail,
    Globe,
    Home
}

const DefaultSocialIcon = ({ name, iconImage }) => {
    // If custom icon image is uploaded, use it
    if (iconImage) {
        return (
            <img
                src={iconImage}
                alt={name}
                className="w-4 h-4 object-contain"
            />
        )
    }

    // Default icons based on name
    if (name.toLowerCase().includes('facebook')) {
        return <Facebook size={14} fill="currentColor" />
    }
    if (name.toLowerCase().includes('instagram')) {
        return <Instagram size={14} />
    }
    if (name.toLowerCase().includes('youtube')) {
        return <Youtube size={14} />
    }

    return <Globe size={14} />
}

export default function Footer() {
    const [settings, setSettings] = useState(null)
    const [loading, setLoading] = useState(true)
    const [email, setEmail] = useState('')

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await api.get('/footer')
                setSettings(response.data)
            } catch (error) {
                console.error('Error fetching footer settings:', error)
            } finally {
                setLoading(false)
            }
        }
        fetchSettings()
    }, [])

    const handleNewsletterSubmit = (e) => {
        e.preventDefault()
        // Handle newsletter subscription
        alert('Thank you for subscribing!')
        setEmail('')
    }

    if (loading) {
        return (
            <footer className="bg-[#a67c52]">
                <div className="max-w-[1240px] mx-auto px-6 py-10 flex items-center justify-center">
                    <Loader2 className="w-6 h-6 animate-spin text-white/70" />
                </div>
            </footer>
        )
    }

    // Default values if settings not loaded
    const brandSection = settings?.brandSection || {
        logo: '/assets/navbar.png',
        description: 'stepping outside comfort zones, embracing the unfamiliar, and creating lasting memories',
        socialTitle: 'Connect with us'
    }

    const contactInfo = settings?.contactInfo || {
        title: 'Quick contact',
        items: []
    }

    const socialIcons = (settings?.socialIcons || []).filter(s => s.isActive)
    const paymentMethods = (settings?.paymentMethods || []).filter(p => p.isActive)
    const copyright = settings?.copyright || ' Copyright lorem ipsum amet dolor All Rights Reserved.'
    const newsletter = settings?.newsletter || { title: 'Become a member', placeholder: 'Enter your email', isActive: true }

    return (
        <footer className="bg-[#a67c52] text-[#f9fafb] font-sans">
            <div className="max-w-[1240px] mx-auto px-6 pt-10 pb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-6">

                    {/* Brand Section */}
                    <div className="lg:col-span-1 flex flex-col items-start">
                        <div className="mb-4">
                            <div className="h-12 w-20 sm:h-[60px] sm:w-28 block">
                                <img
                                    src={brandSection.logo}
                                    alt="Kufi Travel"
                                    className="w-full h-full object-contain brightness-0 invert"
                                />
                            </div>
                        </div>
                        <p className="text-[14px] text-white/90 mb-6 leading-relaxed max-w-[280px]">
                            {brandSection.description}
                        </p>
                        {socialIcons.length > 0 && (
                            <div>
                                <p className="text-[14px] font-medium mb-3">{brandSection.socialTitle}</p>
                                <div className="flex gap-2.5">
                                    {socialIcons.map((social, idx) => (
                                        <a
                                            key={idx}
                                            href={social.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-7 h-7 rounded-full bg-white text-[#a67c52] flex items-center justify-center hover:bg-white/90 transition-all hover:scale-110"
                                            title={social.name}
                                        >
                                            <DefaultSocialIcon name={social.name} iconImage={social.iconImage} />
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Our Services */}
                    <div className="lg:pl-8">
                        <h4 className="text-base font-bold mb-6">Our Services</h4>
                        <ul className="space-y-2.5 text-[14px] text-white/90">
                            {['About', 'Destination', 'Blog'].map((item) => (
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
                            {["FAQ's", 'Privacy Policy', 'Terms', 'Support'].map((item) => (
                                <li key={item}>
                                    <a href="#" className="hover:text-white transition-colors">{item}</a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Quick contact - Dynamic */}
                    <div>
                        <h4 className="text-base font-bold mb-6">{contactInfo.title}</h4>
                        <ul className="space-y-4 text-[14px] text-white/90">
                            {contactInfo.items?.filter(i => i.isActive).map((item, idx) => {
                                const IconComponent = IconMap[item.icon] || Globe
                                return (
                                    <li key={idx} className="flex items-start gap-2.5">
                                        <IconComponent size={18} className="mt-0.5 shrink-0 opacity-80" />
                                        <span>{item.value}</span>
                                    </li>
                                )
                            })}
                        </ul>
                    </div>

                    {/* Become a member */}
                    <div className="lg:pl-4">
                        <h4 className="text-base font-bold mb-6">{newsletter.title}</h4>
                        {newsletter.isActive && (
                            <form onSubmit={handleNewsletterSubmit} className="relative mb-6">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder={newsletter.placeholder}
                                    className="w-full bg-white rounded-full py-2.5 px-5 text-gray-800 text-[14px] placeholder:text-gray-400 focus:outline-none pr-12 shadow-sm"
                                    required
                                />
                                <button
                                    type="submit"
                                    className="absolute right-1 top-1 bottom-1 w-9 h-9 bg-[#a67c52] rounded-full flex items-center justify-center text-white hover:bg-[#8f643e] transition-colors shadow-sm"
                                >
                                    <SendHorizonal size={16} />
                                </button>
                            </form>
                        )}
                        <div className="flex gap-3 items-center pl-1 flex-wrap">
                            {paymentMethods.map((method, idx) => (
                                <img
                                    key={idx}
                                    src={method.iconImage}
                                    alt={method.name}
                                    className={`h-6 object-contain ${
                                        method.name.toLowerCase().includes('visa')
                                            ? 'brightness-0 invert opacity-90 h-3'
                                            : method.name.toLowerCase().includes('paypal')
                                                ? 'bg-white px-1 py-0.5 rounded shadow-sm h-4'
                                                : 'rounded shadow-sm'
                                    }`}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="mt-10 pt-6 border-t border-white/20 text-center text-[13px] text-white/70">
                        <p>{copyright}</p>
                    </div>
                </div>
            </div>
        </footer>
    )
}
