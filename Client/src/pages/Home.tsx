import Banner from '../components/layout/Banner';
import Hero1 from "../components/layout/Hero1.tsx";
import NavigationBar from "../components/layout/Navbar.tsx";
import Footer from "../components/layout/Footer.tsx";
import Discount from "../components/layout/Discount.tsx";
import Category from "../components/layout/Category.tsx";
import Poster from "../components/layout/Poster.tsx";
import PartnerCard from "../components/layout/PartnerCard.tsx";
import FAQContent from "../components/layout/AboutUs.tsx";
import StatsDisplay from "../components/layout/StatsDisplay.tsx";

function Home() {
    return (
        <>
            <NavigationBar />
            <Banner />
            <div>
                <Discount/>
                <Category />
                <Hero1 />
                <Poster/>
                <PartnerCard/>
                <StatsDisplay/>
                <FAQContent/>
                <Footer/>
            </div>

        </>
    );
}


export default Home;
