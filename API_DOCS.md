# API Documentation

> Generated from Swagger Specification

## Hospital Management API
The Hospital Patient Care Management System API
**Version:** 1.0

---

## App

### Endpoint

**Method:** `GET`  
**Path:** `/api/v1`  

#### Responses

- **200**: 

---

## auth

### Login user

**Method:** `POST`  
**Path:** `/api/v1/auth/login`  

#### Request Payload

**Content-Type:** `application/json`

- `email*`: **string** (e.g. admin@hospital.com)
- `password*`: **string** (e.g. password123)

#### Responses

- **200**: Return access and refresh tokens
- **401**: Invalid credentials

### Register new user

**Method:** `POST`  
**Path:** `/api/v1/auth/register`  

#### Request Payload

**Content-Type:** `application/json`

- `firstName*`: **string** (e.g. John)
- `lastName*`: **string** (e.g. Doe)
- `email*`: **string** (e.g. patient@example.com)
- `password*`: **string** (e.g. password123)
- `mobile*`: **string** (e.g. +1234567890)

#### Responses

- **201**: User successfully created
- **409**: Email already exists

### Get current user profile

**Method:** `GET`  
**Path:** `/api/v1/auth/profile`  
**Authentication:** Required

#### Responses

- **200**: 

---

## users (admin only)

### Create a new user with specific roles

**Method:** `POST`  
**Path:** `/api/v1/users`  
**Authentication:** Required

#### Request Payload

**Content-Type:** `application/json`

- `firstName*`: **string** (e.g. John)
- `lastName*`: **string** (e.g. Doe)
- `email*`: **string** (e.g. doctor@example.com)
- `password*`: **string** (e.g. password123)
- `mobile*`: **string** (e.g. +1234567890)
- `roles*`: **string[]** - Array of roles to assign to the new user (e.g. doctor)

#### Responses

- **201**: 

### Get all users

**Method:** `GET`  
**Path:** `/api/v1/users`  
**Authentication:** Required

#### Responses

- **200**: 

### Get a user by ID

**Method:** `GET`  
**Path:** `/api/v1/users/{id}`  
**Authentication:** Required

#### Parameters

| Name | In | Required | Type | Description |
|---|---|---|---|---|
| `id` | path | Yes | string |  |

#### Responses

- **200**: 

### Update a user (roles, status, details)

**Method:** `PATCH`  
**Path:** `/api/v1/users/{id}`  
**Authentication:** Required

#### Parameters

| Name | In | Required | Type | Description |
|---|---|---|---|---|
| `id` | path | Yes | string |  |

#### Request Payload

**Content-Type:** `application/json`

- `firstName`: **string** (e.g. John)
- `lastName`: **string** (e.g. Doe)
- `email`: **string** (e.g. doctor@example.com)
- `password`: **string** (e.g. password123)
- `mobile`: **string** (e.g. +1234567890)
- `roles`: **string[]** - Array of roles to assign to the new user (e.g. doctor)
- `isActive`: **boolean** (e.g. true)
- `isLocked`: **boolean**

#### Responses

- **200**: 

### Soft delete a user account

**Method:** `DELETE`  
**Path:** `/api/v1/users/{id}`  
**Authentication:** Required

#### Parameters

| Name | In | Required | Type | Description |
|---|---|---|---|---|
| `id` | path | Yes | string |  |

#### Responses

- **200**: 

---

## patients

### Create a new patient profile

**Method:** `POST`  
**Path:** `/api/v1/patients`  
**Authentication:** Required

#### Request Payload

**Content-Type:** `application/json`

- `userId*`: **string** - Linked User UUID (e.g. 123e4567-e89b-12d3-a456-426614174000)
- `dateOfBirth`: **string** (e.g. 1990-01-01)
- `gender`: **enum(MALE|FEMALE|OTHER)**
- `bloodGroup`: **enum(A+|A-|B+|B-|AB+|AB-|O+|O-)**
- `address`: **string**
- `medicalNotes`: **string**

#### Responses

- **201**: 

### Get all patients

**Method:** `GET`  
**Path:** `/api/v1/patients`  
**Authentication:** Required

#### Responses

- **200**: 

### Get a patient by ID

**Method:** `GET`  
**Path:** `/api/v1/patients/{id}`  
**Authentication:** Required

