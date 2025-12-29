/**
 * @name TestimonialGridSection
 * Grid of testimonial cards
 */
import * as React from "react"

interface Testimonial {
  quote: string
  name: string
  company: string
  avatar: string
  type: string
}

const testimonials: Testimonial[] = [
  {
    quote:
      "Pointer 的实时代码建议就像有一位资深工程师在审查你写的每一行代码。它的建议准确性提升了我们的整体代码质量，减少了审查时间。",
    name: "Annette Black",
    company: "Sony",
    avatar: "/pages/landing-page/images/avatars/annette-black.png",
    type: "large-teal",
  },
  {
    quote:
      "将 Pointer 集成到我们的技术栈非常顺利，MCP 服务器连接为我们节省了数天的配置工作",
    name: "Dianne Russell",
    company: "McDonald's",
    avatar: "/pages/landing-page/images/avatars/dianne-russell.png",
    type: "small-dark",
  },
  {
    quote:
      "Pointer 的多智能体编程功能改变了游戏规则。我们现在可以在几小时内修复复杂的 bug，而不是花费整个冲刺周期。",
    name: "Cameron Williamson",
    company: "IBM",
    avatar: "/pages/landing-page/images/avatars/cameron-williamson.png",
    type: "small-dark",
  },
  {
    quote:
      "我们不再需要在多个工具之间切换。Pointer 将所有集成整合到一个地方，简化了我们的整个工作流程。",
    name: "Robert Fox",
    company: "MasterCard",
    avatar: "/pages/landing-page/images/avatars/robert-fox.png",
    type: "small-dark",
  },
  {
    quote:
      "我们最初只是用免费计划测试，但一周内就升级到了专业版。现在，我们无法想象没有它的编程生活",
    name: "Darlene Robertson",
    company: "Ferrari",
    avatar: "/pages/landing-page/images/avatars/darlene-robertson.png",
    type: "small-dark",
  },
  {
    quote:
      "协作编程现在变得轻而易举。有了 Pointer 的实时预览，结对编程变得更快、更高效。",
    name: "Cody Fisher",
    company: "Apple",
    avatar: "/pages/landing-page/images/avatars/cody-fisher.png",
    type: "small-dark",
  },
  {
    quote:
      "使用 Pointer 在 Vercel 上部署不仅简单，而且无缝。我们从编码到看到更改上线只需几分钟，无需担心构建管道或配置问题。",
    name: "Albert Flores",
    company: "Louis Vuitton",
    avatar: "/pages/landing-page/images/avatars/albert-flores.png",
    type: "large-light",
  },
]

const TestimonialCard = function TestimonialCard({ quote, name, company, avatar, type }: Testimonial) {
  const isLargeCard = type.startsWith("large")
  const avatarSize = isLargeCard ? 48 : 36
  const avatarBorderRadius = isLargeCard ? "rounded-[41px]" : "rounded-[30.75px]"
  const padding = isLargeCard ? "p-6" : "p-[30px]"

  let cardClasses = `flex flex-col justify-between items-start overflow-hidden rounded-[10px] shadow-[0px_2px_4px_rgba(0,0,0,0.08)] relative ${padding}`
  let quoteClasses = ""
  let nameClasses = ""
  let companyClasses = ""
  let backgroundElements = null
  let cardHeight = ""
  const cardWidth = "w-full md:w-[384px]"

  if (type === "large-teal") {
    cardClasses += " bg-primary"
    quoteClasses += " text-primary-foreground text-2xl font-medium leading-8"
    nameClasses += " text-primary-foreground text-base font-normal leading-6"
    companyClasses += " text-primary-foreground/60 text-base font-normal leading-6"
    cardHeight = "h-[502px]"
    backgroundElements = (
      <div
        className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/pages/landing-page/images/large-card-background.svg')", zIndex: 0 }}
      />
    )
  } else if (type === "large-light") {
    cardClasses += " bg-[rgba(231,236,235,0.12)]"
    quoteClasses += " text-foreground text-2xl font-medium leading-8"
    nameClasses += " text-foreground text-base font-normal leading-6"
    companyClasses += " text-muted-foreground text-base font-normal leading-6"
    cardHeight = "h-[502px]"
    backgroundElements = (
      <div
        className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat opacity-20"
        style={{ backgroundImage: "url('/pages/landing-page/images/large-card-background.svg')", zIndex: 0 }}
      />
    )
  } else {
    cardClasses += " bg-card outline outline-1 outline-border outline-offset-[-1px]"
    quoteClasses += " text-foreground/80 text-[17px] font-normal leading-6"
    nameClasses += " text-foreground text-sm font-normal leading-[22px]"
    companyClasses += " text-muted-foreground text-sm font-normal leading-[22px]"
    cardHeight = "h-[244px]"
  }

  return (
    <div className={`${cardClasses} ${cardWidth} ${cardHeight}`}>
      {backgroundElements}
      <div className={`relative z-10 font-normal break-words ${quoteClasses}`}>{quote}</div>
      <div className="relative z-10 flex justify-start items-center gap-3">
        <img
          src={avatar || "/placeholder.svg"}
          alt={`${name} avatar`}
          width={avatarSize}
          height={avatarSize}
          className={`w-${avatarSize / 4} h-${avatarSize / 4} ${avatarBorderRadius}`}
          style={{ border: "1px solid rgba(255, 255, 255, 0.08)" }}
        />
        <div className="flex flex-col justify-start items-start gap-0.5">
          <div className={nameClasses}>{name}</div>
          <div className={companyClasses}>{company}</div>
        </div>
      </div>
    </div>
  )
}

export const TestimonialGridSection = function TestimonialGridSection() {
  return (
    <section className="w-full px-5 overflow-hidden flex flex-col justify-start py-6 md:py-8 lg:py-14">
      <div className="self-stretch py-6 md:py-8 lg:py-14 flex flex-col justify-center items-center gap-2">
        <div className="flex flex-col justify-start items-center gap-4">
          <h2 className="text-center text-foreground text-3xl md:text-4xl lg:text-[40px] font-semibold leading-tight md:leading-tight lg:leading-[40px]">
            让编程更轻松
          </h2>
          <p className="self-stretch text-center text-muted-foreground text-sm md:text-sm lg:text-base font-medium leading-[18.20px] md:leading-relaxed lg:leading-relaxed">
            {"了解开发者如何借助 Pointer 的强大 AI 工具，"} <br />{" "}
            {"更快交付产品、无缝协作、自信构建"}
          </p>
        </div>
      </div>
      <div className="w-full pt-0.5 pb-4 md:pb-6 lg:pb-10 flex flex-col md:flex-row justify-center items-start gap-4 md:gap-4 lg:gap-6 max-w-[1100px] mx-auto">
        <div className="flex-1 flex flex-col justify-start items-start gap-4 md:gap-4 lg:gap-6">
          <TestimonialCard {...testimonials[0]} />
          <TestimonialCard {...testimonials[1]} />
        </div>
        <div className="flex-1 flex flex-col justify-start items-start gap-4 md:gap-4 lg:gap-6">
          <TestimonialCard {...testimonials[2]} />
          <TestimonialCard {...testimonials[3]} />
          <TestimonialCard {...testimonials[4]} />
        </div>
        <div className="flex-1 flex flex-col justify-start items-start gap-4 md:gap-4 lg:gap-6">
          <TestimonialCard {...testimonials[5]} />
          <TestimonialCard {...testimonials[6]} />
        </div>
      </div>
    </section>
  )
}
