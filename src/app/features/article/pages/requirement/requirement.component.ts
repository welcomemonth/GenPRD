import {
  Component,
  DestroyRef,
  inject,
  OnInit,
  ElementRef
} from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { ArticleListConfig } from "../../models/article-list-config.model";
import { AsyncPipe, NgClass, NgForOf } from "@angular/common";
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
    MarkdownPipe
  ],
})
export default class RequirementComponent implements OnInit {

  documentData: DocumentSection[] = [];

  title = '';
  detail = '';

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

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly clipboard: Clipboard,
    private readonly userService: UserService,
    private readonly prdService: PrdService,
  ) {}


  mermaidOptions: MermaidAPI.Config = {
    fontFamily: 'inherit',
    theme: MermaidAPI.Theme.Dark,
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
  }

  copyToClipboard(content: string) {
    this.clipboard.copy(content);
  }

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
        this.parseDocument(this.markdownContent);
        this.extractMermaidContent();
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
    
    const regex = /##+ (.*?)(?=\n##|\n*$)/g;
    const matches = markdownContent.match(regex);
    
    if (matches) {
      for (const match of matches) {
        const title = match.trim();
        const description = markdownContent.split(match)[1]?.split(/##+ /)[0].trim() || '';
        
        sections.push({ title, description });
      }
    }

    return sections;
  }

}