#### Parameters

| Name | In | Required | Type | Description |
|---|---|---|---|---|
| `id` | path | Yes | string |  |

#### Responses

- **200**: 

### Update a patient profile

**Method:** `PATCH`  
**Path:** `/api/v1/patients/{id}`  
**Authentication:** Required

#### Parameters

| Name | In | Required | Type | Description |
|---|---|---|---|---|
| `id` | path | Yes | string |  |

#### Request Payload

**Content-Type:** `application/json`

- `userId`: **string** - Linked User UUID (e.g. 123e4567-e89b-12d3-a456-426614174000)
- `dateOfBirth`: **string** (e.g. 1990-01-01)
- `gender`: **enum(MALE|FEMALE|OTHER)**
- `bloodGroup`: **enum(A+|A-|B+|B-|AB+|AB-|O+|O-)**
- `address`: **string**
- `medicalNotes`: **string**

#### Responses

- **200**: 

### Soft delete a patient profile

**Method:** `DELETE`  
**Path:** `/api/v1/patients/{id}`  
**Authentication:** Required

#### Parameters

| Name | In | Required | Type | Description |
|---|---|---|---|---|
| `id` | path | Yes | string |  |

#### Responses

- **200**: 

---

## doctors

### Create a new doctor profile

**Method:** `POST`  
**Path:** `/api/v1/doctors`  
**Authentication:** Required

#### Request Payload

**Content-Type:** `application/json`

- `userId*`: **string** - Linked User UUID (e.g. 123e4567-e89b-12d3-a456-426614174000)
- `specialization*`: **string** (e.g. Cardiology)
- `licenseNumber*`: **string** (e.g. LIC123456789)
- `experienceYears`: **number** (e.g. 10)
- `consultationFee`: **number** (e.g. 150)

#### Responses

- **201**: 

### Get all doctors

**Method:** `GET`  
**Path:** `/api/v1/doctors`  
**Authentication:** Required

#### Responses

- **200**: 

### Get a doctor by ID

**Method:** `GET`  
**Path:** `/api/v1/doctors/{id}`  
**Authentication:** Required

#### Parameters

| Name | In | Required | Type | Description |
|---|---|---|---|---|
| `id` | path | Yes | string |  |

#### Responses

- **200**: 

### Update a doctor profile

**Method:** `PATCH`  
**Path:** `/api/v1/doctors/{id}`  
**Authentication:** Required

#### Parameters

| Name | In | Required | Type | Description |
|---|---|---|---|---|
| `id` | path | Yes | string |  |

#### Request Payload

**Content-Type:** `application/json`

- `userId`: **string** - Linked User UUID (e.g. 123e4567-e89b-12d3-a456-426614174000)
- `specialization`: **string** (e.g. Cardiology)
- `licenseNumber`: **string** (e.g. LIC123456789)
- `experienceYears`: **number** (e.g. 10)
- `consultationFee`: **number** (e.g. 150)

#### Responses

- **200**: 

### Soft delete a doctor profile

**Method:** `DELETE`  
**Path:** `/api/v1/doctors/{id}`  
**Authentication:** Required

#### Parameters

| Name | In | Required | Type | Description |
|---|---|---|---|---|
| `id` | path | Yes | string |  |

#### Responses

- **200**: 

---

## staff

### Create a new staff profile

**Method:** `POST`  
**Path:** `/api/v1/staff`  
**Authentication:** Required

#### Request Payload

**Content-Type:** `application/json`

- `userId*`: **string** - Linked User UUID (e.g. 123e4567-e89b-12d3-a456-426614174000)
- `departmentId`: **string** - Department UUID (e.g. 123e4567-e89b-12d3-a456-426614174000)
- `jobTitle*`: **string** (e.g. Senior Nurse)
- `hireDate`: **string** (e.g. 2026-08-01)

#### Responses

- **201**: 

### Get all staff members

**Method:** `GET`  
**Path:** `/api/v1/staff`  
**Authentication:** Required

#### Responses

- **200**: 

### Get a staff member by ID

**Method:** `GET`  
**Path:** `/api/v1/staff/{id}`  
**Authentication:** Required

#### Parameters

| Name | In | Required | Type | Description |
|---|---|---|---|---|
| `id` | path | Yes | string |  |

