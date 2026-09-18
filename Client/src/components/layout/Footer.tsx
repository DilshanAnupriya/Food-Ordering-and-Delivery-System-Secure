import React from 'react';
import { Facebook, Instagram, Share2, Ghost } from 'lucide-react';

const Footer: React.FC = () => {
  return (
      <div className="w-full bg-gray-100 rounded-2xl text-black">
        {/* Main Footer Content */}
        <div className="container mx-auto py-8 px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Logo and Company Info */}
            <div className="flex flex-col space-y-4">
              <h1 className="text-4xl font-bold">Quick<span className=" text-orange-500">Bite</span></h1>

              {/* App Store Buttons */}
              <div className="flex space-x-2">
                <button className="bg-black text-white px-2 py-1 rounded-md flex items-center">
                <span className="mr-2">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.33-3.14-2.57C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                  </svg>
                </span>
                  <div className="flex flex-col items-start">
                    <span className="text-xs">Download on the</span>
                    <span className="text-sm font-medium">App Store</span>
                  </div>
                </button>

                <button className="bg-black text-white px-2 py-1 rounded-md flex items-center">
                <span className="mr-2">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3.18 20.82c.44.95 1.27 1.64 2.28 1.64.14 0 .28-.01.42-.04 1.16-.24 1.97-1.32 2.79-2.38l.86-1.13c.35-.46.35-1.1 0-1.56l-2.3-3.03c-.33-.44-.91-.56-1.39-.29l-.78.47a.648.648 0 01-.85-.16c-.59-.78-1.27-1.57-1.9-2.36-.24-.3-.23-.72.04-.99l.7-.67c.37-.35.47-.89.26-1.37l-1.14-2.52c-.22-.5-.72-.81-1.27-.81-.07 0-.14.01-.21.02C-.15 5.79-.35 7 .41 8.12l1.73 2.57c.12.18.23.36.32.56l3.31 8.59c.35.53.69.98.87 1.33.18.35.33.65.54.98zM4.14 5.14c0 .5.15.98.41 1.39-.46.24-.85.64-1.08 1.16-.15-.35-.24-.72-.27-1.1-.04-.53.05-1.04.24-1.52.15-.36.36-.68.64-.95.02-.02.05-.04.07-.06.12.35.19.71.19 1.08h-.2zm6.33-.13c-.12-.35-.27-.7-.44-1.06-.19-.39-.38-.7-.62-1.19l-.12-.21c-.09-.21-.2-.41-.33-.61.15-.16.32-.3.51-.42 1.85-1.13 4.26-.44 5.39 1.41l3.9 6.37c.61 1 1.21 1.98 1.32 3.16.12 1.18-.29 2.23-1.5 3.53-.94 1.01-1.66 1.69-2.5 1.9-.84.21-1.69-.12-2.8-.99-.65-.51-1.34-1-2.06-1.46-.47-.3-.78-.91-.78-1.54 0-.76.43-1.46 1.12-1.8l1.24-.6c.51-.24.84-.74.86-1.27.02-.53-.26-1.03-.75-1.3L8.73 6.86c-.46-.26-.79-.7-.93-1.24-.12-.45-.07-.95.12-1.4.7.14 1.49.36 2.35.65-.03-.17-.06-.36-.06-.61 0-.14.02-.27.03-.4.02-.14.04-.28.04-.42 0-.21-.07-.74-.2-1.16.12.06.25.11.39.15v1.68z" />
                  </svg>
                </span>
                  <div className="flex flex-col items-start">
                    <span className="text-xs">GET IT ON</span>
                    <span className="text-sm font-medium">Google Play</span>
                  </div>
                </button>
              </div>

              <p className="text-sm text-gray-600">
                Company # 490039-445, Registered with House of companies.
              </p>
            </div>

            {/* Newsletter Signup */}
            <div className="md:col-span-1 lg:col-span-1">
              <h3 className="font-semibold mb-4">Get Exclusive Deals in your Inbox</h3>
              <div className="flex flex-col space-y-2">
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                      type="email"
                      placeholder="youremail@gmail.com"
                      className="px-4 py-2 bg-gray-200 rounded-md flex-grow"
                  />
                  <button className="bg-orange-400 hover:bg-orange-700 text-white px-6 py-2 rounded-md">
                    Subscribe
                  </button>
                </div>
                <p className="text-xs text-gray-600">we won't spam, read our <a href="#" className="underline">email policy</a></p>
              </div>

              {/* Social Media Icons */}
              <div className="flex space-x-4 mt-6">
                <a href="#" className="p-2 bg-white rounded-full shadow-sm">
                  <Facebook size={20} />
                </a>
                <a href="#" className="p-2 bg-white rounded-full shadow-sm">
                  <Instagram size={20} />
                </a>
                <a href="#" className="p-2 bg-white rounded-full shadow-sm">
                  <Share2 size={20} />
                </a>
                <a href="#" className="p-2 bg-white rounded-full shadow-sm">
                  <Ghost size={20} />
                </a>
              </div>
            </div>

            {/* Legal Pages */}
            <div className="md:col-span-1 ml-19">
              <h3 className="font-semibold mb-4">Legal Pages</h3>
              <ul className="space-y-2">
                <li><a href="#" className="hover:underline">Terms and conditions</a></li>
                <li><a href="#" className="hover:underline">Privacy</a></li>
                <li><a href="#" className="hover:underline">Cookies</a></li>
                <li><a href="#" className="hover:underline">Modern Slavery Statement</a></li>
              </ul>
            </div>

            {/* Important Links */}
            <div className="md:col-span-1 ml-10">
              <h3 className="font-semibold mb-4">Important Links</h3>
              <ul className="space-y-2">
                <li><a href="#" className="hover:underline">Get help</a></li>
                <li><a href="#" className="hover:underline">Add your restaurant</a></li>
                <li><a href="#" className="hover:underline">Sign up to deliver</a></li>
                <li><a href="#" className="hover:underline">Create a business account</a></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Copyright Footer */}
        <div className="bg-gray-900 text-white py-4">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="mb-4 md:mb-0">
                <p>QuickBite Copyright 2025, All Rights Reserved.</p>
              </div>
              <div className="flex flex-wrap gap-4 md:gap-8">
                <a href="#" className="text-sm hover:underline">Privacy Policy</a>
                <a href="#" className="text-sm hover:underline">Terms</a>
                <a href="#" className="text-sm hover:underline">Pricing</a>
                <a href="#" className="text-sm hover:underline">Do not sell or share our personal  information</a>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
};

export default Footer;