/* WHAT ARE WE LOOKING TO ACCOMPLISH?
    - goal:
        - allow users to search through thousands of plants to determine what they should grow in their garden/keep inside
    - functionality
        - user types plant name into search bar
            - does it just have to be plant name?
                - zone?
        - submit.on(click)
            - images of plants similar to the search query pop up on the screen with botanical and generic names 
        - user can then click on a plant image
            - pop up information or new window?
                - which is easier?
    - user gives a value
        - check for the value in botanical, generic, etc., names
        - display results that match the value
    - what information needs to be available to the user?
        - plant names
            - botanical/generic
        - light/water requirements
        - zone
    - NEXT STEPS:
        -> provide user with suggestions when there are 0 results matching their search
            --> e.g. userSearch: phillodendron
            --> prompt: "Did you mean philodendron?"
                ---> OR: "Plants with similar names"
*/

// namespace object
const plantGuide = {};
// trefle.io API key/token
plantGuide.apiKey = "8xvDs1qwtUvf5Z1gjXL4KgH5b0RbJcWzSA1xLA5UBmE";

// ajax request via Juno proxy
// store in a method so queries can be made upon user request
plantGuide.getPlants = function(pageNumber) {
    // return the ajax call so the promise can be used after requesting multiple pages from the API
    return $.ajax({
        url: "http://proxy.hackeryou.com",
        method: "GET",
        dataType: "json",
        data: {
            reqUrl: `https://trefle.io/api/v1/plants`,
            xmlToJSON: false,
            useCache: false,
            params: {
                // has a query param of token
                token: plantGuide.apiKey,
                // has a page param; takes an integer
                page: pageNumber
            }
        }
    });
}
// counter = 8 --> pass into method

// method to request multiple promises from the API
plantGuide.promisedPlants = function() {
    // create an array to store plant promise in order
    const plantArray = [];

    // loop through the API's pages in order to store multiple promises
    for (i = 1; i <= 8; i++) {
        plantGuide.getPlants(i);
        // push the new plants into the array
        plantArray.push(plantGuide.getPlants(i));
    }
    /* TODO
    - next and previous buttons
        - link to the next/previous 8 API pages
        - the API does have links for:
            - first page
            - last page
            - this page
            - next page
            - previous page
    */
    // pass param into promisedPlants so 8 is dynamic
        // counter at one
            // loop from pg 1 to 8
            // increment counter +8 (e.g.) on "next" button click
            // pass new counter value into promisedPlants
            // max # has to change to

    // check if promises have been returned successfully
    $.when(...plantArray).then(function(...rootedPlants) {
        // iterate through the array and retrieve the dataObject of the .when array
        const plantInfo = rootedPlants.map(function(plantGroup) {
            return plantGroup[0];
        });
        // retrieve the data object for each object within the plantInfo array
        const plantDataArray = plantInfo.map(function(singlePlant) {
            return singlePlant.data;
        });
        plantGuide.getValue(plantDataArray);
    }).fail(function() {
        // TODO turn this into a UI experience
        console.log("Plants did not take root.");
    });
}

// SECOND API CALL
    // new endpoint?
    // id number?
    // pass id into moreInfo (instead of plant)

// display plants on the page
plantGuide.displayPlants = function(plant) {
    // html string to store each plant with their information and picture
    const htmlPlant = `
        <div class="searchResults">
            <div class="imageContainer">
                <img src=${plant.image_url} alt=${plant.common_name} class="plantImage">
            </div>
            <div class="textContainer">
                <h3>${plant.common_name}</h3>
                <h4>${plant.scientific_name}</h4>
            </div>
            <!-- this div will be used to display more information about the plant when clicked -->
            <div class="overlay">
                <button class="moreInfo" id="moreInfo" data-plantId="${plant.id}">Click for more information on this plant!</button>
            </div>
        </div>
    `;
    $("#plantContainer").append(htmlPlant);
}

// method to display more information on a targeted plant
plantGuide.moreInfo = function(plant) {
    // html string to store the plant's additional information
    const htmlPlant = `
        <div className="plantInfo">
            <h3>${plant.common_name}</h3>
            <h4>${plant.scientific_name}</h4>
        </div>
    `;
    $(".searchResults").append(htmlPlant);
    
    /* 
        author: "L."
        bibliography: "Sp. Pl.: 984 (1753)"
        common_name: "Stinging nettle"
        family: "Urticaceae"
        family_common_name: "Nettle family"
        genus: "Urtica"
        genus_id: 1028
        id: 190500
        image_url: "https://bs.floristic.org/image/o/85256a1c2c098e254fefe05040626a4df49ce248"
        links: Object { self: "/api/v1/species/urtica-dioica", plant: "/api/v1/plants/urtica-dioica", genus: "/api/v1/genus/urtica" }
        rank: "species"
        scientific_name: "Urtica dioica"
        slug: "urtica-dioica"
        status: "accepted"
        synonyms: Array(6) [ "Urtica major", "Urtica tibetica", "Urtica sicula", … ]
        year: 1753
    */

}

// method that stores user submit value and compares that value to the returned promise
plantGuide.getValue = function(plants) {
    // store promise in a constant
    const plantInfo = plants;
    // store user search query
    const userSearch = $("#query").val();

    // compare userSearch value (in lowercase) to the common_name value and scientific_name value for each plant object in an array at each index of the plantInfo array
    // if userSearch is not an empty string:
    if (userSearch !== "") {
        // clear #plantContainer before adding the new search to the page
        $("#plantContainer").html("");
        // plantInfo is an array of arrays, each containing 20 objects
        plantInfo.forEach(function(plantGroup) {
            plantGroup.filter(function(plant) {
                // if userSearch (lowercase) is the same as the common_name or scientific_name of the plant object:
                if ((plant.common_name.toLowerCase().includes(userSearch.toLowerCase())) || (plant.scientific_name.toLowerCase().includes(userSearch.toLowerCase()))) {
                    // display the plant object to the page
                    plantGuide.displayPlants(plant);
                    // TODO display number of results on page
                        // array length?
                }
                // TODO if no results match the search:
                    // please check spelling
                    // recommend possible plant names based on search
                    // display number of results on page (0)
            });
        });
    } else {
        // TODO turn this alert into text that appears above the search field
        alert("Please enter a plant name.");
    }
}

plantGuide.createEventListeners = function() {
    // listen for submit when user searches for a type of plant
    $("input[type=submit]").on("click", function(e) {
        // prevent default behaviour
        e.preventDefault();
        // retrieve promise from ajax call
        plantGuide.promisedPlants();
    });

    // listen for when a user would like more information on a specific plant
    $("#plantContainer").on("click", "#moreInfo", function() {
        console.log("More Info is requested.");
        // get data attribute on the button
            // PASS THIS INTO MOREINFO (for api call)
        console.log($(this).data("plantId"));
        // display more information about the specific plant that was clicked on
        plantGuide.moreInfo();
    })
}

// initialize app
plantGuide.init = function() {
    // event listeners
    plantGuide.createEventListeners();
}

// doc.ready
$(function() {
    // call init
    plantGuide.init();
});