#### Responses

- **200**: 

### Update a staff member profile

**Method:** `PATCH`  
**Path:** `/api/v1/staff/{id}`  
**Authentication:** Required

#### Parameters

| Name | In | Required | Type | Description |
|---|---|---|---|---|
| `id` | path | Yes | string |  |

#### Request Payload

**Content-Type:** `application/json`

- `userId`: **string** - Linked User UUID (e.g. 123e4567-e89b-12d3-a456-426614174000)
- `departmentId`: **string** - Department UUID (e.g. 123e4567-e89b-12d3-a456-426614174000)
- `jobTitle`: **string** (e.g. Senior Nurse)
- `hireDate`: **string** (e.g. 2026-08-01)

#### Responses

- **200**: 

### Delete a staff member profile

**Method:** `DELETE`  
**Path:** `/api/v1/staff/{id}`  
**Authentication:** Required

#### Parameters

| Name | In | Required | Type | Description |
|---|---|---|---|---|
| `id` | path | Yes | string |  |

#### Responses

- **200**: 

---

## departments

### Create a new department

**Method:** `POST`  
**Path:** `/api/v1/departments`  
**Authentication:** Required

#### Request Payload

**Content-Type:** `application/json`

- `name*`: **string** (e.g. Cardiology)
- `description`: **string** (e.g. Heart and blood vessel diseases)

#### Responses

- **201**: 

### Get all departments

**Method:** `GET`  
**Path:** `/api/v1/departments`  
**Authentication:** Required

#### Responses

- **200**: 

### Get a department by ID

**Method:** `GET`  
**Path:** `/api/v1/departments/{id}`  
**Authentication:** Required

#### Parameters

| Name | In | Required | Type | Description |
|---|---|---|---|---|
| `id` | path | Yes | string |  |

#### Responses

- **200**: 

### Update a department

**Method:** `PATCH`  
**Path:** `/api/v1/departments/{id}`  
**Authentication:** Required

#### Parameters

| Name | In | Required | Type | Description |
|---|---|---|---|---|
| `id` | path | Yes | string |  |

#### Request Payload

**Content-Type:** `application/json`

- `name`: **string** (e.g. Cardiology)
- `description`: **string** (e.g. Heart and blood vessel diseases)

#### Responses

- **200**: 

### Delete a department

**Method:** `DELETE`  
**Path:** `/api/v1/departments/{id}`  
**Authentication:** Required

#### Parameters

| Name | In | Required | Type | Description |
|---|---|---|---|---|
| `id` | path | Yes | string |  |

#### Responses

- **200**: 

---

## appointments

### Create a new appointment

**Method:** `POST`  
**Path:** `/api/v1/appointments`  
**Authentication:** Required

#### Request Payload

**Content-Type:** `application/json`

- `patientId*`: **string** - Patient UUID (e.g. 123e4567-e89b-12d3-a456-426614174000)
- `doctorId*`: **string** - Doctor UUID (e.g. 123e4567-e89b-12d3-a456-426614174000)
- `appointmentDate*`: **string** (e.g. 2026-08-15T10:00:00Z)
- `reason*`: **string** (e.g. Routine checkup)
- `notes`: **string** (e.g. Patient experiencing mild fever)

#### Responses

- **201**: 

### Get all appointments

**Method:** `GET`  
**Path:** `/api/v1/appointments`  
**Authentication:** Required

#### Responses

- **200**: 

### Get an appointment by ID

**Method:** `GET`  
**Path:** `/api/v1/appointments/{id}`  
**Authentication:** Required

#### Parameters

| Name | In | Required | Type | Description |
|---|---|---|---|---|
| `id` | path | Yes | string |  |

#### Responses

- **200**: 

### Update an appointment

**Method:** `PATCH`  
**Path:** `/api/v1/appointments/{id}`  
**Authentication:** Required

#### Parameters

| Name | In | Required | Type | Description |
|---|---|---|---|---|
| `id` | path | Yes | string |  |

#### Request Payload

**Content-Type:** `application/json`

- `patientId`: **string** - Patient UUID (e.g. 123e4567-e89b-12d3-a456-426614174000)
- `doctorId`: **string** - Doctor UUID (e.g. 123e4567-e89b-12d3-a456-426614174000)
- `appointmentDate`: **string** (e.g. 2026-08-15T10:00:00Z)
- `reason`: **string** (e.g. Routine checkup)
- `notes`: **string** (e.g. Patient experiencing mild fever)
- `status`: **enum(scheduled|completed|cancelled|no_show)**

