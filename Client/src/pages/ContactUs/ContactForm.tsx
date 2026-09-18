import { useState, FormEvent } from 'react';
import { ContactService } from '../../services/ContactUs/contact.service';
import { motion } from 'framer-motion';
import { textVariant } from '../../util/motion';

const ContactForm = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        comment: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState('');

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await ContactService.submitContactForm(formData);
            setMessage('Thank you for your message! We will get back to you soon.');
            setFormData({ name: '', email: '', comment: '' });
        } catch (error) {
            setMessage('Something went wrong. Please try again later.');
        }
        setIsSubmitting(false);
    };

    return (
        <div className="min-h-screen bg-gradient-to-r from-gray-900 to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <motion.div variants={textVariant(0.3)} className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                        Get in Touch
                        <span className="block text-orange-500">We'd Love to Hear From You</span>
                    </h1>
                    <p className="text-gray-300 text-lg">
                        Have a question about our service or want to partner with us? Send us a message!
                    </p>
                </motion.div>

                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    <div className="p-8">
                        {message && (
                            <motion.div 
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`mb-6 p-4 rounded-lg ${
                                    message.includes('thank you') 
                                    ? 'bg-green-50 text-green-700 border border-green-200' 
                                    : 'bg-red-50 text-red-700 border border-red-200'
                                }`}
                            >
                                {message}
                            </motion.div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                    Name
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    required
                                    className="mt-1 block w-full px-4 py-3 rounded-lg border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 transition-colors"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>

                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    required
                                    className="mt-1 block w-full px-4 py-3 rounded-lg border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 transition-colors"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>

                            <div>
                                <label htmlFor="comment" className="block text-sm font-medium text-gray-700">
                                    Message
                                </label>
                                <textarea
                                    id="comment"
                                    required
                                    rows={4}
                                    className="mt-1 block w-full px-4 py-3 rounded-lg border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 transition-colors"
                                    value={formData.comment}
                                    onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-lg font-medium text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:bg-orange-300 transition-colors duration-200"
                            >
                                {isSubmitting ? (
                                    <div className="flex items-center">
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Sending...
                                    </div>
                                ) : (
                                    'Send Message'
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactForm;