# Business Analysis Documentation: Smart Personal Finance Management System

## STEP 1: SYSTEM OVERVIEW

### Purpose of the System
The **Smart Personal Finance Management System** is an AI-driven financial ecosystem designed to simplify and automate the process of tracking personal wealth. Unlike traditional finance apps that require manual data entry for every cent, this system leverages Natural Language Processing (NLP) to allow users to record transactions using natural language (e.g., "Spent 50k for dinner at Pizza Hut"). The system focuses on providing a holistic view of financial health through smart wallets, budget planning, and AI-powered insights.

### Target Users (Actors)
*   **End User:** Individuals seeking to manage their daily expenses, track multiple wallets/bank accounts, and plan their budgets.
*   **System Administrator:** Technical staff responsible for managing user accounts and ensuring system stability.
*   **AI Engine (System Actor):** The NLP service that translates human language into structured financial data.

### Core Business Domains
*   **Identity & Access Management:** Secure user registration, authentication, and session management.
*   **Liquidity Management:** Managing various "Wallets" (Physical cash, Bank accounts, E-wallets) and their respective balances.
*   **Transaction Lifecycle:** Recording, categorizing, and modifying income and expense entries.
*   **Financial Planning:** Budget setting, tracking spend against limits, and budget resets.
*   **AI-Driven Intelligence:** Natural language extraction of data and financial history querying.

---

## STEP 2: BUSINESS FEATURES

| Feature Name | Description | Actors | Input / Output | Business Value |
| :--- | :--- | :--- | :--- | :--- |
| **Smart Transaction Entry** | Converts natural text into a formal financial record. | End User, AI Engine | Text $\rightarrow$ Structured Transaction | Reduces friction in data entry; increases user retention. |
| **Multi-Wallet Management** | Tracks balances across different storage types (Cash, Bank, etc.). | End User | Wallet Details $\rightarrow$ Current Balance | Provides a unified view of total net worth. |
| **Budgeting & Planning** | Sets spending limits for specific categories. | End User | Budget Amount $\rightarrow$ Spend Alerts | Promotes financial discipline and saving habits. |
| **AI Financial Query** | Allows users to ask questions about their history via NLP. | End User, AI Engine | Question $\rightarrow$ Financial Summary | Rapid access to insights without manual report generation. |
| **Account Security** | Secure access via JWT and role-based permissions. | End User, Admin | Credentials $\rightarrow$ Access Token | Protects sensitive financial data. |

---

## STEP 3: USER FLOWS

### 1. Record an Expense (AI Flow)
*   **Step 1:** User opens the AI assistant in the mobile app.
*   **Step 2:** User types: *"Bought coffee for 30k"*
*   **Step 3:** The system sends the text to the AI Service.
*   **Step 4:** AI Service extracts: `Amount: 30,000`, `Type: Expense`, `Category: Food/Drink`.
*   **Step 5:** System prompts the user to confirm the wallet to deduct from.
*   **Step 6:** Upon confirmation, the wallet balance is decreased and the transaction is saved.
*   **Error Case:** If the AI cannot identify the amount or type, the system asks the user for manual clarification.

### 2. Monthly Budget Setup
*   **Step 1:** User navigates to the Budget screen.
*   **Step 2:** User selects a category (e.g., "Shopping").
*   **Step 3:** User enters a maximum limit (e.g., $200).
*   **Step 4:** System validates if the limit is a positive number.
*   **Step 5:** System saves the budget and begins tracking real-time spending against this limit.

### 3. Wallet Rebalancing (Transfer)
*   **Step 1:** User selects "Rebalance" or "Transfer".
*   **Step 2:** User chooses a "Source Wallet" and a "Destination Wallet".
*   **Step 3:** User enters the amount to move.
*   **Step 4:** System checks if the source wallet has sufficient funds.
*   **Step 5:** System performs a dual operation: Subtracts from source, Adds to destination.

---

## STEP 4: USE CASES

### Use Case: Create Transaction
*   **Actor:** End User
*   **Preconditions:** User must be authenticated and have at least one active wallet.
*   **Main Flow:**
    1. User provides transaction details (Amount, Category, Type, Wallet, Date).
    2. System validates that the amount is positive.
    3. If "Expense", system checks if the wallet has enough balance.
    4. System updates the Wallet balance.
    5. System records the Transaction entry.
