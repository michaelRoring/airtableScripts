const tableChosen = await input.tableAsync("Choose a table");
const viewChosen = await input.viewAsync("Choose a view", tableChosen);

let informations = await tableChosen.selectRecordsAsync({
  fields: ["Full Name", "Seniority Level", "Company Name", "Reference Person"],
});

const checkOnlyPerson = (companyName, index) => {
  let nextStep = index + 1;
  let beforeStep = index - 1;

  if (index === 0) {
    if (
      informations.records[nextStep].getCellValueAsString("Company Name") ===
      companyName
    ) {
      return false;
    }
  } else {
    if (
      informations.records[nextStep].getCellValueAsString("Company Name") ===
        companyName &&
      informations.records[beforeStep].getCellValueAsString("Company Name") !==
        companyName
    ) {
      return false;
    }
  }
};

const checkLowestPosition = (companyName, index) => {
  let lowestNumber = Infinity;
  for (let i = index + 1; i < informations.records.length; i++) {
    if (
      companyName ===
      informations.records[i].getCellValueAsString("Company Name")
    ) {
      const seniorityLevelNext =
        +informations.records[i].getCellValueAsString("Seniority Level");
      if (seniorityLevelNext < lowestNumber) {
        lowestNumber = seniorityLevelNext;
      }
    }
  }

  return lowestNumber;
};

for (let i = 0; i < informations.records.length; i++) {
  const record = informations.records[i];

  const fullName = record.getCellValueAsString("Full Name");
  const companyName = record.getCellValueAsString("Company Name");
  const seniority = record.getCellValueAsString("Seniority Level");
  const seniorityLevel = +seniority;

  //   checking if he is the only one in the company
  if (checkOnlyPerson(companyName, i)) {
    console.log("only person in the company");

    await tableChosen.updateRecordAsync(record, {
      "Reference Person": "-",
    });
    continue;
  }

  //   checking if he is the lowest position in the company
  const lowestPosition = checkLowestPosition(companyName, i);

  //  checking the person with the lower position

  let j = i + 1;
  let isLastPerson = true; // Flag to track if the current person is the last in the company with lowest seniority

  for (j; j < informations.records.length; j++) {
    if (
      companyName ===
      informations.records[j].getCellValueAsString("Company Name")
    ) {
      const seniorityLevelNextPerson =
        +informations.records[j].getCellValueAsString("Seniority Level");

      // checking if the next person is having lower position
      if (seniorityLevelNextPerson < seniorityLevel) {
        await tableChosen.updateRecordAsync(record, {
          "Reference Person":
            informations.records[j].getCellValueAsString("Full Name"),
        });
        isLastPerson = false;
        break;
      }
      //   checking if the next person is the lowest position
      if (
        seniorityLevelNextPerson === seniorityLevel &&
        seniorityLevelNextPerson === lowestPosition
      ) {
        await tableChosen.updateRecordAsync(record, {
          "Reference Person":
            informations.records[j].getCellValueAsString("Full Name"),
        });
        isLastPerson = false;
        break;
      }
    }
  }

  // If the current person is the last in the company with lowest seniority, update reference person
  if (isLastPerson) {
    const lastPerson =
      //   informations.records[j - 1].getCellValueAsString("Full Name");
      informations.records[i - 1].getCellValueAsString("Full Name");

    if (
      seniorityLevel <
      +informations.records[i - 1].getCellValueAsString("Seniority Level")
    ) {
      await tableChosen.updateRecordAsync(record, {
        "Reference Person": "someone else from the marketing team",
      });
    } else {
      await tableChosen.updateRecordAsync(record, {
        "Reference Person": lastPerson,
      });
    }
  }
}
