import RestaurantsContainer from "../../components/Restaurants/RestaurantsContainer.tsx";
import Navbar from "../../components/layout/Navbar.tsx";
import Banner from "../../components/layout/Banner.tsx";
import Footer from "../../components/layout/Footer.tsx";


const Restaurants = () => {
    return (
        <>
            <Navbar/>
            <Banner/>
            <RestaurantsContainer />
            <Footer/>
        </>
    )
}


export default Restaurants;
