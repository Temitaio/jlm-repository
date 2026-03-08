import { useState, useEffect, useRef } from "react";

const SYSTEM_PROMPT = `You are Riley, the AI receptionist for JLM Contracting Ltd., a professional renovation company based in Winnipeg, Manitoba. You are calm, professional, warm, and efficient. You represent Jesse Mitchell and JLM at the highest level.

COMPANY:
- Owner: Jesse Mitchell
- Specialty: Multi-unit suite renovations and vacancy turnovers (NOT a handyman service — does NOT take single-unit homeowner jobs)
- Capacity: 5-10 units/month, scalable to 15+ with right pipeline
- Coverage: Primarily Winnipeg and surrounding areas. Larger portfolio contracts in other regions discussed with Jesse directly.
- Insurance: $5M liability coverage
- Services: Full suite vacancy turnovers, bathroom & kitchen renovations, glue-down LVP installation, tile & backsplash, drywall & paint, fixture & finish upgrades, coordinated multi-unit scheduling

WHAT A STRATEGY CALL IS: A 15-20 minute call where Jesse reviews project scope, timeline, and how JLM can support their portfolio long-term. No pressure, just a conversation.
CONSULTATION LENGTH: Typically around 2 hours.
PRICING: Depends on project scope. JLM offers free quotes. Best first step is a short call with Jesse.

CALLER TIERS:
- Tier A (Priority): Property managers, portfolio managers, asset managers, REIT ops managers, facility directors, investors with 10+ doors, construction managers for rental groups. Collect full intake and book a strategy call with Jesse. Tag [TIER:A]
- Tier B (Secondary): Small landlords with 3-20 units, insurance restoration coordinators, realtors with distressed listings. Collect info, do NOT auto-book. Tag [TIER:B]
- Tier C (Redirect): Single-unit homeowners, one-off handyman requests, price shoppers. Politely redirect. Tag [TIER:C]

TONE RULES:
- NEVER use "Absolutely!", "Great question!", "Of course!" — they signal a bot
- Never ask all intake questions in a row — weave them naturally
- If asked if you are AI: "I'm an AI assistant helping manage JLM's calls. Jesse will follow up personally."
- If you don't know something: "That's a great detail for Jesse to address directly. I'll make sure it's in the notes for your call."
- Mirror the caller's energy
- Always end with a clear next step

CALL FLOW — follow these nodes:

NODE 1 — GREETING
Open with exactly: "JLM Contracting, this is Riley speaking. How can I help you today?"

NODE 2 — IDENTIFY INTENT
Route based on what the caller says (do NOT list options to caller):
- Wants quote/estimate/pricing → COLLECT QUOTE INFO
- Wants to book consultation/site visit → COLLECT BOOKING INFO
- Asking about existing job/project → EXISTING JOB
- General question about services → GENERAL INQUIRY
- Wants to speak to a person/Jesse → TRANSFER
- Single-unit homeowner / one-off handyman / price shopper → TIER C REDIRECT

NODE 3 — COLLECT QUOTE INFO
Collect these naturally, one at a time:
1. Full name
2. Best callback number
3. Property address or area in Winnipeg
4. Number of units involved
5. Type of work (vacancy turnover, bathroom reno, kitchen reno, flooring, drywall, paint, etc.)
6. Brief description of the project
7. Rough timeline
Once all 7 collected say: "Perfect, I have everything I need. Someone from the JLM team will review this and give you a call back within one business day to discuss your project and next steps. Is there anything else I can help you with?"
If caller turns out Tier C mid-conversation → TIER C REDIRECT

NODE 4 — COLLECT BOOKING INFO
Collect naturally, one at a time:
1. Full name
2. Best callback number
3. Property address / job location
4. Number of units and type of work / reason for consultation
5. Preferred date and time
(Consultations are typically around 2 hours)
Once all 5 collected → say you're checking availability and offer 2 realistic time slots (use days like Tuesday, Wednesday, Thursday at times like 9 AM, 10 AM, 2 PM CST)

NODE 5/6 — CHECK AVAILABILITY & CONFIRM SLOT
Offer 2 slots near their preferred time including day and time in CST. Ask them to confirm one.

NODE 7/8 — BOOK & CONFIRM
Once they confirm a slot say: "You're all booked in for [day] at [time] CST. Jesse will have your project details before the call so you won't have to repeat yourself. Is there anything else I can help you with?"
Include [BOOKED: <day at time CST>] in your response.

NODE 9 — NO AVAILABILITY
Apologize, ask for another preferred time. If they can't find a time, offer to take their details and have JLM team call back to schedule manually.

NODE 10 — EXISTING JOB
Collect: name, address/project name, their question or concern. Then: "I want to make sure you get accurate information on this. Let me have someone from the JLM team follow up with you directly. Would it be okay if they called you back at this number?"
If they want someone now → TRANSFER

NODE 11 — GENERAL INQUIRY
Answer using company knowledge. If unsure → flag for Jesse, take name/number.
If pricing asked → explain depends on scope, JLM offers free quotes, offer to collect info or book strategy call.

NODE 12 — TIER C REDIRECT
Say: "JLM focuses on larger multi-unit renovation and turnover projects, so we might not be the right fit for what you're describing. I don't want to waste your time. If your needs change or you have a larger scope down the road, we'd love to hear from you."
If they push back: "I can still take your information and flag it for Jesse. He makes the final call on what we take on. Would you like me to do that?"

NODE 13 — TRANSFER TO HUMAN
Say: "Let me transfer you to a member of the JLM team right now. Please hold for just a moment."
Include exactly [TRANSFER: 587-598-6633] in your response.

NODE 14 — ANGRY CALLER (GLOBAL — trigger if caller is angry/aggressive/uses profanity)
Stay calm. "I completely understand your frustration and I want to make sure this gets resolved for you properly."
Offer to transfer. Include [TRANSFER: 587-598-6633]

NODE 15 — URGENT/EMERGENCY (GLOBAL — trigger if caller mentions water damage, active leak, structural damage, flood, fire, any urgent emergency)
Treat as urgent: "That sounds urgent. Let me flag this directly for Jesse right now. Can I get your name and the property address so I can get him the details immediately?"
Collect name and address only, then include [TRANSFER: 587-598-6633]

NODE 16 — WRAP UP
Wrap up warmly. Thank caller for reaching out. Make sure they know exactly what happens next.

NODE 17 — END CALL
Natural goodbye.

IMPORTANT SIGNALS TO INCLUDE:
- When you identify the caller's tier, include [TIER:A], [TIER:B], or [TIER:C] once in your response
- When a booking is confirmed, include [BOOKED: <slot description>]
- When transferring, include [TRANSFER: 587-598-6633]
These signals will be stripped before showing to caller — include them naturally at the end of your response.

Keep responses concise and conversational. 2-4 sentences max per turn.`;

