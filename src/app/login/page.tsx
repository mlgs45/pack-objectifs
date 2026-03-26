"use client";
import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginInput } from "@/lib/validators";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AlertCircle, ArrowRight } from "lucide-react";

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    setLoading(true);
    setError("");
    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });
      if (result?.error) {
        setError("Email ou mot de passe incorrect");
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch {
      setError("Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left branding panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-sidebar relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(232,68,26,0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(27,58,107,0.3),transparent_50%)]" />
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-gradient-accent rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-accent/30">
              PO
            </div>
            <div>
              <h1 className="text-white font-bold text-lg">Pack Objectifs</h1>
              <p className="text-white/40 text-xs tracking-wider uppercase">CCI Centre Val-de-Loire</p>
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-4xl font-bold text-white leading-tight">
              Pilotez vos projets<br />
              <span className="text-accent">export</span> avec précision
            </h2>
            <p className="text-white/50 text-lg max-w-md leading-relaxed">
              Plateforme de gestion des prestations export pour le réseau Team France Export.
            </p>
          </div>

          <p className="text-white/20 text-sm">
            © 2026 CCI Centre Val-de-Loire — Team France Export
          </p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center bg-gradient-page px-6">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-10">
            <div className="inline-flex items-center justify-center h-14 w-14 bg-gradient-primary rounded-2xl mb-4 shadow-lg shadow-primary/20">
              <span className="text-white font-bold text-xl">PO</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900">Pack Objectifs</h1>
            <p className="text-gray-400 text-xs tracking-wider uppercase mt-1">CCI Centre Val-de-Loire</p>
          </div>

          <div className="space-y-2 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Connexion</h2>
            <p className="text-sm text-gray-500">Accédez à votre espace conseiller</p>
          </div>

          {error && (
            <div className="mb-6 flex items-center gap-2.5 bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm font-medium border border-red-100">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input
              id="email"
              type="email"
              label="Email"
              placeholder="conseiller@cci.fr"
              error={errors.email?.message}
              {...register("email")}
            />
            <Input
              id="password"
              type="password"
              label="Mot de passe"
              placeholder="••••••••"
              error={errors.password?.message}
              {...register("password")}
            />
            <Button type="submit" variant="secondary" className="w-full" size="lg" loading={loading}>
              Se connecter
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>

          <p className="text-center text-[11px] text-gray-400 mt-8 tracking-wide">
            Réseau Team France Export
          </p>
        </div>
      </div>
    </div>
  );
}