*   **Postconditions:** Wallet balance is updated; transaction history is updated.

### Use Case: AI History Query
*   **Actor:** End User
*   **Preconditions:** User has existing transaction history.
*   **Main Flow:**
    1. User asks: *"How much did I spend on food last week?"*
    2. System sends query to AI service to identify the "Time Range" and "Category".
    3. System fetches filtered transactions from the database.
    4. System aggregates the total and returns a natural language answer.
*   **Postconditions:** User receives a summary of their spending.

---

## STEP 5: BUSINESS RULES

### Financial Validation Rules
*   **Positive Value Constraint:** All transaction amounts and budget limits must be greater than zero.
*   **Solvency Rule:** A wallet cannot have a negative balance resulting from an expense (Insufficient Balance Error).
*   **Date Constraint:** Transactions cannot be recorded for a future date.

### Access & Security Rules
*   **Ownership Rule:** A user can only view or modify wallets and transactions that belong to their specific User ID.
*   **Session Validity:** Access tokens (JWT) must be refreshed periodically to maintain a secure session.

---

## STEP 6: DATA MODEL (Business View)

| Entity | Business Description | Relationship |
| :--- | :--- | :--- |
| **User** | The individual owning the financial data. | One-to-Many with Wallets |
| **Wallet** | A container for money (Bank account, Cash, etc.). | One-to-Many with Transactions |
| **Transaction** | A single movement of money (Income or Expense). | Many-to-One with Category |
| **Category** | A label for spending/earning (e.g., "Rent", "Salary"). | Many-to-Many with Budgets |
| **Budget** | A planned spending limit for a specific period. | Linked to User and Category |

---

## STEP 7: API MAPPING

| API Endpoint | Business Action |
| :--- | :--- |
| `POST /auth/login` | User Authentication & Session Start |
| `POST /transactions` | Record a Financial Movement |
| `GET /dashboard` | Retrieve Financial Health Overview |
| `POST /nlp/extract` | Translate Natural Language to Finance Data |
| `PUT /wallets/{id}` | Update Wallet Information |
| `POST /budgets/upsert` | Set or Update Spending Limit |

---

## STEP 8: EDGE CASES & RISKS

### Potential Risks
*   **AI Misinterpretation:** The AI might misinterpret "Bought a shirt for 50" as 50 dollars instead of 50k VND.
    *   *Mitigation:* Always implement a "Confirmation Step" before finalizing AI-extracted transactions.
*   **Currency Mismatch:** Transferring funds between wallets of different currencies without a conversion rate.
    *   *Mitigation:* Implement a Currency Exchange service or restrict transfers to same-currency wallets.
*   **Race Conditions:** Rapidly creating multiple transactions that might lead to incorrect balance updates.
    *   *Mitigation:* Use database-level transactions (`@Transactional`) to ensure atomicity.

---

## STEP 9: OCR RECEIPT FEATURE

### Purpose of OCR Feature
The OCR (Optical Character Recognition) feature allows users to scan receipts and automatically extract transaction information. This reduces manual data entry friction and increases accuracy, especially for users who prefer keeping physical receipts.

### Target Users
*   **End User:** Individuals who want quick expense tracking from physical receipts.

### Actor Diagram
```
┌─────────────┐     ┌──────────────────┐     ┌─────────────┐
│   User      │────▶│   OCR System     │────▶│  Database   │
└─────────────┘     └──────────────────┘     └─────────────┘
                           │
                    ┌──────┴──────┐
                    ▼             ▼
            ┌───────────┐   ┌───────────┐
            │  Upload   │   │  Extract  │
            │  Image    │   │  Data     │
            └───────────┘   └───────────┘
```

---

### Business Features

| Feature Name | Description | Actors | Input / Output | Business Value |
| :--- | :--- | :--- | :--- | :--- |
| **Receipt Image Upload** | User captures or selects receipt photo from gallery. | End User | Image File → Preview | Enables quick access to receipt data. |
| **OCR Processing** | System recognizes text from receipt image. | System, OCR Engine | Image → Raw Text | Extracts textual data from images. |
| **Data Extraction** | Parses structured info (store name, date, amount). | AI Engine | Raw Text → Structured Data | Auto-fills transaction fields. |
| **Review & Confirm** | User reviews extracted data before saving. | End User | Extracted Data → Confirmed Transaction | Ensures accuracy; prevents errors. |

