/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** PostHog project API key (publishable client key). Unset → analytics disabled. */
  readonly VITE_POSTHOG_KEY?: string;
  /** PostHog ingestion host. Defaults to EU cloud. */
  readonly VITE_POSTHOG_HOST?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
