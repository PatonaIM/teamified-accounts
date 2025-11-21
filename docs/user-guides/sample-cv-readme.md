# Sample CV for Testing

## 📄 Generated Sample CV

A professional sample CV PDF has been generated for testing the CV upload and management functionality.

### File Details

- **Filename:** `sample-cv-priya-sharma.pdf`
- **Size:** ~5 KB
- **Format:** PDF (A4 size)

### CV Contents

**Personal Information:**
- Name: Priya Sharma
- Title: Senior Software Engineer
- Email: priya.sharma@email.com
- Phone: +91 98765 43210
- Location: Bangalore, Karnataka, India
- LinkedIn: linkedin.com/in/priyasharma
- GitHub: github.com/priyasharma

**Sections Included:**
- ✅ Professional Summary
- ✅ Work Experience (3 positions spanning 6+ years)
  - Senior Software Engineer at TechCorp India
  - Software Engineer at Innovation Labs
  - Junior Software Developer at StartupHub Technologies
- ✅ Education (2 qualifications)
  - B.Tech Computer Science from IIT Delhi
  - HSC from Delhi Public School
- ✅ Technical Skills (6 categories)
  - Programming Languages
  - Frontend Technologies
  - Backend Technologies
  - Databases
  - Cloud & DevOps
  - Tools
- ✅ Certifications (3)
- ✅ Key Projects (2)

### How to Generate

If you need to regenerate or create additional sample CVs:

```bash
node generate-sample-cv.js
```

### Usage for Testing

1. **CV Upload Testing:**
   ```bash
   # Use the sample CV to test upload functionality
   curl -X POST http://localhost:3000/api/v1/users/me/profile/cv \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -F "file=@sample-cv-priya-sharma.pdf"
   ```

2. **Frontend Testing:**
   - Navigate to the CV Management page
   - Click "Upload New CV"
   - Select `sample-cv-priya-sharma.pdf`
   - Verify upload, listing, and download functionality

3. **Job Application Testing:**
   - Navigate to Jobs page
   - Click "Apply" on any job
   - Select the uploaded CV from the dropdown
   - Submit application

### Customization

To create CVs with different data, edit `generate-sample-cv.js` and modify the `cvData` object:

```javascript
const cvData = {
  personalInfo: {
    name: 'Your Name',
    title: 'Your Title',
    // ... other fields
  },
  // ... other sections
};
```

Then run:
```bash
node generate-sample-cv.js
```

### Notes

- The sample CV is **not committed to git** (added to `.gitignore`)
- It's generated locally for testing purposes only
- Contains realistic but fictional data
- Follows professional CV formatting standards
- Includes all common CV sections expected in the Indian job market

### File Structure

```
sample-cv-priya-sharma.pdf
├── Header (Name, Title, Contact Info)
├── Professional Summary
├── Work Experience (with bullet points)
├── Education (with grades)
├── Technical Skills (categorized)
├── Certifications
├── Key Projects (with descriptions)
└── Footer (References note)
```

