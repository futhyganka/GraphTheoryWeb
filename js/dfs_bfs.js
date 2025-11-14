// Khai báo toàn cục
var nodesDataSimulation = new vis.DataSet([]);
var edgesDataSimulation = new vis.DataSet([]);
var networkSimulation = null;
var isDirectedSimulation = true;
var nodesSimulation = 0;
var edgesSimulation = [];
const graphSimulation = new Graph(nodesSimulation, isDirectedSimulation);
var parentSimulation = [];
var printSimulation = document.getElementById('print-simulation');

// Đợi DOM load xong
document.addEventListener('DOMContentLoaded', function() {
  
    // Lấy container
    const container = document.getElementById("my-graph-simulation");

    // Options cho network
    const options = {
        edges: {
            color: "#848484",
            width: 2,
            arrows: { to: { enabled: true } },//có hướng / vô hướng
            font: {
                size: 24,
                color: "#848484",
                // strokeWidth: 2,
                // strokeColor: "#ffffffff",
                align: "top",
            },
            smooth: { enabled: true, type: "dynamic" },
        },
        nodes: {
            shape: "circle",
            color: { 
                background: "#ffc0cb", 
                border: "#ff91a3", 
                highlight: { background: "#b6ddf6", border: "#91ceff" }
            },
            font: { 
                color: "#fff", 
                size: 24,
                vadjust: 2,
                face: "monospace",
                align: "center",
            },
            size: 60,
            labelHighlightBold: false,
        },
        physics: { 
            enabled: true,
            stabilization: { iterations: 100 }
        },
    };

    // Hàm render/update network
    function updateNetwork() {
        const data = { nodes: nodesDataSimulation, edges: edgesDataSimulation };
        if (networkSimulation) {
            networkSimulation.destroy();
        }
        networkSimulation = new vis.Network(container, data, options);
    }

    // Xử lý chế độ directed/undirected
    const directedSimulation = document.getElementById('directed-simulation');
    const undirectedSimulation = document.getElementById('undirected-simulation');

    if (directedSimulation) {
        directedSimulation.addEventListener('click', function() {
            isDirectedSimulation = true;
            this.classList.add('active');
            undirectedSimulation.classList.remove('active');
            options.edges.arrows = { to: { enabled: true } };
            updateNetwork();
        });
    }

    if (undirectedSimulation) {
        undirectedSimulation.addEventListener('click', function() {
            isDirectedSimulation = false;
            this.classList.add('active');
            directedSimulation.classList.remove('active');
            options.edges.arrows = { to: { enabled: false } };
            updateNetwork();
        });
    }

    // Nhập node
    var inputNodesSimulation = document.getElementById("nodes-simulation");
    if (inputNodesSimulation) {
        inputNodesSimulation.addEventListener('input', function(e) {
            nodesDataSimulation.clear();
            edgesDataSimulation.clear();
            
            nodesSimulation = parseInt(e.target.value);

            graphSimulation.initGraph(nodesSimulation, isDirectedSimulation);
            parentSimulation.length = 0;
            
            if (!isNaN(nodesSimulation) && nodesSimulation > 0) {
                for (var i = 1; i <= nodesSimulation; i++) {
                    nodesDataSimulation.add({ id: i, label: String(i) });
                }
                updateNetwork();
            }
        });
    }

    // Nhập edge
    var inputEdgesSimulation = document.getElementById("edges-simulation");
    if (inputEdgesSimulation) {
        inputEdgesSimulation.addEventListener('input', function(e) {
            edgesDataSimulation.clear();
            
            edgesSimulation = e.target.value
            .split(/\r?\n/).filter((line) => line.trim() !== "");

            graphSimulation.initGraph(nodesSimulation, isDirectedSimulation);
            
            var edgeId = 1;
            for (var edgesLine of edgesSimulation) {
                var edge = edgesLine.trim().split(/\s+/);
                var from = parseInt(edge[0]);
                var to = parseInt(edge[1]);
                var weight = edge[2] || "";
                
                if (!isNaN(from) && !isNaN(to)) {
                    edgesDataSimulation.add({ 
                        id: edgeId++,
                        from: from, 
                        to: to,
                        label: weight,
                        arrows: isDirectedSimulation ? { to: { enabled: true } } : { to: { enabled: false } }
                    });
                    graphSimulation.addEdge(from, to, edge[2] || 1);
                }
            }
            updateNetwork();
        });
    }

    // Khởi tạo network rỗng ban đầu
    updateNetwork();

});

