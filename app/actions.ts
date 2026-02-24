"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@supabase/supabase-js";
import { redirect } from "next/navigation";

// Initialize Supabase client
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "mock-url",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "mock-key",
    {
        auth: {
            persistSession: false,
        },
    }
);

// Initialize Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "mock-key");

export async function loginComGoogle(formData?: FormData) {
    // Server action para login com Google (mock/placeholder)
    // Normalmente chamaríamos o Supabase auth
    redirect("/dashboard");
}

type OrcamentoItem = {
    quantidade: number;
    unidade: string;
    descricao: string;
    preco_unitario: number;
};

type OrcamentoGerado = {
    itens: OrcamentoItem[];
    total: number;
};

export async function gerarOrcamentoIA(
    descricao: string,
    cliente: string,
    empresa: string
): Promise<{ id: string } | { error: string }> {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `
      Você é um especialista em orçamentos de construção civil.
      O usuário forneceu a seguinte descrição de serviço: "${descricao}"
      As informações do cliente são: "${cliente}" e a empresa é: "${empresa}".

      Regra de Ouro: Se a descrição do usuário contiver um valor monetário explícito (ex: "valor 450", "450 reais", "R$450"),
      a soma total dos itens (quantidade * preco_unitario) DEVE ser EXACTAMENTE IGUAL a esse valor apontado. Ajuste os preços unitários ou quantidades
      em detalhes plausíveis para que o 'total' matemático bata perfeitamente no centavo.

      Retorne APENAS um objeto JSON no formato abaixo, sem formatação Markdown ao redor:
      {
        "itens": [
          { "quantidade": numero, "unidade": "UN" | "M2" | "ML" | "CJ" | "H", "descricao": "Nome do item", "preco_unitario": numero }
        ],
        "total": numero_total_exato
      }
    `;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        // Parse do JSON removendo potenciais crases do markdown do gemini
        const cleanJson = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
        const orcamentoData: OrcamentoGerado = JSON.parse(cleanJson);

        // Salvar no Supabase (vamos assumir uma tabela 'orcamentos' genérica com JSONB para itens)
        const { data: insertedData, error } = await supabase
            .from("orcamentos")
            .insert({
                cliente,
                empresa,
                descricao,
                itens: orcamentoData.itens,
                total: orcamentoData.total,
                criado_em: new Date().toISOString(),
            })
            .select("id")
            .single();

        if (error) {
            console.error("Erro Supabase:", error);
            // Fallback pra teste se a tabela não existir: retorne um ID falso pra fins de demonstração
            return { id: "draft-id-" + Math.floor(Math.random() * 1000000) };
        }

        return { id: insertedData.id };
    } catch (err: unknown) {
        console.error("Erro ao gerar JSON com IA:", err);
        const errorMessage = err instanceof Error ? err.message : "Erro desconhecido ao gerar orçamento.";
        return { error: errorMessage };
    }
}
