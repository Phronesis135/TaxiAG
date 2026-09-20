Absolutely. I’ll treat **C** as the decision for Question 35 and make the strongest product recommendation for the remaining unresolved areas, rather than continuing the interview.

Below is the consolidated **TaxiAG Product Requirements Document (PRD)**.

# **TaxiAG**

## **Product Requirements Document (PRD)**

**Product:** TaxiAG  
**Market:** United Kingdom  
**Product type:** Taxi comparison, booking, tracking and payment platform  
**Status:** Product definition / MVP-to-scale specification

---

# **1\. Product Vision**

TaxiAG is a UK-wide platform that lets customers compare realistic taxi and private-hire options in one place and, wherever possible, complete the entire journey through TaxiAG.

The core proposition is:

> **Compare every realistic option. See the real price. Choose what suits you. Book with confidence.**

TaxiAG should bring together:

* Major ride-hailing providers  
* Local private-hire/taxi companies  
* Licensed taxis and black cabs where bookable  
* Accessible vehicles  
* Premium/executive vehicles  
* Larger vehicles  
* Electric vehicles  
* Airport and station transfers  
* Scheduled journeys  
* Multiple-vehicle/group bookings

TaxiAG should remain fundamentally **customer-first and comparison-led**.

Providers paying TaxiAG must not secretly receive better organic placement in price comparisons.

---

# **2\. Product Principles**

### **2.1 Price transparency**

Customers should understand whether a price is:

* Fixed/guaranteed  
* Estimated  
* Metered/from-price

### **2.2 Cheapest by default**

The default results ordering is **Cheapest**.

Other sorting/filtering options can be provided, but commercial relationships must not secretly change the organic cheapest ranking.

### **2.3 No surprise pricing**

Customers should know:

* Quote validity  
* Price type  
* Additional fees  
* Cancellation conditions  
* Whether the price is guaranteed

If a selected price changes before booking, the customer must be told.

### **2.4 Trust before conversion**

TaxiAG should prioritise:

* Verified providers  
* Verified vehicle information  
* Verified drivers where applicable  
* Reliability statistics  
* Customer reviews  
* Clear booking responsibility

### **2.5 Guest-first**

Customers should be able to compare journeys without creating an account.

Accounts should add convenience rather than create unnecessary friction.

### **2.6 Provider-neutral comparison**

TaxiAG can generate revenue from providers without compromising the integrity of the comparison.

Sponsored placement must be clearly identified and separated from organic price results.

---

# **3\. Target Customers**

## **Primary**

### **Everyday passenger**

Wants the cheapest suitable taxi quickly.

### **Price-conscious passenger**

Wants to compare several providers before booking.

### **Airport traveller**

Needs reliable pickup, luggage capacity and flight-aware journey management.

### **Family**

Needs child seats, accessibility requirements, multiple passengers and bookings for other people.

### **Business traveller**

Needs receipts, centralised bookings and business account functionality.

### **Group traveller**

Needs multiple vehicles for one journey.

### **Passenger requiring accessibility**

Needs verified vehicle capabilities rather than assumptions.

---

# **4\. Core Customer Journey**

## **Step 1 — Enter journey**

Customer enters:

* Pickup  
* Destination  
* Date/time  
* Passenger count

Optional:

* Return journey  
* Multiple stops  
* Airport/flight details  
* Train details  
* Vehicle requirements  
* Accessibility requirements  
* Maximum price  
* Preferred providers

---

## **Step 2 — TaxiAG searches providers**

TaxiAG identifies realistic options based on:

* Journey  
* Time  
* Passenger count  
* Vehicle requirements  
* Accessibility requirements  
* Provider service area  
* Provider availability  
* Provider restrictions

Providers unable to fulfil the journey should not appear as bookable results.

---

## **Step 3 — Compare**

Default ordering:

**Cheapest**

Each result initially displays approximately:

* Provider  
* Price  
* Price type  
* Pickup time  
* Vehicle  
* Rating

Additional details are expandable.

---

## **Step 4 — Review provider**

