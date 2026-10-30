"use client";

import { useEffect, useState } from "react";
import {
  getSmartDownloadFallbackHref,
  getSmartDownloadHref,
} from "@/lib/smartDownload";

export function useSmartDownloadHref() {
  const [href, setHref] = useState(getSmartDownloadFallbackHref);

  useEffect(() => {
    setHref(getSmartDownloadHref(navigator.userAgent));
  }, []);

  return href;
}