#### Responses

- **200**: 

### Cancel an appointment (soft delete)

**Method:** `DELETE`  
**Path:** `/api/v1/appointments/{id}`  
**Authentication:** Required

#### Parameters

| Name | In | Required | Type | Description |
|---|---|---|---|---|
| `id` | path | Yes | string |  |

#### Responses

- **200**: 

---

## wards

### Create a new ward

**Method:** `POST`  
**Path:** `/api/v1/wards`  
**Authentication:** Required

#### Request Payload

**Content-Type:** `application/json`

- `name*`: **string** (e.g. ICU 1)
- `type*`: **string** (e.g. icu)
- `capacity*`: **number** (e.g. 10)
- `floor*`: **string** (e.g. 3rd Floor)

#### Responses

- **201**: 

### Get all wards

**Method:** `GET`  
**Path:** `/api/v1/wards`  
**Authentication:** Required

#### Responses

- **200**: 

### Get a ward by ID

**Method:** `GET`  
**Path:** `/api/v1/wards/{id}`  
**Authentication:** Required

#### Parameters

| Name | In | Required | Type | Description |
|---|---|---|---|---|
| `id` | path | Yes | string |  |

#### Responses

- **200**: 

### Update a ward

**Method:** `PATCH`  
**Path:** `/api/v1/wards/{id}`  
**Authentication:** Required

#### Parameters

| Name | In | Required | Type | Description |
|---|---|---|---|---|
| `id` | path | Yes | string |  |

#### Request Payload

**Content-Type:** `application/json`

- `name`: **string** (e.g. ICU 1)
- `type`: **string** (e.g. icu)
- `capacity`: **number** (e.g. 10)
- `floor`: **string** (e.g. 3rd Floor)

#### Responses

- **200**: 

### Delete a ward

**Method:** `DELETE`  
**Path:** `/api/v1/wards/{id}`  
**Authentication:** Required

#### Parameters

| Name | In | Required | Type | Description |
|---|---|---|---|---|
| `id` | path | Yes | string |  |

#### Responses

- **200**: 

---

## beds

### Create a new bed in a ward

**Method:** `POST`  
**Path:** `/api/v1/beds`  
**Authentication:** Required

#### Request Payload

**Content-Type:** `application/json`

- `wardId*`: **string** - Ward UUID (e.g. 123e4567-e89b-12d3-a456-426614174000)
- `bedNumber*`: **string** (e.g. Bed-01)

#### Responses

- **201**: 

### Get all beds

**Method:** `GET`  
**Path:** `/api/v1/beds`  
**Authentication:** Required

#### Responses

- **200**: 

### Get a bed by ID

**Method:** `GET`  
**Path:** `/api/v1/beds/{id}`  
**Authentication:** Required

#### Parameters

| Name | In | Required | Type | Description |
|---|---|---|---|---|
| `id` | path | Yes | string |  |

#### Responses

- **200**: 

### Update a bed (e.g., status)

**Method:** `PATCH`  
**Path:** `/api/v1/beds/{id}`  
**Authentication:** Required

#### Parameters

| Name | In | Required | Type | Description |
|---|---|---|---|---|
| `id` | path | Yes | string |  |

#### Request Payload

**Content-Type:** `application/json`

- `wardId`: **string** - Ward UUID (e.g. 123e4567-e89b-12d3-a456-426614174000)
- `bedNumber`: **string** (e.g. Bed-01)
- `status`: **string** (e.g. occupied)

#### Responses

- **200**: 

### Delete a bed

**Method:** `DELETE`  
**Path:** `/api/v1/beds/{id}`  
**Authentication:** Required

#### Parameters

| Name | In | Required | Type | Description |
|---|---|---|---|---|
| `id` | path | Yes | string |  |

#### Responses

- **200**: 

---

## admissions

### Create a new admission

**Method:** `POST`  
**Path:** `/api/v1/admissions`  
**Authentication:** Required

#### Request Payload

**Content-Type:** `application/json`

