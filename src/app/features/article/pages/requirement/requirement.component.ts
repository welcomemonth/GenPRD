import {
  Component,
  DestroyRef,
  inject,
  OnInit,
  ElementRef,
  AfterViewInit,
  ViewChild
} from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { ArticleListConfig } from "../../models/article-list-config.model";
import { AsyncPipe, CommonModule, NgClass, NgForOf } from "@angular/common";
import { ArticleListComponent } from "../../components/article-list.component";
import { tap } from "rxjs/operators";
import { UserService } from "../../../../core/auth/services/user.service";
import { RxLet } from "@rx-angular/template/let";
import { IfAuthenticatedDirective } from "../../../../core/auth/if-authenticated.directive";
import { Clipboard, ClipboardModule } from "@angular/cdk/clipboard";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { MarkdownPipe } from "src/app/shared/pipes/markdown.pipe";
import { MarkdownComponent, MermaidAPI } from "ngx-markdown";
import { PrdService } from "../../services/prd.service";
import { DocumentSection } from "../../models/document.model";
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";

@Component({
  selector: 'app-requirement',
  standalone: true,
  templateUrl: './requirement.component.html',
  styleUrls: ['./requirement.component.css'],
  imports: [
    NgClass,
    ArticleListComponent,
    MarkdownComponent,
    ClipboardModule,
    AsyncPipe,
    RxLet,
    NgForOf,
    IfAuthenticatedDirective,
    MarkdownPipe,
    CommonModule
  ],
})
export default class RequirementComponent implements OnInit/*, AfterViewInit*/ {

  currentHighlightedIndex: number | null = null;

  isAuthenticated = false;
  destroyRef = inject(DestroyRef);
  markdownContent: string = `
你好！我是你的AI产品小帮手，我可以帮你撰写一份PRD\n
请在左侧输入功能名和需求描述，点击生成就可以!
`;
  structure = ``;
  mermaidMarkdown =
`\`\`\`mermaid
flowchart LR
    A[登录系统] --> B[学生管理]
    A --> C[班级管理]
    A --> D[成绩管理]
    B --> E[数据同步至服务器]
    C --> E
    D --> E
\`\`\``;
  mermaidContent: string[] = [];
  sections: DocumentSection[] = [];
  title = '';
  detail = '';
  safeHtmlContent: SafeHtml = '';

