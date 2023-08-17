import "@tensorflow/tfjs-node"
import * as tf from "@tensorflow/tfjs-node"
import * as use from "@tensorflow-models/universal-sentence-encoder"

let model: use.UniversalSentenceEncoder

async function createEmbedding(input: string) {
  const embedding = await model.embed(input)
  // we need to get a serializable array from the output tensor
  const embeddingArray = await embedding.array()
  // the first element of the array is the vector we want to store as a string in our database.
  return JSON.stringify(embeddingArray[0])
}

export async function createQueryEmbedding(query: string) {
  return createEmbedding(query)
}

export async function createMessageEmbedding(
  type: string,
  command: string,
  content: string,
  timestamp: string
) {
  return createEmbedding(
    `type: ${type} command: ${command} content: ${content} timestamp: ${timestamp}`
  )
}

export async function setupEmbeddings() {
  try {
    // waiting until tensorflow is ready
    // before loading the universal sentence encoder model
    // that will create our vector embeddings from raw string input
    await tf.ready()
    model = await use.load()
  } catch (err) {
    console.error("failed to load the model", err)
  }
}
