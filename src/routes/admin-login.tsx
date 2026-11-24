import { createFileRoute, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { getAdminSessionFn, loginAdminFn } from "@/lib/admin-auth";

/** Só aceita destinos dentro do admin, para o login não virar um redirecionador aberto. */
function safeRedirect(value: unknown): string {
  return typeof value === "string" && /^\/admin(\/|\?|$)/.test(value) ? value : "/admin/metricas";
}

export const Route = createFileRoute("/admin-login")({
  validateSearch: (search: Record<string, unknown>): { redirect?: string } =>
    typeof search["redirect"] === "string" ? { redirect: search["redirect"] } : {},
  beforeLoad: async ({ search }) => {
    const { authed } = await getAdminSessionFn();
    if (authed) throw redirect({ href: safeRedirect(search.redirect) });
  },
  head: () => ({
    meta: [{ title: "Login | Esolution Admin" }, { name: "robots", content: "noindex, nofollow" }],
  }),
  component: AdminLogin,
});

function AdminLogin() {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  // Antes do JavaScript ativar, um clique em "Acessar" só recarregaria a página sem aviso.
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  const search = Route.useSearch();
  const redirectTo = safeRedirect(search.redirect);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Lê do próprio campo: se a senha foi digitada ou preenchida pelo navegador antes de a
    // página ativar, o estado do React ficou vazio, mas o campo tem o valor certo.
    const field = e.currentTarget.elements.namedItem("password");
    const raw = field instanceof HTMLInputElement ? field.value : "";
    const typed = raw.trim(); // teclado de celular costuma deixar um espaço no fim
    if (!typed) {
      setError("Digite a senha");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const { ok } = await loginAdminFn({ data: { password: typed } });
      if (!ok) {
        setError("Senha incorreta");
        setLoading(false);
        return;
      }
      // Confere se o navegador guardou o cookie de sessão antes de sair desta tela.
      const { authed } = await getAdminSessionFn();
      if (!authed) {
        setError(
          "A senha está certa, mas o navegador não guardou o login. Verifique se os cookies estão permitidos para este site.",
        );
        setLoading(false);
        return;
      }
      window.location.href = redirectTo;
    } catch (err) {
      console.error("[Admin Login] Erro na autenticação:", err);
      const msg = err instanceof Error ? err.message : "";
      setError(
        msg.includes("ADMIN_PASSWORD")
          ? "O servidor está sem ADMIN_PASSWORD configurada."
          : "Não foi possível falar com o servidor. Confira se o npm run dev está rodando e tente de novo.",
      );
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 text-gray-900 [color-scheme:light]">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-green-600 mb-4">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Esolution Admin</h1>
          <p className="mt-2 text-gray-600">Área restrita - Painel de métricas</p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8"
          noValidate
        >
          <div className="space-y-6">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Senha de acesso
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  /* Sem "value" de propósito: controlado, o React apagaria a senha digitada ou
                     preenchida pelo navegador antes de a página terminar de carregar. */
                  onChange={() => error && setError("")}
                  className={cn(
                    "w-full px-4 py-3 rounded-lg border bg-white text-gray-900 transition-colors",
                    "placeholder:text-gray-400",
                    error
                      ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:border-green-500 focus:ring-green-500",
                  )}
                  placeholder="Digite a senha"
                  disabled={loading}
                  autoComplete="current-password"
                  aria-invalid={error ? "true" : "false"}
                  aria-describedby={error ? "password-error" : undefined}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {error && (
                <p id="password-error" className="mt-1.5 text-sm text-red-600" role="alert">
                  {error}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !ready}
              className={cn(
                "w-full py-3 px-4 rounded-lg font-medium text-white transition-colors",
                "focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2",
                loading || !ready
                  ? "bg-green-400 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700",
              )}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
                  Entrando...
                </span>
              ) : ready ? (
                "Acessar Painel"
              ) : (
                "Carregando..."
              )}
            </button>
          </div>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Apenas usuários autorizados. Em caso de dúvida, contate o administrador.
        </p>
      </div>
    </div>
  );
}
