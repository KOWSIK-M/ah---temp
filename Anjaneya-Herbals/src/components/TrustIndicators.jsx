import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Leaf, Heart, Award, CheckCircle } from 'lucide-react';

const TrustIndicators = () => {
  const features = [
    {
      icon: <Leaf className="w-8 h-8" />,
      title: '100% Natural',
      description: 'Pure herbal ingredients, free from chemicals and preservatives',
      color: 'from-green-400 to-emerald-500'
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: 'Ayurveda Certified',
      description: 'Authentic formulations following ancient Ayurvedic principles',
      color: 'from-yellow-400 to-amber-500'
    },
    {
      icon: <Heart className="w-8 h-8" />,
      title: 'Ethical Sourcing',
      description: 'Direct partnerships with organic farmers across India',
      color: 'from-orange-400 to-red-500'
    },
    {
      icon: <Award className="w-8 h-8" />,
      title: 'Lab Tested',
      description: 'Rigorous quality checks ensuring purity and potency',
      color: 'from-green-400 to-cyan-500'
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100
      }
    }
  };

  return (
    <section className="py-20 relative">
      <div className="container mx-auto px-4 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Why <span className="gradient-text">Trust Us</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Our commitment to purity and tradition is unmatched in the wellness industry
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ y: -15, scale: 1.02 }}
              className="group relative"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-lg transform -rotate-1 group-hover:rotate-0 transition-all duration-300"></div>
              <div className="relative glass-effect p-8 rounded-3xl border border-gray-200 shadow-xl backdrop-blur-sm">
                <div className={`mb-6 w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center shadow-lg`}>
                  <div className="text-white">{feature.icon}</div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600 mb-6">{feature.description}</p>
                <div className="flex items-center text-green-500 font-medium">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  <span>Certified Quality</span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Trust Badges */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="mt-20 flex flex-wrap justify-center items-center gap-8 opacity-75"
        >
          {['Ayurveda Certified', 'ISO 9001:2015', 'GMP Certified', 'Organic India'].map((badge, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.1 }}
              className="bg-white/50 backdrop-blur-sm px-6 py-3 rounded-full border border-gray-200"
            >
              <span className="text-gray-700 font-medium">{badge}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default TrustIndicators;