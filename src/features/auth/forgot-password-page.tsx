import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { authApi } from '@/api/auth.api';
import { useToast } from '@/app/toast-context';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Library, ArrowLeft, MailCheck } from 'lucide-react';

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export function ForgotPasswordPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (values: ForgotPasswordValues) => {
    try {
      setIsSubmitting(true);
      await authApi.forgotPassword(values.email);
      setSubmitted(true);
      toast.success('Reset instructions sent to your email');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Request failed';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-background via-background to-secondary/30">
      <div className="w-full max-w-md rounded-3xl border border-border bg-card/90 backdrop-blur-xl p-8 shadow-2xl flex flex-col gap-6 animate-in zoom-in-95">
        <div className="flex flex-col items-center text-center gap-2">
          <div className="w-12 h-12 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shadow-md shadow-primary/20">
            <Library className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold font-display tracking-tight text-foreground mt-2">
            Reset your password
          </h1>
          <p className="text-sm text-muted-foreground">
            Enter your email address and we will send you instructions to reset your password.
          </p>
        </div>

        {submitted ? (
          <div className="flex flex-col items-center text-center gap-4 py-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <MailCheck className="w-7 h-7" />
            </div>
            <p className="text-sm text-foreground">
              If an account with that email exists, we have sent password reset instructions.
            </p>
            <Link to="/login" className="w-full">
              <Button variant="outline" size="md" className="w-full gap-2">
                <ArrowLeft className="w-4 h-4" />
                Return to Sign In
              </Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="user@example.com"
              error={errors.email?.message}
              {...register('email')}
            />

            <Button
              type="submit"
              isLoading={isSubmitting}
              size="lg"
              className="w-full mt-2"
            >
              Send Reset Link
            </Button>

            <div className="text-center text-xs pt-2">
              <Link to="/login" className="text-primary hover:underline font-medium inline-flex items-center gap-1">
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
