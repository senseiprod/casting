import {Component, OnInit} from '@angular/core';
import {ActionRequest, ActionService} from "../../../services/action.service";
import {VoixResponse, VoixService} from "../../../services/voix.service";
import {ActivatedRoute, Router} from "@angular/router";
import {SpeakerResponse, SpeakerService} from "../../../services/speaker-service.service";
interface StudioEquipment {
  category: string;
  items: string[];
}

interface StudioService {
  name: string;
  description: string;
  icon: string;
  price: string;
}

interface TimeSlot {
  id: number;
  time: string;
  available: boolean;
}

interface StudioGalleryImage {
  url: string;
  alt: string;
  featured?: boolean;
}

interface StudioTestimonial {
  id: number;
  name: string;
  role: string;
  avatar: string;
  comment: string;
  rating: number;
}
@Component({
  selector: 'app-generation-with-language',
  templateUrl: './generation-with-language.component.html',
  styleUrls: ['./generation-with-language.component.css']
})
export class GenerationWithLanguageComponent implements OnInit {
  selectedDate: Date = new Date();
  selectedService: string = '';
  activeTab: string = 'overview';
  currentImageIndex: number = 0;

  equipment: StudioEquipment[] = [
    {
      category: 'Microphones',
      items: ['Neumann U87', 'AKG C414', 'Shure SM7B', 'Rode NT1-A', 'Sennheiser MD421']
    },
    {
      category: 'Interfaces & Preamps',
      items: ['Universal Audio Apollo x8', 'Focusrite Scarlett 18i20', 'Neve 1073 Preamp', 'API 512c Preamp']
    },
    {
      category: 'Instruments',
      items: ['Yamaha C7 Grand Piano', 'Fender Stratocaster', 'Gibson Les Paul', 'Fender Jazz Bass', 'Roland V-Drums']
    },
    {
      category: 'Software & DAWs',
      items: ['Pro Tools', 'Logic Pro X', 'Ableton Live', 'Universal Audio Plugins', 'Waves Complete Bundle']
    }
  ];

  services: StudioService[] = [
    {
      name: 'Enregistrement vocal',
      description: 'Enregistrement vocal professionnel pour publicités, livres audio et voix off avec des ingénieurs du son experts.',
      icon: 'microphone',
      price: 'DH 80/hour'
    },
    {
      name: 'Production musicale',
      description: 'Services complets de production musicale, y compris l\'enregistrement, le mixage et le mastering avec un équipement standard de l\'industrie.',
      icon: 'music',
      price: 'DH 120/hour'
    },
    {
      name: 'Enregistrement de podcasts',
      description: 'Configuration complète d\'enregistrement de podcast avec enregistrement multipiste et montage post-production.',
      icon: 'radio',
      price: 'DH 70/hour'
    },
    {
      name: 'Post-production audio',
      description: 'Services professionnels d\'édition audio, de mixage et de mastering pour tous vos besoins de post-production.',
      icon: 'sliders',
      price: 'DH 90/hour'
    }
  ];

  timeSlots: TimeSlot[] = [
    { id: 1, time: '9:00 - 11:00', available: true },
    { id: 2, time: '11:30 - 13:30', available: false },
    { id: 3, time: '14:00 - 16:00', available: true },
    { id: 4, time: '16:30 - 18:30', available: true },
    { id: 5, time: '19:00 - 21:00', available: false },
    { id: 6, time: '21:30 - 23:30', available: true }
  ];

  galleryImages: StudioGalleryImage[] = [
    { url: 'assets/img/top-view-air-radio.jpg' ,alt:'Main recording studio with acoustic treatment', featured: true },
    { url: 'assets/img/top-view-air-radio.jpg', alt: 'Vocal booth with professional microphone setup' },
    { url: 'assets/img/top-view-air-radio.jpg', alt: 'Control room with mixing console' },
    { url: 'assets/img/top-view-air-radio.jpg', alt: 'Live room with instruments' },
    { url: 'assets/img/top-view-air-radio.jpg', alt: 'Lounge area for artists' },
    { url: 'assets/img/top-view-air-radio.jpg', alt: 'Mastering suite with acoustic treatment' }
  ];

  testimonials: StudioTestimonial[] = [
    {
      id: 1,
      name: 'Sophie Laurent',
      role: 'Voice Artist',
      avatar: '/placeholder.svg?height=100&width=100',
      comment: 'The studio provided an exceptional recording environment. The sound quality was impeccable, and the engineers were incredibly professional and helpful.',
      rating: 5
    },
    {
      id: 2,
      name: 'Jean Dubois',
      role: 'Music Producer',
      avatar: '/placeholder.svg?height=100&width=100',
      comment: 'I\'ve worked in many studios across Europe, but this one stands out for its equipment quality and acoustic treatment. Highly recommended for serious productions.',
      rating: 5
    },
    {
      id: 3,
      name: 'Marie Clement',
      role: 'Podcast Host',
      avatar: '/placeholder.svg?height=100&width=100',
      comment: 'Recording my podcast here has been a game-changer. The team understands exactly what podcasters need and delivers exceptional quality every time.',
      rating: 4
    }
  ];

  constructor() { }

  ngOnInit(): void {
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  selectTimeSlot(slot: TimeSlot): void {
    if (slot.available) {
      // Handle time slot selection
      console.log(`Selected time slot: ${slot.time}`);
    }
  }

  nextImage(): void {
    this.currentImageIndex = (this.currentImageIndex + 1) % this.galleryImages.length;
  }

  prevImage(): void {
    this.currentImageIndex = (this.currentImageIndex - 1 + this.galleryImages.length) % this.galleryImages.length;
  }

  selectImage(index: number): void {
    this.currentImageIndex = index;
  }

  submitReservation(): void {
    // Handle reservation submission
    console.log('Reservation submitted');
  }
}
