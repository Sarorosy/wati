// Helper function
export const getStatus = (status) => {
  const statusMap = {
    1: { name: "Lead In", color: "bg-blue-100 text-blue-700" },
    2: { name: "Contact Made", color: "bg-green-100 text-green-700" },
    3: { name: "Quoted", color: "bg-yellow-100 text-yellow-700" },
    5: { name: "Converted", color: "bg-purple-100 text-purple-700" },
    6: { name: "Client Not Interested", color: "bg-red-100 text-red-700" },
    7: { name: "Reminder", color: "bg-orange-100 text-orange-700" },
    8: { name: "Lost Deals", color: "bg-gray-200 text-gray-600" },
    9: { name: "Contact Not Made", color: "bg-pink-100 text-pink-700" },
    10: { name: "Cross Sell", color: "bg-teal-100 text-teal-700" },
  };

  const statusInfo = statusMap[status] || {
    name: "Unknown",
    color: "bg-gray-100 text-gray-500",
  };

  return (
    <span
      className={`px-2 py-0.5 rounded-full text-[11px]  ${statusInfo.color}`}
    >
      {statusInfo.name}
    </span>
  );
};

export const statusOptions = [
  { id: "", name: "All" },
  { id: 1, name: "Lead In" },
  { id: 2, name: "Contact Made" },
  { id: 3, name: "Quoted" },
  { id: 5, name: "Converted" },
  { id: 6, name: "Client Not Interested" },
  { id: 7, name: "Reminder" },
  { id: 8, name: "Lost Deals" },
  { id: 9, name: "Contact Not Made" },
  { id: 10, name: "Cross Sell" },
];

export function normalizePhoneNumber(phone, defaultCountryCode = "91") {
  if (!phone) return "";

  // Remove everything except digits
  let cleaned = phone.replace(/\D/g, "");

  // If it starts with 0 → drop it and add default country code
  if (cleaned.startsWith("0")) {
    cleaned = cleaned.substring(1);
    cleaned = defaultCountryCode + cleaned;
  }
  // If it's exactly 10 digits → assume it's local India number
  else if (cleaned.length === 10) {
    cleaned = defaultCountryCode + cleaned;
  }
  // Otherwise → assume it already has country code (like 91..., 180..., 44...)

  return cleaned;
}

export const fetchMedia = async (fileName) => {
  try {
    const res = await fetch(
      `https://app-server.wati.io/api/v1/getMedia?fileName=${encodeURIComponent(
        fileName
      )}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI3NDFjNGZmNS1jNGU0LTRjMDQtYWMwNy1lNWQ4ZjhmNTlmMzkiLCJ1bmlxdWVfbmFtZSI6IndlYkB0aGVzaXNpaW5kaWEubmV0IiwibmFtZWlkIjoid2ViQHRoZXNpc2lpbmRpYS5uZXQiLCJlbWFpbCI6IndlYkB0aGVzaXNpaW5kaWEubmV0IiwiYXV0aF90aW1lIjoiMDkvMDIvMjAyNSAwNDo0Njo1NCIsImRiX25hbWUiOiJ3YXRpX2FwcF90cmlhbCIsImh0dHA6Ly9zY2hlbWFzLm1pY3Jvc29mdC5jb20vd3MvMjAwOC8wNi9pZGVudGl0eS9jbGFpbXMvcm9sZSI6IlRSSUFMIiwiZXhwIjoxNzU3MzkzMjEzLCJpc3MiOiJDbGFyZV9BSSIsImF1ZCI6IkNsYXJlX0FJIn0.vycmu2yZIicYjNBeOc0OiBl45EFMvOvG7CcW4GPVc8o`,
        },
      }
    );

    if (!res.ok) throw new Error("Failed to fetch media");

    const blob = await res.blob();
    return URL.createObjectURL(blob); // create local URL
  } catch (err) {
    console.error("Media fetch failed:", err);
    return null;
  }
};

// utils/formatDate.js
export function formatDate(isoString) {
  if (!isoString) return "";

  const date = new Date(isoString);

  // Format using Intl with IST timezone
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata", // IST (GMT+5:30)
  })
    .format(date)
    .replace(",", ""); // remove extra comma
}


export function formatMessage(text) {
  if (!text) return null;

  // Replace in order: strike → bold → italic
  const parts = text
    .replace(/~(.*?)~/g, "<strike>$1</strike>")   // ~strike~
    .replace(/\*(.*?)\*/g, "<b>$1</b>")           // *bold*
    .replace(/_(.*?)_/g, "<i>$1</i>");            // _italic_

  return <span dangerouslySetInnerHTML={{ __html: parts }} />;
}


export async function markMessagesRead(query_id) {
  if (!query_id) return { status: false, message: "Invalid query_id" };

  try {
    // const apiUrl= "https://instacrm.rapidcollaborate.com/test/api/readallwatimessages"
    const apiUrl= "https://loopback-skci.onrender.com/api/wati/readallmessages"
    const response = await fetch(
      apiUrl,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query_id }),
      }
    );

    const result = await response.json();
    return result; // { status: true, message: "Unread messages marked..." }
  } catch (error) {
    console.error("Error marking messages as read:", error);
    return { status: false, message: error.message };
  }
}
