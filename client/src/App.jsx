
import { useState } from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Journal from "./pages/Journal";
import {
  Heart,
  BookOpen,
  Wind,
  ChartNoAxesCombined,
  Sun,
  Moon,
  Smile,
  Sparkles,
  ArrowRight,
  Leaf,
  Menu,
} from "lucide-react";
import Auth from "./pages/Auth";
import API from "./services/api";
import {
  createPaymentOrder,
  verifyPayment,
} from "./services/paymentService";
import MoodAnalytics from "./components/MoodAnalytics";
import BreathingExercise from "./components/BreathingExercise";


import "./App.css";

function App() {
  const [mood, setMood] = useState(8);
  const [energy, setEnergy] = useState(7);
  const [emotions, setEmotions] = useState([]);
  const [moodSaving, setMoodSaving] = useState(false);
  const [moodMessage, setMoodMessage] = useState("");
  const [journal, setJournal] = useState("");
  const [journalSaving, setJournalSaving] = useState(false);
  const [journalMessage, setJournalMessage] = useState("");
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("mindwell_theme") === "dark";
  });
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("mindwell_user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const handleLogin = (userData) => {
    setUser(userData);
  };


  const handleUpgradeToPremium = async () => {
    if (paymentLoading) return;

    if (!window.Razorpay) {
      alert("Razorpay Checkout could not be loaded. Please refresh the page.");
      return;
    }

    try {
      setPaymentLoading(true);

      // Create an order through the backend
      const orderData = await createPaymentOrder();

      const options = {
        key: orderData.keyId,
        amount: orderData.order.amount,
        currency: orderData.order.currency,
        name: "MindWell",
        description: "MindWell Premium Membership",
        order_id: orderData.order.id,

        prefill: {
          name: user.name,
          email: user.email,
        },

        theme: {
          color: "#527d5b",
        },

        handler: async (paymentResponse) => {
          try {
            const result = await verifyPayment(paymentResponse);

            // Update the logged-in user
            setUser(result.user);

            // Update saved user information
            localStorage.setItem(
              "mindwell_user",
              JSON.stringify(result.user)
            );

            alert("Congratulations! MindWell Premium is activated.");
          } catch (error) {
            console.error("Payment verification error:", error);
            alert(
              error.response?.data?.message ||
              "Payment verification failed. Please contact support before retrying."
            );
          } finally {
            setPaymentLoading(false);
          }
        },

        modal: {
          ondismiss: () => {
            setPaymentLoading(false);
          },
        },
      };

      const checkout = new window.Razorpay(options);

      checkout.on("payment.failed", (response) => {
        console.error("Payment failed:", response.error);
        alert("Payment failed. Please try again.");
        setPaymentLoading(false);
      });

      checkout.open();

    } catch (error) {
      console.error("Payment initialization failed:", error);

      alert(
        error.response?.data?.message ||
        "Unable to start payment. Please try again."
      );

      setPaymentLoading(false);
    }
  };


  const moods = [
    { score: 2, emoji: "😔", label: "Low" },
    { score: 4, emoji: "😕", label: "Down" },
    { score: 6, emoji: "😐", label: "Okay" },
    { score: 8, emoji: "😊", label: "Good" },
    { score: 10, emoji: "😁", label: "Great" },
  ];

  const availableEmotions = [
    "Happy",
    "Grateful",
    "Motivated",
    "Calm",
    "Confident",
    "Anxious",
    "Sad",
    "Stressed",
    "Tired",
    "Excited",
  ];

  const toggleEmotion = (emotion) => {
    setEmotions((previous) =>
      previous.includes(emotion)
        ? previous.filter((item) => item !== emotion)
        : [...previous, emotion]
    );
  };

  const handleSaveMood = async () => {
    setMoodSaving(true);
    setMoodMessage("");

    try {
      const response = await API.post("/mood-checkins", {
        mood,
        energyLevel: energy,
        emotions,
      });

      setMoodMessage(response.data.message);
      setEmotions([]);
    } catch (error) {
      setMoodMessage(
        error.response?.data?.message ||
        "Unable to save your mood. Please try again."
      );
    } finally {
      setMoodSaving(false);
    }
  };

  const handleSaveJournal = async () => {
    if (!journal.trim()) {
      setJournalMessage("Please write something before saving.");
      return;
    }

    setJournalSaving(true);
    setJournalMessage("");

    try {
      const response = await API.post("/journals", {
        content: journal,
        mood,
        energyLevel: energy,
        emotions,
        prompt: "What is one thing you're grateful for today?",
      });

      setJournalMessage(
        response.data.message || "Your reflection was saved securely!"
      );

      setJournal("");
    } catch (error) {
      setJournalMessage(
        error.response?.data?.message ||
        "Unable to save your reflection. Please try again."
      );
    } finally {
      setJournalSaving(false);
    }
  };

  return (
    <BrowserRouter>
      {!user ? (
        <Auth onLogin={handleLogin} />
      ) : (
        <div className={darkMode ? "dark-mode" : ""}>
          <Routes>
            <Route
              path="/"
              element={
                <div className={`app-container ${darkMode ? "dark-mode" : ""}`}>
                  <header className="navbar">
                    <a href="#" className="brand">
                      <span className="brand-icon">
                        <Leaf size={23} />
                      </span>
                      <span>mindwell</span>
                    </a>

                    <nav className="nav-links">
                      <Link to="/" className="active">Home</Link>
                      <Link to="/journal">Journal</Link>
                      <a href="#mood">Mood Tracker</a>
                      <a href="#wellness">Wellness</a>
                    </nav>

                    <div className="nav-actions">
                      <button
                        className="theme-button"
                        onClick={() => {
                          setDarkMode((currentMode) => {
                            const newMode = !currentMode;

                            localStorage.setItem(
                              "mindwell_theme",
                              newMode ? "dark" : "light"
                            );

                            return newMode;
                          });
                        }}
                        aria-label="Toggle dark mode"
                      >
                        {darkMode ? <Sun size={19} /> : <Moon size={19} />}
                      </button>

                      <div className="profile-avatar">A</div>
                      <button className="mobile-menu" aria-label="Open menu">
                        <Menu size={22} />
                      </button>
                    </div>
                  </header>

                  <main className="main-content" id="home">
                    <section className="welcome-section">
                      <div>
                        <div className="welcome-label">
                          <Sparkles size={15} />
                          YOUR PERSONAL WELLNESS SPACE
                        </div>

                        <h1>
                          Good day, {user.name} <span>🌿</span>
                        </h1>

                        <p>
                          Take a moment for yourself. Every small step towards
                          wellbeing matters.
                        </p>
                      </div>

                      <div className="date-card">
                        <Sun size={22} />
                        <div>
                          <strong>Your daily reminder</strong>
                          <span>You deserve a little kindness today.</span>
                        </div>
                      </div>
                    </section>

                    <section className="mood-section" id="mood">
                      <div className="section-heading">
                        <div>
                          <h2>How are you feeling today?</h2>
                          <p className="section-subtitle">
                            Check in with yourself. There's no wrong answer.
                          </p>
                        </div>
                        <span className="section-tag">DAILY CHECK-IN</span>
                      </div>

                      <div className="mindwell-card mood-card">
                        <div className="mood-options">
                          {moods.map((item) => (
                            <button
                              key={item.score}
                              className={`mood-option ${mood === item.score ? "selected" : ""
                                }`}
                              onClick={() => setMood(item.score)}
                            >
                              <span className="mood-emoji">{item.emoji}</span>
                              <span className="mood-label">{item.label}</span>
                            </button>
                          ))}
                        </div>

                        <div className="mood-footer">
                          <span>Today's mood score</span>
                          <strong>{mood}/10</strong>
                        </div>

                        <div className="emotion-selector">
                          <h3>What emotions describe your day?</h3>
                          <p className="section-subtitle">
                            Select all the emotions that feel right.
                          </p>

                          <div className="emotion-options">
                            {availableEmotions.map((emotion) => (
                              <button
                                type="button"
                                key={emotion}
                                className={`emotion-option ${emotions.includes(emotion) ? "selected" : ""
                                  }`}
                                onClick={() => toggleEmotion(emotion)}
                              >
                                {emotion}
                              </button>
                            ))}
                          </div>
                        </div>

                        {moodMessage && (
                          <p className="mood-message" role="status">
                            {moodMessage}
                          </p>
                        )}

                        <button
                          type="button"
                          className="primary-button mood-save-button"
                          onClick={handleSaveMood}
                          disabled={moodSaving}
                        >
                          {moodSaving ? "Saving..." : "Save my mood"}
                          {!moodSaving && <ArrowRight size={17} />}
                        </button>

                      </div>
                    </section>

                    <section className="dashboard-grid">
                      <div className="mindwell-card journal-card" id="journal">
                        <div className="card-heading">
                          <div className="card-icon journal-icon">
                            <BookOpen size={21} />
                          </div>
                          <span className="section-tag">PRIVATE SPACE</span>
                        </div>

                        <h2>Let your thoughts flow</h2>
                        <p className="section-subtitle">
                          A safe space to reflect, express and understand yourself.
                        </p>

                        <div className="journal-prompt">
                          <Sparkles size={17} />
                          <span>
                            What is one thing you're grateful for today?
                          </span>
                        </div>

                        <textarea
                          className="mindwell-textarea journal-input"
                          placeholder="Start writing your thoughts here..."
                          value={journal}
                          onChange={(event) => setJournal(event.target.value)}
                        />

                        <button
                          type="button"
                          className="primary-button journal-button"
                          onClick={handleSaveJournal}
                          disabled={journalSaving}
                        >
                          {journalSaving ? "Saving..." : "Save my reflection"}
                          {!journalSaving && <ArrowRight size={17} />}
                        </button>

                        {journalMessage && (
                          <p className="mood-message" role="status">
                            {journalMessage}
                          </p>
                        )}

                        <p className="privacy-note">
                          <Heart size={14} />
                          Your thoughts deserve a private and safe space.
                        </p>
                      </div>

                      <div className="right-column">
                        <div className="mindwell-card energy-card">
                          <div className="card-heading">
                            <div className="card-icon energy-icon">
                              <Sun size={21} />
                            </div>
                            <span className="section-tag">ENERGY</span>
                          </div>

                          <h3>Your energy today</h3>
                          <p className="section-subtitle">
                            How energetic are you feeling?
                          </p>

                          <div className="energy-value">
                            <strong>{energy}</strong>
                            <span>/ 10</span>
                          </div>

                          <input
                            type="range"
                            min="1"
                            max="10"
                            value={energy}
                            onChange={(event) => setEnergy(Number(event.target.value))}
                            className="energy-slider"
                            aria-label="Energy level"
                          />

                          <div className="slider-labels">
                            <span>Low energy</span>
                            <span>High energy</span>
                          </div>
                        </div>


                      </div>
                    </section>

                    <section id="wellness">
                      <BreathingExercise />
                    </section>

                    {user?.isPremium ? (
                      <MoodAnalytics />
                    ) : (
                      <section className="premium-upgrade-card">
                        <div className="premium-upgrade-icon">
                          <Sparkles size={25} />
                        </div>

                        <div className="premium-upgrade-content">
                          <span className="section-tag">MINDWELL PREMIUM</span>

                          <h2>Discover your wellness patterns</h2>

                          <p>
                            Unlock advanced mood analytics, detailed wellness
                            insights and a deeper understanding of your journey
                            with MindWell Premium.
                          </p>

                          <span className="premium-feature-label">
                            <Sparkles size={15} />
                            Premium feature
                          </span>
                          <button
                            type="button"
                            className="primary-button premium-upgrade-button"
                            onClick={handleUpgradeToPremium}
                            disabled={paymentLoading}
                          >
                            {paymentLoading ? "Preparing payment..." : "Upgrade to Premium"}
                            {!paymentLoading && <ArrowRight size={17} />}
                          </button>
                        </div>
                      </section>
                    )}

                    <section className="insight-card">
                      <div className="insight-icon">
                        <ChartNoAxesCombined size={24} />
                      </div>
                      <div>
                        <h3>Your wellness journey</h3>
                        <p>
                          Every entry is a step towards understanding yourself better.
                          Keep showing up for yourself.
                        </p>
                      </div>
                      <Smile size={30} className="insight-smile" />
                    </section>

                    <footer className="footer">
                      <span>© 2026 MindWell</span>
                      <span>Made with care for your wellbeing 🌱</span>
                    </footer>
                  </main>
                </div>
              }
            />

            <Route path="/journal" element={<Journal />} />
          </Routes>
        </div>
      )}
    </BrowserRouter>
  );
}

export default App;
