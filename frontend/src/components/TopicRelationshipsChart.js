import {useEffect, useRef, useState} from 'react';
import * as d3 from 'd3';

const TopicRelationshipsChart = () => {
    const svgRef = useRef();
    const [nodes, setNodes] = useState([]);
    const [links, setLinks] = useState([]);
    const [selectedTopic, setSelectedTopic] = useState(null);
    const [simulation, setSimulation] = useState(null);
    const [tooltip, setTooltip] = useState({
        visible: false,
        content: '',
        x: 0,
        y: 0
    });

    const nodeSizeScale = d3.scaleLog()
        .base(10)
        .domain([100, 15000])
        .range([15, 60])
        .clamp(true);

    const lineWidthScale = d3.scaleLinear()
    .domain([0, 15000])  // Диапазон значений количества задач
    .range([1, 10])      // Соответствие толщины линий
    .clamp(true);

    useEffect(() => {
        fetch('http://127.0.0.1:8000/api/topics_correlation')
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
    }, []);

    useEffect(() => {
        if (!nodes.length) return;

        const svg = d3.select(svgRef.current);
        const {width, height} = svg.node().getBoundingClientRect();
        svg.selectAll('*').remove();

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

        const link = svg.selectAll('.link')
    .data(filteredLinks)
    .enter().append('line')
    .attr('stroke', '#F5C638')
    .attr('stroke-width', d => lineWidthScale(d.value)) // Здесь используется значение связи
    .attr('stroke-opacity', 0.6);

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
            .attr('stroke', d => d.id === selectedTopic ? '#ff4444' : '#fff')
            .on('click', handleNodeClick)
            .on('mouseover', function (event, d) {
                setTooltip({
                    visible: true,
                    content: `${d.id}\nЗадач: ${d.weight}`,
                    x: event.clientX + 10,
                    y: event.clientY + 10,
                });
            })
            .on('mousemove', function (event) {
                setTooltip(prev => ({
                    ...prev,
                    x: event.clientX + 10,
                    y: event.clientY + 10,
                }));
            })
            .on('mouseout', function () {
                setTooltip(prev => ({...prev, visible: false}));
            })
            .on('mousedown', function (event, d) {
                setTooltip(prev => ({...prev, visible: false}));  // Скрываем при клике
            });

        const texts = svg.selectAll('.label')
            .data(nodes)
            .enter().append('text')
            .attr('class', 'label')
            .text(d => d.id)
            .style('font-size', '12px')
            .style('fill', '#fff')
            .style('pointer-events', 'none')
            .style('font-weight', 'bold')
            .style('text-shadow', '2px 2px 4px rgba(0,0,0,0.7)');

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

            texts
                .attr('x', d => {
                    const radius = nodeSizeScale(d.weight);
                    const xPos = Math.max(radius, Math.min(width - radius, d.x));
                    const anchor = xPos > width / 2 ? 'end' : 'start';

                    return anchor === 'end'
                        ? Math.min(xPos + radius / 2, width - 5)  // Уменьшили смещение
                        : Math.max(xPos - radius / 2, 5);
                })
                .attr('y', d => {
                    const radius = nodeSizeScale(d.weight);
                    let yPos = d.y - radius / 2 - 5;  // Изменили позиционирование по вертикали
                    return Math.max(20, Math.min(height - 20, yPos));
                });
        });

        function dragStarted(event, d) {
            setTooltip(prev => ({...prev, visible: false}));
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
            setTooltip(prev => ({...prev, visible: false}));
            if (!event.active) forceSimulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
        }

        setSimulation(forceSimulation);

        return () => forceSimulation.stop();
    }, [nodes, links, selectedTopic]);

    return (
        <>
            <svg
                ref={svgRef}
                width="100%"
                height="800"
                style={{
                    borderRadius: '8px',
                    margin: '20px'
                }}
            />

            <div
                style={{
                    position: 'fixed',
                    left: tooltip.x,
                    top: tooltip.y,
                    display: tooltip.visible ? 'block' : 'none',
                    backgroundColor: 'rgba(0, 0, 0, 0.9)',
                    color: 'white',
                    padding: '8px',
                    borderRadius: '4px',
                    pointerEvents: 'none',
                    fontSize: '14px',
                    whiteSpace: 'pre',
                    zIndex: 1000,
                    boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                }}
            >
                {tooltip.content}
            </div>
        </>
    );
};

export default TopicRelationshipsChart;