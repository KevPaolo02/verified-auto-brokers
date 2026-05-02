import ClaimForm from "@/components/claim-form";

export const metadata = {
  title: "Claim Your Listing — Verified Auto Brokers",
};

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
