# Validation Rules

This document lists every rule that decides whether input is required, accepted, or rejected in the Accessorial Charges form. It covers both tabs:

- **Enter a Charge**: a single charge entered by hand.
- **Import Spreadsheet**: a CSV uploaded and checked in three steps (Upload, Match Columns, Review).

A field marked with **\*** on screen is required. When a field is only required under some condition, the **\*** appears only while that condition is true.

"Blank" means empty or containing only spaces, unless stated otherwise.

---

## Enter a Charge

### When errors appear

- Nothing is checked until the user clicks **Submit**.
- After the first Submit, each error updates as the user edits that field.
- The charge is only submitted when every rule below passes.
- The browser also checks the Date and number inputs itself (see [Browser checks](#browser-checks)). If one of those checks fails, the browser shows its own message and the form's messages don't appear until it is fixed.

### Fields

| Field | Required? | Rules | Error message |
|---|---|---|---|
| Client | Always | A client must be chosen from the list. | Client is required |
| Activity Date | Always | A date must be entered. The date picker only accepts complete, real dates. | Activity Date is required |
| Charge Type | Always | Must not be empty. The field is **locked until a Client is chosen**. The suggested types (Rush, Apply Custom Labels, Forward Packages, Change Ship Method) are only suggestions: any text is accepted. | Charge Type is required |
| Charge Basis | Always | Flat or Hourly. Flat is selected by default, so this error can't normally appear. | Charge Basis is required |
| Quantity | **Only when Charge Basis is Flat** | Must not be blank. Number input (see [Browser checks](#browser-checks)). | Quantity is required |
| Unit Price | **Only when Charge Basis is Flat** | Must not be blank. Number input (see [Browser checks](#browser-checks)). | Unit Price is required |
| Hours Worked | **Only when Charge Basis is Hourly** | Must not be blank. Free text, not a number input. | Hours Worked is required |
| Hourly Rate | **Only when Charge Basis is Hourly** | Must not be blank. Free text, not a number input. | Hourly Rate is required |
| Notes | Never | No rules. | — |

### Calculated Amount

The amount is calculated as you type and isn't validated:

- **Flat:** Quantity × Unit Price
- **Hourly:** Hours Worked × Hourly Rate
- A blank or non-numeric input counts as 0, so the amount shows $0.00 rather than an error.

### Browser checks

These checks come from the browser, not from the form's own rules:

- **Activity Date** uses the browser's date picker, so partial or impossible dates can't be entered.
- **Quantity** and **Unit Price** are number inputs:
  - Letters can't be typed in.
  - The browser only allows **whole numbers** here. A decimal such as `2.50` is rejected with the browser's "Please enter a valid value" message, and the form won't submit.

### Not checked

- Charge Type can be any text and isn't limited to the suggested list. A value of only spaces is accepted.
- Hours Worked and Hourly Rate accept any non-blank text, including text that isn't a number (e.g. `abc`). Such a value counts as 0 in the amount.
- Zero and negative numbers are accepted for every numeric field, so the Amount can be $0.00 or negative.
- Activity Date accepts any date, past or future.
- The fields for the basis that isn't selected are never checked.

---

## Import Spreadsheet

The import runs in three steps. Each step must pass its checks before **Next** moves on. Spreadsheet data is checked row by row in the final Review step.

### Step 1: Upload

| Field | Required? | Rules | Error message |
|---|---|---|---|
| File Upload | Always | A file must be chosen. The **×** button clears the choice, which makes it required again. | File Upload is required |
| Start at Row | Never | Optional number. It sets which line of the file holds the column headers: everything above that line is skipped. Blank, 0, or 1 means the headers are on the first line. | — |

The file is then read as a CSV:

- The first line read (after any skipped lines) is used as the column headers.
- Completely empty lines are skipped.

**Not checked:**

- The file picker suggests CSV files, but **any file type is accepted** and read as if it were a CSV.
- An empty file, a file with no data rows, or a file that can't be read as a CSV isn't reported. The import continues with whatever was read.
- Start at Row isn't checked against the file's length, and negative numbers are treated the same as blank.

### Step 2: Match Columns

#### Options

| Field | Required? | Rules | Error message |
|---|---|---|---|
| Client | Always | A client must be chosen from the list. | Client is required |
| Charge Basis | Always | One of **Use Column**, **Flat**, or **Hourly**. Defaults to Use Column. | Charge Basis is required |
| Calculate Amount For Me | Always | **Yes** or **No, Use Column**. Defaults to Yes. | Calculate Amount For Me is required |

Charge Basis and Calculate Amount For Me have defaults, so in practice only Client can be missing.

#### Column matching

Each accessorial field is matched to one column from the uploaded file. Some fields are hidden depending on the options above. A hidden field is never required.

| Accessorial Field | Shown when | Column required when | Error message |
|---|---|---|---|
| Charge Type | Always | Always | Charge Type is required |
| Activity Date | Always | Always | Activity Date is required |
| Charge Basis | Charge Basis = Use Column | Charge Basis = Use Column | Charge Basis is required |
| Quantity | Charge Basis = Use Column or Flat | Charge Basis = Use Column or Flat | Quantity is required |
| Unit Price | Charge Basis = Use Column or Flat | Charge Basis = Use Column or Flat | Unit Price is required |
| Hours Worked | Charge Basis = Use Column or Hourly | Charge Basis = Use Column or Hourly | Hours Worked is required |
| Hourly Rate | Charge Basis = Use Column or Hourly | Charge Basis = Use Column or Hourly | Hourly Rate is required |
| Amount | Calculate Amount For Me = No, Use Column | Calculate Amount For Me = No, Use Column | Amount is required |
| Notes | Always | Never | — |

With **Use Column**, both the Flat fields and the Hourly fields need a column, because each row can have either basis.

#### What happens to the options

- **Charge Basis = Flat or Hourly:** every row gets that basis, and any Charge Basis column in the file is ignored.
- **Calculate Amount For Me = Yes:** each row's Amount is calculated as described in [How the Amount is calculated](#how-the-amount-is-calculated). The calculation replaces any Amount in the file.
- **Calculate Amount For Me = No, Use Column:** each row's Amount is taken from the matched column exactly as it appears in the file.

**Not checked:**

- The same column can be matched to more than one field.
- The values in a column aren't checked at this step. That happens in Review.

### Step 3: Review

Every row is checked against the rules below. A row with any problem is counted as invalid.

#### Row rules

| Field | Required in each row? | Rules | Error message |
|---|---|---|---|
| Charge Type | Always | Must not be blank. | Charge Type is required |
| Activity Date | Always | Must not be blank. | Activity Date is required |
| Amount | Always | Must not be blank. A calculated Amount is blank when it couldn't be calculated (see below). | Amount is required |
| Charge Basis | Always | Must be `Flat` or `Hourly`. Capitalization and surrounding spaces don't matter (`flat`, ` HOURLY ` are fine). | Blank: **Charge Basis is required**. Any other value: **Charge Basis must be Flat or Hourly** |
| Quantity | **Only when the row's Charge Basis is Flat** | Must not be blank. | Quantity is required |
| Unit Price | **Only when the row's Charge Basis is Flat** | Must not be blank. | Unit Price is required |
| Hours Worked | **Only when the row's Charge Basis is Hourly** | Must not be blank. | Hours Worked is required |
| Hourly Rate | **Only when the row's Charge Basis is Hourly** | Must not be blank. | Hourly Rate is required |
| Notes | Never | No rules. | — |

When a row's Charge Basis is blank or invalid, its Quantity, Unit Price, Hours Worked, and Hourly Rate aren't checked, because there's no basis to decide which ones are needed.

If Charge Basis was set to Flat or Hourly in Match Columns, every row has that basis, so its Charge Basis rule always passes.

#### How the Amount is calculated

Only when Calculate Amount For Me = Yes:

- **Flat:** Quantity × Unit Price. **Hourly:** Hours Worked × Hourly Rate.
- The result is rounded to 2 decimal places.
- Each input is read leniently:
  - `$` signs and commas are ignored: `$1,250.00` reads as 1250.
  - Only the first number in the value is used: `8 hrs` reads as 8, `$45/hr` reads as 45.
  - A value wrapped in parentheses is negative: `(25.00)` reads as -25.
- The Amount is left **blank**, so the row fails with "Amount is required", when:
  - the row's Charge Basis isn't Flat or Hourly, or
  - either input is blank or contains no number.

#### How errors are shown

- Each invalid cell is highlighted red in the table.
- A red alert above the table shows how many rows have problems. It lists each distinct error message with the rows it occurs in, e.g. *Quantity is required (rows 2, 5)*.
- Row numbers count the data rows in the table, starting at 1. They don't count the header line, lines skipped with Start at Row, or empty lines, so they may not match the line numbers in the spreadsheet.
- **Import does nothing while any row is invalid.** The alert tells the user to fix the spreadsheet and upload it again. Rows can't be edited on this screen.

#### Not checked

- **Activity Date** is only checked for being present, not for being a real date. Recognized dates are shown as MM/DD/YYYY. A value that isn't recognized as a date is shown exactly as imported, without an error. Recognized formats (each may also carry a time such as `3:51 PM`, which is dropped):
  - `October 20th, 2026`, `October 20, 2026`, `October 05, 2026`
  - `Oct 19th, 2026`, `Oct 19, 2026`, `Oct 05, 2026`
  - `10/25/2026`, `1/5/2026`, `03/04/2026`, `03/4/2026`, `3/04/2026`
  - Numeric dates are always read month first: `03/04/2026` is March 4.
- **Quantity, Unit Price, Hours Worked, and Hourly Rate** are only checked for being present, not for being numbers. When the Amount is calculated, a non-numeric value still causes an error indirectly, because the Amount can't be calculated.
- **Amount from a column** (Calculate Amount For Me = No) is only checked for being present, not for being a number or for matching the other values in the row.
- **Charge Type** can be any text and isn't checked against a list of known types.
- Zero and negative values are accepted everywhere.
- Fields not needed for a row's basis (e.g. Hours Worked on a Flat row) aren't checked, even if they contain values.

---

## Differences between the two tabs

| Rule | Enter a Charge | Import Spreadsheet |
|---|---|---|
| Charge Type of only spaces | Accepted | Rejected as blank |
| Charge Basis values | Choose Flat or Hourly | Flat or Hourly, any capitalization. Anything else is an error. |
| Activity Date validity | Must be a real date (date picker) | Only has to be present. Unrecognized dates pass. |
| Quantity / Unit Price | Must be whole numbers (browser check) | Any non-blank text. Decimals are fine. |
| Hours Worked / Hourly Rate | Any non-blank text | Any non-blank text |
| Amount | Always calculated, never an error | Required. Calculated or taken from a column. |
| Non-numeric inputs in the calculation | Count as 0 | Leave the Amount blank, which is an error |
