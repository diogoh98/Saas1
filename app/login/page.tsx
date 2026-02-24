import { loginComGoogle } from "../actions";
import { LogIn } from "lucide-react";

export default function LoginPage() {
    return (
        <div className="min-h-screen bg-[#F4F7F6] flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 space-y-8">
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold text-[#1A2B4C]">Orçamento Jato</h1>
                    <p className="text-[#1A2B4C]/70">
                        Faça login para criar orçamentos profissionais em segundos.
                    </p>
                </div>

                <form action={loginComGoogle} className="w-full">
                    <button
                        type="submit"
                        className="w-full flex items-center justify-center gap-3 bg-[#1A2B4C] hover:bg-[#1A2B4C]/90 text-white font-semibold py-4 px-6 rounded-xl transition-all active:scale-[0.98]"
                    >
                        <LogIn className="w-5 h-5" />
                        <span>Entrar com Google</span>
                    </button>
                </form>
            </div>
        </div>
    );
}
