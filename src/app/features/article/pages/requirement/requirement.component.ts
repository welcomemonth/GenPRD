import { DialogComponent } from './../dialog/dialog.component';
import {
  Component,
  DestroyRef,
  inject,
  OnInit,
  ElementRef,
  AfterViewInit,
  ViewChild,
  Renderer2,
  HostListener
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
import { MatDialog } from "@angular/material/dialog";

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
  apiResponse = '';
  updatedContentHtml: any;  //更新后的content，html类型
  updatedContentString = '';  //更新后的content，string类型
  isUpdateContent: boolean = false;  //判断是否更新了content

  content = '';  //被选中的内容
  all_content = '';  //被选中内容所处段落

  // 输入框控制和位置属性
  showTitleInput = false;
  showDescriptionInput = false;
  titleInputTop = 0;
  titleInputLeft = 0;
  descriptionInputTop = 0;
  descriptionInputLeft = 0;
  currentIndex: number | null = null;

  isInputVisible: boolean = false; // 控制输入框是否可见
  currentUrl: string | undefined;

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
    private sanitizer: DomSanitizer,
    private renderer: Renderer2,
    public dialog: MatDialog
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
  };

  ngOnInit(): void {
    // 订阅路由参数并获取 title 和 detail
    this.route.queryParams.subscribe(params => {
      this.currentUrl = this.router.url.split('#')[0];  //获取没有锚点的当前url
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

  replaceContent(): void {
    if(this.contentRendered) {
      this.isMarkdownView = false;
    }
  }

  titleHtml(section: DocumentSection): SafeHtml {
    let titleHtml: SafeHtml;

    if(section.title.startsWith('###')) {
      const html = `<p style="font-size: 1em; font-weight: bold;">${section.title.substring(4).trim()}</p>`;
      return titleHtml = this.sanitizer.bypassSecurityTrustHtml(html);
    }
    else if(section.title.startsWith('##')) {
      const html = `<p style="font-size: 1.25em; font-weight: bold;">${section.title.substring(3).trim()}</p>`;
      return titleHtml = this.sanitizer.bypassSecurityTrustHtml(html);
    }
    else{
      const html = `<p style="font-size: 1.5em; font-weight: bold;">${section.title.substring(2).trim()}</p>`;
      return titleHtml = this.sanitizer.bypassSecurityTrustHtml(html);
    }
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
        this.markdownContent = this.extractMarkdownCode(this.markdownContent);
        console.log("Stream completed.",this.markdownContent);

        this.contentRendered = true;  //this.markdownContent已渲染完毕

        this.sections = this.parseDocument(this.markdownContent); // 直接赋值返回的结果
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

    const regex = /#+ (.*?)(?=\r?\n|$)/g;
  
    const matches = markdownContent.match(regex);
    
    if (matches) {
      for (const match of matches) {
        const title = match.trim();
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
    const level = title.match(/^#+/)?.[0].length || 3;  // 获取标题的级别
    return `title-level-${level}`;
  }

  formatTitle(title: string): string {
    return title.replace(/#+\s*/, '');  // 移除开头的 '#' 和空格
  }

  ifHighlight(index: number) {
    this.currentHighlightedIndex = index;
  }

  openInput() {
    this.isInputVisible = true;
  }

  submitInput(userInput: string) {
    if (userInput.trim()) { // 确保输入不为空
      console.log("发送中");
      this.prdService.sendDataToApi(this.content, this.all_content, userInput).subscribe({
        next: (response: any) => {
          console.log('The response is:', response);
          this.apiResponse = response.choices[0].message.content;  //获取response内容
          console.log("回复内容：",this.apiResponse);
          this.updateText();
        },
        error: (error: any) => {
          console.log("error:", error);
        }
      });
    }
    else {
      alert('请输入有效内容'); // 弹出提示
    }
  }

  // 选中文字触发事件
  onTextSelect(event: MouseEvent, index: number, type: 'title' | 'description') {
    const selection = window.getSelection();
    if (selection && selection.toString()) {
      this.content = selection.toString();  //获取选中的文本
      console.log("被选中的内容是：",this.content);
      //获取被选中文本所在的段落
      if(type === 'title') {
        this.all_content = this.sections[index].title;
        console.log("被选中的内容所在段落：",this.all_content);
      }
      if(type === 'description') {
        this.all_content = this.sections[index].description;
        console.log("被选中的内容所在段落：",this.all_content);
      }

      const range = selection.getRangeAt(0).getBoundingClientRect();
      console.log("坐标：",range);

      if (type === 'title') {
        // 设置 title 的输入框位置和显示状态
        this.showTitleInput = true;
        this.showDescriptionInput = false;
        this.currentIndex = index;
        this.titleInputTop = range.height + 10;
      } else if (type === 'description') {
        // 设置 description 的输入框位置和显示状态
        this.showDescriptionInput = true;
        this.showTitleInput = false;
        this.currentIndex = index;
        this.descriptionInputTop = range.height + 10;
      }
    } else {
      this.hideInput(type);
    }
  }

  // 隐藏输入框
  hideInput(type: 'title' | 'description') {
    if (type === 'title') {
      this.showTitleInput = false;
      this.currentIndex = null;
    } else if (type === 'description') {
      this.showDescriptionInput = false;
      this.currentIndex = null;
    }
  }

  updateText() {
    this.isUpdateContent = false;  //每次判断前将isUpdateContent重置
    // 比较并更新文本
    if (this.apiResponse && this.content) {
      // 获取每个字符的集合，以便比较
      const contentChars = this.content.split('');
      const updatedContentChars = this.apiResponse.split('');

      let updatedContentString = '';  //临时
      let updatedContent = '';  //临时

      for(let i = 0; i < updatedContentChars.length; i++) {
        const char = updatedContentChars[i];
        // 字符在api回复中存在，在原文本中不存在，则为它添加高亮样式
        if(!contentChars.includes(char)) {
          updatedContent += `<span style="background: rgba(35, 131, 226, .036); border-bottom: 2px solid rgba(35, 131, 226, .1); padding-bottom: 2px; color: rgba(16, 95, 173, 1);">${char}</span>`;
          updatedContentString += char;
        }
        // 字符在api回复中存在，在原文本中也存在，则保持不变
        else {
          updatedContent += char;
          updatedContentString += char;
        }
      }

      let finalContent = '';
      for (let i = 0; i < contentChars.length; i++) {
        const char = contentChars[i];

        // 如果这个字符在 updatedContent 中不存在，则为它添加删除线样式
        if (!updatedContentChars.includes(char)) {
          finalContent += `<span style="text-decoration: line-through; text-decoration-thickness: 1px; color: rgba(199, 198, 196, 1);">${char}</span>`;
        } else {
          finalContent += char;  // 保持原样
          updatedContentString += char;
        }
      }

      // 4. 合并内容：updatedContent 和 finalContent
      this.updatedContentHtml = this.sanitizer.bypassSecurityTrustHtml(updatedContent + finalContent);  // 结合新的内容并更新
      this.updatedContentString = updatedContentString;
      this.isUpdateContent = true;
    }
    else {
      this.updatedContentHtml = this.content;  // 保留选中的文本
    }
  }

  openDialog(i: number): void {
    const dialogRef = this.dialog.open(DialogComponent);

    dialogRef.afterClosed().subscribe({
      next: (result: any) => {
        if(result === '保留') {
          console.log("保留");
          this.sections[i].description = this.updatedContentString;
          this.isUpdateContent = false;  //显示更新后的description
        }
        else if(result === '放弃') {
          console.log("放弃");
          this.isUpdateContent = false;  //显示原来的description
        }
        else {
          console.log("取消");
        }
      }
    })

  }

}
