import { Component, ViewChild, OnInit } from '@angular/core';
import { toggleAnimation } from 'src/app/shared/animations';
import Swal from 'sweetalert2';
import { NgxCustomModalComponent } from 'ngx-custom-modal';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UsersService } from '../../app/service/users.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { NotificationService } from '../service/notification.service';

@Component({
    templateUrl: './contacts.html',
    animations: [toggleAnimation],
})
export class ContactsComponent implements OnInit {
    users: { uuid: string; imageUrl?: SafeUrl }[] = [];
    editedUser: any = null;
    selectedFile: File | null = null;
    newUser = {
        nom: '',
        prenom: '',
        email: '',
        paymentemail:'',
        motDePasse: '',
        phone: '',
        username: '',
        role: '', // 'ADMIN', 'CLIENT', or 'SPEAKER'
        roleAdmin: '', // 'SUPER_ROLE' or 'VISITOR'
        provider: '',
        companyName: '',
        providerId: '',
        balance: null,
        fidilite: null,
        earnings: null,
        verified: false,
        photo: null
    };

    // Filter settings
    selectedRoleFilter: string = 'ALL'; // Default to showing all roles

    constructor(public fb: FormBuilder, private usersService: UsersService, private sanitizer: DomSanitizer, private notificationService: NotificationService) {}

    displayType = 'list';
    @ViewChild('addContactModal') addContactModal!: NgxCustomModalComponent;
    params!: FormGroup;
    allUsersList: any[] = []; // Store all users
    filterdContactsList: any[] = []; // Store filtered users based on search
    searchUser = '';

    // Initialize the form group
    initForm() {
        this.params = this.fb.group({
            id: [0],
            nom: ['', Validators.required],
            prenom: ['', Validators.required],
            email: ['', Validators.compose([Validators.required, Validators.email])],
            motDePasse: ['', Validators.required],
            phone: ['', Validators.required],
            username: ['', Validators.required],
            role: ['', Validators.required],
            paymentemail: [''],
            roleAdmin: [''],
            provider: [''],
            providerId: [''],
            companyName: [''],
            balance: [null],
            fidilite: [null],
            earnings: [null],
            verified: [false],
            photo: [''],
        });
    }

    // OnInit lifecycle hook
    ngOnInit() {
        this.loadUsers();
        this.initForm();
    }

    // Load all users from the backend
    loadUsers() {
        this.usersService.getUsers().subscribe(
            (users) => {
                this.allUsersList = users;
                // Process each user to fetch their image
                this.allUsersList.forEach((user: { photo: any; }) => {
                    if (user.photo) {
                        this.fetchUserImage(user);
                    }
                });
                // Initial load - show all users with filters applied
                this.applyFilters();
            },
            (error) => {
                this.showMessage('Error loading users from backend.', 'error');
            }
        );
    }

    // Filter by role
    filterByRole(role: string) {
        this.selectedRoleFilter = role;
        this.applyFilters();
    }

    // Apply all filters (search term and role)
    applyFilters() {
        // Start with all users
        let filteredResults = [...this.allUsersList];

        // Apply role filter if not 'ALL'
        if (this.selectedRoleFilter !== 'ALL') {
            filteredResults = filteredResults.filter(user =>
                user.role === this.selectedRoleFilter
            );
        }

        // Apply search filter if there's a search term
        if (this.searchUser && this.searchUser.trim() !== '') {
            const searchTerm = this.searchUser.toLowerCase().trim();
            filteredResults = filteredResults.filter(user => {
                return (
                    (user.nom && user.nom.toLowerCase().includes(searchTerm)) ||
                    (user.prenom && user.prenom.toLowerCase().includes(searchTerm)) ||
                    (user.email && user.email.toLowerCase().includes(searchTerm)) ||
                    (user.username && user.username.toLowerCase().includes(searchTerm)) ||
                    (user.phone && user.phone.toLowerCase().includes(searchTerm)) ||
                    (user.role && user.role.toLowerCase().includes(searchTerm)) ||
                    (user.company_name && user.company_name.toLowerCase().includes(searchTerm))
                );
            });
        }

        // Update the filtered list
        this.filterdContactsList = filteredResults;
    }

    // Search contacts - now will trigger applyFilters
    searchContacts() {
        this.applyFilters();
    }

    // Get user count by role
    getUserCountByRole(role: string): number {
        if (role === 'ALL') {
            return this.allUsersList.length;
        }
        return this.allUsersList.filter(user => user.role === role).length;
    }

    // Open the modal to edit or add a user
    editUser(user: any = null) {
        if (user) {
            // Clone the user object to avoid modifying the original while editing
            this.editedUser = { ...user };
        } else {
            // Reset the edited user (cancel editing)
            this.editedUser = null;
            // If you still want to allow adding new users via modal
            this.addContactModal.open();
            this.initForm();
        }
    }

    onFileSelected(event: any) {
        const file = event.target.files[0];
        this.selectedFile = file;

        if (file && this.editedUser?.uuid) {
            const formData = new FormData();
            formData.append('file', file);

            // Use UUID instead of ID
            this.usersService.uploadUserImage(this.editedUser.uuid, formData).subscribe({
                next: (response) => {
                    console.log('Photo uploaded successfully');
                    // Refresh the user list
                    this.loadUsers();
                },
                error: (error) => {
                    console.error('Error uploading photo:', error);
                }
            });
        }
    }

