
import Footer from '../../components/layout/Footer';
import ContactForm from '../ContactUs/ContactForm';
import NavV2 from "../../components/layout/NavV2.tsx";

const ContactUs = () => {
    return (
        <div className="flex flex-col min-h-screen">

            <NavV2 />
            <main className="flex-grow">
                <ContactForm />
            </main>
            <Footer />
        </div>
    );
};

export default ContactUs;