const scenarios = [
  { label: "Property Manager — 8 units", prompt: "Hi, I manage a retirement building on the north end. We have about eight units turning over in the next couple months and need a contractor." },
  { label: "Wants a Quote", prompt: "Hey, I'm looking to get a quote on renovation work across a few of my properties." },
  { label: "Small Landlord — Triplex", prompt: "Hey, I own a small triplex and need some renovation work done on the units." },
  { label: "Single Homeowner", prompt: "Hi, I need someone to fix a leaky faucet and repaint my kitchen." },
  { label: "REIT Ops Manager", prompt: "Good afternoon. I'm with a real estate investment trust managing about 200 units across Winnipeg. Looking for a reliable renovation contractor for ongoing turnover work." },
  { label: "Emergency — Water Damage", prompt: "We have a serious problem — there's been a water leak in one of our units and we have damage on two floors. This is urgent." },
  { label: "Angry Caller", prompt: "I've been waiting three weeks and nobody has called me back. This is completely unacceptable and I'm furious." },
  { label: "Ask to Speak to Jesse", prompt: "Can I speak to Jesse directly? I'd rather talk to a real person." },
];

function TypingIndicator() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "14px 18px", background: "#161628", borderRadius: 16, borderBottomLeftRadius: 4, maxWidth: 80 }}>
      {[0, 1, 2].map((i) => (
        <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: "#6c63ff", animation: "bounce 1.2s infinite", animationDelay: `${i * 0.2}s` }} />
      ))}
    </div>
  );
}

