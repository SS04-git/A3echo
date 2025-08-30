// src/app/api/chat.js
import supabase from "./supabase";

// GET /api/chats - Fetch list of all chats the user is part of
export async function getChats(userId, offset = 0, limit = 20) {
  if (!userId) throw new Error("userId is required");
  if (offset < 0 || limit <= 0) throw new Error("Invalid offset or limit");

  // Step 1: get all chat_ids the user belongs to
  const { data: myChats, error: myChatsError } = await supabase
    .from("chat_participants")
    .select("chat_id")
    .eq("user_id", userId);

  if (myChatsError) throw myChatsError;
  if (!myChats?.length) return [];

  const chatIds = myChats.map(c => c.chat_id);

  // Step 2: fetch all participants + chat details for those chat_ids
  const { data, error } = await supabase
    .from("chat_participants")
    .select(`
      chat_id,
      user_id,
      profiles (
        id,
        name,
        avatar,
        status
      ),
      chats (
        id,
        name,
        chat_last_message (
          messages (
            id,
            body,
            created_at,
            sender_id,
            profiles (id, name, avatar, status)
          )
        )
      )
    `)
    .in("chat_id", chatIds)
    .range(offset, offset + limit - 1);

  if (error) throw error;

  // map each chat to "the other participant"
  const resultData = chatIds.map(chatId => {
    const participants = data.filter(d => d.chat_id === chatId);
    const chat = participants[0]?.chats || { id: chatId, name: "Untitled Chat" };

    // pick the other user
    const other = participants.find(p => p.user_id !== userId)?.profiles;

    const latestMessage = chat.chat_last_message?.messages || { body: "No messages yet" };

    return {
      chat_id: chatId.toString(),
      name: chat.name,
      last_message_preview: latestMessage.body,
      participant: {
        id: other?.id || null,
        name: other?.name || "Unknown User",
        avatar: other?.avatar || "/default-avatar.jpg",
        status: other?.status || "offline",
      },
    };
  });

  console.log("Final getChats result:", JSON.stringify(resultData, null, 2));
  return resultData;
}

// GET /api/messages/:messageId - Fetch a single message by ID
export async function getMessageById(messageId) {
  if (!messageId) {
    console.error("No messageId provided to getMessageById");
    throw new Error("messageId is required");
  }

  const { data, error } = await supabase
    .from("messages")
    .select(`
      id,
      body,
      created_at,
      sender_id,
      chat_id,
      profiles (
        id,
        name,
        avatar,
        status
      )
    `)
    .eq("id", messageId)
    .single();

  if (error) {
    console.error("getMessageById error:", error);
    throw error;
  }

  if (!data) {
    console.error("No message found for messageId:", messageId);
    throw new Error("Message not found");
  }

  console.log("Fetched message:", JSON.stringify(data, null, 2));
  return {
    id: data.id,
    body: data.body,
    created_at: data.created_at,
    sender_id: data.sender_id,
    chat_id: data.chat_id,
    profiles: {
      id: data.profiles?.id || null,
      name: data.profiles?.name || "Unknown User",
      avatar: data.profiles?.avatar || "/default-avatar.jpg",
      status: data.profiles?.status || "offline",
    },
  };
}

// GET /api/chats/:chatId - Fetch full details of a specific chat
export async function getChatDetails(chatId, userId) {
  if (!chatId) throw new Error("chatId is required");
  if (!userId) throw new Error("userId is required for getChatDetails");

  const { data, error } = await supabase
    .from("chats")
    .select(`
      id,
      name,
      chat_participants (
        user_id,
        profiles (
          id,
          name,
          avatar,
          status
        )
      )
    `)
    .eq("id", chatId)
    .single();

  if (error) {
    console.error("getChatDetails error:", error);
    throw error;
  }

  // Pick the other participant (exclude current user)
  const other = data.chat_participants.find(p => p.user_id !== userId)?.profiles;

  return {
    chat_id: data.id,
    name: data.name,
    participant: {
      id: other?.id || null,
      name: other?.name || "Unknown User",
      avatar: other?.avatar || "/default-avatar.jpg",
      status: other?.status || "offline",
    }
  };
}

// GET /api/chats/:chatId/messages - Get all messages in a selected chat
export async function getMessagesForChat(chatId, offset = 0, limit = 50) {
  if (!chatId) {
    console.error("No chatId provided to getMessagesForChat");
    throw new Error("chatId is required");
  }
  if (offset < 0 || limit <= 0) {
    console.error("Invalid pagination parameters", { offset, limit });
    throw new Error("Invalid offset or limit");
  }

  const { data, error } = await supabase
    .from("messages")
    .select(`
      id,
      body,
      created_at,
      sender_id,
      profiles (
        id,
        name,
        avatar,
        status
      )
    `)
    .eq("chat_id", chatId)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error("getMessagesForChat error:", error);
    throw error;
  }

  return data.reverse(); // Reverse to show oldest first
}

// POST /api/chats/:chatId/messages - Send a new message to a chat
export async function sendMessage(chatId, senderId, body) {
  if (!chatId || !senderId || !body?.trim()) {
    console.error("Missing required fields for sendMessage", { chatId, senderId, body });
    throw new Error("chatId, senderId, and body are required");
  }

  const { data, error } = await supabase.rpc("insert_message_and_update_last", {
    p_chat_id: chatId,
    p_sender_id: senderId,
    p_body: body.trim(),
  });

  if (error) {
    console.error("sendMessage error:", error);
    throw error;
  }

  return data;
}