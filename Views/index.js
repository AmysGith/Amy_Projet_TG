// Configuration
const API_URL = "http://localhost:8000";

// État global
let graphData = { nodes: [], edges: [] };
let selectedSource = null;
let selectedDest = null;
let currentPath = [];
let nodePositions = {};

// Couleurs
const COLORS = {
    node: "#4CAF50",
    nodeSelected: "#FF9800",
    nodeSource: "#2196F3",
    nodeDest: "#F44336",
    edge: "#999",
    edgePath: "#FF5722",
    nodeText: "#fff"
};

// Initialisation au chargement
document.addEventListener("DOMContentLoaded", async () => {
    await loadGraph();
    setupEventListeners();
});

// Charger le graphe depuis le backend
async function loadGraph() {
    try {
        const response = await fetch(`${API_URL}/graph`);
        graphData = await response.json();
        
        // Calculer les positions des nœuds
        calculateNodePositions();
        
        // Afficher le graphe
        renderGraph();
        
        // Peupler les dropdowns
        populateDropdowns();
        
        console.log("Graphe chargé avec succès:", graphData);
    } catch (error) {
        console.error("Erreur lors du chargement du graphe:", error);
        alert("Impossible de charger le graphe. Vérifiez que le serveur est démarré.");
    }
}

// Calculer les positions des nœuds (disposition en cercle)
function calculateNodePositions() {
    const width = 800;
    const height = 600;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) * 0.35;
    
    const nodeCount = graphData.nodes.length;
    
    graphData.nodes.forEach((node, index) => {
        const angle = (2 * Math.PI * index) / nodeCount - Math.PI / 2;
        nodePositions[node.id] = {
            x: centerX + radius * Math.cos(angle),
            y: centerY + radius * Math.sin(angle)
        };
    });
}

// Afficher le graphe
function renderGraph() {
    renderEdges();
    renderNodes();
    renderEdgeLabels();
}

// Afficher les arêtes
function renderEdges() {
    const edgesGroup = document.getElementById("edges");
    edgesGroup.innerHTML = "";
    
    graphData.edges.forEach(edge => {
        const from = nodePositions[edge.from];
        const to = nodePositions[edge.to];
        
        if (!from || !to) return;
        
        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("x1", from.x);
        line.setAttribute("y1", from.y);
        line.setAttribute("x2", to.x);
        line.setAttribute("y2", to.y);
        line.setAttribute("stroke", COLORS.edge);
        line.setAttribute("stroke-width", "2");
        line.setAttribute("data-from", edge.from);
        line.setAttribute("data-to", edge.to);
        
        edgesGroup.appendChild(line);
    });
}

// Afficher les labels sur les arêtes
function renderEdgeLabels() {
    const labelsGroup = document.getElementById("edge-labels");
    labelsGroup.innerHTML = "";
    
    graphData.edges.forEach(edge => {
        const from = nodePositions[edge.from];
        const to = nodePositions[edge.to];
        
        if (!from || !to) return;
        
        const midX = (from.x + to.x) / 2;
        const midY = (from.y + to.y) / 2;
        
        const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
        text.setAttribute("x", midX);
        text.setAttribute("y", midY - 5);
        text.setAttribute("text-anchor", "middle");
        text.setAttribute("fill", "#666");
        text.setAttribute("font-size", "12");
        text.setAttribute("font-weight", "bold");
        text.textContent = edge.weight + (edge.constraint > 0 ? `+${edge.constraint}` : "");
        
        labelsGroup.appendChild(text);
    });
}

// Afficher les nœuds
function renderNodes() {
    const nodesGroup = document.getElementById("nodes");
    nodesGroup.innerHTML = "";
    
    graphData.nodes.forEach(node => {
        const pos = nodePositions[node.id];
        if (!pos) return;
        
        // Groupe pour le nœud
        const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
        g.setAttribute("data-node", node.id);
        g.style.cursor = "pointer";
        
        // Cercle
        const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle.setAttribute("cx", pos.x);
        circle.setAttribute("cy", pos.y);
        circle.setAttribute("r", "25");
        circle.setAttribute("fill", getNodeColor(node.id));
        circle.setAttribute("stroke", "#333");
        circle.setAttribute("stroke-width", "2");
        
        // Texte
        const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
        text.setAttribute("x", pos.x);
        text.setAttribute("y", pos.y + 5);
        text.setAttribute("text-anchor", "middle");
        text.setAttribute("fill", COLORS.nodeText);
        text.setAttribute("font-size", "14");
        text.setAttribute("font-weight", "bold");
        text.textContent = node.id;
        
        g.appendChild(circle);
        g.appendChild(text);
        nodesGroup.appendChild(g);
    });
}

// Obtenir la couleur d'un nœud
function getNodeColor(nodeId) {
    if (nodeId === selectedSource) return COLORS.nodeSource;
    if (nodeId === selectedDest) return COLORS.nodeDest;
    if (currentPath.includes(nodeId)) return COLORS.edgePath;
    return COLORS.node;
}