- `patientId*`: **string** - Patient UUID (e.g. 123e4567-e89b-12d3-a456-426614174000)
- `admittingDoctorId*`: **string** - Admitting Doctor UUID (e.g. 123e4567-e89b-12d3-a456-426614174000)
- `bedId*`: **string** - Bed UUID (e.g. 123e4567-e89b-12d3-a456-426614174000)
- `admissionDate*`: **string** (e.g. 2026-08-15T10:00:00Z)
- `reason*`: **string** (e.g. Severe appendicitis)

#### Responses

- **201**: 

### Get all admissions

**Method:** `GET`  
**Path:** `/api/v1/admissions`  
**Authentication:** Required

#### Responses

- **200**: 

### Get an admission by ID

**Method:** `GET`  
**Path:** `/api/v1/admissions/{id}`  
**Authentication:** Required

#### Parameters

| Name | In | Required | Type | Description |
|---|---|---|---|---|
| `id` | path | Yes | string |  |

#### Responses

- **200**: 

### Update an admission (e.g., discharge)

**Method:** `PATCH`  
**Path:** `/api/v1/admissions/{id}`  
**Authentication:** Required

#### Parameters

| Name | In | Required | Type | Description |
|---|---|---|---|---|
| `id` | path | Yes | string |  |

#### Request Payload

**Content-Type:** `application/json`

- `patientId`: **string** - Patient UUID (e.g. 123e4567-e89b-12d3-a456-426614174000)
- `admittingDoctorId`: **string** - Admitting Doctor UUID (e.g. 123e4567-e89b-12d3-a456-426614174000)
- `bedId`: **string** - Bed UUID (e.g. 123e4567-e89b-12d3-a456-426614174000)
- `admissionDate`: **string** (e.g. 2026-08-15T10:00:00Z)
- `reason`: **string** (e.g. Severe appendicitis)
- `status`: **string** (e.g. discharged)
- `dischargeDate`: **string** (e.g. 2026-08-20T10:00:00Z)

#### Responses

- **200**: 

### Delete an admission

**Method:** `DELETE`  
**Path:** `/api/v1/admissions/{id}`  
**Authentication:** Required

#### Parameters

| Name | In | Required | Type | Description |
|---|---|---|---|---|
| `id` | path | Yes | string |  |

#### Responses

- **200**: 

---

## medical-records

### Create a new medical record

**Method:** `POST`  
**Path:** `/api/v1/medical-records`  
**Authentication:** Required

#### Request Payload

**Content-Type:** `application/json`

- `patientId*`: **string** (e.g. 123e4567-e89b-12d3-a456-426614174000)
- `doctorId`: **string**
- `appointmentId`: **string**
- `recordType*`: **string** (e.g. diagnosis)
- `description*`: **string** (e.g. Patient diagnosed with seasonal flu.)
- `attachments`: **string**

#### Responses

- **201**: 

### Get all medical records

**Method:** `GET`  
**Path:** `/api/v1/medical-records`  
**Authentication:** Required

#### Responses

- **200**: 

### Get all medical records for a specific patient

**Method:** `GET`  
**Path:** `/api/v1/medical-records/patient/{patientId}`  
**Authentication:** Required

#### Parameters

| Name | In | Required | Type | Description |
|---|---|---|---|---|
| `patientId` | path | Yes | string |  |

#### Responses

- **200**: 

### Get a medical record by ID

**Method:** `GET`  
**Path:** `/api/v1/medical-records/{id}`  
**Authentication:** Required

#### Parameters

| Name | In | Required | Type | Description |
|---|---|---|---|---|
| `id` | path | Yes | string |  |

#### Responses

- **200**: 

### Update a medical record

**Method:** `PATCH`  
**Path:** `/api/v1/medical-records/{id}`  
**Authentication:** Required

#### Parameters

| Name | In | Required | Type | Description |
|---|---|---|---|---|
| `id` | path | Yes | string |  |

#### Request Payload

**Content-Type:** `application/json`

- `patientId`: **string** (e.g. 123e4567-e89b-12d3-a456-426614174000)
- `doctorId`: **string**
- `appointmentId`: **string**
- `recordType`: **string** (e.g. diagnosis)
- `description`: **string** (e.g. Patient diagnosed with seasonal flu.)
- `attachments`: **string**

#### Responses

- **200**: 

