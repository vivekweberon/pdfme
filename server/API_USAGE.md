# PDF Generation API Documentation

**Endpoint URL**: `https://pdfme-playground.onrender.com/api/generate`
**Method**: `POST`
**Headers**: `Content-Type: application/json`

## How to use in Postman

1.  Create a new request and set the method to **POST**.
2.  Enter the URL: `https://pdfme-playground.onrender.com/api/generate`
3.  Go to the **Body** tab, select **raw**, and choose **JSON**.
4.  Paste the payload structure below.

### Request Body Structure

You must provide your **Template** JSON object and your **CSV** data string.

```json
{
    "template": {
        "schemas": [ ... ],
        "basePdf": { ... },
        "pdfmeVersion": "..."
    },
    "csv": "alias,city,qrcode\nJohn Doe,New York,https://example.com/1\nJane Smith,San Francisco,https://example.com/2\nAlice Johnson,Chicago,https://example.com/3\nBob Brown,Los Angeles,https://example.com/4\nCharlie Davis,Seattle,https://example.com/5"
}
```

### Response

-   **Success (200 OK)**: Returns binary PDF data.
    -   In Postman, click the "Save Response" button (down arrow next to "Send") -> "Save to a file" -> name it `output.pdf`.
-   **Error (400 Bad Request)**: Returns JSON with an error message if the template or inputs are invalid.

---

### Example CSV Data (5 Entries)

If you are copying this into the JSON "csv" field, ensure you escape newlines (`\n`) as shown in the example above. If you are constructing this string in code, it would look like this:

```csv
alias,city,qrcode
John Doe,New York,https://example.com/1
Jane Smith,San Francisco,https://example.com/2
Alice Johnson,Chicago,https://example.com/3
Bob Brown,Los Angeles,https://example.com/4
Charlie Davis,Seattle,https://example.com/5
```
