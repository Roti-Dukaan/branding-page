import type { Metadata } from "next";
import { ShareLanding } from "@/components/ShareLanding";
import { appInviteDeepLink } from "@/lib/share-links";

function inviteAppPath(code: string) {
  return `/invite/${encodeURIComponent(code.trim())}`;
}

type Props = { params: Promise<{ code: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { code } = await params;
  return {
    title: "Join Roti Dukaan | Refer & Earn",
    description: `Sign up with referral code ${code.toUpperCase()} and earn wallet credits on your first order.`,
  };
}

export default async function InviteSharePage({ params }: Props) {
  const { code } = await params;
  const displayCode = code.trim().toUpperCase();

  return (
    <ShareLanding
      title="You’re invited to Roti Dukaan"
      subtitle={`Use referral code ${displayCode} when you sign up. Complete your first eligible order to unlock wallet credits for you and your friend.`}
      appPath={inviteAppPath(displayCode)}
      webContinueHref={appInviteDeepLink(displayCode)}
    />
  );
}