// Mettre en surbrillance le chemin
function highlightPath(path) {
    currentPath = path;
    
    // Réinitialiser toutes les arêtes
    const edges = document.querySelectorAll("#edges line");
    edges.forEach(edge => {
        edge.setAttribute("stroke", COLORS.edge);
        edge.setAttribute("stroke-width", "2");
    });
    
    // Mettre en surbrillance les arêtes du chemin
    for (let i = 0; i < path.length - 1; i++) {
        const from = path[i];
        const to = path[i + 1];
        
        const edge = Array.from(edges).find(e => {
            const ef = e.getAttribute("data-from");
            const et = e.getAttribute("data-to");
            return (ef === from && et === to) || (ef === to && et === from);
        });
        
        if (edge) {
            edge.setAttribute("stroke", COLORS.edgePath);
            edge.setAttribute("stroke-width", "4");
        }
    }
    
    // Mettre à jour les couleurs des nœuds
    renderNodes();
}

// Peupler les dropdowns
function populateDropdowns() {
    const sourceDropdown = document.getElementById("sourceDropdown");
    const destDropdown = document.getElementById("destDropdown");
    const constraintFrom = document.getElementById("constraintFrom");
    const constraintTo = document.getElementById("constraintTo");
    
    sourceDropdown.innerHTML = "";
    destDropdown.innerHTML = "";
    constraintFrom.innerHTML = '<option value="">Sélectionner...</option>';
    constraintTo.innerHTML = '<option value="">Sélectionner...</option>';
    
    graphData.nodes.forEach(node => {
        // Source dropdown
        const sourceItem = document.createElement("a");
        sourceItem.href = "#";
        sourceItem.textContent = node.id;
        sourceItem.onclick = (e) => {
            e.preventDefault();
            selectSource(node.id);
        };
        sourceDropdown.appendChild(sourceItem);
        
        // Destination dropdown
        const destItem = document.createElement("a");
        destItem.href = "#";
        destItem.textContent = node.id;
        destItem.onclick = (e) => {
            e.preventDefault();
            selectDestination(node.id);
        };
        destDropdown.appendChild(destItem);
        
        // Contrainte selects
        const optFrom = document.createElement("option");
        optFrom.value = node.id;
        optFrom.textContent = node.id;
        constraintFrom.appendChild(optFrom);
        
        const optTo = document.createElement("option");
        optTo.value = node.id;
        optTo.textContent = node.id;
        constraintTo.appendChild(optTo);
    });
}

// Sélectionner la source
function selectSource(nodeId) {
    selectedSource = nodeId;
    document.getElementById("sourceBtn").innerHTML = `Source: ${nodeId} <span class="arrow">▼</span>`;
    renderNodes();
}

// Sélectionner la destination
function selectDestination(nodeId) {
    selectedDest = nodeId;
    document.getElementById("destBtn").innerHTML = `Destination: ${nodeId} <span class="arrow">▼</span>`;
    renderNodes();
}

