import {
  Component,
  DestroyRef,
  inject,
  OnInit,
  ElementRef,
} from "@angular/core";
import { Router } from "@angular/router";
import { TagsService } from "../../services/tags.service";
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

@Component({
  selector: "app-home-page",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.css"],
  imports: [
    NgClass,
    ArticleListComponent,
    ClipboardModule,
    AsyncPipe,
    RxLet,
    NgForOf,
    IfAuthenticatedDirective,
    MarkdownPipe,
  ],
  standalone: true,
})
export default class HomeComponent implements OnInit {
  isAuthenticated = false;
  listConfig: ArticleListConfig = {
    type: "all",
    filters: {},
  };
  tags$ = inject(TagsService)
    .getAll()
    .pipe(tap(() => (this.tagsLoaded = true)));
  tagsLoaded = false;
  destroyRef = inject(DestroyRef);
  markdownContent: string = `
你好！我是你的AI产品小帮手，我可以帮你撰写一份PRD\n
请在左侧输入功能名和需求描述，点击生成就可以!
`;
  structure = `
## 系统结构图
\`\`\`mermaid
graph TD
    A[学生管理系统] --> B[学生模块]
    A --> C[课程模块]
    A --> D[教师模块]
    A --> E[成绩模块]
    A --> F[班级模块]

    B --> B1[学生信息管理]
    B --> B2[学生注册]
    B --> B3[学生查询]

    C --> C1[课程信息管理]
    C --> C2[课程安排]
    C --> C3[课程查询]

    D --> D1[教师信息管理]
    D --> D2[教师安排]
    D --> D3[教师查询]

    E --> E1[成绩录入]
    E --> E2[成绩查询]
    E --> E3[成绩统计]

    F --> F1[班级信息管理]
    F --> F2[班级安排]
    F --> F3[班级查询]
\`\`\`
`;

  constructor(
    private readonly router: Router,
    private readonly clipboard: Clipboard,
    private readonly userService: UserService,
  ) {}

  ngOnInit(): void {
    this.userService.isAuthenticated
      .pipe(
        tap((isAuthenticated) => {
          if (isAuthenticated) {
            this.setListTo("feed");
          } else {
            this.setListTo("all");
          }
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(
        (isAuthenticated: boolean) => (this.isAuthenticated = isAuthenticated),
      );
  }

  setListTo(type: string = "", filters: Object = {}): void {
    // If feed is requested but user is not authenticated, redirect to login
    if (type === "feed" && !this.isAuthenticated) {
      void this.router.navigate(["/login"]);
      return;
    }

    // Otherwise, set the list object
    this.listConfig = { type: type, filters: filters };
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

  generateDocument() {
    console.log("文档生成");
  }
}
