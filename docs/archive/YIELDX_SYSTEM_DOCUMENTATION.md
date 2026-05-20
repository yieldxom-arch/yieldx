# YieldX Platform - Complete Level System Documentation
## Comprehensive Guide to the 7-Level Business Feasibility Study System (Levels 0-7)

**Version:** 2.0  
**Date:** 2026  
**System Type:** Gamified Educational Feasibility Study Platform  
**Standards:** Omani Ministry Guidelines & Oman Vision 2040  
**Language Support:** Bilingual (Arabic/English)

---

## 🎯 **SYSTEM OVERVIEW**

The YieldX platform implements a **revolutionary 8-level gamified system** (Levels 0-7) that guides students through creating a complete business feasibility study following Omani standards. Each level builds progressively, with data flowing from one level to the next, culminating in a comprehensive feasibility study report.

### **Key System Features:**
- ✅ **Auto-Save:** All data persists in real-time to localStorage
- ✅ **Progressive Data Flow:** Each level uses data from previous levels
- ✅ **Automatic Calculations:** Financial KPIs, depreciation, totals computed automatically
- ✅ **AI Integration:** Smart recommendations, validation, and optimization
- ✅ **Bilingual Support:** Complete Arabic/English interface
- ✅ **Study Modes:** Quick (5 years), Detailed (5 years), Advanced (10 years)

---

## 📊 **LEVEL-BY-LEVEL BREAKDOWN**

---

## **LEVEL 0: PROJECT TYPE SELECTION**

### **🎯 Purpose**
Establishes the foundational category of the business project, which determines sector-specific requirements, regulations, and resource needs throughout subsequent levels.

### **📋 What This Level Contains**

#### **Input Fields:**
1. **Project Type Selection** (Required)
   - Type: Radio button selection (4 options)
   - Options:
     - 🌾 Agricultural (زراعي)
     - 🏭 Industrial (صناعي)
     - 🛒 Commercial (تجاري)
     - 💼 Service (خدمي)
   
2. **Brief Description** (Optional)
   - Type: Text area
   - Purpose: User's initial project concept
   - Max length: 500 characters

#### **UI Components:**
- ✅ 4 large interactive cards with icons
- ✅ Gradient color schemes per type
- ✅ Hover animations and 3D effects
- ✅ Progress indicator (0-100%)
- ✅ Save & Continue button

### **🤖 AI-Powered Features**

#### **AI Type:** None (Pure Selection Level)
- This level does not include AI assistance
- Future enhancement: AI could suggest project type based on user's description

### **⚙️ Calculations & Automation**

#### **System-Calculated Values:**
- ✅ Progress: 100% when type selected
- ✅ XP Award: 50 XP upon completion

#### **Data Flow:**
- **Outputs to Next Levels:**
  - `projectType` → Level 1, 3, 5 (affects validation rules)
  - Agricultural/Industrial projects require raw materials in Level 3
  - Service projects skip raw material section in Level 3

### **🌟 Unique Features**
1. **Conditional Logic:** Project type determines which fields appear in Level 3
2. **Visual Feedback:** Each type shows relevant icon and description
3. **Simplicity:** Fastest level to complete (designed for quick start)

### **📚 User Guidance & Feedback**

#### **Pre-Completion Guidance:**
- Info cards explain each project type
- Examples provided for each category
- Bilingual tooltips

#### **Post-Completion Feedback:**
- ✅ Success message: "Project type selected successfully"
- ✅ Badge appears showing selected type
- ✅ Level 1 automatically unlocks

### **📄 Documentation Output**

#### **Data Saved to Context:**
```javascript
{
  projectType: 'agricultural' | 'industrial' | 'commercial' | 'service',
  projectDescription?: string
}
```

#### **Appears in Final Report:**
- **Section 1.1:** Project Classification
- **Executive Summary:** Project type mentioned

---

## **LEVEL 1: IDENTITY & OWNERSHIP**

### **🎯 Purpose**
Establishes the business identity, core information, and ownership structure with complete shareholder breakdown. This level forms the legal and organizational foundation of the feasibility study.

### **📋 What This Level Contains**

#### **Section 1: Basic Project Details**

**Input Fields:**

1. **Business Name** (Required)
   - Type: Text input with AI validation
   - Max length: 100 characters
   - AI-powered name checker integrated

2. **Project Idea** (Required)
   - Type: Text input
   - Purpose: One-sentence concept
   - Max length: 200 characters

3. **Product/Service Description** (Required)
   - Type: Text area
   - Purpose: Detailed explanation of offering
   - Max length: 1000 characters

4. **Project Status** (Required)
   - Type: Dropdown select
   - Options:
     - فكرة (Idea)
     - قيد التخطيط (Planning)
     - قيد التنفيذ (Implementation)
     - قائم (Operational)

5. **Location** (Required)
   - Type: Text input
   - Purpose: Business physical location
   - Example: "Muscat - Al Khuwair"

#### **Section 2: Ownership Structure**

**Dynamic Shareholder Table:**

For each owner/shareholder:
1. **Name** (Required)
   - Type: Text input
   
2. **Nationality** (Required)
   - Type: Dropdown
   - Options: Omani (عماني), Expat (وافد)
   
3. **Age** (Required)
   - Type: Number input
   - Validation: Must be 18+
   
4. **Share Percentage** (Required)
   - Type: Number input
   - Range: 0.01% - 100%
   - Validation: Total must equal 100%
   
5. **Experience Level** (Required)
   - Type: Dropdown
   - Options: Beginner (مبتدئ), Intermediate (متوسط), Expert (خبير)

**Table Features:**
- ✅ Add Owner button (up to 10 owners)
- ✅ Remove Owner button
- ✅ Real-time percentage total calculation
- ✅ Validation alerts if total ≠ 100%

### **🤖 AI-Powered Features**

#### **AI Feature 1: Business Name Checker**

**Location:** Business Name input field

**What AI Does:**
1. **Platform Availability Check**
   - Checks if name is already used in YieldX database
   - Status: Available ✅ or Taken ❌

2. **Global Awareness Analysis**
   - AI analyzes if name is:
     - Unique (globally uncommon)
     - Common (widely used)
     - Similar (to existing brands)
   - Uses machine learning pattern matching

3. **Brand Score Calculation (1-10)**
   - Analyzes:
     - Name length (ideal: 5-10 characters)
     - Pronounceability (vowel/consonant ratio)
     - Memorability (repeated characters penalty)
     - Geographic name penalty (e.g., "Muscat", "Oman")
     - Special characters penalty
   - **Algorithm:**
     ```
     Score starts at 5.0
     +2.0 if length 5-10 chars
     +1.5 if vowel ratio 30-50%
     -3.0 if geographic location name
     -2.0 if excessive repeated letters
     -1.5 if hard consonant clusters
     Final: 1.0 to 10.0 scale
     ```

4. **AI Feedback Contextual**
   - Score 8.5+: "Excellent: Clear, easy to pronounce, and unique"
   - Score 7.0-8.4: "Good: Distinctive but may need refinement"
   - Score 5.5-6.9: "Acceptable: Clear but common"
   - Score 3.0-5.4: "Weak: Too generic or lacks distinction"
   - Below 3.0: "Very weak: Hard to pronounce or remember"

5. **Smart Name Suggestions**
   - AI generates 10 alternative names
   - Adds professional suffixes: Labs, One, X, App, Hub, HQ, Global, Pro
   - Adds prefixes: Get, Try, My, The
   - Creative variations (vowel modifications)

6. **Domain Availability Suggestions**
   - Suggests 6 domain options:
     - `{name}.com`
     - `get{name}.com`
     - `try{name}.com`
     - `{name}app.io`
     - `{name}hq.com`
     - `{name}.om`

**AI Trigger:** Activates when user types ≥3 characters
**Response Time:** 1.5 seconds (simulated)
**Visual Feedback:** Progress spinner → Results cards

#### **AI Feature 2: Ownership Validation Assistant**

**What AI Does:**
- Flags if total ownership ≠ 100%
- Suggests corrections if close (e.g., 99% → "Add 1% to reach 100%")
- Warns if single owner has 100% (recommends diversification)

### **⚙️ Calculations & Automation**

#### **User-Entered Values:**
- All text fields
- All numbers (age, share percentage)
- All selections (dropdowns)

#### **System-Calculated Values:**

1. **Total Share Percentage**
   - Formula: `Σ(all owner share percentages)`
   - Display: Real-time below shareholder table
   - Color:
     - Green if = 100%
     - Red if ≠ 100%

2. **Total Number of Owners**
   - Count of rows in shareholder table

3. **Omanization Ratio (Preview)**
   - Formula: `(Omani owners count / Total owners) × 100`
   - Note: Not enforced at this level (enforced in Level 4)

4. **Progress Percentage**
   - Based on required fields completed
   - Formula: `(Filled required fields / Total required fields) × 100`

### **🌟 Unique Features**

1. **AI Name Intelligence System**
   - Only level with real-time brand analysis
   - Multi-layer validation (platform, global, brand quality)

2. **Dynamic Shareholder Management**
   - Add/remove rows dynamically
   - Real-time sum validation

3. **Badge Display from Level 0**
   - Shows selected project type from previous level
   - Visual confirmation of project category

4. **Three-Stage Validation**
   - Field-level (individual inputs)
   - Section-level (shareholder totals)
   - Form-level (all required fields)

### **📚 User Guidance & Feedback**

#### **Pre-Completion Guidance:**

**Inline Tooltips:**
- Business name: "Choose a unique, memorable name"
- Share percentage: "Total must equal 100%"
- Age: "Minimum age 18 years"

**Alert Messages:**
- ⚠️ "Share total is {X}% - adjust to reach 100%"
- ⚠️ "Business name already exists in platform"
- ✅ "Business name available and has excellent brand score!"

#### **Post-Completion Feedback:**
- ✅ Success animation
- ✅ XP award: +100 XP
- ✅ Level 2 unlocks automatically
- ✅ Summary card shows:
  - Business name with checkmark
  - Number of owners
  - Total share percentage

### **📄 Documentation Output**

#### **Data Saved to Context:**
```javascript
{
  businessName: string,
  projectIdea: string,
  productDescription: string,
  projectStatus: 'idea' | 'planning' | 'implementation' | 'operational',
  location: string,
  owners: [
    {
      id: string,
      name: string,
      nationality: 'omani' | 'expat',
      age: number,
      sharePercentage: number,
      experience: 'beginner' | 'intermediate' | 'expert'
    }
  ]
}
```

#### **Appears in Final Report:**
- **Section 1:** Executive Summary (Business Name, Idea, Description)
- **Section 2:** Project Identity (Location, Status)
- **Section 3:** Ownership Structure (Complete shareholder table)
- **Section 4:** Management Team (Owner experience levels)

