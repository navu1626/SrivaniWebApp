import React, { useState, useEffect } from 'react';
import axios from 'axios';
import api from '../services/api';

const Support: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null; text: string | null }>({ type: null, text: null });
  const [loading, setLoading] = useState(false);

  const validate = () => {
    if (!name.trim() || !email.trim() || !message.trim()) {
      setStatus({ type: 'error', text: 'Please fill name, email, and message.' });
      return false;
    }
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!re.test(email)) {
      setStatus({ type: 'error', text: 'Please enter a valid email address.' });
      return false;
    }
    return true;
  };

  // Use the shared API client which already has baseURL set to VITE_API_URL or localhost
  const primaryApi = '/support'; // api instance points to /api/v1
  const fallbackApi = (import.meta.env.VITE_API_URL || '') ? `${import.meta.env.VITE_API_URL}/api/support` : '/api/support';

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus({ type: null, text: null });
    if (!validate()) return;
    setLoading(true);
      try {
        // Try primary versioned API via our api client (api already points to /api/v1)
        try {
          await api.post(primaryApi, { name, email, subject, message });
        } catch (innerErr: any) {
          if (innerErr?.response?.status === 404) {
            // Fallback to unversioned endpoint
            await axios.post(fallbackApi, { name, email, subject, message });
          } else {
            throw innerErr;
          }
        }
      setStatus({ type: 'success', text: 'Your message has been sent. We will respond shortly.' });
      setName(''); setEmail(''); setSubject(''); setMessage('');
      // scroll to top of form (header aware)
      try {
        const headerHeightStr = getComputedStyle(document.documentElement).getPropertyValue('--header-height') || '0px';
        const headerHeight = parseInt(headerHeightStr) || 0;
        const formEl = document.querySelector('form');
        const top = formEl ? (formEl.getBoundingClientRect().top + window.scrollY - headerHeight - 8) : 0;
        window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
      } catch (e) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (err: any) {
      console.error(err);
      const serverMessage = err?.response?.data?.message;
      setStatus({ type: 'error', text: serverMessage || 'Failed to send message. Please try again later.' });
      // scroll to show error
      try {
        const headerHeightStr = getComputedStyle(document.documentElement).getPropertyValue('--header-height') || '0px';
        const headerHeight = parseInt(headerHeightStr) || 0;
        const formEl = document.querySelector('form');
        const top = formEl ? (formEl.getBoundingClientRect().top + window.scrollY - headerHeight - 8) : 0;
        window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
      } catch (e) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    try {
      const headerHeightStr = getComputedStyle(document.documentElement).getPropertyValue('--header-height') || '0px';
      const headerHeight = parseInt(headerHeightStr) || 0;
      const formEl = document.querySelector('form');
      const top = formEl ? (formEl.getBoundingClientRect().top + window.scrollY - headerHeight - 8) : 0;
      window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
    } catch (e) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  return (
    <div className="min-h-screen guruji-bg flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-r from-saffron-500 to-gold-500 p-3 rounded-full shadow-lg">
                <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                <img src="/Images/logo.JPG" alt="Logo" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>

          <h2 className="text-3xl font-bold text-maroon-800">Support</h2>
          <p className="text-maroon-600 mt-2">Send us a message and we'll get back to you soon.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={submit} className="space-y-6">
            {status.type === 'error' && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {status.text}
              </div>
            )}
            {status.type === 'success' && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
                {status.text}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-maroon-700 mb-2">Name</label>
              <input value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-3 border border-cream-300 rounded-lg focus:ring-2 focus:ring-saffron-500 focus:border-saffron-500 transition-colors" placeholder="Your name" />
            </div>

            <div>
              <label className="block text-sm font-medium text-maroon-700 mb-2">Email</label>
              <input value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-3 border border-cream-300 rounded-lg focus:ring-2 focus:ring-saffron-500 focus:border-saffron-500 transition-colors" placeholder="you@example.com" />
            </div>

            <div>
              <label className="block text-sm font-medium text-maroon-700 mb-2">Subject (optional)</label>
              <input value={subject} onChange={e => setSubject(e.target.value)} className="w-full px-4 py-3 border border-cream-300 rounded-lg focus:ring-2 focus:ring-saffron-500 focus:border-saffron-500 transition-colors" placeholder="Subject" />
            </div>

            <div>
              <label className="block text-sm font-medium text-maroon-700 mb-2">Message</label>
              <textarea value={message} onChange={e => setMessage(e.target.value)} rows={6} className="w-full px-4 py-3 border border-cream-300 rounded-lg focus:ring-2 focus:ring-saffron-500 focus:border-saffron-500 transition-colors" placeholder="How can we help?" />
            </div>

            <div>
              <button disabled={loading} type="submit" className={`w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-semibold text-white transition-all duration-300 ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-saffron-500 to-saffron-600 hover:from-saffron-600 hover:to-saffron-700 transform hover:scale-105 shadow-lg hover:shadow-xl'}`}>
                <span>{loading ? 'Sending...' : 'Send Message'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Support;
