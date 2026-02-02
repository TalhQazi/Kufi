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

export default function HomePage({ onSignupClick, onSigninClick, onCategoryClick, onCountryClick, onHomeClick, currentUser, onLogout, onProfileClick, onActivityClick, onBlogClick, onServiceClick, hideHeaderFooter = false }) {
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
            <CategoriesSection onCategoryClick={onCategoryClick} />
            <TopLocationsSection onCountryClick={onCountryClick} />
            <TopActivitiesSection onActivityClick={onActivityClick} />
            <BookingSystemSection />
            <FeedbackSection />
            <ServicesSection onServiceClick={onServiceClick} />
            <BlogSection onBlogClick={onBlogClick} />
            {!hideHeaderFooter && <Footer />}
        </>
    )
}
