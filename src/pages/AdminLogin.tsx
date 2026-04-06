import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { Flame, LogIn } from "lucide-react";

const AdminLogin = () => {
  const { signIn, loading } = useAdminAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    const { error: err } = await signIn(email, password);
    if (err) {
      setError(err);
      setSubmitting(false);
    } else {
      navigate("/admin");
    }
  };

  if (loading) return null;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
            <Flame className="h-8 w-8 text-primary" />
          </div>
          <h1 className="font-display text-3xl text-gradient-brasil">PAINEL ADMIN</h1>
          <p className="text-muted-foreground text-sm mt-1">Churrasco da Torcida</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-xl border border-destructive/20">
              {error}
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-foreground block mb-1.5">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-foreground text-sm placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/40 outline-none"
              placeholder="admin@email.com"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground block mb-1.5">Senha</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-foreground text-sm placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/40 outline-none"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-gradient-green text-primary-foreground py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:brightness-110 transition-all disabled:opacity-50"
          >
            <LogIn className="h-4 w-4" />
            {submitting ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
