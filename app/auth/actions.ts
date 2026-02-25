"use server";

import { createClient } from "@supabase/supabase-js";
import { redirect } from "next/navigation";

// Inicializando Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function loginComGoogle() {
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`,
        },
    });

    if (error) {
        console.error("Erro ao fazer login com Google:", error.message);
        throw new Error("Erro ao autenticar com o Google.");
    }

    if (data.url) {
        redirect(data.url);
    }
}