var inputStartSimulation = document.getElementById('start-simulation');
var inputEndSimulation = document.getElementById('end-simulation');
var elementStartSimulation = 0;
var elementEndSimulation = 0;

inputStartSimulation.oninput = function(e){
    elementStartSimulation = parseInt(e.target.value);
}

inputEndSimulation.oninput = function(e){
    elementEndSimulation = parseInt(e.target.value);
}

var btnMatrixSimulation = document.getElementById('matrix-simulation');
var btnBfsSimulation = document.getElementById('bfs-simulation');
var btnDfsSimulation = document.getElementById('dfs-simulation');

// matrix
btnMatrixSimulation.onclick = function(e){
    printSimulation.innerHTML = 'Matrix:' + 
    graphSimulation.adjMatrix.map(function(value, index){
        if(index === 0) return '';
        let temp = '';
        value.forEach(function(value, index){
            if(index > 0)
                temp += value == INF ? '0 ' : String(value) + ' '
        })
        return temp;
    }).join('<br>');
}

// duyệt bfs
btnBfsSimulation.onclick = function(e){
    if(elementStartSimulation < 1 || elementStartSimulation > nodesSimulation){
        printSimulation.innerHTML = "Start data not found!";
        return;
    } 

    parentSimulation = Array(nodesSimulation + 1).fill(-1);

    let listBfsSimulation = 
    breadthFirstSearch(graphSimulation, parseInt(elementStartSimulation), parentSimulation).data;
  
    if(listBfsSimulation.length === 0){
        printSimulation.innerHTML = "Data not found!";
        return;
    }

    nodesDataSimulation.forEach((node) => {
        nodesDataSimulation.update({ 
            id: node.id, 
            color: { 
                background: "#ffc0cb", 
                border: "#ff91a3" 
            } 
        });
    });

    let index = 0;
    let interval = setInterval(() => {
        if (index >= listBfsSimulation.length) {
            clearInterval(interval);

            printSimulation.innerHTML =
                "BFS completed:<br>" +
                listBfsSimulation.join(" → ") +
                (elementEndSimulation === 0 ? '' : `<br><span style = "color:red">Cannot find node ${elementEndSimulation}</span>`) +
                "<br>Parents:<br>" +
                listBfsSimulation
                    .map(v =>
                        parentSimulation[v] === -1
                            ? `parent[${v}] = -1`
                            : `parent[${v}] = ${parentSimulation[v]}`
                    )
                    .join("<br>");


            return;
        }

        const currentNode = listBfsSimulation[index];
        nodesDataSimulation.update({
            id: currentNode,
            color: { background: "#e2b6f6ff", border: "#e791ffff" } // màu xanh highlight
        });

        let parent =
            parentSimulation[currentNode] === -1 || parentSimulation[currentNode] === 0 ?
                "(root)" : `(parent: ${parentSimulation[currentNode]})`;

        printSimulation.innerText =
            "Visiting: " +
            listBfsSimulation.slice(0, index + 1).join(" → ") +
            "\nCurrent: " +
            currentNode +
            " " +
            parent;


        // Optional: in ra log
        // printSimulation.innerText = "Visiting: " + listBfsSimulation.slice(0, index + 1).join(" → ");

        if (currentNode === elementEndSimulation) {
            clearInterval(interval);
            nodesDataSimulation.update({
                id: currentNode,
                color: { background: "#ce7ff3ff", border: "#c022ecff" }, // màu riêng cho end
            });

            // Truy ngược đường đi từ end → start dựa trên parentSimulation
            let path = [];
            let x = parseInt(currentNode);
            while (x !== -1 && x !== 0) {
                path.unshift(x);
                x = parentSimulation[x];
            }

            printSimulation.innerText =
                "BFS completed:\nPath:\n" +
                listBfsSimulation.slice(0, index + 1).join(" → ") +
                "\nParents: \n" +
                listBfsSimulation.slice(0, index + 1)
                .map((v) =>
                    parentSimulation[v] === -1 || parentSimulation[v] === 0 ? 
                    `parent[${v}] = -1` : `parent[${v}] = ${parentSimulation[v]}`
                ).join("\n");
            return;
        }

        index++;
    }, 800);
}

