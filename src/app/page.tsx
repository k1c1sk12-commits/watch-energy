import Home from "@/components/Home";

// The collector hub. All content is real, visible, server-renderable text
// (client components still SSR their initial English state), so the old
// hidden sr-only SEO block is gone — hidden keyword text risks Google's
// spam policies and the hub now says everything in the open.
export default function HomePage() {
  return <Home />;
}
