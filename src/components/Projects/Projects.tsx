import { motion } from 'framer-motion'
import { useGithubRepos } from '@/hooks'
import { GlassCard } from '@/components/ui'
import { TypingIndicator } from '@/components/ui/TypingIndicator'

export const Projects = () => {
  const { repos, loading, error } = useGithubRepos()

  return (
    <motion.div
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="max-w-4xl mx-auto"
    >
      <h2 className="text-4xl font-bold mb-12 text-center bg-gradient-to-r from-neon-cyan to-neon-purple bg-clip-text text-transparent">
        Public Projects
      </h2>

      {loading && (
        <div className="flex justify-center py-12">
          <TypingIndicator />
        </div>
      )}

      {error && (
        <GlassCard glowBorder className="text-center text-red-400 py-12">
          Failed to load projects. Please try again later.
        </GlassCard>
      )}

      {!loading && !error && (
        <div className="flex flex-col gap-6">
          {repos.map((repo) => (
            <motion.a
              key={repo.id}
              href={repo.html_url}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              whileHover={{ x: 8, scale: 1.01 }}
            >
              <GlassCard glowBorder className="block group h-full">
                <div className="flex items-start justify-between gap-6">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-bold text-white group-hover:text-neon-cyan transition-colors mb-2 flex items-center gap-2">
                      <span>{repo.name}</span>
                      <span className="text-lg opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all">
                        ↗
                      </span>
                    </h3>
                    <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                      {repo.description || 'No description provided'}
                    </p>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                      {repo.language && (
                        <span className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-neon-cyan" />
                          {repo.language}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        ⭐ {repo.stargazers_count}
                      </span>
                      <span className="flex items-center gap-1">
                        🍴 {repo.forks_count}
                      </span>
                      <span className="text-gray-600">
                        {new Date(repo.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                  </div>
                </div>
              </GlassCard>
            </motion.a>
          ))}
        </div>
      )}
    </motion.div>
  )
}
