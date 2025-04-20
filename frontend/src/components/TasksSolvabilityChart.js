import React, {useEffect, useRef, useState} from "react";
import * as d3 from "d3";

const TasksSolvabilityChart = () => {
    const svgRef = useRef();
    const [data, setData] = useState([]);

    useEffect(() => {
        fetch("http://127.0.0.1:8000/api/topics_solvability")
            .then(res => res.json())
            .then(json => {
                const topics = json
                    .filter(d => d.topic !== "*special")
                    .sort((a, b) => b.solvability - a.solvability)
                    .slice(0, 36);
                setData(topics);
            });
    }, []);

    useEffect(() => {
        if (!data.length) return;

        const svg = d3.select(svgRef.current);
        svg.selectAll("*").remove();

        const containerWidth = svg.node().parentNode.clientWidth;
        const width = containerWidth;
        const rows = 4;
        const cols = 9;
        const barHeight = 60;
        const gapBetweenBars = 120;
        const textHeight = 20;
        const height = rows * (barHeight + textHeight + gapBetweenBars);

        const cellWidth = width / cols;

        const colorScale = d3.scaleLinear()
            .domain([0.5, 0.85])
            .range(["#6A4E17", "#F5C638"])
            .interpolate(d3.interpolateHcl);

        svg.attr("width", width).attr("height", height);

        for (let row = 0; row < rows; row++) {
            const rowData = data.slice(row * cols, (row + 1) * cols);

            const group = svg.append("g")
                .attr("transform", `translate(0, ${row * (barHeight + textHeight + gapBetweenBars)})`);

            // Прямоугольники
            group.selectAll("rect")
                .data(rowData)
                .enter()
                .append("rect")
                .attr("x", (_, i) => i * cellWidth)
                .attr("y", 0)
                .attr("width", cellWidth)
                .attr("height", barHeight)
                .attr("fill", d => colorScale(d.solvability));

            // Перегородки между ячейками (всего 8 штук на строку)
            for (let i = 1; i < cols; i++) {
                group.append("line")
                    .attr("x1", i * cellWidth)
                    .attr("y1", 0)
                    .attr("x2", i * cellWidth)
                    .attr("y2", barHeight)
                    .attr("stroke", "#000")
                    .attr("stroke-width", 1);
            }

            // Текст процентов
            group.selectAll("text.percent")
                .data(rowData)
                .enter()
                .append("text")
                .attr("class", "percent")
                .text(d => `${Math.round(d.solvability * 100)}%`)
                .attr("x", (_, i) => i * cellWidth + cellWidth / 2)
                .attr("y", barHeight / 2)
                .attr("text-anchor", "middle")
                .attr("dominant-baseline", "middle")
                .attr("fill", "#000")
                .attr("font-weight", "bold")
                .attr("font-size", "14px");

            // Топики
            // Топики с переносом строк
            // Топики с переносом строк и ограничением по высоте
            // Топики с автопереносом и полной высотой (не заходит на прямоугольник)
            // Топики: многострочный текст, строго ниже прямоугольника
            group.selectAll("text.label")
                .data(rowData)
                .enter()
                .append("text")
                .attr("class", "label")
                .attr("text-anchor", "middle")
                .attr("fill", "#ffffff")
                .attr("font-size", 14)
                .style("text-shadow", "1px 1px 3px #000")
                .style("font-weight", "bold")
                .each(function (d, i) {
                    const words = d.topic.split(/\s+/);
                    const lineHeight = 16;
                    const x = i * cellWidth + cellWidth / 2;
                    const initialY = barHeight + 24; // гарантированный отступ от прямоугольника

                    let line = [];
                    let lineNumber = 0;
                    let tspan = d3.select(this).append("tspan")
                        .attr("x", x)
                        .attr("y", initialY)
                        .attr("dy", "0em");

                    for (let word of words) {
                        line.push(word);
                        tspan.text(line.join(" "));
                        if (tspan.node().getComputedTextLength() > cellWidth - 10) {
                            line.pop(); // remove last word
                            tspan.text(line.join(" "));
                            line = [word];
                            lineNumber++;
                            tspan = d3.select(this).append("tspan")
                                .attr("x", x)
                                .attr("y", initialY)
                                .attr("dy", `${lineNumber * 1.1}em`)
                                .text(word);
                        }
                    }
                });




        }
    }, [data]);

    return (
        <div style={{width: "100%"}}>
            <svg ref={svgRef} style={{width: "100%"}}/>
        </div>
    );
};

export default TasksSolvabilityChart;
