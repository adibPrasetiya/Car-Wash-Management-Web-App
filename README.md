# 🚗 Carwash Management System

Sistem manajemen cuci mobil yang dibangun dengan **NestJS**, **Angular 19**, **Prisma**, dan **MySQL**.

## 🌟 Fitur

### 🔐 **Authentication System**
- ✅ Login dengan JWT (Access Token & Refresh Token)
- ✅ Password hashing dengan bcrypt
- ✅ Role-based access (Owner & Cashier)
- ✅ Auto refresh token
- ✅ Auth guards & interceptors

### 👥 **Client Management System**
- ✅ Full CRUD operations untuk client
- ✅ Multiple vehicles per client
- ✅ Search dan filtering dengan pagination
- ✅ Vehicle management terintegrasi
- ✅ Form validation dan error handling
- ✅ Real-time data synchronization

### 🚗 **Vehicle Management**
- ✅ Standalone vehicle operations
- ✅ Vehicle type support (car, motorcycle, truck)
- ✅ Brand, model, year, color tracking
- ✅ Client-vehicle relationship management
- ✅ Search across vehicle data

### 💰 **Transaction System**
- ✅ Transaction creation dengan vehicle selection
- ✅ Multiple vehicle support per transaction
- ✅ Status tracking (pending, in_progress, completed, cancelled)
- ✅ Client integration for registered users
- ✅ Guest transaction support

### 🎨 **UI/UX**
- ✅ Responsive design dengan Bootstrap 5
- ✅ Orange brand theme
- ✅ Modern component interfaces
- ✅ FontAwesome icons
- ✅ Loading states & error handling
- ✅ Modal dialogs untuk forms
- ✅ Advanced filtering dan search

### 🧪 **Testing**
- ✅ Unit tests untuk services dengan Jest
- ✅ Frontend-backend integration
- ✅ Mocking & test coverage

## 🏗️ **Tech Stack**

### Backend (NestJS)
- **Framework**: NestJS
- **Database**: MySQL dengan Prisma ORM
- **Authentication**: JWT dengan @nestjs/jwt
- **Password Hashing**: bcrypt
- **Validation**: class-validator
- **Testing**: Jest

### Frontend (Angular 19)
- **Framework**: Angular 19 (Standalone Components)
- **Styling**: Bootstrap 5 + Custom CSS
- **HTTP Client**: Angular HttpClient
- **Forms**: Reactive Forms
- **Icons**: FontAwesome 6
- **State Management**: RxJS BehaviorSubject

## 🚀 **Quick Start**

### 1. **Setup Database**
```bash
# Buat database MySQL
CREATE DATABASE carwash_db;
```

### 2. **Backend Setup**
```bash
cd backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env file dengan konfigurasi database Anda
# DATABASE_URL="mysql://username:password@localhost:3306/carwash_db"
# JWT_SECRET="your-super-secret-jwt-key"

# Generate Prisma client
npm run db:generate

# Push database schema
npm run db:push

# Seed initial data
npm run db:seed

# Start development server
npm run start:dev
```