---

### User Flows

#### 1. OCR Receipt Scan Flow
*   **Step 1:** User opens the "Scan Receipt" feature in the mobile app.
*   **Step 2:** User chooses to capture a new photo or select from gallery.
*   **Step 3:** The app displays a preview and sends the image to the backend.
*   **Step 4:** Backend processes the image through the OCR engine.
*   **Step 5:** The system parses and extracts: Store Name, Transaction Date, Total Amount.
*   **Step 6:** The app displays extracted data in a form for user review.
*   **Step 7:** User confirms or edits the information.
*   **Step 8:** Upon confirmation, the transaction is saved and wallet balance is updated.
*   **Error Case:** If OCR fails to extract readable data, the system prompts the user to enter manually.

---

### Use Cases

#### Use Case: OCR Receipt Processing
*   **Actor:** End User
*   **Preconditions:** User must be authenticated and have at least one active wallet.
*   **Main Flow:**
    1. User uploads a receipt image (camera or gallery).
    2. System validates the image format (JPG, PNG) and size (<10MB).
    3. System processes the image through OCR.
    4. System extracts: store name, transaction date, total amount.
    5. System displays extracted fields for user review.
    6. User confirms or edits the data.
    7. System creates the transaction and updates the wallet balance.
*   **Postconditions:** Transaction is saved; wallet balance is updated.

#### Use Case: Manual Entry Fallback
*   **Actor:** End User
*   **Preconditions:** User initiated OCR but extraction failed.
*   **Main Flow:**
    1. System displays "OCR failed" message with the raw text (if any).
    2. System offers option to enter manually.
    3. User enters transaction details manually.
    4. System proceeds with normal transaction creation.
*   **Postconditions:** Transaction is created via manual entry.

---

### Business Rules

#### OCR Validation Rules
*   **Image Format:** Only JPG, PNG, HEIC formats are accepted.
*   **Image Size:** Maximum file size is 10MB.
*   **Extraction Threshold:** If confidence score < 50%, prompt manual review.
*   **Date Parsing:** Extracted date must be valid and not in the future.

#### AI Classification Rules
*   **Store-to-Category Mapping:** If store name contains "Food", "Restaurant", classify as "Food/Dining".
*   **Store-to-Category Mapping:** If store name contains "Grab", "Be", classify as "Transportation".
*   **Store-to-Category Mapping:** If store name contains "Lotteria", "Coffee", classify as "Food/Drink".

---

### Data Model (OCR Extension)

| Entity | Business Description | Relationship |
| :--- | :--- | :--- |
| **ReceiptImage** | Stores uploaded receipt images. | Linked to User and Transaction |
| **OCRResult** | Contains extracted data from OCR. | One-to-One with Transaction |
| **Transaction** | Extended with image reference. | Many-to-One with ReceiptImage |

---

### API Mapping

| API Endpoint | Business Action |
| :--- | :--- |
| `POST /ocr/upload` | Upload receipt image for processing |
| `POST /ocr/process` | Process uploaded image and extract data |
| `POST /ocr/confirm` | Confirm and save extracted transaction |
| `GET /ocr/history` | View past scanned receipts |

---

### Non-Functional Requirements

| Requirement | Criteria |
| :--- | :--- |
| **Performance** | OCR processing time < 5 seconds for images < 5MB |
| **Accuracy** | Amount extraction accuracy > 90% for clear receipts |
| **Availability** | Supports offline mode with local OCR (Tesseract) |
| **Scalability** | Can handle 100 concurrent OCR requests |

---

### Edge Cases & Risks

#### Potential Risks
*   **Blurry Images:** Low-quality photos may result in failed or incorrect OCR.
    *   *Mitigation:* Implement image quality check before processing; prompt user to retake.
*   **Non-Receipt Images:** User may upload non-receipt images.
    *   *Mitigation:* Display warning if no amount/date is detected.
*   **Wrong Amount Extraction:** OCR may misinterpret amounts (e.g., "150.000" vs "150,000").
    *   *Mitigation:* Show confidence score; require user confirmation.
*   **Currency Mismatch:** Receipt in foreign currency without conversion.
    *   *Mitigation:* Detect currency symbol; prompt user to confirm VND conversion.
