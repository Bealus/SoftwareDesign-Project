let btnGet = document.querySelector("button");
let myTable = document.querySelector("#table");
//hardcoded sample quotes
let quote = [
    {
        name: "Bob Smith",
        streetAddress: "4302 University Drive",
        city: "Houston",
        state: "Texas",
        zipcode: 77204,
        fuelGallons: 10,
        fuelPrice: 30,
    },
    {
        name: "Robert Jones",
        streetAddress: "5555 Potato Blvd",
        city: "Atlanta",
        state: "Georgia",
        zipcode: 30033,
        fuelGallons: 23,
        fuelPrice: 69,
    },
    {
        name: "Hank Miller",
        streetAddress: "3758 Mountain Pass",
        city: "Denver",
        state: "Colorado",
        zipcode: 80014,
        fuelGallons: 54,
        fuelPrice: 162,
    }
];

let headers = ["Name", "Address", "City", "State", "Zipcode", "Fuel (G)", "Price ($)"];
//create table element upon click
btnGet.addEventListener("click", () => {
    let table = document.createElement("table");
    let headerRow = document.createElement("tr");
    //loop the array to display headers
    headers.forEach(headerText => { 
        let header = document.createElement("th");
        let textNode = document.createTextNode(headerText);
        header.appendChild(textNode);
        headerRow.appendChild(header);
    });

    table.appendChild(headerRow);
    //display data in table
    quote.forEach(emp => {
        let row = document.createElement("tr");
        //retrieve values from each quote object
        Object.values(emp).forEach(text => {
            let cell = document.createElement("td");
            let textNode = document.createTextNode(text);
            cell.appendChild(textNode);
            row.appendChild(cell);
        })

        table.appendChild(row);
    })

    myTable.appendChild(table);
    console.log("Button was clicked");
    console.log(quote);
});