---

## **LEVEL 2: LEGAL FRAMEWORK & REGULATORY COMPLIANCE**

### **🎯 Purpose**
Establishes the complete legal and regulatory foundation by documenting all required licenses, insurance coverage, and property arrangements. Ensures compliance with Omani business regulations.

### **📋 What This Level Contains**

#### **Section 1: Licenses & Permits**

**Dynamic License Table:**

For each license:
1. **License Name** (Required)
   - Type: Text input
   - Examples: "Commercial Registration", "Municipality Permit", "Health Permit"

2. **Issuing Authority** (Required)
   - Type: Text input
   - Examples: "Ministry of Commerce", "Municipality", "Ministry of Health"

3. **Cost (OMR)** (Required)
   - Type: Number input
   - Range: 0+
   - Currency: Omani Rial

4. **Status** (Required)
   - Type: Dropdown
   - Options:
     - Required (مطلوب)
     - In Process (قيد الإجراء)
     - Completed (مكتمل)

**Table Features:**
- ✅ Add License button (up to 20 licenses)
- ✅ Remove License button
- ✅ Auto-calculation of total licensing costs
- ✅ Status color coding (Yellow/Blue/Green)

#### **Section 2: Insurance Coverage**

**2A. Omani Employee Insurance:**

1. **Number of Omani Employees** (Required)
   - Type: Number input
   - Range: 0+

2. **Monthly Insurance Cost per Omani** (Required)
   - Type: Number input
   - Currency: OMR
   - Note: Social insurance is mandatory (15% of salary)

**2B. Expat Employee Insurance:**

1. **Number of Expat Employees** (Optional)
   - Type: Number input
   - Range: 0+

2. **Monthly Insurance Cost per Expat** (Optional)
   - Type: Number input
   - Currency: OMR
   - Note: Health insurance is mandatory for expats

#### **Section 3: Property & Premises**

1. **Property Status** (Required)
   - Type: Radio buttons
   - Options:
     - Rent (إيجار)
     - Owned (ملك)

2. **Monthly Value** (Required)
   - Type: Number input
   - Currency: OMR
   - Note: If owned, enter estimated monthly depreciation/opportunity cost
   - If rented, enter actual rent amount

3. **Property Description** (Optional)
   - Type: Text area
   - Purpose: Details about location, size, features
   - Max length: 500 characters

### **🤖 AI-Powered Features**

#### **AI Feature 1: License Requirement Validator**

**Location:** License table

**What AI Does:**
1. **Sector-Based Recommendations**
   - Reads project type from Level 0
   - Suggests mandatory licenses for that sector
   - Example: Industrial → "Environmental Permit Required"

2. **Missing License Warning**
   - Compares entered licenses against Omani regulatory database
   - Flags: "You may be missing: [License Name]"

3. **Cost Reasonability Check**
   - Compares entered costs against typical ranges
   - Warning: "This license typically costs 100-500 OMR, yours: 1,000 OMR"
   - AI: "Value seems high - please verify"

**AI Trigger:** When user adds 3+ licenses
**Visual Feedback:** Yellow alert card with recommendations

#### **AI Feature 2: Insurance Calculator Assistant**

**What AI Does:**
1. **Pulls Employee Data from Level 4**
   - Cross-references employee count with insurance coverage
   - Validation: "You have 5 Omanis in Level 4 but only insured 3 here"

2. **Cost Validation**
   - Checks if insurance cost aligns with salary (should be ~15% for Omanis)
   - Warning if too low/high

3. **Compliance Check**
   - Ensures all Omanis have social insurance (mandatory)
   - Ensures all expats have health insurance (mandatory)

**AI Trigger:** When user enters employee insurance data
**Visual Feedback:** Alert banner if mismatch detected

### **⚙️ Calculations & Automation**

#### **User-Entered Values:**
- All license details
- All insurance figures
- Property information

#### **System-Calculated Values:**

1. **Total Licensing Costs**
   - Formula: `Σ(all license costs)`
   - Display: Below license table
   - Format: "X,XXX OMR"

2. **Total Monthly Insurance Costs**
   - Formula: `(Omani count × Omani cost) + (Expat count × Expat cost)`
   - Display: In summary card
   - Format: "XXX OMR/month"

3. **Total Annual Insurance Costs**
   - Formula: `Total Monthly × 12`
   - Display: In summary card

4. **Property Annual Cost**
   - Formula: `Monthly Value × 12`
   - Display: In summary card

5. **Total Legal & Compliance Costs**
   - Formula: `Licensing + Annual Insurance + Annual Property`
   - Display: Large summary card
   - Visual: Gradient background

### **🌟 Unique Features**

1. **Three-Section Architecture**
   - Only level with three distinct data categories
   - Each section independent but contributes to total

2. **Status Tracking System**
   - Visual indicators for license completion
   - Progress bar for regulatory compliance

3. **Cross-Level Validation**
   - Validates insurance against Level 4 (HR)
   - Only level that looks ahead for validation

4. **Compliance Scoring**
   - Hidden score: % of mandatory licenses obtained
   - Used in final feasibility assessment

### **📚 User Guidance & Feedback**

#### **Pre-Completion Guidance:**

**Section-Specific Tips:**
- Licenses: "Add all required permits for your business type"
- Insurance: "Social insurance for Omanis is 15% of gross salary"
- Property: "If owned, enter opportunity cost (what you could rent it for)"

**Smart Alerts:**
- 🟡 "Typical industrial projects need 5-8 licenses"
- 🟡 "Don't forget municipality approval"
- 🔴 "Social insurance for Omanis is mandatory"

#### **Post-Completion Feedback:**
- ✅ "Legal framework complete - {X} licenses documented"
- ✅ XP award: +150 XP
- ✅ Compliance percentage shown: "85% regulatory compliance"
- ✅ Summary shows:
  - Total licensing cost
  - Monthly operating legal costs
  - Compliance status

### **📄 Documentation Output**

#### **Data Saved to Context:**
```javascript
{
  licenses: [
    {
      id: string,
      name: string,
      authority: string,
      cost: number,
      status: 'required' | 'in-process' | 'completed'
    }
  ],
  omaniInsurance: {
    employeeCount: number,
    monthlyCostPerEmployee: number
  },
  expatInsurance: {
    employeeCount: number,
    monthlyCostPerEmployee: number
  },
  property: {
    status: 'rent' | 'owned',
    monthlyValue: number,
    description?: string
  },
  totalLicensingCost: number,
  totalMonthlyInsurance: number
}
```

#### **Appears in Final Report:**
- **Section 5:** Legal & Regulatory Framework
  - 5.1: Required Licenses (table)
  - 5.2: Licensing Timeline & Costs
  - 5.3: Insurance Coverage Summary
  - 5.4: Property Arrangements
- **Financial Section:** Monthly operating costs (insurance + property)
- **Risk Analysis:** Regulatory compliance percentage

---

## **LEVEL 3: PHYSICAL RESOURCES & CAPITAL ASSETS**

### **🎯 Purpose**
Catalogs all physical assets and raw materials required for business operations. Calculates depreciation, determines total capital investment needs, and establishes the operational resource baseline.

### **📋 What This Level Contains**

#### **Section 1: Fixed Assets**

**Dynamic Fixed Assets Table:**

For each asset:
1. **Asset Name** (Required)
   - Type: Text input
   - Examples: "Industrial Oven", "Delivery Van", "Office Furniture"

2. **Asset Type** (Required)
   - Type: Dropdown
   - Options:
     - Buildings (مباني) - 25 years life / 4% depreciation
     - Machinery (آلات) - 10 years life / 10% depreciation
     - Equipment (معدات) - 5 years life / 20% depreciation
     - Furniture (أثاث) - 10 years life / 10% depreciation
     - Vehicles (مركبات) - 5 years life / 20% depreciation
     - Other (أخرى) - 8 years life / 12.5% depreciation

3. **Acquisition Method** (Required)
   - Type: Radio buttons
   - Options:
     - Purchase (شراء)
     - Lease (إيجار)

4. **Cost per Unit (OMR)** (Required)
   - Type: Number input
   - Range: 0+
   - Currency: Omani Rial

5. **Quantity** (Required)
   - Type: Number input
   - Range: 1+

6. **Auto-Calculated Fields (Read-Only):**
   - **Total Cost:** `Cost per Unit × Quantity`
   - **Annual Depreciation:** `Total Cost × Depreciation Rate`
   - **Useful Life:** Displays based on asset type

**Table Features:**
- ✅ Add Asset button (up to 50 assets)
- ✅ Remove Asset button
- ✅ Real-time totals calculation
- ✅ Color-coded by asset type

#### **Section 2: Raw Materials** (Conditional - Only for Agricultural/Industrial)

**Dynamic Raw Materials Table:**

For each material:
1. **Material Name** (Required)
   - Type: Text input
   - Examples: "Flour", "Plastic Resin", "Fertilizer"

2. **Monthly Cost (OMR)** (Required)
   - Type: Number input
   - Range: 0+

3. **Supplier** (Optional)
   - Type: Text input

**Conditional Display Logic:**
- If Level 0 type = Agricultural OR Industrial → Show this section
- If Level 0 type = Commercial OR Service → Hide this section

#### **Section 3: Investment Summary (Auto-Generated)**

**Read-Only Display Cards:**

1. **Total Fixed Assets Cost**
   - Sum of all asset total costs
   - Only purchased assets (leased excluded)

2. **Total Annual Depreciation**
   - Sum of all asset depreciation amounts
   - Affects profit calculations in Level 6

3. **Total Monthly Raw Material Cost**
   - Sum of all material costs
   - If section not displayed: Shows 0

4. **Total Capital Investment Required**
   - Formula: `Fixed Assets + (Raw Materials × 3 months) + Working Capital Buffer`
   - Working Capital = 3 months of raw materials + 3 months of operating costs

### **🤖 AI-Powered Features**

#### **AI Feature 1: Asset Depreciation Auto-Calculator**

**Location:** Fixed Assets table

**What AI Does:**
1. **Automatic Type Recognition**
   - When user selects asset type, AI auto-fills:
     - Useful life years
     - Depreciation percentage
     - Depreciation method (straight-line)

2. **Smart Depreciation Calculation**
   - Formula: `Annual Depreciation = Asset Cost × Depreciation Rate`
   - Example: 10,000 OMR equipment → 2,000 OMR/year (20%)

3. **Residual Value Calculation**
   - Calculates asset value after each year
   - Year 1: Cost - Depreciation
   - Year 2: Year 1 - Depreciation
   - Continues until value = 0

**AI Trigger:** When asset type selected
**Visual Feedback:** Auto-populated depreciation fields

#### **AI Feature 2: Investment Adequacy Validator**

