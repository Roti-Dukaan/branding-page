"use client";

import { Smartphone } from "lucide-react";
import { buttonVariants } from "@shop/components/ui/button";
import { Card, CardContent } from "@shop/components/ui/card";
import { SITE_CONFIG } from "@shop/lib/constants";
import { cn } from "@shop/lib/utils";

type DownloadAppPromptProps = {
  title?: string;
  description?: string;
  className?: string;
  compact?: boolean;
};

export function DownloadAppPrompt({
  title = "Manage your subscription in the app",
  description = "Pause, skip meals, change plans, update menus, and more are available only in the Roti Dukaan mobile app.",
  className,
  compact = false,
}: DownloadAppPromptProps) {
  return (
    <Card className={cn("border-primary/20 bg-primary/5", className)}>
      <CardContent
        className={cn(
          "flex flex-col items-center text-center",
          compact ? "gap-3 py-6 px-4" : "gap-4 py-10 px-6",
        )}
      >
        <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Smartphone className="size-6" />
        </div>
        <div className="space-y-1.5">
          <h3 className="font-heading text-lg font-bold text-foreground sm:text-xl">{title}</h3>
          <p className="mx-auto max-w-md text-sm text-muted-foreground">{description}</p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2">
          <a
            href={SITE_CONFIG.apps.playStore}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(buttonVariants())}
          >
            Get it on Google Play
          </a>
          <a
            href={SITE_CONFIG.apps.appStore}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(buttonVariants({ variant: "outline" }))}
          >
            Download on the App Store
          </a>
        </div>
        <p className="text-xs text-muted-foreground">
          You can still take a new subscription on the website — management stays in the app.
        </p>
      </CardContent>
    </Card>
  );
}
