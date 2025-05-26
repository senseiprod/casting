import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { toggleAnimation } from 'src/app/shared/animations';
import { AudioService } from '../service/audio.service';
import { NgxCustomModalComponent } from 'ngx-custom-modal';
import { UsersService } from '../service/users.service';
import { environment } from 'src/environments/environment';



interface Speaker {
    uuid: string;
    nom: string;
}

interface VoiceUrl {
  id: string;
  name: string;
  type: string;
  voice_engine: string;
}

interface Voice {
  uuid: string;
  code: string;
  speakerUuid: string;
  nombrePoint: number;
  gender?: string;
  language?: string;
  name?: string;
  price?: number;
  age?: number;
  accent?: string;
  style?: string;
  elevenlabs_id: string;
  parsedUrl?: VoiceUrl | null;
  previewUrl?: string;
}

@Component({
  selector: 'app-create-voice',
  templateUrl: 'voice.html',
  animations: [toggleAnimation],
})
export class CreateVoiceComponent implements OnInit {

    @ViewChild('newSpeakerModal') newSpeakerModal!: NgxCustomModalComponent;

    private baseUrl = environment.apiUrl;

  voiceForm: FormGroup;
  synthesizeForm: FormGroup;
  speakerForm: FormGroup = new FormGroup({
    prenom: new FormControl('', Validators.required),
    nom: new FormControl('', Validators.required),
    username: new FormControl('', Validators.required),
    email: new FormControl('', [Validators.required, Validators.email]),
    company_name: new FormControl('', Validators.required),
    motDePasse: new FormControl('', Validators.required),
    phone: new FormControl('', Validators.required),
    role: new FormControl('SPEAKER', Validators.required),
  });
  selectedSpeakerFile: File | null = null;
  file: File | null = null;
  loading: boolean = false;
  voices: Voice[] = [];
  selectedVoice: Voice | null = null;
  speakers: Speaker[] = [];
  speaker: any;
  singleSpeaker: any;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private toastr: ToastrService,
    private audioService: AudioService,
    private usersService: UsersService
  ) {

    this.speakerForm = this.fb.group({
        prenom: ['', Validators.required],
        nom: ['', Validators.required],
        username: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        company_name: [''],
        motDePasse: ['', Validators.required],
        phone: [''],
        role: ['SPEAKER'],
      });
    // Updated form to match new endpoint parameters
    this.voiceForm = this.fb.group({
      name: ['', Validators.required],
      id: ['', [Validators.required, Validators.pattern('^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$')]],

      gender: ['', Validators.required],
      language: ['', Validators.required],
      price: ['', [Validators.required, Validators.min(0)]],
      removeBackgroundNoise: [false], // Default to false
      description: ['', Validators.required],
      labels: [''], // Optional,
      accent: ['', Validators.required],
      age: ['', Validators.required],
      style: ['', Validators.required],
    });

    this.synthesizeForm = this.fb.group({
        text: ['', Validators.required],
        output_format: ['pcm_44100'],
        stability: [0.5],
        similarity_boost: [0.75],
        style_guidance: [0.5],
        use_speaker_boost: [true]
    });

    // // Initialize the new speaker form
    // this.speakerForm = this.fb.group({
    //     nom: ['', Validators.required],
    //     prenom: ['', Validators.required],
    //     email: ['', [Validators.required, Validators.email]],
    //     motDePasse: ['', Validators.required],
    //     phone: ['', Validators.required],
    //     username: ['', Validators.required],
    //     role: ['SPEAKER'], // Default to SPEAKER
    //     company_name: [''],
    //     photo: [null]
    //   });
    }


    // Add new method to open the modal
  openAddSpeakerModal(): void {
    // Reset the form first
    if (this.speakerForm) {
      this.speakerForm.reset({
        role: 'SPEAKER' // Make sure the role is set to SPEAKER
      });
    }
    this.selectedSpeakerFile = null;

    // Open the modal
    this.newSpeakerModal.open();
  }


  // Add method to handle file selection for speaker photo
  onSpeakerFileSelected(event: any): void {
    if (event.target.files && event.target.files.length > 0) {
      this.selectedSpeakerFile = event.target.files[0];
    }
  }

  // Add method to create new speaker
  addNewSpeaker(): void {
    if (!this.speakerForm || this.speakerForm.invalid) {
      this.toastr.error('Please fill all required fields correctly.');
      return;
    }

    const speakerData = this.speakerForm.value;

    // Always set to SPEAKER role
    speakerData.role = 'SPEAKER';

    this.loading = true;

    // Use the UsersService to create a new speaker
    this.usersService.createSpeaker(speakerData).subscribe(
      (response: any) => {
        // Handle successful creation
        this.toastr.success('Speaker created successfully!');

        // If there's a photo, upload it
        if (this.selectedSpeakerFile && response.uuid) {
          const formData = new FormData();
          formData.append('file', this.selectedSpeakerFile);

          this.usersService.uploadUserImage(response.uuid, formData).subscribe(
            () => {
              console.log('Speaker photo uploaded successfully');
            },
            (error: any) => {
              console.error('Error uploading speaker photo:', error);
              this.toastr.warning('Speaker created but photo upload failed.');
            }
          );
        }

        // Add the new speaker to the speakers array
        const newSpeaker: Speaker = {
          uuid: response.uuid,
          nom: `${speakerData.prenom} ${speakerData.nom}` // Combine first and last name
        };

        this.speakers.push(newSpeaker);

        // Select the newly created speaker in the dropdown
        this.voiceForm.get('id')?.setValue(newSpeaker.uuid);

        // Close the modal
        this.newSpeakerModal.close();
        this.loading = false;
      },
      (error: any) => {
        this.loading = false;
        console.error('Error creating speaker:', error);
        this.toastr.error('Failed to create speaker. Please try again.');
      }
    );
  }




  ngOnInit(): void {
    this.fetchSpeakers();
    this.fetchVoices();
  }

  fetchVoicePreview(elevenlabsId: string): void {
    if (!elevenlabsId) return;

    this.http.get<any>(`${this.baseUrl}/api/elevenlabs/voices/${elevenlabsId}`).subscribe(
      response => {
        const voiceIndex = this.voices.findIndex(v => v.elevenlabs_id === elevenlabsId);
        if (voiceIndex !== -1) {
          this.voices[voiceIndex].previewUrl = response.preview_url;
        }
      },
      error => {
        console.error(`Error fetching preview for voice ${elevenlabsId}:`, error);
      }
    );
  }



  fetchSpeakers(): void {
    this.http.get(`${this.baseUrl}/api/speakers`).subscribe(
      (data: any) => {
        this.speakers = data;
      },
      (error: any) => {
        console.error('Error fetching speakers:', error);
      }
    );
  }

  deleteVoice(id: string): void {
    if (confirm('Are you sure you want to delete this voice? This action cannot be undone.')) {
      this.http.delete(`${this.baseUrl}/api/voix2/delete/${id}`).subscribe(
        () => {
          this.toastr.success('Voice deleted successfully');
          this.fetchVoices(); // Refresh the voice list
        },
        error => {
          console.error('Error deleting voice:', error);
          this.toastr.error('Failed to delete voice');
        }
      );
    }
  }

  onSpeakerChange(event: any): void {
    const selectedSpeakerId = event.target.value;
    console.log('Selected Speaker ID:', selectedSpeakerId);
    this.voiceForm.get('id')?.setValue(selectedSpeakerId);
  }

  onFileChange(event: any): void {
    console.log('File change event:', event);

    if (event.target.files && event.target.files.length > 0) {
      this.file = event.target.files[0];
      console.log('Selected file:', this.file);

      // Update the label with the selected file name
      const fileNameSpan = document.querySelector('.file-name');
      if (fileNameSpan && this.file) {
        fileNameSpan.textContent = this.file.name;
      }
    }
  }

  submitForm(): void {
    // if (this.voiceForm.invalid || !this.file) {
    //   this.toastr.error('Please fill all required fields and select a file.');
    //   return;
    // }
    console.log('Form values:', this.voiceForm.value);

    const formData = new FormData();
    if (this.file) {
        formData.append('files', this.file);
      }
    formData.append('name', this.voiceForm.value.name);
    formData.append('id', this.voiceForm.value.id);
    formData.append('gender', this.voiceForm.value.gender);
    formData.append('language', this.voiceForm.value.language);
    formData.append('price', this.voiceForm.value.price.toString());
    formData.append('removeBackgroundNoise', this.voiceForm.value.removeBackgroundNoise.toString());
    formData.append('description', this.voiceForm.value.description);
    formData.append('accent', this.voiceForm.value.accent);
    formData.append('age', this.voiceForm.value.age);
    formData.append('style', this.voiceForm.value.style);

    // Only append labels if they exist
    if (this.voiceForm.value.labels) {
      formData.append('labels', this.voiceForm.value.labels);
    }

    console.log("Form Data:", formData);

     // Log each field's value and validity state
  Object.keys(this.voiceForm.controls).forEach(key => {
    const control = this.voiceForm.get(key);
    console.log(`Field: ${key}, Value: ${control?.value}, Valid: ${control?.valid}, Errors:`, control?.errors);
  });

    this.loading = true;
    this.http.post<any>(`${this.baseUrl}/api/voix2/create`, formData).subscribe(
      response => {
        this.loading = false;
        this.toastr.success('Voice created successfully!');
        this.fetchVoices(); // Refresh voices after adding a new one
        this.resetForm();
      },
      error => {
        this.loading = false;
        console.error('Error creating voice:', error);
        this.toastr.error('Failed to create voice. Please try again.');
      }
    );
  }

  resetForm(): void {
    this.voiceForm.reset({
      removeBackgroundNoise: false
    });
    this.file = null;
    const fileNameSpan = document.querySelector('.file-name');
    if (fileNameSpan) {
      fileNameSpan.textContent = 'Choose a file or drag it here';
    }
  }

  // The rest of the methods remain unchanged
  fetchVoices(): void {
    this.http.get<Voice[]>(`${this.baseUrl}/api/voix2/all`).subscribe(
      data => {
        console.log('Received voice data:', data);
        this.voices = data.map(voice => ({
          ...voice,
        }));



        // Fetch preview URLs for each voice
        this.voices.forEach(voice => {
          if (voice.elevenlabs_id) {
            this.fetchVoicePreview(voice.elevenlabs_id);
          }
        });
      },
      error => {
        this.toastr.error('Failed to fetch voices.');
      }
    );
  }

  playPreview(previewUrl: string): void {
    if (!previewUrl) {
      this.toastr.error('No preview available for this voice');
      return;
    }

    // Create and play audio element
    const audio = new Audio(previewUrl);
    audio.play().catch(error => {
      console.error('Error playing audio:', error);
      this.toastr.error('Failed to play preview audio');
    });
  }


  parseUrl(urlString: string): VoiceUrl | null {
    try {
      return JSON.parse(urlString);
    } catch (e) {
      return null;
    }
  }

  onSynthesizeClick(voice: Voice): void {
    this.selectedVoice = voice;
    this.synthesizeForm.patchValue({
      text: '',
      output_format: 'mp3_44100_128',
      stability: 0.5,
      similarity_boost: 0.75,
      style_guidance: 0.5,
      use_speaker_boost: true
    });
  }

  synthesizeSpeech(): void {
    if (!this.selectedVoice) {
      this.toastr.error('Please select a voice first.');
      return;
    }

    const formValues = this.synthesizeForm.value;

    // Create the request body with the text and other parameters
    const requestBody = {
      text: formValues.text || '',
      model_id: "eleven_multilingual_v2",
      voice_settings: {
        stability: formValues.stability ? parseFloat(formValues.stability) : 0.5,
        similarity_boost: formValues.similarity_boost ? parseFloat(formValues.similarity_boost) : 0.75,
        style: formValues.style_guidance ? parseFloat(formValues.style_guidance) : 0.5,
        use_speaker_boost: formValues.use_speaker_boost !== undefined ? formValues.use_speaker_boost : true
      }
    };

    // Set up the URL parameters
    const outputFormat = formValues.output_format || 'mp3_44100_128';
    const enableLogging = true;
    const optimizeStreamingLatency = 0;

    // Construct the API URL with the voice ID and parameters
    const apiUrl = `${this.baseUrl}/api/elevenlabs/text-to-speech/${this.selectedVoice.elevenlabs_id}?output_format=${outputFormat}&enable_logging=${enableLogging}&optimize_streaming_latency=${optimizeStreamingLatency}`;

    console.log('Synthesize Speech URL:', apiUrl);
    console.log('Synthesize Speech Request Body:', requestBody);

    this.http.post(apiUrl, requestBody, { responseType: 'arraybuffer' }).subscribe(
      (response: ArrayBuffer) => {
        // Create a blob from the response
        const blob = new Blob([response], { type: this.getContentType(outputFormat) });

        // Play the audio
        const audioElement = document.createElement('audio');
        audioElement.src = URL.createObjectURL(blob);
        audioElement.controls = true;

        const audioContainer = document.getElementById('audio-container');
        if (audioContainer) {
          audioContainer.innerHTML = '';
          audioContainer.appendChild(audioElement);
        }

        // Save the generated audio if we have speakerUuid
        if (this.selectedVoice && this.selectedVoice.speakerUuid) {
          // Create a file from the blob with a meaningful name
          const textPreview = formValues.text ? formValues.text.substring(0, 20) + '...' : 'synthesis';
          const fileName = `generated_${this.selectedVoice.name || 'voice'}_${new Date().getTime()}.${this.getFileExtension(outputFormat)}`;
          const audioFile = new File([blob], fileName, { type: this.getContentType(outputFormat) });

          // Use the AudioService to upload the generated audio
          this.audioService.uploadGeneratedAudio(
            audioFile,
            this.getContentType(outputFormat),
            this.selectedVoice.speakerUuid
          ).subscribe(
            (response: any) => {
              console.log('Audio saved successfully:', response);
              this.toastr.success('Audio saved to the database.');
            },
            (error: any) => {
              console.error('Error saving audio:', error);
              this.toastr.error('Failed to save audio to the database.');
            }
          );
        } else {
          this.toastr.warning('Could not save audio: speaker UUID is missing.');
        }

        this.toastr.success('Speech synthesized successfully!');
      },
      error => {
        console.error('Synthesis Error:', error);
        this.toastr.error('Failed to synthesize speech.');
      }
    );
  }

  // Helper method to determine the content type based on output format
  private getContentType(outputFormat: string): string {
    if (outputFormat.startsWith('mp3')) {
      return 'audio/mp3';
    } else if (outputFormat.startsWith('wav')) {
      return 'audio/wav';
    } else if (outputFormat.startsWith('ogg')) {
      return 'audio/ogg';
    } else {
      return 'audio/mp3'; // Default
    }
  }

  // Helper method to determine the file extension based on output format
  private getFileExtension(outputFormat: string): string {
    if (outputFormat.startsWith('mp3')) {
      return 'mp3';
    } else if (outputFormat.startsWith('wav')) {
      return 'wav';
    } else if (outputFormat.startsWith('ogg')) {
      return 'ogg';
    } else {
      return 'mp3'; // Default
    }
  }
}
