/**
 * @name BentoSection
 * Bento grid section with feature cards
 */
import * as React from "react"
import AiCodeReviews from "./bento/ai-code-reviews"
import RealtimeCodingPreviews from "./bento/real-time-previews"
import OneClickIntegrationsIllustration from "./bento/one-click-integrations-illustration"
import MCPConnectivityIllustration from "./bento/mcp-connectivity-illustration"
import EasyDeployment from "./bento/easy-deployment"
import ParallelCodingAgents from "./bento/parallel-agents"

interface BentoCardProps {
  title: string
  description: string
  Component: React.ComponentType
}

const BentoCard = function BentoCard({ title, description, Component }: BentoCardProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/20 flex flex-col justify-start items-start relative">
      {/* Background with blur effect */}
      <div
        className="absolute inset-0 rounded-2xl"
        style={{
          background: "rgba(231, 236, 235, 0.05)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
        }}
      />
      {/* Additional subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-2xl" />

      <div className="self-stretch p-6 flex flex-col justify-start items-start gap-2 relative z-10">
        <div className="self-stretch flex flex-col justify-start items-start gap-1.5">
          <p className="self-stretch text-foreground text-lg font-normal leading-7">
            {title} <br />
            <span className="text-muted-foreground">{description}</span>
          </p>
        </div>
      </div>
      <div className="self-stretch h-72 relative -mt-0.5 z-10">
        <Component />
      </div>
    </div>
  )
}

export const BentoSection = function BentoSection() {
  const cards = [
    {
      title: "AI 智能代码审查",
      description: "实时获取智能建议，编写更优质代码",
      Component: AiCodeReviews,
    },
    {
      title: "实时代码预览",
      description: "协作编程，即时预览代码变更",
      Component: RealtimeCodingPreviews,
    },
    {
      title: "一键集成",
      description: "轻松连接常用开发工具",
      Component: OneClickIntegrationsIllustration,
    },
    {
      title: "灵活的 MCP 连接",
      description: "轻松管理和配置 MCP 服务器访问",
      Component: MCPConnectivityIllustration,
    },
    {
      title: "启动并行编程助手",
      description: "多个 AI 助手协同工作，更快解决复杂问题",
      Component: ParallelCodingAgents,
    },
    {
      title: "轻松部署",
      description: "从代码到 Vercel 线上部署，一气呵成",
      Component: EasyDeployment,
    },
  ]

  return (
    <section className="w-full px-5 flex flex-col justify-center items-center overflow-visible bg-transparent">
      <div className="w-full py-8 md:py-16 relative flex flex-col justify-start items-start gap-6">
        <div className="w-[547px] h-[938px] absolute top-[614px] left-[80px] origin-top-left rotate-[-33.39deg] bg-primary/10 blur-[130px] z-0" />
        <div className="self-stretch py-8 md:py-14 flex flex-col justify-center items-center gap-2 z-10">
          <div className="flex flex-col justify-start items-center gap-4">
            <h2 className="w-full max-w-[655px] text-center text-foreground text-4xl md:text-6xl font-semibold leading-tight md:leading-[66px]">
              AI 赋能开发流程
            </h2>
            <p className="w-full max-w-[600px] text-center text-muted-foreground text-lg md:text-xl font-medium leading-relaxed">
              借助 AI 助手实现实时协作、无缝集成和智能洞察，优化开发效率
            </p>
          </div>
        </div>
        <div className="self-stretch grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 z-10">
          {cards.map((card) => (
            <BentoCard key={card.title} {...card} />
          ))}
        </div>
      </div>
    </section>
  )
}
