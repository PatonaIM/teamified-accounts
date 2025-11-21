#!/usr/bin/env node

/**
 * Generate a sample CV PDF for testing
 * Uses PDFKit to create a professional-looking CV
 */

const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// Sample CV data
const cvData = {
  personalInfo: {
    name: 'Priya Sharma',
    title: 'Senior Software Engineer',
    email: 'priya.sharma@email.com',
    phone: '+91 98765 43210',
    location: 'Bangalore, Karnataka, India',
    linkedin: 'linkedin.com/in/priyasharma',
    github: 'github.com/priyasharma'
  },
  summary: 'Experienced Full-Stack Software Engineer with 6+ years of expertise in building scalable web applications. Proficient in React, Node.js, and cloud technologies. Passionate about clean code, best practices, and mentoring junior developers.',
  experience: [
    {
      title: 'Senior Software Engineer',
      company: 'TechCorp India Pvt Ltd',
      location: 'Bangalore, India',
      period: 'January 2021 - Present',
      responsibilities: [
        'Led development of microservices architecture serving 2M+ users',
        'Mentored team of 4 junior developers, improving code quality by 40%',
        'Implemented CI/CD pipelines reducing deployment time by 60%',
        'Architected and deployed React-based dashboard with real-time analytics'
      ]
    },
    {
      title: 'Software Engineer',
      company: 'Innovation Labs',
      location: 'Mumbai, India',
      period: 'June 2018 - December 2020',
      responsibilities: [
        'Developed RESTful APIs using Node.js and Express for e-commerce platform',
        'Built responsive web applications using React and Material-UI',
        'Optimized database queries improving application performance by 35%',
        'Collaborated with cross-functional teams in Agile environment'
      ]
    },
    {
      title: 'Junior Software Developer',
      company: 'StartupHub Technologies',
      location: 'Pune, India',
      period: 'July 2017 - May 2018',
      responsibilities: [
        'Developed frontend components using React and Redux',
        'Implemented unit tests achieving 85% code coverage',
        'Participated in code reviews and sprint planning sessions',
        'Fixed bugs and implemented feature requests from clients'
      ]
    }
  ],
  education: [
    {
      degree: 'Bachelor of Technology in Computer Science',
      institution: 'Indian Institute of Technology (IIT) Delhi',
      location: 'New Delhi, India',
      period: '2013 - 2017',
      grade: 'CGPA: 8.7/10'
    },
    {
      degree: 'Higher Secondary Certificate (HSC)',
      institution: 'Delhi Public School',
      location: 'Delhi, India',
      period: '2011 - 2013',
      grade: '92%'
    }
  ],
  skills: {
    'Programming Languages': ['JavaScript', 'TypeScript', 'Python', 'Java'],
    'Frontend': ['React', 'Redux', 'Next.js', 'HTML5', 'CSS3', 'Material-UI', 'Tailwind CSS'],
    'Backend': ['Node.js', 'Express', 'NestJS', 'REST APIs', 'GraphQL'],
    'Databases': ['PostgreSQL', 'MongoDB', 'Redis', 'MySQL'],
    'Cloud & DevOps': ['AWS', 'Docker', 'Kubernetes', 'CI/CD', 'Jenkins', 'GitHub Actions'],
    'Tools': ['Git', 'JIRA', 'Postman', 'VS Code', 'Figma']
  },
  certifications: [
    'AWS Certified Solutions Architect - Associate (2022)',
    'MongoDB Certified Developer (2021)',
    'React Advanced Patterns (Udemy, 2020)'
  ],
  projects: [
    {
      name: 'E-Commerce Platform',
      description: 'Built a full-stack e-commerce platform with payment integration, inventory management, and admin dashboard',
      technologies: 'React, Node.js, PostgreSQL, Stripe API'
    },
    {
      name: 'Real-Time Chat Application',
      description: 'Developed a real-time messaging application with WebSocket support and message encryption',
      technologies: 'React, Socket.io, Node.js, MongoDB'
    }
  ]
};

