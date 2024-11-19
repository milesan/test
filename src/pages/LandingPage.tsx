import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { Terminal, X } from 'lucide-react';

export function LandingPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [output, setOutput] = useState<string[]>(['Welcome to The Garden', 'Create your account to begin', '']);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    
    try {
      setOutput(prev => [...prev, `> Creating account for ${username}...`]);
      
      const { data: { user }, error: signUpError } = await supabase.auth.signUp({
        email: username,
        password,
        options: {
          data: {
            application_status: null
          }
        }
      });

      if (signUpError) throw signUpError;

      setOutput(prev => [...prev, '> Account created successfully!', '> Redirecting...']);
    } catch (err) {
      console.error('Error creating account:', err);
      const message = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(message);
      setOutput(prev => [...prev, `> Error: ${message}`]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    
    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: username,
        password
      });

      if (signInError) throw signInError;

      // If this is the admin account, ensure their metadata is correct
      if (username === 'andre@thegarden.pt') {
        await supabase.auth.updateUser({
          data: {
            application_status: 'approved',
            is_admin: true
          }
        });
      }
    } catch (err) {
      console.error('Error logging in:', err);
      const message = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Login Button */}
      <div className="absolute top-4 right-4">
        <button
          onClick={() => setShowLogin(true)}
          className="px-4 py-2 text-green-500 border border-green-500 rounded hover:bg-green-500 hover:text-black transition-colors font-mono text-sm"
        >
          Login
        </button>
      </div>

      {/* Main Content */}
      <div className="flex items-center justify-center p-4 min-h-screen">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="flex items-center justify-center gap-3 mb-6">
            <Terminal className="w-8 h-8 text-green-500" />
            <h1 className="text-2xl font-mono text-green-500">The Garden</h1>
          </div>

          <div 
            className="font-mono text-sm text-green-500 bg-black border border-green-500 rounded-lg p-4 mb-4 h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-green-500 scrollbar-track-transparent"
          >
            <AnimatePresence mode="sync">
              {output.map((line, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: line.startsWith('>') ? -10 : 0 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="mb-1"
                >
                  {line}
                </motion.div>
              ))}
              {error && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-red-500"
                >
                  Error: {error}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <input
                type="email"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full font-mono text-sm bg-black text-green-500 border border-green-500 p-3 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent placeholder-green-800"
                placeholder="Email"
                required
                autoComplete="off"
                spellCheck="false"
                disabled={isLoading}
              />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full font-mono text-sm bg-black text-green-500 border border-green-500 p-3 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent placeholder-green-800"
                placeholder="Password"
                required
                autoComplete="new-password"
                disabled={isLoading}
              />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-green-500 text-black py-3 rounded-lg hover:bg-green-400 transition-colors font-mono text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </button>
            </motion.div>
          </form>
        </motion.div>
      </div>

      {/* Login Modal */}
      {showLogin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-black border border-green-500 rounded-lg p-6 w-full max-w-md relative"
          >
            <button
              onClick={() => setShowLogin(false)}
              className="absolute top-4 right-4 text-green-500 hover:text-green-400"
            >
              <X className="w-6 h-6" />
            </button>

            <h2 className="text-xl font-mono text-green-500 mb-6">Login</h2>

            <form onSubmit={handleLogin} className="space-y-4">
              <input
                type="email"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full font-mono text-sm bg-black text-green-500 border border-green-500 p-3 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent placeholder-green-800"
                placeholder="Email"
                required
                autoComplete="off"
                spellCheck="false"
                disabled={isLoading}
              />
              
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full font-mono text-sm bg-black text-green-500 border border-green-500 p-3 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent placeholder-green-800"
                placeholder="Password"
                required
                autoComplete="current-password"
                disabled={isLoading}
              />

              {error && (
                <div className="text-red-500 text-sm">{error}</div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-green-500 text-black py-3 rounded-lg hover:bg-green-400 transition-colors font-mono text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Logging in...' : 'Login'}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}