**What AI Does:**
1. **Compares to Industry Benchmarks**
   - Reads project type from Level 0
   - Checks if total investment is realistic for sector
   - Warning: "Typical {sector} projects require 20,000-50,000 OMR"

2. **Fixed Asset to Raw Material Ratio Check**
   - For industrial/agricultural: Checks if ratio makes sense
   - Alert: "Your equipment cost is 3x your monthly material cost - is this correct?"

3. **Working Capital Sufficiency**
   - Ensures 3-month buffer is included
   - Warning: "You may need more working capital to sustain operations"

**AI Trigger:** When user saves level
**Visual Feedback:** Advisory card with recommendations

#### **AI Feature 3: Lease vs Purchase Optimizer**

**What AI Does:**
1. **Cost Comparison**
   - If asset is leased, calculates 5-year total
   - Compares: `Purchase cost vs (Monthly lease × 60)`
   - Recommendation: "Buying saves X OMR over 5 years"

2. **Cash Flow Impact**
   - Analyzes impact on initial investment
   - Suggestion: "Leasing reduces upfront cost by X OMR"

**AI Trigger:** When user selects acquisition method
**Visual Feedback:** Info tooltip with comparison

### **⚙️ Calculations & Automation**

#### **User-Entered Values:**
- All asset details
- All raw material costs
- Acquisition methods

#### **System-Calculated Values:**

1. **Per-Asset Calculations:**
   - Total Cost = `Cost per Unit × Quantity`
   - Annual Depreciation = `Total Cost × (1 / Useful Life Years)`
   - Example: 10,000 OMR equipment, 5 years → 2,000/year

2. **Aggregate Fixed Assets:**
   - Total Fixed Assets Cost = `Σ(all purchased asset costs)`
   - Total Annual Depreciation = `Σ(all asset depreciations)`

3. **Raw Materials Aggregate:**
   - Total Monthly Raw Material Cost = `Σ(all material costs)`
   - Annual Raw Material Cost = `Monthly × 12`

4. **Investment Calculations:**
   - Working Capital Needed = `(Monthly Raw Materials + Monthly Salaries from Level 4) × 3`
   - Pre-Operating Costs = `License Costs from Level 2 × 1.2`
   - **Total Investment = Fixed Assets + Working Capital + Pre-Operating Costs**

5. **Depreciation Schedule (5-10 Years):**
   - Generates year-by-year depreciation table
   - Book value reduces each year

### **🌟 Unique Features**

1. **Conditional Section Display**
   - Only level with conditional UI based on Level 0
   - Smart hiding of raw materials for service/commercial

2. **Multi-Asset Type Intelligence**
   - 6 different asset types with unique depreciation rates
   - Follows Omani accounting standards

3. **Purchase vs Lease Tracking**
   - Only purchased assets depreciate
   - Leased assets affect monthly expenses (Level 6)

4. **Three-Level Calculation Cascade**
   - Level calculations → Section totals → Grand total
   - Most complex calculation logic in the system

5. **Cross-Level Data Pull**
   - Pulls license costs from Level 2
   - Pulls salary data from Level 4
   - Only level that reads data from both directions

### **📚 User Guidance & Feedback**

#### **Pre-Completion Guidance:**

**Field-Specific Tooltips:**
- Asset Type: "Choose carefully - affects depreciation rate"
- Acquisition: "Purchase = depreciation + equity, Lease = monthly expense"
- Quantity: "Total units you plan to acquire"

**Smart Alerts:**
- 💡 "Equipment depreciates at 20%/year (5-year life)"
- 💡 "Buildings last 25 years (4% annual depreciation)"
- ⚠️ "Total investment: X,XXX OMR - ensure you have financing"

**Section Guidance:**
- Raw Materials: "Only shown for agricultural/industrial projects"
- "Working capital = 3 months of materials + salaries"

#### **Post-Completion Feedback:**
- ✅ "Physical resources documented: {X} assets, {Y} materials"
- ✅ XP award: +150 XP
- ✅ Summary displays:
  - Total assets: X,XXX OMR
  - Annual depreciation: X,XXX OMR
  - Required investment: X,XXX OMR
- ✅ Visual: Asset breakdown pie chart (by type)

### **📄 Documentation Output**

#### **Data Saved to Context:**
```javascript
{
  fixedAssets: [
    {
      id: string,
      name: string,
      type: 'buildings' | 'machinery' | 'equipment' | 'furniture' | 'vehicles' | 'other',
      acquisitionMethod: 'purchase' | 'lease',
      costPerUnit: number,
      quantity: number,
      totalCost: number,
      usefulLifeYears: number,
      annualDepreciation: number,
      depreciationRate: number
    }
  ],
  rawMaterials: [
    {
      id: string,
      name: string,
      monthlyCost: number,
      supplier?: string
    }
  ],
  totalFixedAssetsCost: number,
  totalAnnualDepreciation: number,
  totalMonthlyRawMaterialCost: number,
  workingCapitalNeeded: number,
  totalInvestmentRequired: number
}
```

#### **Appears in Final Report:**
- **Section 6:** Physical Resources & Assets
  - 6.1: Fixed Assets Inventory (table with depreciation)
  - 6.2: Depreciation Schedule (5-10 years)
  - 6.3: Raw Materials & Suppliers (if applicable)
  - 6.4: Capital Investment Breakdown
- **Financial Section:** Investment requirements chart
- **Cash Flow Statement:** Depreciation as non-cash expense

---

## **LEVEL 4: HUMAN RESOURCES & ORGANIZATIONAL STRUCTURE**

### **🎯 Purpose**
Defines the complete human capital structure, including all positions, salaries, benefits, and Omanization compliance. Calculates total HR costs and ensures alignment with Omani labor regulations.

### **📋 What This Level Contains**

#### **Section 1: Employee Structure**

**Dynamic Employee Table:**

For each position/role:
1. **Position Title** (Required)
   - Type: Text input
   - Examples: "General Manager", "Sales Associate", "Technician"

2. **Nationality** (Required)
   - Type: Dropdown
   - Options:
     - Omani (عماني)
     - Expat (وافد)

3. **Monthly Salary (OMR)** (Required)
   - Type: Number input
   - Range: 325+ (Omani minimum wage)
   - Currency: Omani Rial

4. **Number of Employees** (Required)
   - Type: Number input
   - Range: 1+
   - Purpose: How many people in this role

5. **Auto-Calculated Fields (Read-Only):**
   - **Total Monthly Salary:** `Monthly Salary × Number of Employees`

**Table Features:**
- ✅ Add Position button (up to 50 positions)
- ✅ Remove Position button
- ✅ Real-time totals calculation
- ✅ Nationality color coding (Green for Omani, Blue for Expat)

#### **Section 2: HR Cost Breakdown (Auto-Generated)**

**Read-Only Display Cards:**

1. **Total Number of Employees**
   - Sum of all employee counts
   - Breakdown: X Omanis, Y Expats

2. **Omanization Rate %**
   - Formula: `(Omani count / Total count) × 100`
   - Validation: Must be ≥35% for most sectors
   - Color:
     - Green if ≥35%
     - Red if <35%
   - Alert: "Minimum Omanization: 35% for most sectors"

3. **Total Monthly Salaries**
   - Sum of all position total salaries

4. **Social Insurance Cost (Omanis)**
   - Formula: `Total Omani Salaries × 15%`
   - Mandatory for all Omani employees
   - Breakdown: 7% employer, 7% employee, 1% government

5. **Health Insurance Cost (Expats)**
   - Formula: `Expat count × 50 OMR/month` (estimated)
   - Mandatory for all expat employees

6. **Training & Development Cost (Optional)**
   - User input: Annual budget
   - Suggestion: "Recommended: 2-5% of annual salaries"

7. **Total Monthly HR Cost**
   - Formula: `Salaries + Social Insurance/12 + Health Insurance + Training/12`

8. **Total Annual HR Cost**
   - Formula: `Total Monthly × 12`

#### **Section 3: Omanization Compliance**

**Compliance Dashboard:**

1. **Current Rate Display**
   - Large percentage indicator
   - Visual: Circular progress bar

2. **Status Indicator**
   - ✅ Compliant (≥35%)
   - ⚠️ Warning (30-34%)
   - ❌ Non-Compliant (<30%)

3. **Gap Analysis**
   - If non-compliant: "You need X more Omanis to reach 35%"
   - If over-compliant: "You exceed minimum by X%"

### **🤖 AI-Powered Features**

#### **AI Feature 1: Salary Fairness Validator**

**Location:** Employee table

**What AI Does:**
1. **Market Rate Comparison**
   - Checks entered salary against Omani market averages
   - Database of typical salaries by position
   - Warning: "Sales Manager typically earns 800-1,200 OMR - yours: 400 OMR"

2. **Minimum Wage Enforcement**
   - Ensures all Omani salaries ≥325 OMR
   - Hard validation: Cannot save if below minimum

3. **Internal Equity Check**
   - Compares similar positions
   - Alert: "Technician 1 earns 600, Technician 2 earns 400 - large gap"

**AI Trigger:** When user enters salary
**Visual Feedback:** Yellow/Red alert if anomaly detected

#### **AI Feature 2: Omanization Optimizer**

**What AI Does:**
1. **Automatic Compliance Checking**
   - Calculates rate in real-time
   - Warns immediately if drops below 35%

2. **Smart Recommendations**
   - Suggests: "Replace 1 expat position with Omani to reach 40%"
   - Shows cost impact: "This increases costs by X OMR but ensures compliance"

3. **Role Substitution Suggestions**
   - AI identifies which expat roles could be Omanized
   - Prioritizes: Entry-level → Mid-level → Senior
   - Recommendation: "Consider Omanizing: Sales Associate position"

**AI Trigger:** When Omanization rate calculated
**Visual Feedback:** Advisory card with suggestions

#### **AI Feature 3: HR Budget Optimizer**

**What AI Does:**
1. **Total Cost Projection**
   - Calculates 5-year HR cost projection
   - Includes: Inflation (2-3%), promotions, growth

2. **Cost-Revenue Ratio Analysis**
   - Compares HR costs to projected revenue (from Level 5)
   - Benchmark: HR should be 30-50% of revenue
   - Warning: "HR costs are 70% of revenue - unusually high"

3. **Training Investment Recommendation**
   - Suggests: "Invest 3% of salaries in training (X OMR/year)"
   - Explains: "Increases productivity and Omanization success"

**AI Trigger:** When user completes employee table
**Visual Feedback:** Summary card with projections

### **⚙️ Calculations & Automation**

#### **User-Entered Values:**
- All employee details
- Training budget (optional)

#### **System-Calculated Values:**

1. **Per-Position Calculations:**
   - Total Salary = `Monthly Salary × Employee Count`

