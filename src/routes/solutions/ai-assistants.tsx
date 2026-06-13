import { createFileRoute } from "@tanstack/react-router";
import { SolutionPage } from "@/components/solution-page";
import { canonicalUrl, solutions } from "@/content/solutions";

const solution = solutions["ai-assistants"];

export const Route = createFileRoute("/solutions/ai-assistants")({
  head: () => ({
    meta: [
      { title: solution.metaTitle },
      { name: "description", content: solution.metaDescription },
      { property: "og:title", content: solution.metaTitle },
      { property: "og:description", content: solution.metaDescription },
      { property: "og:type", content: "website" },
      { property: "og:url", content: canonicalUrl(solution.slug) },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: solution.metaTitle },
      { name: "twitter:description", content: solution.metaDescription },
    ],
    links: [{ rel: "canonical", href: canonicalUrl(solution.slug) }],
  }),
  component: () => <SolutionPage solution={solution} />,
});
