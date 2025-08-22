import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProgressService, ProgressSummary } from '../../core/progress/progress.service';
import { RouterLink } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-progress',
  imports: [CommonModule, RouterLink],
  template: `
    <!-- Header Section -->
    <div class="bg-gradient-to-r from-primary-600 via-primary-700 to-accent-600 text-white rounded-2xl p-8 mb-8 shadow-xl">
      <div class="flex items-center gap-4 mb-4">
        <div class="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
          <span class="text-3xl">📊</span>
        </div>
        <div>
          <h1 class="text-3xl font-bold mb-2">Your Learning Progress</h1>
          <p class="text-primary-100 text-lg">Track your path to algorithm mastery</p>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div *ngIf="loading" class="flex items-center justify-center py-16">
      <div class="flex flex-col items-center gap-4">
        <div class="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
        <p class="text-gray-600 font-medium">Loading your progress...</p>
      </div>
    </div>

    <!-- Main Content -->
    <div *ngIf="!loading" class="space-y-8">
      <!-- Progress Overview -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Circular Progress -->
        <div class="lg:col-span-1">
          <div class="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 h-full">
            <h3 class="text-xl font-semibold text-gray-800 mb-6 text-center">Overall Progress</h3>
            <div class="flex items-center justify-center">
              <div class="relative w-40 h-40">
                <!-- Background Circle -->
                <svg class="w-40 h-40 transform -rotate-90" viewBox="0 0 144 144">
                  <circle cx="72" cy="72" r="60" stroke="#e5e7eb" stroke-width="8" fill="none"></circle>
                  <circle cx="72" cy="72" r="60"
                          [attr.stroke-dasharray]="getCircumference()"
                          [attr.stroke-dashoffset]="getStrokeDashoffset()"
                          stroke="url(#progressGradient)"
                          stroke-width="8"
                          fill="none"
                          class="transition-all duration-1000 ease-out"
                          stroke-linecap="round">
                  </circle>
                  <!-- Gradient Definition -->
                  <defs>
                    <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stop-color="#8b5cf6"></stop>
                      <stop offset="100%" stop-color="#06b6d4"></stop>
                    </linearGradient>
                  </defs>
                </svg>
                <!-- Percentage Text -->
                <div class="absolute inset-0 flex items-center justify-center">
                  <div class="text-center">
                    <div class="text-3xl font-bold text-gray-800">{{ summary?.percent || 0 }}%</div>
                    <div class="text-sm text-gray-500">Completed</div>
                  </div>
                </div>
              </div>
            </div>
            <div class="text-center mt-4">
              <p class="text-gray-600">
                <span class="font-semibold text-primary-600">{{ summary?.learned || 0 }}</span> of
                <span class="font-semibold">{{ summary?.total || 0 }}</span> algorithms
              </p>
            </div>
          </div>
        </div>

        <!-- Stats Cards -->
        <div class="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <!-- Learned Algorithms -->
          <div class="bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl p-6 border border-green-200">
            <div class="flex items-center gap-3 mb-2">
              <div class="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                <span class="text-white text-lg">✅</span>
              </div>
              <div>
                <p class="text-sm text-green-700 font-medium">Learned Algorithms</p>
                <p class="text-2xl font-bold text-green-800">{{ summary?.learned || 0 }}</p>
              </div>
            </div>
          </div>

          <!-- Remaining Algorithms -->
          <div class="bg-gradient-to-br from-blue-50 to-cyan-100 rounded-xl p-6 border border-blue-200">
            <div class="flex items-center gap-3 mb-2">
              <div class="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                <span class="text-white text-lg">📚</span>
              </div>
              <div>
                <p class="text-sm text-blue-700 font-medium">Remaining</p>
                <p class="text-2xl font-bold text-blue-800">{{ getRemainingCount() }}</p>
              </div>
            </div>
          </div>

          <!-- Achievement Level -->
          <div class="bg-gradient-to-br from-purple-50 to-violet-100 rounded-xl p-6 border border-purple-200">
            <div class="flex items-center gap-3 mb-2">
              <div class="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                <span class="text-white text-lg">{{ getAchievementIcon() }}</span>
              </div>
              <div>
                <p class="text-sm text-purple-700 font-medium">Level</p>
                <p class="text-2xl font-bold text-purple-800">{{ getAchievementLevel() }}</p>
              </div>
            </div>
          </div>

          <!-- Progress Streak -->
          <div class="bg-gradient-to-br from-orange-50 to-amber-100 rounded-xl p-6 border border-orange-200">
            <div class="flex items-center gap-3 mb-2">
              <div class="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                <span class="text-white text-lg">🔥</span>
              </div>
              <div>
                <p class="text-sm text-orange-700 font-medium">Motivation</p>
                <p class="text-2xl font-bold text-orange-800">{{ getMotivationMessage() }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Progress Bar -->
      <div class="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-xl font-semibold text-gray-800">Detailed Progress</h3>
          <span class="text-sm text-gray-500">{{ summary?.learned || 0 }}/{{ summary?.total || 0 }}</span>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
          <div class="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full transition-all duration-1000 ease-out"
               [style.width.%]="summary?.percent || 0">
          </div>
        </div>
        <div class="flex justify-between text-xs text-gray-500 mt-2">
          <span>0%</span><span>25%</span><span>50%</span><span>75%</span><span>100%</span>
        </div>
      </div>

      <!-- Learned Algorithms Section -->
      <div class="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
        <div class="flex items-center gap-3 mb-6">
          <div class="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
            <span class="text-white text-sm">✅</span>
          </div>
          <h3 class="text-xl font-semibold text-gray-800">Mastered Algorithms</h3>
        </div>

        <div *ngIf="learned.length === 0" class="text-center py-12">
          <div class="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span class="text-3xl text-gray-400">📚</span>
          </div>
          <h4 class="text-lg font-medium text-gray-600 mb-2">Start your learning journey!</h4>
            <p class="text-gray-500 mb-6">You have not marked algorithms as learned yet.</p>
          <a routerLink="/algorithms"
             class="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
            <span>🚀</span>
            Explore Algorithms
          </a>
        </div>

        <div *ngIf="learned.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div *ngFor="let algorithm of learned"
               class="group bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-4 hover:shadow-md hover:border-primary-300 transition-all duration-200">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                <span class="text-green-600 text-lg">✅</span>
              </div>
              <div class="flex-1">
                <a [routerLink]="['/algorithms', algorithm.slug]"
                   class="font-medium text-gray-800 hover:text-primary-600 transition-colors group-hover:text-primary-700">
                  {{ algorithm.name }}
                </a>
                <p class="text-xs text-gray-500 mt-1">Mastered algorithm</p>
              </div>
              <div class="text-primary-500 opacity-0 group-hover:opacity-100 transition-opacity">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Call to Action -->
      <div *ngIf="summary && summary.percent < 100" class="bg-gradient-to-r from-primary-600 to-accent-600 rounded-2xl p-8 text-white text-center">
        <h3 class="text-2xl font-bold mb-2">Keep Learning!</h3>
        <p class="text-primary-100 mb-6">You still have {{ getRemainingCount() }} algorithms to master</p>
        <a routerLink="/algorithms"
           class="inline-flex items-center gap-2 bg-white text-primary-600 hover:bg-gray-50 px-6 py-3 rounded-lg font-medium transition-colors">
          <span>🎯</span>
          Continue Learning
        </a>
      </div>

      <!-- Congratulations for 100% -->
      <div *ngIf="summary && summary.percent === 100" class="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-8 text-white text-center">
        <div class="text-6xl mb-4">🎉</div>
        <h3 class="text-3xl font-bold mb-2">Congratulations!</h3>
        <p class="text-green-100 text-lg">You have mastered all available algorithms</p>
      </div>
    </div>
  `,
})
export class ProgressComponent implements OnInit {
  private progress = inject(ProgressService);

