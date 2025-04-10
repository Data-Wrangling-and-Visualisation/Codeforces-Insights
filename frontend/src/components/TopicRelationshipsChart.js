import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

const TopicRelationshipsChart = () => {
    const svgRef = useRef();
    const [nodes, setNodes] = useState([]);
    const [links, setLinks] = useState([]);
    const [filteredLinks, setFilteredLinks] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            const res = await fetch("http://127.0.0.1:8000/api/topics_correlation");
            const data = await res.json();

            const topicsSet = new Set();
            data.forEach(item => {
                topicsSet.add(item.topic1);
                topicsSet.add(item.topic2);
            });

            const topics = Array.from(topicsSet).map(topic => ({
                id: topic,
                size: data
                    .filter(item => item.topic1 === topic || item.topic2 === topic)
                    .reduce((acc, item) => acc + item.number_of_tasks, 0),
            }));

            const edges = data
                .filter(item => item.number_of_tasks >= 1 && item.topic1 && item.topic2)
                .map(item => ({
                    source: item.topic1,
                    target: item.topic2,
                    value: item.number_of_tasks,
                }));

            setNodes(topics);
            setLinks(edges);
        };

        fetchData();
    }, []);

    useEffect(() => {
        if (nodes.length === 0 || links.length === 0) return;

        const filtered = [];
        const nodeMap = new Map(nodes.map(node => [node.id, node]));

        nodes.forEach(node => {
            const nodeLinks = links.filter(link =>
                link.source === node.id || link.target === node.id
            );

            const sortedLinks = [...nodeLinks].sort((a, b) => b.value - a.value);

            const topLinks = sortedLinks.slice(0, 2);

            topLinks.forEach(link => {
                if (!filtered.some(l =>
                    (l.source === link.source && l.target === link.target) ||
                    (l.source === link.target && l.target === link.source)
                )) {
                    filtered.push(link);
                }
            });
        });

        setFilteredLinks(filtered);
    }, [nodes, links]);

    useEffect(() => {
        if (nodes.length === 0 || filteredLinks.length === 0) return;

        const svg = d3.select(svgRef.current);
        svg.selectAll("*").remove();

        const width = window.innerWidth;
        const height = window.innerHeight;

        svg
            .attr("viewBox", `0 0 ${width} ${height}`)
            .style("background", "none");

        const container = svg.append("g");

        const simulationNodes = nodes.map(node => ({...node}));
        const simulationLinks = filteredLinks.map(link => ({
            ...link,
            source: simulationNodes.find(n => n.id === link.source),
            target: simulationNodes.find(n => n.id === link.target)
        }));

        const simulation = d3.forceSimulation(simulationNodes)
            .force("link", d3.forceLink(simulationLinks).id(d => d.id)
                .distance(d => {
                    return d.value >= 1000 ? 50 : 90;
                }))
            // .force("collision", d3.forceCollide().radius(d => 100))
            .force("charge", d3.forceManyBody().strength(d => d.size > 1000 ? -40 : -80))
            .force("center", d3.forceCenter(width / 2, height / 2))
            .stop();

        for (let i = 0; i < 300; ++i) {
            simulation.tick();
        }

        const tooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("position", "absolute")
            .style("visibility", "hidden")
            .style("background", "#222")
            .style("color", "#fff")
            .style("padding", "14px 18px")
            .style("border-radius", "12px")
            .style("box-shadow", "0 6px 18px rgba(0, 0, 0, 0.6)")
            .style("pointer-events", "none")
            .style("font-family", "sans-serif")
            .style("font-size", "16px")
            .style("line-height", "1.6")
            .style("transform", "scale(1)")
            .style("transition", "transform 0.15s ease, opacity 0.15s ease");

        svg.on("mousemove", (event) => {
            const tooltipNode = tooltip.node();
            const padding = 15;

            const tooltipWidth = tooltipNode.offsetWidth;
            const tooltipHeight = tooltipNode.offsetHeight;

            let x = event.pageX + padding;
            let y = event.pageY + padding;

            if (x + tooltipWidth > window.innerWidth) {
                x = event.pageX - tooltipWidth - padding;
            }

            if (y + tooltipHeight > window.innerHeight) {
                y = event.pageY - tooltipHeight - padding;
            }

            tooltip
                .style("left", `${x}px`)
                .style("top", `${y}px`);
        });

        container.append("g")
            .selectAll("line")
            .data(simulationLinks)
            .join("line")
            .attr("stroke", "#999")
            .attr("stroke-opacity", 0.6)
            .attr("stroke-width", d => Math.sqrt(d.value) * 0.5)
            .attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);

        container.append("g")
            .selectAll("circle")
            .data(simulationNodes)
            .join("circle")
            .attr("r", d => Math.sqrt(d.size) * 0.3)
            .attr("cx", d => d.x)
            .attr("cy", d => d.y)
            .attr("fill", "orange")
            .style("filter", "drop-shadow(0 0 5px #ff0)")
            .on("mouseover", (event, d) => {
                tooltip
                    .style("visibility", "visible")
                    .style("transform", "scale(1.2)")
                    .style("opacity", "1")
                    .html(`<div><strong>${d.id}</strong></div><div>Tasks: ${d.size}</div>`);
            })
            .on("mouseout", () => {
                tooltip
                    .style("transform", "scale(1)")
                    .style("opacity", "0")
                    .style("visibility", "hidden");
            });

        container.append("g")
            .selectAll("text")
            .data(simulationNodes)
            .join("text")
            .text(d => d.id)
            .attr("x", d => d.x)
            .attr("y", d => d.y)
            .attr("font-size", 12)
            .attr("dx", 15)
            .attr("dy", 5)
            .attr("fill", "#ffffff")
            .style("text-shadow", "1px 1px 3px #000")
            .style("font-weight", "bold")
            .on("mouseover", (event, d) => {
                tooltip
                    .style("visibility", "visible")
                    .style("transform", "scale(1.2)")
                    .style("opacity", "1")
                    .html(`<div><strong>${d.id}</strong></div><div>Tasks: ${d.size}</div>`);
            })
            .on("mouseout", () => {
                tooltip
                    .style("transform", "scale(1)")
                    .style("opacity", "0")
                    .style("visibility", "hidden");
            });

        return () => {
            tooltip.remove();
        };
    }, [nodes, filteredLinks]);

    return (
        <div className="p-0 m-0">
            <svg ref={svgRef} className="w-full h-screen" />
        </div>
    );
};

export default TopicRelationshipsChart;