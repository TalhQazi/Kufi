import React, { useState, useEffect, useMemo, useCallback } from 'react'
import Header from '../../components/layout/Header'
import HeroSection from '../../components/home/HeroSection'
import SearchBar from '../../components/home/SearchBar'
import DestinationsSection from '../../components/home/DestinationsSection'
import CategoriesSection from '../../components/home/CategoriesSection'
import TopLocationsSection from '../../components/home/TopLocationsSection'
import TopActivitiesSection from '../../components/home/TopActivitiesSection'
import BookingSystemSection from '../../components/home/BookingSystemSection'
import ServicesSection from '../../components/home/ServicesSection'
import BlogSection from '../../components/home/BlogSection'
import FeedbackSection from '../../components/home/FeedbackSection'
import Footer from '../../components/layout/Footer'
import useSectionVisibility from '../../hooks/useSectionVisibility'

export default function HomePage({ onSignupClick, onSigninClick, onCategoryClick, onCountryClick, onHomeClick, onExploreClick, currentUser, onLogout, onProfileClick, onMyRequestsClick, onSettingsClick, onActivityClick, onBlogClick, onServiceClick, hideHeaderFooter = false }) {
    const { isVisible, getSectionInfo } = useSectionVisibility('home')

    useEffect(() => {
        const hash = window.location.hash.replace('#', '')
        if (hash && hash !== 'home') {
            const element = document.getElementById(hash)
            if (element) {
                setTimeout(() => {
                    element.scrollIntoView({ behavior: 'smooth' })
                }, 500)
            }
        }
    }, [])

    return (
        <>
            {!hideHeaderFooter && (
                <Header
                    onSignupClick={onSignupClick}
                    onSigninClick={onSigninClick}
                    onHomeClick={onHomeClick}
                    currentUser={currentUser}
                    onLogout={onLogout}
                    onProfileClick={onProfileClick}
                    onMyRequestsClick={onMyRequestsClick}
                    onSettingsClick={onSettingsClick}
                />
            )}
            <div className="relative">
                {isVisible('hero') && <HeroSection onSignupClick={onSignupClick} onCountryClick={onCountryClick} onExploreClick={onExploreClick} />}
                {isVisible('search') && (
                    <SearchBar onSearch={(payload) => {
                        if (onCountryClick && payload?.country) {
                            onCountryClick(payload.country)
                        }
                    }} />
                )}
            </div>
            {isVisible('destinations') && <DestinationsSection onCountryClick={onCountryClick} />}
            {isVisible('categories') && <CategoriesSection onCategoryClick={onCategoryClick} sectionInfo={getSectionInfo('categories')} />}
            {isVisible('top-locations') && <TopLocationsSection onCountryClick={onCountryClick} sectionInfo={getSectionInfo('top-locations')} />}
            {isVisible('top-activities') && <TopActivitiesSection onActivityClick={onActivityClick} />}
            {isVisible('booking-system') && <BookingSystemSection />}
            {isVisible('feedback') && <FeedbackSection />}
            {isVisible('services') && <ServicesSection onServiceClick={onServiceClick} />}
            {isVisible('blog') && <BlogSection onBlogClick={onBlogClick} />}
            {!hideHeaderFooter && <Footer />}
        </>
    )
}