function CallStatusBar({ status, duration }) {
  const colors = { idle: "#555", ringing: "#f59e0b", active: "#22c55e", ended: "#ef4444", transfer: "#3b82f6" };
  const labels = { idle: "Ready", ringing: "Incoming Call...", active: "Call Active", ended: "Call Ended", transfer: "Transferring..." };
  const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <div style={{ width: 10, height: 10, borderRadius: "50%", background: colors[status], boxShadow: ["active", "transfer"].includes(status) ? `0 0 12px ${colors[status]}` : "none", animation: status === "ringing" ? "pulse 1s infinite" : status === "active" ? "glow 2s infinite" : "none" }} />
        <span style={{ fontSize: 13, color: colors[status], fontFamily: "monospace", letterSpacing: 1 }}>{labels[status]}</span>
      </div>
      {status === "active" && <span style={{ fontFamily: "monospace", color: "#22c55e", fontSize: 13 }}>{fmt(duration)}</span>}
    </div>
  );
}

function LeadTag({ tier }) {
  const config = { A: { color: "#22c55e", bg: "#052e16", label: "TIER A — Book Call" }, B: { color: "#f59e0b", bg: "#1c0f00", label: "TIER B — Flag for Jesse" }, C: { color: "#ef4444", bg: "#1f0000", label: "TIER C — Redirect" } };
  if (!tier || !config[tier]) return null;
  const c = config[tier];
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 12px", borderRadius: 999, background: c.bg, border: `1px solid ${c.color}`, color: c.color, fontSize: 11, fontWeight: 700, fontFamily: "monospace", letterSpacing: 1 }}>
      <div style={{ width: 6, height: 6, borderRadius: "50%", background: c.color }} />{c.label}
    </div>
  );
}

function NodeBadge({ node }) {
  if (!node) return null;
  const names = {
    GREETING: "Node 1 · Greeting", IDENTIFY_INTENT: "Node 2 · Identify Intent",
    COLLECT_QUOTE: "Node 3 · Quote Info", COLLECT_BOOKING: "Node 4 · Booking Info",
    CONFIRM_SLOT: "Node 6 · Confirm Slot", BOOKING_CONFIRMED: "Node 8 · Booking Confirmed",
    NO_AVAILABILITY: "Node 9 · No Availability", EXISTING_JOB: "Node 10 · Existing Job",
    GENERAL_INQUIRY: "Node 11 · General Inquiry", TIER_C_REDIRECT: "Node 12 · Tier C Redirect",
    TRANSFER: "Node 13 · Transfer", ANGRY_CALLER: "Node 14 · Angry Caller",
    URGENT: "Node 15 · Urgent / Emergency", WRAP_UP: "Node 16 · Wrap Up",
  };
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 999, background: "#0d0d2a", border: "1px solid #252560", color: "#6c63ff", fontSize: 10, fontFamily: "monospace", letterSpacing: 0.5 }}>
      ◈ {names[node] || node}
    </div>
  );
}

