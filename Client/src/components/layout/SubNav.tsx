import Star from '../../../public/assets/Star Icon.png'
import Location from '../../../public/assets/Location.png'
import Cart from '../../../public/assets/Full Shopping Basket.png'
import {Link} from "react-router-dom";


const SubNavBar = () => {
    return (
        <nav className="bg-[#FAFAFA]  pl-6 py-0">
            <div className="max-w-7xl mx-auto flex items-center justify-between">

                <div className="flex items-center justify-between">
                    <img
                        src={Star}
                        alt="terminal"
                        className="pr-2  w-6"
                    />
                    <h3 className="text-xs"> Get 5% Off your first order, Promo: ORDER5</h3>
                </div>

                {/* Navigation Links */}
                <div className="hidden md:flex items-center ">
                    <img
                        src={Location}
                        alt="terminal"
                        className="pr-2 w-6"
                    />
                    <h3 className="text-xs">Regent Street, A4, A4201, London</h3>
                </div>

                {/* Auth Buttons */}
                <div className="flex items-center h-full  ">
                  <div className="flex items-center justify-between w-16 h-13 bg-green-600  rounded-bl-lg border-r-[1px] border-white ">
                      <Link to='/cart/:id'>
                      <img
                          src={Cart}
                          alt="terminal"
                          className="pl-5 w-12 cursor-pointer"
                      />
                      </Link>
                  </div>
                    <div className="flex items-center justify-between w-16 h-13 bg-green-600 rounded-br-lg  border-[#FAFAFA]">
                        <h3 className="text-xs text-white pl-2">23 Items</h3>
                    </div>

                </div>
            </div>
        </nav>
    );
};


// const SubNav = SectionWrapper(SubNavBar);

export default SubNavBar;
