import { Component, type OnInit, type AfterViewInit, ViewChild, type ElementRef } from "@angular/core"
import { Calendar } from "@fullcalendar/core"
import dayGridPlugin from "@fullcalendar/daygrid"
import timeGridPlugin from "@fullcalendar/timegrid"
import interactionPlugin from "@fullcalendar/interaction"

interface Event {
  id: string
  title: string
  start: string
  end?: string
  allDay?: boolean
  classNames?: string[]
  backgroundColor?: string
  display?: string
  extendedProps?: {
    client: string
    type: "recording" | "meeting" | "deadline" | "other"
    description?: string
    location?: string
  }
}

interface TimeOff {
  id: string
  type: "vacation" | "sick" | "personal" | "other"
  startDate: string
  endDate: string
  notes?: string
}

interface UpcomingEvent {
  id: string
  title: string
  client: string
  type: "recording" | "meeting" | "deadline" | "other"
  startTime: string
  endTime?: string
  date: string
  daysLeft?: number
}
@Component({
  selector: 'app-shedule',
  templateUrl: './shedule.component.html',
  styleUrls: ['./shedule.component.css']
})
export class ScheduleComponent implements OnInit, AfterViewInit {
  @ViewChild("calendar") calendarEl!: ElementRef

  // Filter values
  eventTypeFilter = ""
  clientFilter = ""
  dateFilter = "all"
  searchFilter = ""

  // Form values
  newEvent = {
    title: "",
    type: "recording",
    client: "",
    project: "",
    startDate: "",
    endDate: "",
    location: "",
    description: "",
    reminder: false,
    reminderTime: "30",
    reminderMethod: "email",
  }

  newTimeOff = {
    type: "vacation",
    startDate: "",
    endDate: "",
    notes: "",
  }

  // Working hours
  workingHours = [
    { days: "Monday - Friday", start: "9:00 AM", end: "5:00 PM" },
    { days: "Saturday", start: "10:00 AM", end: "2:00 PM" },
  ]

  // Time off periods
  timeOffPeriods: TimeOff[] = [
    {
      id: "to-001",
      type: "vacation",
      startDate: "2023-04-30",
      endDate: "2023-05-05",
      notes: "Annual vacation",
    },
  ]

  // Calendar events
  events: Event[] = [
    {
      id: "evt-001",
      title: "Product Launch Video Recording",
      start: "2023-04-22T10:00:00",
      end: "2023-04-22T12:00:00",
      classNames: ["fc-event-recording"],
      extendedProps: {
        client: "Acme Corporation",
        type: "recording",
        location: "Studio A",
        description: "Record the voiceover for the new product launch video",
      },
    },
    {
      id: "evt-002",
      title: "Project Kickoff Meeting",
      start: "2023-04-23T14:00:00",
      end: "2023-04-23T15:00:00",
      classNames: ["fc-event-meeting"],
      extendedProps: {
        client: "TechStart Inc.",
        type: "meeting",
        location: "Zoom Call",
        description: "Initial meeting to discuss project requirements",
      },
    },
    {
      id: "evt-003",
      title: "E-Learning Module Submission",
      start: "2023-04-25",
      classNames: ["fc-event-deadline"],
      extendedProps: {
        client: "EduLearn Platform",
        type: "deadline",
        description: "Final submission deadline for the science course narration",
      },
    },
    {
      id: "evt-004",
      title: "Voice Acting Workshop",
      start: "2023-04-28T09:00:00",
      end: "2023-04-28T17:00:00",
      classNames: ["fc-event-other"],
      extendedProps: {
        client: "Voice Artist Association",
        type: "other",
        location: "Downtown Conference Center",
        description: "Annual workshop on voice acting techniques",
      },
    },
    {
      id: "evt-005",
      title: "Vacation",
      start: "2023-04-30",
      end: "2023-05-06",
      display: "background",
      backgroundColor: "rgba(203, 16, 37, 0.2)",
    },
  ]

  // Upcoming events (calculated from events)
  upcomingEvents: UpcomingEvent[] = []

  // Calendar instance
  private calendar: Calendar | null = null

  constructor() {}

  ngOnInit(): void {
    // Calculate upcoming events from the events array
    this.calculateUpcomingEvents()

    // Set default dates for new event
    const today = new Date()
    const formattedDate = today.toISOString().split("T")[0]
    const formattedTime = "09:00"
    this.newEvent.startDate = `${formattedDate}T${formattedTime}`
    this.newEvent.endDate = `${formattedDate}T10:00`
  }

  ngAfterViewInit(): void {
    this.initializeCalendar()
  }

  // Initialize FullCalendar
  initializeCalendar(): void {
    if (this.calendarEl && this.calendarEl.nativeElement) {
      this.calendar = new Calendar(this.calendarEl.nativeElement, {
        plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
        initialView: "dayGridMonth",
        headerToolbar: {
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay",
        },
        events: this.events,
        eventClick: this.handleEventClick.bind(this),
        dateClick: this.handleDateClick.bind(this),
      })
      this.calendar.render()
    }
  }