export default function App() {
  const [callStatus, setCallStatus] = useState("idle");
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [callerTier, setCallerTier] = useState(null);
  const [bookedSlot, setBookedSlot] = useState(null);
  const [currentNode, setCurrentNode] = useState(null);
  const [callDuration, setCallDuration] = useState(0);
  const [isTransfer, setIsTransfer] = useState(false);
  const messagesEndRef = useRef(null);
  const timerRef = useRef(null);
  const conversationRef = useRef([]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, isLoading]);

  useEffect(() => {
    if (callStatus === "active") {
      timerRef.current = setInterval(() => setCallDuration((d) => d + 1), 1000);
    } else {
      clearInterval(timerRef.current);
      if (callStatus === "idle") setCallDuration(0);
    }
    return () => clearInterval(timerRef.current);
  }, [callStatus]);

  const parseResponse = (text) => {
    let clean = text;
    let tier = null, booked = null, transfer = false, node = null;

    const tierMatch = text.match(/\[TIER:([ABC])\]/);
    if (tierMatch) { tier = tierMatch[1]; clean = clean.replace(/\[TIER:[ABC]\]/g, ""); }

    const bookedMatch = text.match(/\[BOOKED:\s*([^\]]+)\]/);
    if (bookedMatch) { booked = bookedMatch[1].trim(); clean = clean.replace(/\[BOOKED:[^\]]+\]/g, ""); }

    const transferMatch = text.match(/\[TRANSFER:[^\]]+\]/);
    if (transferMatch) { transfer = true; clean = clean.replace(/\[TRANSFER:[^\]]+\]/g, ""); }

    const lower = text.toLowerCase();
    if (lower.includes("how can i help you today")) node = "GREETING";
    else if (transfer || lower.includes("let me transfer")) node = "TRANSFER";
    else if (lower.includes("that sounds urgent") || lower.includes("flag this directly for jesse")) node = "URGENT";
    else if (lower.includes("completely understand your frustration")) node = "ANGRY_CALLER";
    else if (lower.includes("not the right fit") || lower.includes("multi-unit renovation and turnover projects")) node = "TIER_C_REDIRECT";
    else if (lower.includes("you're all booked") || lower.includes("you are all booked")) node = "BOOKING_CONFIRMED";
    else if ((lower.includes("tuesday") || lower.includes("wednesday") || lower.includes("thursday") || lower.includes("friday")) && lower.includes("cst")) node = "CONFIRM_SLOT";
    else if (lower.includes("call back within one business day")) node = "COLLECT_QUOTE";
    else if (lower.includes("preferred date") || lower.includes("what date works") || lower.includes("when works best")) node = "COLLECT_BOOKING";
    else if (lower.includes("follow up with you directly") || lower.includes("called you back at this number")) node = "EXISTING_JOB";
    else if (lower.includes("thank you for reaching out") || lower.includes("thanks for calling")) node = "WRAP_UP";

    return { clean: clean.trim(), tier, booked, transfer, node };
  };

  const callAPI = async (msgs) => {
    const res = await fetch("/.netlify/functions/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1000, system: SYSTEM_PROMPT, messages: msgs }),
    });
    if (!res.ok) throw new Error(`API error ${res.status}`);
    const data = await res.json();
    return data.content?.map((b) => b.text || "").join("") || "";
  };

  const handleRileyResponse = (raw) => {
    const { clean, tier, booked, transfer, node } = parseResponse(raw);
    if (tier && !callerTier) setCallerTier(tier);
    if (booked && !bookedSlot) setBookedSlot(booked);
    if (node) setCurrentNode(node);
    if (transfer) {
      setIsTransfer(true);
      setCallStatus("transfer");
      setTimeout(() => { setCallStatus("ended"); setTimeout(() => setCallStatus("idle"), 3000); }, 3000);
    }
    return clean;
  };

  const startCall = async (scenarioData = null) => {
    setCallStatus("ringing");
    setMessages([]);
    setCallerTier(null);
    setBookedSlot(null);
    setCurrentNode("GREETING");
    setIsTransfer(false);
    conversationRef.current = [];

    setTimeout(async () => {
      setCallStatus("active");
      setIsLoading(true);
      try {
        const seed = [{ role: "user", content: "(call just connected — greet the caller with the opening line)" }];
        const raw = await callAPI(seed);
        const clean = handleRileyResponse(raw);
        conversationRef.current = [...seed, { role: "assistant", content: raw }];
        setMessages([{ role: "riley", text: clean }]);
      } catch {
        const fallback = "JLM Contracting, this is Riley speaking. How can I help you today?";
        conversationRef.current = [{ role: "user", content: "(call connected)" }, { role: "assistant", content: fallback }];
        setMessages([{ role: "riley", text: fallback }]);
      }
      setIsLoading(false);
      if (scenarioData) setTimeout(() => sendMessage(scenarioData.prompt), 700);
    }, 1800);
  };

  const sendMessage = async (text) => {
    if (!text?.trim() || isLoading || callStatus !== "active") return;
    const userText = text.trim();
    setInputText("");
    setMessages((prev) => [...prev, { role: "caller", text: userText }]);
    setIsLoading(true);
    const updated = [...conversationRef.current, { role: "user", content: userText }];
    try {
      const raw = await callAPI(updated);
      const clean = handleRileyResponse(raw);
      conversationRef.current = [...updated, { role: "assistant", content: raw }];
      setMessages((prev) => [...prev, { role: "riley", text: clean }]);
    } catch {
      setMessages((prev) => [...prev, { role: "riley", text: "I'm sorry, I had a brief technical issue. Could you say that again?" }]);
    }
    setIsLoading(false);
  };

  const endCall = () => {
    setCallStatus("ended");
    setMessages((prev) => [...prev, { role: "system", text: "— Call ended —" }]);
    setTimeout(() => setCallStatus("idle"), 3000);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#050510", fontFamily: "'Inter', -apple-system, sans-serif", display: "flex", flexDirection: "column", alignItems: "center", padding: "32px 16px", backgroundImage: "radial-gradient(ellipse at 20% 50%, #0d0d2e 0%, transparent 55%), radial-gradient(ellipse at 80% 20%, #0a0a20 0%, transparent 55%)" }}>
      <style>{`
        @keyframes bounce{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-8px)}}
        @keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.5;transform:scale(1.3)}}
        @keyframes glow{0%,100%{box-shadow:0 0 8px #22c55e}50%{box-shadow:0 0 20px #22c55e,0 0 40px #22c55e44}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes ring{0%,100%{transform:rotate(-10deg)}50%{transform:rotate(10deg)}}
        *{box-sizing:border-box}
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:#2a2a4a;border-radius:4px}
        input::placeholder{color:#333}
        button:focus{outline:none}
      `}</style>

      {/* Header */}
      <div style={{ width: "100%", maxWidth: 760, marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 42, height: 42, borderRadius: 12, background: "linear-gradient(135deg, #6c63ff, #a855f7)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>📞</div>
            <div>
              <div style={{ color: "#fff", fontWeight: 700, fontSize: 18, letterSpacing: -0.5 }}>JLM Contracting</div>
              <div style={{ color: "#444", fontSize: 11, letterSpacing: 1.5 }}>AI RECEPTIONIST — RILEY</div>
            </div>
          </div>
          <CallStatusBar status={callStatus} duration={callDuration} />
        </div>
      </div>

      {/* Card */}
      <div style={{ width: "100%", maxWidth: 760, borderRadius: 20, background: "#0d0d1f", border: "1px solid #1a1a35", overflow: "hidden", boxShadow: "0 40px 80px #00000099" }}>

        {/* Badge bar */}
        {(callerTier || bookedSlot || currentNode || isTransfer) && (
          <div style={{ padding: "10px 20px", borderBottom: "1px solid #1a1a35", background: "#090914", display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
            {currentNode && <NodeBadge node={currentNode} />}
            {callerTier && <LeadTag tier={callerTier} />}
            {bookedSlot && (
              <div style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 999, background: "#052e16", border: "1px solid #22c55e", color: "#22c55e", fontSize: 10, fontFamily: "monospace" }}>
                📅 {bookedSlot}
              </div>
            )}
            {isTransfer && (
              <div style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 999, background: "#0a1628", border: "1px solid #3b82f6", color: "#3b82f6", fontSize: 10, fontFamily: "monospace" }}>
                ↗ Transferring to 587-598-6633
              </div>
            )}
          </div>
        )}

        {/* Messages */}
        <div style={{ height: 440, overflowY: "auto", padding: "24px 22px 16px" }}>
          {callStatus === "idle" && messages.length === 0 && (
            <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14 }}>
              <div style={{ fontSize: 52 }}>☎️</div>
              <div style={{ color: "#2a2a44", fontSize: 13, textAlign: "center", lineHeight: 1.7 }}>
                Choose a scenario or start a free-form call<br />
                <span style={{ color: "#1e1e38", fontSize: 11 }}>17-node call flow · Tier routing · Transfer logic</span>
              </div>
            </div>
          )}
          {callStatus === "ringing" && (
            <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14 }}>
              <div style={{ fontSize: 52, animation: "ring 0.3s infinite alternate" }}>📱</div>
              <div style={{ color: "#f59e0b", fontSize: 13, fontFamily: "monospace", letterSpacing: 2 }}>INCOMING CALL...</div>
            </div>
          )}
          {callStatus === "transfer" && (
            <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14 }}>
              <div style={{ fontSize: 52 }}>📲</div>
              <div style={{ color: "#3b82f6", fontSize: 13, fontFamily: "monospace", letterSpacing: 1 }}>TRANSFERRING TO JLM TEAM</div>
              <div style={{ color: "#444", fontSize: 12, fontFamily: "monospace" }}>587-598-6633</div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} style={{ marginBottom: 14, display: "flex", flexDirection: msg.role === "caller" ? "row-reverse" : "row", justifyContent: msg.role === "system" ? "center" : undefined, animation: "fadeIn 0.25s ease" }}>
              {msg.role === "system" ? (
                <div style={{ color: "#2a2a44", fontSize: 11, fontFamily: "monospace" }}>{msg.text}</div>
              ) : (
                <div style={{ maxWidth: "78%", display: "flex", flexDirection: "column", alignItems: msg.role === "caller" ? "flex-end" : "flex-start", gap: 4 }}>
                  <div style={{ fontSize: 10, color: "#3a3a5a", fontFamily: "monospace", letterSpacing: 0.5 }}>{msg.role === "riley" ? "RILEY" : "CALLER"}</div>
                  <div style={{ padding: "11px 15px", borderRadius: 15, borderTopLeftRadius: msg.role === "riley" ? 4 : 15, borderTopRightRadius: msg.role === "caller" ? 4 : 15, background: msg.role === "riley" ? "#161628" : "linear-gradient(135deg, #6c63ff, #a855f7)", color: "#dde0f0", fontSize: 14, lineHeight: 1.65, border: msg.role === "riley" ? "1px solid #22224a" : "none" }}>
                    {msg.text}
                  </div>
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div style={{ marginBottom: 14, animation: "fadeIn 0.25s ease" }}>
              <div style={{ fontSize: 10, color: "#3a3a5a", fontFamily: "monospace", marginBottom: 4 }}>RILEY</div>
              <TypingIndicator />
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Controls */}
        <div style={{ borderTop: "1px solid #1a1a35", padding: "16px 22px" }}>
          {callStatus === "active" ? (
            <div style={{ display: "flex", gap: 10 }}>
              <input value={inputText} onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(inputText); } }}
                placeholder="Type your response as the caller..."
                disabled={isLoading}
                style={{ flex: 1, background: "#161628", border: "1px solid #22224a", borderRadius: 12, padding: "12px 16px", color: "#dde0f0", fontSize: 14, outline: "none", opacity: isLoading ? 0.5 : 1 }}
              />
              <button onClick={() => sendMessage(inputText)} disabled={isLoading || !inputText.trim()}
                style={{ padding: "12px 20px", borderRadius: 12, background: isLoading || !inputText.trim() ? "#161628" : "linear-gradient(135deg, #6c63ff, #a855f7)", border: "none", color: "#fff", cursor: isLoading || !inputText.trim() ? "not-allowed" : "pointer", fontSize: 16 }}>→</button>
              <button onClick={endCall}
                style={{ padding: "12px 14px", borderRadius: 12, background: "#200a0a", border: "1px solid #ef4444", color: "#ef4444", cursor: "pointer", fontSize: 11, fontWeight: 700, letterSpacing: 0.5 }}>END</button>
            </div>
          ) : callStatus === "idle" ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
                {scenarios.map((s, i) => (
                  <button key={i} onClick={() => startCall(s)}
                    style={{ padding: "6px 12px", borderRadius: 9, background: "#161628", border: "1px solid #22224a", color: "#777", cursor: "pointer", fontSize: 11, transition: "all 0.15s" }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#6c63ff"; e.currentTarget.style.color = "#ccc"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#22224a"; e.currentTarget.style.color = "#777"; }}>
                    {s.label}
                  </button>
                ))}
              </div>
              <button onClick={() => startCall()}
                style={{ padding: "13px", borderRadius: 13, background: "linear-gradient(135deg, #6c63ff, #a855f7)", border: "none", color: "#fff", cursor: "pointer", fontSize: 14, fontWeight: 600, letterSpacing: 0.3 }}>
                📞 Start a New Call
              </button>
            </div>
          ) : (
            <div style={{ textAlign: "center", color: "#444", fontSize: 12, fontFamily: "monospace", padding: "4px 0" }}>
              {isTransfer ? "Transferred to JLM team · 587-598-6633" : "Call ended"}
              {callerTier ? ` · Tier ${callerTier}` : ""}
              {bookedSlot ? ` · Booked: ${bookedSlot}` : ""}
            </div>
          )}
        </div>
      </div>

      <div style={{ marginTop: 18, color: "#17172a", fontSize: 11, textAlign: "center", lineHeight: 1.8 }}>
        17-node flow · Quote · Booking · Existing job · Transfer to 587-598-6633 · Angry & Emergency globals<br />
        JLM Contracting Ltd. · Winnipeg, MB · Powered by Claude
      </div>
    </div>
  );
}
