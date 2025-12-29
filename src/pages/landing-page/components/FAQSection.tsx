/**
 * @name FAQSection
 * FAQ accordion section
 */
import * as React from "react"
import { ChevronDown } from "lucide-react"

const faqData = [
  {
    question: "什么是 Pointer？适合谁使用？",
    answer:
      "Pointer 是一个 AI 驱动的开发平台，专为希望加速编程工作流程的开发者、团队和组织设计。它既适合寻求提升生产力的个人开发者，也适合需要无缝协作工具的团队。",
  },
  {
    question: "Pointer 的 AI 代码审查是如何工作的？",
    answer:
      "我们的 AI 会实时分析您的代码，提供智能改进建议，捕获潜在错误，并确保最佳实践。它会学习您的编码模式并适应团队标准，让代码审查更快速、更一致。",
  },
  {
    question: "我可以将 Pointer 与现有工具集成吗？",
    answer:
      "当然可以！Pointer 提供与流行开发工具的一键集成，包括 GitHub、GitLab、VS Code、Slack 等。我们的 MCP 连接功能让您可以轻松管理和配置整个开发栈的服务器访问。",
  },
  {
    question: "免费计划包含哪些功能？",
    answer:
      "免费计划包括实时代码建议、基础集成、单个 MCP 服务器连接、最多 2 个 AI 编程智能体，以及带 Pointer 品牌的 Vercel 部署。非常适合刚入门的个人开发者。",
  },
  {
    question: "并行编程智能体是如何工作的？",
    answer:
      "我们的并行编程智能体可以同时处理代码库的不同部分，比传统的单线程方法更快地解决复杂问题。您可以启动多个智能体来并发处理不同任务，如错误修复、功能开发和代码优化。",
  },
  {
    question: "我的代码在 Pointer 中安全吗？",
    answer:
      "绝对安全。我们采用企业级安全措施，包括端到端加密、安全数据传输，并符合行业标准。未经您明确许可，您的代码永远不会离开安全环境，我们还为企业客户提供本地部署选项。",
  },
]

interface FAQItemProps {
  question: string
  answer: string
  isOpen: boolean
  onToggle: () => void
}

const FAQItem = function FAQItem({ question, answer, isOpen, onToggle }: FAQItemProps) {
  const handleClick = function(e: React.MouseEvent) {
    e.preventDefault()
    onToggle()
  }
  return (
    <div
      className={`w-full bg-[rgba(231,236,235,0.08)] shadow-[0px_2px_4px_rgba(0,0,0,0.16)] overflow-hidden rounded-[10px] outline outline-1 outline-border outline-offset-[-1px] transition-all duration-500 ease-out cursor-pointer`}
      onClick={handleClick}
    >
      <div className="w-full px-5 py-[18px] pr-4 flex justify-between items-center gap-5 text-left transition-all duration-300 ease-out">
        <div className="flex-1 text-foreground text-base font-medium leading-6 break-words">{question}</div>
        <div className="flex justify-center items-center">
          <ChevronDown
            className={`w-6 h-6 text-muted-foreground transition-all duration-500 ease-out ${isOpen ? "rotate-180 scale-110" : "rotate-0 scale-100"}`}
          />
        </div>
      </div>
      <div
        className={`overflow-hidden transition-all duration-500 ease-out ${isOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"}`}
        style={{
          transitionProperty: "max-height, opacity, padding",
          transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        <div
          className={`px-5 transition-all duration-500 ease-out ${isOpen ? "pb-[18px] pt-2 translate-y-0" : "pb-0 pt-0 -translate-y-2"}`}
        >
          <div className="text-foreground/80 text-sm font-normal leading-6 break-words">{answer}</div>
        </div>
      </div>
    </div>
  )
}

export const FAQSection = function FAQSection() {
  const stateArray = React.useState<Set<number>>(new Set())
  const openItems = stateArray[0]
  const setOpenItems = stateArray[1]
  
  const toggleItem = function(index: number) {
    const newOpenItems = new Set(openItems)
    if (newOpenItems.has(index)) {
      newOpenItems.delete(index)
    } else {
      newOpenItems.add(index)
    }
    setOpenItems(newOpenItems)
  }
  
  return (
    <section className="w-full pt-[66px] pb-20 md:pb-40 px-5 relative flex flex-col justify-center items-center">
      <div className="w-[300px] h-[500px] absolute top-[150px] left-1/2 -translate-x-1/2 origin-top-left rotate-[-33.39deg] bg-primary/10 blur-[100px] z-0" />
      <div className="self-stretch pt-8 pb-8 md:pt-14 md:pb-14 flex flex-col justify-center items-center gap-2 relative z-10">
        <div className="flex flex-col justify-start items-center gap-4">
          <h2 className="w-full max-w-[435px] text-center text-foreground text-4xl font-semibold leading-10 break-words">
            常见问题
          </h2>
          <p className="self-stretch text-center text-muted-foreground text-sm font-medium leading-[18.20px] break-words">
            关于 Pointer 以及它如何改变您的开发工作流程，您需要了解的一切
          </p>
        </div>
      </div>
      <div className="w-full max-w-[600px] pt-0.5 pb-10 flex flex-col justify-start items-start gap-4 relative z-10">
        {faqData.map((faq, index) => (
          <FAQItem key={index} {...faq} isOpen={openItems.has(index)} onToggle={() => toggleItem(index)} />
        ))}
      </div>
    </section>
  )
}
