require("dotenv").config();

const fs = require("fs");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;
const parse = require("csv-parse");
const clearbit = require("clearbit")(process.env.CLEARBIT_API_KEY);

// makes csv readable 
const parseCSV = parse(
    { columns: true, skip_empty_lines: true, trim: true },
    (error, companies) => {
    // remove repeating companies 
      let nonRepeatingCompanies = removeDuplicateCompanies(companies);
      // find the domain for non repeating companies
      nameToDomainAPI(nonRepeatingCompanies);
      if(error){
          console.log(error)
      }
    }
  );

// Write new csv to file system
const csvWriter = createCsvWriter({
    path: __dirname + "/new-company-list.csv",
    header: [
      { id: "name", title: "Company Names" },
      { id: "domain", title: "Domain Names" },
    ],
  });

// use clearbit name-to-domain API
const nameToDomainAPI = companies => {
    // loop through companies to find matching domains
    companies.map((company) => {
      clearbit.NameToDomain.find({ name: company["Company Names"] })
        .then(res => {
          // write new csv to file system
          csvWriter.writeRecords([res]);
        })
        // throw an error if no domain was found
        .catch(error => {
          console.log('No domain name was found');
        });
    });
  }

// remove duplicate compnaies from list
const removeDuplicateCompanies = (companies) => {
  // filter out duplicate companies
  let newCompanyList = companies.filter((item, index) => companies.indexOf(item) === index)
  // return new list of unique companies
  return newCompanyList;
}

// parse and add csv to directory
fs.createReadStream(__dirname + "/list-of-companies.csv").pipe(parseCSV);