2. **Aggregate Calculations:**
   - Total Employees = `Σ(all employee counts)`
   - Total Omanis = `Σ(Omani employee counts)`
   - Total Expats = `Σ(Expat employee counts)`
   - Total Monthly Salaries = `Σ(all position total salaries)`

3. **Omanization Calculation:**
   - Formula: `(Total Omanis / Total Employees) × 100`
   - Rounded to 1 decimal place

4. **Insurance Calculations:**
   - Social Insurance (Omanis) = `Total Omani Salaries × 15%`
   - Health Insurance (Expats) = `Total Expats × 50 OMR`

5. **Total HR Costs:**
   - Monthly = `Salaries + (Social Insurance/12) + Health Insurance + (Training/12)`
   - Annual = `Monthly × 12`

6. **Cost Breakdown Percentages:**
   - Salaries: X%
   - Social Insurance: Y%
   - Health Insurance: Z%
   - Training: W%

### **🌟 Unique Features**

1. **Dual-Track Nationality System**
   - Only level that distinguishes Omani vs Expat
   - Different cost implications for each

2. **Regulatory Compliance Enforcer**
   - Hard validation for Omanization rate
   - Cannot proceed if severely non-compliant

3. **Multi-Layer Cost Calculation**
   - Base salaries
   - Mandatory insurance (15% for Omanis)
   - Optional benefits (training)
   - Most comprehensive cost model

4. **Real-Time Compliance Dashboard**
   - Visual feedback on Omanization status
   - Color-coded alerts

5. **Cross-Level Validation**
   - Validates against insurance in Level 2
   - Provides data to Level 3 (working capital)
   - Provides data to Level 6 (financial projections)

### **📚 User Guidance & Feedback**

#### **Pre-Completion Guidance:**

**Field-Specific Tooltips:**
- Salary: "Minimum wage for Omanis: 325 OMR"
- Nationality: "Affects insurance requirements and Omanization rate"
- Count: "Total employees for this position"

**Omanization Guidance:**
- 📊 "Your current rate: X% (minimum: 35%)"
- ✅ "Compliant with Omanization requirements"
- ⚠️ "Add X more Omanis to reach 35%"

**Smart Alerts:**
- 💡 "Social insurance for Omanis: 15% of gross salary"
- 💡 "Health insurance for expats: ~50 OMR/month per person"
- 💡 "Training budget recommendation: 2-5% of annual payroll"

#### **Post-Completion Feedback:**
- ✅ "HR structure complete: {X} positions, {Y} employees"
- ✅ XP award: +200 XP
- ✅ Omanization status: "{X}% - Compliant ✅"
- ✅ Summary displays:
  - Total employees
  - Omanization rate
  - Monthly HR cost
  - Annual HR cost
- ✅ Visual: HR cost breakdown pie chart

### **📄 Documentation Output**

#### **Data Saved to Context:**
```javascript
{
  employees: [
    {
      id: string,
      position: string,
      nationality: 'omani' | 'expat',
      monthlySalary: number,
      count: number,
      totalMonthlySalary: number
    }
  ],
  totalEmployees: number,
  totalOmanis: number,
  totalExpats: number,
  omanizationRate: number,
  totalMonthlySalaries: number,
  socialInsuranceCost: number,
  healthInsuranceCost: number,
  trainingCostAnnual: number,
  totalMonthlyHRCost: number,
  totalAnnualHRCost: number
}
```

#### **Appears in Final Report:**
- **Section 7:** Human Resources & Organization
  - 7.1: Organizational Structure (chart)
  - 7.2: Employee Roster (table)
  - 7.3: Salary Structure
  - 7.4: Omanization Analysis
  - 7.5: HR Cost Breakdown
- **Financial Section:** Monthly operating costs (salaries + insurance)
- **Compliance Section:** Omanization compliance statement

---

## **LEVEL 5: MARKET ANALYSIS & COMPETITIVE STRATEGY**

### **🎯 Purpose**
Conducts comprehensive market research by analyzing competitors, defining products/services with pricing, projecting revenue, and performing an enhanced SWOT analysis with up to 9 points per quadrant. Establishes market positioning and go-to-market strategy.

### **📋 What This Level Contains**

#### **Section 1: Competitor Analysis**

**Dynamic Competitor Table:**

For each competitor (up to 3):
1. **Competitor Name** (Required)
   - Type: Text input
   - Example: "ABC Trading LLC"

2. **Strengths** (Required)
   - Type: Text area
   - Purpose: List competitor advantages
   - Max length: 500 characters

3. **Weaknesses** (Required)
   - Type: Text area
   - Purpose: List competitor vulnerabilities
   - Max length: 500 characters

4. **Market Share** (Optional)
   - Type: Number input
   - Range: 0-100%

**Table Features:**
- ✅ Add Competitor button (max 3)
- ✅ Remove Competitor button
- ✅ Expandable cards for each competitor
- ✅ Color-coded strength/weakness indicators

#### **Section 2: Products & Services**

**Dynamic Product Table:**

For each product/service:
1. **Product/Service Name** (Required)
   - Type: Text input
   - Example: "Premium Coffee Beans - 1kg"

2. **Description** (Optional)
   - Type: Text area
   - Max length: 300 characters

3. **Price (OMR)** (Required)
   - Type: Number input
   - Range: 0.01+
   - Currency: Omani Rial

4. **Cost per Unit (OMR)** (Required)
   - Type: Number input
   - Purpose: Direct cost to produce/acquire
   - Range: 0+

5. **Expected Monthly Sales** (Required)
   - Type: Number input
   - Range: 1+
   - Purpose: Quantity sold per month

6. **Auto-Calculated Fields (Read-Only):**
   - **Profit per Unit:** `Price - Cost per Unit`
   - **Profit Margin %:** `(Profit / Price) × 100`
   - **Monthly Revenue:** `Price × Monthly Sales`
   - **Monthly Profit:** `Profit per Unit × Monthly Sales`

**Table Features:**
- ✅ Add Product button (up to 20 products)
- ✅ Remove Product button
- ✅ Real-time calculations
- ✅ Profit margin color coding:
  - Green: ≥30%
  - Yellow: 15-29%
  - Red: <15%

#### **Section 3: Enhanced SWOT Analysis**

**Four Quadrants - Up to 9 Points Each:**

**Strengths (نقاط القوة)**
- Dynamic array input (min 1, max 9)
- Each point: Text input
- Add/Remove buttons
- Color: Green gradient

**Weaknesses (نقاط الضعف)**
- Dynamic array input (min 1, max 9)
- Each point: Text input
- Add/Remove buttons
- Color: Red gradient

**Opportunities (الفرص)**
- Dynamic array input (min 1, max 9)
- Each point: Text input
- Add/Remove buttons
- Color: Blue gradient

**Threats (التهديدات)**
- Dynamic array input (min 1, max 9)
- Each point: Text input
- Add/Remove buttons
- Color: Orange gradient

**SWOT Features:**
- ✅ Point counter for each quadrant (X/9)
- ✅ Visual grid layout
- ✅ Color-coded sections
- ✅ Balance indicator (warns if one quadrant has 9 but another has 1)

#### **Section 4: Revenue Summary (Auto-Generated)**

**Read-Only Display Cards:**

1. **Total Monthly Revenue**
   - Sum of all product monthly revenues
   - Format: X,XXX OMR

2. **Total Annual Revenue**
   - Formula: `Monthly Revenue × 12`
   - Format: X,XXX OMR

3. **Average Profit Margin**
   - Formula: `(Total Profit / Total Revenue) × 100`
   - Weighted average across all products

4. **Revenue by Product**
   - Visual: Horizontal bar chart
   - Shows % contribution of each product

### **🤖 AI-Powered Features**

#### **AI Feature 1: Competitor Intelligence Analyzer**

**Location:** Competitor Analysis section

**What AI Does:**
1. **Competitive Advantage Identifier**
   - Analyzes competitor strengths/weaknesses
   - Cross-references with your SWOT
   - Recommendation: "Competitor A is strong in pricing - consider competing on quality"

2. **Market Gap Detector**
   - Identifies weaknesses across all competitors
   - Suggestion: "All competitors lack online ordering - this is your opportunity"

3. **Differentiation Strategy Generator**
   - AI suggests: "Your differentiators: X, Y, Z"
   - Based on competitor weaknesses and your strengths

**AI Trigger:** When 2+ competitors added
**Visual Feedback:** Strategy recommendation card

#### **AI Feature 2: Pricing Optimizer**

**Location:** Products table

**What AI Does:**
1. **Profit Margin Validator**
   - Checks if margin is realistic
   - Warning: "15% margin is low for retail - typical: 30-50%"
   - Alert: "Negative margin detected - price below cost!"

2. **Competitive Pricing Benchmark**
   - Compares your price to typical market rates (if available)
   - Suggestion: "Similar products typically priced at 5-10 OMR"

3. **Revenue Realism Check**
   - Validates monthly sales projections
   - Warning: "Selling 10,000 units/month seems high for a startup"
   - Uses industry benchmarks by sector

4. **Price Elasticity Insights**
   - AI suggests: "Reduce price by 10% could increase sales by 30%"
   - Based on typical demand curves

**AI Trigger:** When product price/cost entered
**Visual Feedback:** Yellow alert for warnings, green for good margins

#### **AI Feature 3: SWOT Intelligence Assistant**

**Location:** SWOT Analysis section

**What AI Does:**
1. **SWOT Balance Checker**
   - Ensures balanced analysis (not 9 strengths, 1 weakness)
   - Alert: "Add more threats - you've only identified 1"

2. **Auto-Population Suggestions**
   - Based on previous level data:
     - Strength: "Strong Omanization rate: {X}%"
     - Weakness: "High initial investment required"
     - Opportunity: "Growing {sector} market in Oman"
     - Threat: "X competitors already established"

3. **Strategic Insight Generator**
   - Analyzes SWOT matrix
   - Generates strategies:
     - SO: Use strengths to capitalize on opportunities
     - ST: Use strengths to counter threats
     - WO: Overcome weaknesses to exploit opportunities
     - WT: Minimize weaknesses and avoid threats

4. **Priority Scorer**
   - Ranks which items are most critical
   - Highlights: "Your top 3 strengths: X, Y, Z"

**AI Trigger:** When user adds SWOT points
**Visual Feedback:** Suggestion chips, strategic recommendations

### **⚙️ Calculations & Automation**

#### **User-Entered Values:**
- All competitor information
- All product details (name, price, cost, sales)
- All SWOT points

#### **System-Calculated Values:**

1. **Per-Product Calculations:**
   - Profit per Unit = `Price - Cost`
   - Profit Margin % = `(Profit / Price) × 100`
   - Monthly Revenue = `Price × Monthly Sales`
   - Monthly Profit = `Profit per Unit × Monthly Sales`

