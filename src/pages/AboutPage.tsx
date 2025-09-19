import React from 'react';
import { motion } from 'framer-motion';
import parchment from '../images/parchment-texture.jpg';

export default function AboutPage() {
  return (
    <div className="min-h-screen guruji-bg py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-10"
        >
          <h1 className="text-4xl md:text-5xl font-extrabold text-maroon-800 mb-3">About Us</h1>
          <p className="text-maroon-700">प्राचीन ग्रंथों से प्रेरित एक आध्यात्मिक यात्रा</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 1 }}
          className="relative rounded-2xl shadow-large overflow-hidden border-2 border-gold-400"
          style={{
            backgroundImage: `url(${parchment})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          <div className="backdrop-brightness-110/80 p-8 md:p-12">
            <div className="prose max-w-none font-serif text-lg leading-8 text-maroon-900">
              <p>
                प्रश्नसार एक आध्यात्मिक एवं धार्मिक ज्ञान मंच है, जिसका उद्देश्य जैन धर्म के मूल सिद्धांतों, आचार-विचार और शास्त्रों के मर्म को प्रश्नोत्तरी के माध्यम से जन-जन तक पहुँचाना है। यह मंच साधक के भीतर जिज्ञासा जगाता है, ज्ञान का दीप प्रज्वलित करता है और अध्ययन को रोचक एवं सरल बनाता है।
              </p>
              <p>
                यहाँ प्रस्तुत सामग्री प्रामाणिक ग्रंथों, आचार्यों के वचनों और परंपरागत ज्ञान-स्रोतों पर आधारित है। प्लेटफ़ॉर्म पर आयोजित प्रतियोगिताएँ केवल जीत-हार नहीं, बल्कि समझ, चिंतन और आत्मविकास की दिशा में एक पवित्र प्रयास हैं।
              </p>
              <p>
                हमारा विश्वास है— प्रश्न से ज्ञान, और ज्ञान से मोक्ष। इसी भाव से यह मंच निर्मित है, जहाँ हर प्रश्न एक दीपक है और हर उत्तर मार्गदर्शन। आपसे निवेदन है कि श्रद्धा, जिज्ञासा और अनुशासन के साथ अपनी इस आध्यात्मिक यात्रा को आगे बढ़ाएँ।
              </p>
            </div>
          </div>

          {/* Decorative corners */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-0 w-24 h-24 border-t-4 border-l-4 border-gold-500 rounded-tl-2xl"></div>
            <div className="absolute top-0 right-0 w-24 h-24 border-t-4 border-r-4 border-gold-500 rounded-tr-2xl"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 border-b-4 border-l-4 border-gold-500 rounded-bl-2xl"></div>
            <div className="absolute bottom-0 right-0 w-24 h-24 border-b-4 border-r-4 border-gold-500 rounded-br-2xl"></div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

