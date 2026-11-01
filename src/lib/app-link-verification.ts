/** Android App Links + iOS Universal Links (Meta deferred deep links). */

export const ANDROID_APP_PACKAGE = "com.rotidukaan.user";

/** Upload keystore SHA-256 (colon-free, lowercase). Play installs also need App signing cert — set env on deploy. */
export const ANDROID_SHA256_FINGERPRINTS: string[] = [
  "a6fedc77f3e1d29c912b07eb06c378e6bf58ac9b19481fc197d53fbfc3b04484",
];

export const IOS_TEAM_ID = "K3T6L9Q3C8";
export const IOS_BUNDLE_ID = "com.rotidukaan.user";

export const UNIVERSAL_LINK_PATHS = [
  "/menu",
  "/menu/*",
  "/subscriptions",
  "/subscriptions/*",
  "/invite",
  "/invite/*",
] as const;

export function mergeAndroidFingerprints(): string[] {
  const fromEnv =
    process.env.ANDROID_APP_LINK_SHA256?.split(/[,;\s]+/)
      .map((s) => s.trim().replace(/:/g, "").toLowerCase())
      .filter((s) => /^[a-f0-9]{64}$/.test(s)) ?? [];

  return [...new Set([...ANDROID_SHA256_FINGERPRINTS, ...fromEnv])];
}

export function assetLinksJson() {
  return [
    {
      relation: ["delegate_permission/common.handle_all_urls"],
      target: {
        namespace: "android_app",
        package_name: ANDROID_APP_PACKAGE,
        sha256_cert_fingerprints: mergeAndroidFingerprints(),
      },
    },
  ];
}

export function appleAppSiteAssociation() {
  return {
    applinks: {
      apps: [],
      details: [
        {
          appID: `${IOS_TEAM_ID}.${IOS_BUNDLE_ID}`,
          paths: [...UNIVERSAL_LINK_PATHS],
        },
      ],
    },
  };
}
