import React from 'react';
import { Crown, Mail, Phone, MapPin, Home, Gamepad2, Trophy, Info, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { motion } from 'framer-motion';

const Footer: React.FC = () => {
  const { t } = useLanguage();

  const quickLinks = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/religious-games', label: 'Religious Games', icon: Gamepad2 },
    { to: '/results', label: 'Results', icon: Trophy },
    { to: '/about', label: 'About Us', icon: Info },
  ];



  return (
    <footer className="relative bg-gradient-to-br from-maroon-900 via-saffron-900 to-maroon-800 text-white overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,215,0,0.1),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(255,165,0,0.1),transparent_50%)]"></div>
      </div>

      <div className="relative container mx-auto px-4 py-16">
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
          {/* Logo & Description */}
          <motion.div
            className="lg:col-span-6 flex flex-col h-full"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center space-x-4 mb-6">
              <motion.div
                whileHover={{ scale: 1.05, rotate: 5 }}
                className="relative"
              >
                <div className="p-1 rounded-full shadow-xl bg-gradient-to-r from-saffron-500 to-gold-500">
                  <div className="bg-white/95 p-1 rounded-full">
                    <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0">
                      <img src="/Images/logo.JPG" alt="Logo" className="w-full h-full object-cover" />
                    </div>
                  </div>
                </div>
                <div className="absolute -inset-1 bg-gradient-to-r from-saffron-400 to-gold-400 rounded-full opacity-0 hover:opacity-30 transition-opacity duration-300 -z-10"></div>
              </motion.div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-1">{t('app.title')}</h3>
                <p className="text-gold-200 text-sm font-medium">{t('app.subtitle')}</p>
              </div>
            </div>
            <p className="text-cream-200 mb-6 leading-relaxed text-sm">
              A sacred platform dedicated to preserving and sharing divine Jain knowledge through
              interactive spiritual competitions and enlightening learning experiences.
            </p>
          </motion.div>

          {/* Quick Links */}
          <motion.div className="lg:col-span-3 flex flex-col h-full"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h4 className="text-xl font-bold mb-4 text-gold-300 flex items-center">
              <Crown className="h-5 w-5 mr-2" />
              Quick Links
            </h4>
            <ul className="space-y-2">
              {quickLinks.map((link, index) => {
                const Icon = link.icon;
                return (
                  <motion.li
                    key={link.to}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                  >
                    <Link
                      to={link.to}
                      className="flex items-center space-x-3 text-cream-200 hover:text-gold-300 transition-all duration-300 group"
                    >
                      <Icon className="h-4 w-4 group-hover:scale-110 transition-transform" />
                      <span className="text-sm font-medium">{link.label}</span>
                    </Link>
                  </motion.li>
                );
              })}
            </ul>
          </motion.div>

          {/* Contact Info */}
          <motion.div className="lg:col-span-3 flex flex-col h-full"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <h4 className="text-xl font-bold mb-4 text-gold-300 flex items-center">
              <Mail className="h-5 w-5 mr-2" />
              Contact Us
            </h4>
            <div className="space-y-2">
              <motion.div
                className="flex items-center space-x-3 text-cream-200"
                whileHover={{ scale: 1.02 }}
              >
                <Mail className="h-4 w-4 text-gold-400" />
                <span className="text-sm">info@sarvaggyam.com</span>
              </motion.div>
              <motion.div
                className="flex items-center space-x-3 text-cream-200"
                whileHover={{ scale: 1.02 }}
              >
                <Phone className="h-4 w-4 text-gold-400" />
                <span className="text-sm">+91-9999999999</span>
              </motion.div>
              <motion.div
                className="flex items-center space-x-3 text-cream-200"
                whileHover={{ scale: 1.02 }}
              >
                <MapPin className="h-4 w-4 text-gold-400" />
                <span className="text-sm">New Delhi, Delhi</span>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Bottom Section */}
        <motion.div
          className="border-t border-maroon-700/50 mt-12 pt-8"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Heart className="h-5 w-5 text-red-400" />
              <p className="text-cream-300 text-sm font-medium">
                © 2025 {t('app.title')}. Made with devotion for the Jain Community.
              </p>
            </div>
            <div className="flex items-center space-x-6 text-sm text-cream-400">
              <Link to="/privacy-policy" className="hover:text-gold-300 transition-colors">Privacy Policy</Link>
              <Link to="/terms-of-service" className="hover:text-gold-300 transition-colors">Terms of Service</Link>
              <Link to="/support" className="hover:text-gold-300 transition-colors">Support</Link>
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;