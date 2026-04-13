import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import BrandLogo from '../components/BrandLogo';

const COPYRIGHT_TEXT = '© gnanasekaran.mernstack@gmail.com';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(name, email, password);
      toast.success('Registered successfully');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 animate-fade-in-up">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl glass-panel p-8 shadow-2xl">
        <div className="pointer-events-none absolute -top-32 -left-32 h-64 w-64 rounded-full bg-fuchsia-500 opacity-15 blur-[80px]"></div>
        <div className="pointer-events-none absolute -bottom-32 -right-32 h-64 w-64 rounded-full bg-cyan-500 opacity-10 blur-[80px]"></div>

        <div className="relative z-10">
          <div className="mb-8 flex justify-center">
            <BrandLogo />
          </div>

          <h2 className="mb-2 text-center text-3xl font-bold text-white">Create Account</h2>
          <p className="mb-8 text-center text-indigo-300/80">Start tracking your AI tools today</p>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-300">Full Name</label>
              <input
                type="text"
                required
                className="w-full rounded-xl glass-input px-4 py-3 placeholder-gray-500 transition-all focus:bg-white/10"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-300">Email Address</label>
              <input
                type="email"
                required
                className="w-full rounded-xl glass-input px-4 py-3 placeholder-gray-500 transition-all focus:bg-white/10"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-300">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="w-full rounded-xl glass-input px-4 py-3 pr-12 placeholder-gray-500 transition-all focus:bg-white/10"
                  placeholder="Create a secure password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 transition-colors hover:text-cyan-400"
                >
                  {showPassword ? <FiEyeOff className="h-5 w-5" /> : <FiEye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="mt-6 w-full rounded-xl bg-linear-to-r from-indigo-500 to-cyan-500 py-3 font-semibold text-white shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-all outline-none hover:-translate-y-0.5 hover:from-indigo-400 hover:to-cyan-400 hover:shadow-[0_0_25px_rgba(99,102,241,0.6)]"
            >
              Sign Up
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-400">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-cyan-400 transition-colors hover:text-cyan-300">
              Sign in here
            </Link>
          </p>
          <p className="mt-4 text-center text-xs text-gray-500">{COPYRIGHT_TEXT}</p>
        </div>
      </div>
    </div>
  );
}
