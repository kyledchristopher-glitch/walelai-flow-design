import type { LucideIcon } from "lucide-react";
import { FileText, MessageSquareText, Workflow } from "lucide-react";

export type SolutionSlug = "workflow-automation" | "ai-assistants" | "document-intelligence";

export type SolutionPageContent = {
  slug: SolutionSlug;
  title: string;
  metaTitle: string;
  metaDescription: string;
  icon: LucideIcon;
  intro: string[];
  sections: Array<{
    title: string;
    body?: string;
    bullets?: string[];
    cards?: Array<{ title: string; body: string }>;
  }>;
};

export const solutions: Record<SolutionSlug, SolutionPageContent> = {
  "workflow-automation": {
    slug: "workflow-automation",
    title: "Workflow Automation for Modern Organizations",
    metaTitle: "Workflow Automation Services | WalelAI",
    metaDescription:
      "Reduce manual work, eliminate bottlenecks, and improve operational efficiency with workflow automation solutions from WalelAI.",
    icon: Workflow,
    intro: [
      "Every organization has repetitive processes that consume time, create bottlenecks, and reduce productivity.",
      "Employees manually move information between systems, update records, route requests, manage approvals, and complete administrative tasks that add little strategic value. These processes often become hidden costs that grow as organizations scale.",
      "WalelAI helps organizations automate these workflows using practical AI and automation technologies that reduce manual effort, improve consistency, and accelerate execution.",
    ],
    sections: [
      {
        title: "Common Workflow Challenges",
        bullets: [
          "Repetitive data entry",
          "Manual lead assignment",
          "Slow approval cycles",
          "Disconnected systems",
          "Customer onboarding delays",
          "Administrative bottlenecks",
        ],
      },
      {
        title: "How WalelAI Helps",
        body: "We identify workflow bottlenecks and design automation systems that integrate with your existing operations.",
        bullets: [
          "Process discovery",
          "Workflow mapping",
          "Automation design",
          "System integration",
          "Performance monitoring",
        ],
      },
      {
        title: "Typical Use Cases",
        cards: [
          {
            title: "Customer Onboarding",
            body: "Automate intake, routing, documentation, and account setup processes.",
          },
          {
            title: "Lead Management",
            body: "Capture, qualify, and route leads automatically.",
          },
          {
            title: "Internal Requests",
            body: "Streamline approvals, support requests, and operational workflows.",
          },
          {
            title: "CRM Updates",
            body: "Reduce manual updates and improve data consistency.",
          },
        ],
      },
      {
        title: "Expected Benefits",
        bullets: [
          "Reduced manual workload",
          "Faster execution",
          "Improved consistency",
          "Better visibility",
          "Higher employee productivity",
        ],
      },
    ],
  },
  "ai-assistants": {
    slug: "ai-assistants",
    title: "AI Assistants Built Around Your Business",
    metaTitle: "AI Assistants for Business | WalelAI",
    metaDescription:
      "Deploy AI assistants that support customers, employees, and operations teams with practical business-focused automation.",
    icon: MessageSquareText,
    intro: [
      "AI assistants are transforming how organizations access information, support customers, and improve operational efficiency.",
      "The most effective assistants are not generic chatbots. They are designed around your workflows, documentation, processes, and business objectives.",
      "WalelAI helps organizations deploy intelligent assistants that provide meaningful value to customers and employees alike.",
    ],
    sections: [
      {
        title: "What Is an AI Assistant?",
        body: "An AI assistant is a specialized system that can:",
        bullets: [
          "Answer questions",
          "Retrieve information",
          "Guide users through workflows",
          "Assist with decision-making",
          "Improve response times",
        ],
      },
      {
        title: "Customer-Facing Assistants",
        body: "Support customers 24/7 with:",
        bullets: [
          "Product questions",
          "Service inquiries",
          "Appointment scheduling",
          "Support triage",
          "Knowledge retrieval",
        ],
      },
      {
        title: "Internal Assistants",
        body: "Help employees quickly access:",
        bullets: [
          "Policies",
          "Procedures",
          "Documentation",
          "Training materials",
          "Operational knowledge",
        ],
      },
      {
        title: "Benefits",
        bullets: [
          "Faster responses",
          "Reduced support burden",
          "Better information access",
          "Increased consistency",
          "Improved user experience",
        ],
      },
      {
        title: "Our Approach",
        body: "WalelAI designs assistants that integrate with your business instead of operating separately from it. The result is a system that enhances operations while remaining practical and manageable.",
      },
    ],
  },
  "document-intelligence": {
    slug: "document-intelligence",
    title: "Turn Documents Into Actionable Business Intelligence",
    metaTitle: "Document Intelligence Solutions | WalelAI",
    metaDescription:
      "Extract, organize, and operationalize business information with AI-powered document intelligence solutions.",
    icon: FileText,
    intro: [
      "Organizations generate enormous amounts of information every day.",
      "Invoices, contracts, reports, policies, forms, and customer records contain valuable information, yet much of it remains trapped inside static documents.",
      "WalelAI helps organizations unlock that information and transform it into usable business processes.",
    ],
    sections: [
      {
        title: "The Challenge",
        body: "Many teams still rely on manual document review. This creates:",
        bullets: [
          "Delays",
          "Human error",
          "Administrative burden",
          "Compliance risks",
          "Limited visibility",
        ],
      },
      {
        title: "How Document Intelligence Works",
        body: "AI-powered document intelligence can:",
        bullets: [
          "Extract key information",
          "Classify documents",
          "Route workflows",
          "Identify anomalies",
          "Support compliance reviews",
        ],
      },
      {
        title: "Common Applications",
        cards: [
          {
            title: "Invoice Processing",
            body: "Automate extraction and validation.",
          },
          {
            title: "Contract Review",
            body: "Identify key terms and obligations.",
          },
          {
            title: "Forms Processing",
            body: "Reduce manual data entry.",
          },
          {
            title: "Policy Management",
            body: "Improve accessibility and governance.",
          },
        ],
      },
      {
        title: "Benefits",
        bullets: [
          "Faster processing",
          "Reduced administrative effort",
          "Greater accuracy",
          "Improved compliance",
          "Better operational visibility",
        ],
      },
    ],
  },
};

export const relatedSolutions = [
  { label: "Workflow Automation", href: "/solutions/workflow-automation" },
  { label: "AI Assistants", href: "/solutions/ai-assistants" },
  { label: "Document Intelligence", href: "/solutions/document-intelligence" },
];

export function canonicalUrl(slug: SolutionSlug) {
  return `https://walelai.vercel.app/solutions/${slug}`;
}
