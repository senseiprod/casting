import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
interface StatCard {
  title: string;
  value: string | number;
  icon: string;
  color: string;
  change?: {
    value: string;
    direction: "up" | "down";
  };
  progress?: number;
}

interface Project {
  id: string;
  title: string;
  speaker: {
    name: string;
    initials: string;
    bgColor: string;
  };
  type: string;
  status: "in-progress" | "completed" | "pending" | "cancelled";
  progress?: number;
  dueDate: string;
  budget: number;
}

interface RecordingRequest {
  id: string;
  title: string;
  type: string;
  description: string;
  budget: number;
  dueDate: string;
  status: "pending" | "approved" | "rejected" | "completed";
  applicants?: number;
}

interface Speaker {
  id: string;
  name: string;
  initials: string;
  bgColor: string;
  rating: number;
  specialty: string;
  price: string;
  samples: number;
  projects: number;
}

interface SpeakerApplication {
  id: string;
  date: string;
  status: "pending" | "approved" | "rejected";
  notes?: string;
}
@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent {
  // Stats cards
  statCards: StatCard[] = [
    {
      title: "Active Projects",
      value: 5,
      icon: "bi-play-circle",
      color: "primary",
      change: {
        value: "12%",
        direction: "up",
      },
    },
    {
      title: "Pending Requests",
      value: 3,
      icon: "bi-hourglass-split",
      color: "warning",
      change: {
        value: "3%",
        direction: "down",
      },
    },
    {
      title: "Completed Projects",
      value: 18,
      icon: "bi-check-circle",
      color: "success",
      progress: 78,
    },
    {
      title: "Total Spent",
      value: "$4,250",
      icon: "bi-cash-stack",
      color: "info",
      change: {
        value: "8%",
        direction: "up",
      },
    },
  ];

  // Active projects
  activeProjects: Project[] = [
    {
      id: "PRJ-2023-042",
      title: "Product Launch Commercial",
      speaker: {
        name: "John Doe",
        initials: "JD",
        bgColor: "primary",
      },
      type: "Commercial",
      status: "in-progress",
      progress: 65,
      dueDate: "Apr 28, 2023",
      budget: 350,
    },
    {
      id: "PRJ-2023-041",
      title: "Mobile App Tutorial",
      speaker: {
        name: "Sarah Johnson",
        initials: "SJ",
        bgColor: "success",
      },
      type: "E-Learning",
      status: "in-progress",
      progress: 40,
      dueDate: "May 05, 2023",
      budget: 500,
    },
    {
      id: "PRJ-2023-040",
      title: "Company Overview Video",
      speaker: {
        name: "Michael Chen",
        initials: "MC",
        bgColor: "info",
      },
      type: "Corporate",
      status: "pending",
      dueDate: "May 12, 2023",
      budget: 450,
    },
  ];

  // Recording requests
  recordingRequests: RecordingRequest[] = [
    {
      id: "REQ-2023-039",
      title: "New Product Announcement",
      type: "Commercial",
      description: "Energetic voice for a 30-second commercial announcing our new product line.",
      budget: 300,
      dueDate: "May 15, 2023",
      status: "pending",
      applicants: 4,
    },
    {
      id: "REQ-2023-038",
      title: "Customer Service Training",
      type: "E-Learning",
      description: "Professional voice for a series of customer service training modules.",
      budget: 600,
      dueDate: "May 20, 2023",
      status: "pending",
      applicants: 2,
    },
    {
      id: "REQ-2023-037",
      title: "IVR Phone System",
      type: "IVR",
      description: "Clear, professional voice for our company's phone system menus.",
      budget: 250,
      dueDate: "May 10, 2023",
      status: "approved",
      applicants: 5,
    },
  ];

  // Top speakers
  topSpeakers: Speaker[] = [
    {
      id: "SPK-001",
      name: "John Doe",
      initials: "JD",
      bgColor: "primary",
      rating: 4.9,
      specialty: "Commercial",
      price: "$100-150/hr",
      samples: 12,
      projects: 45,
    },
    {
      id: "SPK-002",
      name: "Sarah Johnson",
      initials: "SJ",
      bgColor: "success",
      rating: 4.8,
      specialty: "E-Learning",
      price: "$90-120/hr",
      samples: 8,
      projects: 32,
    },
    {
      id: "SPK-003",
      name: "Michael Chen",
      initials: "MC",
      bgColor: "info",
      rating: 4.7,
      specialty: "Corporate",
      price: "$110-160/hr",
      samples: 10,
      projects: 38,
    },
    {
      id: "SPK-004",
      name: "Emily Rodriguez",
      initials: "ER",
      bgColor: "warning",
      rating: 4.9,
      specialty: "Character",
      price: "$120-180/hr",
      samples: 15,
      projects: 41,
    },
  ];

  // Speaker application
  speakerApplication: SpeakerApplication | null = {
    id: "APP-2023-005",
    date: "Apr 10, 2023",
    status: "pending",
    notes: "Your application is currently under review. We'll notify you once a decision has been made.",
  };

  // New request form
  newRequest = {
    title: "",
    type: "Commercial",
    description: "",
    budget: null as number | null,
    dueDate: "",
    requirements: "",
  };

  // Project type distribution
  projectTypeDistribution = [
    { name: "Commercial", percentage: 45, color: "primary" },
    { name: "E-Learning", percentage: 25, color: "success" },
    { name: "Corporate", percentage: 15, color: "info" },
    { name: "IVR System", percentage: 10, color: "warning" },
    { name: "Other", percentage: 5, color: "danger" },
  ];

  // Selected project for details
  selectedProject: Project | null = null;

  showFilters = true;
  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  // View project details
  viewProjectDetails(project: Project): void {
    this.selectedProject = project;
    // In a real app, you would use Angular Material or NgBootstrap to show the modal
  }

  // Create new request
  createRequest(): void {
    console.log("Creating request:", this.newRequest);
    // In a real app, you would send this to your backend

    // Reset form
    this.newRequest = {
      title: "",
      type: "Commercial",
      description: "",
      budget: null,
      dueDate: "",
      requirements: "",
    };
  }

  // Apply to become a speaker
  applyAsSpeaker(): void {
    console.log("Applying as speaker");
    // In a real app, you would navigate to the application form or open a modal
  }

  // View speaker profile
  viewSpeakerProfile(speakerId: string): void {
    console.log("Viewing speaker profile:", speakerId);
    // In a real app, you would navigate to the speaker's profile page
  }

  // Cancel project
  cancelProject(projectId: string): void {
    console.log("Cancelling project:", projectId);
    // In a real app, you would update the project status
  }

  // View request details
  viewRequestDetails(requestId: string): void {
    console.log("Viewing request details:", requestId);
    // In a real app, you would navigate to the request details page or open a modal
  }

  // Edit request
  editRequest(requestId: string): void {
    console.log("Editing request:", requestId);
    // In a real app, you would navigate to the edit request page or open a modal
  }

  // Cancel request
  cancelRequest(requestId: string): void {
    console.log("Cancelling request:", requestId);
    // In a real app, you would update the request status
  }
}