  // Handle event click
  handleEventClick(info: any): void {
    // Show event details or edit modal
    alert("Event: " + info.event.title)
    // In a real app, you would open a modal with event details
  }

  // Handle date click
  handleDateClick(info: any): void {
    // Set the selected date in the form
    const dateStr = info.dateStr
    this.newEvent.startDate = `${dateStr}T09:00`
    this.newEvent.endDate = `${dateStr}T10:00`

    // Open add event modal
    // In a real Angular app, you would use a service or direct method call
    // This is a workaround for the demo
    const addEventModal = document.getElementById("addEventModal")
    if (addEventModal) {
      // @ts-ignore
      const bootstrapModal = new bootstrap.Modal(addEventModal)
      bootstrapModal.show()
    }
  }

  // Calculate upcoming events from the events array
  calculateUpcomingEvents(): void {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    this.upcomingEvents = this.events
      .filter((event) => {
        // Filter out background events and past events
        if (event.display === "background") return false
        const eventDate = new Date(event.start)
        return eventDate >= today
      })
      .map((event) => {
        const startDate = new Date(event.start)
        const endDate = event.end ? new Date(event.end) : undefined

        // Calculate days left for deadlines
        let daysLeft
        if (event.extendedProps?.type === "deadline") {
          const timeDiff = startDate.getTime() - today.getTime()
          daysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24))
        }

        // Format date and time
        const dateOptions: Intl.DateTimeFormatOptions = { month: "short", day: "numeric", year: "numeric" }
        const timeOptions: Intl.DateTimeFormatOptions = { hour: "numeric", minute: "2-digit", hour12: true }

        const formattedDate = startDate.toLocaleDateString("en-US", dateOptions)
        const formattedStartTime = startDate.toLocaleTimeString("en-US", timeOptions)
        const formattedEndTime = endDate ? endDate.toLocaleTimeString("en-US", timeOptions) : undefined

        // Determine if it's today or tomorrow
        let displayDate = formattedDate
        const tomorrow = new Date(today)
        tomorrow.setDate(tomorrow.getDate() + 1)

        if (startDate.toDateString() === today.toDateString()) {
          displayDate = "Today"
        } else if (startDate.toDateString() === tomorrow.toDateString()) {
          displayDate = "Tomorrow"
        }

        return {
          id: event.id,
          title: event.title,
          client: event.extendedProps?.client || "",
          type: event.extendedProps?.type || "other",
          startTime: formattedStartTime,
          endTime: formattedEndTime,
          date: displayDate,
          daysLeft,
        }
      })
      .sort((a, b) => {
        // Sort by date (today, tomorrow, then other dates)
        if (a.date === "Today" && b.date !== "Today") return -1
        if (a.date !== "Today" && b.date === "Today") return 1
        if (a.date === "Tomorrow" && b.date !== "Tomorrow" && b.date !== "Today") return -1
        if (a.date !== "Tomorrow" && a.date !== "Today" && b.date === "Tomorrow") return 1
        return 0
      })
      .slice(0, 5) // Limit to 5 upcoming events
  }

  // Add new event
  addEvent(): void {
    console.log("Adding event:", this.newEvent)
    // In a real app, you would save the event to a database
    // and update the calendar

    // Reset form
    this.newEvent = {
      title: "",
      type: "recording",
      client: "",
      project: "",
      startDate: "",
      endDate: "",
      location: "",
      description: "",
      reminder: false,
      reminderTime: "30",
      reminderMethod: "email",
    }
  }

  // Add time off
  addTimeOff(): void {
    console.log("Adding time off:", this.newTimeOff)
    // In a real app, you would save the time off to a database
    // and update the calendar

    // Reset form
    this.newTimeOff = {
      type: "vacation",
      startDate: "",
      endDate: "",
      notes: "",
    }
  }

  // Toggle reminder options visibility
  toggleReminderOptions(): void {
    this.newEvent.reminder = !this.newEvent.reminder
  }

  // Edit working hours
  editWorkingHours(index: number): void {
    console.log("Editing working hours:", this.workingHours[index])
    // In a real app, you would open a modal to edit working hours
  }

  // Delete time off
  deleteTimeOff(id: string): void {
    console.log("Deleting time off:", id)
    // In a real app, you would delete the time off from the database
    // and update the UI
  }

  // Edit event
  editEvent(id: string): void {
    console.log("Editing event:", id)
    // In a real app, you would open a modal with the event details
  }

  // Delete event
  deleteEvent(id: string): void {
    console.log("Deleting event:", id)
    // In a real app, you would delete the event from the database
    // and update the calendar
  }
}

