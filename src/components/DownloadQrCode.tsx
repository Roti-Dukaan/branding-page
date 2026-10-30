"use client";

import { useEffect, useState } from "react";
import QRCode from "react-qr-code";
import { getSmartDownloadAbsoluteUrl, storeDownloadPath } from "@/lib/stores";

export function DownloadQrCode({ size = 120 }: { size?: number }) {
  const [downloadUrl, setDownloadUrl] = useState(() => getSmartDownloadAbsoluteUrl());

  useEffect(() => {
    setDownloadUrl(`${window.location.origin}${storeDownloadPath}`);
  }, []);

  return (
    <div className="flex flex-col items-center gap-2 md:items-start">
      <div className="rounded-2xl bg-cream p-2.5 shadow-[0_8px_24px_-12px_rgba(0,0,0,0.45)]">
        <QRCode
          value={downloadUrl}
          size={size}
          bgColor="#fbf4e6"
          fgColor="#163f20"
          level="M"
          aria-label="QR code to download the Roti Dukaan app"
        />
      </div>
      <p className="max-w-[9.5rem] text-center text-xs leading-snug text-cream/75 md:text-left">
        Scan to download — opens the right app store on your phone
      </p>
    </div>
  );
}
