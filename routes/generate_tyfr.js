// routes/generate_tyfr.js
const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const PizZip = require('pizzip');
const Docxtemplater = require('docxtemplater');

function formatDate(dateString, format = 'MM/DD/YYYY') {
    const date = new Date(dateString);
    const month = date.toLocaleString('default', {
        month: 'long'
    });
    const monthShort = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();

    if (format === 'MMMM DD, YYYY') {
        return {
            formattedDate: `${month} ${day}, ${year}`,
            month: month,
        };
    } else if (format === 'YYYY-MM-DD') {
        return `${year}-${monthShort}-${day}`;
    } else {
        return `${monthShort}/${day}/${year}`;
    }
}


function formatNumber(number) {
    return parseFloat(number).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
}

function getBuilding(unit) {
    return Math.floor(parseInt(unit) / 100) * 100;
}

router.post('/generate-tyfr', (req, res) => {
    const data = req.body;

    // console.log(data);

    // Format the dates
    data.todaysdate = formatDate(data.todaysdate);
    const leaseEndFormatted = formatDate(data.leaseend, 'MMMM DD, YYYY');
    data.leaseend = leaseEndFormatted.formattedDate;
    data.leaseendmonth = leaseEndFormatted.month;

    // Sum the rentpart1 and rentpart2 values and store the result in data.proratedrent
    data.proraterent = parseFloat(data.rentpart1) + parseFloat(data.rentpart2);

    // Format the prorated rent
    data.proratetotal = formatNumber(data.proraterent);

    // Check if the second person data is provided
    const hasSecondPerson = data.firstname2 && data.lastname2;

    // Load the DOCX file as a binary
    const content = fs.readFileSync(path.resolve(__dirname, '../tyfr.docx'), 'binary');

    // Create a PizZip instance with the file content
    const zip = new PizZip(content);

    // Create a docxtemplater instance with the PizZip instance
    const doc = new Docxtemplater().loadZip(zip);

    // Get the building number from the unit number
    data.building = getBuilding(data.unit);

    // Set the template variables
    doc.setData({
        todaysdate: data.todaysdate,
        firstname: data.firstname,
        lastname: data.lastname,
        hasSecondPerson: hasSecondPerson,
        firstname2: data.firstname2 || '',
        lastname2: data.lastname2 || '',
        newline: hasSecondPerson ? '\n' : '',
        combinedNames: hasSecondPerson ? `${data.firstname} and ${data.firstname2}` : data.firstname,
        building: data.building,
        unit: data.unit,
        leaseend: data.leaseend,
        leaseendmonth: data.leaseendmonth,
        proratetotal: data.proratetotal,
        dayrange1: data.dayrange1,
        rentpart1: data.rentpart1,
        dayrange2: data.dayrange2,
        rentpart2: data.rentpart2,
        nextmonth: data.nextmonth,
        newrent: data.newrent
    });

    console.log(doc);

    // Render the document
    try {
        doc.render();
    } catch (error) {
        console.error(error);
        res.status(500).send('Error rendering the document.');
        return;
    }

    // Generate the output file
    const outputBuffer = doc.getZip().generate({
        type: 'nodebuffer'
    });

    // Set the response headers for downloading the file
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename=TYFR-${data.lastname}-${data.unit}.docx`);

    // Send the file as a response
    res.send(outputBuffer);
});

module.exports = router;