import {
  Component,
  DestroyRef,
  inject,
  OnInit,
  ElementRef
} from "@angular/core";
import { Router } from "@angular/router";
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

  isAuthenticated = false;
  destroyRef = inject(DestroyRef);
  markdownContent: string = `
你好！我是你的AI产品小帮手，我可以帮你撰写一份PRD\n
请在左侧输入功能名和需求描述，点击生成就可以!
`;
  structure = ``;
  mermaidMarkdown =
`\`\`\`mermaid
graph TD;
  A-->B;
  A-->C;
  B-->D;
  C-->D;
\`\`\``;

  constructor(
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
    this.userService.isAuthenticated
      .pipe(
        tap((isAuthenticated) => {

        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(
        (isAuthenticated: boolean) => (this.isAuthenticated = isAuthenticated),
      );
  }

  // 复制内容到剪贴板
  copyToClipboard(content: string) {
    this.clipboard.copy(content);
  }

  // 重新生成内容（示例方法，可以按需实现）
  regenerateContent() {
    this.markdownContent = `
### 一、概述

这是更新后的需求细化示例。
`;
  }

  generateDocument(title: string, detail: string) {
      this.markdownContent = "";
      this.prdService.create_prd(title, detail).subscribe({
        next: (content) => {
          this.markdownContent += content;
        },
        error: error => console.error("Error:", error),
        complete: () => console.log("Stream completed")
      });
  }

}
