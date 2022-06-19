// prompt with only examples of the class itself

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

// const label = req.body.label;
const label = "tree";
const subject = prompts[label].subject;
const examples = prompts[label].examples;

const prompt = `The following is a short poem about ${subject} ${examples[0]}### The following is a short poem about ${subject} ${examples[1]}### The following is a short poem about ${subject} ${examples[2]}### The following is a short poem about ${subject}`;
