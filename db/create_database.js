const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Create a new database or open existing one
const dbPath = path.join(__dirname, 'resume.db');
const db = new sqlite3.Database(dbPath);

// Run all operations in a transaction
db.serialize(() => {
  // Drop existing tables if they exist
  db.run("DROP TABLE IF EXISTS profile");
  db.run("DROP TABLE IF EXISTS experience");
  db.run("DROP TABLE IF EXISTS education");
  db.run("DROP TABLE IF EXISTS skills");
  db.run("DROP TABLE IF EXISTS projects");

  // Create tables
  db.run(`CREATE TABLE profile (
    id INTEGER PRIMARY KEY,
    name TEXT,
    title TEXT,
    location TEXT,
    phone TEXT,
    email TEXT,
    summary TEXT
  )`);

  db.run(`CREATE TABLE experience (
    id INTEGER PRIMARY KEY,
    position TEXT,
    company TEXT,
    location TEXT,
    start_date TEXT,
    end_date TEXT,
    description TEXT,
    responsibilities TEXT
  )`);

  db.run(`CREATE TABLE education (
    id INTEGER PRIMARY KEY,
    degree TEXT,
    institution TEXT,
    location TEXT,
    start_date TEXT,
    end_date TEXT
  )`);

  db.run(`CREATE TABLE skills (
    id INTEGER PRIMARY KEY,
    name TEXT,
    category TEXT
  )`);

  db.run(`CREATE TABLE projects (
    id INTEGER PRIMARY KEY,
    title TEXT,
    description TEXT,
    technologies TEXT,
    color TEXT
  )`);

  // Insert profile data
  db.run(`INSERT INTO profile (name, title, location, phone, email, summary) 
    VALUES (?, ?, ?, ?, ?, ?)`, 
    [
      "Neeraj Narayanan",
      "Principal Engineer - Application Development, Data Strategy & AI",
      "Toronto, Canada",
      "980-777-9275",
      "your.email@example.com",
      "Principal Engineer with over 14 years of experience in architecting and leading the development of scalable, data-driven software solutions. Spearheaded projects across banking and healthcare sectors, utilizing technologies such as Big Data, AI/ML, and cloud platforms including GCP, AWS, and Azure to enhance business operations and decision-making. Demonstrated ability to drive innovation and improve system performance, significantly impacting business outcomes."
    ]
  );

  // Insert experience data
  const experiences = [
    {
      position: "Principal Data Engineer - Application Development, Data Strategy & AI",
      company: "CVS Health",
      location: "",
      start_date: "Sep 2021",
      end_date: "Present",
      description: "",
      responsibilities: JSON.stringify([
        "Led cross-functional teams to develop innovative products across multiple cloud environments (GCP, AWS, Azure) that optimize business operations and enhance forecasting capabilities.",
        "Architected cross-cloud data solutions on GCP, AWS (S3, EC2, EMR, Kinesis), and Azure (Azure Functions, Azure Databricks), optimizing data pipelines for scalability and cost-effectiveness.",
        "Designed ETL pipelines leveraging streaming technologies (Kafka, Spark Streaming) and Apache Airflow for robust real-time data processing and analytics.",
        "Developed a high-performance FastAPI/React application for PBM artifact management, leveraging Redis caching for sub-500ms response times.",
        "Created a self-service Data Hub with GenAI integration, empowering business users with streamlined ETL, reporting, and insights.",
        "Spearheaded P&L forecasting applications with 30% accuracy improvement, driving data-driven decision-making."
      ])
    },
    {
      position: "Solutions Architect",
      company: "HCL America Inc",
      location: "San Antonio, TX",
      start_date: "Feb 2016",
      end_date: "Sep 2021",
      description: "",
      responsibilities: JSON.stringify([
        "Architected and implemented an AWS-based big data solution (EMR, Kafka, S3) that significantly improved data processing speed.",
        "Developed a framework to migrate 10PB of AML bank data from Netezza DB to Amazon S3, reducing development costs by 30%.",
        "Led a successful proof-of-concept using Machine Learning in AML to identify fraudulent users, generating $500K in ROI within a year.",
        "Implemented Robotic Process Automation (RPA) solutions using Automation Anywhere to streamline repetitive tasks."
      ])
    },
    {
      position: "Big Data Developer | Java Developer",
      company: "TCS America",
      location: "Charlotte, NC",
      start_date: "Nov 2010",
      end_date: "Feb 2016",
      description: "",
      responsibilities: JSON.stringify([
        "Streamlined large-scale data processing by developing custom MapReduce jobs in Java, leveraging the Hadoop ecosystem.",
        "Enhanced data quality and processing efficiency through custom Hadoop file system plugins and Python-based tools.",
        "Integrated applications by developing and enhancing backend components such as WebMethods flow services and RESTful APIs.",
        "Built a comprehensive CTR/HFT/CAPS application using Java APIs, Hibernate for database interactions, and an MVC architecture."
      ])
    }
  ];

  const insertExperience = db.prepare("INSERT INTO experience (position, company, location, start_date, end_date, description, responsibilities) VALUES (?, ?, ?, ?, ?, ?, ?)");
  experiences.forEach(exp => {
    insertExperience.run(
      exp.position,
      exp.company,
      exp.location,
      exp.start_date,
      exp.end_date,
      exp.description,
      exp.responsibilities
    );
  });
  insertExperience.finalize();

  // Insert education data
  db.run(`INSERT INTO education (degree, institution, location, start_date, end_date) 
    VALUES (?, ?, ?, ?, ?)`, 
    [
      "Bachelor of Technology in Computer Science (B-Tech)",
      "Mahatma Gandhi University",
      "India",
      "Jun 2006",
      "Apr 2010"
    ]
  );

  // Insert skills data
  const skills = [
    // Expert skills
    { name: "Python", category: "Expert" },
    { name: "Microservices", category: "Expert" },
    { name: "Data & Analytics", category: "Expert" },
    { name: "Backend Development", category: "Expert" },
    { name: "Data Engineering", category: "Expert" },
    { name: "Problem-solving Skills", category: "Expert" },
    { name: "FastAPI", category: "Expert" },
    { name: "SQL", category: "Expert" },
    
    // Experienced skills
    { name: "Frontend Development", category: "Experienced" },
    { name: "Azure", category: "Experienced" },
    { name: "AWS", category: "Experienced" },
    { name: "GCP", category: "Experienced" },
    { name: "RPA", category: "Experienced" },
    { name: "DevOps", category: "Experienced" },
    { name: "API Design", category: "Experienced" },
    { name: "Agile Methodologies", category: "Experienced" },
    { name: "Google Spanner", category: "Experienced" },
    { name: "Google Cloud Run", category: "Experienced" },
    
    // Skillful
    { name: "GenerativeAI/LLM", category: "Skillful" },
    { name: "Kubernetes", category: "Skillful" },
    { name: "React", category: "Skillful" }
  ];

  const insertSkill = db.prepare("INSERT INTO skills (name, category) VALUES (?, ?)");
  skills.forEach(skill => {
    insertSkill.run(skill.name, skill.category);
  });
  insertSkill.finalize();

  // Insert projects data
  const projects = [
    {
      title: "Self-Service Data Hub with GenAI",
      description: "Created a comprehensive self-service Data Hub leveraging AWS (Databricks) and integrating data from GCP (BigQuery) with GenAI capabilities. This platform empowered business users with streamlined ETL processes, automated reporting, and AI-driven insights, significantly reducing the time to generate business intelligence.",
      technologies: "AWS, Databricks, GCP, BigQuery, GenAI",
      color: "blue"
    },
    {
      title: "High-Performance PBM Artifact Management",
      description: "Developed a high-performance FastAPI/React application for PBM artifact management, implementing Redis caching strategies that achieved sub-500ms response times. The solution streamlined document workflows and improved user experience through intuitive interfaces and rapid data retrieval.",
      technologies: "FastAPI, React, Redis, Python",
      color: "green"
    },
    {
      title: "P&L Forecasting Application",
      description: "Spearheaded the design and implementation of advanced P&L forecasting applications that achieved a 30% improvement in prediction accuracy. Leveraged machine learning models and time-series analysis to provide executives with reliable financial projections, driving more informed business decisions.",
      technologies: "Machine Learning, Time-series Analysis, Python, Data Visualization",
      color: "purple"
    },
    {
      title: "AML Fraud Detection System",
      description: "Led a successful proof-of-concept using Machine Learning techniques in Anti-Money Laundering (AML) to identify fraudulent users and transactions. The system generated $500K in ROI within a year by reducing false positives and improving detection rates of suspicious activities.",
      technologies: "Machine Learning, AWS, Python, Data Mining",
      color: "red"
    },
    {
      title: "Enterprise Data Migration Framework",
      description: "Developed a comprehensive framework to migrate 10PB of AML bank data from Netezza DB to Amazon S3, streamlining data pipelines for Snowflake integration. This initiative reduced development costs by 30% and improved data accessibility across the organization.",
      technologies: "AWS S3, Netezza, Snowflake, ETL, Data Migration",
      color: "yellow"
    },
    {
      title: "Scalable Rules Engine",
      description: "Built a scalable rules engine to centralize and streamline business logic across multiple applications. This solution reduced complexity, improved adaptability to changing business requirements, and enhanced maintainability of the codebase.",
      technologies: "Java, Microservices, Business Rules Management",
      color: "indigo"
    }
  ];

  const insertProject = db.prepare("INSERT INTO projects (title, description, technologies, color) VALUES (?, ?, ?, ?)");
  projects.forEach(project => {
    insertProject.run(
      project.title,
      project.description,
      project.technologies,
      project.color
    );
  });
  insertProject.finalize();

  console.log("Database has been created and populated with data!");
});

// Close the database connection
db.close((err) => {
  if (err) {
    console.error("Error closing database:", err.message);
  } else {
    console.log("Database connection closed.");
  }
}); 