import React, { useState, useEffect } from "react";
import { AlertTriangle, Send, X, MessageSquare, Paperclip } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { normalizePhoneNumber } from "../../../helpers/CommonHelper";
import SendFileModal from "./SendFileModal";
import toast from "react-hot-toast";

const ChatSend = ({ setMessages, selectedUser }) => {
  const [text, setText] = useState("");
  const [messageType, setMessageType] = useState("text");
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [templateParams, setTemplateParams] = useState({});
  const [isOffcanvasOpen, setIsOffcanvasOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isFileModalOpen, setIsFileModalOpen] = useState(false);

  useEffect(() => {
    fetchTemplates();
  }, []);

  useEffect(() => {
    console.log(selectedTemplate);
  }, [selectedTemplate]);

  // Extract {{placeholders}}
  const extractPlaceholders = (body) => {
    if (!body) return [];
    const regex = /{{\s*(.*?)\s*}}/g;
    let match,
      results = [];
    while ((match = regex.exec(body)) !== null) {
      results.push(match[1]); // e.g. "name", "shop_name"
    }
    return results;
  };

  const renderPreview = () => {
    if (!selectedTemplate) return "";
    let text = selectedTemplate.bodyOriginal || selectedTemplate.body || "";
    Object.entries(templateParams).forEach(([key, value]) => {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, "g");
      text = text.replace(regex, value || `{{${key}}}`);
    });
    return text;
  };

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        "https://app-server.wati.io/api/v1/getMessageTemplates",
        {
          method: "GET",
          headers: {
            Authorization:
              "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI3NTM3Y2MzZC1mYmIyLTQ2YzgtOGJiNy0xMTJjZDY0NDZiMGIiLCJ1bmlxdWVfbmFtZSI6IndlYkB0aGVzaXNpaW5kaWEubmV0IiwibmFtZWlkIjoid2ViQHRoZXNpc2lpbmRpYS5uZXQiLCJlbWFpbCI6IndlYkB0aGVzaXNpaW5kaWEubmV0IiwiYXV0aF90aW1lIjoiMDgvMjgvMjAyNSAwNjo1MjozMiIsImRiX25hbWUiOiJ3YXRpX2FwcF90cmlhbCIsImh0dHA6Ly9zY2hlbWFzLm1pY3Jvc29mdC5jb20vd3MvMjAwOC8wNi9pZGVudGl0eS9jbGFpbXMvcm9sZSI6IlRSSUFMIiwiZXhwIjoxNzU2NzcxMjAwLCJpc3MiOiJDbGFyZV9BSSIsImF1ZCI6IkNsYXJlX0FJIn0.NYy_4t_9learSY5-OsoccZfqWP6FQ9ljqGSf_rEkQ7s",
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setTemplates(data.messageTemplates || []);
      }
    } catch (error) {
      console.error("Error fetching templates:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMessageTypeChange = (type) => {
    setMessageType(type);

    if (type === "text") {
      setSelectedTemplate(null);
      setText("");
    } else if (type === "template") {
      setIsOffcanvasOpen(true);
    }
  };

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    setMessageType("template");
    setIsOffcanvasOpen(false);
    setText(template.bodyOriginal || template.body || "");

    // initialize params
    const placeholders = extractPlaceholders(
      template.bodyOriginal || template.body
    );
    const initialParams = {};
    placeholders.forEach((p) => {
      initialParams[p] = "";
    });
    setTemplateParams(initialParams);
  };

  const handleParamChange = (key, value) => {
    setTemplateParams((prev) => ({ ...prev, [key]: value }));
  };

  const handleSend = async () => {
    if (messageType === "template" && selectedTemplate) {
      try {
        const allParamsFilled = Object.values(templateParams).every(
          (v) => v.trim() !== ""
        );

        if (!allParamsFilled) {
          toast.error("Please fill all template parameters before sending.");
          return;
        }

        const cleanPhone = normalizePhoneNumber(selectedUser.phone);

        const parameters = Object.entries(templateParams).map(
          ([name, value]) => ({
            name,
            value,
          })
        );

        const payload = {
          template_name: selectedTemplate.elementName,
          broadcast_name: "Campaign via React",
          parameters,
        };

        const res = await fetch(
          `https://app-server.wati.io/api/v1/sendTemplateMessage?whatsappNumber=${cleanPhone}`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI3NTM3Y2MzZC1mYmIyLTQ2YzgtOGJiNy0xMTJjZDY0NDZiMGIiLCJ1bmlxdWVfbmFtZSI6IndlYkB0aGVzaXNpaW5kaWEubmV0IiwibmFtZWlkIjoid2ViQHRoZXNpc2lpbmRpYS5uZXQiLCJlbWFpbCI6IndlYkB0aGVzaXNpaW5kaWEubmV0IiwiYXV0aF90aW1lIjoiMDgvMjgvMjAyNSAwNjo1MjozMiIsImRiX25hbWUiOiJ3YXRpX2FwcF90cmlhbCIsImh0dHA6Ly9zY2hlbWFzLm1pY3Jvc29mdC5jb20vd3MvMjAwOC8wNi9pZGVudGl0eS9jbGFpbXMvcm9sZSI6IlRSSUFMIiwiZXhwIjoxNzU2NzcxMjAwLCJpc3MiOiJDbGFyZV9BSSIsImF1ZCI6IkNsYXJlX0FJIn0.NYy_4t_9learSY5-OsoccZfqWP6FQ9ljqGSf_rEkQ7s`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          }
        );

        if (!res.ok) {
          console.error("Failed to send template:", await res.text());
          return;
        }

        const data = await res.json();
        console.log("Template sent ✅", data);

        // Update chat UI locally also
        const newMsg = {
          id: Date.now(),
          from: "me",
          type: "template",
          statusString: "DELIVERED",
          text: renderPreview() || selectedTemplate.body || "",
          template: selectedTemplate,
        };
        setMessages((prev) => [...prev, newMsg]);
      } catch (error) {
        console.error("Error sending template:", error);
      }
    } else {
      if (!text.trim()) return;

      try {
        const cleanPhone = normalizePhoneNumber(selectedUser.phone);

        const payload = {
          messageText: text, // ✅ correct key for session messages
        };

        const res = await fetch(
          `https://app-server.wati.io/api/v1/sendSessionMessage/${cleanPhone}?messageText=${text}`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI3NTM3Y2MzZC1mYmIyLTQ2YzgtOGJiNy0xMTJjZDY0NDZiMGIiLCJ1bmlxdWVfbmFtZSI6IndlYkB0aGVzaXNpaW5kaWEubmV0IiwibmFtZWlkIjoid2ViQHRoZXNpc2lpbmRpYS5uZXQiLCJlbWFpbCI6IndlYkB0aGVzaXNpaW5kaWEubmV0IiwiYXV0aF90aW1lIjoiMDgvMjgvMjAyNSAwNjo1MjozMiIsImRiX25hbWUiOiJ3YXRpX2FwcF90cmlhbCIsImh0dHA6Ly9zY2hlbWFzLm1pY3Jvc29mdC5jb20vd3MvMjAwOC8wNi9pZGVudGl0eS9jbGFpbXMvcm9sZSI6IlRSSUFMIiwiZXhwIjoxNzU2NzcxMjAwLCJpc3MiOiJDbGFyZV9BSSIsImF1ZCI6IkNsYXJlX0FJIn0.NYy_4t_9learSY5-OsoccZfqWP6FQ9ljqGSf_rEkQ7s`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          }
        );

        if (!res.ok) {
          console.error("Failed to send session message:", await res.text());
          return;
        }

        const data = await res.json();
        console.log("Session message sent ✅", data);

        // Update chat UI locally also
        const newMsg = { id: Date.now(), from: "me", type: "text", text, statusString: "DELIVERED" };
        setMessages((prev) => [...prev, newMsg]);
      } catch (error) {
        console.error("Error sending session message:", error);
      }
    }

    // reset fields
    setText("");
    setSelectedTemplate(null);
    setTemplateParams({});
    setMessageType("text");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!selectedUser?.phone) {
    return (
      <div className="flex items-center gap-2 bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg text-sm font-medium">
        <AlertTriangle size={18} className="text-yellow-600" />
        <span>Phone number not found for this user</span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Selector */}
      <div className="flex gap-2">
        <button
          onClick={() => handleMessageTypeChange("text")}
          className={`px-2 py-1 text-sm rounded-lg border ${
            messageType === "text" ? "bg-blue-100 text-blue-700" : "bg-white"
          }`}
        >
          Text
        </button>
        <button
          onClick={() => handleMessageTypeChange("template")}
          className={`px-2 py-1 text-sm rounded-lg border ${
            messageType === "template"
              ? "bg-blue-100 text-blue-700"
              : "bg-white"
          }`}
        >
          Template
        </button>
      </div>

      {/* Input Area */}
      <div className="flex items-center gap-2">
        {messageType === "text" ? (
          <textarea
            rows={1}
            className="flex-1 resize-none border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring focus:border-blue-300"
            placeholder="Type a message..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        ) : (
          <div className="flex-1 px-3 py-2 bg-gray-50 border rounded-lg text-sm text-gray-600 max-h-64 overflow-y-auto">
            {selectedTemplate ? (
              <div>
                <div className="font-medium text-gray-800">
                  {selectedTemplate.elementName}
                </div>
                <div className="whitespace-pre-line mt-2 text-gray-700 border rounded p-2 bg-white">
                  {renderPreview()}
                </div>
                <div className="mt-3 space-y-2">
                  {Object.keys(templateParams).map((key) => (
                    <input
                      key={key}
                      type="text"
                      placeholder={key}
                      value={templateParams[key]}
                      onChange={(e) => handleParamChange(key, e.target.value)}
                      className="w-full border px-2 py-1 rounded text-sm"
                    />
                  ))}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Template message will be sent
                </div>
              </div>
            ) : (
              "Select a template →"
            )}
          </div>
        )}

        <button
          onClick={() => setIsFileModalOpen(true)}
          className="p-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          <Paperclip size={15} />
        </button>
        <button
          onClick={handleSend}
          disabled={messageType === "template" && !selectedTemplate}
          className="p-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          <Send size={18} />
        </button>
      </div>

      {/* Offcanvas for Templates */}
      <AnimatePresence>
        {isOffcanvasOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.3 }}
            className="fixed top-0 right-0 w-80 h-full bg-white shadow-lg z-50 border-l flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-3 border-b">
              <h2 className="font-semibold text-gray-800">Choose Template</h2>
              <button
                onClick={() => setIsOffcanvasOpen(false)}
                className="p-1 rounded hover:bg-gray-100"
              >
                <X size={18} />
              </button>
            </div>

            {/* Templates List */}
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="p-3 text-sm text-gray-500">Loading...</div>
              ) : templates.length > 0 ? (
                templates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => handleTemplateSelect(template)}
                    className="w-full text-left px-3 py-2 border-b hover:bg-gray-50"
                  >
                    <div className="font-medium">{template.elementName}</div>
                    <div className="text-xs text-gray-500 truncate">
                      {template.category} • {template.language.text}
                    </div>
                  </button>
                ))
              ) : (
                <div className="p-3 text-sm text-gray-500">
                  No templates found
                </div>
              )}
            </div>
          </motion.div>
        )}

        <SendFileModal
          isOpen={isFileModalOpen}
          onClose={() => setIsFileModalOpen(false)}
          setMessages={setMessages}
          selectedUser={selectedUser}
        />
      </AnimatePresence>
    </div>
  );
};

export default ChatSend;
