import React from 'react';
import { Heart, Github, ChefHat, Instagram, Twitter } from 'lucide-react';
import { Link } from 'react-router';
import { motion } from 'motion/react';

const footerLinks = {
  Explore: [
    { label: 'Recipes', to: '/' },
    { label: 'Meal Planner', to: '/meal-planner' },
    { label: 'Shopping List', to: '/shopping-list' },
  ],
  Categories: [
    { label: '🌿 Vegetarian', to: '/?dietType=Vegetarian' },
    { label: '🥦 Vegan', to: '/?dietType=Vegan' },
    { label: '🥑 Keto', to: '/?dietType=Keto' },
    { label: '🍕 Italian', to: '/?cuisine=Italian' },
  ],
  Community: [
    { label: 'Share Recipe', to: '/create' },
    { label: 'My Recipes', to: '/my-recipes' },
    { label: 'Favorites', to: '/?favorites=true' },
  ],
};

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const colVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

export const Footer: React.FC = () => {
  return (
    <footer className="mt-20 relative overflow-hidden">
      {/* Brand gradient top border */}
      <div
        className="h-px w-full mb-0"
        style={{ background: 'linear-gradient(90deg, transparent, var(--brand), var(--brand-light), var(--brand), transparent)' }}
      />

      <div
        className="pt-12 pb-8"
        style={{ background: 'var(--hero-gradient)' }}
      >
        <div className="container px-4 md:px-6">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            className="grid grid-cols-1 md:grid-cols-4 gap-8"
          >
            {/* Brand column */}
            <motion.div variants={colVariants} className="space-y-4">
              <Link to="/" className="flex items-center gap-2">
                <ChefHat className="h-7 w-7" style={{ color: 'var(--brand)' }} />
                <span className="text-lg font-bold">
                  Recipe<span style={{ color: 'var(--brand)' }}>Hub</span>
                </span>
              </Link>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Your ultimate destination for discovering, creating, and sharing amazing recipes.
              </p>
              {/* Social icons */}
              <div className="flex gap-3">
                {[
                  { icon: <Github className="h-4 w-4" />, href: '#' },
                  { icon: <Instagram className="h-4 w-4" />, href: '#' },
                  { icon: <Twitter className="h-4 w-4" />, href: '#' },
                ].map(({ icon, href }, i) => (
                  <motion.a
                    key={i}
                    href={href}
                    whileHover={{ scale: 1.15, color: 'var(--brand)' }}
                    whileTap={{ scale: 0.9 }}
                    className="h-8 w-8 rounded-xl border border-border bg-background/60 flex items-center justify-center text-muted-foreground transition-colors"
                  >
                    {icon}
                  </motion.a>
                ))}
              </div>
            </motion.div>

            {/* Link columns */}
            {Object.entries(footerLinks).map(([title, links]) => (
              <motion.div key={title} variants={colVariants} className="space-y-3">
                <h4 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">
                  {title}
                </h4>
                <ul className="space-y-2">
                  {links.map(({ label, to }) => (
                    <li key={to}>
                      <Link
                        to={to}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 hover:pl-1 block"
                        style={{ transition: 'all 0.2s ease' }}
                      >
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </motion.div>

          {/* Bottom bar */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="mt-10 pt-6 border-t border-border flex flex-col md:flex-row justify-between items-center gap-3"
          >
            <p className="text-sm text-muted-foreground flex items-center gap-1.5">
              Made with{' '}
              <motion.span
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
              >
                <Heart className="h-4 w-4 text-red-500 fill-red-500" />
              </motion.span>{' '}
              by RecipeHub Team
            </p>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} RecipeHub. All rights reserved.
            </p>
          </motion.div>
        </div>
      </div>
    </footer>
  );
};