### 3. **Frontend Setup**
```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

## 🔑 **Login Credentials**

Setelah menjalankan seeder, gunakan credentials berikut:

### Owner Account
- **Username**: `owner`
- **Password**: `owner123`

### Cashier Account
- **Username**: `cashier`
- **Password**: `cashier123`

## 📡 **API Endpoints**

### Authentication
- `POST /auth/login` - Login user
- `POST /auth/refresh` - Refresh access token

### Client Management
- `GET /clients` - Get clients dengan pagination dan search
- `GET /clients/search?q=query` - Search clients
- `GET /clients/:id` - Get client by ID
- `POST /clients` - Create new client dengan vehicles
- `PUT /clients/:id` - Update client information
- `DELETE /clients/:id` - Delete client

### Vehicle Management
- `POST /clients/:id/vehicles` - Add vehicle ke client
- `DELETE /clients/:id/vehicles/:vehicleId` - Remove vehicle dari client
- `GET /vehicles` - Get vehicles dengan filtering
- `GET /vehicles/search?q=query` - Search vehicles
- `GET /vehicles/client/:clientId` - Get vehicles by client
- `GET /vehicles/:id` - Get vehicle by ID
- `POST /vehicles` - Create standalone vehicle
- `PUT /vehicles/:id` - Update vehicle
- `DELETE /vehicles/:id` - Delete vehicle

### Request/Response Examples

#### Login Request
```json
POST /auth/login
{
  "username": "owner",
  "password": "owner123"
}
```

#### Login Response
```json
{
  "accessToken": "eyJhbGciOiJIUzI1...",
  "refreshToken": "eyJhbGciOiJIUzI1...",
  "user": {
    "id": 1,
    "username": "owner",
    "name": "Admin Owner",
    "role": "owner"
  }
}
```

#### Create Client Request
```json
POST /clients
{
  "name": "John Doe",
  "phone": "+62812345678",
  "email": "john@example.com",
  "vehicles": [
    {
      "plateNumber": "B1234ABC",
      "vehicleType": "car",
      "brand": "Toyota",
      "model": "Avanza",
      "year": 2020,
      "color": "Silver"
    }
  ]
}
```

#### Client Response
```json
{
  "id": 1,
  "name": "John Doe",
  "phone": "+62812345678",
  "email": "john@example.com",
  "vehicles": [
    {
      "id": "vehicle1",
      "plateNumber": "B1234ABC",
      "vehicleType": "car",
      "brand": "Toyota",
      "model": "Avanza",
      "year": 2020,
      "color": "Silver",
      "createdAt": "2024-01-20T10:30:00Z",
      "updatedAt": "2024-01-20T10:30:00Z"
    }
  ],
  "createdAt": "2024-01-20T10:30:00Z",
  "updatedAt": "2024-01-20T10:30:00Z"
}
```

## 🗃️ **Database Schema**

### Users Table
```sql
- id: INT (Primary Key)
- name: VARCHAR
- username: VARCHAR (Unique)
- password: VARCHAR (Hashed)
- role: VARCHAR ('owner' | 'cashier')
- createdAt: DATETIME
- updatedAt: DATETIME
```

### Clients Table
```sql
- id: INT (Primary Key)
- name: VARCHAR
- phone: VARCHAR (Unique, Optional)
- email: VARCHAR (Unique, Optional)
- createdAt: DATETIME
- updatedAt: DATETIME
```

### Vehicles Table
```sql
- id: STRING (Primary Key, CUID)
- clientId: INT (Foreign Key, Optional)
- plateNumber: VARCHAR
- vehicleType: VARCHAR ('car' | 'motorcycle' | 'truck')
- brand: VARCHAR (Optional)
- model: VARCHAR (Optional)
- year: INT (Optional)
- color: VARCHAR (Optional)
- createdAt: DATETIME
- updatedAt: DATETIME
```

### Transactions Table
```sql
- transactionId: STRING (Primary Key)
- transactionNumber: VARCHAR (Unique, Format: U0001/P0001)
- clientId: INT (Foreign Key, Optional)
- clientName: VARCHAR
- clientType: VARCHAR ('U' | 'P')
- vehicleId: STRING (Foreign Key, Optional)
- vehicleType: VARCHAR
- plateNumber: VARCHAR (Optional)
- vehicleBrand: VARCHAR (Optional)
- vehicleModel: VARCHAR (Optional)
- serviceType: VARCHAR
- totalAmount: DECIMAL(10,2)
- status: VARCHAR ('pending' | 'in_progress' | 'completed' | 'cancelled')
- cashierId: VARCHAR
- cashierName: VARCHAR
- notes: TEXT (Optional)
- date: DATETIME
- createdAt: DATETIME
- updatedAt: DATETIME
```

### Service Packages & Types
```sql
ServicePackage:
- id: INT (Primary Key)
- name: VARCHAR
- description: TEXT
- price: DECIMAL(10,2)

ServiceType:
- id: INT (Primary Key)
- name: VARCHAR
- description: TEXT
- price: DECIMAL(10,2)
```

## 🧪 **Running Tests**

### Backend Tests
```bash
cd backend

