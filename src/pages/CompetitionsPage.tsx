import React from 'react';
import { motion } from 'framer-motion';

export default function CompetitionsPage() {
  return (
    <div className="min-h-screen guruji-bg-light py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold text-orange-700 mb-8 text-center"
        >
          प्रतियोगिताएँ
        </motion.h1>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3,4,5,6].map((i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white rounded-xl shadow-soft p-6 border border-cream-200 hover:shadow-medium hover:-translate-y-1 transition-all"
            >
              <h3 className="text-xl font-semibold text-maroon-800 mb-2">प्रतियोगिता {i}</h3>
              <p className="text-maroon-700 mb-4">जैन दर्शन, आगम, तीर्थंकर चरित्र आदि विषयों पर आधारित प्रश्नोत्तरी।</p>
              <button className="bg-saffron-600 text-white px-4 py-2 rounded-lg hover:bg-saffron-700">भाग लें</button>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

