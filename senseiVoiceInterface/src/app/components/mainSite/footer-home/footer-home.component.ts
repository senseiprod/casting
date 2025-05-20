import { Component,OnInit} from '@angular/core';

@Component({
  selector: 'app-footer-home',
  templateUrl: './footer-home.component.html',
  styleUrls: ['./footer-home.component.css']
})
export class FooterHomeComponent implements OnInit {
  currentYear: number = new Date().getFullYear()

  constructor() {}

  ngOnInit(): void {}

}
