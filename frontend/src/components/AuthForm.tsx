import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useAuthStore } from '../utils/auth-store';

interface Props {
  mode: 'login' | 'register';
}

export function AuthForm({ mode }: Props) {
  const navigate = useNavigate();
  const { signIn, signUp, loading: authLoading } = useAuthStore();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted');

    // Basic validation
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }


    setIsLoading(true);

    try {
      if (mode === 'login') {
        console.log('Attempting login...');
        await signIn(email, password);
        toast.success('Successfully signed in!');
        navigate('/profile');
      } else {
        console.log('Attempting registration...');
        await signUp(email, password);
        toast.success('Registration successful! Please check your email to confirm your account.');
        // Don't navigate after signup - wait for email confirmation
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      const errorMessage = error?.message || error?.error_description || 'Authentication failed. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <Card className="w-full max-w-md p-6 bg-gray-900 border-gray-800">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-white">
            {mode === 'login' ? 'Sign In' : 'Create Account'}
          </h2>
          <p className="text-gray-400">
            {mode === 'login'
              ? 'Welcome back! Sign in to your account'
              : 'Get started with your reseller account'}
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-gray-800 border-gray-700 text-white"
            />
          </div>
          <div className="space-y-2">
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-gray-800 border-gray-700 text-white"
            />
          </div>
        </div>

        <Button
          type="submit"
          className="w-full bg-white text-black hover:bg-gray-200"
          disabled={isLoading || authLoading}
        >
          {(isLoading || authLoading)
            ? 'Processing...'
            : mode === 'login'
            ? 'Sign In'
            : 'Create Account'}
        </Button>

        <p className="text-center text-gray-400 text-sm">
          {mode === 'login' ? (
            <>
              Don't have an account?{' '}
              <Button
                variant="link"
                className="text-white p-0 h-auto"
                onClick={() => navigate('/register')}
              >
                Sign up
              </Button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <Button
                variant="link"
                className="text-white p-0 h-auto"
                onClick={() => navigate('/login')}
              >
                Sign in
              </Button>
            </>
          )}
        </p>
      </form>
    </Card>
  );
}
