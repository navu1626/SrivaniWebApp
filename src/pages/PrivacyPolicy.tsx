import React, { useEffect } from 'react';

const PrivacyPolicy: React.FC = () => {
  useEffect(() => {
    try {
      const headerHeightStr = getComputedStyle(document.documentElement).getPropertyValue('--header-height') || '0px';
      const headerHeight = parseInt(headerHeightStr) || 0;
      window.scrollTo({ top: Math.max(0, 0 - headerHeight - 8), behavior: 'smooth' });
    } catch (e) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold text-maroon-800 mb-4">गोपनीयता नीति</h1>
      <p className="mb-4 text-maroon-700">यह गोपनीयता नीति बताती है कि कैसे Sarvaggyam Vani व्यक्तिगत जानकारी एकत्र करता, उपयोग करता और साझा करता है। हम आपकी गोपनीयता का सम्मान करते हैं और आपके डेटा की सुरक्षा के लिए प्रतिबद्ध हैं।</p>

      <h2 className="text-2xl font-semibold text-maroon-800 mt-6 mb-2">हम कौन सी जानकारी एकत्र करते हैं</h2>
      <ul className="list-disc ml-6 text-maroon-700">
        <li>खाता जानकारी: नाम, ईमेल, मोबाइल नंबर और पंजीकरण के दौरान दिया गया प्रोफ़ाइल विवरण।</li>
        <li>उपयोग जानकारी: वेबसाइट पर कौन से पृष्ठ देखे गए और सेवाओं के उपयोग के आँकड़े।</li>
        <li>सहायता संवाद: जब आप हमें समर्थन के लिए संपर्क करते हैं।</li>
      </ul>

      <h2 className="text-2xl font-semibold text-maroon-800 mt-6 mb-2">हम जानकारी का उपयोग कैसे करते हैं</h2>
      <p className="text-maroon-700">हम व्यक्तिगत जानकारी का उपयोग सेवा प्रदान करने, खातों के बारे में सूचनाएँ भेजने, सत्यापन/पासवर्ड रीसेट ईमेल भेजने और सहायता अनुरोधों का उत्तर देने के लिए करते हैं।</p>

      <h2 className="text-2xl font-semibold text-maroon-800 mt-6 mb-2">डेटा साझा करना</h2>
      <p className="text-maroon-700">हम आपकी व्यक्तिगत जानकारी को बेचते या किराये पर नहीं देते। केवल आवश्यक साझेदारी (जैसे ईमेल सेवा प्रदाता) या कानूनी आवश्यकता होने पर ही साझा किया जाता है।</p>

      <h2 className="text-2xl font-semibold text-maroon-800 mt-6 mb-2">सुरक्षा</h2>
      <p className="text-maroon-700">हम आपके डेटा की सुरक्षा के लिए उचित तकनीकी और संगठनात्मक उपाय लागू करते हैं, परन्तु कोई भी सिस्टम 100% सुरक्षित नहीं है।</p>

      <h2 className="text-2xl font-semibold text-maroon-800 mt-6 mb-2">बच्चे</h2>
      <p className="text-maroon-700">यह मंच सामान्य दर्शकों के लिए है; हम जानबूझकर बच्चों से बिना माता-पिता की अनुमति के व्यक्तिगत जानकारी नहीं एकत्र करते।</p>

      <h2 className="text-2xl font-semibold text-maroon-800 mt-6 mb-2">संपर्क</h2>
      <p className="text-maroon-700">नीतियों या आपके डेटा के बारे में जानकारी के लिए कृपया सपोर्ट पेज के माध्यम से हमसे संपर्क करें।</p>
    </div>
  );
};

export default PrivacyPolicy;
