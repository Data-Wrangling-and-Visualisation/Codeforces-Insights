import React, { useEffect, useState, useRef } from "react";
import * as d3 from "d3";
import { sankey as d3Sankey } from "d3-sankey";

const BlogsChart = () => {
  const [selectedSuperTopic, setSelectedSuperTopic] = useState(null);
  const [tooltip, setTooltip] = useState({ visible: false, content: "", x: 0, y: 0 });
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const svgRef = useRef();
  const containerRef = useRef();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/api/blogs_topics_data");
        if (!response.ok) throw new Error("Network response was not ok");
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const showTooltip = (event, d) => {
    const isSuperTopic = new Set(data.map(item => item.supertopic)).has(d.name);
    const relatedData = isSuperTopic
      ? data.filter(item => item.supertopic === d.name)
      : data.filter(item => item.topic === d.name);

    const totalBlogs = isSuperTopic
      ? relatedData.reduce((sum, item) => sum + item.number_of_blogs, 0)
      : relatedData[0]?.number_of_blogs || 0;

    const containerRect = containerRef.current?.getBoundingClientRect();
    const maxLeft = containerRect ? containerRect.width - 320 : 0;
    const maxTop = containerRect ? containerRect.height - 50 : 0;

    setTooltip({
      visible: true,
      content: `
        <div class="text-[#F5C638] font-bold max-w-xs">${d.name}</div>
        <div>${isSuperTopic ? '📌 Main Topic' : '🔹 Subtopic'}</div>
        ${isSuperTopic ? `<div>Subtopics: ${relatedData.length}</div>` : ''}
        <div>Blogs: ${totalBlogs}</div>
        ${!isSuperTopic ? `<div>Main Topic: ${relatedData[0]?.supertopic}</div>` : ''}
      `,
      x: Math.min(event.pageX, maxLeft),
      y: Math.min(event.pageY - 10, maxTop)
    });
  };

  useEffect(() => {
    if (loading || error || data.length === 0) return;

    const container = containerRef.current;
    const width = container.offsetWidth;
    const height = window.innerHeight * 0.9;
    const margin = { top: 20, right: width * 0.2, bottom: 20, left: width * 0.2 };

    const nodesMap = new Map();
    const links = [];
    let idCounter = 0;

    function getNodeId(name) {
      if (!nodesMap.has(name)) {
        nodesMap.set(name, { name, id: idCounter++ });
      }
      return nodesMap.get(name).id;
    }

    data.forEach(d => {
      links.push({
        source: getNodeId(d.supertopic),
        target: getNodeId(d.topic),
        value: d.number_of_blogs
      });
    });

    const nodes = Array.from(nodesMap.values());
    const superTopics = new Set(data.map(d => d.supertopic));

    const sankey = d3Sankey()
      .nodeId(d => d.id)
      .nodeWidth(20)
      .nodePadding(40)
      .extent([[margin.left, margin.top], [width - margin.right, height - margin.bottom]]);

    const { nodes: sankeyNodes, links: sankeyLinks } = sankey({ nodes, links });

    let filteredNodes = [];
    let filteredLinks = [];

    if (selectedSuperTopic) {
      const relatedNodes = new Set();
      const relatedLinks = sankeyLinks.filter(link => {
        if (link.source.name === selectedSuperTopic) {
          relatedNodes.add(link.source.name);
          relatedNodes.add(link.target.name);
          return true;
        }
        return false;
      });

      sankeyNodes.forEach(node => {
        if (superTopics.has(node.name)) relatedNodes.add(node.name);
      });

      filteredNodes = sankeyNodes.filter(node => relatedNodes.has(node.name));
      filteredLinks = relatedLinks;
    } else {
      filteredNodes = sankeyNodes.filter(node => superTopics.has(node.name));
      filteredLinks = [];
    }

    const superTopicNodes = filteredNodes.filter(node => superTopics.has(node.name));
    const superTopicHeight = (height - margin.top - margin.bottom) / superTopicNodes.length;

    superTopicNodes.forEach((node, i) => {
      node.y0 = margin.top + i * superTopicHeight;
      node.y1 = node.y0 + 40;
      node.x1 = node.x0 + 40;
    });

    if (selectedSuperTopic) {
      const subtopicNodes = filteredNodes.filter(node => !superTopics.has(node.name));
      const subtopicHeight = (height - margin.top - margin.bottom) / subtopicNodes.length;

      subtopicNodes.forEach((node, i) => {
        node.y0 = margin.top + i * subtopicHeight;
        node.y1 = node.y0 + 40;
        node.x0 = node.x0 - 10;
        node.x1 = node.x0 + 40;
      });
    }

    sankey.update({ nodes: filteredNodes, links: filteredLinks });

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    svg.attr("viewBox", [0, 0, width, height]);
    svg.attr("preserveAspectRatio", "xMidYMid meet");

    svg
      .append("g")
      .attr("fill", "none")
      .selectAll("path")
      .data(filteredLinks)
      .join("path")
      .attr("d", d => {
        const sourceX = d.source.x1;
        const sourceY = (d.source.y0 + d.source.y1) / 2;
        const targetX = d.target.x0;
        const targetY = (d.target.y0 + d.target.y1) / 2;
        return `M${sourceX},${sourceY} C${(sourceX + targetX) / 2},${sourceY} ${(sourceX + targetX) / 2},${targetY} ${targetX},${targetY}`;
      })
      .attr("stroke", "#F5C638")
      .attr("stroke-width", d => Math.max(1, d.width * 0.7))
      .attr("stroke-opacity", 0.8);

    const nodeGroups = svg
      .append("g")
      .selectAll("g")
      .data(filteredNodes)
      .join("g")
      .attr("transform", d => `translate(${(d.x0 + d.x1) / 2}, ${(d.y0 + d.y1) / 2})`)
      .on("mouseover", (event, d) => showTooltip(event, d))
      .on("mousemove", (event) => {
        const containerRect = containerRef.current?.getBoundingClientRect();
        const maxLeft = containerRect ? containerRect.width - 250 : 0;
        const maxTop = containerRect ? containerRect.height - 50 : 0;
        setTooltip(prev => ({
          ...prev,
          x: Math.min(event.pageX, maxLeft),
          y: Math.min(event.pageY - 10, maxTop)
        }));
      })
      .on("mouseout", () => setTooltip({ ...tooltip, visible: false }))
      .on("click", (event, d) => {
        if (superTopics.has(d.name)) {
          setSelectedSuperTopic(d.name === selectedSuperTopic ? null : d.name);
        }
      });

    nodeGroups
      .append("circle")
      .attr("r", 20)
      .attr("fill", "#F5C638")
      .attr("opacity", d => selectedSuperTopic && d.name !== selectedSuperTopic && superTopics.has(d.name) ? 0.5 : 1)
      .style("cursor", d => superTopics.has(d.name) ? "pointer" : "default");

    nodeGroups
      .append("text")
      .attr("dy", 4)
      .attr("text-anchor", d => superTopics.has(d.name) ? "end" : "start")
      .attr("x", d => superTopics.has(d.name) ? -25 : 25)
      .text(d => d.name)
      .attr("font-size", 12)
      .attr("fill", "#ffffff")
      .style("text-shadow", "1px 1px 3px #000")
      .style("font-weight", "bold")
      .style("cursor", "pointer")
      .on("mouseover", (event, d) => showTooltip(event, d))
      .on("mousemove", (event) => {
        const containerRect = containerRef.current?.getBoundingClientRect();
        const maxLeft = containerRect ? containerRect.width - 320 : 0;
        const maxTop = containerRect ? containerRect.height - 150 : 0;
        setTooltip(prev => ({
          ...prev,
          x: Math.min(event.pageX, maxLeft),
          y: Math.min(event.pageY - 10, maxTop)
        }));
      })
      .on("mouseout", () => setTooltip({ ...tooltip, visible: false }));
  }, [data, loading, error, selectedSuperTopic]);

  if (loading) return <div className="p-4 text-white">Loading data...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;

  return (
    <div className="w-full h-[90vh] p-4 overflow-auto bg-transparent relative" ref={containerRef}>
      {tooltip.visible && (
        <div
          className="absolute bg-gray-900/90 text-white p-3 rounded-lg shadow-xl z-50 pointer-events-none"
          style={{
            left: `${tooltip.x - 50}px`,
            top: `${tooltip.y - 100}px`,
            maxWidth: "300px",
            backdropFilter: "blur(2px)"
          }}
          dangerouslySetInnerHTML={{ __html: tooltip.content }}
        />
      )}

      <svg ref={svgRef} className="w-full h-full" />
    </div>
  );
};

export default BlogsChart;
