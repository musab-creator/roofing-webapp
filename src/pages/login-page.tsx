import React from 'react';
import { Button } from '../components/ui/button';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../components/ui/use-toast';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, Lock } from 'lucide-react';

type Props = {};

export default function LoginPage() {
  const navigate = useNavigate();
  const auth = useAuth();
  const { toast } = useToast();

  const handleGoogleSignin = async (e: any) => {
    e.preventDefault();
    // @ts-ignore
    const loginWithGoogle = await auth.googleLogin();

    if (loginWithGoogle.error) {
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong',
        description: `${loginWithGoogle.error.message}`
      });
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-slate-950 px-5 py-12 text-slate-100">
      {/* Graphic backdrop matching the marketing site */}
      <div className="absolute inset-0 bg-[radial-gradient(900px_500px_at_70%_-10%,#1e40af_0%,transparent_55%),radial-gradient(700px_450px_at_10%_20%,#0c4a6e_0%,transparent_50%),linear-gradient(180deg,#020617,#0b1220)]" />
      <div className="dr-grid-bg absolute inset-0 opacity-40" />
      <div className="absolute -left-16 top-24 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" />
      <div className="absolute -right-10 bottom-10 h-72 w-72 rounded-full bg-amber-500/15 blur-3xl" />

      <div className="relative w-full max-w-md">
        <Link
          to="/"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-400 transition hover:text-white">
          <ArrowLeft className="h-4 w-4" /> Back to website
        </Link>

        <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-8 shadow-2xl backdrop-blur-xl">
          <div className="flex flex-col items-center text-center">
            <div className="grid h-16 w-16 place-items-center overflow-hidden rounded-2xl bg-blue-600 shadow-lg shadow-blue-600/30 ring-1 ring-white/20">
              <img
                src="/company-logo.png"
                alt="Diversity Roofing logo"
                className="h-full w-full object-cover"
              />
            </div>
            <p className="mt-5 text-2xl font-extrabold tracking-tight text-white">
              Diversity <span className="text-amber-400">Roofing</span>
            </p>
            <h1 className="mt-4 text-xl font-bold text-white">Client &amp; Team Portal</h1>
            <p className="mt-2 text-sm text-slate-300">
              Sign in to manage quotes, invoices and jobs.
            </p>

            <form onSubmit={handleGoogleSignin} className="mt-7 w-full">
              <Button
                variant={'outline'}
                className="w-full border-white/15 bg-white text-slate-900 hover:bg-slate-100"
                type="submit">
                <img src="/assets/google-icon-144.png" alt="Google Icon" className="mr-2 h-4 w-4" />
                Sign in with Google
              </Button>
            </form>

            <p className="mt-5 flex items-center gap-2 text-xs text-slate-400">
              <Lock className="h-3.5 w-3.5" /> Secured sign-in · Authorized users only
            </p>
          </div>
        </div>

        <p className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-500">
          <ShieldCheck className="h-4 w-4 text-emerald-400" /> Licensed &amp; Insured Roofing
          Professionals
        </p>
      </div>
    </div>
  );
}
