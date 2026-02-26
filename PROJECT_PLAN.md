# PROJECT_PLAN.md

## Project Overview
The goal of the Poker Coach project is to develop a Windows native poker trainer that utilizes hand histories from CoinPoker and BetAcre to provide comprehensive training and leak detection for players.

## Architecture
![Architecture Diagram](path/to/architecture-diagram.png)
- **Client**: Windows application interface for users.
- **Server**: Handles business logic and data processing.
- **Database**: PostgreSQL used for data storage.

## Technology Stack
- **Frontend**: C# with .NET for Windows application development.
- **Backend**: Node.js for API development.
- **Database**: PostgreSQL for structured data storage.
- **Libraries**: D3.js for visualizations, other data processing libraries.

## Hand History Import Strategies
- Utilize APIs from CoinPoker and BetAcre to fetch hand histories.
- Implement CSV import functionality for manual uploads.
- Perform data cleaning to ensure quality and consistency.

## Database Design
![ERD](path/to/erd.png)
- **Users Table**: Stores user profiles and preferences.
- **Hands Table**: Stores individual hand histories.
- **Statistics Table**: Aggregates performance data for analysis.

## Leak Detection Framework
- Implement statistical analysis to identify player leaks.
- Use machine learning algorithms to predict player errors and suggest improvements.

## Development Roadmap
- **Phase 1**: User authentication, hand history import features.
- **Phase 2**: Leak detection algorithms, statistics module.
- **Phase 3**: User interface enhancements, testing, and deployment.
