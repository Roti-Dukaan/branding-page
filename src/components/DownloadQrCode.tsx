import Image from "next/image";

export function DownloadQrCode() {
  return (
    <div className="flex flex-col items-center gap-2 md:items-start">
      <div className="rounded-2xl bg-cream p-2 shadow-[0_8px_24px_-12px_rgba(0,0,0,0.45)]">
        <Image
          src="/images/qr/download-app-qr.png"
          alt="QR code to download the Roti Dukaan app"
          width={512}
          height={512}
          className="h-[7.5rem] w-[7.5rem]"
        />
      </div>
      <p className="max-w-[9.5rem] text-center text-xs leading-snug text-cream/75 md:text-left">
        Scan to download — opens the right app store on your phone
      </p>
    </div>
  );
}
