import { Component , OnInit} from '@angular/core';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css']
})
export class AboutComponent implements OnInit{
  countdownDate: number = new Date().getTime() + (30 * 24 * 60 * 60 * 1000); // 30 jours

  constructor() {}

  ngOnInit(): void {
    this.updateCountdown();
    setInterval(() => this.updateCountdown(), 1000);
  }

  updateCountdown(): void {
    const now = new Date().getTime();
    const distance = this.countdownDate - now;

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    (document.getElementById("days") as HTMLElement).innerText = days.toString().padStart(2, '0');
    (document.getElementById("hours") as HTMLElement).innerText = hours.toString().padStart(2, '0');
    (document.getElementById("minutes") as HTMLElement).innerText = minutes.toString().padStart(2, '0');
    (document.getElementById("seconds") as HTMLElement).innerText = seconds.toString().padStart(2, '0');
  }


}
