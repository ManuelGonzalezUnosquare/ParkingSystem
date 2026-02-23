# 📋 Planning & Delegation Strategy

## A. Task Breakdown & Modularization

The project was structured into four core modules to ensure a clean separation of concerns and to facilitate parallel development in future phases:

1.  **Identity & Access Module (IAM):** Manages RBAC (Root, Admin, Resident), authentication flows, and the \"First Login\" security protocol.
2.  **Core Domain Module:** Handles the primary business entities, including Buildings, Parking Slots, and Vehicles.
3.  **Raffle Intelligence Engine:** The proprietary core of the system, managing weighted probability, priority scores, and transactional integrity during assignments.
4.  **Notification & Audit Bridge:** An abstraction layer designed to handle historical logging and prepare the system for external messaging service integrations.

---

## B. Build vs. Delegate Strategy (PoC Stage)

As the Lead Developer for this PoC, my focus was on the **High-Value/High-Risk** components that define the system's success, while identifying \"Commodity\" features for team delegation:

- **Built by Candidate (Core Architecture):**
  - Full Database Schema design and Multi-tenant logic.
  - The Raffle Engine and its transactional implementation in NestJS.
  - The Nx Monorepo workspace and shared library architecture.
- **Identified for Delegation (MVP Phase):**
  - **Messaging Service Integration:** Implementation of SMTP/SendGrid providers for automated emails (Password recovery, Raffle results).
  - **Cloud Blob Storage:** Connecting the system to AWS S3 or Azure Blob for vehicle and license plate imagery.
  - **UI/UX Fine-tuning:** Polishing complex animations and advanced data visualization for administrative dashboards.

---

## C. Delegation Plan for Advanced Features

To transition the PoC into a production-grade enterprise system, specialized features would be assigned to dedicated technical tracks:

| Feature                             | Delegation Track         | Technical Focus                                                                                                                |
| :---------------------------------- | :----------------------- | :----------------------------------------------------------------------------------------------------------------------------- |
| **LPR (License Plate Recognition)** | **Computer Vision Team** | Developing or integrating microservices (e.g., OpenCV, AWS Rekognition) to automate entry/exit gates via plate scanning.       |
| **Real-time Notifications**         | **Fullstack / DevOps**   | Implementation of **WebSockets (Socket.io)** or Firebase Cloud Messaging (FCM) for instant result delivery.                    |
| **Cloud Asset Management**          | **Backend Specialist**   | Handling secure image processing (resizing, compression) and managed storage for user avatars and vehicle verification photos. |

---

## D. Critical Requirements for MVP Readiness

To consider this project a **Minimum Viable Product (MVP)**, the following technical implementations are prioritized for the next sprint:

1.  **Transactional Messaging:** Moving from log-based mocks to a live email service for critical alerts (Password Recovery, Status Changes, Raffle Wins).
2.  **Distributed Blob Storage:** Implementation of cloud-based storage to manage high-resolution vehicle and resident assets (Avatars/Plate Photos).
3.  **Push Notifications (Nice-to-Have):** Integration of real-time sockets to enhance Resident engagement and provide immediate feedback upon raffle execution.