### Delete a medical record

**Method:** `DELETE`  
**Path:** `/api/v1/medical-records/{id}`  
**Authentication:** Required

#### Parameters

| Name | In | Required | Type | Description |
|---|---|---|---|---|
| `id` | path | Yes | string |  |

#### Responses

- **200**: 

---

## prescriptions

### Create a new prescription

**Method:** `POST`  
**Path:** `/api/v1/prescriptions`  
**Authentication:** Required

#### Request Payload

**Content-Type:** `application/json`

- `patientId*`: **string** (e.g. uuid-here)
- `doctorId*`: **string** (e.g. uuid-here)
- `appointmentId`: **string** (e.g. uuid-here)
- `notes`: **string** (e.g. Take after meals)
- `items*`: **object[]**

#### Responses

- **201**: 

### Get all prescriptions

**Method:** `GET`  
**Path:** `/api/v1/prescriptions`  
**Authentication:** Required

#### Responses

- **200**: 

### Get prescription by id

**Method:** `GET`  
**Path:** `/api/v1/prescriptions/{id}`  
**Authentication:** Required

#### Parameters

| Name | In | Required | Type | Description |
|---|---|---|---|---|
| `id` | path | Yes | string |  |

#### Responses

- **200**: 

### Update a prescription

**Method:** `PATCH`  
**Path:** `/api/v1/prescriptions/{id}`  
**Authentication:** Required

#### Parameters

| Name | In | Required | Type | Description |
|---|---|---|---|---|
| `id` | path | Yes | string |  |

#### Request Payload

**Content-Type:** `application/json`

- `patientId`: **string** (e.g. uuid-here)
- `doctorId`: **string** (e.g. uuid-here)
- `appointmentId`: **string** (e.g. uuid-here)
- `notes`: **string** (e.g. Take after meals)
- `items`: **object[]**

#### Responses

- **200**: 

### Delete a prescription

**Method:** `DELETE`  
**Path:** `/api/v1/prescriptions/{id}`  
**Authentication:** Required

#### Parameters

| Name | In | Required | Type | Description |
|---|---|---|---|---|
| `id` | path | Yes | string |  |

#### Responses

- **200**: 

---

## medicines

### Add a new medicine (Admin only)

**Method:** `POST`  
**Path:** `/api/v1/medicines`  
**Authentication:** Required

#### Request Payload

**Content-Type:** `application/json`

- `name*`: **string** (e.g. Paracetamol 500mg)
- `manufacturer*`: **string** (e.g. PharmaCorp)
- `unitPrice*`: **number** (e.g. 5.5)
- `stockQuantity*`: **number** (e.g. 100)
- `expiryDate`: **string** (e.g. 2027-12-31)

#### Responses

- **201**: 

### Get all medicines

**Method:** `GET`  
**Path:** `/api/v1/medicines`  
**Authentication:** Required

#### Responses

- **200**: 

### Get medicine by id

**Method:** `GET`  
**Path:** `/api/v1/medicines/{id}`  
**Authentication:** Required

#### Parameters

| Name | In | Required | Type | Description |
|---|---|---|---|---|
| `id` | path | Yes | string |  |

#### Responses

- **200**: 

### Update a medicine (Admin only)

**Method:** `PATCH`  
**Path:** `/api/v1/medicines/{id}`  
**Authentication:** Required

#### Parameters

| Name | In | Required | Type | Description |
|---|---|---|---|---|
| `id` | path | Yes | string |  |

#### Request Payload

**Content-Type:** `application/json`

- `name`: **string** (e.g. Paracetamol 500mg)
- `manufacturer`: **string** (e.g. PharmaCorp)
- `unitPrice`: **number** (e.g. 5.5)
- `stockQuantity`: **number** (e.g. 100)
- `expiryDate`: **string** (e.g. 2027-12-31)

#### Responses

- **200**: 

### Delete a medicine (Admin only)

**Method:** `DELETE`  
**Path:** `/api/v1/medicines/{id}`  
**Authentication:** Required

#### Parameters

| Name | In | Required | Type | Description |
|---|---|---|---|---|
| `id` | path | Yes | string |  |

#### Responses

- **200**: 

---

## pharmacy

### Fulfill a prescription and deduct stock

