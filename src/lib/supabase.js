import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://iqyfjljxrmrkhqtedltg.supabase.co';
const supabaseAnonKey = 'sb_publishable_zncuqAc2EcGlftxBOaeWHQ_mI2ousbH';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
