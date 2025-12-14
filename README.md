


# 🎓 UniPortal | Maltepe University Real-Time Attendance & LMS

## 🌟 Project Introduction

**UniPortal** is a web application prototype developed for the **Maltepe University Computer Engineering Department**. It is designed to bridge the gap between students and instructors by providing a centralized platform for daily course management, assignment tracking, and **real-time attendance monitoring**.

The application focuses on a modern user experience (UX), offering distinct and specialized interfaces for both students and academicians.

## ✨ Key Features

The system offers two customized interfaces based on the user role:

### 🎓 Student Dashboard

  * **My Courses:** View details of enrolled courses, instructor information, and progress tracking.
  * **Assignment Management:** Track assignments through tabs for Pending, Submitted, and Graded tasks.
  * **Gradebook:** Monitor Midterm, Final, and Project grades with weighted averages.
  * **Smart Calendar:** A personalized schedule view containing class times, exams, and assignment deadlines.

### 👨‍🏫 Instructor Dashboard

  * **Real-Time Attendance:** View the student roster for a selected course and mark attendance instantly (Present, Absent, Late).
  * **Announcements:** Publish urgent or general announcements specific to a class.
  * **Assignment Tracking:** Monitor submission statistics and grade statuses for assigned tasks.

## 💻 Technologies Used

The project is built using the **React ecosystem** to ensure a fast and responsive user experience.

| Category | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | React (v18) | Core library for building UI components and managing state. |
| **Language** | TypeScript (TSX) | A typed superset of JavaScript for safer and scalable code. |
| **Styling** | Vanilla CSS | Custom, responsive CSS for a clean UI/UX without heavy frameworks. |
| **Data Management** | Mock Data | Internal data structures to simulate backend responses for prototyping. |
| **Authentication** | `localStorage` | Browser-based temporary storage for user roles and registration data. |

## 🚀 Installation and Setup

Follow these steps to run the project on your local machine:

### Prerequisites

  * [Node.js](https://nodejs.org/en) (LTS version recommended)
  * [npm](https://www.npmjs.com/)

### Steps

1.  **Clone the Repository:**

    ```bash
    git clone https://github.com/Taylan361/real-time-attendence.git
    ```

2.  **Navigate to the Project Directory:**
    *Note: The source code is located in the `Website` folder.*

    ```bash
    cd real-time-attendence/Website
    ```

3.  **Install Dependencies:**

    ```bash
    npm install
    ```

4.  **Start the Application:**

    ```bash
    npm run dev
    ```

The application will typically launch automatically at `http://localhost:5173`.

## 🔑 Demo Login & Registration

Since the system uses **LocalStorage**, you will need to **Register** first to create the accounts. Use the details below to test different roles:

### 1\. Instructor Registration (Admin)

To access the Instructor Panel, you must use the **Institution Code**.

  * **Role Selection:** Instructor
  * **Institution Code:** `MALT2024`
  * **Email:** `admin@maltepe.edu.tr` (Example)

### 2\. Student Registration

  * **Role Selection:** Student
  * **Student ID:** Enter any 9-digit number (e.g., `220706010`)

-----

## 👥 Development Team

This project was developed by:

  * **Taylan Alp Çakı**
  * **Erdem Beler**
  * **Ecem Nur Özer**
  * **Burçak Çelt**
