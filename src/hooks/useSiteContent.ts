import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type Socials = { instagram: string; email: string; phone: string };
export type Policies = { delivery: string; returns: string; privacy: string };
export type Hero = { title: string; subtitle: string };
export type Branding = { logo_url: string };

export const useSiteContent = <T,>(key: string, defaults: T): { content: T; loading: boolean; refresh: () => void } => {
  const [content, setContent] = useState<T>(defaults);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const { data } = await supabase
      .from("site_content")
      .select("content")
      .eq("section_key", key)
      .maybeSingle();
    if (data?.content) setContent({ ...defaults, ...(data.content as object) } as T);
    setLoading(false);
  };

  useEffect(() => {
    load();
    const channel = supabase
      .channel(`site_content_${key}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "site_content", filter: `section_key=eq.${key}` },
        () => load()
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return { content, loading, refresh: load };
};