2. **Aggregate Revenue:**
   - Total Monthly Revenue = `Σ(all product monthly revenues)`
   - Total Annual Revenue = `Monthly Revenue × 12`

3. **Profitability Metrics:**
   - Total Monthly Profit = `Σ(all product monthly profits)`
   - Average Profit Margin = `(Total Profit / Total Revenue) × 100`

4. **Product Mix Analysis:**
   - Revenue % per Product = `(Product Revenue / Total Revenue) × 100`
   - Identifies top revenue generators

5. **SWOT Statistics:**
   - Total points per quadrant
   - Balance score (variance between quadrants)

### **🌟 Unique Features**

1. **Triple Analysis Framework**
   - Only level with three distinct analytical sections:
     - Competitive landscape
     - Product economics
     - Strategic positioning (SWOT)

2. **Enhanced SWOT (9 Points)**
   - Most comprehensive SWOT in any business platform
   - Traditional SWOT: 3-4 points
   - YieldX SWOT: Up to 9 points per quadrant (36 total)

3. **Revenue Generator**
   - First level that calculates actual revenue
   - Critical for financial projections in Level 6

4. **Profit Margin Intelligence**
   - Real-time profit margin calculation
   - Color-coded warnings for low margins

5. **Visual Strategy Tools**
   - SWOT grid visualization
   - Product revenue breakdown chart
   - Competitor comparison matrix

### **📚 User Guidance & Feedback**

#### **Pre-Completion Guidance:**

**Section-Specific Tips:**
- Competitors: "Identify direct competitors in your market"
- Products: "Be realistic with pricing - too low = losses, too high = no sales"
- SWOT: "Aim for 3-5 points per quadrant for balanced analysis"

**Smart Alerts:**
- 💡 "Profit margin below 20% - review pricing or costs"
- 💡 "Your SWOT is unbalanced - add more {quadrant} points"
- ⚠️ "Monthly sales seem high - validate with market research"
- ✅ "Good profit margin: 35% - sustainable for retail"

**Inline Calculations:**
- Shows profit margin immediately after entering price/cost
- Updates total revenue as products added

#### **Post-Completion Feedback:**
- ✅ "Market analysis complete: {X} competitors, {Y} products analyzed"
- ✅ XP award: +200 XP
- ✅ Summary displays:
  - Total monthly revenue: X,XXX OMR
  - Average profit margin: X%
  - Top 3 revenue products
  - SWOT summary (X strengths, Y weaknesses, Z opportunities, W threats)
- ✅ Visual: Product revenue contribution pie chart
- ✅ Competitive positioning statement

### **📄 Documentation Output**

#### **Data Saved to Context:**
```javascript
{
  competitors: [
    {
      id: string,
      name: string,
      strengths: string,
      weaknesses: string,
      marketShare?: number
    }
  ],
  products: [
    {
      id: string,
      name: string,
      description?: string,
      price: number,
      costPerUnit: number,
      expectedMonthlySales: number,
      profitPerUnit: number,
      profitMargin: number,
      monthlyRevenue: number,
      monthlyProfit: number
    }
  ],
  swot: {
    strengths: string[],
    weaknesses: string[],
    opportunities: string[],
    threats: string[]
  },
  totalMonthlyRevenue: number,
  totalAnnualRevenue: number,
  averageProfitMargin: number
}
```

#### **Appears in Final Report:**
- **Section 8:** Market Analysis & Competitive Landscape
  - 8.1: Competitive Analysis (table)
  - 8.2: Competitive Positioning Matrix
  - 8.3: Product/Service Catalog (with pricing)
  - 8.4: Revenue Projections
  - 8.5: SWOT Analysis (full grid)
  - 8.6: Strategic Recommendations
- **Financial Section:** Revenue assumptions and pricing strategy
- **Executive Summary:** Key market insights

---

## **LEVEL 6: FINANCING STRUCTURE & FINANCIAL KPIs**

### **🎯 Purpose**
Establishes the complete financial structure by calculating total investment needs, defining financing sources (equity + loans), projecting 5-10 year financial statements, and computing 8 critical financial KPIs including IRR, NPV, ROI, ROE, Payback Period, Break-even Point, Current Ratio, and Debt-to-Equity.

### **📋 What This Level Contains**

#### **Section 1: Investment Summary (Auto-Calculated from Previous Levels)**

**Read-Only Display Cards:**

1. **Fixed Assets Cost**
   - Pulled from Level 3
   - Total cost of all purchased assets

2. **Working Capital (3 Months)**
   - Formula: `(Monthly Salaries from Level 4 + Monthly Raw Materials from Level 3) × 3`
   - Buffer for initial operations

3. **Pre-Operating Costs**
   - Formula: `License Costs from Level 2 × 1.2`
   - Includes setup and launch expenses

4. **Total Investment Required**
   - Formula: `Fixed Assets + Working Capital + Pre-Operating Costs`
   - Format: X,XXX OMR
   - Visual: Large prominent card with gradient

#### **Section 2: Financing Structure**

**User Input Fields:**

1. **Equity Capital (OMR)** (Required)
   - Type: Number input
   - Range: 0+
   - Purpose: Owner's own contribution
   - Currency: Omani Rial

2. **Loan Amount (OMR)** (Optional)
   - Type: Number input
   - Range: 0+
   - Purpose: Bank loan or external financing

3. **Annual Interest Rate (%)** (Conditional - if loan >0)
   - Type: Number input
   - Range: 0-20%
   - Default: 5%
   - Purpose: Cost of debt

4. **Grace Period (Months)** (Conditional - if loan >0)
   - Type: Number input
   - Range: 0-24
   - Default: 6
   - Purpose: Interest-only period before principal payments

5. **Loan Term (Years)** (Conditional - if loan >0)
   - Type: Number input
   - Range: 1-15
   - Default: 5

**Auto-Calculated Financing Metrics:**

1. **Total Financing**
   - Formula: `Equity + Loan`
   - Display: X,XXX OMR

2. **Equity Percentage**
   - Formula: `(Equity / Total Financing) × 100`
   - Display: X%

3. **Loan Percentage**
   - Formula: `(Loan / Total Financing) × 100`
   - Display: X%

4. **Financing Gap**
   - Formula: `Total Investment - Total Financing`
   - Color:
     - Green if ≥0 (sufficient)
     - Red if <0 (shortfall)
   - Alert: "You need X,XXX OMR more to cover investment"

#### **Section 3: Growth Assumptions**

**User Input Fields:**

1. **Annual Revenue Growth Rate (%)**
   - Type: Number input
   - Range: 0-50%
   - Default: 10%
   - Purpose: Year-over-year revenue increase

2. **Annual Cost Growth Rate (%)**
   - Type: Number input
   - Range: 0-30%
   - Default: 5%
   - Purpose: Year-over-year cost increase (inflation, etc.)

#### **Section 4: Income Statement Projections (Auto-Generated)**

**5-10 Year Pro Forma Income Statement:**

For each year (5 years in Quick/Detailed mode, 10 years in Advanced):

**Revenue:**
- Year 1: `Annual Revenue from Level 5`
- Year N: `Year (N-1) × (1 + Revenue Growth Rate)`

**Costs:**
- Operating Costs Year 1: `Monthly Operating Costs from Levels 2,3,4 × 12`
- Year N: `Year (N-1) × (1 + Cost Growth Rate)`

**Depreciation:**
- From Level 3: Annual Depreciation (constant each year)

**Interest:**
- If loan: `Loan Amount × Interest Rate`

**Net Profit:**
- Formula: `Revenue - Operating Costs - Depreciation - Interest`

**Table Display:**
- Columns: Year, Revenue, Costs, Depreciation, Interest, Net Profit
- Color-coded:
  - Green for positive profit
  - Red for negative (losses)

#### **Section 5: Financial KPIs (Auto-Calculated)**

**8 Critical Financial Indicators:**

**1. Internal Rate of Return (IRR) %**
- Definition: Discount rate where NPV = 0
- Calculation: Newton-Raphson method
- Formula:
  ```
  Cash Flows: [-Total Investment, Profit Year 1, Profit Year 2, ..., Profit Year N]
  Find IRR where: Σ(Cash Flow_t / (1+IRR)^t) = 0
  ```
- Interpretation:
  - >20%: Excellent
  - 15-20%: Good
  - 10-15%: Acceptable
  - <10%: Poor

**2. Net Present Value (NPV) OMR**
- Definition: Present value of future cash flows minus initial investment
- Calculation: Uses 10% discount rate
- Formula:
  ```
  NPV = Σ(Profit_t / (1+0.10)^t) - Investment
  ```
- Interpretation:
  - >0: Project adds value
  - =0: Break-even
  - <0: Destroys value

**3. Return on Investment (ROI) %**
- Definition: Total return relative to investment
- Formula:
  ```
  ROI = (Total Profit over N years / Total Investment) × 100
  ```
- Interpretation:
  - >100%: Excellent (doubles investment)
  - 50-100%: Good
  - 20-50%: Acceptable
  - <20%: Poor

**4. Return on Equity (ROE) %**
- Definition: Annual return on owner's equity
- Formula:
  ```
  ROE = (Average Annual Profit / Equity) × 100
  ```
- Interpretation:
  - >25%: Excellent
  - 15-25%: Good
  - 10-15%: Acceptable
  - <10%: Poor

**5. Payback Period (Years)**
- Definition: Time to recover initial investment
- Calculation: Year when cumulative profit ≥ investment
- Algorithm:
  ```
  Cumulative = -Investment
  For each year:
    Cumulative += Profit
    If Cumulative ≥ 0: Return year + fraction
  ```
- Interpretation:
  - <2 years: Excellent
  - 2-3 years: Good
  - 3-5 years: Acceptable
  - >5 years: Risky

**6. Break-Even Point (Units/Month)**
- Definition: Sales volume where profit = 0
- Formula:
  ```
  Fixed Costs = Salaries + Rent + Depreciation/12
  Variable Cost per Unit = Average Product Cost
  BEP = Fixed Costs / (Price - Variable Cost per Unit)
  ```
- Interpretation:
  - Compare to expected monthly sales from Level 5
  - If BEP < Expected Sales: Safe margin
  - If BEP > Expected Sales: Risky

**7. Current Ratio**
- Definition: Ability to pay short-term liabilities
- Formula:
  ```
  Current Assets = Working Capital
  Current Liabilities = 3 months operating costs
  Current Ratio = Current Assets / Current Liabilities
  ```
- Interpretation:
  - >2.0: Strong liquidity
  - 1.5-2.0: Good
  - 1.0-1.5: Acceptable
  - <1.0: Poor liquidity

**8. Debt-to-Equity Ratio**
- Definition: Financial leverage
- Formula:
  ```
  D/E = Loan / Equity
  ```
