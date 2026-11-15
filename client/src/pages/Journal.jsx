
import { useEffect, useState } from "react";
import {
    BookOpen,
    ArrowLeft,
    CalendarDays,
    Heart,
    Search,
    Pencil,
    Trash2,
    X,
    Save,
    LoaderCircle,
    Download,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import { jsPDF } from "jspdf";
import "../App.css";

function Journal() {
    const navigate = useNavigate();

    const [journals, setJournals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [editingId, setEditingId] = useState(null);
    const [editContent, setEditContent] = useState("");
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");
    // Premium journal search
    const [searchTerm, setSearchTerm] = useState("");
    const [searchFrom, setSearchFrom] = useState("");
    const [searchTo, setSearchTo] = useState("");
    const [searchResults, setSearchResults] = useState(null);
    const [searching, setSearching] = useState(false);
    const [searchError, setSearchError] = useState("");

    const [isPremium] = useState(() => {
        try {
            const savedUser = JSON.parse(
                localStorage.getItem("mindwell_user") || "null"
            );

            return Boolean(savedUser?.isPremium);
        } catch {
            return false;
        }
    });

    const fetchJournals = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await API.get("/journals");
            setJournals(response.data.journals || []);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to load your journal entries."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchJournals();
    }, []);

    // Export journal entries as a JSON file
    const handleExport = async () => {
        try {
            const response = await API.get("/journals/export", {
                responseType: "blob",
            });

            const blob = new Blob([response.data], {
                type: "application/json",
            });

            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");

            link.href = url;
            link.download = `mindwell-journals-${new Date()
                .toISOString()
                .slice(0, 10)}.json`;

            document.body.appendChild(link);
            link.click();
            link.remove();

            window.URL.revokeObjectURL(url);

            setMessage("Your journal export has been downloaded.");
        } catch (err) {
            console.error("Journal export failed:", err);
            setMessage("Unable to export journals. Please try again.");
        }
    };

    // Export journal entries as a PDF file

    const handlePDFExport = () => {
        try {
            const doc = new jsPDF();

            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();
            const margin = 20;
            const maxWidth = pageWidth - margin * 2;

            let y = 25;

            // Professional PDF heading
            doc.setFont("helvetica", "bold");
            doc.setFontSize(24);
            doc.setTextColor(69, 112, 85);
            doc.text("MindWell", margin, y);

            y += 9;

            doc.setFont("helvetica", "normal");
            doc.setFontSize(11);
            doc.setTextColor(90, 90, 90);
            doc.text("My Private Journal", margin, y);

            y += 8;

            doc.setDrawColor(190, 210, 195);
            doc.line(margin, y, pageWidth - margin, y);

            y += 12;

            doc.setFontSize(10);
            doc.setTextColor(100, 100, 100);
            doc.text(
                `Exported on: ${new Date().toLocaleDateString("en-IN")}`,
                margin,
                y
            );

            y += 16;

            if (journals.length === 0) {
                doc.setTextColor(60, 60, 60);
                doc.text("No journal entries available.", margin, y);
            } else {
                journals.forEach((entry, index) => {
                    const contentLines = doc.splitTextToSize(
                        entry.content || "",
                        maxWidth - 12
                    );

                    const promptLines = entry.prompt
                        ? doc.splitTextToSize(
                            `Prompt: ${entry.prompt}`,
                            maxWidth - 12
                        )
                        : [];

                    const blockHeight =
                        50 +
                        contentLines.length * 5 +
                        promptLines.length * 5;

                    // Add another page when required
                    if (y + blockHeight > pageHeight - margin) {
                        doc.addPage();
                        y = 25;
                    }

                    // Journal entry background
                    doc.setFillColor(246, 249, 246);
                    doc.setDrawColor(215, 228, 216);
                    doc.roundedRect(
                        margin,
                        y - 5,
                        maxWidth,
                        blockHeight,
                        3,
                        3,
                        "FD"
                    );

                    let textY = y + 5;

                    // Entry title
                    doc.setFont("helvetica", "bold");
                    doc.setFontSize(13);
                    doc.setTextColor(69, 112, 85);
                    doc.text(`Journal Entry ${index + 1}`, margin + 6, textY);

                    textY += 9;

                    // Date and mood
                    doc.setFont("helvetica", "normal");
                    doc.setFontSize(10);
                    doc.setTextColor(80, 80, 80);

                    doc.text(
                        `Date: ${new Date(entry.createdAt).toLocaleDateString("en-IN")}`,
                        margin + 6,
                        textY
                    );

                    textY += 6;

                    doc.text(`Mood: ${entry.mood}/10`, margin + 6, textY);

                    textY += 9;

                    // Journal content
                    doc.setTextColor(45, 45, 45);
                    doc.text(contentLines, margin + 6, textY);

                    textY += contentLines.length * 5 + 5;

                    // Journal prompt
                    if (promptLines.length > 0) {
                        doc.setFontSize(9);
                        doc.setTextColor(105, 105, 105);
                        doc.text(promptLines, margin + 6, textY);
                    }

                    y += blockHeight + 12;
                });
            }

            // Add page numbers
            const totalPages = doc.getNumberOfPages();

            for (let page = 1; page <= totalPages; page++) {
                doc.setPage(page);

                doc.setFont("helvetica", "normal");
                doc.setFontSize(9);
                doc.setTextColor(120, 120, 120);

                doc.text(
                    `MindWell | Page ${page} of ${totalPages}`,
                    pageWidth / 2,
                    pageHeight - 10,
                    { align: "center" }
                );
            }

            doc.save("mindwell-journal-export.pdf");

            setMessage("Your PDF journal has been downloaded.");
        } catch (error) {
            console.error("PDF export failed:", error);
            setMessage("Unable to export PDF. Please try again.");
        }
    };

    // Search Premium journal entries
    const handleSearch = async () => {
        if (!searchTerm.trim() && !searchFrom && !searchTo) {
            setSearchError("Enter a keyword or select a date filter.");
            setSearchResults(null);
            return;
        }

        try {
            setSearching(true);
            setSearchError("");
            setSearchResults(null);

            const params = {};

            if (searchTerm.trim()) {
                params.q = searchTerm.trim();
            }

            if (searchFrom) {
                params.from = searchFrom;
            }

            if (searchTo) {
                params.to = searchTo;
            }

            const response = await API.get("/journals/search", {
                params,
            });

            setSearchResults(response.data.journals || []);
        } catch (err) {
            setSearchError(
                err.response?.data?.message ||
                "Unable to search journal entries."
            );
        } finally {
            setSearching(false);
        }
    };

    const handleEdit = (entry) => {
        setEditingId(entry.id);
        setEditContent(entry.content);
        setMessage("");
    };

    const handleUpdate = async (id) => {
        if (!editContent.trim()) {
            setMessage("Journal content cannot be empty.");
            return;
        }

        try {
            setSaving(true);

            const response = await API.put(`/journals/${id}`, {
                content: editContent,
            });

            setMessage(
                response.data.message || "Journal updated successfully."
            );

            setEditingId(null);
            await fetchJournals();
        } catch (err) {
            setMessage(
                err.response?.data?.message ||
                "Unable to update journal entry."
            );
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this journal entry?"
        );

        if (!confirmed) return;

        try {
            await API.delete(`/journals/${id}`);

            setJournals((previous) =>
                previous.filter((entry) => entry.id !== id)
            );

            setMessage("Journal entry deleted successfully.");
        } catch (err) {
            setMessage(
                err.response?.data?.message ||
                "Unable to delete journal entry."
            );
        }
    };

    const formatDate = (date) =>
        new Date(date).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "long",
            year: "numeric",
        });

    return (
        <div className="journal-page">
            <header className="journal-page-header">
                <button
                    className="secondary-button"
                    onClick={() => navigate("/")}
                >
                    <ArrowLeft size={17} />
                    Back to Home
                </button>

                <button
                    className="secondary-button"
                    onClick={handleExport}
                >
                    <Download size={17} />
                    Export Journals
                </button>
                <button
                    className="secondary-button"
                    onClick={handlePDFExport}
                >
                    <Download size={17} />
                    Export PDF
                </button>
            </header>

            <main className="journal-page-content">
                <div className="journal-page-heading">
                    <div className="card-icon journal-icon">
                        <BookOpen size={25} />
                    </div>

                    <h1>Your private journal</h1>

                    <p>
                        A space to reflect, express and grow.
                        Your thoughts are securely protected.
                    </p>
                </div>

                {message && (
                    <p className="journal-page-message" role="status">
                        {message}
                    </p>
                )}


                {/* PREMIUM ADVANCED JOURNAL SEARCH */}
                {isPremium && (
                    <section className="journal-search-section">
                        <div className="journal-search-heading">
                            <div>
                                <h2>
                                    <Search size={21} />
                                    Advanced Journal Search
                                </h2>
                                <p>Find your past reflections using keywords or dates.</p>
                            </div>
                            <span className="premium-label">PREMIUM</span>
                        </div>

                        <div className="journal-search-controls">
                            <input
                                type="text"
                                className="journal-search-input"
                                placeholder="Search your journal entries..."
                                value={searchTerm}
                                onChange={(event) => setSearchTerm(event.target.value)}
                                onKeyDown={(event) => {
                                    if (event.key === "Enter") handleSearch();
                                }}
                            />

                            <div className="journal-date-filters">
                                <label>
                                    From
                                    <input
                                        type="date"
                                        value={searchFrom}
                                        onChange={(event) => setSearchFrom(event.target.value)}
                                    />
                                </label>

                                <label>
                                    To
                                    <input
                                        type="date"
                                        value={searchTo}
                                        onChange={(event) => setSearchTo(event.target.value)}
                                    />
                                </label>
                            </div>

                            <div className="journal-search-actions">
                                <button
                                    className="primary-button"
                                    onClick={handleSearch}
                                    disabled={searching}
                                >
                                    <Search size={16} />
                                    {searching ? "Searching..." : "Search Journals"}
                                </button>

                                <button
                                    className="secondary-button"
                                    onClick={() => {
                                        setSearchTerm("");
                                        setSearchFrom("");
                                        setSearchTo("");
                                        setSearchResults(null);
                                        setSearchError("");
                                    }}
                                >
                                    Clear
                                </button>
                            </div>
                        </div>

                        {searchError && (
                            <p className="journal-page-message" role="alert">
                                {searchError}
                            </p>
                        )}

                        {searchResults !== null && (
                            <div className="journal-search-results">
                                <h3>
                                    Search Results ({searchResults.length})
                                </h3>

                                {searchResults.length === 0 ? (
                                    <p>No matching journal entries found.</p>
                                ) : (
                                    searchResults.map((entry) => (
                                        <article
                                            className="mindwell-card journal-history-card"
                                            key={entry.id}
                                        >
                                            <div className="journal-history-top">
                                                <span>
                                                    <CalendarDays size={15} />
                                                    {formatDate(entry.createdAt)}
                                                </span>

                                                <span className="journal-mood-label">
                                                    <Heart size={15} />
                                                    Mood: {entry.mood}/10
                                                </span>
                                            </div>

                                            <p className="journal-history-content">
                                                {entry.content}
                                            </p>

                                            {entry.prompt && (
                                                <p className="journal-history-prompt">
                                                    Prompt: {entry.prompt}
                                                </p>
                                            )}
                                        </article>
                                    ))
                                )}
                            </div>
                        )}
                    </section>
                )}


                {loading ? (
                    <div className="journal-loading">
                        <LoaderCircle size={25} />
                        <p>Loading your reflections...</p>
                    </div>
                ) : error ? (
                    <div className="journal-empty">
                        <p>{error}</p>
                        <button
                            className="primary-button"
                            onClick={fetchJournals}
                        >
                            Try again
                        </button>
                    </div>
                ) : journals.length === 0 ? (
                    <div className="journal-empty">
                        <BookOpen size={35} />
                        <h2>No journal entries yet</h2>
                        <p>
                            Your reflections will appear here after you save them.
                        </p>
                        <button
                            className="primary-button"
                            onClick={() => navigate("/")}
                        >
                            Write your first reflection
                        </button>
                    </div>
                ) : (
                    <div className="journal-history-list">
                        {journals.map((entry) => (
                            <article
                                className="mindwell-card journal-history-card"
                                key={entry.id}
                            >
                                <div className="journal-history-top">
                                    <span>
                                        <CalendarDays size={15} />
                                        {formatDate(entry.createdAt)}
                                    </span>

                                    <span className="journal-mood-label">
                                        <Heart size={15} />
                                        Mood: {entry.mood}/10
                                    </span>
                                </div>

                                {editingId === entry.id ? (
                                    <div className="journal-edit-area">
                                        <textarea
                                            className="mindwell-textarea"
                                            value={editContent}
                                            onChange={(event) =>
                                                setEditContent(event.target.value)
                                            }
                                            rows={6}
                                        />

                                        <div className="journal-edit-actions">
                                            <button
                                                className="primary-button"
                                                onClick={() => handleUpdate(entry.id)}
                                                disabled={saving}
                                            >
                                                <Save size={16} />
                                                {saving ? "Saving..." : "Save changes"}
                                            </button>

                                            <button
                                                className="secondary-button"
                                                onClick={() => setEditingId(null)}
                                                disabled={saving}
                                            >
                                                <X size={16} />
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <p className="journal-history-content">
                                            {entry.content}
                                        </p>

                                        {entry.prompt && (
                                            <p className="journal-history-prompt">
                                                Prompt: {entry.prompt}
                                            </p>
                                        )}

                                        <div className="journal-history-actions">
                                            <button
                                                className="secondary-button"
                                                onClick={() => handleEdit(entry)}
                                            >
                                                <Pencil size={15} />
                                                Edit
                                            </button>

                                            <button
                                                className="secondary-button journal-delete-button"
                                                onClick={() => handleDelete(entry.id)}
                                            >
                                                <Trash2 size={15} />
                                                Delete
                                            </button>
                                        </div>
                                    </>
                                )}
                            </article>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}

export default Journal;
