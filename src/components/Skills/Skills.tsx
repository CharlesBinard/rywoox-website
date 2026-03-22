import { motion, type Variants } from 'framer-motion'
import { GlassCard } from '@/components/ui'

const skills = [
  { name: 'React', icon: '⚛️', gradient: 'from-blue-400 to-cyan-400' },
  { name: 'TypeScript', icon: '📘', gradient: 'from-blue-500 to-blue-600' },
  { name: 'Node.js', icon: '🟢', gradient: 'from-green-400 to-green-600' },
  { name: 'Python', icon: '🐍', gradient: 'from-yellow-400 to-yellow-600' },
  { name: 'PostgreSQL', icon: '🐘', gradient: 'from-blue-400 to-indigo-500' },
  { name: 'Docker', icon: '🐳', gradient: 'from-blue-400 to-blue-600' },
  { name: 'TailwindCSS', icon: '🎨', gradient: 'from-cyan-400 to-teal-500' },
  { name: 'Git', icon: '📦', gradient: 'from-orange-400 to-orange-600' },
  { name: 'GraphQL', icon: '🔷', gradient: 'from-pink-400 to-rose-500' },
  { name: 'Redis', icon: '🔴', gradient: 'from-red-400 to-red-600' },
  { name: 'AWS', icon: '☁️', gradient: 'from-orange-400 to-yellow-500' },
  { name: 'Rust', icon: '🦀', gradient: 'from-orange-500 to-red-500' },
]

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.2,
    },
  },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30, scale: 0.9 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: 'easeOut',
    },
  },
}

export const Skills = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.7, ease: 'easeOut' }}
      className="max-w-4xl mx-auto"
    >
      <h2 className="text-4xl font-bold mb-12 text-center bg-gradient-to-r from-neon-cyan to-neon-purple bg-clip-text text-transparent">
        Tech Stack
      </h2>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"
      >
        {skills.map((skill) => (
          <motion.div
            key={skill.name}
            variants={itemVariants}
            whileHover={{
              scale: 1.08,
              y: -6,
              transition: { type: 'spring', stiffness: 300, damping: 20 },
            }}
          >
            <GlassCard glowBorder className="text-center cursor-pointer group h-full flex flex-col items-center justify-center p-5">
              <div
                className={`text-4xl mb-3 mx-auto rounded-xl p-2 bg-gradient-to-br ${skill.gradient}`}
                style={{ filter: 'drop-shadow(0 0 8px rgba(0,245,255,0.3))' }}
              >
                {skill.icon}
              </div>
              <p className="font-medium text-gray-300 group-hover:text-white transition-colors">
                {skill.name}
              </p>
            </GlassCard>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  )
}
