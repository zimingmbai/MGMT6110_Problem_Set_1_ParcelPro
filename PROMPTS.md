# PROMPTS.md - ParcelPro
**Student:** Lim Zi Ming · **Course:** MGMT 6110 · **Problem Set 1**

**User sentence:** A Logistics Dispatcher opens this screen to monitor the deliveries status and reassign deliveries for a delayed driver, and knows it worked when the icon changes from Red to Green.

**Live link:** https://mgmt-6110-problem-set-1-parcel-pro-six.vercel.app/

---

## Prompt 1 - the master prompt
```
ROLE: You are a senior front-end developer building a React web app.

GOAL: Build the front end of a web product called ParcelPro, a Logistics Company
Users
- Dispatch Managers of ParcelPro
- 3 Managers, each handling a fleet of 10 vehicles in Singapore
- They are responsible for monitoring the status of the vehicles, and ensuring that all deliveries are on time and not delayed
Screens
1. A map of Singapore, segmented into various URA Areas.
- For each selected Manager, it will show 10 mini van icons on the map, each representing the GPS location of the vehicle
- The icon will be Green (if the delivery is on time) and Red (if it is being delayed)
- When the manager tap on the van icon, the following details will appear below the map:
a. Car Plate Number
b. Driver Name
c. Driver Contact Number (with a Phone and Message option beside it)
Tapping on the Phone option trigger a pop-up to confirm if the manager wants to call the driver
Tapping on the Message option will trigger a pop-up with a text box, for the manager to send the driver a text
d. List of Deliveries Scheduled (Max 10 Deliveries for each driver)
For each delivery, the following info are visible: Pickup Location, Dropoff Location, Estimated Time, Estimated Distance and Item to Deliver
2. Reassignment Button for Each Delivery
- If a Delivery is delayed, the Manager can reassign one or more subsequent deliveries to other available vehicles (i.e. on time). Because if the driver is already in transit for the delayed delivery, he can continue to complete it, but this will prevent snowballing of delays for future deliveries
- Once reassignment is complete, the affected van icon will turn from red to green
- The delivery info would also be moved to the new driver
- Any vehicles that is already handling 10 deliveries, cannot be assigned any more deliveries

OUTPUT: A running app. Keep every invented value in ONE data file of its own, with at least 30 rows (3 managers x 10 vehicles each x minimum 1 delivery each), so the screen looks real. One component per screen or section.
Move between screens without reloading the page. Readable on a phone at arm's length. When you are done, list the files you created and what each one holds.

GUARDRAILS: Screens and invented data only. Do NOT call the Gemini API or any other model. Do NOT call any outside service or fetch from any URL. No database, no login, no user accounts, no analytics. No features I did not list. No real company's name, logo, or trademark. Invented names and numbers only, nothing confidential.

CONTEXT: Individual Problem Set 1 for MGMT 6110 Human-AI Collaboration at SMU. Built in Google AI Studio, shared as a link, and opened on a phone by classmates in Week 3. I am not a programmer: when you make a choice I did not specify, say so in one line rather than burying it.
```
**What came back:** A running app, 10 files, preview loaded. 
It also added a the following that I never asked for:
- Interactive Zoom Buttons
- Quick Template Responses when sending text
- 10-van quick-scroll pill bar directly above the vehicle details section
- Delivery Delay Reasons

**What I changed next and why:** 
- A button to scroll through the 10-van quick-scroll pill bar > Scrolling function is not available 
- More seamless map view > Currently is a mix of polygons and hence a less readable interface
- Include the current Date/Time at the top header > To be a reference point for the delivery timings
---

## Prompt 2 - fix the aesthetics
```
Make the following edits

1. Include a scroll wheel for the 10-van quick-scroll pill bar
2. Include the current date/time at the header bar
3. Refactor the map so it looks like a professional, seamless Singapore map for vehicle tracking rather than a collection of overlapping polygons
- A real basemap with Singapore water, roads and geographic context
- URA planning-area boundaries as a subtle overlay, with low-opacity and thin, subtle boundary lines
- GPS vehicle markers above all map layers, maintain the same marker icons. The markers should remain accurate, whenever the map is zoom in or zoom out

Change nothing else. If you make a choice I did not specify, say so in one line rather than burying it.
```
**What came back:** Changes are roughly what was required
- Scroll-Wheel added > But also added a "Scroll wheel enabled" indicator, which is redundant
- Live Date/Time is added
- A more seamless map is added > This seems to be considerably difficult as the visual interpretations of a map might be difficult to achieve with prompts.

**What I changed next and why:**
- Add a rule that the current delivery cannot be reassigned > If a driver is in transit with a delivery, reallocating it would be operationally difficult. e.g. the driver would need to pass the item to another driver. The reassignment attempts to prevent a single delay from snowballing into other deliveries.
---

## Prompt 3 - update the reassignment rule
```
Add the following rule to ParcelPro

- Inside the list of deliveries for each vehicle, the current delivery (i.e. the delivery that the driver is in transit with) cannot be reassigned.
- The current delivery that the vehicle is in transit with, should also be clearly indicated. We can use a progress bar for the current delivery with the following possible status: 1) Picking Up 2) In Transit 3) Delivered

Change nothing else. If you make a choice I did not specify, say so in one line rather than burying it.
```
**What came back:** Changes are roughly what was required
- Added Reassignment Lock for current delivery
- Added Progress Bar for current delivery
- Added but not asked - the option for dispatch managers to update delivery status
    - Does not seem useful as it should take the updates from the Drivers. In cases whereby connection is poor, there might be a use case for this function  

**What I changed next and why:** NA

