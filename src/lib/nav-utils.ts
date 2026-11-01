export function isMarketingNavActive(pathname: string, href: string): boolean {
  if (href === "/menu") return pathname.startsWith("/menu");
  if (href === "/subscriptions") return pathname.startsWith("/subscriptions");
  if (href === "/contact") return pathname.startsWith("/contact");
  if (href.startsWith("/#")) return pathname === "/";
  return pathname === href;
}

export function scrollToHomeSection(hashHref: string) {
  const id = hashHref.replace(/^\/#/, "");
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  window.history.pushState(null, "", hashHref);
}