Customer can inspect:

* Reliability  
* Rating  
* Completed TaxiAG journeys  
* Cancellation rate  
* Pickup performance  
* Vehicle information  
* Accessibility capabilities  
* Verification status  
* Cancellation terms  
* Payment method

---

## **Step 5 — Book**

TaxiAG supports two booking routes.

### **Direct booking**

TaxiAG handles the booking inside its experience.

### **External booking**

TaxiAG sends the customer to the provider when direct booking is unavailable.

The interface must clearly explain who controls:

* Booking  
* Payment  
* Cancellation  
* Refund  
* Customer support

---

## **Step 6 — Track**

Where supported:

* Driver location  
* ETA  
* Driver name/photo  
* Vehicle  
* Registration  
* Pickup location  
* Journey progress  
* Estimated arrival

Where tracking isn't available, TaxiAG must clearly say so.

---

## **Step 7 — Complete**

After the journey:

* Receipt  
* Payment confirmation  
* Journey history  
* Rating/review opportunity  
* Safety reporting if required

---

# **5\. Search & Booking Requirements**

TaxiAG must support:

* Ride now  
* Scheduled journeys  
* Return journeys  
* Airport transfers  
* Station transfers  
* Multiple stops  
* Multiple-vehicle bookings  
* Booking for another passenger

Customers can book for somebody else without requiring a family/business account.

Passenger information can include:

* Passenger name  
* Passenger phone number  
* Accessibility requirements  
* Relevant journey instructions

---

# **6\. Comparison Results**

## **Default ranking**

**Cheapest price**

Other controls:

* Fastest pickup  
* Best value  
* Preferred providers  
* Vehicle type  
* Accessibility  
* Rating  
* Tracking availability

The system must not manipulate organic price ranking because of:

* Provider commission  
* Provider subscription  
* Sponsored placement  
* Commercial partnership

---

# **7\. Price Display**

Every result must clearly identify its price type.

### **Fixed**

**Price locked — £18.50**

The customer understands the quoted fare is guaranteed under the displayed booking conditions.

### **Estimated**

**Estimated — £16–£21**

The provider has not guaranteed the final fare.

### **Metered**

**From £15**

The final fare depends on the journey/meter.

TaxiAG should provide a **“Why this price?”** explanation.

---

# **8\. Price Protection**

TaxiAG must:

* Show quote validity where applicable  
* Detect price changes before booking  
* Clearly display the new price  
* Require confirmation after a significant price increase  
* Mark guaranteed prices clearly  
* Search for cheaper alternatives when a selected price changes

The customer should never unknowingly proceed with a materially different fare.

---

# **9\. Maximum Price**

Customers can specify a maximum budget.

Example:

**Maximum price: £25**

TaxiAG then identifies suitable options within the customer's limit.

If no suitable option exists:

> No suitable vehicles are currently available under £25.

TaxiAG should not automatically book the cheapest option simply because it falls below the customer's maximum.

---

# **10\. Provider Preferences**

Customers can specify preferences such as:

* Preferred providers  
* Local taxi companies  
* Major ride-hailing providers  
* Black cabs  
* Electric vehicles  
* Live tracking  
* Accessibility features

Preferences affect filtering and presentation, but **do not silently remove the full comparison universe**.

The customer can always return to the complete comparison.

---

# **11\. Vehicle & Accessibility**

TaxiAG supports:

* Standard  
* Executive/premium  
* XL/larger vehicle  
* Wheelchair accessible  
* Electric  
* Child seat  
* Extra luggage  
* 6–8+ passengers

Accessibility requirements can include:

* Wheelchair accessible vehicle  
* Wheelchair remaining in place  
* Assistance/guide dog  
* Child seat  
* Extra luggage  
* Additional passenger capacity  
* Other assistance requirements

TaxiAG must use provider-confirmed capabilities.

It must never infer that a vehicle is accessible merely from its category.

---

# **12\. Airport & Station Journeys**

Airport/station journeys receive dedicated functionality.

Supported information can include:

* Flight number  
* Train number  
* Pickup recommendations  
* Collection point  
* Meeting-point instructions  
* Luggage requirements  
* Waiting-time rules  
* Flight/train changes  
* Driver instructions

Where supported, TaxiAG can monitor flight/train changes and communicate relevant updates.

---

# **13\. Group Bookings**

TaxiAG supports multiple taxis within one linked booking.

Example:

**8 passengers → 2 vehicles**

The booking has one group reference, while each vehicle maintains its own:

* Driver  
* Vehicle  
* ETA  
* Tracking  
* Price  
* Payment  
* Cancellation information

TaxiAG should not require all vehicles to come from the same provider.

---

# **14\. Family & Business Accounts**

## **Family accounts**

Capabilities:

* Saved family passengers  
* Booking for relatives  
* Saved accessibility requirements  
* Shared journey information  
* Journey history

## **Business accounts**

Capabilities:

* Multiple employees  
* Multiple authorised bookers  
* Central billing  
* Receipts  
* Booking history  
* Business travel policies  
* Employee/passenger profiles

Normal customers should not need these account types.

---

# **15\. Accounts**

Guest functionality:

* Search  
* Compare  
* Begin booking

Account functionality:

* Saved locations  
* Saved passengers  
* Preferred vehicles  
* Saved payment methods  
* Journey history  
* Receipts  
* Book again  
* Family/business management

Supported sign-in options should include mainstream convenient authentication methods such as Apple/Google and email/phone.

---

# **16\. Payment**

TaxiAG supports:

* Debit/credit card  
* Apple Pay  
* Google Pay  
* Cash where supported  
* Provider-specific payment methods  
* Provider promo codes/discounts  
* Saved payment methods  
* Digital receipts

The customer must clearly know **who takes the payment**.

Example:

> Uber — £18.40 — Pay securely through TaxiAG

or:

> Local Taxi Co — £16.00 — Cash or card directly to driver

---

# **17\. Cancellation & Refunds**

Before booking, customers should see:

* Cancellation deadline  
* Cancellation fee  
* Refundability  
* No-show rules  
* Driver/provider cancellation rules  
* Refund responsibility

TaxiAG should provide one consistent cancellation experience wherever it controls the booking.

For external-provider bookings, TaxiAG should explain the provider's rules and direct the customer to the provider where necessary.

---

# **18\. Tracking & Safety**

Where supported, TaxiAG provides:

* Live driver location  
* ETA  
* Driver identity  
* Driver photo  
* Vehicle make/model/colour  
* Registration  
* Pickup location  
* Journey progress  
* Arrival information  
* Driver contact  
* Safety assistance  
* Journey sharing  
* Trusted contacts  
* Emergency assistance  
* Journey anomaly alerts  
* Post-journey safety reporting

Tracking status must be explicit:

**Live tracking available**

or

**Tracking unavailable — provider supplies limited journey information**

TaxiAG must never imply that it is tracking a vehicle when it isn't.

---

# **19\. Notifications**

Customers can receive notifications for:

* Booking confirmation  
* Price changes  
* Driver assignment  
* Driver approaching  
* Driver arriving  
* Driver waiting  
* Flight changes  
* Train changes  
* Pickup-point changes  
* Provider cancellation  
* Driver cancellation  
* Journey completion  
* Payment updates  
* Refund updates  
* Review reminders

Users can control notification preferences.

Important journey and safety notifications remain prioritised.

---

# **20\. Provider Verification**

Providers must complete relevant verification before accepting bookings.

Verification can include:

* Company identity  
* Relevant licensing  
* Driver licensing  
* Vehicle licensing  
* Insurance  
* Service area  
* Accessibility capabilities  
* Payment information  
* Cancellation terms  
* Contact information

TaxiAG should display useful verification information to customers.

Example:

**✓ Verified provider**

**Verified: September 2026**

---

# **21\. Provider Service Areas**

Providers define detailed:

* Pickup areas  
* Drop-off areas  
* Airports served  
* Stations served  
* Operating hours  
* Maximum journey distances  
* Advance-booking requirements  
* Additional-fee conditions  
* Vehicle-specific restrictions

