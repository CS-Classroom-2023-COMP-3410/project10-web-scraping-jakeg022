const cheerio = require('cheerio');
const axios = require('axios');
const fs = require('fs');

// Fetch and parse the webpage
axios.get('https://bulletin.du.edu/undergraduate/majorsminorscoursedescriptions/traditionalbachelorsprogrammajorandminors/computerscience/#coursedescriptionstext')
  .then(response => {
    console.log('Fetching webpage...');
    const $ = cheerio.load(response.data); // Load the fetched HTML into Cheerio
    let courseBlocks = $('div.courseblock');
    console.log(`Found ${courseBlocks.length} course blocks.`);

    const courses = []; 

    courseBlocks.each((index, element) => {
      const titleElement = $(element).find('p.courseblocktitle').text().trim(); // Extract course title
      const descElement = $(element).find('p.courseblockdesc').text().trim(); // Extract course description text

      const classNumberMatch = titleElement.match(/COMP\s*(\d+)/i); // Extract class number
      
      const classNumber = classNumberMatch ? parseInt(classNumberMatch[1]) : null; // Parse class number
      if (classNumber && classNumber >= 3000 && !descElement.toLowerCase().includes('prerequisite')) {
        const courseCode = `COMP ${classNumber}`;
        const courseTitle = titleElement.replace(/COMP \d+/, '').trim(); 
        courses.push({ course: courseCode, title: courseTitle });
        
      }
    });


    const outputPath = './results/bulletin.json';
    fs.mkdirSync('./results', { recursive: true });
    fs.writeFileSync(outputPath, JSON.stringify({ courses }, null, 2)); // Write JSON file
    console.log(`Saved ${courses.length} courses to ${outputPath}`);
  })
  .catch(error => {
    console.error('Error fetching and parsing the page:', error.message); // Improved error handling
  });