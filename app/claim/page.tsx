import ClaimForm from "@/components/claim-form";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Claim Your Listing — Verified Auto Brokers",
  description:
    "Claim your FMCSA-licensed broker listing on Verified Auto Brokers. Add your bio, specialties, and direct contact info. Claims are reviewed manually within 1–2 business days.",
  path: "/claim",
});

export default function ClaimPage({
  searchParams,
}: {
  searchParams: { mc?: string };
}) {
  return (
    <div style={{ background: "var(--paper)", minHeight: "100vh" }}>
      <ClaimForm initialMc={searchParams?.mc ?? null} />
    </div>
  );
}