    // Save a new user or update an existing one
    saveUser() {
        if (this.editedUser) {
            // Handle updating from inline edit
            this.updateUser();
        } else {
            // Existing modal save logic
            if (this.params.controls['nom'].errors) {
                this.showMessage('Name (Nom) is required.', 'error');
                return;
            }
            // ... rest of your validation

            const user = this.params.value;
            if (user.id) {
                // Update user
                this.usersService.updateUser(user).subscribe(
                    // ... existing code
                );
            } else {
                // Add new user
                this.usersService.addUser(user).subscribe(
                    // ... existing code
                );
            }
        }
    }

    // Delete a user
    deleteUser(user: any) {
        this.usersService.deleteUser(user.id).subscribe(
            () => {
                this.showMessage('User has been deleted successfully.');
                this.loadUsers(); // Reload the user list
            },
            (error) => {
                this.showMessage('Error deleting user.', 'error');
            }
        );
    }

    // Show a toast message
    showMessage(msg = '', type = 'success') {
        const toast: any = Swal.mixin({
            toast: true,
            position: 'top',
            showConfirmButton: false,
            timer: 3000,
            customClass: { container: 'toast' },
        });
        toast.fire({
            icon: type,
            title: msg,
            padding: '10px 20px',
        });
    }

    fetchUserImage(user: any) {
        this.usersService.getUserImage(user.uuid).subscribe(
            (blob: Blob) => {
                // Convert the Blob into a URL string
                const imageUrl = URL.createObjectURL(blob);

                // Sanitize the URL
                const safeUrl: SafeUrl = this.sanitizer.bypassSecurityTrustUrl(imageUrl);

                // Update the user object directly
                user.imageUrl = safeUrl;
            },
            (error) => {
                console.error('Error fetching image:', error);
            }
        );
    }

    updateUser() {
        if (!this.editedUser) return;

        // First update the user details
        this.usersService.updateUser(this.editedUser).subscribe(
            () => {
                // If there's a selected file, upload it
                if (this.selectedFile && this.editedUser.uuid) {
                    const formData = new FormData();
                    formData.append('file', this.selectedFile);

                    this.usersService.uploadUserImage(this.editedUser.uuid, formData).subscribe(
                        () => {
                            this.showMessage('User and image updated successfully.');
                            this.cancelEdit();
                            this.loadUsers(); // Reload the user list
                        },
                        (error) => {
                            this.showMessage('User updated but image upload failed.', 'error');
                            this.cancelEdit();
                            this.loadUsers(); // Reload the user list
                        }
                    );
                } else {
                    this.showMessage('User has been updated successfully.');
                    this.cancelEdit();
                    this.loadUsers(); // Reload the user list
                }
            },
            (error) => {
                this.showMessage('Error updating user.', 'error');
            }
        );
    }

    cancelEdit() {
        this.editedUser = null;
        this.selectedFile = null;
    }

    // Modified addUser2 method
    addUser2() {
        if (this.params.invalid) {
            this.showMessage('Please fill all required fields correctly.', 'error');
            return;
        }

        // Get form values
        const userData = this.params.value;
        console.log('Form data to be sent:', userData);

        // Create a new FormData object if there's a photo
        let photoFile: File | null = null;
        if (userData.photo instanceof File) {
            photoFile = userData.photo;
            // Remove photo from userData since we'll upload it separately
            delete userData.photo;
        }

        // Determine which API endpoint to use based on role
        if (userData.role === 'CLIENT') {
            this.usersService.createClient(userData).subscribe(
                (response) => {
                    console.log('Client created:', response);
                    this.showMessage('Client has been created successfully.');
                    this.addContactModal.close();
                    this.loadUsers(); // Refresh the list
                },
                (error) => {
                    console.error('Error creating client:', error);
                    this.showMessage('Error creating client. Please try again.', 'error');
                }
            );
        } else if (userData.role === 'SPEAKER') {
            this.usersService.createSpeaker(userData).subscribe(
                (response) => {
                    console.log('Speaker created:', response);
                    this.showMessage('Speaker has been created successfully.');
                    this.addContactModal.close();
                    this.loadUsers(); // Refresh the list
                },
                (error) => {
                    console.error('Error creating speaker:', error);
                    this.showMessage('Error creating speaker. Please try again.', 'error');
                }
            );
        } else if (userData.role === 'ADMIN') {
            this.usersService.createAdmin(userData).subscribe(
                (response) => {
                    console.log('Admin created:', response);
                    this.showMessage('Admin has been created successfully.');
                    this.addContactModal.close();
                    this.loadUsers(); // Refresh the list
                },
                (error) => {
                    console.error('Error creating admin:', error);
                    this.showMessage('Error creating admin. Please try again.', 'error');
                }
            );
        } else {
            this.showMessage('Please select a valid role.', 'error');
        }
    }

    uploadPhotoIfNeeded(userId: string, photoFile: File | null) {
        if (photoFile) {
            const formData = new FormData();
            formData.append('file', photoFile);

            this.usersService.uploadUserImage(userId, formData).subscribe(
                () => {
                    console.log('Photo uploaded successfully');
                },
                (error) => {
                    console.error('Error uploading photo:', error);
                    this.showMessage('User created but photo upload failed.', 'warning');
                }
            );
        }
    }
}
