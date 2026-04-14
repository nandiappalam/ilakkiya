# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: frontend\e2e\erp-full-flow.spec.js >> ERP Full Application Flow >> 🟣 Complete ERP Flow - Masters + Purchase CRUD
- Location: frontend\e2e\erp-full-flow.spec.js:10:3

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.fill: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('input[name="item_name"]')

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - generic [ref=e4]:
    - button "Back" [ref=e5] [cursor=pointer]:
      - img [ref=e7]
      - text: Back
    - heading "Create New Company" [level=5] [ref=e9]
  - generic [ref=e13]:
    - generic [ref=e15]:
      - generic:
        - text: Company Name
        - generic: "*"
      - generic [ref=e16]:
        - textbox "Company Name" [ref=e17]
        - group:
          - generic: Company Name *
    - generic [ref=e19]:
      - generic: Address
      - generic [ref=e20]:
        - textbox "Address" [ref=e21]
        - group:
          - generic: Address
    - generic [ref=e23]:
      - generic: GST Number
      - generic [ref=e24]:
        - textbox "GST Number" [ref=e25]
        - group:
          - generic: GST Number
    - generic [ref=e27]:
      - generic: Contact
      - generic [ref=e28]:
        - textbox "Contact" [ref=e29]
        - group:
          - generic: Contact
    - generic [ref=e31]:
      - generic: Email
      - generic [ref=e32]:
        - textbox "Email" [ref=e33]
        - group:
          - generic: Email
    - generic [ref=e35]:
      - button "Cancel" [ref=e36] [cursor=pointer]: Cancel
      - button "Create Company" [ref=e37] [cursor=pointer]:
        - img [ref=e39]
        - text: Create Company
```