function generateCV() {
  console.log('🎨 Generating sample CV PDF...');

  const doc = new PDFDocument({
    size: 'A4',
    margins: { top: 50, bottom: 50, left: 50, right: 50 }
  });

  const outputPath = path.join(__dirname, 'sample-cv-priya-sharma.pdf');
  const stream = fs.createWriteStream(outputPath);
  doc.pipe(stream);

  // Header with name and title
  doc.fontSize(24)
     .font('Helvetica-Bold')
     .fillColor('#2C3E50')
     .text(cvData.personalInfo.name, { align: 'center' });

  doc.fontSize(14)
     .font('Helvetica')
     .fillColor('#7F8C8D')
     .text(cvData.personalInfo.title, { align: 'center' });

  doc.moveDown(0.5);

  // Contact Information
  doc.fontSize(10)
     .fillColor('#34495E')
     .text([
       cvData.personalInfo.email,
       cvData.personalInfo.phone,
       cvData.personalInfo.location
     ].join(' | '), { align: 'center' });

  doc.text([
       cvData.personalInfo.linkedin,
       cvData.personalInfo.github
     ].join(' | '), { align: 'center' });

  doc.moveDown(1);

  // Horizontal line
  doc.moveTo(50, doc.y)
     .lineTo(545, doc.y)
     .strokeColor('#BDC3C7')
     .stroke();

  doc.moveDown(1);

  // Professional Summary
  addSection(doc, 'PROFESSIONAL SUMMARY');
  doc.fontSize(10)
     .font('Helvetica')
     .fillColor('#34495E')
     .text(cvData.summary, { align: 'justify' });

  doc.moveDown(1);

  // Work Experience
  addSection(doc, 'WORK EXPERIENCE');

  cvData.experience.forEach((job, index) => {
    if (index > 0) doc.moveDown(0.8);

    doc.fontSize(12)
       .font('Helvetica-Bold')
       .fillColor('#2C3E50')
       .text(job.title);

    doc.fontSize(10)
       .font('Helvetica-Bold')
       .fillColor('#7F8C8D')
       .text(`${job.company} | ${job.location}`);

    doc.fontSize(9)
       .font('Helvetica-Oblique')
       .fillColor('#95A5A6')
       .text(job.period);

    doc.moveDown(0.3);

    job.responsibilities.forEach(resp => {
      doc.fontSize(10)
         .font('Helvetica')
         .fillColor('#34495E')
         .text(`• ${resp}`, { indent: 10 });
    });
  });

  doc.moveDown(1);

  // Education
  addSection(doc, 'EDUCATION');

  cvData.education.forEach((edu, index) => {
    if (index > 0) doc.moveDown(0.5);

    doc.fontSize(11)
       .font('Helvetica-Bold')
       .fillColor('#2C3E50')
       .text(edu.degree);

    doc.fontSize(10)
       .font('Helvetica')
       .fillColor('#7F8C8D')
       .text(`${edu.institution} | ${edu.location}`);

    doc.fontSize(9)
       .font('Helvetica-Oblique')
       .fillColor('#95A5A6')
       .text(`${edu.period} | ${edu.grade}`);
  });

  doc.moveDown(1);

  // Skills
  addSection(doc, 'TECHNICAL SKILLS');

  Object.entries(cvData.skills).forEach(([category, skills]) => {
    doc.fontSize(10)
       .font('Helvetica-Bold')
       .fillColor('#2C3E50')
       .text(`${category}: `, { continued: true })
       .font('Helvetica')
       .fillColor('#34495E')
       .text(skills.join(', '));
    doc.moveDown(0.3);
  });

  doc.moveDown(0.5);

  // Certifications
  addSection(doc, 'CERTIFICATIONS');

  cvData.certifications.forEach(cert => {
    doc.fontSize(10)
       .font('Helvetica')
       .fillColor('#34495E')
       .text(`• ${cert}`);
  });

  doc.moveDown(1);

  // Projects
  addSection(doc, 'KEY PROJECTS');

  cvData.projects.forEach((project, index) => {
    if (index > 0) doc.moveDown(0.5);

    doc.fontSize(11)
       .font('Helvetica-Bold')
       .fillColor('#2C3E50')
       .text(project.name);

    doc.fontSize(10)
       .font('Helvetica')
       .fillColor('#34495E')
       .text(project.description);

    doc.fontSize(9)
       .font('Helvetica-Oblique')
       .fillColor('#7F8C8D')
       .text(`Technologies: ${project.technologies}`);
  });

  // Footer
  doc.moveDown(2);
  doc.fontSize(8)
     .font('Helvetica-Oblique')
     .fillColor('#95A5A6')
     .text('References available upon request', { align: 'center' });

  doc.end();

  stream.on('finish', () => {
    console.log(`✅ Sample CV generated successfully: ${outputPath}`);
    console.log(`📄 File size: ${(fs.statSync(outputPath).size / 1024).toFixed(2)} KB`);
    console.log('\n📋 CV Details:');
    console.log(`   Name: ${cvData.personalInfo.name}`);
    console.log(`   Title: ${cvData.personalInfo.title}`);
    console.log(`   Email: ${cvData.personalInfo.email}`);
    console.log(`   Experience: ${cvData.experience.length} positions`);
    console.log(`   Education: ${cvData.education.length} qualifications`);
    console.log('\n💡 You can now use this file for testing CV upload functionality!');
  });
}

function addSection(doc, title) {
  doc.fontSize(13)
     .font('Helvetica-Bold')
     .fillColor('#2C3E50')
     .text(title);

  doc.moveDown(0.3);

  // Underline
  const y = doc.y;
  doc.moveTo(50, y)
     .lineTo(200, y)
     .strokeColor('#3498DB')
     .lineWidth(2)
     .stroke();

  doc.moveDown(0.5);
}

// Run the generator
generateCV();

