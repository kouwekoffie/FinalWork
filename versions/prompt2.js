// prompt with only examples that are not from the class itself

const label = "flower";

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

// let labels = ["plant", "leaf", "flower", "tree", "sky", "soil"];
// lacking a good poem about soil, so I leave soil out of the equation for now
// TODO: find good poem on soil
// TODO: find two or more good poems per class and choose a random on each time prompted

let labels = ["plant", "leaf", "flower", "tree", "sky"];
let examples = {
  plant: "there is peaceful there is wild I am both at the same time",
  leaf: "look at the leaves and what do you see? Nature's way of painting a masterpiece",
  flower: "can we speak in flowers it will be easier for me to understand",
  tree: "the tree is standing there Looking at us, but we don't",
  sky: "blue skies a change in attitude blows in",
};
// filter out the prompt label
labels = labels.filter((e) => e !== label);
labels = shuffle(labels);

console.log(labels);

/*
const prompt = `topic: tree poem: The tree is standing there looking at us, but we don't ### topic: sky poem: blue skies a change in attitude blows in ### topic: plant poem: There is peaceful there is wild I am both at the same time ### topic: flower poem:`;
*/

// TODO: write a function that concatenates a prompt given a number of examples
const prompt = `topic: ${labels[0]}\n poem: ${
  examples[labels[0]]
}\n ###\n topic: ${labels[1]}\n poem: ${examples[labels[1]]}\n ###\n topic: ${
  labels[2]
}\n poem: ${examples[labels[2]]}\n ###\n topic: flower\n poem:`;

console.log(prompt);
