import { Database, OPEN_READWRITE, OPEN_CREATE } from "sqlite3"
import { createMessageEmbedding, createQueryEmbedding } from "./embed"

const vectorExtensionPath = "./vector0.dylib"
const vssExtensionPathVSS = "./vss0.dylib"
const DB_PATH = "./chat.sqlite"
let db: Database

// create or open the chat.sqlite database
function openDatabase(): Promise<Database> {
  return new Promise((resolve, reject) => {
    const db = new Database(DB_PATH, OPEN_READWRITE | OPEN_CREATE, (err) => {
      if (err) reject(err)
      resolve(db)
    })
  })
}

// load a SQLite extension
function loadExtension(db: Database, path: string): Promise<void> {
  return new Promise((resolve, reject) => {
    db.loadExtension(path, (err) => {
      if (err) {
        reject(err)
      } else {
        resolve()
      }
    })
  })
}

export async function setupDatabase(): Promise<Database> {
  db = await openDatabase()
  try {
    await loadExtension(db, vectorExtensionPath)
    console.log("vector extension loaded")
  } catch (err) {
    console.error("Failed to load vector extension", err)
    throw err
  }

  try {
    // load the SQLite vector extension
    // https://github.com/asg017/sqlite-vss
    await loadExtension(db, vssExtensionPathVSS)
    console.log("vss extension loaded successfully")
  } catch (err) {
    console.error("Failed to load vss extension", err)
    throw err
  }

  await new Promise<void>((resolve, reject) => {
    db.get(
      "SELECT vss_version() AS version",
      (err, row: { version: number }) => {
        if (err) {
          console.error("Error running vss_version()", err)
          reject()
        } else {
          console.log("vss_version:", row.version) // 'v0.0.1'
          resolve()
        }
      }
    )
  })
  return new Promise((resolve, reject) => {
    // we are storing our vectors as TEXT in the "message_embedding" column
    db.run(
      `CREATE TABLE IF NOT EXISTS chatHistory (
        type TEXT,
        command TEXT,
        content TEXT,
        timestamp TEXT,
        message_embedding TEXT
      );`,
      (creationError) => {
        if (creationError) {
          console.error("Error creating chatHistory table", creationError)
          reject(creationError)
          return
        }

        console.log("Successfully created chatHistory table")
        db.run(
          `CREATE VIRTUAL TABLE IF NOT EXISTS vss_chatHistory using vss0(message_embedding(512));`,
          (creationError) => {
            if (creationError) {
              console.error(
                "Error creating vss_chatHistory table",
                creationError
              )
              reject(creationError)
              return
            }

            console.log("Successfully created vss_chatHistory virtual table")
            resolve(db)
          }
        )
      }
    )
  })
}

// This function performs the vector search, using "k nearest neighbors" algorithm to
// find the closest 10 (from the 'limit 10') vectors to our search input.
// The vectors are sorted by "distance", where the smallest "distance"
// is the vector most similar to our query embedding
export async function searchChatHistory(query: string) {
  const queryEmbedding = await createQueryEmbedding(query)
  return new Promise((resolve, reject) => {
    db.all(
      `with matches as (
          select rowid,
          distance
          from vss_chatHistory where vss_search(message_embedding, (?))
          limit 10
        )
        select
        chatHistory.type,
        chatHistory.command,
        chatHistory.content,
        chatHistory.timestamp,
        matches.distance
        from matches 
        left join chatHistory on chatHistory.rowid = matches.rowid`,
      [queryEmbedding],
      function (err: any, result: any) {
        if (err) {
          return reject(err)
        }
        return resolve(result)
      }
    )
  })
}

export async function addToChatHistory(
  type: "user" | "ai",
  command: string,
  content: string
): Promise<void> {
  const timestamp = new Date().toISOString()
  const messageEmbedding = await createMessageEmbedding(
    type,
    command,
    content,
    timestamp
  )
  return new Promise<void>(async (resolve, reject) => {
    // Insert into our chatHistory table
    db.run(
      "INSERT INTO chatHistory (type, command, content, timestamp, message_embedding) VALUES (?, ?, ?, ?, ?)",
      [type, command, content, timestamp, messageEmbedding],
      function (err) {
        if (err) {
          console.error("Error inserting into chatHistory", err)
          db.run("ROLLBACK")
          reject(err)
          return
        }

        const lastRowId = this.lastID
        // Insert into our vss_chatHistory virtual table, keeping the rowid values in sync with chatHistory
        db.run(
          "INSERT INTO vss_chatHistory(rowid, message_embedding) VALUES (?, ?)",
          [lastRowId, messageEmbedding],

          (err) => {
            if (err) {
              console.error("Error inserting into vss_chatHistory", err)
              reject(err)
              return
            }
            return resolve()
          }
        )
      }
    )
  })
}
