# Hospital Management Backend API

A robust, scalable backend API for the Hospital Management System. It serves both the Admin Dashboard and the Unified Patient/Doctor/Staff Portal with role-based access control and unified endpoints.

## Features

- **Unified Authentication:** JWT-based authentication supporting multiple roles (Patient, Doctor, Staff, Admin) with role-based routing and permissions.
- **Dynamic Dashboard:** A smart `/dashboard/summary` endpoint that automatically tailors statistics and data based on the authenticated user's role.
- **Comprehensive Entity Management:** Full CRUD operations for Patients, Doctors, Staff, Wards, Beds, Admissions, Appointments, Medical Records, Prescriptions, and Lab Tests.
- **Role-Based Access Control (RBAC):** Built-in guards and decorators to secure endpoints and ensure data privacy.

## Tech Stack

- **Framework:** NestJS (Node.js)
- **Language:** TypeScript
- **Database ORM:** TypeORM
- **Authentication:** Passport, JWT (JSON Web Tokens)
- **Validation:** Class Validator

## Getting Started

### Prerequisites

Ensure you have Node.js installed and running.

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Anoop017/Hospital-Backend-V2.git
   ```

2. Navigate to the backend directory:
   ```bash
   cd hospital-backend
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Configure environment variables:
   Create a `.env` file in the root directory. Ensure your database credentials and JWT secrets are set up correctly.

### Running the Application

```bash
# development
npm run start

# watch mode
npm run start:dev

# production mode
npm run start:prod
```

The API will be available at `http://localhost:3042/api/v1`.

## API Documentation

For detailed frontend integration guides, authentication schemas, and dashboard endpoint payloads, please refer to the integration guides provided to the frontend teams:
- `admin-fe-integration.md`
- `portal-fe-integration.md`
- `api-integration-guide.md`

## Project Structure

- `src/auth`: Authentication controllers, JWT strategies, and login/register endpoints.
- `src/dashboard`: Dynamic role-based dashboard summary endpoints.
- `src/[entity]`: Modules for specific entities (e.g., `patients`, `doctors`, `appointments`, `beds`, `wards`) containing controllers, services, and TypeORM entities.
- `src/common`: Shared utilities, custom decorators, and global guards.
