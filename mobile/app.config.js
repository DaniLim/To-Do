import "dotenv/config";

export default ({ config }) => ({
  ...config,
  extra: {
    supabaseUrl: process.env.SPBASE_URL || process.env.SUPABASE_URL,
    supabaseAnonKey:
      process.env.SPBASE_ANON_KEY || process.env.SUPABASE_ANON_KEY,
  },
});
