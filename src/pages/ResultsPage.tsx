import React from 'react';
import { motion } from 'framer-motion';

export default function ResultsPage() {
  return (
    <div className="min-h-screen guruji-bg-light py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold text-orange-700 mb-8 text-center"
        >
          परिणाम
        </motion.h1>

        <div className="space-y-4">
          {[1,2,3].map((i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white rounded-xl shadow-soft p-6 border border-cream-200"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-maroon-800">प्रतियोगिता {i}</h3>
                  <p className="text-maroon-700">विजेताओं की सूची — शीर्ष 10 प्रतिभागी</p>
                </div>
                <button className="border border-saffron-600 text-saffron-700 px-4 py-2 rounded-lg hover:bg-saffron-50">विवरण देखें</button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