**Method:** `POST`  
**Path:** `/api/v1/pharmacy/fulfill/{prescriptionId}`  
**Authentication:** Required

#### Parameters

| Name | In | Required | Type | Description |
|---|---|---|---|---|
| `prescriptionId` | path | Yes | string |  |

#### Responses

- **201**: 

---

## laboratory

### Order a new lab test

**Method:** `POST`  
**Path:** `/api/v1/laboratory`  
**Authentication:** Required

#### Request Payload

**Content-Type:** `application/json`

- `patientId*`: **string** (e.g. uuid)
- `doctorId*`: **string** (e.g. uuid)
- `testName*`: **string** (e.g. Complete Blood Count)
- `cost`: **number** (e.g. 100)

#### Responses

- **201**: 

### Get all lab tests

**Method:** `GET`  
**Path:** `/api/v1/laboratory`  
**Authentication:** Required

#### Responses

- **200**: 

### Get lab test by id

**Method:** `GET`  
**Path:** `/api/v1/laboratory/{id}`  
**Authentication:** Required

#### Parameters

| Name | In | Required | Type | Description |
|---|---|---|---|---|
| `id` | path | Yes | string |  |

#### Responses

- **200**: 

### Update a lab test (e.g. upload results)

**Method:** `PATCH`  
**Path:** `/api/v1/laboratory/{id}`  
**Authentication:** Required

#### Parameters

| Name | In | Required | Type | Description |
|---|---|---|---|---|
| `id` | path | Yes | string |  |

#### Request Payload

**Content-Type:** `application/json`

- `patientId`: **string** (e.g. uuid)
- `doctorId`: **string** (e.g. uuid)
- `testName`: **string** (e.g. Complete Blood Count)
- `cost`: **number** (e.g. 100)
- `status`: **string** (e.g. completed)
- `resultDetails`: **string** (e.g. WBC is high.)

#### Responses

- **200**: 

### Delete a lab test

**Method:** `DELETE`  
**Path:** `/api/v1/laboratory/{id}`  
**Authentication:** Required

#### Parameters

| Name | In | Required | Type | Description |
|---|---|---|---|---|
| `id` | path | Yes | string |  |

#### Responses

- **200**: 

---

## billing

### Create a new bill

**Method:** `POST`  
**Path:** `/api/v1/billing/bills`  
**Authentication:** Required

#### Request Payload

**Content-Type:** `application/json`

- `patientId*`: **string** (e.g. 123e4567-e89b-12d3-a456-426614174000)
- `admissionId`: **string**
- `appointmentId`: **string**
- `totalAmount*`: **number** (e.g. 500)
- `dueDate*`: **string** (e.g. 2026-08-30)

#### Responses

- **201**: 

### Get all bills

**Method:** `GET`  
**Path:** `/api/v1/billing/bills`  
**Authentication:** Required

#### Responses

- **200**: 

### Get a bill by ID

**Method:** `GET`  
**Path:** `/api/v1/billing/bills/{id}`  
**Authentication:** Required

#### Parameters

| Name | In | Required | Type | Description |
|---|---|---|---|---|
| `id` | path | Yes | string |  |

#### Responses

- **200**: 

### Update a bill

**Method:** `PATCH`  
**Path:** `/api/v1/billing/bills/{id}`  
**Authentication:** Required

#### Parameters

| Name | In | Required | Type | Description |
|---|---|---|---|---|
| `id` | path | Yes | string |  |

#### Request Payload

**Content-Type:** `application/json`

- `patientId`: **string** (e.g. 123e4567-e89b-12d3-a456-426614174000)
- `admissionId`: **string**
- `appointmentId`: **string**
- `totalAmount`: **number** (e.g. 500)
- `dueDate`: **string** (e.g. 2026-08-30)
- `status`: **string** (e.g. paid)

#### Responses

- **200**: 

### Make a payment against a bill

**Method:** `POST`  
**Path:** `/api/v1/billing/payments`  
**Authentication:** Required

#### Request Payload

**Content-Type:** `application/json`

- `billId*`: **string** (e.g. 123e4567-e89b-12d3-a456-426614174000)
- `amount*`: **number** (e.g. 100)
- `paymentMethod*`: **string** (e.g. credit_card)
- `referenceNumber`: **string** (e.g. TXN-987654321)

#### Responses

- **201**: 