  summary: ProgressSummary | null = null;
  learned: { slug: string; name: string }[] = [];
  loading = true;

  ngOnInit() {
    this.loading = true;
    this.progress.getSummary().subscribe((s) => (this.summary = s));
    this.progress.getLearned().subscribe((l) => {
      this.learned = l.learned as any;
      this.loading = false;
    });
  }

  // Helper methods for circular progress
  getCircumference(): number {
    return 2 * Math.PI * 60; // radius = 60
  }

  getStrokeDashoffset(): number {
    const circumference = this.getCircumference();
    const percent = this.summary?.percent || 0;
    return circumference - (percent / 100) * circumference;
  }

  // Helper methods for stats
  getRemainingCount(): number {
    if (!this.summary) return 0;
    return this.summary.total - this.summary.learned;
  }

  getAchievementLevel(): string {
    const percent = this.summary?.percent || 0;
    if (percent === 0) return 'Beginner';
    if (percent < 25) return 'Novice';
    if (percent < 50) return 'Learner';
    if (percent < 75) return 'Competent';
    if (percent < 100) return 'Advanced';
    return 'Master';
  }

  getAchievementIcon(): string {
    const percent = this.summary?.percent || 0;
    if (percent === 0) return '🌱';
    if (percent < 25) return '🔰';
    if (percent < 50) return '⭐';
    if (percent < 75) return '🏆';
    if (percent < 100) return '💎';
    return '👑';
  }

  getMotivationMessage(): string {
    const percent = this.summary?.percent || 0;
    const learned = this.summary?.learned || 0;

    if (percent === 0) return 'Start!';
    if (percent < 25) return `Good start`;
    if (percent < 50) return `Keep going`;
    if (percent < 75) return `Great work`;
    if (percent < 100) return `Almost there`;
    return 'Perfect!';
  }
}
