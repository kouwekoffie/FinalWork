//
// PROXYSERVER FOR OPENAI
//

const express = require("express");
const app = express();

require("dotenv").config();
const PORT = process.env.PORT || 3000; // pull port from env var or 3000
app.listen(PORT, () => console.log("listening at 3000"));
app.use(express.static("./public"));
app.use(express.json()); // ability to parse incoming data

// Openai authentication
const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

// gpt3 prompts
//https://stackoverflow.com/a/2450976
function shuffle(array) {
  let currentIndex = array.length,
    randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex != 0) {
    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }

  return array;
}

let labels = ["plant", "leaf", "flower", "tree", "sky"];
let examples = {
  plant: "there is peaceful there is wild I am both at the same time",
  leaf: "look at the leaves and what do you see? Nature's way of painting a masterpiece",
  flower: "can we speak in flowers it will be easier for me to understand",
  tree: "the tree is standing there Looking at us, but we don't",
  sky: "blue skies a change in attitude blows in",
};
//
// endpoints
//

// prompt = label + previous completions (json)
app.post("/api", async (req, res) => {
  console.log("I got a request!");
  const label = req.body.label;

  // filter out the prompt label and shuffle
  labels = labels.filter((e) => e !== label);
  labels = shuffle(labels);

  const prompt = `topic: ${labels[0]}\n poem: ${
    examples[labels[0]]
  }\n ###\n topic: ${labels[1]}\n poem: ${examples[labels[1]]}\n ###\n topic: ${
    labels[2]
  }\n poem: ${examples[labels[2]]}\n ###\n topic: ${label}\n poem:`;

  console.log("label", label);
  console.log("prompt", prompt);

  try {
    const completion = await openai.createCompletion("text-davinci-002", {
      prompt: prompt,
      temperature: 1,
      max_tokens: 20,
      stop: "###",
      presence_penalty: 2,
      frequency_penalty: 2,
    });
    res.send(completion.data);
  } catch (error) {
    console.log(error);
  }
});

//promt = label (req querys or params)
/*
app.get("/api", async (req, res) => {
    try {
      let natureClass = req.query.class;
      const completion = await openai.createCompletion("text-ada-001", {
        prompt: `Write a poem about a ${natureClass}`,
        temperature: 1,
        max_tokens: 5,
      });
      res.send(completion.data.choices[0].text);
    } catch (error) {
      console.log(error);
    }
  });
  */

app.get("/api/engines", async (req, res) => {
  try {
    const enginesData = await openai.listEngines();
    res.send(enginesData.data);
  } catch (error) {
    console.log(error);
  }
});

//dummy completion.data
completionData = {
  id: "dummy",
  object: "text_completion",
  created: 1654188010,
  model: "text-ada-001",
  choices: [
    {
      text: "This a dummy completion from the openAI GPT3 model",
      index: 0,
      logprobs: null,
      finish_reason: "length",
    },
  ],
};

app.post("/api/test", (req, res) => {
  console.log("I got a dummy request!");
  res.json(completionData);
});
