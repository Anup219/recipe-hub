import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { ChefHat, Mail, Lock, User, Eye, EyeOff, Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useAuth, getFirebaseErrorMessage } from '../context/AuthContext';
import { toast } from 'sonner';

type View = 'login' | 'register' | 'forgot';

export const Login: React.FC = () => {
  const [view, setView] = useState<View>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const { login, register, resetPassword, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (isAuthenticated) navigate('/');
  }, [isAuthenticated, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { toast.error('Please fill in all fields'); return; }
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back to RecipeHub! 👋');
      navigate('/');
    } catch (err) {
      toast.error(getFirebaseErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password || !confirm) { toast.error('Please fill in all fields'); return; }
    if (password !== confirm) { toast.error('Passwords do not match'); return; }
    if (password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      await register(name, email, password);
      toast.success(`Welcome to RecipeHub, ${name}! 🎉`);
      navigate('/');
    } catch (err) {
      toast.error(getFirebaseErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) { toast.error('Please enter your email address'); return; }
    setLoading(true);
    try {
      await resetPassword(email);
      setResetSent(true);
    } catch (err) {
      toast.error(getFirebaseErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const switchView = (v: View) => {
    setResetSent(false);
    setPassword('');
    setConfirm('');
    setView(v);
  };

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-8">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] as any }}
        className="w-full max-w-md"
      >
        <div className="rounded-3xl border border-border overflow-hidden shadow-xl bg-card">
          {/* Brand top bar */}
          <div className="h-1.5 w-full" style={{ background: 'linear-gradient(90deg, var(--brand), #fbbf24)' }} />

          <div className="p-8 space-y-6">
            {/* Logo */}
            <div className="flex flex-col items-center gap-2">
              <motion.div whileHover={{ rotate: 15 }}
                className="h-14 w-14 rounded-2xl flex items-center justify-center"
                style={{ background: 'var(--brand)' }}>
                <ChefHat className="h-8 w-8 text-white" />
              </motion.div>
              <h1 className="text-2xl font-extrabold">RecipeHub</h1>
              <p className="text-sm text-muted-foreground text-center">
                {view === 'login' && 'Sign in to access your recipes and meal plans'}
                {view === 'register' && 'Create your free account to get started'}
                {view === 'forgot' && 'Enter your email to receive a reset link'}
              </p>
            </div>

            {/* Tab switcher — only for login/register */}
            {view !== 'forgot' && (
              <div className="relative flex bg-muted rounded-xl p-1">
                <motion.div
                  className="absolute inset-y-1 rounded-lg bg-card shadow-sm"
                  animate={{ left: view === 'login' ? '4px' : '50%', right: view === 'login' ? '50%' : '4px' }}
                  transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                />
                {(['login', 'register'] as View[]).map(t => (
                  <button key={t} onClick={() => switchView(t)}
                    className={`relative flex-1 py-2 text-sm font-semibold rounded-lg transition-colors z-10 ${
                      view === t ? 'text-foreground' : 'text-muted-foreground'
                    }`}>
                    {t === 'login' ? 'Sign In' : 'Create Account'}
                  </button>
                ))}
              </div>
            )}

            {/* Back button for forgot view */}
            {view === 'forgot' && (
              <button onClick={() => switchView('login')}
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="h-4 w-4" /> Back to Sign In
              </button>
            )}

            {/* Forms */}
            <AnimatePresence mode="wait">

              {/* ── Sign In ── */}
              {view === 'login' && (
                <motion.form key="login"
                  initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.2 }}
                  onSubmit={handleLogin} className="space-y-4">
                  <InputField icon={<Mail className="h-4 w-4" />} label="Email" id="login-email"
                    type="email" placeholder="you@example.com" value={email}
                    onChange={setEmail} disabled={loading} />
                  <div className="space-y-1">
                    <InputField icon={<Lock className="h-4 w-4" />} label="Password" id="login-password"
                      type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={password}
                      onChange={setPassword} disabled={loading}
                      suffix={
                        <button type="button" onClick={() => setShowPassword(!showPassword)}
                          className="text-muted-foreground hover:text-foreground transition-colors">
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      } />
                    <div className="flex justify-end">
                      <button type="button" onClick={() => switchView('forgot')}
                        className="text-xs font-medium hover:underline" style={{ color: 'var(--brand)' }}>
                        Forgot password?
                      </button>
                    </div>
                  </div>
                  <SubmitButton loading={loading} label="Sign In" />
                </motion.form>
              )}

              {/* ── Create Account ── */}
              {view === 'register' && (
                <motion.form key="register"
                  initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.2 }}
                  onSubmit={handleRegister} className="space-y-4">
                  <InputField icon={<User className="h-4 w-4" />} label="Full Name" id="reg-name"
                    type="text" placeholder="John Doe" value={name}
                    onChange={setName} disabled={loading} />
                  <InputField icon={<Mail className="h-4 w-4" />} label="Email" id="reg-email"
                    type="email" placeholder="you@example.com" value={email}
                    onChange={setEmail} disabled={loading} />
                  <InputField icon={<Lock className="h-4 w-4" />} label="Password" id="reg-password"
                    type={showPassword ? 'text' : 'password'} placeholder="Min. 6 characters" value={password}
                    onChange={setPassword} disabled={loading}
                    suffix={
                      <button type="button" onClick={() => setShowPassword(!showPassword)}
                        className="text-muted-foreground hover:text-foreground transition-colors">
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    } />
                  <InputField icon={<Lock className="h-4 w-4" />} label="Confirm Password" id="reg-confirm"
                    type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={confirm}
                    onChange={setConfirm} disabled={loading} />
                  <SubmitButton loading={loading} label="Create Account" />
                </motion.form>
              )}

              {/* ── Forgot Password ── */}
              {view === 'forgot' && (
                <motion.div key="forgot"
                  initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.2 }}>
                  {resetSent ? (
                    /* Success state */
                    <motion.div initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                      className="flex flex-col items-center gap-4 py-4 text-center">
                      <div className="h-16 w-16 rounded-full flex items-center justify-center"
                        style={{ background: 'rgba(34,197,94,0.12)' }}>
                        <CheckCircle2 className="h-9 w-9 text-green-500" />
                      </div>
                      <div>
                        <p className="font-bold text-lg mb-1">Check your inbox!</p>
                        <p className="text-sm text-muted-foreground">
                          A password reset link has been sent to <strong>{email}</strong>.
                          Check your spam folder if you don't see it.
                        </p>
                      </div>
                      <button onClick={() => switchView('login')}
                        className="text-sm font-semibold hover:underline" style={{ color: 'var(--brand)' }}>
                        Back to Sign In
                      </button>
                    </motion.div>
                  ) : (
                    /* Reset email form */
                    <form onSubmit={handleResetPassword} className="space-y-4">
                      <InputField icon={<Mail className="h-4 w-4" />} label="Email Address" id="reset-email"
                        type="email" placeholder="you@example.com" value={email}
                        onChange={setEmail} disabled={loading} />
                      <p className="text-xs text-muted-foreground">
                        We'll send a secure link to this email. Click it to set a new password.
                      </p>
                      <SubmitButton loading={loading} label="Send Reset Link" />
                    </form>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Footer link */}
            {view !== 'forgot' && (
              <p className="text-xs text-center text-muted-foreground">
                {view === 'login' ? (
                  <>Don't have an account?{' '}
                    <button onClick={() => switchView('register')} className="font-semibold hover:underline"
                      style={{ color: 'var(--brand)' }}>Create one free</button>
                  </>
                ) : (
                  <>Already have an account?{' '}
                    <button onClick={() => switchView('login')} className="font-semibold hover:underline"
                      style={{ color: 'var(--brand)' }}>Sign in</button>
                  </>
                )}
              </p>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// ── Shared sub-components ─────────────────────────────────────────────────────
interface InputFieldProps {
  icon: React.ReactNode;
  label: string;
  id: string;
  type: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
  suffix?: React.ReactNode;
}

const InputField: React.FC<InputFieldProps> = ({ icon, label, id, type, placeholder, value, onChange, disabled, suffix }) => (
  <div className="space-y-1.5">
    <label htmlFor={id} className="text-sm font-medium">{label}</label>
    <div className="relative flex items-center">
      <span className="absolute left-3 text-muted-foreground pointer-events-none">{icon}</span>
      <input id={id} type={type} placeholder={placeholder} value={value}
        onChange={e => onChange(e.target.value)} disabled={disabled} required
        className="w-full h-11 pl-9 pr-10 rounded-xl border border-border bg-muted/30 text-sm focus:outline-none focus:ring-2 transition-all disabled:opacity-50"
        style={{ fontFamily: 'var(--font-family)' }} />
      {suffix && <span className="absolute right-3">{suffix}</span>}
    </div>
  </div>
);

const SubmitButton: React.FC<{ loading: boolean; label: string }> = ({ loading, label }) => (
  <motion.button type="submit"
    whileHover={{ scale: loading ? 1 : 1.02 }} whileTap={{ scale: loading ? 1 : 0.97 }}
    disabled={loading}
    className="w-full h-11 rounded-xl font-semibold text-white flex items-center justify-center gap-2 shadow-lg disabled:opacity-70 transition-all mt-2"
    style={{ background: 'var(--brand)' }}>
    {loading && <Loader2 className="h-4 w-4 animate-spin" />}
    {label}
  </motion.button>
);