- Interpretation:
  - 0.0: No debt (100% equity)
  - 0.5: Healthy (1:2 debt:equity)
  - 1.0: Balanced (1:1)
  - >2.0: High leverage (risky)

**KPI Display:**
- Each KPI in colored card:
  - IRR: Green gradient
  - NPV: Blue gradient
  - ROI: Purple gradient
  - ROE: Teal gradient
  - Payback: Orange gradient
  - Break-even: Yellow gradient
  - Current Ratio: Indigo gradient
  - D/E: Pink gradient

#### **Section 6: Feasibility Assessment (Auto-Generated)**

**System Viability Check:**

Automatic assessment based on:
- IRR >15%
- NPV >0
- Payback Period <5 years

**Result:**
- ✅ **Project is Financially Viable**
  - Green card with checkmark
  - Message: "Financial indicators are positive"

- ⚠️ **Project Needs Review**
  - Yellow card with warning
  - Message: "Some indicators need improvement"
  - Lists specific concerns

### **🤖 AI-Powered Features**

#### **AI Feature 1: Financing Structure Optimizer**

**Location:** Financing section

**What AI Does:**
1. **Optimal Capital Structure Recommendation**
   - Analyzes total investment need
   - Suggests ideal equity:debt ratio
   - Recommendation: "For {investment} OMR, consider 60% equity, 40% loan"

2. **Loan Affordability Calculator**
   - Calculates maximum affordable loan based on projected profit
   - Formula: `Safe Loan = Annual Profit × 3`
   - Warning: "Your loan exceeds 3× annual profit - may be risky"

3. **Interest Rate Validator**
   - Compares entered rate to Omani bank averages (4-7%)
   - Alert: "Your rate (12%) is high - typical: 5-7%"

**AI Trigger:** When user enters financing amounts
**Visual Feedback:** Advisory card with recommendations

#### **AI Feature 2: Financial Projection Validator**

**Location:** Growth assumptions

**What AI Does:**
1. **Growth Rate Realism Check**
   - Validates revenue growth rate
   - Warning: "30% annual growth is aggressive for year 1-3"
   - Suggestion: "Conservative: 5-10%, Moderate: 10-20%, Aggressive: 20%+"

2. **Cost Inflation Alignment**
   - Checks cost growth rate
   - Typical: 2-5% (inflation)
   - Alert: "10% cost growth is very high - verify"

3. **Break-Even Timeline Estimator**
   - Predicts when business becomes profitable
   - Display: "Expected profitability: Year 2, Month 4"

**AI Trigger:** When user enters growth rates
**Visual Feedback:** Timeline visualization

#### **AI Feature 3: KPI Benchmarking Intelligence**

**Location:** KPI section

**What AI Does:**
1. **Sector-Specific Benchmarking**
   - Reads project type from Level 0
   - Compares KPIs to industry averages
   - Example: "Your IRR (18%) exceeds retail average (12-15%)"

2. **Red Flag Detector**
   - Identifies concerning metrics
   - Flags:
     - Negative NPV → "Project destroys value"
     - Payback >10 years → "Too long to recover investment"
     - D/E >3.0 → "Extremely high debt risk"

3. **Strength Highlighter**
   - Identifies strong metrics
   - Highlights:
     - IRR >25% → "Exceptional return potential"
     - Payback <2 years → "Rapid investment recovery"

4. **Improvement Suggestions**
   - AI suggests: "To improve IRR from 12% to 15%:"
     - "Reduce costs by 5%"
     - "Increase prices by 3%"
     - "Accelerate sales growth to 15%"

**AI Trigger:** After KPI calculation
**Visual Feedback:** Benchmark comparison cards

### **⚙️ Calculations & Automation**

#### **User-Entered Values:**
- Equity amount
- Loan amount (if applicable)
- Interest rate, grace period, loan term (if loan)
- Revenue growth rate
- Cost growth rate

#### **System-Calculated Values:**

**Investment Needs (from previous levels):**
- Fixed Assets: Level 3
- Working Capital: Levels 3 & 4
- Pre-Operating: Level 2

**Financing Calculations:**
- Total Financing
- Equity %
- Loan %
- Financing Gap

**Projection Calculations (per year):**
- Revenue: `Base × (1 + Growth)^year`
- Costs: `Base × (1 + Growth)^year`
- Depreciation: Constant from Level 3
- Interest: `Loan × Rate`
- Profit: `Revenue - Costs - Depreciation - Interest`

**KPI Algorithms:**
- IRR: Newton-Raphson iterative method (5 iterations)
- NPV: Discounted cash flow @ 10%
- ROI: Total profit / Investment
- ROE: Avg profit / Equity
- Payback: Cumulative cash flow analysis
- Break-even: Fixed costs / Contribution margin
- Current Ratio: Current assets / Current liabilities
- D/E: Loan / Equity

### **🌟 Unique Features**

1. **Most Calculation-Intensive Level**
   - 8 financial KPIs computed automatically
   - 5-10 year projections generated
   - Complex financial modeling

2. **Multi-Algorithm Financial Engine**
   - IRR calculation: Iterative Newton-Raphson
   - NPV: Discounted cash flow
   - Break-even: Algebraic solution

3. **Data Integration Champion**
   - Pulls data from ALL previous levels:
     - Level 2: Licensing costs
     - Level 3: Assets, depreciation, materials
     - Level 4: Salaries, insurance
     - Level 5: Revenue projections
   - Only level that uses data from 4 previous levels

4. **Real-Time Feasibility Judgment**
   - Automatic viability assessment
   - Green/yellow/red status indicator

5. **Dual Time Horizon**
   - 5 years in Quick/Detailed modes
   - 10 years in Advanced mode
   - Adapts based on study mode from pre-start

### **📚 User Guidance & Feedback**

#### **Pre-Completion Guidance:**

**Investment Summary:**
- 💡 "Total investment auto-calculated from previous levels"
- 💡 "Working capital = 3 months of operations"

**Financing Guidance:**
- 💡 "Equity should ideally cover 50-70% of investment"
- 💡 "Typical loan rates in Oman: 5-7%"
- ⚠️ "Total financing must ≥90% of investment to proceed"

**Growth Assumptions:**
- 💡 "Conservative growth: 5-10% annually"
- 💡 "Cost growth typically matches inflation: 2-5%"

**Smart Alerts:**
- ✅ "Financing is sufficient - you have X OMR surplus"
- ⚠️ "Financing shortfall: X OMR - increase equity or loan"
- 🔴 "Payback period exceeds 10 years - project may not be viable"

#### **Post-Completion Feedback:**
- ✅ "Financial analysis complete - 8 KPIs calculated"
- ✅ XP award: +300 XP (highest level)
- ✅ Feasibility verdict:
  - "✅ Project is Financially Viable"
  - "⚠️ Project Needs Review"
- ✅ Summary displays:
  - IRR: X%
  - NPV: X,XXX OMR
  - ROI: X%
  - Payback: X years
- ✅ Visual: 10-year profit projection line chart

### **📄 Documentation Output**

#### **Data Saved to Context:**
```javascript
{
  totalInvestment: number,
  equity: number,
  loan: number,
  interestRate: number,
  gracePeriodMonths: number,
  loanTermYears: number,
  revenueGrowthRate: number,
  costGrowthRate: number,
  projections: [
    {
      year: number,
      revenue: number,
      costs: number,
      depreciation: number,
      interest: number,
      profit: number
    }
  ],
  kpis: {
    irr: number,
    npv: number,
    roi: number,
    roe: number,
    paybackPeriod: number,
    breakEvenUnits: number,
    currentRatio: number,
    debtToEquity: number
  }
}
```

#### **Appears in Final Report:**
- **Section 9:** Financial Analysis & Projections
  - 9.1: Investment Requirements (breakdown)
  - 9.2: Financing Structure (pie chart)
  - 9.3: Pro Forma Income Statement (5-10 years table)
  - 9.4: Cash Flow Projections
  - 9.5: Financial KPIs Dashboard (all 8 metrics)
  - 9.6: Sensitivity Analysis
  - 9.7: Financial Feasibility Conclusion
- **Executive Summary:** Key financial highlights (IRR, NPV, Payback)
- **Risk Analysis:** Debt service coverage, liquidity ratios

---

## **LEVEL 7: BUSINESS MODEL CANVAS & OMAN 2040 CONTRIBUTION**

### **🎯 Purpose**
Synthesizes the entire business model into the comprehensive Business Model Canvas framework, establishes implementation timeline with milestones, and documents contribution to Oman Vision 2040 in terms of job creation, economic diversification, and skills development.

### **📋 What This Level Contains**

#### **Section 1: Business Model Canvas (9 Components)**

**Interactive BMC Grid - Up to 5 items per component:**

**1. Key Partners (الشركاء الرئيسيون)**
- Location: Left column, top
- Dynamic array: 1-5 partners
- Type: Text input per partner
- Examples: "Suppliers", "Distributors", "Strategic Alliances"
- Color: Purple gradient

**2. Key Activities (الأنشطة الرئيسية)**
- Location: Left column, middle
- Dynamic array: 1-5 activities
- Type: Text input per activity
- Examples: "Production", "Marketing", "Quality Control"
- Color: Blue gradient

**3. Key Resources (الموارد الرئيسية)**
- Location: Left column, bottom
- Dynamic array: 1-5 resources
- Type: Text input per resource
- Examples: "Equipment", "Skilled Staff", "Technology"
- Color: Green gradient

**4. Value Proposition (عرض القيمة)**
- Location: Center column, full height (emphasis)
- Dynamic array: 1-5 propositions
- Type: Text input per proposition
- Examples: "High Quality", "Fast Delivery", "Competitive Price"
- Color: Orange/Red gradient (prominent)
- Visual: Larger cards than other sections

**5. Customer Relationships (العلاقة مع العملاء)**
- Location: Right column, top-middle
- Dynamic array: 1-5 relationships
- Type: Text input per relationship
- Examples: "Customer Service", "Loyalty Program", "After-Sales Support"
- Color: Teal gradient

**6. Channels (القنوات)**
- Location: Right column, middle
- Dynamic array: 1-5 channels
- Type: Text input per channel
- Examples: "Physical Store", "Website", "Social Media", "Distributors"
- Color: Cyan gradient

**7. Customer Segments (شرائح العملاء)**
- Location: Right column, bottom
- Dynamic array: 1-5 segments
- Type: Text input per segment
- Examples: "Retail Customers", "B2B Clients", "Youth 18-30"
- Color: Pink gradient

**8. Cost Structure (هيكل التكاليف)**
- Location: Bottom, left half
- Dynamic array: 1-5 cost types
- Type: Text input per cost
- Examples: "Salaries", "Raw Materials", "Rent", "Marketing"
- Color: Red gradient