# Run unit tests
npm run test

# Run tests with coverage
npm run test:cov

# Run tests in watch mode
npm run test:watch
```

### Frontend Tests
```bash
cd frontend

# Run unit tests
npm test

# Run tests with coverage
npm run test:coverage
```

## 🛠️ **Development Commands**

### Backend
```bash
# Generate Prisma client
npm run db:generate

# Create and apply migration
npm run db:migrate

# Push schema to database
npm run db:push

# Seed database
npm run db:seed

# Open Prisma Studio
npm run db:studio

# Lint code
npm run lint

# Format code
npm run format
```

### Frontend
```bash
# Start dev server
npm start

# Build for production
npm run build

# Run linter
npm run lint
```

## 🏗️ **Project Structure**

```
carwash-web/
├── backend/
│   ├── src/
│   │   ├── modules/
│   │   │   ├── auth/          # Authentication module
│   │   │   ├── user/          # User management
│   │   │   ├── client/        # Client management
│   │   │   ├── vehicle/       # Vehicle management
│   │   │   ├── transaction/   # Transaction management
│   │   │   └── ...
│   │   ├── config/            # Prisma service & config
│   │   ├── common/            # DTOs, guards, filters
│   │   └── utils/             # Utility functions
│   ├── prisma/
│   │   ├── schema.prisma      # Database schema
│   │   └── seed.ts            # Database seeder
│   └── test/                  # Test files
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── core/          # Core services & guards
│   │   │   │   ├── models/    # TypeScript interfaces
│   │   │   │   ├── services/  # API services
│   │   │   │   └── guards/    # Route guards
│   │   │   ├── features/      # Feature modules
│   │   │   │   ├── auth/      # Authentication pages
│   │   │   │   ├── cashier/   # Cashier features
│   │   │   │   │   ├── client/       # Client management
│   │   │   │   │   └── transactions/ # Transaction management
│   │   │   │   └── activation/# Device activation
│   │   │   ├── shared/        # Shared components
│   │   │   └── layout/        # Layout components
│   │   └── styles.css         # Global styles
│   └── ...
└── README.md
```

## 🎨 **Design Features**

### Login Page
- ✅ Split-screen layout (branding + form)
- ✅ Orange theme dengan gradient
- ✅ Floating animations
- ✅ Responsive design
- ✅ Form validation
- ✅ Loading states
- ✅ Error handling

### Authentication Flow
- ✅ JWT token storage
- ✅ Auto refresh on token expiry
- ✅ Role-based routing
- ✅ Auth guards
- ✅ Logout functionality

## 🔧 **Environment Variables**

### Backend (.env)
```bash
DATABASE_URL="mysql://username:password@localhost:3306/carwash_db"
JWT_SECRET="your-super-secret-jwt-key"
PORT=3000
NODE_ENV=development
```

## 🚀 **Getting Started dengan Client Management**

Sistem client management sudah terintegrasi penuh dengan backend! Untuk menggunakan:

### 1. **Setup Database**
```bash
cd backend
# Reset database (development only)
npx prisma migrate reset --force
# Or create new migration
npx prisma migrate dev --name update_vehicle_schema
```

### 2. **Start Backend & Frontend**
```bash
# Terminal 1 - Backend
cd backend && npm run start:dev

# Terminal 2 - Frontend
cd frontend && npm start
```

### 3. **Akses Client Management**
- Login sebagai cashier
- Navigate ke Client Management
- Test create, search, edit, delete clients
- Test vehicle management per client

## 📝 **Next Steps**

Sistem client management sudah lengkap! Untuk pengembangan selanjutnya:

1. ✅ **Authentication System**
2. ✅ **Client Management dengan Multiple Vehicles**
3. ✅ **Transaction System dengan Vehicle Selection**
4. ✅ **Dashboard Components**
5. 🔄 **Service Package Management**
6. 🔄 **Reporting & Analytics**
7. 🔄 **Real-time Notifications**
8. 🔄 **Loyalty Program**

## 🤝 **Contributing**

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 **License**

This project is licensed under the MIT License.

---

Made with ❤️ for car wash management