# Example Sqlite Vector Embeddings

This example tutorial project demonstrates how to utilize TensorFlow.js (specifically Universal Sentence Encoder) and SQLite with the [sqlite-vss](https://github.com/asg017/sqlite-vss) vector extension to create, and search a chat history stored in SQLite.

## Description

The project consists of the following functionalities:

1. **Embeddings Creation:** Using TensorFlow.js and Universal Sentence Encoder, it creates vector embeddings from raw string inputs.
2. **Database Setup:** Connects to SQLite and loads the required extensions for vector operations, along with table creation.
3. **Chat History Management:** It provides functions to add chat messages to the history and perform search queries using vector similarity.

## Getting Started

### Dependencies

Make sure you have Node.js installed in your environment and the required SQLite extensions:

- `sqlite3`
- `@tensorflow/tfjs-node`
- `@tensorflow-models/universal-sentence-encoder`

### Installing

1. **Install wget (if not already installed):**

   ```bash
   brew install wget
   ```

2. **Run the installation script:**

   ```bash
   sh install.sh
   ```

   This script will detect your system's architecture and platform (currently supports arm64 and x86_64 on macOS and x86_64 on Linux) and download the appropriate SQLite vector extensions. Check out the in-depth [docs](https://github.com/asg017/sqlite-vss/blob/main/docs.md) for how to build sqlite-vss yourself to add support for other operating systems.

3. **Install the necessary dependencies:**

   ```bash
   npm install
   ```

### Configuration

Make sure the SQLite extensions and database paths are configured correctly in the code:

```typescript
const vectorExtensionPath = "./vector0.dylib"
const vssExtensionPathVSS = "./vss0.dylib"
const DB_PATH = "./chat.sqlite"
```

## Usage

Run `npm start` and if everything is installed correctly, you should see a list of vectors printed in descending order ranked by similarity to the example input query vector.

## API

### Embeddings Functions

- `createQueryEmbedding(query: string)`: Creates an embedding for the given query.
- `createMessageEmbedding(type: string, command: string, content: string, timestamp: string)`: Creates an embedding for the given chat message.
- `setupEmbeddings()`: Prepares the Universal Sentence Encoder.

### Database Functions

- `setupDatabase(): Promise<Database>`: Opens the database and loads the required extensions, creates tables.
- `searchChatHistory(query: string)`: Searches the chat history based on the query embedding.
- `addToChatHistory(type: "user" | "ai", command: string, content: string): Promise<void>`: Adds a chat message to the history.

## Acknowledgments

- The Universal Sentence Encoder model for creating semantic textual embeddings.
- SQLite vector extension for vector search functionality within the database.