TaxiAG uses these restrictions to determine whether a provider is a genuine option for a journey.

A provider that cannot fulfil the journey should not appear as an available booking option.

---

# **22\. Provider Information Maintenance**

Providers must maintain current information.

Critical information includes:

* Licensing  
* Insurance  
* Vehicle status  
* Driver status where applicable  
* Service areas  
* Accessibility capability

If critical verification expires, affected bookings should be paused until the information is updated.

TaxiAG should display verification/update dates where useful.

---

# **23\. Provider Reliability**

TaxiAG should display factual reliability statistics rather than creating a single subjective provider score.

Possible metrics:

* On-time pickup percentage  
* Provider cancellation rate  
* Average pickup delay  
* Completed TaxiAG journeys  
* Verified customer rating

Example:

> **92% on-time pickups**  
> **3% provider cancellations**  
> **4 min average pickup delay**  
> **1,240 completed journeys**  
> **4.8★ verified rating**

Statistics should only be shown where TaxiAG has sufficient reliable data.

---

# **24\. Ratings & Reviews**

Only completed TaxiAG journeys can produce verified TaxiAG reviews.

Review categories:

* Overall journey  
* Driver experience  
* Vehicle quality  
* Pickup reliability  
* Price/value

Optional written review.

Provider profiles can display:

* Average rating  
* Number of verified journeys/reviews  
* Cancellation rate  
* Pickup reliability  
* Verification status

---

# **25\. Customer Support**

## **TaxiAG-direct booking**

TaxiAG provides:

* Customer support  
* Cancellation support  
* Refund handling where applicable  
* Booking disputes  
* Escalation

## **External-provider booking**

TaxiAG provides:

* Booking information  
* Basic guidance  
* Provider contact information  
* Explanation of responsibility

The customer is directed to the provider when the provider controls the issue.

Safety-related concerns receive prominent escalation regardless of booking route.

---

# **26\. Promotions**

TaxiAG does **not** operate its own loyalty programme.

TaxiAG does not need:

* Points  
* Tiers  
* Cashback  
* Customer-funded loyalty rewards

Providers may supply:

* Promo codes  
* Discounts  
* Provider-funded offers

Any applicable discount should be reflected transparently in the displayed final price.

---

# **27\. Price Alerts**

TaxiAG does not provide general future price-watch alerts.

The only price-change alerts are associated with an existing booking/quote where the price changes before completion.

---

# **28\. Black Cabs**

TaxiAG includes black cabs/taxis when they can participate in an actual bookable TaxiAG journey.

TaxiAG should not present a street-hailable black cab as though TaxiAG has booked it.

This maintains the central product promise:

> **If TaxiAG presents a bookable option, the customer has a meaningful booking path.**

---

# **29\. Provider Onboarding**

Providers can apply to join TaxiAG.

Onboarding flow:

1. Provider application  
2. Identity/business verification  
3. Licensing verification  
4. Insurance verification where relevant  
5. Vehicle/driver verification  
6. Service-area setup  
7. Pricing/payment configuration  
8. Cancellation-policy setup  
9. Accessibility capabilities  
10. Approval  
11. Provider becomes bookable

---

# **30\. Revenue Model**

Primary revenue:

### **Commission on completed bookings**

Additional revenue may include:

* Provider subscriptions  
* Appropriate customer fees  
* Other compatible commercial services

### **Sponsored placement**

Sponsored placement may be offered, but it must be:

* Clearly labelled  
* Visually distinguishable  
* Separate from organic price ranking  
* Unable to secretly manipulate the Cheapest ranking

A provider paying TaxiAG must not automatically become the cheapest result.

---

# **31\. Organic vs Sponsored Results**

TaxiAG should maintain two concepts:

### **Organic comparison**

Determined by genuine journey data and customer-selected sorting.

### **Sponsored placement**

Commercially purchased placement that is clearly labelled.

Sponsored placement must never masquerade as:

* Cheapest  
* Best  
* Most reliable  
* Most trusted

