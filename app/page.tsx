/**
 * Home Page (SSR shell)
 *
 * Client hydration entry lives in `app/page.island.tsx`.
 * - `mandu dev` serves SSR.
 * - `mandu build` generates /.mandu/client bundles for hydration.
 */

export default function HomePage() {
  // Keep SSR lightweight; UI mounts via island hydration.
  return null;
}
