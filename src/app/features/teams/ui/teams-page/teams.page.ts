// src/app/features/teams/ui/teams-page/teams.page.ts
import { Component, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';

import { TeamsStore } from '../../data/teams.store';
import { Team } from '../../models/team.model';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  standalone: true,
  selector: 'app-teams-page',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatTableModule,
    MatChipsModule,
    MatIconModule,
    MatButtonModule,
  ],
  templateUrl: './teams.page.html',
  styleUrls: ['./teams.page.scss'],
})
export class TeamsPage implements OnInit {
  private readonly store = inject(TeamsStore);

  filterForm = new FormGroup({
    search: new FormControl<string>('', { nonNullable: true }),
    activeOnly: new FormControl<boolean>(true, { nonNullable: true }),
  });

  readonly displayedColumns = ['name', 'members', 'status'];

  readonly teams = toSignal(this.store.teams$, {
    initialValue: [] as Team[],
  });
  readonly loading = toSignal(this.store.loading$, {
    initialValue: false,
  });
  readonly error = toSignal(this.store.error$, {
    initialValue: null,
  });

  readonly filteredTeams = computed<Team[]>(() => {
    const search = (this.filterForm.controls.search.value || '').toLowerCase();
    const activeOnly = this.filterForm.controls.activeOnly.value;

    return this.teams().filter((team: Team) => {
      if (activeOnly && !team.isActive) {
        return false;
      }
      if (!search) {
        return true;
      }
      return team.name.toLowerCase().includes(search) || team.code.toLowerCase().includes(search);
    });
  });

  ngOnInit(): void {
    this.store.loadTeams();
  }

  clearFilter(): void {
    this.filterForm.setValue({
      search: '',
      activeOnly: true,
    });
  }
}
