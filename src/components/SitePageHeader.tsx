import Image from "next/image";
import Link from "next/link";
import { SmartDownloadPillButton } from "./SmartDownloadPillButton";

export function SitePageHeader() {
  return (
    <header className="border-b border-sand/80 bg-cream/95 backdrop-blur">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-4 px-5 sm:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-2" aria-label="Roti Dukaan home">
          <Image
            src="/images/logo.png"
            alt="Roti Dukaan"
            width={187}
            height={193}
            className="h-14 w-auto drop-shadow-sm"
          />
        </Link>
        <SmartDownloadPillButton className="px-4! py-2! text-sm!">
          Download App
        </SmartDownloadPillButton>
      </div>
    </header>
  );
}
