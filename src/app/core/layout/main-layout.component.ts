// src/app/core/layout/main-layout.component.ts
import { Component, signal, effect } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { NgForOf } from '@angular/common';

import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';

interface NavItem {
  label: string;
  icon: string;
  route: string;
}

@Component({
  standalone: true,
  selector: 'app-main-layout',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    NgForOf,
    MatSidenavModule,
    MatToolbarModule,
    MatIconModule,
    MatListModule,
    MatButtonModule,
  ],
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss'],
})
export class MainLayoutComponent {
  // متن ساده، بدون key و بدون ترجمه
  protected readonly appTitle = 'Workload Planner';

  protected readonly navItems = signal<NavItem[]>([
    { label: 'Dashboard', icon: 'dashboard', route: '/dashboard' },
    { label: 'Teams', icon: 'groups', route: '/teams' },
    { label: 'Planning', icon: 'view_kanban', route: '/planning' },
  ]);

  protected readonly darkMode = signal<boolean>(false);

  constructor() {
    // sync تم با body فقط روی کلاینت
    effect(() => {
      if (typeof document === 'undefined') {
        return;
      }

      const body = document.body;

      if (this.darkMode()) {
        body.classList.add('dark-theme');
      } else {
        body.classList.remove('dark-theme');
      }
    });
  }

  toggleTheme(): void {
    this.darkMode.update((v) => !v);
  }
}
