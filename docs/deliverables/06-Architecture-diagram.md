# Architecture diagram.

graph TD
subgraph Client_Layer [Frontend - Angular 19]
A[Browser User] --> B[PrimeNG 21 / Tailwind 4 Components]
B --> C[SignalStore - State Management]
end

    subgraph Logic_Layer [NX Monorepo - NestJS API]
        D[Auth & RBAC Guards]
        E[Parking Module]
        F[Raffle Engine]
        G[Building Management]

        C -->|REST / JSON| D
        D --> E
        D --> F
        D --> G
    end

    subgraph Data_Layer [Persistence & Performance]
        E & F & G --> H[(Redis Cache)]
        E & F & G --> I[(TypeORM - PostgreSQL/MySQL)]
    end

    subgraph Dev_Ops [CI/CD Pipeline]
        J[GitHub Actions] --> K[Docker Images - GHCR]
        K --> L[Automated Releases]
    end

    style A fill:#f9f,stroke:#333,stroke-width:2px
    style I fill:#2a9d8f,color:#fff
    style H fill:#e76f51,color:#fff
    style F fill:#e9c46a
