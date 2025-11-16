# Subrows Feature Implementation Tracker

## Phase 1: Core DataTable Subrows Infrastructure (6 tasks)

- [x] 1.1: Add subrows types and interfaces to DataTable
- [x] 1.2: Create ExpandIcon component
- [x] 1.3: Integrate getExpandedRowModel in DataTable
- [x] 1.4: Implement 3-mode rendering logic (same/custom/component)
- [x] 1.5: Add subrows export support
- [x] 1.6: Update registry files for DataTable

---

## Phase 2: Example 1 - Orders & Products (same-columns) - PRIMARY FOCUS ⭐

- [x] 2.1: Create tbl_orders schema
- [x] 2.2: Create tbl_order_items schema
- [x] 2.3: Update schema index exports
- [x] 2.4: Create seed data for orders (200 orders, 1-25 items each)
- [x] 2.5: Create API endpoint /api/orders/grouped (Hono)
- [x] 2.6: Register orders API route in main router
- [x] 2.7: Create client API function fetchGroupedOrders
- [x] 2.8: Create example directory structure /example/orders
- [x] 2.9: Create order columns (same-columns mode with expand icon)
- [x] 2.10: Create orders example page with DataTable
- [x] 2.11: Test orders example end-to-end

---

## Phase 3: Example 2 - Logistics Bookings (custom-columns)

- [ ] 3.1: Create tbl_bookings schema
- [ ] 3.2: Create tbl_booking_stops schema
- [ ] 3.3: Update schema index exports
- [ ] 3.4: Create seed data for bookings (150 bookings, 2-20 stops each)
- [ ] 3.5: Create API endpoint /api/bookings/grouped (Hono)
- [ ] 3.6: Register bookings API route in main router
- [ ] 3.7: Create client API function fetchGroupedBookings
- [ ] 3.8: Create example directory structure /example/bookings
- [ ] 3.9: Create parent columns for bookings (10 columns)
- [ ] 3.10: Create subrow columns for booking stops (8 columns)
- [ ] 3.11: Create bookings example page with custom-columns mode
- [ ] 3.12: Test bookings example end-to-end

---

## Phase 4: Example 3 - Tickets & Comments (custom-component)

- [ ] 4.1: Create tbl_tickets schema
- [ ] 4.2: Create tbl_ticket_comments schema
- [ ] 4.3: Update schema index exports
- [ ] 4.4: Create seed data for tickets (100 tickets, 0-15 comments each)
- [ ] 4.5: Create API endpoint /api/tickets/grouped (Hono)
- [ ] 4.6: Register tickets API route in main router
- [ ] 4.7: Create client API function fetchGroupedTickets
- [ ] 4.8: Create custom TicketComment component
- [ ] 4.9: Create example directory structure /example/tickets
- [ ] 4.10: Create parent columns for tickets
- [ ] 4.11: Create tickets example page with custom-component mode
- [ ] 4.12: Test tickets example end-to-end

---

## Phase 5: Final Polish & Validation (6 tasks)

- [ ] 5.1: Run database migrations (drizzle-kit push)
- [ ] 5.2: Run seed script for all new tables
- [ ] 5.3: Run TypeScript type check (npm run typecheck)
- [ ] 5.4: Run ESLint (npm run lint)
- [ ] 5.5: Run build check (npm run build)
- [ ] 5.6: Update README.md with subrows documentation

---

## Total Progress

**Phase 1:** 6/6 completed (100%) ✅
**Phase 2:** 11/11 completed (100%) ✅
**Phase 3:** 0/12 completed (0%) ⭐ NEXT
**Phase 4:** 0/12 completed (0%)
**Phase 5:** 0/6 completed (0%)

**Overall:** 17/47 tasks completed (36%)

---

## Implementation Strategy

1. ✅ Complete Phase 1 (Core DataTable changes)
2. ⭐ Complete Phase 2 (Orders example - FULL END-TO-END)
3. Copy Phase 2 pattern for Phase 3 (Bookings with different columns)
4. Copy Phase 2 pattern for Phase 4 (Tickets with custom component)
5. Final validation and documentation

---

## Notes

- Primary focus: Get ONE example (Orders) working completely
- Orders uses `same-columns` mode (simplest)
- Once working, other examples are variations
- Server-side grouping ONLY (no client-side)
- Max 20 subrows per parent (configurable in API)
- Hide expand icon if only 1 subrow (optional)
