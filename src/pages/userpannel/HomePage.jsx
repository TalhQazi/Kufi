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

export default function HomePage({ onSignupClick, onSigninClick, onCategoryClick, onCountryClick, onHomeClick, currentUser, onLogout, onProfileClick, hideHeaderFooter = false }) {
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
                />
            )}
            <div className="relative">
                <HeroSection onSignupClick={onSignupClick} onCountryClick={onCountryClick} />
                <SearchBar onSearch={(payload) => {
                    if (onCountryClick && payload?.city) {
                        onCountryClick(payload.city)
                    }
                }} />
            </div>
            <DestinationsSection onCountryClick={onCountryClick} />
            <CategoriesSection onCategoryClick={(name) => onCategoryClick(name)} />
            <TopLocationsSection onCountryClick={onCountryClick} />
            <TopActivitiesSection />
            <BookingSystemSection />
            <FeedbackSection />
            <ServicesSection />
            <BlogSection />
            {!hideHeaderFooter && <Footer />}
        </>
    )
}
