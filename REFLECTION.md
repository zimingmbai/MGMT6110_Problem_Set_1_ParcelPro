# REFLECTION.md - ParcelPro
**Student:** Lim Zi Ming · **Course:** MGMT 6110 · **Problem Set 1**

**User sentence:** A Logistics Dispatcher opens this screen to monitor the deliveries status and reassign deliveries for a delayed driver, and knows it worked when the icon changes from Red to Green.

**Live link:** https://mgmt-6110-problem-set-1-parcel-pro-six.vercel.app/

---
## Q1 - Who are your users, and what changes for them?

**Users**: Dispatch Managers of a Logistics Company (i.e. Internal Users)

**What Happens Today**
- For a small logistics company that is not tech-enabled, the managers could be handling dispatch operations based on:
    - Trust (e.g. drivers reporting back);
    - Using external platforms (e.g. WhatsApp for texting and Live Location)
- This could lead to inaccurate information and potentially a delay in decision making (e.g. having to reassign only when customers start complaining)

**With ParcelPro**
- Dispatch Managers constantly get an overview of the delivery fleet status
- They can expect if a potential delay is happening, and resolve this before customers get upset

---
## Q2 - Augmented capacity and constrained capacity

**Augmented Capacity**
- Getting a working prototype within a few hours would not be possible previously, it would require back-and-forth with Product Managers, Engineers and Designers
- Also, Vercel allows hosting of the prototype. This can simplify the sharing with stakeholders and allow for concurrent feedback from different parties

**Constrained Capacity**
- The builder tends to add something else apart from what was prompted, despite being told to "change nothing else".
    - A single change leads to multiple edits, which can make it difficult to get to what we initially imagined, because the unsolicited changes can accumulate
- Targeted changes becomes harder
    - Because of what happens in the first point, it might seem easier to go directly into the code and make the single change that we wanted
    - However, because the files were not built by us or an engineer, someone would need to read through the code and make sense of things first
    - Hence, the single change, although might be simple, but could be difficult to implement

---
## Q3 - In the loop, on the loop, out of the loop: where was your judgment actually needed?

**In the Loop**
- Prompt: "Include a scroll wheel for the 10-van quick-scroll pill bar"
- Rejected a design flaw that was generated, there was 10 options but a user was not able to scroll through them 

**Nominally in the Loop**
- The Builder created a "Reassignment Hub" at the top right hand corner
- This was not asked, but was accepted as I thought it could provide a useful view of vehicles requiring reassignment

**Product Steps**
- Generating first version from master prompt > On the loop > User would need to determine if the Builder is in the right direction
- Generating display data for the app > Out of the loop > These are simulated data and does not have actual impact
- Analytics data (e.g. as the fleet as 10 vehicles, the on time and delayed should add up to 10) > On the loop > This is automated, but any errors should be detectable
- Review of app usability > On the loop > A human would need to be kept in this as they are ultimately the user and needs to verify whether the product flow satisfy their needs

---
## Q4 - What did it build that you never sketched?

**It added what you never asked for**
- It created an additional page called "Reassignment Hub"
    - This was noticed during the build. A future prompt could aim to further restrict what it could build (e.g. no additional pages)

**It decided something you did not know was a decision**
- The van icons on the map
    - This was noticed at the build. Because it looked different from what I initially imagined.
    - The prompt mentioned "10 mini van icons", and the builder decided that the icon would be a circle, together with car plate labels.
    - In future, it might be useful to be even more specific (e.g. a silhouette of a van, with no labelling or tooltip)

**It was right where you were wrong**
- The builder created "Quick Templates" within the Message function
     - This was a nice addition which I initially did not think about
     - I only visualised this to be a simple textbox with a send button. But it improved usability with this "Quick Templates" feature

---
## Q5 - Learning pointers for the organisational context

- Appoint a Subject Matter Expert for each AI Product built
    - There needs to be a PIC that is well versed with what was built, the code behind it, as well as the intentions behind each prompt.
- The Product Team should document most (if not all) interactions with AI
    - The documentation shows the chain of thought during the product creation, what was expected/unexpected, which helps to prevent the intent of the product from shifting over time.
    - With multiple prompts, it is easy to lose track of why we sent a certain prompt, this will keep us grounded on the product objective.
- Give employees a clear list of guidelines on what can and cannot be entered into a prompt
    - Sensitive information should not be used, as it could be hidden within the code and risk being revealed, even though a product could be a prototype.
    - With a master prompt, the builder already tends to add features that were not mentioned. If there are no guidelines, we would be consuming resources without having a usable prototype.
