import Link from "next/link";
import { ArrowRight, Brain, KeyRound, MessageSquare, Sparkles, Workflow } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const heroHighlights = [
  {
    title: "Interactive MBTI coaching",
    description:
      "Explore tailored prompts, reflection questions, and growth ideas that match your personality type.",
    icon: MessageSquare,
  },
  {
    title: "Bring your own OpenAI key",
    description:
      "Stay in control of your usage and provider. Configure a key in seconds via Settings or `.env.local`.",
    icon: KeyRound,
  },
  {
    title: "Guided onboarding",
    description:
      "Select a type, review curated insights, then start chatting with an AI coach built for MBTI contexts.",
    icon: Brain,
  },
];

const steps = [
  {
    title: "Clone & install",
    body: "Grab the repo, install dependencies with pnpm, and follow the README to create `.env.local`.",
  },
  {
    title: "Add your OpenAI key",
    body: "Drop `OPENAI_API_KEY` into `.env.local` or paste it into Settings once the app is running.",
  },
  {
    title: "Choose a personality",
    body: "Use the selector to review traits, strengths, and growth areas before starting the chat.",
  },
  {
    title: "Start the conversation",
    body: "Chat through goals, reflection prompts, or planning exercises that align with your MBTI type.",
  },
];

export const metadata = {
  title: "Equivocal MBTI Companion",
  description:
    "Understand your MBTI type with an AI guide. Bring your own OpenAI key, explore curated insights, and plan growth steps in an immersive interface.",
};

export default function MarketingLandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background" />
      <main className="relative z-10">
        <section className="px-6 pt-24 pb-20 md:pt-28">
          <div className="mx-auto max-w-5xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-border/40 bg-background/60 px-4 py-1 text-xs font-medium text-muted-foreground backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              AI-enhanced MBTI reflections
            </span>
            <h1 className="mt-6 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl md:text-6xl">
              Map your personality journey with an AI co-pilot
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-base text-muted-foreground sm:text-lg">
              Equivocal combines an MBTI knowledge base, interactive visuals, and your own OpenAI key to deliver
              personal insights you can trust. Select your type, review guided takeaways, and chat through growth
              experiments tailored to how you think and work.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/chat" className={cn(buttonVariants({ size: "lg" }))}>
                Launch the chat experience
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
              </Link>
              <Link
                href="#setup"
                className="inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground"
              >
                View setup steps
                <Workflow className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
            <div className="mt-16 grid gap-6 lg:grid-cols-3">
              {heroHighlights.map((card) => (
                <div
                  key={card.title}
                  className="rounded-2xl border border-border/60 bg-background/60 p-6 text-left shadow-sm backdrop-blur-md"
                >
                  <card.icon className="h-8 w-8 text-primary" aria-hidden="true" />
                  <h3 className="mt-4 text-lg font-semibold text-foreground">{card.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{card.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="setup" className="border-t border-border/50 bg-muted/20 py-20">
          <div className="mx-auto flex max-w-5xl flex-col gap-10 px-6 md:flex-row md:items-start md:gap-12">
            <div className="md:max-w-sm">
              <h2 className="text-3xl font-semibold text-foreground">Getting started takes a few minutes</h2>
              <p className="mt-4 text-sm text-muted-foreground">
                Bring your own OpenAI-compatible key, install dependencies, and you are ready to explore each MBTI
                type with a personalised assistant.
              </p>
              <Link
                href="https://github.com/proteincontent/Equivocal#setup"
                className="mt-6 inline-flex items-center text-sm font-medium text-primary hover:underline"
                target="_blank"
                rel="noreferrer"
              >
                Open setup guide
                <ArrowRight className="ml-1.5 h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
            <ol className="grid flex-1 gap-6 sm:grid-cols-2">
              {steps.map((step, index) => (
                <li
                  key={step.title}
                  className="group rounded-2xl border border-border/50 bg-background/70 p-6 backdrop-blur-md transition hover:border-primary/60"
                >
                  <div className="flex items-center gap-3 text-sm font-semibold text-foreground">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                      {index + 1}
                    </span>
                    {step.title}
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">{step.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="py-20">
          <div className="mx-auto max-w-5xl px-6 text-center">
            <h2 className="text-3xl font-semibold text-foreground">What&apos;s inside the chat?</h2>
            <p className="mt-4 text-sm text-muted-foreground">
              Each conversation blends MBTI-aligned prompts, growth recommendations, and animated UI cues so you can
              stay focused on reflection rather than configuration.
            </p>
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {[
                {
                  title: "Guided prompts",
                  body: "Kick off with structured questions that encourage clarity, goal setting, and mindful review.",
                },
                {
                  title: "Contextual memory",
                  body: "The assistant tracks your MBTI selection to keep responses relevant to your temperament.",
                },
                {
                  title: "Fast toggles",
                  body: "Switch themes, adjust providers, or restart the flow in a couple of clicks when you need a reset.",
                },
              ].map((item) => (
                <div key={item.title} className="rounded-2xl border border-border/60 bg-background/60 p-6 text-left">
                  <h3 className="text-lg font-semibold text-foreground">{item.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-border/50 bg-muted/30 py-16">
          <div className="mx-auto flex max-w-4xl flex-col items-center gap-4 px-6 text-center">
            <h2 className="text-2xl font-semibold text-foreground">Ready to meet your MBTI co-pilot?</h2>
            <p className="text-sm text-muted-foreground">
              Head to the chat experience, select a personality type, and invite the assistant to brainstorm growth
              experiments with you.
            </p>
            <Link href="/chat" className={cn(buttonVariants({ size: "lg" }))}>
              Go to chat workspace
              <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
