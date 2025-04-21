import {useEffect, useRef, useState} from 'react';
import * as d3 from 'd3';

const TopicRelationshipsChart = () => {

    const capitalize = (str) => {
        if (str.length === 0) return str;
        return str[0].toUpperCase() + str.slice(1).toLowerCase();
    };

    const svgRef = useRef();
    const tooltipRef = useRef();
    const [nodes, setNodes] = useState([]);
    const [links, setLinks] = useState([]);
    const [selectedTopic, setSelectedTopic] = useState(null);
    const [simulation, setSimulation] = useState(null);

    const nodeSizeScale = d3.scaleLog()
        .base(10)
        .domain([100, 15000])
        .range([15, 60])
        .clamp(true);

    const globalLineWidthScale = d3.scaleLinear()
        .domain([0, 15000])
        .range([1, 10])
        .clamp(true);

    useEffect(() => {
        fetch(`${process.env.REACT_APP_API_URL}/api/topics_correlation`)
            .then(response => response.json())
            .then(data => {
                const topicWeights = {};
                const linkMap = new Map();

                data.forEach(d => {
                    if (d.topic1 === d.topic2) {
                        topicWeights[d.topic1] = d.number_of_tasks;
                        return;
                    }

                    const [t1, t2] = [d.topic1, d.topic2].sort();
                    const key = `${t1}|${t2}`;
                    if (t1 !== t2 && !linkMap.get(key)) {
                        linkMap.set(key, (linkMap.get(key) || 0) + d.number_of_tasks);
                        topicWeights[t1] = (topicWeights[t1] || 0) + d.number_of_tasks;
                        topicWeights[t2] = (topicWeights[t2] || 0) + d.number_of_tasks;
                    }
                    ;
                });

                const nodes = Object.entries(topicWeights).map(([id, weight]) => ({
                    id,
                    weight: Math.max(100, weight),
                    linked: false,
                    x: Math.random() * window.innerWidth, // Случайная X координата
                    y: Math.random() * window.innerHeight // Случайная Y координата
                }));

                const nodeMap = new Map(nodes.map(n => [n.id, n]));
                const links = Array.from(linkMap.entries()).map(([key, value]) => ({
                    source: nodeMap.get(key.split('|')[0]),
                    target: nodeMap.get(key.split('|')[1]),
                    value
                }));

                setNodes(nodes);
                setLinks(links);
            });

        tooltipRef.current = d3.select("body")
            .append("div")
            .attr("class", "chart-tooltip")
            .style("position", "absolute")
            .style("visibility", "hidden")
            .style("background", "#222")
            .style("color", "#fff")
            .style("padding", "14px 18px")
            .style("border-radius", "8px")
            .style("box-shadow", "0 6px 18px rgba(0, 0, 0, 0.6)")
            .style("pointer-events", "none")
            .style("font-size", "16px")
            .style("z-index", "1000")
            .style("left", "-9999px")
            .style("top", "-9999px")
        ;

        return () => {
            // Удаляем тултип при размонтировании
            if (tooltipRef.current) tooltipRef.current.remove();
        };

    }, []);

    const GLOW_FILTER_ID = 'glow-filter';

    useEffect(() => {
        if (!nodes.length) return;

        const svg = d3.select(svgRef.current);
        const {width, height} = svg.node().getBoundingClientRect();
        svg.selectAll('*').remove();

        const defs = svg.append('defs');

        const glowFilter = defs.append('filter')
            .attr('id', GLOW_FILTER_ID)
            .attr('x', '-20%')
            .attr('y', '-20%')
            .attr('width', '150%')
            .attr('height', '150%')
            .attr('filterUnits', 'userSpaceOnUse'); // Важно!

        glowFilter.append('feGaussianBlur')
            .attr('stdDeviation', '10')
            .attr('result', 'coloredBlur');

        const feMerge = glowFilter.append('feMerge');
        feMerge.append('feMergeNode').attr('in', 'coloredBlur');
        feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

        const forceSimulation = d3.forceSimulation(nodes)
            .force('charge', d3.forceManyBody().strength(d =>
                d.linked ? -30 : -150
            ))
            .force('collision', d3.forceCollide(d => nodeSizeScale(d.weight) + 10))
            .force('x', d3.forceX(width / 2).strength(d =>
                d.linked ? 0.05 : 0.01
            ))
            .force('y', d3.forceY(height / 2).strength(d =>
                d.linked ? 0.05 : 0.01
            ));

        const handleNodeClick = (event, d) => {
            const newSelected = d.id === selectedTopic ? null : d.id;

            nodes.forEach(n => {
                n.linked = false;
                n.fx = null;
                n.fy = null;
            });

            if (newSelected) {
                const mainNode = nodes.find(n => n.id === newSelected);
                const related = links
                    .filter(l => l.source.id === newSelected || l.target.id === newSelected)
                    .sort((a, b) => b.value - a.value)
                    .slice(0, 5);

                related.forEach(l => {
                    if (l.source.id === newSelected) l.target.linked = true;
                    else l.source.linked = true;
                });
                mainNode.linked = true;
                mainNode.fx = width / 2;
                mainNode.fy = height / 2;
            }

            setSelectedTopic(newSelected);
            forceSimulation.alpha(1).restart();
        };

        const filteredLinks = selectedTopic
            ? links
                .filter(l => l.source.id === selectedTopic || l.target.id === selectedTopic)
                .sort((a, b) => b.value - a.value)
                .slice(0, 5)
            : [];

        const maxLinkValue = selectedTopic
            ? d3.max(filteredLinks, d => d.value)
            : 0;

        const lineWidthScaleLocal = d3.scaleLinear()
            .domain([0, maxLinkValue])
            .range([1, 10])
            .clamp(true);

        const link = svg.selectAll('.link')
            .data(filteredLinks)
            .enter().append('line')
            .attr('shape-rendering', 'geometricPrecision')
            .attr('stroke', '#F5C638')
            .attr('stroke-width', d =>
                selectedTopic
                    ? lineWidthScaleLocal(d.value) // Локальная нормализация
                    : globalLineWidthScale(d.value) // Глобальная шкала
            )
            .attr('stroke-opacity', 0.9)
            .attr('filter', `url(#${GLOW_FILTER_ID})`) // Применяем фильтр;

        const node = svg.selectAll('.node')
            .data(nodes)
            .enter().append('g')
            .call(d3.drag()
                .on('start', dragStarted)
                .on('drag', dragged)
                .on('end', dragEnded));

        node.append('circle')
            .attr('r', d => nodeSizeScale(d.weight))
            .attr('fill', d => d.linked ? '#F5C638' : '#666')
            .on('click', handleNodeClick)
            .on('mouseover', function (event, d) {
                tooltipRef.current
                    .html(`<strong>${capitalize(d.id)}</strong><br/>Problems: ${d.weight}`)
                    .style("visibility", "visible")
                    .style("left", `${event.pageX + 15}px`)
                    .style("top", `${event.pageY - 15}px`);
            })
            .on('mousemove', function (event) {
                tooltipRef.current
                    .style("left", `${event.pageX + 15}px`)
                    .style("top", `${event.pageY - 15}px`);
            })
            .on('mouseout', function () {
                tooltipRef.current.style("visibility", "hidden");
            })
            .on('mousedown', function (event, d) {
                tooltipRef.current.style("visibility", "hidden");  // Скрываем при клике
            });

        const texts = svg.selectAll('.label')
            .data(nodes)
            .enter().append('text')
            .attr('class', 'label')
            .text(d => capitalize(d.id))
            .style('font-size', '14px')
            .style('fill', '#fff')
            .style('pointer-events', 'none')
            .style('font-weight', 'bold')
            .style('text-shadow', '2px 2px 4px rgba(0,0,0,0.7)')
            .attr('text-anchor', d => {
                const radius = nodeSizeScale(d.weight);
                const xPos = Math.max(radius, Math.min(width - radius, d.x));
                return xPos > width / 2 ? 'end' : 'start';
            });

        forceSimulation.on('tick', () => {
            nodes.forEach(d => {
                const radius = nodeSizeScale(d.weight);
                d.x = Math.max(radius, Math.min(width - radius, d.x));
                d.y = Math.max(radius, Math.min(height - radius, d.y));
            });

            link
                .attr('x1', d => d.source.x)
                .attr('y1', d => d.source.y)
                .attr('x2', d => d.target.x)
                .attr('y2', d => d.target.y);

            node.attr('transform', d => `translate(${d.x},${d.y})`);

            texts.each(function (d) {
                const text = d3.select(this);
                const bbox = this.getBBox();
                const radius = nodeSizeScale(d.weight);
                const padding = 5;

                let xPos = d.x;
                let yPos = d.y - radius - 5;

                // Проверка горизонтальных границ
                if (xPos - bbox.width / 2 < padding) {
                    xPos = bbox.width / 2 + padding;
                } else if (xPos + bbox.width / 2 > width - padding) {
                    xPos = width - bbox.width / 2 - padding;
                }

                // Проверка вертикальных границ
                yPos = Math.max(padding + bbox.height, Math.min(height - padding, yPos));

                text.attr('x', xPos)
                    .attr('y', yPos)
                    .attr('text-anchor', 'middle');
            });
        });

        function dragStarted(event, d) {
            tooltipRef.current.style("visibility", "hidden");
            if (!event.active) forceSimulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
        }

        function dragged(event, d) {
            const radius = nodeSizeScale(d.weight);
            d.fx = Math.max(radius, Math.min(width - radius, event.x));
            d.fy = Math.max(radius, Math.min(height - radius, event.y));
        }

        function dragEnded(event, d) {
            tooltipRef.current.style("visibility", "hidden");
            if (!event.active) forceSimulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
        }

        setSimulation(forceSimulation);

        return () => forceSimulation.stop();
    }, [nodes, links, selectedTopic]);

    return (
        <svg
            ref={svgRef}
            width="100%"
            height="800"
            style={{
                borderRadius: '8px',
                margin: '20px'
            }}
        />
    );
};

export default TopicRelationshipsChart;