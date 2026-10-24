import { useEffect, useRef } from "react";
import Chart from "chart.js/auto";

// Line chart of upcoming temperatures
export default function TempChart({ labels, values, unit }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const chart = new Chart(canvasRef.current, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: `Temperature (°${unit})`,
            data: values,
            borderColor: "#2196f3",
            backgroundColor: "rgba(33, 150, 243, 0.25)",
            fill: true,
            tension: 0.35,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: { legend: { labels: { color: "white" } } },
        scales: {
          x: { ticks: { color: "white" }, grid: { color: "rgba(255,255,255,0.1)" } },
          y: { ticks: { color: "white" }, grid: { color: "rgba(255,255,255,0.1)" } },
        },
      },
    });

    // Remove the old chart before a new one is drawn
    return () => chart.destroy();
  }, [labels.join(","), values.join(","), unit]);

  return <canvas ref={canvasRef}></canvas>;
}