  contentRendered = false;  //标记markdownContent内容是否已渲染
  isMarkdownView = true;  //标记是否切换渲染

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly clipboard: Clipboard,
    private readonly userService: UserService,
    private readonly prdService: PrdService,
    private sanitizer: DomSanitizer
  ) {}

  @ViewChild('markdownBody', { static:false }) markdownBody!:ElementRef;


  mermaidOptions: MermaidAPI.Config = {
    fontFamily: 'inherit',
    //theme: MermaidAPI.Theme.Dark,
    theme: MermaidAPI.Theme.Base,  //采用自定义内容
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

  ngOnInit(): void {
    // 订阅路由参数并获取 title 和 detail
    this.route.queryParams.subscribe(params => {
      this.title = params['title'] || '一个Angular网站';
      this.detail = params['detail'] || '系统支持学生信息的录入、编辑、和删除，\
      提供用户友好的表单界面。用户可以通过搜索功能快速查询特定学生的信息。\
      系统还包含班级管理功能，允许管理员创建、修改班级，并为每个班级分配学生。\
      成绩管理模块则支持上传、查看和统计学生成绩，生成成绩报告。\
      用户登录和身份验证模块确保系统安全，只有管理员或授权人员才能操作敏感信息。\
      所有数据将通过服务与后端API交互，实现数据的动态更新和存储。同时，系统支持响应式设计，确保在不同设备上都能流畅使用。';
    });
    console.log(this.title, this.detail);

    this.userService.isAuthenticated
      .pipe(
        tap((isAuthenticated) => {

        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(
        (isAuthenticated: boolean) => (this.isAuthenticated = isAuthenticated),
      );

    this.generateDocument(this.title, this.detail);

    this.route.fragment.subscribe(fragment => {
      if (fragment) {
        const index = parseInt(fragment.replace('section-', ''), 10);
        this.currentHighlightedIndex = index;
      }
    });
  }

  /*ngAfterViewInit(): void {
      this.replaceContent();
  }*/

  replaceContent(): void {
    console.log("2、", this.contentRendered);
    if(this.contentRendered) {
      //const markdownElement = this.markdownBody.nativeElement;
      const sectionsHtml = this.generateSectionsHtml();
      //this.markdownContent = sectionsHtml;
      //markdownElement.innerHTML = sectionsHtml;
      this.safeHtmlContent = this.sanitizer.bypassSecurityTrustHtml(sectionsHtml);  //将html标记为安全
      this.isMarkdownView = false;
      console.log("new markdownContent is:",this.markdownContent);
    }
  }

  generateSectionsHtml(): string {
    let sectionsHtml = '<div class="sections-container">';
    this.sections.forEach((section, index)=> {
      let titleHtml = '';
      let sectionId = `section-${index}`;  //基于索引生成唯一id
      console.log(sectionId)

      if(section.title.startsWith('###')) {
        titleHtml = `<h3 id="${sectionId}" [ngClass]="{'highlight': currentHighlightedIndex === index}" style="font-size: 1.5em; font-weight: bold;">${section.title.substring(4).trim()}</h3>`;
        console.log(titleHtml);
      }
      else if(section.title.startsWith('##')) {
        titleHtml = `<h2 id="${sectionId}" style="font-size: 1.75em; font-weight: bold;">${section.title.substring(3).trim()}</h2>`;
      }
      else if(section.title.startsWith('#')) {
        titleHtml = `<h1 id="${sectionId}" style="font-size: 2em; font-weight: bold;">${section.title.substring(2).trim()}</h1>`;
      }
      else {
        titleHtml = `<h3 id="${sectionId}" style="font-size: 1.5em; font-weight: bold;">${section.title}</h3>`;
      }

      sectionsHtml += `
        <div class="section-item">
          <button class="add-button">+</button>
          <div>
            ${titleHtml}
            <p>${section.description}</p>
          </div>
        </div>`;
    });
    sectionsHtml += '</div>';
    console.log("sections生成成功");
    return sectionsHtml;
  }

  // 复制内容到剪贴板
  copyToClipboard(content: string) {
    this.clipboard.copy(content);
  }

  // 重新生成内容（示例方法，可以按需实现）
  regenerateContent() {
    this.generateDocument(this.title, this.detail);
  }

  generateDocument(title: string, detail: string) {
    this.markdownContent = "";
    this.prdService.create_prd(title, detail).subscribe({
      next: (content) => {
        this.markdownContent += content;
      },
      error: error => console.error("Error:", error),
      complete: () => {
        console.log(this.markdownContent);
        this.markdownContent = this.extractMarkdownCode(this.markdownContent);
        console.log("Stream completed");
        console.log(this.markdownContent);

        this.contentRendered = true;  //this.markdownContent已渲染完毕
        console.log("1、",this.contentRendered);

        this.sections = this.parseDocument(this.markdownContent); // 直接赋值返回的结果
        console.log("1、", this.sections);
        //this.parseDocument(this.markdownContent);
        console.log("分块content：",this.parseDocument(this.markdownContent))
        this.extractMermaidContent();
        this.replaceContent();
      }
    });
  }

  private extractMarkdownCode(content: string): string {
    const regexMarkdown = /^```markdown\n([\s\S]*?)\n```$/;
    const regexGeneric = /^```\n([\s\S]*?)\n```$/;
  
    let match = content.match(regexMarkdown);
    if (match) {
      return match[1];
    }
  
    match = content.match(regexGeneric);
    return match ? match[1] : content;
  }

  extractMermaidContent() {
    const regex = /```mermaid([\s\S]*?)```/g;
    let match;
    while ((match = regex.exec(this.markdownContent)) !== null) {
      this.mermaidContent.push(`\`\`\`mermaid\n${match[1].trim()}\`\`\``);
    }
    console.log(this.mermaidContent);
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

  //根据title的级别返回不同的样式类
  getTitleClass(title: string): string {
    const level = title.match(/^#+/)?.[0].length || 1;  // 获取标题的级别
    return `title-level-${level}`;
  }

  formatTitle(title: string): string {
    return title.replace(/#+\s*/, '');  // 移除开头的 '#' 和空格
  }

  navigateToSection(index: number) {
    // 如果已经在目标位置，避免重复导航
    if (this.currentHighlightedIndex === index) {
      return; // 不做任何事情
    }

    this.currentHighlightedIndex = index;
    this.router.navigate([], { fragment: `section-${index}` });

    /*const element = document.getElementById(`section-${index}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }*/
  }

}
