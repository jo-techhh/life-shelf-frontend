import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/app/auth-context';
import { useToast } from '@/app/toast-context';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff, LogIn } from 'lucide-react';

const loginSchema = z.object({
  emailOrUsername: z.string().min(1, 'Please enter your email or username'),
  password: z.string().min(1, 'Please enter your password'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      emailOrUsername: '',
      password: '',
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    try {
      setIsSubmitting(true);
      await login(values);
      toast.success('Welcome back to LifeShelf!');
      navigate(from, { replace: true });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Invalid credentials';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-background via-background to-secondary/30">
      <div className="w-full max-w-md rounded-3xl border border-border bg-card/90 backdrop-blur-xl p-8 shadow-2xl flex flex-col gap-6 animate-in zoom-in-95">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center gap-2">
          <div className="w-14 h-14 rounded-2xl overflow-hidden shadow-md border border-border/60 bg-card flex items-center justify-center">
            <img src="/logo.png" alt="LifeShelf" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-2xl font-bold font-display tracking-tight text-foreground mt-1">
            LifeShelf
          </h1>
          <p className="text-[11px] font-medium text-muted-foreground tracking-wide -mt-1">
            Watch · Read · Learn · Explore
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Welcome back. What are we watching, reading, or learning today?
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Input
            label="Email or Username"
            placeholder="user@example.com or username"
            error={errors.emailOrUsername?.message}
            {...register('emailOrUsername')}
          />

          <div className="relative">
            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              error={errors.password?.message}
              {...register('password')}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-8 text-muted-foreground hover:text-foreground p-1 transition-colors"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          <div className="flex items-center justify-end text-xs">
            <Link
              to="/forgot-password"
              className="text-primary hover:underline font-medium"
            >
              Forgot password?
            </Link>
          </div>

          <Button
            type="submit"
            isLoading={isSubmitting}
            size="lg"
            className="w-full mt-2 gap-2"
          >
            <LogIn className="w-4 h-4" />
            Sign In
          </Button>
        </form>

        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground border-t border-border/60 pt-4">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="text-primary font-semibold hover:underline">
            Create account
          </Link>
        </div>
      </div>
    </div>
  );
}
