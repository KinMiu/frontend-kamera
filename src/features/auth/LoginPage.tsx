import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Lock,
  Mail,
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

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().default(false),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: 'admin@kinmiu.dev',
      password: 'password123',
      rememberMe: true,
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    // Simulate authentication API call
    await new Promise((resolve) => setTimeout(resolve, 800));
    setIsLoading(false);

    toast.success('Welcome back, Admin!', {
      description: `Logged in as ${data.email}`,
    });
    navigate('/');
  };

  const fillDemoAccount = (role: 'admin' | 'editor') => {
    if (role === 'admin') {
      setValue('email', 'admin@kinmiu.dev');
      setValue('password', 'admin12345');
    } else {
      setValue('email', 'alex.rivera@example.com');
      setValue('password', 'editor12345');
    }
    toast.info(`Filled demo credentials for ${role}`);
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col lg:flex-row bg-background">
      {/* Top right theme toggle */}
      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle />
      </div>

      {/* Left Column: Visual Showcase & Brand Intro */}
      <div className="relative hidden lg:flex lg:w-1/2 flex-col justify-between p-12 bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 text-white overflow-hidden">
        {/* Ambient Glows */}
        <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-blue-500/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />

        {/* Logo */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500 text-white shadow-lg shadow-blue-500/40">
            <Layers className="h-6 w-6" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-tight">{env.appTitle}</span>
            <span className="text-xs text-blue-200/80 font-medium">Enterprise Edition</span>
          </div>
        </div>

        {/* Feature Highlights Showcase */}
        <div className="space-y-8 relative z-10 max-w-md">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/30 bg-blue-500/10 px-3.5 py-1 text-xs font-semibold text-blue-300 backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            Modern Frontend-Ready Architecture
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight text-white">
              Manage your metrics and users with sheer clarity.
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Production-ready UI powered by TanStack Query, TanStack Table, Recharts, and Tailwind CSS.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            {[
              'TanStack Query v5 with optimistic state updates',
              'TanStack Table with custom filters & multi-sorting',
              'Accessible components with dark & light theme persistence',
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
            <ShieldCheck className="h-4 w-4 text-emerald-400" /> SSL 256-bit Secure
          </span>
        </div>
      </div>

      {/* Right Column: Authentication Form */}
      <div className="flex flex-1 flex-col justify-center px-6 py-12 sm:px-12 lg:px-16">
        <div className="mx-auto w-full max-w-md space-y-6">
          <div className="space-y-2 text-center sm:text-left">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Sign in to your account
            </h2>
            <p className="text-sm text-muted-foreground">
              Enter your credentials to access the administration dashboard.
            </p>
          </div>

          {/* Quick Demo Autofill Helpers */}
          <div className="rounded-xl border border-border/80 bg-muted/30 p-3.5 space-y-2">
            <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              ⚡ Quick Demo Accounts
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => fillDemoAccount('admin')}
                className="flex items-center justify-center gap-1.5 rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-accent transition-colors shadow-2xs"
              >
                <span>Demo Admin</span>
              </button>
              <button
                type="button"
                onClick={() => fillDemoAccount('editor')}
                className="flex items-center justify-center gap-1.5 rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-accent transition-colors shadow-2xs"
              >
                <span>Demo Editor</span>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="name@company.com"
                  className="pl-10"
                  error={Boolean(errors.email)}
                  {...register('email')}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-foreground">Password</label>
                <a
                  href="#forgot-password"
                  onClick={(e) => {
                    e.preventDefault();
                    toast.info('Password reset instructions sent to your email.');
                  }}
                  className="text-xs font-medium text-primary hover:underline"
                >
                  Forgot password?
                </a>
              </div>
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

            {/* Remember Me */}
            <div className="flex items-center space-x-2 pt-1">
              <Checkbox id="rememberMe" defaultChecked {...register('rememberMe')} />
              <label
                htmlFor="rememberMe"
                className="text-xs font-medium text-muted-foreground cursor-pointer"
              >
                Remember this device for 30 days
              </label>
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
                  <span>Authenticating...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <span>Sign In</span>
                  <ArrowRight className="h-4 w-4" />
                </div>
              )}
            </Button>
          </form>

          {/* Switch to Register */}
          <div className="text-center text-xs text-muted-foreground">
            Don&apos;t have an account yet?{' '}
            <Link
              to="/register"
              className="font-semibold text-primary underline-offset-4 hover:underline"
            >
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
