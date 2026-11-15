
import { useEffect, useState } from "react";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";
import { Line, Pie } from "react-chartjs-2";
import {
    TrendingUp,
    Activity,
    Heart,
    Sparkles,
    Smile,
    Lightbulb,
} from "lucide-react";
import API from "../services/api";
import "../App.css";

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
);

function MoodAnalytics() {
    const [period, setPeriod] = useState("weekly");
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchAnalytics = async () => {
            setLoading(true);
            setError("");

            try {
                const response = await API.get(`/moods?period=${period}`);
                setAnalytics(response.data);
            } catch (err) {
                setError(
                    err.response?.data?.message ||
                    "Unable to load mood analytics."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchAnalytics();
    }, [period]);


    const moodChartData = {
        labels: analytics?.moodHistory?.map((entry) =>
            new Date(entry.date).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
            })
        ) || [],
        datasets: [
            {
                label: "Mood",
                data: analytics?.moodHistory?.map((entry) => entry.mood) || [],
                borderColor: "#6b8f71",
                backgroundColor: "rgba(107, 143, 113, 0.15)",
                tension: 0.4,
                fill: true,
            },
            {
                label: "Energy",
                data: analytics?.moodHistory?.map((entry) => entry.energyLevel) || [],
                borderColor: "#d5a45c",
                backgroundColor: "rgba(213, 164, 92, 0.12)",
                tension: 0.4,
                fill: true,
            },
        ],
    };

    const moodChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            y: {
                min: 0,
                max: 10,
                ticks: {
                    stepSize: 2,
                },
            },
        },
        plugins: {
            legend: {
                position: "bottom",
            },
        },
    };


    const emotionChartData = {
        labels: Object.keys(analytics?.emotionCounts || {}),
        datasets: [
            {
                data: Object.values(analytics?.emotionCounts || {}),
                backgroundColor: [
                    "#6b8f71",
                    "#d5a45c",
                    "#8da9bd",
                    "#c58b9b",
                    "#a99bc7",
                    "#d69b72",
                    "#91aaa0",
                    "#c3b77b",
                    "#8298b4",
                    "#b4a18e",
                ],
                borderWidth: 2,
                borderColor: "white",
            },
        ],
    };

    return (
        <section className="analytics-section">
            <div className="analytics-heading">
                <div>
                    <h2>Your mood analytics</h2>
                    <p className="section-subtitle">
                        Understand your emotional wellness over time.
                    </p>
                </div>

                <select
                    value={period}
                    onChange={(event) => setPeriod(event.target.value)}
                    className="mindwell-select analytics-period"
                    aria-label="Select analytics period"
                >
                    <option value="weekly">Last 7 days</option>
                    <option value="monthly">Last 30 days</option>
                </select>
            </div>

            {loading && (
                <p className="analytics-status">Loading your analytics...</p>
            )}

            {!loading && error && (
                <p className="analytics-error">{error}</p>
            )}

            {!loading && !error && analytics && (
                <p className="analytics-status">
                    {analytics.totalEntries === 0
                        ? "No mood records found for this period yet."
                        : `${analytics.totalEntries} mood records found.`}
                </p>
            )}


            {!loading && !error && analytics && (
                <div className="analytics-stats">
                    <div className="mindwell-card analytics-stat-card">
                        <div className="card-icon journal-icon">
                            <Activity size={21} />
                        </div>
                        <span>Total Check-ins</span>
                        <strong>{analytics.totalEntries}</strong>
                    </div>

                    <div className="mindwell-card analytics-stat-card">
                        <div className="card-icon energy-icon">
                            <Heart size={21} />
                        </div>
                        <span>Average Mood</span>
                        <strong>{analytics.averageMood}/10</strong>
                    </div>

                    <div className="mindwell-card analytics-stat-card">
                        <div className="card-icon wellness-icon">
                            <TrendingUp size={21} />
                        </div>
                        <span>Average Energy</span>
                        <strong>{analytics.averageEnergy}/10</strong>
                    </div>
                </div>
            )}


            {!loading && !error && analytics?.totalEntries > 0 && (
                <>
                    {/* MOOD AND ENERGY TREND CHART */}
                    <div className="mindwell-card analytics-chart-card">
                        <div className="card-heading">
                            <div>
                                <h3>Mood & Energy Trends</h3>
                                <p className="section-subtitle">
                                    Track how your mood and energy change over time.
                                </p>
                            </div>

                            <div className="card-icon energy-icon">
                                <TrendingUp size={21} />
                            </div>
                        </div>

                        <div className="analytics-chart">
                            <Line
                                data={moodChartData}
                                options={moodChartOptions}
                            />
                        </div>
                    </div>

                    {/* EMOTION DISTRIBUTION CHART */}
                    {Object.keys(analytics?.emotionCounts || {}).length > 0 && (
                        <div className="mindwell-card analytics-chart-card emotion-chart-card">
                            <div className="card-heading">
                                <div>
                                    <h3>Emotion Distribution</h3>
                                    <p className="section-subtitle">
                                        Discover the emotions you experience most often.
                                    </p>
                                </div>

                                <div className="card-icon wellness-icon">
                                    <Heart size={21} />
                                </div>
                            </div>

                            <div className="emotion-chart">
                                <Pie data={emotionChartData} />
                            </div>
                        </div>
                    )}
                </>
            )}


            {/* PREMIUM WELLNESS INSIGHTS */}
            {analytics?.wellnessInsights && (
                <div className="mindwell-card wellness-insights-card">
                    <div className="card-heading">
                        <div>
                            <h3>
                                <Sparkles size={20} />
                                Your Wellness Insights
                            </h3>
                            <p className="section-subtitle">
                                Personal reflections based on your recorded wellness data.
                            </p>
                        </div>

                        <div className="card-icon wellness-icon">
                            <Lightbulb size={22} />
                        </div>
                    </div>

                    <div className="wellness-insights-grid">
                        <div className="wellness-insight-item">
                            <Smile size={22} />
                            <span>Most Frequent Emotion</span>
                            <strong>
                                {analytics.wellnessInsights.mostFrequentEmotion}
                            </strong>
                        </div>

                        <div className="wellness-insight-item">
                            <TrendingUp size={22} />
                            <span>Mood Pattern</span>
                            <strong>
                                {analytics.wellnessInsights.moodTrend}
                            </strong>
                        </div>
                    </div>

                    <div className="wellness-message">
                        <Sparkles size={19} />
                        <p>{analytics.wellnessInsights.wellnessMessage}</p>
                    </div>
                </div>
            )}

        </section>
    );

}

export default MoodAnalytics;
