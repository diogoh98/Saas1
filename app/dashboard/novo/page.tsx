"use client";

import { useState } from "react";
import { gerarOrcamentoIA } from "@/app/actions";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function NovoOrcamentoPage() {
    const [nomeEmpresa, setNomeEmpresa] = useState("");
    const [nomeCliente, setNomeCliente] = useState("");
    const [descricao, setDescricao] = useState("");

    const [loading, setLoading] = useState(false);
    const [resultado, setResultado] = useState<any>(null);
    const [orcamentoId, setOrcamentoId] = useState<string>("");

    // Handler de Áudio - Web Speech API
    const handleDictation = (setter: (text: string) => void) => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert("Seu navegador não suporta dictation (tente usar Google Chrome).");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = 'pt-BR';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onresult = (event: any) => {
            const text = event.results[0][0].transcript;
            setter(text);
        };

        recognition.onerror = (event: any) => {
            console.error("Erro no reconhecimento de voz:", event.error);
        };

        recognition.start();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await gerarOrcamentoIA(descricao, nomeCliente, nomeEmpresa);
            setResultado(res.orcamento);
            setOrcamentoId(res.id);
        } catch (error) {
            console.error("Erro:", error);
            alert("Houve um erro ao gerar o orçamento.");
        } finally {
            setLoading(false);
        }
    };

    const gerarPDF = () => {
        if (!resultado) return;

        const doc = new jsPDF();

        // Cabeçalho (Header)
        doc.setFillColor(26, 43, 76); // #1A2B4C
        doc.rect(0, 0, 210, 35, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(22);
        doc.text(nomeEmpresa || "Orçamento", 14, 23);

        // Dados do Cliente
        doc.setTextColor(26, 43, 76); // #1A2B4C
        doc.setFontSize(12);
        doc.text(`Cliente: ${nomeCliente}`, 14, 50);

        // Tabela com as 5 Colunas Exatas
        const bodyData = resultado.itens.map((item: any) => [
            item.quantidade.toString(),
            item.unidade,
            item.descricao,
            `R$ ${Number(item.preco_unitario).toFixed(2)}`,
            `R$ ${(item.quantidade * item.preco_unitario).toFixed(2)}`
        ]);

        autoTable(doc, {
            startY: 60,
            head: [['QTD', 'UNID', 'DESCRIÇÃO', 'V. UNIT', 'TOTAL']],
            body: bodyData,
            theme: 'grid',
            headStyles: {
                fillColor: [26, 43, 76],
                textColor: [255, 255, 255],
                fontStyle: 'bold'
            },
            alternateRowStyles: { fillColor: [244, 247, 246] },
            styles: { fontSize: 10, textColor: [0, 0, 0] }
        });

        // Rodapé com o Total
        const finalY = (doc as any).lastAutoTable.finalY + 15;
        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(46, 204, 113); // #2ECC71 (Verde Esmeralda)
        doc.text(`TOTAL GERAL: R$ ${Number(resultado.total).toFixed(2)}`, 130, finalY);

        doc.save(`Proposta_${nomeCliente.trim().replace(/\s+/g, "_")}.pdf`);
    };

    const copiarLink = () => {
        if (!orcamentoId) return;
        const link = `${window.location.origin}/proposta/${orcamentoId}`;
        navigator.clipboard.writeText(link);
        alert("Link copiado para a área de transferência!");
    };

    return (
        <div className="min-h-screen bg-[#F4F7F6] py-12 px-4 text-[#1A2B4C]">
            <div className="max-w-3xl mx-auto space-y-8">

                <div className="bg-[#FFFFFF] p-8 rounded-2xl shadow-md border border-[#E2E8F0]">
                    <h1 className="text-3xl font-bold mb-6 text-[#1A2B4C]">Novo Orçamento</h1>

                    <form onSubmit={handleSubmit} className="space-y-6">

                        {/* Nome da Empresa */}
                        <div className="flex flex-col">
                            <label className="text-sm font-semibold mb-2">Nome da Empresa</label>
                            <input
                                type="text"
                                required
                                className="p-3 border rounded-lg focus:ring-2 focus:ring-[#1A2B4C] transition"
                                placeholder="Ex: ACME Serviços"
                                value={nomeEmpresa}
                                onChange={(e) => setNomeEmpresa(e.target.value)}
                            />
                        </div>

                        {/* Nome do Cliente com Mic */}
                        <div className="flex flex-col">
                            <div className="flex justify-between items-end mb-2">
                                <label className="text-sm font-semibold">Nome do Cliente</label>
                                <button
                                    type="button"
                                    onClick={() => handleDictation(setNomeCliente)}
                                    className="bg-[#F4F7F6] text-[#1A2B4C] hover:bg-[#E2E8F0] p-2 rounded-full transition shadow-sm border border-[#E2E8F0]"
                                    title="Falar Nome do Cliente"
                                >
                                    🎙️
                                </button>
                            </div>
                            <input
                                type="text"
                                required
                                className="p-3 border rounded-lg focus:ring-2 focus:ring-[#1A2B4C] transition"
                                placeholder="Ex: João da Silva"
                                value={nomeCliente}
                                onChange={(e) => setNomeCliente(e.target.value)}
                            />
                        </div>

                        {/* Descrição com Mic */}
                        <div className="flex flex-col">
                            <div className="flex justify-between items-end mb-2">
                                <label className="text-sm font-semibold">Descrição do Serviço</label>
                                <button
                                    type="button"
                                    onClick={() => handleDictation(setDescricao)}
                                    className="bg-[#F4F7F6] text-[#1A2B4C] hover:bg-[#E2E8F0] p-2 rounded-full transition shadow-sm border border-[#E2E8F0]"
                                    title="Falar Descrição"
                                >
                                    🎙️
                                </button>
                            </div>
                            <textarea
                                required
                                rows={4}
                                className="p-3 border rounded-lg focus:ring-2 focus:ring-[#1A2B4C] transition resize-none"
                                placeholder="Descreva o que será feito (Pode ditar os valores e serviços...)"
                                value={descricao}
                                onChange={(e) => setDescricao(e.target.value)}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#1A2B4C] hover:bg-[#121E36] text-white font-bold text-lg py-4 rounded-xl transition shadow-md disabled:bg-opacity-70"
                        >
                            {loading ? "Gerando IA..." : "Gerar Orçamento Mágico"}
                        </button>
                    </form>
                </div>

                {/* SECTION RESULTADO */}
                {resultado && (
                    <div className="bg-[#FFFFFF] p-8 rounded-2xl shadow-xl border-2 border-[#2ECC71]">
                        <h2 className="text-2xl font-extrabold mb-6">Orçamento Gerado com Sucesso!</h2>

                        <div className="overflow-x-auto mb-8 rounded-lg border border-[#E2E8F0]">
                            <table className="w-full text-left bg-white border-collapse">
                                <thead className="bg-[#1A2B4C] text-white">
                                    <tr>
                                        <th className="p-3 font-semibold">QTD</th>
                                        <th className="p-3 font-semibold">UNID</th>
                                        <th className="p-3 font-semibold">DESCRIÇÃO</th>
                                        <th className="p-3 font-semibold">V. UNIT</th>
                                        <th className="p-3 font-semibold">TOTAL</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {resultado.itens.map((item: any, idx: number) => (
                                        <tr key={idx} className="border-b border-[#E2E8F0] hover:bg-[#F4F7F6]">
                                            <td className="p-3">{item.quantidade}</td>
                                            <td className="p-3">{item.unidade}</td>
                                            <td className="p-3">{item.descricao}</td>
                                            <td className="p-3">R$ {Number(item.preco_unitario).toFixed(2)}</td>
                                            <td className="p-3 font-medium">R$ {(item.quantidade * item.preco_unitario).toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="flex flex-col md:flex-row justify-between items-center mb-8 bg-[#F4F7F6] p-6 rounded-xl border border-[#E2E8F0]">
                            <span className="text-xl font-semibold uppercase tracking-wide">Valor Total Geral</span>
                            <span className="text-4xl font-black text-[#2ECC71] mt-2 md:mt-0">
                                R$ {Number(resultado.total).toFixed(2)}
                            </span>
                        </div>

                        <div className="flex flex-col md:flex-row gap-4">
                            <button
                                onClick={copiarLink}
                                className="flex-1 bg-white border-2 border-[#1A2B4C] text-[#1A2B4C] hover:bg-[#F4F7F6] font-bold py-3 rounded-xl transition"
                            >
                                Copiar Link da Proposta
                            </button>
                            <button
                                onClick={gerarPDF}
                                className="flex-1 bg-[#2ECC71] hover:bg-green-600 text-white font-bold py-3 rounded-xl transition shadow-md"
                            >
                                Gerar PDF (jsPDF)
                            </button>
                        </div>

                    </div>
                )}

            </div>
        </div>
    );
}
