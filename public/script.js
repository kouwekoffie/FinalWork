// dummy data for api call
const completions = [
  "This a dummy completion from the openAI GPT3 model",
  "This is another completion thats different from the previous one",
];
let label = "tree";

// call api on user input (timer or tap)
let data = { label, completions };
const options = {
  method: "POST",
  headers: {
    "Content-Type": "application/json", // say that it's json
  },
  body: JSON.stringify(data), // completions as a json string
};

async function write() {
  const res = await fetch("/api/test", options);
  const json = await res.json();
  console.log(json);
}

write();
