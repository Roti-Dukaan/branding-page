import Image from "next/image";
import Link from "next/link";
import { DownloadQrCode } from "@/components/DownloadQrCode";
import { SmartDownloadLink } from "@/components/SmartDownloadLink";
import { navLinks, socialLinks } from "@/lib/site";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer id="contact" className="bg-soil text-cream">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 pt-6 pb-10 sm:px-8 md:grid-cols-[1.2fr_1fr_1fr_auto] md:items-start">
        <div className="flex flex-col items-center gap-4 text-center md:items-start md:text-left">
          <Image src="/images/logo.png" alt="Roti Dukaan" width={187} height={193} className="h-20 w-auto" />
          <p className="font-display text-xl font-medium">Fresh food. Happier days.</p>
        </div>

        <nav aria-label="Footer" className="text-center md:text-left">
          <h3 className="font-display text-lg font-semibold text-[#f6d79a]">Explore</h3>
          <ul className="mt-4 space-y-2">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-cream/80 transition hover:text-cream">
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <SmartDownloadLink className="text-cream/80 transition hover:text-cream">
                Download App
              </SmartDownloadLink>
            </li>
          </ul>
        </nav>

        <div className="text-center md:text-left">
          <h3 className="font-display text-lg font-semibold text-[#f6d79a]">Follow us</h3>
          <p className="mt-4 text-cream/80">Fresh menus, offers and kitchen stories.</p>
          <ul className="mt-6 flex justify-center gap-3 md:justify-start">
            {socialLinks.map((s) => (
              <li key={s.label}>
                <a
                  href={s.href}
                  aria-label={s.label}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block transition hover:-translate-y-0.5"
                >
                  <Image src={s.icon} alt="" width={80} height={85} className="h-10 w-auto" />
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex justify-center md:justify-end">
          <DownloadQrCode />
        </div>
      </div>

      <div className="border-t border-cream/10">
        <p className="mx-auto max-w-7xl px-5 py-5 text-center text-sm text-cream/60 sm:px-8">
          &copy; {year} Roti Dukaan. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
