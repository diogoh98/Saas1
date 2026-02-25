"use server";

import { createClient } from "@supabase/supabase-js";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Inicializa o cliente Supabase usando variáveis de ambiente
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY! || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// Inicializa o GenAI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function gerarOrcamentoIA(descricao: string, nomeCliente: string, nomeEmpresa: string) {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

        const prompt = `
      Você é um assistente especialista em gerar orçamentos comerciais altamente estruturados.
      Analise a seguinte descrição de um serviço e extraia os itens técnicos e materiais necessários.
      
      Descrição do serviço fornecida pelo usuário: 
      "${descricao}"
      
      **REGRA DE OURO MÁXIMA E MAIS IMPORTANTE**: 
      Se a descrição fornecida contiver um valor monetário explícito (exemplos: "valor de 450 reais", "fechei por 1200", "orçamento vai dar R$ 5000"), 
      a SOMA TOTAL (total = somatória de quantidade * preco_unitario de cada item) DEVE BATER EXATAMENTE ESTE VALOR MONETÁRIO.
      Ajuste o preco_unitario ou o número de itens livremente e matematicamente para atingir este total geral preciso!

      Retorne APENAS um objeto JSON válido, sem utilizar blocos de código markdown (\`\`\`json...\`\`\`) e sem nenhum texto de apoio, formatado ESTRITAMENTE da seguinte forma:
      {
        "itens": [
          {
            "quantidade": 1,
            "unidade": "string (ex: un, hr, m2, km, sv)",
            "descricao": "string descritiva do material ou mão de obra",
            "preco_unitario": 0.00
          }
        ],
        "total": 0.00
      }
    `;

        const result = await model.generateContent(prompt);
        let textResponse = result.response.text();

        // Fallback para limpar o markdown se a IA colocar indevidamente
        textResponse = textResponse.replace(/```json/gi, '').replace(/```/g, '').trim();

        const data = JSON.parse(textResponse);

        const uuid = crypto.randomUUID();

        // Insere o registro na tabela "orcamentos" do Supabase
        const { data: dbData, error } = await supabase
            .from('orcamentos')
            .insert([
                {
                    id: uuid,
                    nome_empresa: nomeEmpresa,
                    nome_cliente: nomeCliente,
                    descricao: descricao,
                    itens: data.itens,
                    total: data.total
                }
            ])
            .select('id')
            .single();

        if (error) {
            console.error("Erro no Supabase:", error);
            throw new Error("Erro ao salvar o orçamento no banco de dados.");
        }

        // Retorna os dados para a UI e o ID gerado para link do PDF
        return {
            id: dbData.id,
            orcamento: data
        };

    } catch (error) {
        console.error("Falha ao processar orçamento IA:", error);
        throw new Error("Falha ao gerar o orçamento com a IA. Tente novamente.");
    }
}
