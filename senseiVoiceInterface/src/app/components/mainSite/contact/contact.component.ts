import {Component, ElementRef, HostListener, Input, ViewChild} from '@angular/core';
@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css']
})
export class ContactComponent {
  speakers = [
    { name: 'SARA EL RHANI', image: '/assets/speaker1.jpg' },
    { name: 'SARA EL RHANI', image: '/assets/speaker2.jpg' },
    { name: 'SARA EL RHANI', image: '/assets/speaker3.jpg' },
    { name: 'SARA EL RHANI', image: '/assets/speaker4.jpg' }
  ];

  navItems = [
    { label: 'LANGUES', link: '#' },
    { label: 'SPEAKERS', link: '#' },
    { label: 'VOIX IA', link: '#' },
    { label: 'STUDIO', link: '#' },
    { label: 'CONTACT US', link: '#' }
  ];
}
