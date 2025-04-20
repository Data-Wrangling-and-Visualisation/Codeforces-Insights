import React, {useEffect, useRef, useState, useCallback} from "react";
import * as d3 from "d3";

const TasksSolvabilityChart = () => {
    const [data, setData] = useState([]);
    const chartRef = useRef();
    const containerRef = useRef();
    const [dimensions, setDimensions] = useState({width: 0, height: 0});

    const updateDimensions = useCallback(() => {
        if (containerRef.current) {
            const {width, height} = containerRef.current.getBoundingClientRect();
            setDimensions({width, height});
        }
    }, []);

    useEffect(() => {
        updateDimensions();
        window.addEventListener("resize", updateDimensions);
        return () => window.removeEventListener("resize", updateDimensions);
    }, [updateDimensions]);

    useEffect(() => {
        fetch("http://127.0.0.1:8000/api/topics_solvability")
            .then(res => res.json())
            .then(json => {
                const filtered = json.filter(d => d.topic !== "*special");
                const sorted = filtered.sort((a, b) => b.solvability - a.solvability);
                setData(sorted);
            });
    }, []);

    useEffect(() => {
        if (!data.length || !dimensions.width || !dimensions.height) return;

        const width = dimensions.width;
        const cellSize = Math.min(120, width * 0.15);
        const spacing = 20;
        const columns = Math.max(1, Math.floor((width - spacing) / (cellSize + spacing)));

        // Вычисление максимальной высоты в зависимости от количества строк и ячеек
        const rows = Math.ceil(data.length / columns);
        const totalHeight = rows * (cellSize + spacing) + cellSize + 30 - spacing;

        const svg = d3.select(chartRef.current);
        svg.selectAll("*").remove();

        const g = svg
            .attr("width", width)
            .attr("height", totalHeight)  // высота будет зависеть от данных
            .style("display", "block")
            .style("margin", "0 auto")
            .append("g")
            .attr("transform", `translate(0, 100)`);

        const color = d3.scaleLinear()
            .domain([0.5, 0.85])
            .range(["#6A4E17", "#F5C638"])
            .interpolate(d3.interpolateHcl);

        const tooltip = d3
            .select("body")
            .append("div")
            .attr("class", "tooltip")
            .style("position", "absolute")
            .style("visibility", "hidden")
            .style("background", "#222")
            .style("color", "#fff")
            .style("padding", "14px 18px")
            .style("border-radius", "8px")
            .style("box-shadow", "0 6px 18px rgba(0, 0, 0, 0.6)")
            .style("pointer-events", "none")
            .style("font-size", "16px");

        const maxTextWidth = cellSize - 12;

        const wrapText = (text, maxWidth) => {
            const svg = d3.select("body").append("svg").style("position", "absolute").style("left", "-9999px");
            const tempText = svg.append("text")
                .attr("fill", "#ffffff")
                .attr("font-size", 16)
                .style("text-shadow", "1px 1px 3px #000")
                .style("font-weight", "bold")
            ;

            const words = text.split(/(\s|-)/);
            let lines = [];
            let currentLine = "";

            words.forEach(word => {
                const testLine = currentLine + word;
                tempText.text(testLine);
                const testWidth = tempText.node().getBBox().width;

                if (testWidth > maxWidth && currentLine !== "") {
                    lines.push(currentLine);
                    currentLine = word;
                } else {
                    currentLine = testLine;
                }
            });

            lines.push(currentLine);
            svg.remove();
            return lines;
        };

        g.selectAll("g.cell")
            .data(data)
            .enter()
            .append("g")
            .attr("class", "cell")
            .attr("transform", (d, i) => {
                const col = i % columns;
                const row = Math.floor(i / columns);
                const waveOffset = Math.sin(col / columns * Math.PI * 2) * 15;
                const x = col * (cellSize + spacing);
                const y = row * (cellSize + spacing) + waveOffset;
                const gridWidth = columns * (cellSize + spacing);
                return `translate(${x + (width - gridWidth) / 2}, ${y})`;
            })
            .each(function (d) {
                const group = d3.select(this);

                group.append("rect")
                    .attr("width", cellSize)
                    .attr("height", cellSize)
                    .attr("rx", 12)
                    .attr("ry", 12)
                    .attr("fill", color(d.solvability))
                    .attr("cursor", "pointer")
                    .on("mouseover", function () {
                        d3.select(this).attr("stroke", "black").attr("stroke-width", 2);
                        tooltip
                            .style("visibility", "visible")
                            .style("opacity", 1)
                            .html(`<strong>${d.topic}</strong><br/>${(d.solvability * 100).toFixed(2)}%`);
                    })
                    .on("mouseout", function () {
                        d3.select(this).attr("stroke", "none");
                        tooltip
                            .style("visibility", "hidden")
                            .style("opacity", 0);
                    })
                    .on("mousemove", function (event) {
                        const padding = 15;
                        const tooltipWidth = tooltip.node().offsetWidth;
                        const tooltipHeight = tooltip.node().offsetHeight;

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

                const lines = wrapText(d.topic, maxTextWidth);
                const totalTextHeight = lines.length * 20;
                const verticalOffset = (cellSize - totalTextHeight) / 2;

                group.selectAll("text")
                    .data(lines)
                    .enter()
                    .append("text")
                    .text(d => d)
                    .attr("x", cellSize / 2)
                    .attr("y", (d, i) => verticalOffset + (i * 20) + 10)
                    .attr("text-anchor", "middle")
                    .attr("fill", "#ffffff")
                    .attr("font-size", 16)
                    .style("text-shadow", "1px 1px 3px #000")
                    .style("font-weight", "bold");
            });

        svg
            .append("text")
            .attr("x", width / 2)
            .attr("y", 40)
            .attr("text-anchor", "middle")
            .style("font-size", "clamp(24px, 3vw, 32px)")
            .style("font-weight", "bold")
            .style("text-shadow", "1px 1px 3px #000")
            .attr("fill", "#ffffff")
            .text("🔥 Topic Solvability Heat Map 🔥");

        return () => tooltip.remove();
    }, [data, dimensions]);

    return (
        <div ref={containerRef} style={{width: "100%", height: "100%", minHeight: "500px"}}>
            <svg ref={chartRef} width={dimensions.width} height={dimensions.height}/>
        </div>
    );
};

export default TasksSolvabilityChart;
