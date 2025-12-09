-- Create table for IA fund releases
CREATE TABLE IF NOT EXISTS public.ia_fund_releases (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id bigint NOT NULL,
    ia_id uuid NOT NULL,
    amount numeric NOT NULL,
    installment_number integer NOT NULL,
    sanction_order_no text NOT NULL,
    remarks text,
    released_at timestamp with time zone DEFAULT now(),
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT ia_fund_releases_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.district_proposals(id) ON DELETE CASCADE,
    CONSTRAINT ia_fund_releases_ia_id_fkey FOREIGN KEY (ia_id) REFERENCES public.implementing_agencies(id) ON DELETE CASCADE
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_ia_fund_releases_project_id ON public.ia_fund_releases(project_id);
CREATE INDEX IF NOT EXISTS idx_ia_fund_releases_ia_id ON public.ia_fund_releases(ia_id);