**9. Revenue Streams (مصادر الإيرادات)**
- Location: Bottom, right half
- Dynamic array: 1-5 streams
- Type: Text input per stream
- Examples: "Product Sales", "Service Fees", "Subscriptions"
- Color: Emerald/Green gradient

**BMC Features:**
- ✅ Visual grid layout (matches standard BMC poster)
- ✅ Add/Remove items per section
- ✅ Item counter (X/5) for each component
- ✅ Color-coded sections for quick identification
- ✅ Responsive: Stacks on mobile, grid on desktop

#### **Section 2: Implementation Timeline**

**Dynamic Milestone Table:**

For each milestone:
1. **Task/Milestone** (Required)
   - Type: Text input
   - Examples: "Legal Registration", "Equipment Purchase", "Staff Hiring"

2. **Duration (Weeks)** (Required)
   - Type: Number input
   - Range: 1-52

3. **Start Month** (Required)
   - Type: Number input
   - Range: 1-12
   - Purpose: Which month to begin (1=January, etc.)

**Timeline Features:**
- ✅ Add Milestone button (up to 20 milestones)
- ✅ Remove Milestone button
- ✅ Visual: Gantt-style bar display (optional future enhancement)
- ✅ Total timeline calculation (earliest to latest)

#### **Section 3: Oman Vision 2040 Contribution**

**3A. Job Creation Impact:**

1. **Direct Jobs Created** (Required)
   - Type: Number input
   - Range: 1+
   - Purpose: Employees directly hired by business
   - Visual: Green gradient card

2. **Indirect Jobs Created** (Optional)
   - Type: Number input
   - Range: 0+
   - Purpose: Jobs in supply chain, support services
   - Visual: Blue gradient card

3. **Total Job Opportunities**
   - Auto-calculated: `Direct + Indirect`
   - Display: Large prominent card
   - Visual: Award icon

**3B. Economic Diversification:**

1. **Economic Diversification Contribution** (Required)
   - Type: Text area
   - Max length: 1000 characters
   - Purpose: Explain how project diversifies Oman's economy
   - Prompt: "How does your project contribute to reducing oil dependency?"

**3C. Skills Development:**

1. **National Skills Development** (Optional)
   - Type: Text area
   - Max length: 1000 characters
   - Purpose: Training and upskilling for Omani workforce
   - Prompt: "What skills will your project develop in Omani employees?"

#### **Section 4: Impact Summary (Auto-Generated)**

**Read-Only Display:**

1. **Total Job Impact**
   - Formula: `Direct + Indirect`
   - Visual: Large card with Rocket icon

2. **Omanization Contribution**
   - Pulls from Level 4
   - Displays: "{X} Omani jobs at {Y}% Omanization"

3. **Sector Contribution**
   - Based on Level 0 project type
   - Example: "Contributes to Oman's industrial diversification strategy"

### **🤖 AI-Powered Features**

#### **AI Feature 1: BMC Auto-Population Assistant**

**Location:** Business Model Canvas section

**What AI Does:**
1. **Smart Pre-Fill Suggestions**
   - Analyzes data from Levels 1-6
   - Auto-suggests content for each BMC component:
     
     **Key Partners:**
     - From Level 3: Raw material suppliers
     - From Level 5: Potential distribution partners
     
     **Key Activities:**
     - From Level 0: Industry-specific activities (e.g., "Manufacturing" for industrial)
     - From Level 4: Core business functions
     
     **Key Resources:**
     - From Level 3: Main fixed assets (e.g., "Industrial Machinery")
     - From Level 4: "Skilled workforce - {X} employees"
     
     **Value Proposition:**
     - From Level 5: Differentiators vs competitors
     - From Level 5: Product unique features
     
     **Customer Relationships:**
     - Default suggestions: "Customer Support", "After-Sales Service"
     
     **Channels:**
     - Suggests based on project type
     
     **Customer Segments:**
     - From Level 5: Target market description
     
     **Cost Structure:**
     - From Levels 2,3,4: "Salaries: X OMR/month", "Raw Materials: Y OMR/month"
     
     **Revenue Streams:**
     - From Level 5: Product names and pricing

2. **Completeness Checker**
   - Ensures all 9 components have ≥1 item
   - Alert: "Add items to: {component}"

3. **Balance Advisor**
   - Warns if cost structure has 5 items but revenue streams has only 1
   - Suggestion: "Diversify revenue streams for stability"

**AI Trigger:** When section opens, shows suggestions as chips
**Visual Feedback:** "AI Suggested" badge on pre-filled items

#### **AI Feature 2: Timeline Realism Validator**

**Location:** Implementation Timeline section

**What AI Does:**
1. **Duration Validation**
   - Checks if milestone durations are realistic
   - Warning: "Legal registration typically takes 2-4 weeks, yours: 1 week"

2. **Critical Path Identifier**
   - Identifies which tasks must complete before others
   - Suggestion: "Equipment purchase should complete before staff training"

3. **Total Timeline Calculator**
   - Estimates total months from start to operations
   - Display: "Projected launch: Month X"
   - Benchmark: "Typical for {sector}: 6-12 months"

**AI Trigger:** When milestones added
**Visual Feedback:** Timeline bar with critical path highlighted

#### **AI Feature 3: Oman 2040 Impact Analyzer**

**Location:** Oman 2040 section

**What AI Does:**
1. **Job Creation Validator**
   - Compares stated jobs to Level 4 employee count
   - Warning: "You have {X} employees in Level 4 but stated {Y} direct jobs"

2. **Indirect Job Estimator**
   - AI estimates indirect jobs based on direct jobs and sector
   - Formula: `Indirect = Direct × Multiplier`
   - Multipliers:
     - Industrial: 2.5× (high supply chain)
     - Agricultural: 2.0×
     - Service: 1.2×
     - Commercial: 1.5×
   - Suggestion: "Your project could create ~{X} indirect jobs"

3. **Diversification Impact Scorer**
   - Analyzes economic diversification text
   - Scores contribution: Low / Medium / High
   - Feedback: "Strong contribution: Reduces oil reliance through {sector} growth"

4. **Oman 2040 Alignment Checker**
   - Compares project to Oman Vision 2040 pillars:
     - Economic Diversification ✅
     - Private Sector Growth ✅
     - Job Creation for Nationals ✅
     - Skills Development ✅
   - Display: Checkmarks for aligned pillars

**AI Trigger:** When user enters contribution text
**Visual Feedback:** Alignment badges, impact score

### **⚙️ Calculations & Automation**

#### **User-Entered Values:**
- All BMC component items
- All timeline milestones
- All Oman 2040 contribution details

#### **System-Calculated Values:**

1. **BMC Statistics:**
   - Items per component (X/5)
   - Total items across canvas
   - Completeness percentage: `(Filled components / 9) × 100`

2. **Timeline Calculations:**
   - Total implementation weeks
   - Total implementation months: `Weeks / 4.33`
   - Earliest start month
   - Latest end month

3. **Job Impact:**
   - Total Jobs = `Direct + Indirect`
   - Jobs per Investment = `Total Jobs / Total Investment`
   - Omanization Jobs = `Direct × Omanization % from Level 4`

4. **Cross-Level Validation:**
   - Compares direct jobs to Level 4 employee count
   - Should match ±10%

### **🌟 Unique Features**

1. **BMC Visual Framework**
   - Only level with 9-component grid layout
   - Industry-standard business model tool
   - Most comprehensive strategic overview

2. **National Vision Integration**
   - Only level explicitly linked to Oman Vision 2040
   - Patriotic impact measurement
   - Unique to Omani educational context

3. **Final Synthesis Level**
   - Brings together all previous levels
   - Holistic business model view
   - Completion milestone for entire system

4. **Implementation Roadmap**
   - Timeline adds project management element
   - Bridges feasibility study → execution

5. **Triple Impact Assessment**
   - Economic (job creation)
   - Strategic (diversification)
   - Social (skills development)

### **📚 User Guidance & Feedback**

#### **Pre-Completion Guidance:**

**BMC Section:**
- 💡 "Use AI suggestions to quickly populate sections"
- 💡 "Value Proposition is your core competitive advantage"
- 💡 "Aim for 2-3 items per section for clarity"

**Timeline Section:**
- 💡 "Start with legal registration, then equipment, then hiring"
- 💡 "Typical startup timeline: 6-12 months"

**Oman 2040 Section:**
- 💡 "Direct jobs = employees you directly hire"
- 💡 "Indirect jobs = suppliers, service providers, etc."
- 💡 "Explain how your project reduces oil dependence"

**Smart Alerts:**
- ✅ "BMC complete - all 9 components filled"
- ⚠️ "Job count mismatch with Level 4 - verify numbers"
- 💡 "Your project creates {X} jobs - strong Oman 2040 contribution!"

#### **Post-Completion Feedback:**
- ✅ "🎉 Complete! Business model fully documented"
- ✅ XP award: +250 XP
- ✅ **Congratulations Animation**
- ✅ Summary displays:
  - BMC: 9/9 components complete
  - Timeline: {X} months to launch
  - Jobs created: {Y} total opportunities
  - Oman 2040 alignment: {Z} pillars
- ✅ Visual: "Study Complete" certificate graphic
- ✅ Unlock: Business Plan Wizard (Capstone)

### **📄 Documentation Output**

#### **Data Saved to Context:**
```javascript
{
  bmc: {
    keyPartners: string[],
    keyActivities: string[],
    keyResources: string[],
    valueProposition: string[],
    customerRelationships: string[],
    channels: string[],
    customerSegments: string[],
    costStructure: string[],
    revenueStreams: string[]
  },
  milestones: [
    {
      id: string,
      task: string,
      durationWeeks: number,
      startMonth: number
    }
  ],
  oman2040: {
    directJobs: number,
    indirectJobs: number,
    economicDiversification: string,
    skillsDevelopment: string
  }
}
```

#### **Appears in Final Report:**
- **Section 10:** Business Model Canvas
  - 10.1: Full BMC Visual (9-component grid)
  - 10.2: BMC Component Explanations
- **Section 11:** Implementation Plan
  - 11.1: Timeline & Milestones (Gantt chart)
  - 11.2: Critical Path Analysis
  - 11.3: Resource Allocation
- **Section 12:** National Impact & Oman Vision 2040
  - 12.1: Job Creation Summary
  - 12.2: Economic Diversification Contribution
  - 12.3: Skills Development Plan
  - 12.4: Alignment with Oman Vision 2040
- **Executive Summary:** BMC highlights, job creation, national contribution

---

## 📊 **SYSTEM-WIDE FEATURES**

### **Cross-Level Integration**

