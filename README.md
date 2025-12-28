# 🎓 UniPortal | Advanced Real-Time Academic Management System

> **🟢 Live Demo:** [https://real-time-attendence.vercel.app](https://real-time-attendence.vercel.app)

**UniPortal** is a modern Learning Management System (LMS) designed to digitalize academic processes and provide real-time data flow. Originally started with local storage, the project has evolved into a fully integrated, asynchronous, and scalable platform powered by **Firebase Firestore**.

---

### 👨‍🏫 Instructor Portal
* **Real-Time Attendance Control:** A "Start Attendance" system for live session management with automatic persistent data saving.
* **Manual Override System:** Ability to instantly manage student statuses using color-coded Green (Present), Yellow (Late), and Red (Absent) buttons.
* **Attendance History Analysis:** Student-based asynchronous queries and modals to analyze semester-long participation.
* **Blind Grading Interface:** A fair grading interface that hides student names to focus solely on performance and content evaluation.
* **Communication:** Tools to post announcements and manage assignment deadlines.

### 👨‍🎓 Student Portal
* **Interactive UI Elements:** Modern switch buttons, progress bars, and a redesigned user settings page.
* **Instant Notifications:** A live "📸 Join Now" alert system that appears on the dashboard the moment a class session begins.
* **Interactive Dashboard:** A comprehensive overview of enrolled courses, pending tasks, GPA, and weekly progress.
* **Course Management:** Detailed views for syllabus tracking, course materials download, and progress monitoring.
* **Assignment System:** Filterable lists for upcoming, submitted, and graded assignments with submission capabilities.
* **Gradebook:** Visual breakdown of exam scores, letter grades, and semester averages.
* **Calendar:** Integrated schedule for classes, exams, and deadlines.

### 🏦 Princible Portal
* **There is nothing illogical.:** Once a Instructor registers with the system, they must wait for the principal to assign them courses. Principals are responsible for course assignments, not Instructors.

### 🏗️ Infrastructure & Data Management
* **Firebase Firestore Integration:** All data traffic (Students, Instructors, Courses, Assignments) is managed asynchronously through Firebase.
* **High-Level Security:** tudents who are not registered for any class by a Instructor cannot register in the system.

---

## 🛠 Technologies Used

* **Frontend:** React 18
* **Language:** TypeScript (Strict Type Checking)
* **Backend:** Firebase Firestore (Cloud Database)
* **Styling:** Custom CSS (Responsive & Animated)
* **State Management:** React Hooks (useEffect, useState)

---

## 🔐 Step-by-Step Testing Guide

To demonstrate the full capability of the platform, follow this sequence which mirrors the real-world academic lifecycle:

### 1. Instructor Onboarding & Authorization
* **Registration:** First, an instructor must create an account via the "Register" page using the institutional code `MALT2024`.
* **Administrative Assignment:** Before the instructor can see any data, the University Admin (via Firebase/Management side) must assign specific courses to the instructor's email.

### 2. Classroom Setup (Instructor Side)
* **Student Enrollment:** Once courses are assigned, the instructor goes to the "Student List" section of their course.
* **Adding Students:** The instructor adds student IDs (e.g., `220706011`) to the course roster. This prepares the database to recognize these students for this specific class.

### 3. Student Registration
* **Student Onboarding:** Students must now register using the exact Student IDs provided by the instructor.
* **Dynamic Enrollment:** Upon login, the system automatically fetches and displays only the courses the instructor has enrolled them in.

### 4. Live Academic Interaction (The Demo Loop)
* **Real-Time Attendance:** * The Instructor clicks **"Start Attendance"**.
    * On the Student Dashboard, a live **"Join Now"** alert appears instantly via Firebase listeners.
    * The Student completes authentication, and the Instructor sees the status change to **"Present"** (Green) in real-time.
* **Content & Communication:** * The Instructor posts an **Announcement**; it appears immediately on the Student's "Recent Announcements" feed.
    * The Instructor creates an **Assignment** with detailed instructions and deadlines.
* **Grading & Feedback:** * The Instructor uses the **"Blind Grading"** modal to assign scores to student submissions.
    * The Student checks their **"Grades"** and **"Katılım Geçmişi" (Attendance History)** to see their progress and historical records.

---

## 📸 Interface Gallery

<table width="100%">
  <tr>
    <td width="50%" align="center">
      <img src="https://i.ibb.co/v6yQPwhs/login1.png" width="100%" alt="Login Page">
      <br />
      <sub>1. Advanced Login Portal</sub>
    </td>
    <td width="50%" align="center">
      <img src="https://i.ibb.co/LdfcSnZ3/student2.png" width="100%" alt="Register Page">
      <br />
      <sub>2. Student Interactive Dashboard</sub>
    </td>
  </tr>

  <tr>
    <td width="50%" align="center">
      <img src="https://i.ibb.co/mVQ2xQYr/inst3.png" width="100%" alt="Student Dashboard">
      <br />
      <sub>3. Instructor Management Panel </sub>
    </td>
    <td width="50%" align="center">
      <img src="https://i.ibb.co/gbps3zWV/princible.png" width="100%" alt="Instructor Dashboard">
      <br />
      <sub>4. Princible Management Panel </sub>
    </td>
  </tr>

  <tr>
    <td width="50%" align="center">
      <img src="https://i.ibb.co/CsYCswcK/yoklama1.png" width="100%" alt="Real-time Attendance">
      <br />
      <sub>5. Real-Time Attendance Notification</sub>
    </td>
    <td width="50%" align="center">
      <img src="https://i.ibb.co/ymQY76sB/yoklama2.png" width="100%" alt="Course Details">
      <br />
      <sub>6. Real-Time Attendance</sub>
    </td>
  </tr>

  <tr>
    <td width="50%" align="center">
      <img src="https://i.ibb.co/4g2qDDj8/ins-profile.png" width="100%" alt="Dynamic Profile">
      <br />
      <sub>7. Modern Dynamic User Profile</sub>
    </td>
    <td width="50%" align="center">
      <img src="https://i.ibb.co/7J6kzcDJ/devteacher.png" width="100%" alt="Settings Page">
      <br />
      <sub>8. Blind Grading System</sub>
    </td>
  </tr>
</table>

---

## 👥 Development Team

This project was developed by Computer Engineering students at Maltepe University as a term project:

* **Taylan Alp Çakı**
* **Erdem Beler**
* **Ecem Nur Özer**
* **Burçak Çelt**
