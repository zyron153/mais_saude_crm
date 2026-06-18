import { Stethoscope } from "lucide-react";

export default function LoginPage() {
  const keycloakUrl = process.env.NEXT_PUBLIC_KEYCLOAK_URL;
  const realm = process.env.NEXT_PUBLIC_KEYCLOAK_REALM;
  const clientId = process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID;

  const loginUrl =
    keycloakUrl && realm && clientId
      ? `${keycloakUrl}/realms/${realm}/protocol/openid-connect/auth?client_id=${clientId}&redirect_uri=__REDIRECT__&response_type=code&scope=openid`
      : "#";

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-6">
        {/* Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Top accent */}
          <div className="h-1.5 bg-gradient-to-r from-brand-500 via-brand-600 to-brand-700" />

          <div className="px-8 py-8 text-center space-y-6">
            {/* Logo */}
            <div className="flex flex-col items-center gap-3">
              <div className="w-14 h-14 bg-brand-600 rounded-2xl flex items-center justify-center shadow-sm">
                <Stethoscope className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">Clínica Mais Saúde</h1>
                <p className="text-sm text-slate-500 mt-0.5">Sistema de Gestão 360</p>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-slate-100" />

            {/* Sign in */}
            <div className="space-y-3">
              <p className="text-sm text-slate-600">
                Inicie sessão com a sua conta institucional para aceder ao sistema.
              </p>
              <a
                href={loginUrl}
                className="flex items-center justify-center w-full bg-brand-600 hover:bg-brand-700 text-white font-semibold py-3 rounded-xl transition-all shadow-sm hover:shadow-md text-sm cursor-pointer"
              >
                Entrar com a sua conta
              </a>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-400">
          Palmarejo, Praia · Cabo Verde
        </p>
      </div>
    </main>
  );
}
