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

const prompts = {
  sky: {
    subject: "the sky",
    examples: [
      "the blue of this sky sounds so loud that it can be heard only with our eyes",
      "blue skiesa change in attitude blows in",
      "Like a drifting cloud Bound by nothing I just let go Giving myself up To the whim of the wind",
    ],
  },
  leaf: {
    subject: "leaves",
    examples: [
      "what do leaves have to say Tales of the wind and the rain, Of sun and shadows too They are nature's storytellers",
      "Look at the leaves and what do you see? Nature's way of painting a masterpiece",
      "Leaves are floating messengers of autumn They bring us news of the changing season",
    ],
  },
  flower: {
    subject: "a flower",
    examples: [
      "The flower that smiles to-day To-morrow dies All that we wish to stay Tempts and then flies",
      "Can we speak in flowers It will be easier for me to understand",
      "lifting up your face smiling in the bright sunshine beautiful flower",
    ],
  },
  plant: {
    subject: "a plant",
    examples: [
      "We start small we are fragile But with time we grow strong",
      "Impatient for sun I stretch towards the sky Desperate for attention",
      "At first we are tiny and insignificant But with time care and love",
    ],
  },
  soil: {
    subject: "the soil",
    examples: [
      "Soil exists for love Hold flowers or plants, equal Root of connection",
      "A plant grows from the soil which fills her hunger She gives back to the Earth.",
      "The soil is alive With billions of creatures Teeming with life",
    ],
  },
  tree: {
    subject: "a tree",
    examples: [
      "She stands tall and proud She has been witness to so much",
      "The tree is standing there Looking at us, but we don't",
      "A tree is like a guardianA watchful, wise old friend",
    ],
  },
};

// endpoints

// prompt = label + previous completions (json)
app.post("/api", async (req, res) => {
  console.log("I got a request!");

  const label = req.body.label;
  const subject = prompts[label].subject;
  const examples = prompts[label].examples;

  const prompt = `The following is a short poem about ${subject} ${examples[0]}### The following is a short poem about ${subject} ${examples[1]}### The following is a short poem about ${subject} ${examples[2]}### The following is a short poem about ${subject}`;

  try {
    const completion = await openai.createCompletion("text-davinci-002", {
      prompt: prompt,
      temperature: 1,
      max_tokens: 25,
      stop: "###",
      presence_penalty: 1.7,
      frequency_penalty: 1.7,
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
