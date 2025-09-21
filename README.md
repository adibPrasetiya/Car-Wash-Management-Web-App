# 🚗 Carwash Management System

Sistem manajemen cuci mobil yang dibangun dengan **NestJS**, **Angular 19**, **Prisma**, dan **MySQL**.

## 🌟 Fitur

### 🔐 **Authentication System**
- ✅ Login dengan JWT (Access Token & Refresh Token)
- ✅ Password hashing dengan bcrypt
- ✅ Role-based access (Owner & Cashier)
- ✅ Auto refresh token
- ✅ Auth guards & interceptors

### 🎨 **UI/UX**
- ✅ Responsive design dengan Bootstrap 5
- ✅ Orange brand theme
- ✅ Modern login interface
- ✅ FontAwesome icons
- ✅ Loading states & error handling

### 🧪 **Testing**
- ✅ Unit tests untuk AuthService dengan Jest
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
│   │   │   └── ...
│   │   ├── prisma/            # Prisma service
│   │   └── core/              # Core functionality
│   ├── prisma/
│   │   ├── schema.prisma      # Database schema
│   │   └── seed.ts            # Database seeder
│   └── test/                  # Test files
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── core/          # Core services & guards
│   │   │   ├── features/      # Feature modules
│   │   │   │   └── auth/      # Authentication pages
│   │   │   └── shared/        # Shared components
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

## 📝 **Next Steps**

Sistem login sudah lengkap dan siap digunakan! Untuk pengembangan selanjutnya, Anda bisa:

1. ✅ **Implement dashboard components**
2. ✅ **Add transaction management**
3. ✅ **Create client management**
4. ✅ **Add service management**
5. ✅ **Implement reporting**
6. ✅ **Add real-time notifications**

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