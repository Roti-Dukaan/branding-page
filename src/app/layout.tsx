import type { Metadata, Viewport } from "next";
import "@fontsource-variable/fredoka";
import "@fontsource-variable/nunito";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://rotidukaan.com"),
  title: "Roti Dukaan | Fresh Over Fast",
  description:
    "Home-style rotis and wholesome meals, freshly prepared every day and delivered to your doorstep.",
  icons: {
    icon: [{ url: "/icon", type: "image/png" }],
    apple: [{ url: "/apple-icon", type: "image/png" }],
  },
  openGraph: {
    title: "Roti Dukaan | Fresh Over Fast",
    description:
      "Home-style rotis and wholesome meals delivered to your doorstep.",
    images: ["/images/logo.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#1f5a2e",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
