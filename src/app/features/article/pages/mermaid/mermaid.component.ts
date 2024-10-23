import { Component } from '@angular/core';
import { MarkdownComponent, MermaidAPI } from "ngx-markdown";
import { DocumentSection } from '../../models/document.model';

@Component({
  selector: 'app-mermaid',
  standalone: true,
  imports: [MarkdownComponent],
  templateUrl: './mermaid.component.html',
  styleUrl: './mermaid.component.css'
})
export class MermaidComponent {
  markdownContent: string = `
  # 一、概述

  这个项目是一个基于Angular技术开发的网站，致力于为学生信息管理提供高效、便捷的服务。它支持学生信息的录入、编辑、删除，并通过友好的界面和搜索功能提升用户体验。此外，系统集成了班级和成绩管理模块，确保数据安全并支持多设备响应式设计。
  
  ## 1.1 产品概述及目标
  
  ### 1.1.1 背景介绍
  
  随着教育信息化的深入应用，数字化的学生管理系统成为学校亟需的工具，旨在提高管理效率，简化信息处理流程。
  
  ### 1.1.2 产品概述
  
  本产品是一个专为教育机构设计的学生管理系统，提供学生信息录入、编辑、删除功能，通过搜索快速查询，班级管理，成绩上传和统计，确保数据安全与响应式设计，为用户带来便捷高效的体验。
  
  ### 1.1.3 产品目标
  
  近期目标是实现基础的学生信息和班级管理，确保数据互动顺畅；远期目标扩大到全校范围的成绩管理和更加智能化的数据分析功能。
  
  ## 1.2 全局说明
  
  ### 1.2.1 全局异常处理
  
  系统异常包括网络中断、API错误，将会通过弹出提示框通知用户，并引导他们进行适当的操作或尝试重试。
  
  ### 1.2.2 普通列表规则
  
  所有列表按照录入时间排序，支持分页，每页默认显示10条记录。用户可以通过调整设置选择不同的分页显示。
  
  ### 1.2.3 全局交互
  
  系统交互采用简洁直观形式，主要通过提示框、疏导用户行为。缺省数据将显示“无信息”提示。
  
  ## 1.3 名词说明
  
  - 学生信息：包含姓名、性别、出生日期、学号等基础信息。
  - 班级管理：涉及班级名称、编号及所属学生名单。
  - 成绩管理：支持学生成绩的录入、统计及报告生成。
  
  ## 1.4 文档阅读对象
  
  此文档适用于软件研发人员、UI设计者、前端开发人员及运营团队。`
  ;
  mermaidContent = 
  `\`\`\`mermaid
  flowchart LR
  A[登录系统] --> B[学生管理]
  A --> C[班级管理]
  A --> D[成绩管理]
  B --> E[数据同步至服务器]
  C --> E
  D --> E
  \`\`\``;
  mermaidOptions: MermaidAPI.Config = {
    fontFamily: 'inherit',
    //theme: MermaidAPI.Theme.Dark,
    theme: MermaidAPI.Theme.Base,
    themeVariables: {
      primaryColor: '#ACBDAA', // 主色调（绿色）
      primaryTextColor: '#1E2D4C', // 主文字颜色（白色）
      primaryBorderColor: '#858585', // 主边框颜色（深绿色）
    },
    /*flowchart: {
      diagramPadding: 8,
      htmlLabels: true,
      curve: 'basis',
      useMaxWidth: true,
      nodeSpacing: 50,
    },
    sequence: {
      diagramMarginX: 50,
      actorMargin: 50,
      width: 150,
      height: 65,
      boxTextMargin: 5,
    },*/  
  };

  sections: DocumentSection[] = [];

ngOnInit() {
  console.log(this.markdownContent);
  this.sections = this.parseDocument(this.markdownContent); // 直接赋值返回的结果
  setTimeout(() => {
    console.log("sections:", this.sections);
  }, 0);
  //console.log("sections:", this.sections);
}

parseDocument(markdownContent: string): DocumentSection[] {
  const sections: DocumentSection[] = [];
  
  //const regex = /##+ (.*?)(?=\n##|\n*$)/g;
  //const regex = /##+ (.*?)(?=\r?\n##|\r?\n*$)/g;
  const regex = /#+ (.*?)(?=\r?\n|$)/g;

  const matches = markdownContent.match(regex);
  console.log("matches:",matches);
  
  if (matches) {
    console.log("down");
    for (const match of matches) {
      const title = match.trim();
      //const description = markdownContent.split(match)[1]?.split(/##+ /)[0].trim() || '';
      // 使用正则表达式 split 内容，但保留换行符分隔
      const splitContent = markdownContent.split(match);
      const description = splitContent[1]?.split(/##+ /)[0]?.trim() || '';  // 捕捉标题下面的内容
      
      
      sections.push({ title, description });
    }
  }

  console.log("sections:",sections);

  return sections; // 返回sections数组
}

}