unless those claims are independently supported by the same transparent criteria applied to other providers.

---

# **32\. Loyalty Strategy**

TaxiAG deliberately avoids a traditional loyalty programme.

The product's retention mechanism is:

> **TaxiAG saves customers money and makes booking easier.**

Retention features therefore focus on:

* Saved journeys  
* Saved passengers  
* Saved payment methods  
* Book again  
* Family accounts  
* Business accounts  
* Reliable comparison  
* Transparent pricing

---

# **33\. Search Experience**

The primary home screen should be extremely simple.

Core fields:

**From**

**To**

**When?**

**Passengers**

Primary CTA:

**Compare taxis**

Secondary options:

* Return  
* Airport/station  
* Multiple stops  
* Accessibility  
* Vehicle  
* Maximum price  
* Preferences

The user should not need to understand TaxiAG's provider network before searching.

---

# **34\. Results Experience**

The result card should initially show only the most important information.

Example:

**Local Taxi Co**  
**£16.00**  
Fixed price  
Pickup: 7 min  
4.8★  
✓ Verified

Expanded:

* Vehicle  
* Journey duration  
* Passenger capacity  
* Luggage  
* Accessibility  
* Payment method  
* Cancellation terms  
* Reliability  
* Tracking  
* Provider information

---

# **35\. Trust & Transparency**

TaxiAG should explain why information appears.

Examples:

**Why this price?**

**Why isn't this fare guaranteed?**

**Why is tracking unavailable?**

**How is this provider verified?**

**How is reliability calculated?**

This creates a product where customers can understand the comparison rather than simply trusting an opaque algorithm.

---

# **36\. Accessibility of the TaxiAG Product**

The TaxiAG app and website should themselves be designed for accessibility.

Requirements should include:

* Screen-reader support  
* Keyboard navigation  
* Clear focus states  
* Sufficient text readability  
* Accessible colour contrast  
* Large touch targets  
* Clear error messages  
* Plain language  
* Accessible forms  
* Accessible maps where possible  
* Non-visual alternatives to map-dependent information

Accessibility should apply to both the **TaxiAG interface** and the **vehicles being compared**.

---

# **37\. Languages**

Recommended initial approach:

### **Launch**

English-first UK experience.

### **Scale**

Add additional languages based on customer demand and UK usage patterns.

Language selection should affect:

* Interface  
* Notifications  
* Booking information  
* Safety information  
* Support content

Critical journey information should always remain clear and unambiguous.

---

# **38\. Customer Safety**

Safety should be treated as a core product capability rather than a support-only feature.

Key capabilities:

* Verified provider information  
* Driver/vehicle identification  
* Journey sharing  
* Trusted contacts  
* Emergency assistance  
* Driver contact  
* Journey tracking where available  
* Reporting  
* Clear provider responsibility

TaxiAG should clearly distinguish between information it has verified and information supplied by providers.

---

# **39\. Data Quality**

TaxiAG should maintain a confidence model around provider information.

Examples:

**Verified**

**Provider supplied**

**Customer reported**

**Estimated**

**Live**

This allows customers to understand the nature of the information they're seeing.

---

# **40\. Booking Responsibility**

Every booking must have an explicit responsibility model.

### **TaxiAG booking**

TaxiAG is the primary booking interface and support channel.

### **Provider booking**

The customer completes booking with the provider.

The customer should never be left wondering:

> “Who do I contact if something goes wrong?”

The booking screen should answer that clearly.

---

# **41\. Core Product Metrics**

TaxiAG should measure:

### **Comparison**

* Searches  
* Results returned  
* Comparison completion rate  
* Percentage of searches with multiple providers  
* Average number of comparable options

### **Booking**

* Booking conversion  
* Completed bookings  
* Cancellation rate  
* Provider cancellation rate  
* External-provider handoff rate

### **Price**

* Average quoted fare  
* Average customer savings versus alternatives  
* Price-change frequency  
* Price-change magnitude

### **Reliability**

* On-time pickup rate  
* Average pickup delay  
* Provider cancellation rate  
* Journey completion rate

