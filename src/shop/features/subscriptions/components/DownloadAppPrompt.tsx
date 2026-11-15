import { ManageInAppCard, type ManageInAppCardProps } from "@/components/ManageInAppCard";

export type DownloadAppPromptProps = ManageInAppCardProps;

export function DownloadAppPrompt(props: DownloadAppPromptProps) {
  return <ManageInAppCard {...props} />;
}
