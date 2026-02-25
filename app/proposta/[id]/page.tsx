import { createClient } from "@supabase/supabase-js";
import React from "react";

// Inicializando Supabase (Leitura Pública / Anon)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function PropostaPublicaPage(props: PageProps) {
    // Correção Next.js 15: params agora é uma Promise
    const params = await props.params;
    const id = params.id;

    // Busca do orçamento no BD
    const { data: orcamento, error } = await supabase
        .from('orcamentos')
        .select('*')
        .eq('id', id)
        .single();

    if (error || !orcamento) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F4F7F6] text-[#1A2B4C]">
                <div className="bg-[#FFFFFF] p-8 rounded-xl shadow-md border border-[#E2E8F0] text-center">
                    <h1 className="text-2xl font-bold mb-2">Orçamento Não Encontrado</h1>
                    <p className="text-gray-600">Verifique o link ou se o orçamento foi deletado.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F4F7F6] font-sans">
            {/* CABEÇALHO AZUL */}
            <header className="bg-[#1A2B4C] text-[#FFFFFF] shadow-md py-8">
                <div className="max-w-4xl mx-auto px-6">
                    <h1 className="text-3xl font-extrabold tracking-tight">{orcamento.nome_empresa}</h1>
                    <p className="opacity-80 mt-1 uppercase text-sm tracking-widest">Proposta Comercial Oficial</p>
                </div>
            </header>

            {/* CONTEÚDO */}
            <main className="max-w-4xl mx-auto px-6 py-10">
                <div className="bg-[#FFFFFF] p-8 rounded-2xl shadow-lg border border-[#E2E8F0]">

                    <div className="mb-10 pb-6 border-b border-[#E2E8F0]">
                        <h2 className="text-sm uppercase tracking-wider text-gray-500 font-bold mb-1">Cliente</h2>
                        <p className="text-2xl text-[#1A2B4C] font-semibold">{orcamento.nome_cliente}</p>
                    </div>

                    <h3 className="text-xl font-bold text-[#1A2B4C] mb-6">Detalhamento dos Serviços</h3>

                    <div className="overflow-x-auto border border-[#E2E8F0] rounded-lg mb-8">
                        <table className="w-full text-left bg-white border-collapse">
                            <thead className="bg-[#F4F7F6] text-[#1A2B4C]">
                                <tr>
                                    <th className="p-4 font-bold border-b border-[#E2E8F0] uppercase text-sm">Qtd</th>
                                    <th className="p-4 font-bold border-b border-[#E2E8F0] uppercase text-sm">Unid</th>
                                    <th className="p-4 font-bold border-b border-[#E2E8F0] uppercase text-sm">Descrição</th>
                                    <th className="p-4 font-bold border-b border-[#E2E8F0] uppercase text-sm">V. Unit</th>
                                    <th className="p-4 font-bold border-b border-[#E2E8F0] uppercase text-sm">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orcamento.itens && orcamento.itens.map((item: any, idx: number) => (
                                    <tr key={idx} className="border-b border-[#E2E8F0] last:border-0 hover:bg-gray-50 transition">
                                        <td className="p-4 text-[#1A2B4C] font-medium">{item.quantidade}</td>
                                        <td className="p-4 text-gray-600">{item.unidade}</td>
                                        <td className="p-4 text-[#1A2B4C]">{item.descricao}</td>
                                        <td className="p-4 text-gray-600">R$ {Number(item.preco_unitario).toFixed(2)}</td>
                                        <td className="p-4 text-[#1A2B4C] font-bold">R$ {(item.quantidade * item.preco_unitario).toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex flex-col items-end pt-6">
                        <div className="text-right bg-[#F4F7F6] p-6 rounded-xl border border-[#E2E8F0] min-w-[300px]">
                            <p className="text-[#1A2B4C] font-bold uppercase tracking-wide text-sm mb-2">Total do Orçamento</p>
                            <p className="text-5xl font-black text-[#2ECC71]">
                                R$ {Number(orcamento.total).toFixed(2)}
                            </p>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}
