import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  Video,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Camera,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { ThemeToggle } from '@/components/theme/theme-toggle';
import { toast } from 'sonner';
import { env } from '@/config/env';
import { authApi } from '@/features/auth/api/auth-api';

const loginSchema = z.object({
  email: z.string().min(1, 'Email tidak boleh kosong').email('Masukkan format email yang valid'),
  password: z.string().min(1, 'Password tidak boleh kosong'),
  rememberMe: z.boolean().default(false),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (authApi.isAuthenticated()) {
      navigate('/', { replace: true });
    }
  }, [navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    try {
      const res = await authApi.login({
        email: data.email,
        password: data.password,
      });

      toast.success('Login Berhasil!', {
        description: `Selamat datang kembali, ${res.user?.name || res.user?.email || 'Pengguna'}!`,
      });
      navigate('/');
    } catch (err: any) {
      toast.error('Gagal Masuk', {
        description: err.message || 'Periksa kembali email dan password Anda.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col lg:flex-row bg-background">
      {/* Top right theme toggle */}
      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle />
      </div>

      {/* Left Column: Visual Showcase & Brand Intro */}
      <div className="relative hidden lg:flex lg:w-1/2 flex-col justify-between p-12 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white overflow-hidden">
        {/* Ambient Glows */}
        <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-blue-500/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />

        {/* Logo */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-500/40">
            <Video className="h-6 w-6" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-tight">Kamera Way Kambas</span>
            <span className="text-xs text-blue-200/80 font-medium">Sistem Monitoring Terintegrasi</span>
          </div>
        </div>

        {/* Feature Highlights Showcase */}
        <div className="space-y-8 relative z-10 max-w-md">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/30 bg-blue-500/10 px-3.5 py-1 text-xs font-semibold text-blue-300 backdrop-blur-md">
            <Camera className="h-3.5 w-3.5" />
            <span>Sistem Pemantauan RTSP Live</span>
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl leading-tight">
              Platform Pengawasan Kamera Taman Nasional Way Kambas.
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Pantau endpoint RTSP stream, kelola perangkat kamera, dan lacak isu teknis secara terpusat dengan integrasi backend NestJS & PostgreSQL.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            {[
              'Autentikasi Aman JWT Access & Refresh Token',
              'Manajemen Kamera & RTSP Endpoint (Prisma)',
              'Pelacakan Masalah Terintegrasi GitHub Issues',
            ].map((feat, idx) => (
              <div key={idx} className="flex items-center gap-2.5 text-xs text-slate-200">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>{feat}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-between text-xs text-slate-400 relative z-10 border-t border-white/10 pt-6">
          <span>&copy; {new Date().getFullYear()} {env.appTitle}</span>
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-emerald-400" /> Terkoneksi ke Backend
          </span>
        </div>
      </div>

      {/* Right Column: Authentication Form */}
      <div className="flex flex-1 flex-col justify-center px-6 py-12 sm:px-12 lg:px-16">
        <div className="mx-auto w-full max-w-md space-y-6">
          <div className="space-y-2 text-center sm:text-left">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Masuk ke Akun Anda
            </h2>
            <p className="text-sm text-muted-foreground">
              Masukkan kredensial Anda untuk mengakses dashboard pengawasan kamera.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Alamat Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="admin@destroyer.local"
                  className="pl-10 h-10 text-sm"
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
                    toast.info('Silakan hubungi administrator sistem untuk reset password.');
                  }}
                  className="text-xs font-medium text-primary hover:underline"
                >
                  Lupa password?
                </a>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="pl-10 pr-10 h-10 text-sm"
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
                Ingat perangkat ini
              </label>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-10 font-semibold gap-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Memverifikasi...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <span>Masuk ke Dashboard</span>
                  <ArrowRight className="h-4 w-4" />
                </div>
              )}
            </Button>
          </form>

          {/* Switch to Register */}
          <div className="text-center text-xs text-muted-foreground">
            Belum memiliki akses akun?{' '}
            <Link
              to="/register"
              className="font-semibold text-primary underline-offset-4 hover:underline"
            >
              Daftar akun baru
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
