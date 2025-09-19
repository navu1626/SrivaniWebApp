import React, { useEffect } from 'react';

const TermsOfService: React.FC = () => {
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
      <h1 className="text-3xl font-bold text-maroon-800 mb-4">सेवा की शर्तें</h1>

      <p className="mb-4 text-maroon-700">Sarvaggyam Vani का उपयोग करके आप निम्नलिखित नियमों और शर्तों से सहमत होते हैं। कृपया इन्हें ध्यान से पढ़ें।</p>

      <h2 className="text-2xl font-semibold text-maroon-800 mt-6 mb-2">सेवा का उपयोग</h2>
      <p className="text-maroon-700">यह मंच व्यक्तिगत, गैर-व्यावसायिक और शैक्षिक उद्देश्यों के लिए है। सेवा का दुरुपयोग या संचालन में हस्तक्षेप वर्जित है।</p>

      <h2 className="text-2xl font-semibold text-maroon-800 mt-6 mb-2">सामग्री</h2>
      <p className="text-maroon-700">साइट पर दी गई सभी सामग्री शैक्षिक और धार्मिक उद्देश्यों के लिए है। उपयोगकर्ता सामग्री साझा करते समय कॉपीराइट और सामुदायिक दिशानिर्देशों का पालन करें।</p>

      <h2 className="text-2xl font-semibold text-maroon-800 mt-6 mb-2">खाता जिम्मेदारी</h2>
      <p className="text-maroon-700">खाते की जानकारी गोपनीय रखें। किसी अनधिकृत पहुँच का संदेह होने पर तुरंत सूचित करें।</p>

      <h2 className="text-2xl font-semibold text-maroon-800 mt-6 mb-2">समाप्ति</h2>
      <p className="text-maroon-700">नियमों या सामुदायिक दिशानिर्देशों का उल्लंघन करने वाले खातों को निलंबित या समाप्त किया जा सकता है।</p>

      <h2 className="text-2xl font-semibold text-maroon-800 mt-6 mb-2">विधि</h2>
      <p className="text-maroon-700">इन शर्तों पर लागू स्थानीय कानून लागू होंगे। किसी विवाद के लिए कृपया हमारे सपोर्ट से संपर्क करें।</p>
    </div>
  );
};

export default TermsOfService;