**Data Flow Architecture:**
```
Level 0 → Project Type → Affects Levels 3, 5, 6
Level 1 → Owners → Used in Report
Level 2 → Licenses → Costs → Level 6
Level 3 → Assets → Depreciation → Level 6
Level 3 → Materials → Costs → Level 6
Level 4 → Salaries → Costs → Level 6
Level 4 → Omanization → Level 7
Level 5 → Revenue → Level 6 Projections
Level 6 → KPIs → Final Feasibility
Levels 1-7 → BMC → Level 7
```

### **Auto-Save System**

**How It Works:**
- Triggers: On every field change (debounced 500ms)
- Storage: Browser localStorage
- Key format: `yieldx_level{X}_data`
- Includes: All form fields, calculations, timestamps
- Visual feedback: "Auto-saved" indicator fades in/out

### **Validation System**

**Three-Tier Validation:**

1. **Field-Level (Real-Time)**
   - Type validation (number, text, email)
   - Range validation (min/max)
   - Format validation (percentages, currency)
   - Visual: Red border + error message

2. **Section-Level (On Section Complete)**
   - Business logic validation
   - Examples:
     - Shareholding must = 100%
     - Omanization ≥35%
     - Financing ≥90% of investment
   - Visual: Alert banner

3. **Form-Level (On Save)**
   - All required fields filled
   - Cross-section validation
   - Cross-level validation
   - Visual: Modal with error list

### **Bilingual System**

**Language Support:**
- Arabic (primary for Omani students)
- English (secondary, international)
- Toggle: Top-right language switcher
- Affects:
  - All UI text
  - Field labels
  - Error messages
  - AI recommendations
  - Generated reports

**RTL Support:**
- Arabic: Right-to-left layout
- English: Left-to-right layout
- Icons: Mirror appropriately
- Number formatting: Locale-aware

### **Gamification Elements**

**XP System:**
- Level 0: 50 XP
- Level 1: 100 XP
- Level 2: 150 XP
- Level 3: 150 XP
- Level 4: 200 XP
- Level 5: 200 XP
- Level 6: 300 XP (highest)
- Level 7: 250 XP
- **Total: 1,400 XP**

**Progress Tracking:**
- Per-level progress bars
- Overall completion percentage
- Visual: Circular progress indicators

**Unlocking System:**
- Sequential unlocking (Level N unlocks Level N+1)
- Exception: All levels unlocked in demo/testing
- Capstone unlocks after 6/8 levels complete

### **Study Modes**

**Three Modes (Selected at Pre-Start):**

1. **Quick Mode**
   - 5-year projections
   - Streamlined inputs
   - Essential fields only

2. **Detailed Mode**
   - 5-year projections
   - All fields enabled
   - Comprehensive analysis

3. **Advanced Mode**
   - 10-year projections
   - All fields + advanced options
   - Research-grade depth

**Mode Affects:**
- Level 6 projection years (5 vs 10)
- Optional field display
- Report depth

---

## 📄 **FINAL REPORT GENERATION (CAPSTONE)**

### **Business Plan Wizard**

**Purpose:** Aggregates all data from Levels 0-7 into professional feasibility study document

**Report Sections:**

1. **Cover Page**
   - Business name
   - Logo (optional)
   - Date
   - Prepared by (owner names)

2. **Executive Summary** (2 pages)
   - Project overview
   - Key financial highlights (IRR, NPV, ROI)
   - Viability conclusion

3. **Project Identity** (Level 1 data)
   - Business information
   - Ownership structure table

4. **Market Analysis** (Level 5 data)
   - Competitor analysis
   - Product catalog
   - SWOT matrix

5. **Operations Plan** (Levels 2, 3, 4 data)
   - Legal framework
   - Physical resources
   - Human resources

6. **Financial Plan** (Level 6 data)
   - Investment requirements
   - Financing structure
   - Pro forma statements (5-10 years)
   - KPI dashboard

7. **Business Model** (Level 7 data)
   - BMC visual
   - Implementation timeline

8. **National Impact** (Level 7 data)
   - Job creation
   - Oman 2040 contribution

9. **Appendices**
   - Detailed calculations
   - Assumptions
   - References

**Export Formats:**
- PDF (primary)
- Excel (financial tables)
- Word (editable)

---

## 🎓 **PEDAGOGICAL BENEFITS**

### **For Students:**
1. **Progressive Learning:** Each level builds on previous
2. **Real-World Application:** Actual Omani regulations
3. **Immediate Feedback:** AI recommendations, validations
4. **Portfolio Piece:** Complete feasibility study for their business
5. **Gamified Motivation:** XP, progress bars, unlocking

### **For Teachers:**
1. **Standardized Structure:** All students follow same framework
2. **Granular Monitoring:** Track progress per level
3. **Easy Grading:** Clear rubrics per level
4. **Level Preview:** See exactly what students see
5. **Data Export:** Gradebook CSV export

### **For Evaluators:**
1. **Comprehensive Documentation:** All business aspects covered
2. **Standards Alignment:** Follows Omani Ministry guidelines
3. **Quantitative Rigor:** 8 financial KPIs calculated
4. **Qualitative Depth:** SWOT, BMC, strategic analysis
5. **National Relevance:** Oman 2040 integration

---

## 🔒 **DATA PRIVACY & SECURITY**

### **Data Storage:**
- **Local Storage:** All data stored in browser (localStorage)
- **No Cloud Backup:** Currently no server-side storage
- **User Ownership:** Students own their data
- **Export Control:** Students can export/delete anytime

### **Future Enhancements:**
- Optional cloud sync (with encryption)
- Teacher dashboard with aggregated (anonymized) data
- Multi-device synchronization
- Backup/restore functionality

---

## 📱 **TECHNICAL SPECIFICATIONS**

### **Frontend Technologies:**
- React 18+
- TypeScript
- Tailwind CSS v4
- Motion/Framer Motion (animations)
- localStorage API (persistence)

### **Key Libraries:**
- Lucide React (icons)
- QRCode.react (QR generation)
- Sonner (toast notifications)
- Recharts (charts - future)

### **Browser Requirements:**
- Modern browsers (Chrome, Firefox, Safari, Edge)
- localStorage support required
- JavaScript enabled
- Minimum screen: 375px width

### **Performance:**
- Auto-save debounced (500ms)
- Lazy loading for heavy components
- Optimistic UI updates
- <100ms interaction response time

---

## 🚀 **FUTURE ENHANCEMENTS**

### **Planned AI Features:**
1. **AI Feasibility Report Writer**
   - Auto-generates narrative sections
   - Professional writing style

2. **AI Scenario Simulator**
   - "What if" analysis
   - Sensitivity testing

3. **AI Competitor Research**
   - Web scraping for competitor data
   - Automated competitive intelligence

4. **AI Financial Forecasting**
   - Machine learning price predictions
   - Demand forecasting

### **Planned Features:**
1. **Collaboration Mode**
   - Multi-user editing (team projects)
   - Real-time sync

2. **Template Library**
   - Pre-filled examples by sector
   - Best practice templates

3. **Video Tutorials**
   - In-app help videos per level
   - Screen recordings

4. **Mobile App**
   - Native iOS/Android apps
   - Offline mode

---

## 📚 **APPENDIX: FORMULAS REFERENCE**

### **Level 3: Depreciation**
```
Annual Depreciation = Asset Cost × (1 / Useful Life Years)

Useful Life by Type:
- Buildings: 25 years (4% per year)
- Machinery: 10 years (10% per year)
- Equipment: 5 years (20% per year)
- Furniture: 10 years (10% per year)
- Vehicles: 5 years (20% per year)
- Other: 8 years (12.5% per year)
```

### **Level 4: Omanization**
```
Omanization Rate = (Omani Employee Count / Total Employees) × 100

Social Insurance = Omani Total Salaries × 15%
Health Insurance = Expat Count × 50 OMR/month
```

### **Level 5: Profit Margin**
```
Profit per Unit = Price - Cost per Unit
Profit Margin % = (Profit / Price) × 100
Monthly Revenue = Price × Expected Monthly Sales
```

### **Level 6: Financial KPIs**

**IRR (Newton-Raphson Method):**
```
Cash Flows: [-Investment, Profit₁, Profit₂, ..., Profitₙ]
Find IRR where: NPV = Σ(CFₜ / (1+IRR)^t) = 0

Iterative:
IRR_{n+1} = IRR_n - (NPV / dNPV)
where dNPV = Σ(-t × CFₜ / (1+IRR)^(t+1))
```

**NPV:**
```
NPV = Σ(Profitₜ / (1+0.10)^t) - Investment
Discount Rate: 10%
```

**ROI:**
```
ROI = (Σ Profits over N years / Investment) × 100
```

**ROE:**
```
ROE = (Average Annual Profit / Equity) × 100
Average Annual Profit = Σ Profits / N years
```

**Payback Period:**
```
Cumulative Cash Flow = -Investment
For each year:
  Cumulative += Profitₜ
  If Cumulative ≥ 0:
    Payback = Year + (Remaining / Profitₜ)
```

**Break-Even Point:**
```
Fixed Costs = Salaries + Rent + (Depreciation / 12)
Variable Cost per Unit = Cost per Unit (from Level 5)
Average Price = Weighted average of product prices

BEP = Fixed Costs / (Price - Variable Cost per Unit)
Units per month
```

**Current Ratio:**
```
Current Assets = Working Capital
Current Liabilities = 3 × Monthly Operating Costs

Current Ratio = Current Assets / Current Liabilities
```

**Debt-to-Equity:**
```
D/E = Loan / Equity
```

---

## 📞 **SUPPORT & DOCUMENTATION**

### **For Technical Questions:**
- In-app help tooltips
- Level-specific guidance cards
- AI-powered recommendations

### **For Educational Questions:**
- Teacher preview mode
- Sample completed levels
- Best practice guides

### **For Business Questions:**
- Omani Ministry of Commerce guidelines
- Oman Vision 2040 documentation
- Sector-specific resources

---

## ✅ **QUALITY ASSURANCE**

### **Testing Coverage:**
- ✅ Field validation testing
- ✅ Calculation accuracy verification
- ✅ Cross-level data flow testing
- ✅ Bilingual content testing
- ✅ Auto-save persistence testing
- ✅ Browser compatibility testing

### **Accessibility:**
- ✅ WCAG 2.1 Level AA compliance
- ✅ Keyboard navigation support
- ✅ Screen reader compatibility
- ✅ Color contrast ratios met
- ✅ Alt text for all images

---

## 📄 **DOCUMENT VERSION HISTORY**

- **Version 2.0** (February 2026): Complete 7-level system (0-7) documentation
- **Version 1.0** (2025): Original 8-level system (1-8)

---

**END OF DOCUMENTATION**

*This document comprehensively describes the YieldX 7-Level Business Feasibility Study System. For questions or clarifications, please contact the YieldX development team.*

---

**Total Pages:** ~45 pages
**Word Count:** ~15,000 words
**Last Updated:** February 2026
