import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-simple-loader',
  template: `
    <div class="simple-loader" [ngStyle]="{ 'height.px': height, 'width.px': width }">
      <div class="loader-animation"></div>
    </div>
  `,
  styles: [`
    .simple-loader {
      background: #f6f6f6;
      border-radius: 4px;
      position: relative;
      overflow: hidden;
    }
    .loader-animation {
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      transform: translateX(-100%);
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
      animation: loading 1.5s infinite;
    }
    @keyframes loading {
      100% {
        transform: translateX(100%);
      }
    }
  `]
})
export class SimpleLoaderComponent implements OnInit {
  @Input() width: number = 100;
  @Input() height: number = 20;

  constructor() { }

  ngOnInit(): void { }
} 