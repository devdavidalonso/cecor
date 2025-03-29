// frontend/src/app/shared/directives/prototype-highlight.directive.ts
import { Directive, ElementRef, Input, OnInit } from '@angular/core';

@Directive({
  selector: '[appPrototypeHighlight]',
  standalone: true
})
export class PrototypeHighlightDirective implements OnInit {
  @Input() appPrototypeHighlight: boolean = true;
  
  constructor(private el: ElementRef) {}
  
  ngOnInit() {
    if (this.appPrototypeHighlight) {
      this.el.nativeElement.style.border = '2px dashed #ff6b6b';
      this.el.nativeElement.style.position = 'relative';
      
      const badge = document.createElement('div');
      badge.textContent = 'PROTÓTIPO';
      badge.style.position = 'absolute';
      badge.style.top = '0';
      badge.style.right = '0';
      badge.style.backgroundColor = '#ff6b6b';
      badge.style.color = 'white';
      badge.style.padding = '2px 6px';
      badge.style.fontSize = '10px';
      badge.style.borderRadius = '0 0 0 4px';
      
      this.el.nativeElement.appendChild(badge);
    }
  }
}