// Exécuter Dijkstra
async function runDijkstra() {
    if (!selectedSource) {
        alert("Veuillez sélectionner une source");
        return;
    }
    
    if (!selectedDest) {
        alert("Veuillez sélectionner une destination");
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/dijkstra?source=${selectedSource}&dest=${selectedDest}`);
        const path = await response.json();
        
        console.log("Chemin trouvé:", path);
        
        if (path.length === 0) {
            alert("Aucun chemin trouvé");
            document.getElementById("pathValue").textContent = "Aucun chemin";
            document.getElementById("distanceValue").textContent = "-";
            return;
        }
        
        // Calculer la distance totale
        let totalDistance = 0;
        for (let i = 0; i < path.length - 1; i++) {
            const edge = graphData.edges.find(e => 
                (e.from === path[i] && e.to === path[i + 1]) ||
                (e.to === path[i] && e.from === path[i + 1])
            );
            if (edge) {
                totalDistance += edge.weight + (edge.constraint || 0);
            }
        }
        
        // Afficher les résultats
        document.getElementById("pathValue").textContent = path.join(" → ");
        document.getElementById("distanceValue").textContent = totalDistance.toFixed(2);
        
        // Mettre en surbrillance le chemin
        highlightPath(path);
        
    } catch (error) {
        console.error("Erreur lors de l'exécution de Dijkstra:", error);
        alert("Erreur lors du calcul du chemin");
    }
}

// Exécuter le coloriage
async function runColoring() {
    try {
        const response = await fetch(`${API_URL}/coloriage`);
        const colors = await response.json();
        
        console.log("Coloriage:", colors);
        
        // Créer un mapping de couleurs
        const colorMap = {
            "rouge": "#F44336",
            "bleu": "#2196F3",
            "vert": "#4CAF50",
            "jaune": "#FFEB3B",
            "violet": "#9C27B0",
            "orange": "#FF9800",
            "rose": "#E91E63",
            "cyan": "#00BCD4"
        };
        
        // Réinitialiser le chemin
        currentPath = [];
        
        // Appliquer les couleurs
        graphData.nodes.forEach(node => {
            const color = colors[node.id];
            const nodeGroup = document.querySelector(`[data-node="${node.id}"]`);
            if (nodeGroup) {
                const circle = nodeGroup.querySelector("circle");
                circle.setAttribute("fill", colorMap[color] || COLORS.node);
            }
        });
        
        // Mettre à jour la légende
        updateLegend(colors, colorMap);
        
    } catch (error) {
        console.error("Erreur lors du coloriage:", error);
        alert("Erreur lors du coloriage");
    }
}

// Mettre à jour la légende
function updateLegend(colors, colorMap) {
    const legendItems = document.getElementById("legendItems");
    legendItems.innerHTML = "";
    
    const uniqueColors = [...new Set(Object.values(colors))];
    
    uniqueColors.forEach(color => {
        const item = document.createElement("div");
        item.style.display = "flex";
        item.style.alignItems = "center";
        item.style.marginBottom = "8px";
        
        const colorBox = document.createElement("div");
        colorBox.style.width = "20px";
        colorBox.style.height = "20px";
        colorBox.style.backgroundColor = colorMap[color] || "#ccc";
        colorBox.style.marginRight = "10px";
        colorBox.style.border = "1px solid #333";
        
        const label = document.createElement("span");
        label.textContent = color.charAt(0).toUpperCase() + color.slice(1);
        
        item.appendChild(colorBox);
        item.appendChild(label);
        legendItems.appendChild(item);
    });
}

// Ajouter une contrainte
async function addConstraint() {
    const from = document.getElementById("constraintFrom").value;
    const to = document.getElementById("constraintTo").value;
    const value = parseInt(document.getElementById("constraintValue").value);
    
    if (!from || !to) {
        alert("Veuillez sélectionner les deux nœuds");
        return;
    }
    
    if (from === to) {
        alert("Les nœuds doivent être différents");
        return;
    }
    
    if (!selectedSource) {
        alert("Veuillez d'abord sélectionner une source");
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/add_contrainte`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                from: from,
                to: to,
                value: value,
                source: selectedSource
            })
        });
        
        const path = await response.json();
        
        console.log("Contrainte ajoutée, nouveau chemin:", path);
        
        // Mettre à jour la contrainte dans le graphe local
        const edge = graphData.edges.find(e => 
            (e.from === from && e.to === to) || (e.to === from && e.from === to)
        );
        if (edge) {
            edge.constraint = (edge.constraint || 0) + value;
        }
        
        // Recharger le graphe pour afficher les nouvelles valeurs
        renderGraph();
        
        // Si on a une destination, afficher le nouveau chemin
        if (selectedDest && path.length > 0) {
            // Calculer la distance
            let totalDistance = 0;
            for (let i = 0; i < path.length - 1; i++) {
                const e = graphData.edges.find(ed => 
                    (ed.from === path[i] && ed.to === path[i + 1]) ||
                    (ed.to === path[i] && ed.from === path[i + 1])
                );
                if (e) {
                    totalDistance += e.weight + (e.constraint || 0);
                }
            }
            
            document.getElementById("pathValue").textContent = path.join(" → ");
            document.getElementById("distanceValue").textContent = totalDistance.toFixed(2);
            highlightPath(path);
        }
        
        alert("Contrainte ajoutée avec succès!");
        
    } catch (error) {
        console.error("Erreur lors de l'ajout de la contrainte:", error);
        alert("Erreur lors de l'ajout de la contrainte");
    }
}

// Configuration des écouteurs d'événements
function setupEventListeners() {
    document.getElementById("dijkstraBtn").addEventListener("click", runDijkstra);
    document.getElementById("colorizeBtn").addEventListener("click", runColoring);
    document.getElementById("addConstraintBtn").addEventListener("click", addConstraint);
    
    // Toggle dropdowns
    document.getElementById("sourceBtn").addEventListener("click", (e) => {
        e.stopPropagation();
        const dropdown = document.getElementById("sourceDropdown");
        dropdown.style.display = dropdown.style.display === "block" ? "none" : "block";
        document.getElementById("destDropdown").style.display = "none";
    });
    
    document.getElementById("destBtn").addEventListener("click", (e) => {
        e.stopPropagation();
        const dropdown = document.getElementById("destDropdown");
        dropdown.style.display = dropdown.style.display === "block" ? "none" : "block";
        document.getElementById("sourceDropdown").style.display = "none";
    });
    
    // Fermer les dropdowns en cliquant ailleurs
    document.addEventListener("click", () => {
        document.getElementById("sourceDropdown").style.display = "none";
        document.getElementById("destDropdown").style.display = "none";
    });
}