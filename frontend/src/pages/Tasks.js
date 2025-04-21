// src/pages/UserRating.js (или Tasks.js, если ты переименуешь файл)
import React from "react";
import {Link} from "react-router-dom";
import TasksSolvabilityChart from "../components/TasksSolvabilityChart";
import TasksRatingDistributionChart from "../components/TasksRatingDistributionChart";
import InfoCard from "../components/InfoCard";

const Tasks = () => {
    return (
        <div className="p-8 flex flex-col min-h-screen justify-between">
            <h1 className="text-4xl font-bold text-white text-center py-24">
                What new topics would suit your level?
            </h1>

            {/* График */}
            <div>
                <TasksSolvabilityChart/>
            </div>

            <div className="flex flex-col md:flex-row gap-4 mt-20">

                {/* Основной вывод по визуализации */}
                <div className="basis-1/2">
                    <InfoCard
                        title="What does this chart show?"
                        content={
                            <>
                                Each rectangle represents a <strong>topic</strong>.
                                <br/><br/>
                                <strong>Color</strong> shows solvability:
                                <span style={{color: "#6A4E17"}}> darker = fewer users succeed</span>,
                                <span style={{color: "#F5C638"}}> brighter = more users succeed</span>.
                                <br/><br/>
                                <strong>Percentage</strong> = topic's solvability — the rate at which users solve tasks
                                in it.
                            </>
                        }
                    />
                </div>

                {/* Стратегия использования графика */}
                <div className="basis-1/2">
                    <InfoCard
                        title="How to use this chart"
                        isList
                        content={[
                            "Start with high-solvability (bright) topics to build confidence",
                            "Gradually move to more challenging (darker) ones",
                            "Read topic labels below bars to plan your learning path",
                            "Use the chart as a guide to balance ease and progress",
                        ]}
                    />
                </div>

            </div>

            <TasksRatingDistributionChart/>

            <div className="flex flex-col md:flex-row gap-4 mt-20">
                {/* Основной вывод по графику сложности */}
                <div className="basis-1/2">
                    <InfoCard
                        title="What does this rating distribution chart show?"
                        content={
                            <>
                                This chart shows the <strong>distribution of task ratings</strong> within various
                                topics.
                                <br/><br/>
                                The <strong>range of ratings</strong> helps you assess whether a topic is suitable for
                                you to study.
                                <br/><br/>
                                A broad rating range suggests that the topic contains a mix of easier and harder tasks.
                                A narrow rating range indicates that the tasks are more consistently rated, possibly
                                making the topic easier to tackle.
                            </>
                        }
                    />
                </div>

                {/* Основной вывод по визуализации */}
                {/* Цель пользователя */}
                <div className="basis-1/2">
                    <InfoCard
                        title="How to use this chart"
                        content={
                            <>
                                <strong>Range of ratings</strong> provides insight into how varied the difficulty of
                                tasks is within each topic.
                                <br/><br/>
                                A wide rating range indicates that the topic contains both easy and difficult tasks,
                                offering opportunities to gradually increase the challenge.
                                <br/><br/>
                                A narrow rating range suggests that the tasks in the topic have similar difficulty,
                                making it easier to focus on steady progress without major surprises.
                            </>
                        }
                    />
                </div>
            </div>

            {/* Ссылка внизу справа */}
            <div className="w-full flex justify-between mt-6">
                <Link
                    to="/" // Замени на актуальный маршрут
                    className="text-white text-lg font-semibold hover:text-customYellow transition"
                >
                    ← Go to previous step
                </Link>

                <Link
                    to="/topic-relationships"
                    className="text-white text-lg font-semibold hover:text-customYellow transition"
                >
                    Go to next step →
                </Link>
            </div>
        </div>
    );
};

export default Tasks;
