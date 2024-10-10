import { NgForOf } from "@angular/common";
import { Component, DestroyRef, inject, OnInit } from "@angular/core";
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  UntypedFormGroup,
} from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { combineLatest } from "rxjs";
import { Errors } from "../../../../core/models/errors.model";
import { ArticlesService } from "../../services/articles.service";
import { UserService } from "../../../../core/auth/services/user.service";
import { ListErrorsComponent } from "../../../../shared/components/list-errors.component";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";

import Vditor from 'vditor';
import 'vditor/dist/index.css'; // 引入样式


interface ArticleForm {
  title: FormControl<string>;
  description: FormControl<string>;
  body: FormControl<string>;
}

@Component({
  selector: "app-editor-page",
  templateUrl: "./editor.component.html",
  imports: [ListErrorsComponent, ReactiveFormsModule, NgForOf],
  standalone: true,
})
export default class EditorComponent implements OnInit {
  vditor: any;
  isMobile = window.innerWidth < 768;
  destroyRef = inject(DestroyRef);

  constructor(
    private readonly articleService: ArticlesService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly userService: UserService,
  ) {}

  ngOnInit() {
    const outline:IOutline = {
      enable: true,
      position: 'left',
    };
    const mode: "wysiwyg" | "sv" | "ir" = "wysiwyg";
    const options = {
      // height: ,
      tab: '\t',
      placeholder: '请输入内容...',
      toolbar: [
        'headings', '|', 'bold', 'italic', 'strike', '|', 'link', 'image', '|',
        'list', 'ordered-list', '|', 'check', '|', 'code', 'inline-code', 'quote',
        '|', 'preview', 'submit'
      ],
      mode: mode,
      outline: outline,
      comment: {
        enable: true
      }
    };
    this.vditor = new Vditor('vditor', options);
    this.vditor.focus();
  }
}

interface IOutline {
  /** 初始化是否展现大纲。默认值: false */
  enable: boolean;
  /** 大纲位置：'left', 'right'。默认值: 'left' */
  position: "left" | "right";
}
