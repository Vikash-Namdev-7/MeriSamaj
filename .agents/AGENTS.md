# Meri Samaj - Frontend Architecture Rules & Guidelines

## MERN Full Stack Readiness
- **Production-Level Architecture**: Code must follow production-ready structures, strict component modularity, clear prop-types/interfaces, and clean React state management.
- **Dynamic Content & Logic**: Differentiate between static UI structures (e.g., standard action button text like "कॉल करें" or localized translation keys) which can remain static, and dynamic business data (e.g., member names, roles, avatars, locations, matrimonial match profiles) which must be loaded dynamically.
- **Backend API Readiness**: Design components, hook structures, and page models so they can easily consume API responses and bind to dynamic JSON payloads in the future without requiring core layout refactoring.
- **Admin Panel Configurable**: Ensure structural labels, settings arrays, permissions, and feature flags are configurable so they can eventually be controlled dynamically from an Admin Panel dashboard.
