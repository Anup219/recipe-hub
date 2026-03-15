import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { Toaster } from '../components/ui/sonner';
import { AuthProvider } from '../context/AuthContext';
import { ThemeProvider } from 'next-themes';
import { AnimatePresence, motion } from 'motion/react';

// Scroll to top whenever the route changes
const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);
  return null;
};

const PageWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
  >
    {children}
  </motion.div>
);

const AnimatedOutlet: React.FC = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait" initial={false}>
      <PageWrapper key={location.pathname}>
        <Outlet />
      </PageWrapper>
    </AnimatePresence>
  );
};

export const Root: React.FC = () => {
  return (
    <ThemeProvider attribute="class" defaultTheme="light">
      <AuthProvider>
        <div className="min-h-screen bg-background flex flex-col">
          <ScrollToTop />
          <Header />
          <main className="container py-6 flex-1 px-4 md:px-6">
            <AnimatedOutlet />
          </main>
          <Footer />
          <Toaster position="top-center" />
        </div>
      </AuthProvider>
    </ThemeProvider>
  );
};