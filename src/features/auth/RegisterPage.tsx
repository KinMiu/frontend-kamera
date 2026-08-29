import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Lock,
  Mail,
  User as UserIcon,
  Eye,
  EyeOff,
  Layers,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { ThemeToggle } from '@/components/theme/theme-toggle';
import { toast } from 'sonner';
import { env } from '@/config/env';

const registerSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(6, 'Confirm password must be at least 6 characters'),
    terms: z.boolean().refine((val) => val === true, {
      message: 'You must agree to the Terms of Service to continue',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

export function RegisterPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      terms: false,
    },
  });

  const termsValue = watch('terms');

  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);
    // Simulate registration API call
    await new Promise((resolve) => setTimeout(resolve, 800));
    setIsLoading(false);

    toast.success('Account created successfully!', {
      description: `Welcome, ${data.name}. You can now sign in.`,
    });
    navigate('/login');
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col lg:flex-row bg-background">
      {/* Top right theme toggle */}
      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle />
      </div>

      {/* Left Column: Visual Showcase */}
      <div className="relative hidden lg:flex lg:w-1/2 flex-col justify-between p-12 bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-950 text-white overflow-hidden">
        {/* Ambient Glows */}
        <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-blue-500/20 blur-3xl pointer-events-none" />

        {/* Logo */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500 text-white shadow-lg shadow-blue-500/40">
            <Layers className="h-6 w-6" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-tight">{env.appTitle}</span>
            <span className="text-xs text-indigo-200/80 font-medium">Enterprise Edition</span>
          </div>
        </div>

        {/* Hero Pitch */}
        <div className="space-y-8 relative z-10 max-w-md">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-400/30 bg-indigo-500/10 px-3.5 py-1 text-xs font-semibold text-indigo-300 backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            Join 20,000+ Fast-Moving Teams
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight text-white">
              Launch your next SaaS or internal tool in days.
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Clean architecture, modular hooks, customizable components, and instant API readiness.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            {[
              'Instant TanStack Query CRUD state management',
              'Validated forms with React Hook Form + Zod',
              'Comprehensive responsive admin layout & dark mode',
            ].map((feat, i) => (
              <div key={i} className="flex items-center gap-3 text-xs text-slate-200">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>{feat}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-between text-xs text-slate-400 relative z-10">
          <span>&copy; {new Date().getFullYear()} {env.appTitle}</span>
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-emerald-400" /> High-Standard Security
          </span>
        </div>
      </div>

      {/* Right Column: Register Form */}
      <div className="flex flex-1 flex-col justify-center px-6 py-12 sm:px-12 lg:px-16">
        <div className="mx-auto w-full max-w-md space-y-6">
          <div className="space-y-2 text-center sm:text-left">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Create your account
            </h2>
            <p className="text-sm text-muted-foreground">
              Get started with your free 14-day administrative trial.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Full Name</label>
              <div className="relative">
                <UserIcon className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Kin Miu"
                  className="pl-10"
                  error={Boolean(errors.name)}
                  {...register('name')}
                />
              </div>
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name.message}</p>
              )}
            </div>

            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Work Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="admin@kinmiu.dev"
                  className="pl-10"
                  error={Boolean(errors.email)}
                  {...register('email')}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="pl-10 pr-10"
                  error={Boolean(errors.password)}
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-destructive">{errors.password.message}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="pl-10"
                  error={Boolean(errors.confirmPassword)}
                  {...register('confirmPassword')}
                />
              </div>
              {errors.confirmPassword && (
                <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
              )}
            </div>

            {/* Terms Checkbox */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="terms"
                  checked={termsValue}
                  onCheckedChange={(checked) => setValue('terms', checked === true)}
                />
                <label
                  htmlFor="terms"
                  className="text-xs font-medium text-muted-foreground leading-normal cursor-pointer"
                >
                  I agree to the{' '}
                  <a
                    href="#terms-modal"
                    onClick={(e) => {
                      e.preventDefault();
                      toast.info('Terms of Service: Standard SaaS license.');
                    }}
                    className="text-primary underline hover:text-primary/80"
                  >
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a
                    href="#privacy-modal"
                    onClick={(e) => {
                      e.preventDefault();
                      toast.info('Privacy Policy: We protect your data securely.');
                    }}
                    className="text-primary underline hover:text-primary/80"
                  >
                    Privacy Policy
                  </a>
                  .
                </label>
              </div>
              {errors.terms && (
                <p className="text-xs text-destructive">{errors.terms.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="gradient"
              className="w-full h-10 font-semibold"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Creating Account...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <span>Create Account</span>
                  <ArrowRight className="h-4 w-4" />
                </div>
              )}
            </Button>
          </form>

          {/* Switch to Login */}
          <div className="text-center text-xs text-muted-foreground">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-semibold text-primary underline-offset-4 hover:underline"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
