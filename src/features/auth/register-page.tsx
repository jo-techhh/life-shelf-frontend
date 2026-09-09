import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/app/auth-context';
import { useToast } from '@/app/toast-context';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Library, UserPlus } from 'lucide-react';

const registerSchema = z
  .object({
    displayName: z.string().max(50).optional(),
    username: z
      .string()
      .min(3, 'Username must be at least 3 characters')
      .max(30, 'Username cannot exceed 30 characters')
      .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, hyphens, and underscores'),
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

export function RegisterPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register: registerAuth } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      displayName: '',
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (values: RegisterFormValues) => {
    try {
      setIsSubmitting(true);
      await registerAuth({
        username: values.username,
        email: values.email,
        password: values.password,
        displayName: values.displayName || undefined,
      });
      toast.success('Your LifeShelf account is ready!');
      navigate('/dashboard', { replace: true });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Registration failed';
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
          <div className="w-12 h-12 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shadow-md shadow-primary/20">
            <Library className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold font-display tracking-tight text-foreground mt-2">
            Create your LifeShelf
          </h1>
          <p className="text-sm text-muted-foreground">
            A single shelf for everything you watch, read, learn, and explore.
          </p>
        </div>

        {/* Registration Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3.5">
          <Input
            label="Display Name (optional)"
            placeholder="Alex Rivera"
            error={errors.displayName?.message}
            {...register('displayName')}
          />

          <Input
            label="Username *"
            placeholder="alex_rivera"
            error={errors.username?.message}
            {...register('username')}
          />

          <Input
            label="Email Address *"
            type="email"
            placeholder="alex@example.com"
            error={errors.email?.message}
            {...register('email')}
          />

          <Input
            label="Password *"
            type="password"
            placeholder="Minimum 8 characters"
            error={errors.password?.message}
            {...register('password')}
          />

          <Input
            label="Confirm Password *"
            type="password"
            placeholder="Re-enter your password"
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />

          <Button
            type="submit"
            isLoading={isSubmitting}
            size="lg"
            className="w-full mt-3 gap-2"
          >
            <UserPlus className="w-4 h-4" />
            Create LifeShelf
          </Button>
        </form>

        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground border-t border-border/60 pt-4">
          Already have an account?{' '}
          <Link to="/login" className="text-primary font-semibold hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
