import React, {useEffect, useRef, useState} from 'react';
import * as d3 from 'd3';

const TasksRatingDistributionChart = () => {
    const svgRef = useRef();
    const containerRef = useRef();
    const [data, setData] = useState([]);
    const [selectedTopic, setSelectedTopic] = useState(null);
    const [topics, setTopics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dimensions, setDimensions] = useState({width: 1000, height: 700});

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
            {length: (maxRating - minRating) / ratingStep + 1},
            (_, i) => minRating + i * ratingStep
        );

        const ratings = allRatings.map(rating => {
            const found = filteredData.find(d => d.rating === rating);
            return {
                rating,
                count: found ? found.number_of_tasks : 0
            };
        });

        const {width, height} = dimensions;
        const margin = {top: 80, right: 40, bottom: 40, left: 40};
        const radius = Math.min(width - margin.left - margin.right, (height - margin.top - margin.bottom));
        const innerRadius = radius * 0.3;
        const centerX = width / 2;
        const centerY = height - margin.bottom - 10;

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

        const x = d3.scaleLinear()
            .domain([minRating, maxRating])
            .range([-Math.PI / 2, Math.PI / 2]);

        const y = d3.scaleRadial()
            .domain([0, d3.max(ratings, d => d.count) || 1])
            .range([innerRadius, radius]);

        const color = d3.scaleSequential()
            .domain([0, d3.max(ratings, d => d.count) || 1])
            .interpolator(d3.interpolateHcl("#FFF5D9", "#F5C638"));

        const g = svg.append("g")
            .attr("transform", `translate(${centerX},${centerY})`);

        const barWidth = 0.1;

        ratings.forEach(d => {
            const angle = x(d.rating);
            const outerRadius = y(d.count);

            g.append("path")
                .attr("d", d3.arc()({
                    innerRadius: y(0),
                    outerRadius: outerRadius,
                    startAngle: angle - barWidth / 2,
                    endAngle: angle + barWidth / 2,
                    padAngle: 0.01
                }))
                .attr("fill", d.count > 0 ? color(d.count) : "rgba(100,100,100,0.2)")
                .attr("opacity", 1)
                .style("stroke", d.count > 0 ? "none" : "rgba(255,255,255,0.3)")
                .style("stroke-width", 1)
                .on("mouseover", function (event) {
                    d3.select(this).attr("opacity", 1);
                    tooltip.style("visibility", "visible")
                        .html(`Rating: ${d.rating}<br>Problems: ${d.count}`)
                        .style("left", (event.pageX + 15) + "px")
                        .style("top", (event.pageY + 15) + "px");
                })
                .on("mousemove", function (event) {
                    tooltip.style("left", (event.pageX + 15) + "px")
                        .style("top", (event.pageY + 15) + "px");
                })
                .on("mouseout", function () {
                    d3.select(this).attr("opacity", 1);
                    tooltip.style("visibility", "hidden");
                });

            if (d.rating % 500 === 0) {
                const labelRadius = y(0) - 25;
                const labelX = Math.sin(angle) * labelRadius;
                const labelY = -Math.cos(angle) * labelRadius;

                g.append("text")
                    .attr("x", labelX)
                    .attr("y", labelY)
                    .attr("text-anchor", "middle")
                    .text(d.rating)
                    .style("font-size", "14px")
                    .style("fill", "#fff")
                    .style("font-weight", "bold");
            }
        });

        svg.append("text")
            .attr("x", width / 2)
            .attr("y", 50)
            .text(`Distribution of topic rating: ${selectedTopic}`)
            .style("text-anchor", "middle")
            .style("font-size", "22px")
            .style("fill", "#fff");

        return () => {
            tooltip.remove();
        };
    }, [data, loading, selectedTopic, dimensions]);

    if (loading) return <div style={{color: '#fff', textAlign: 'center'}}>Loading...</div>;

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
                        padding: '10px',
                        fontSize: '16px',
                        backgroundColor: '#333',
                        color: '#fff',
                        border: '1px solid #555',
                        borderRadius: '4px',
                        outline: 'none'
                    }}
                >
                    {topics.map(topic => (
                        <option key={topic} value={topic} style={{backgroundColor: '#333', color: '#fff'}}>
                            {topic}
                        </option>
                    ))}
                </select>
            </div>
            <div style={{
                position: 'relative',
                width: '100%',
                paddingBottom: `${(dimensions.height / dimensions.width) * 100}%`,
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