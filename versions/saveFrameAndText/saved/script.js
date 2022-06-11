// call db to show saved snaps
// add last snap to the top:
/* let img = document.createElement("img");
  img.src = snap;
  document.body.appendChild(img); */
// call openai
// show text
// update db

// OR

// call openai
// update db
// call db
// render

window.onload = () => {
  console.log("window loaded!");
  console.log(localStorage);

  let snapContainer = document.getElementById("snapContainer");
  console.log(snapContainer);

  // get snap from last page
  let snap = JSON.parse(localStorage.getItem("snap"));
  // get text from openai
  let text = "openai generated text";

  // add text and snap to db (when open ai is ready)
  let addBtn = document.getElementById("add");
  addBtn.addEventListener("click", addSnap);

  let displayData = () => {
    // Open our object store and then get a cursor - which iterates through all the
    // different data items in the store
    const objectStore = db.transaction("snaps_os").objectStore("snaps_os");
    objectStore.openCursor(null, "prev").addEventListener("success", (e) => {
      // Get a reference to the cursor
      const cursor = e.target.result;

      // If there is still another data item to iterate through, keep running this code
      if (cursor) {
        // Create a list item, h3, and p to put each data item inside when displaying it
        // structure the HTML fragment, and append it inside the list

        console.log(cursor.value);
        let img = document.createElement("img");
        img.src = cursor.value.snap;

        console.log(cursor.value.snap);
        snapContainer.appendChild(img);

        // Iterate to the next item in the cursor
        cursor.continue();
      } else {
        // if there are no more cursor items to iterate through, say so
        console.log("snaps all displayed");
      }
    });
    objectStore
      .openCursor()
      .addEventListener("error", () => console.log("openCursor error"));
  };

  function addSnap() {
    const newSnap = {
      snap: snap,
      text: text,
    };

    // open a read/write db transaction, ready for adding the data
    const transaction = db.transaction(["snaps_os"], "readwrite");

    // call an object store that's already been added to the database
    const objectStore = transaction.objectStore("snaps_os");

    // Make a request to add our newItem object to the object store
    const addRequest = objectStore.add(newSnap);

    transaction.addEventListener("complete", () => {
      console.log("Transaction completed: database modification finished.");

      // update the display of data to show the newly added item, by running displayData() again.
      displayData();
    });

    transaction.addEventListener("error", () =>
      console.log("Transaction not opened due to error")
    );
  }

  // IDB
  // open the database, create one when it doesn't exist yet
  let db;
  const openRequest = window.indexedDB.open("snaps", 1);

  openRequest.addEventListener("error", () =>
    console.error("Database failed to open")
  );

  openRequest.addEventListener("success", () => {
    console.log("Database opened successfully");

    db = openRequest.result;

    // displayData(); // I cant show the old snaps before the new one loads in
  });

  //Set up the database tables if this has not already been done
  openRequest.addEventListener("upgradeneeded", (e) => {
    db = e.target.result; // seperate bc this event runs faster then succes

    //create an objectStore (like a table)
    //with an id keyfield
    const objectStore = db.createObjectStore("snaps_os", {
      keyPath: "id",
      autoIncrement: true,
    });

    /* Define the db scheme: each record will hold:
    {
      snap: "base64string",
      text: "openai generated text",
      id: 8
    }
    */
    objectStore.createIndex("snap", "snap", { unique: false });
    objectStore.createIndex("text", "text", { unique: false });

    console.log("Database setup complete");
  });
};
