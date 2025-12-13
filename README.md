![TailAdmin React.js Dashboard Preview](./banner.png)

# Hulum Admin Dashboard

This repository contains the **admin & dispatch dashboard** for the Hulum ride-hailing platform.

It is a **production-oriented internal tool**, built to support real-time fleet monitoring, ride dispatch, and operational oversight for a mobility system operating in Addis Ababa.

The project started from the TailAdmin React template and was **heavily customized** to fit a real-time, map-heavy use case.

---

## What This Dashboard Does

- Live fleet monitoring (drivers, status, locations)
- Active rides & dispatch overview
- Driver management (status, earnings, verification)
- Revenue and operational analytics
- Built to support both **operator workflows** and **investor-facing metrics**

A deployed demo is available here:  
👉 **https://hlm-admin-dash.vercel.app/**

---

## Tech Stack

- **React + Vite**
- **TypeScript**
- **Tailwind CSS**
- **Zustand** for state management
- **Leaflet** for live maps
- **ApexCharts** for analytics & trends

The frontend is designed to integrate with a real-time backend (WebSockets / event streams).  
This repo currently uses mock data for demo and UI iteration.

---

## Design & Architecture Notes

- Component-driven layout optimized for operator speed (not marketing pages)
- Map-first UX for dispatch and fleet awareness
- Clean separation between:
  - UI components
  - Domain data (drivers, rides, metrics)
  - Presentation logic

The goal was to keep the dashboard **fast, readable, and operationally useful**, not overly animated or decorative.

---

## Status

- UI & interaction flows are production-ready
- Data layer is mocked for demo purposes
- Real-time hooks designed to be swapped with live APIs

Most of the related backend and mobile app code lives in **private repositories**.

---

## Credits

This project initially bootstrapped from the open-source **TailAdmin React** template  
(https://github.com/TailAdmin/free-react-tailwind-admin-dashboard)

Significant structural, visual, and functional changes were made to adapt it for a real-world dispatch system.

---

## Notes

This repository is shared primarily for:
- Code quality review
- Architecture discussion
- UI/UX evaluation

It is **not** intended as a reusable template.


