/**
 * @name FooterSection
 * Footer with links and social media
 */
import * as React from "react"
import { Twitter, Github, Linkedin } from "lucide-react"

export const FooterSection = function FooterSection() {
  return (
    <footer className="w-full max-w-[1320px] mx-auto px-5 flex flex-col md:flex-row justify-between items-start gap-8 md:gap-0 py-10 md:py-[70px]">
      {/* Left Section: Logo, Description, Social Links */}
      <div className="flex flex-col justify-start items-start gap-8 p-4 md:p-8">
        <div className="flex gap-3 items-stretch justify-center">
          <div className="text-center text-foreground text-xl font-semibold leading-4">Pointer</div>
        </div>
        <p className="text-foreground/90 text-sm font-medium leading-[18px] text-left">让编程更轻松</p>
        <div className="flex justify-start items-start gap-3">
          <a href="#" aria-label="Twitter" className="w-4 h-4 flex items-center justify-center">
            <Twitter className="w-full h-full text-muted-foreground" />
          </a>
          <a href="#" aria-label="GitHub" className="w-4 h-4 flex items-center justify-center">
            <Github className="w-full h-full text-muted-foreground" />
          </a>
          <a href="#" aria-label="LinkedIn" className="w-4 h-4 flex items-center justify-center">
            <Linkedin className="w-full h-full text-muted-foreground" />
          </a>
        </div>
      </div>
      {/* Right Section: Product, Company, Resources */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-8 md:gap-12 p-4 md:p-8 w-full md:w-auto">
        <div className="flex flex-col justify-start items-start gap-3">
          <h3 className="text-muted-foreground text-sm font-medium leading-5">产品</h3>
          <div className="flex flex-col justify-end items-start gap-2">
            <a href="#" className="text-foreground text-sm font-normal leading-5 hover:underline">
              功能特性
            </a>
            <a href="#" className="text-foreground text-sm font-normal leading-5 hover:underline">
              价格方案
            </a>
            <a href="#" className="text-foreground text-sm font-normal leading-5 hover:underline">
              集成工具
            </a>
            <a href="#" className="text-foreground text-sm font-normal leading-5 hover:underline">
              实时预览
            </a>
            <a href="#" className="text-foreground text-sm font-normal leading-5 hover:underline">
              多智能体编程
            </a>
          </div>
        </div>
        <div className="flex flex-col justify-start items-start gap-3">
          <h3 className="text-muted-foreground text-sm font-medium leading-5">公司</h3>
          <div className="flex flex-col justify-center items-start gap-2">
            <a href="#" className="text-foreground text-sm font-normal leading-5 hover:underline">
              关于我们
            </a>
            <a href="#" className="text-foreground text-sm font-normal leading-5 hover:underline">
              团队介绍
            </a>
            <a href="#" className="text-foreground text-sm font-normal leading-5 hover:underline">
              加入我们
            </a>
            <a href="#" className="text-foreground text-sm font-normal leading-5 hover:underline">
              品牌资源
            </a>
            <a href="#" className="text-foreground text-sm font-normal leading-5 hover:underline">
              联系我们
            </a>
          </div>
        </div>
        <div className="flex flex-col justify-start items-start gap-3">
          <h3 className="text-muted-foreground text-sm font-medium leading-5">资源</h3>
          <div className="flex flex-col justify-center items-start gap-2">
            <a href="#" className="text-foreground text-sm font-normal leading-5 hover:underline">
              使用条款
            </a>
            <a href="#" className="text-foreground text-sm font-normal leading-5 hover:underline">
              API 文档
            </a>
            <a href="#" className="text-foreground text-sm font-normal leading-5 hover:underline">
              开发文档
            </a>
            <a href="#" className="text-foreground text-sm font-normal leading-5 hover:underline">
              开发者社区
            </a>
            <a href="#" className="text-foreground text-sm font-normal leading-5 hover:underline">
              技术支持
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
