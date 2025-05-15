"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"

interface Topic {
  id: string
  name: string
  lastMessage?: string
  lastMessageTime?: string
}

interface Message {
  id: string
  content: string
  userId: string
  userName: string
  userAvatar?: string
  timestamp: string
}

interface User {
  id: string
  name: string
  avatar?: string
  role: string
  status: "online" | "offline" | "away"
}

export default function ChatsPage() {
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null)
  const [newTopicName, setNewTopicName] = useState("")
  const [message, setMessage] = useState("")

  // Mock data - replace with real data from your backend
  const topics: Topic[] = [
    { id: "1", name: "General", lastMessage: "Hello everyone!", lastMessageTime: "2m ago" },
    { id: "2", name: "Development", lastMessage: "New feature deployed", lastMessageTime: "1h ago" },
    { id: "3", name: "Design", lastMessage: "Updated mockups", lastMessageTime: "3h ago" },
  ]

  const messages: Message[] = [
    {
      id: "1",
      content: "Hello everyone!",
      userId: "1",
      userName: "John Doe",
      timestamp: "2m ago"
    },
    {
      id: "2",
      content: "Hi there!",
      userId: "2",
      userName: "Jane Smith",
      timestamp: "1m ago"
    }
  ]

  const users: User[] = [
    { id: "1", name: "John Doe", role: "Developer", status: "online" },
    { id: "2", name: "Jane Smith", role: "Designer", status: "away" },
    { id: "3", name: "Mike Johnson", role: "Product Manager", status: "offline" }
  ]

  const handleNewTopic = () => {
    // Add new topic logic here
    setNewTopicName("")
  }

  const handleSendMessage = () => {
    // Send message logic here
    setMessage("")
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex">
      {/* Left sidebar - Topics */}
      <div className="w-64 border-r bg-muted/40">
        <div className="p-4">
          <h2 className="text-lg font-semibold mb-4">Topics</h2>
          <ScrollArea className="h-[calc(100vh-12rem)]">
            {topics.map((topic) => (
              <button
                key={topic.id}
                onClick={() => setSelectedTopic(topic.id)}
                className={`w-full text-left p-2 rounded-lg mb-1 transition-colors ${
                  selectedTopic === topic.id
                    ? "bg-secondary"
                    : "hover:bg-secondary/50"
                }`}
              >
                <div className="font-medium">{topic.name}</div>
                {topic.lastMessage && (
                  <div className="text-sm text-muted-foreground truncate">
                    {topic.lastMessage}
                  </div>
                )}
              </button>
            ))}
          </ScrollArea>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full mt-4">
                <Plus className="w-4 h-4 mr-2" />
                New Topic
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Topic</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Topic name"
                  value={newTopicName}
                  onChange={(e) => setNewTopicName(e.target.value)}
                />
                <Button onClick={handleNewTopic}>Create</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Middle section - Chat */}
      <div className="flex-1 flex flex-col">
        {selectedTopic ? (
          <>
            <div className="flex-1 p-4">
              <ScrollArea className="h-[calc(100vh-12rem)]">
                {messages.map((msg) => (
                  <div key={msg.id} className="flex items-start space-x-4 mb-4">
                    <Avatar>
                      <AvatarImage src={msg.userAvatar} />
                      <AvatarFallback>{msg.userName[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{msg.userName}</span>
                        <span className="text-sm text-muted-foreground">{msg.timestamp}</span>
                      </div>
                      <p className="text-sm">{msg.content}</p>
                    </div>
                  </div>
                ))}
              </ScrollArea>
            </div>
            <div className="p-4 border-t">
              <div className="flex space-x-2">
                <Input
                  placeholder="Type a message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                />
                <Button onClick={handleSendMessage}>Send</Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            Select a topic to start chatting
          </div>
        )}
      </div>

      {/* Right sidebar - Users */}
      <div className="w-64 border-l bg-muted/40 p-4">
        <h2 className="text-lg font-semibold mb-4">Project Members</h2>
        <ScrollArea className="h-[calc(100vh-8rem)]">
          {users.map((user) => (
            <HoverCard key={user.id}>
              <HoverCardTrigger asChild>
                <button className="w-full text-left p-2 rounded-lg mb-1 hover:bg-secondary/50 transition-colors">
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${
                      user.status === "online" ? "bg-green-500" :
                      user.status === "away" ? "bg-yellow-500" :
                      "bg-gray-500"
                    }`} />
                    <span className="font-medium">{user.name}</span>
                  </div>
                </button>
              </HoverCardTrigger>
              <HoverCardContent className="w-80">
                <div className="flex items-center space-x-4">
                  <Avatar>
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback>{user.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-semibold">{user.name}</h4>
                    <p className="text-sm text-muted-foreground">{user.role}</p>
                    <p className="text-sm text-muted-foreground capitalize">{user.status}</p>
                  </div>
                </div>
              </HoverCardContent>
            </HoverCard>
          ))}
        </ScrollArea>
      </div>
    </div>
  )
} 