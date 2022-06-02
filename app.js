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

// endpoints

// prompt = label + previous completions (json)
app.post("/api", async (req, res) => {
  console.log("I got a request!");
  const label = req.body.label;
  try {
    const completion = await openai.createCompletion("text-ada-001", {
      prompt: `Write a poem about a ${label}`,
      temperature: 1,
      max_tokens: 10,
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
