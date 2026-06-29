import JudgmentOS from "@/components/JudgmentOS";

// The app is protected by the outer Vercel password gate in middleware.
// Do not require Supabase sign-in just to view the product surface.
export default function Page() {
  return <JudgmentOS />;
}