// duyệt dfs
btnDfsSimulation.onclick = function(e){
    if(elementStartSimulation < 1 || elementStartSimulation > nodesSimulation){
        printSimulation.innerHTML = "Start data not found!";
        return;
    } 

    parentSimulation = Array(nodesSimulation + 1).fill(-1);

    let listDfsSimulation = 
    depthFirstSearch(graphSimulation, parseInt(elementStartSimulation), parentSimulation).data;
  
    if(listDfsSimulation.length === 0){
        printSimulation.innerHTML = "Data not found!";
        return;
    }

    nodesDataSimulation.forEach((node) => {
        nodesDataSimulation.update({ 
            id: node.id, 
            color: { 
                background: "#ffc0cb", 
                border: "#ff91a3" 
            } 
        });
    });

    let index = 0;
    let interval = setInterval(() => {
        if (index >= listDfsSimulation.length) {
            clearInterval(interval);

            printSimulation.innerHTML =
                "DFS completed:<br>" +
                listDfsSimulation.join(" → ") +
                (elementEndSimulation === 0 ? '' : `<br><span style = "color:red">Cannot find node ${elementEndSimulation}</span>`) +
                "<br>Parents:<br>" +
                listDfsSimulation
                    .map(v =>
                        parentSimulation[v] === -1
                            ? `parent[${v}] = -1`
                            : `parent[${v}] = ${parentSimulation[v]}`
                    )
                    .join("<br>");

            return;
        }

        const currentNode = listDfsSimulation[index];
        nodesDataSimulation.update({
            id: currentNode,
            color: { background: "#e2b6f6ff", border: "#e791ffff" } // màu xanh highlight
        });

        let parent =
            parentSimulation[currentNode] === -1 || parentSimulation[currentNode] === 0 ? 
                "(root)" : `(parent: ${parentSimulation[currentNode]})`;

        printSimulation.innerText =
            "Visiting: " +
            listDfsSimulation.slice(0, index + 1).join(" → ") +
            "\nCurrent: " +
            currentNode + " " + parent;

        // Optional: in ra log
        // printSimulation.innerText = "Visiting: " + listDfsSimulation.slice(0, index + 1).join(" → ");

        if (currentNode === elementEndSimulation) {
            clearInterval(interval);
            nodesDataSimulation.update({
                id: currentNode,
                color: { background: "#ce7ff3ff", border: "#c022ecff" }, // màu riêng cho end
            });

            // Truy ngược đường đi từ end → start dựa trên parentSimulation
            let path = [];
            let x = parseInt(currentNode);
            while (x !== -1 && x !== 0) {
                path.unshift(x);
                x = parentSimulation[x];
            }

            printSimulation.innerText =
                "DFS completed:\nPath:\n" +
                listDfsSimulation.slice(0, index + 1).join(" → ") +
                "\nParents: \n" +
                listDfsSimulation.slice(0, index + 1)
                .map((v) =>
                    parentSimulation[v] === -1 || parentSimulation[v] === 0 ? 
                    `parent[${v}] = -1` : `parent[${v}] = ${parentSimulation[v]}`
                ).join("\n");
            return;
        }

        index++;
    }, 800);
}

