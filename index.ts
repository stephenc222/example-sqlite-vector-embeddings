import { addToChatHistory, searchChatHistory, setupDatabase } from "./db"
import { setupEmbeddings } from "./embed"

async function main() {
  await setupEmbeddings()
  await setupDatabase()
  await addToChatHistory("user", "LIST_PROJECTS", "list projects")
  await addToChatHistory(
    "ai",
    "LIST_PROJECTS",
    "todo-list,react-notepad,gpt-engineer,pocketbase"
  )
  await addToChatHistory("user", "SEARCH_WEB", "search for keanu reeves")
  const result = await searchChatHistory("my favorite actor")
  console.log(result)
}

main()
