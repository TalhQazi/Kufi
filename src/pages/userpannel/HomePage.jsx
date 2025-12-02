import Header from '../../components/layout/Header'
import HeroSection from '../../components/home/HeroSection'
import SearchBar from '../../components/home/SearchBar'
import DestinationsSection from '../../components/home/DestinationsSection'
import CategoriesSection from '../../components/home/CategoriesSection'
import TopLocationsSection from '../../components/home/TopLocationsSection'
import TopActivitiesSection from '../../components/home/TopActivitiesSection'
import BookingSystemSection from '../../components/home/BookingSystemSection'
import BlogSection from '../../components/home/BlogSection'
import FeedbackSection from '../../components/home/FeedbackSection'
import Footer from '../../components/layout/Footer'

export default function HomePage({ onSignupClick, onSigninClick }) {
    return (
        <>
            <Header onSignupClick={onSignupClick} onSigninClick={onSigninClick} />
            <div className="relative">
                <HeroSection onSignupClick={onSignupClick} />
                <SearchBar />
            </div>
            <DestinationsSection />
            <CategoriesSection />
            <TopLocationsSection />
            <TopActivitiesSection />
            <BookingSystemSection />
            <BlogSection />
            <FeedbackSection />
            <Footer />
        </>
    )
}
