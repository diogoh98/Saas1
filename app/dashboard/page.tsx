"use client";

import Link from "next/link";
import { Link as LinkIcon, Plus } from "lucide-react";

export default function DashboardPage() {
    const orcamentosMock = [
        { id: "123", cliente: "João Silva", data: "20/10/2023", total: 450.0 },
        { id: "124", cliente: "Maria Souza", data: "21/10/2023", total: 25000.0 },
    ];

    return (
        <div className="max-w-5xl mx-auto p-6 space-y-8 text-[#1A2B4C]">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Meus Orçamentos</h1>
                <Link
                    href="/dashboard/novo"
                    className="bg-[#1A2B4C] hover:bg-[#1A2B4C]/90 text-white px-5 py-2 rounded-lg font-semibold flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" /> Novo
                </Link>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {orcamentosMock.map((orc) => (
                    <div key={orc.id} className="bg-white rounded-xl shadow p-6 border border-gray-100 flex flex-col justify-between">
                        <div>
                            <div className="text-sm text-gray-400 mb-1">{orc.data}</div>
                            <div className="font-bold text-lg text-[#1A2B4C]">{orc.cliente}</div>
                        </div>

                        <div className="mt-4 flex items-end justify-between">
                            <div className="text-xl font-black text-[#2ECC71]">
                                R$ {orc.total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                            </div>

                            <button
                                onClick={() => {
                                    /* In a Client Component we would use clipboard, using a dummy here */
                                }}
                                className="text-gray-400 hover:text-[#1A2B4C] transition-colors p-2"
                                title="Copiar Link Público"
                            >
                                <LinkIcon className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