### **Customer**

* Repeat booking rate  
* Book-again usage  
* Account creation  
* Family-account usage  
* Business-account usage  
* Customer support contacts  
* Verified reviews

### **Safety**

* Safety reports  
* Journey-sharing usage  
* Tracking availability  
* Driver/vehicle information completeness

---

# **42\. Product Success Definition**

TaxiAG succeeds when customers consistently think:

> **“Before I book a taxi, I check TaxiAG.”**

The platform should become the comparison layer between customers and the fragmented UK taxi market.

The most important customer outcomes are:

1. Find a suitable taxi quickly.  
2. Understand the real price.  
3. Compare realistic alternatives.  
4. Choose based on price and relevant facts.  
5. Book confidently.  
6. Know who is responsible for the booking.  
7. Track the journey where supported.  
8. Have clear support if something goes wrong.

---

# **43\. Recommended MVP**

The initial product should prioritise the fundamental comparison-to-booking loop.

### **MVP capabilities**

* Pickup/destination search  
* Ride-now and scheduled journeys  
* Passenger count  
* Provider comparison  
* Cheapest-first ranking  
* Fixed/estimated/metered price labels  
* Price validity  
* Price-change protection  
* Provider verification  
* Reliability statistics  
* Ratings/reviews  
* Vehicle categories  
* Accessibility filters  
* Maximum-price filter  
* Preferred-provider filter  
* Direct/external booking  
* Payment  
* Cancellation information  
* Basic tracking  
* Booking history  
* Guest checkout  
* Booking for another passenger  
* Provider onboarding

---

# **44\. Phase 2**

* Family accounts  
* Business accounts  
* Multiple-vehicle group bookings  
* Advanced airport/flight integration  
* Train integration  
* Trusted contacts  
* Journey sharing  
* Expanded safety tooling  
* Advanced provider analytics  
* Expanded accessibility capabilities  
* Additional UK languages

---

# **45\. Phase 3**

* Broader provider network  
* More local operators  
* Deeper real-time availability  
* More sophisticated journey coordination  
* Expanded corporate travel tools  
* Additional transport categories where they remain consistent with TaxiAG's core comparison proposition

---

# **46\. Features Explicitly Not Prioritised**

TaxiAG should initially avoid:

* Customer loyalty points  
* Cashback programme  
* Generic price-drop alerts  
* Opaque provider scores  
* Hidden sponsored ranking  
* Predictive personalisation  
* Unverified provider listings  
* Street-hail journeys presented as confirmed bookings  
* Unnecessary account creation  
* Overly complicated search forms

---

# **47\. Product Positioning**

TaxiAG should position itself around:

## **Compare. Choose. Book.**

Supporting messages:

**Every realistic taxi option in one place.**

**See the price before you book.**

**Compare local taxis and major providers.**

**Know who you're booking with.**

**No hidden ranking games.**

---

# **48\. Final Product Definition**

TaxiAG is a **UK-wide taxi comparison and booking platform** that combines the breadth of a marketplace with the transparency of a comparison service.

Its defining characteristics are:

* **Cheapest-first comparison**  
* **Transparent pricing**  
* **Verified providers**  
* **Factual reliability information**  
* **Accessibility-aware vehicle matching**  
* **Guest-first booking**  
* **Direct or external booking**  
* **Flexible payment**  
* **Strong tracking and safety**  
* **Airport/station support**  
* **Multiple-vehicle bookings**  
* **Family and business accounts**  
* **Provider-neutral organic ranking**  
* **Clearly separated commercial placement**

The product should optimise for one central customer promise:

> **TaxiAG helps customers find the right taxi at a price they understand, from a provider they can trust, with a booking experience they can follow from start to finish.**

This gives you a fairly complete **product-level PRD** without getting into engineering architecture or technical implementation. If you want to turn this into the next stage, the natural follow-up is a **screen-by-screen TaxiAG app specification** covering the homepage, search, comparison results, booking, tracking, account, provider profile, family/business areas, and checkout.

