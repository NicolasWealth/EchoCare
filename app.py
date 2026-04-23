import streamlit as st
import google.generativeai as genai
import speech_recognition as sr
from gtts import gTTS
import base64
import io
import time

# --- SETUP ---
genai.configure(api_key="YOUR_GEMINI_API_KEY")
system_instruction = """You are EchoCare, a compassionate voice-first AI assistant for elderly users and people with visual impairments. Help with health reminders, emergencies, and medical questions.
Always use PLAIN, SIMPLE language — like explaining to a 10-year-old. Short sentences. Warm, reassuring tone. No medical jargon.
PRIORITIZE SAFETY AND STAY IN CHARACTER."""

model = genai.GenerativeModel(
    'gemini-1.5-flash',
    system_instruction=system_instruction
)

# The page icon also gets a spring flower!
st.set_page_config(page_title="EchoCare", page_icon="🌷")

# --- INITIALIZE SESSION STATE ---
if "history" not in st.session_state:
    st.session_state.history = []

# --- CSS STYLING (High Contrast Mode) ---
st.markdown("""
    <style>
    .stApp {
        background-color: #000000;
        color: #FFFF00;
        font-size: 20px;
    }
    .stButton>button {
        background-color: #FFFF00;
        color: #000000;
        font-weight: bold;
        font-size: 20px;
    }
    </style>
    """, unsafe_allow_html=True)


# --- SIDEBAR & EMERGENCY ---
with st.sidebar:
    st.header("⚙️ Settings & Contacts")
    
    # 3. UI for Visual Impairment (High Contrast Mode)
    # The toggle will completely override the Spring Theme with Yellow on Black
    accessibility_mode = st.toggle("👁️ High Contrast Mode")
    if accessibility_mode:
        st.markdown("""
            <style>
                .stApp { background-color: #000000 !important; }
                .stApp p, .stApp h1, .stApp h2, .stApp h3, .stApp h4, .stApp label, .stApp div, .stApp span, .stApp li {
                    color: #ffff00 !important;
                    font-size: 1.5em !important;
                }
                .stButton > button[kind="secondary"] {
                    background-color: #000000 !important;
                    color: #ffff00 !important;
                    border: 6px solid #ffff00 !important;
                }
                .stButton > button[kind="secondary"]:hover {
                    background-color: #ffff00 !important;
                    color: #000000 !important;
                }
            </style>
        """, unsafe_allow_html=True)
    
    st.divider()
    st.error("🚨 EMERGENCY: Call 911")
    st.write("Caregiver: Jane Doe (555-0123)")
    st.write("Email: jane@doe-family.com")
    
    st.divider()
    st.subheader("📜 Recent History")
    if st.session_state.history:
        for item in st.session_state.history[-3:]: 
            st.caption(f"🗣️ **User:** {item['user']}")
            st.caption(f"🤖 **AI:** {item['ai'][:50]}...")
    else:
        st.caption("No history yet.")


# --- HELPER FUNCTIONS ---
def speak_text(text):
    tts = gTTS(text=text, lang='en')
    fp = io.BytesIO()
    tts.write_to_fp(fp)
    fp.seek(0)
    audio_bytes = fp.read()
    b64 = base64.b64encode(audio_bytes).decode()
    md = f"""
        <audio autoplay="true">
        <source src="data:audio/mp3;base64,{b64}" type="audio/mp3">
        </audio>
    """
    st.markdown(md, unsafe_allow_html=True)

def listen_to_user():
    r = sr.Recognizer()
    with sr.Microphone() as source:
        st.info("Listening... Speak now!")
        audio = r.listen(source)
        try:
            text = r.recognize_google(audio)
            return text
        except:
            st.error("Sorry, I didn't catch that.")
            return None

def trigger_safety_protocol(trigger_phrase):
    """The new Safety protocol that simulates emailing a caregiver"""
    st.error("🚨 **CRITICAL ALERT DETECTED** 🚨")
    with st.spinner("Initiating Safety Protocol..."):
        time.sleep(1.5) # Simulating API latency for dramatic effect in demo
        st.success("✉️ **Email successfully dispatched to Caregiver:** jane@doe-family.com")
        st.warning(f"**Mock Email Body Sent:**\n\n*Emergency assistance requested. User transcript:* '{trigger_phrase}'")
        speak_text("I have triggered the emergency response. An email and text have been sent to Jane Doe. Help is on the way.")

# --- UI LAYOUT ---
st.title("🌷 EchoCare")

# Emergency Button CSS (Overriding default styles)
st.markdown("""
    <style>
        .stButton button[kind="primary"] {
            background-color: #ff3333 !important;
            color: white !important;
            font-size: 40px !important;
            font-weight: 900 !important;
            height: 130px;
            border-radius: 20px;
            border: 4px solid darkred;
            box-shadow: 0 8px 15px rgba(255, 0, 0, 0.4);
        }
        .stButton button[kind="primary"]:hover {
            background-color: #cc0000 !important;
            transform: scale(1.02);
        }
    </style>
""", unsafe_allow_html=True)

if st.button("🚨 HELP 🚨", type="primary", use_container_width=True):
    trigger_safety_protocol("User pressed the giant HELP panic button.")
    st.stop()

st.write("### An AI-powered voice companion for your daily needs.")

if st.button("🎤 CLICK TO SPEAK", use_container_width=True):
    spoken_text = listen_to_user()
    
    if spoken_text:
        st.success(f"You said: '{spoken_text}'")
        
        # --- The Safety Logic Trigger ---
        critical_keywords = ["fell", "fall", "hurt", "bleeding", "help me", "heart attack", "pain"]
        if any(keyword in spoken_text.lower() for keyword in critical_keywords):
            trigger_safety_protocol(spoken_text)
            st.stop() # Stop further AI processing since emergency is triggered
            
        # Format the memory context
        history_context = ""
        if st.session_state.history:
            history_context = "Past Context:\n"
            for h in st.session_state.history[-5:]: 
                history_context += f"- User said: {h['user']}\n- You replied: {h['ai']}\n\n"
        
        prompt = f"""
        You are an elderly care assistant. 
        
        {history_context}
        
        Current Request: "{spoken_text}"
        
        Instructions:
        1. Context Awareness: Use the 'Past Context' provided.
        2. Multilingual Support: If the user's current request is in another language, respond ENTIRELY in that same language.
        3. Clarity: If it's a medical question, answer it in very simple, 3rd-grade language.
        4. Emergency: If it's 'help', 'emergency', or 'pain', loudly flag it as EMERGENCY.
        """
        
        with st.spinner("Thinking..."):
            response = model.generate_content(prompt)
            reply_text = response.text
            
            st.session_state.history.append({"user": spoken_text, "ai": reply_text})
            
            st.markdown("### EchoCare's Action:")
            st.write(reply_text)
            speak_text(reply_text)
