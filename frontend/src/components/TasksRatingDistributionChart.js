import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

const TasksRatingDistributionChart = () => {
    const svgRef = useRef();
    const containerRef = useRef();
    const [data, setData] = useState([]);
    const [selectedTopic, setSelectedTopic] = useState(null);
    const [topics, setTopics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dimensions, setDimensions] = useState({ width: 1000, height: 700 });

    useEffect(() => {
        const updateDimensions = () => {
            if (containerRef.current) {
                const containerWidth = containerRef.current.offsetWidth;
                setDimensions({
                    width: Math.min(1000, containerWidth),
                    height: Math.min(700, containerWidth * 0.7)
                });
            }
        };

        updateDimensions();
        window.addEventListener('resize', updateDimensions);
        return () => window.removeEventListener('resize', updateDimensions);
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const response = await fetch('http://127.0.0.1:8000/api/topics_distribution_by_rating');

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const jsonData = await response.json();
                setData(jsonData);

                const uniqueTopics = [...new Set(jsonData.map(d => d.topic))].sort();
                setTopics(uniqueTopics);

                const defaultTopic = uniqueTopics.includes('bitmasks')
                    ? 'bitmasks'
                    : uniqueTopics[0];
                setSelectedTopic(defaultTopic);

            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        if (loading || !selectedTopic || !dimensions.width) return;

        const filteredData = data.filter(d => d.topic === selectedTopic);

        const minRating = 800;
        const maxRating = 3500;
        const ratingStep = 100;
        const allRatings = Array.from(
            { length: (maxRating - minRating) / ratingStep + 1 },
            (_, i) => minRating + i * ratingStep
        );

        const maxCount = d3.max(filteredData, d => d.number_of_tasks) || 1;

        const ratings = allRatings.map(rating => {
            const found = filteredData.find(d => d.rating === rating);
            const count = found ? found.number_of_tasks : 0;
            const percentage = maxCount > 0 ? (count / maxCount) : 0;
            return {
                rating,
                count,
                percentage
            };
        });

        const { width: originalWidth, height: originalHeight } = dimensions;
        const width = originalWidth * 4;
        const height = originalHeight * 4;

        const margin = { top: 100, right: 200, bottom: 50, left: 200 };
        const centerX = width / 2;
        const centerY = height - margin.bottom;
        const baseRadius = Math.min(width, height) * 0.6;

        const svg = d3.select(svgRef.current);
        svg.selectAll("*").remove();
        svg.attr("width", width)
            .attr("height", height)
            .attr("viewBox", `0 0 ${width} ${height}`)
            .attr("preserveAspectRatio", "xMidYMid meet");

        const tooltip = d3.select("body").append("div")
            .attr("class", "chart-tooltip")
            .style("position", "absolute")
            .style("left", "-9999px")         // ⬅️ Добавлено
            .style("top", "-9999px")          // ⬅️ Добавлено
            .style("visibility", "hidden")
            .style("background", "#222")
            .style("color", "#fff")
            .style("padding", "14px 18px")
            .style("border-radius", "8px")
            .style("box-shadow", "0 6px 18px rgba(0, 0, 0, 0.6)")
            .style("pointer-events", "none")
            .style("font-size", "16px");

        const angleScale = d3.scaleLinear()
            .domain([minRating, maxRating])
            .range([-Math.PI / 2, Math.PI / 2]);

        const color = d3.scaleSequential()
            .domain([0, 1])
            .interpolator(d3.interpolateHcl("#6A4E17", "#F5C638"));

        const g = svg.append("g")
            .attr("transform", `translate(${centerX},${centerY})`);

        const tileThickness = 72;
        const tileLength = (Math.PI) / (maxRating - minRating) * ratingStep;
        const tileInnerRadius = baseRadius * 0.7;
        const tileOuterRadius = tileInnerRadius + tileThickness;

        const generateCurves = (d, numCurves) => {
            const baseAngle = angleScale(d.rating);
            const startAngle = baseAngle - tileLength / 2;
            const endAngle = baseAngle + tileLength / 2;

            return Array.from({ length: numCurves }).map((_, i) => {
                const t = i / (numCurves - 1);
                const angle = startAngle + t * tileLength;
                const targetRadius = tileInnerRadius + (tileThickness * 0.8);

                return d3.line()
                    .curve(d3.curveBasis)([
                        [0, 0],
                        [
                            Math.sin(angle) * baseRadius * 0.3,
                            -Math.cos(angle) * baseRadius * 0.3 - 100
                        ],
                        [
                            Math.sin(angle) * baseRadius * 0.7,
                            -Math.cos(angle) * baseRadius * 0.7 - 50
                        ],
                        [
                            Math.sin(angle) * targetRadius,
                            -Math.cos(angle) * targetRadius
                        ]
                    ]);
            });
        };

        ratings.forEach(d => {
            const numCurves = Math.floor(d.percentage * 10);
            if (numCurves <= 0) return;

            generateCurves(d, numCurves).forEach(curve => {
                g.append("path")
                    .attr("d", curve)
                    .attr("fill", "none")
                    .attr("stroke", "#F5C638")
                    .attr("stroke-width", 4)
                    .attr("stroke-linecap", "round")
                    .attr("opacity", 0.9);
            });
        });

        ratings.forEach(d => {
            const angle = angleScale(d.rating);
            const startAngle = angle - tileLength / 2;
            const endAngle = angle + tileLength / 2;

            const tile = d3.arc()
                .innerRadius(tileInnerRadius)
                .outerRadius(tileOuterRadius)
                .startAngle(startAngle)
                .endAngle(endAngle)
                .cornerRadius(8);

            g.append("path")
                .attr("d", tile)
                .attr("fill", d.count > 0 ? color(d.percentage) : "rgba(100,100,100,0.1)")
                .attr("stroke", "#333")
                .attr("stroke-width", 2)
                .on("mouseover", function (event) {
                    d3.select(this)
                        .attr("opacity", 1)
                        .attr("stroke", "#FFF");
                    tooltip.style("visibility", "visible")
                        .html(`Rating: ${d.rating}<br>Problems: ${d.count}<br>(${(d.percentage * 100).toFixed(0)}% of max)`)
                        .style("left", `${event.pageX + 15}px`)
                        .style("top", `${event.pageY + 15}px`);
                })
                .on("mouseout", function () {
                    d3.select(this)
                        .attr("opacity", 1)
                        .attr("stroke", "#333");
                    tooltip.style("visibility", "hidden");
                });
        });

        svg.append("text")
            .attr("x", width / 2)
            .attr("y", 150)
            .text(`Distribution for: ${selectedTopic}`)
            .style("text-anchor", "middle")
            .style("font-size", "48px")
            .style("fill", "#FFD700")
            .style("text-shadow", "0 2px 4px rgba(255,215,0,0.5)");

        return () => tooltip.remove();
    }, [data, loading, selectedTopic, dimensions]);

    if (loading) return <div style={{ color: '#fff', textAlign: 'center' }}>Loading...</div>;

    return (
        <div ref={containerRef} style={{
            width: '100%',
            maxWidth: '1000px',
            margin: '0 auto 40px',
            position: 'relative',
            overflow: 'visible',
            isolation: 'isolate',
        }}>
            <div style={{
                margin: '20px 0',
                textAlign: 'center',
                position: 'relative',
                zIndex: 2
            }}>
                <select
                    value={selectedTopic}
                    onChange={e => setSelectedTopic(e.target.value)}
                    style={{
                        padding: '12px 18px',
                        fontSize: '18px',
                        backgroundColor: '#333',
                        color: '#fff',
                        border: '1px solid #555',
                        borderRadius: '6px',
                        outline: 'none',
                        cursor: 'pointer'
                    }}
                >
                    {topics.map(topic => (
                        <option key={topic} value={topic} style={{ backgroundColor: '#333', color: '#fff' }}>
                            {topic}
                        </option>
                    ))}
                </select>
            </div>
            <div style={{
                position: 'relative',
                width: '100%',
                paddingBottom: `70%`, // фиксированный отступ
                overflow: 'hidden'
            }}>
                <svg
                    ref={svgRef}
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        background: 'transparent'
                    }}
                />
            </div>
        </div>
    );
};

export default TasksRatingDistributionChart;
